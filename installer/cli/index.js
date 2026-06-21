#!/usr/bin/env node
// `npx tms-pipeline` — a small, zero-dependency onboarding wizard.
// Asks a short list of questions (Enter accepts the shown default; y/n for copy actions), then renders
// AGENTS.md + .claude/CLAUDE.md and optionally copies the pipeline / docs-vault skeletons.
// It NEVER overwrites an existing AGENTS.md / CLAUDE.md unless you pass --force.

'use strict';

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { QUESTIONS, CONFIRMS } = require('../core/questions');
const { applyConfig } = require('../core/engine');
const pkg = require('../../package.json');

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const YES = argv.includes('--yes') || argv.includes('-y');
const DRY_RUN = argv.includes('--dry-run');
const HELP = argv.includes('--help') || argv.includes('-h');
const VERSION = argv.includes('--version') || argv.includes('-v');

function flagValue(name) {
  // supports both `--answers file.json` and `--answers=file.json`
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const i = argv.indexOf(name);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('-')) return argv[i + 1];
  return null;
}
const ANSWERS_FILE = flagValue('--answers');

function printHelp() {
  console.log(`
  tms-pipeline ${pkg.version} — onboard the delivery methodology onto an EXISTING project.

  It does NOT create a project or invent features — it assumes you already have a repo, a
  documentation base, and ideally a backlog. It renders AGENTS.md (+ .claude/CLAUDE.md for
  Claude Code) and can lay down the pipeline / docs-vault skeletons and Codex assets.

  Usage:
    npx tms-pipeline [options]

  Options:
    -y, --yes            Non-interactive: accept every default, no prompts.
        --answers <f>    Non-interactive: read answers from a JSON file (used by /tms-init).
        --dry-run        Show what would be written/copied; change nothing on disk.
        --force          Overwrite an existing AGENTS.md / .claude/CLAUDE.md.
    -h, --help           Show this help.
    -v, --version        Print the version.

  --answers JSON shape (all keys optional; missing ones fall back to defaults):
    {
      "targetDir": "/abs/path/to/project",
      "answers": { "OUTPUT_LANGUAGE": "English", "PROJECT_ONE_LINER": "...", ... },
      "useClaude": true, "useCodex": true,
      "copyPipeline": true, "copyDocsVault": false, "copyCodexAssets": true
    }

  Docs:    https://github.com/TmsNine/tms-pipeline
  Example: templates/example-task/ACME-101/ — a full task run through all 8 stages.
`);
}

// Robust line reader that works for both an interactive TTY and piped/redirected stdin.
// (A plain readline.question() chain drops lines when stdin is a fast pipe.)
let rl = null;
const queue = [];
let pending = null;
let closed = false;
function openReader() {
  rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    if (pending) { const r = pending; pending = null; r(line); }
    else queue.push(line);
  });
  rl.on('close', () => {
    closed = true;
    if (pending) { const r = pending; pending = null; r(null); }
  });
}
function nextLine() {
  if (queue.length) return Promise.resolve(queue.shift());
  if (closed) return Promise.resolve(null);
  return new Promise((resolve) => { pending = resolve; });
}
async function prompt(text) {
  process.stdout.write(text);
  const line = await nextLine();
  return line == null ? '' : line.trim();
}

function banner() {
  console.log('');
  console.log('  tms-pipeline — project onboarding');
  console.log('  ---------------------------------');
  console.log('  This sets up the delivery methodology ON TOP OF your existing project.');
  console.log('  It does NOT create a project for you — you should already have a repo,');
  console.log('  a documentation base, and ideally a backlog.');
  console.log('  Press Enter to accept the [default] shown for each question.');
  if (DRY_RUN) console.log('  (dry-run: nothing will be written to disk)');
  console.log('');
}

async function askText(q) {
  if (YES) return q.default || '';
  const suffix = q.default ? ` [${q.default}]` : ' []';
  const raw = await prompt(`  ${q.prompt}${suffix}\n  > `);
  return raw === '' ? (q.default || '') : raw;
}

async function askConfirm(c) {
  if (YES) return c.default;
  const def = c.default ? 'Y/n' : 'y/N';
  const raw = (await prompt(`  ${c.prompt} (${def})\n  > `)).toLowerCase();
  if (raw === '') return c.default;
  return raw === 'y' || raw === 'yes';
}

// Build the config from a JSON answers file (non-interactive path used by /tms-init).
function fromAnswersFile(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const answers = {};
  for (const q of QUESTIONS) {
    const v = raw.answers && raw.answers[q.token];
    answers[q.token] = (v == null || v === '') ? (q.default || '') : v;
  }
  const confirm = (key, def) => (raw[key] == null ? def : !!raw[key]);
  return {
    targetDir: path.resolve(raw.targetDir || process.cwd()),
    answers,
    useClaude: confirm('useClaude', true),
    useCodex: confirm('useCodex', true),
    copyPipeline: confirm('copyPipeline', true),
    copyDocsVault: confirm('copyDocsVault', false),
    copyCodexAssets: confirm('copyCodexAssets', false),
  };
}

async function collectInteractive() {
  banner();
  openReader();

  const targetRaw = await askText({ prompt: 'Path to the project to configure', default: process.cwd() });
  const targetDir = path.resolve(targetRaw);

  const answers = {};
  for (const q of QUESTIONS) answers[q.token] = await askText(q);

  const confirms = {};
  for (const c of CONFIRMS) confirms[c.key] = await askConfirm(c);

  // Only offer the Codex asset install when the user actually uses Codex.
  let copyCodexAssets = false;
  if (confirms.useCodex) {
    copyCodexAssets = await askConfirm({
      prompt: 'Copy the tms-* skills + agents into ~/.codex now? (Codex has no /plugin install)',
      default: true,
    });
  }

  rl.close();
  return { targetDir, answers, ...confirms, copyCodexAssets };
}

async function main() {
  if (HELP) { printHelp(); return; }
  if (VERSION) { console.log(pkg.version); return; }

  const cfg = ANSWERS_FILE ? fromAnswersFile(ANSWERS_FILE) : await collectInteractive();

  console.log(`\n  ${DRY_RUN ? 'Dry-run for' : 'Applying configuration to'}:`, cfg.targetDir, '\n');
  const results = applyConfig({
    targetDir: cfg.targetDir,
    answers: cfg.answers,
    useClaude: cfg.useClaude,
    useCodex: cfg.useCodex,
    copyPipeline: cfg.copyPipeline,
    copyDocsVault: cfg.copyDocsVault,
    copyCodexAssets: cfg.copyCodexAssets,
    force: FORCE,
    dryRun: DRY_RUN,
  });

  for (const r of results) console.log(`    [${r.status}] ${r.path}`);

  console.log('');
  console.log('  Done. Next steps:');
  console.log('    1. Open AGENTS.md and resolve any <<TODO: ...>> markers.');
  console.log('    2. If you copied docs-vault, rename the PROJECT_NAME folder to your project.');
  if (cfg.useClaude) {
    console.log('    3. Claude Code: /plugin marketplace add TmsNine/tms-pipeline → /plugin install tms-pipeline@tms-pipeline → /reload-plugins');
  }
  if (cfg.useCodex && !cfg.copyCodexAssets) {
    console.log('    3. Codex: copy skills/ → ~/.codex/skills and agents/ → ~/.codex/agents (or re-run and accept the copy prompt).');
  }
  console.log('    4. Start a task: /tms-ticket <your first ticket>');
  console.log('');
}

main().catch((err) => {
  console.error('\n  tms-pipeline onboarding failed:', err.message, '\n');
  process.exit(1);
});
