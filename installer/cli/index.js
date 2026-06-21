#!/usr/bin/env node
// `npx tms-pipeline` — a small, zero-dependency onboarding wizard.
// Asks a short list of questions (Enter accepts the shown default; y/n for copy actions), then renders
// AGENTS.md + .claude/CLAUDE.md and optionally copies the pipeline / docs-vault skeletons.
// It NEVER overwrites an existing AGENTS.md / CLAUDE.md unless you pass --force.

'use strict';

const readline = require('readline');
const path = require('path');
const { QUESTIONS, CONFIRMS } = require('../core/questions');
const { applyConfig } = require('../core/engine');

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const YES = argv.includes('--yes') || argv.includes('-y');

// Robust line reader that works for both an interactive TTY and piped/redirected stdin.
// (A plain readline.question() chain drops lines when stdin is a fast pipe.)
const rl = readline.createInterface({ input: process.stdin });
const queue = [];
let pending = null;
let closed = false;
rl.on('line', (line) => {
  if (pending) { const r = pending; pending = null; r(line); }
  else queue.push(line);
});
rl.on('close', () => {
  closed = true;
  if (pending) { const r = pending; pending = null; r(null); }
});
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

async function main() {
  banner();

  const targetRaw = await askText({ prompt: 'Path to the project to configure', default: process.cwd() });
  const targetDir = path.resolve(targetRaw);

  const answers = {};
  for (const q of QUESTIONS) answers[q.token] = await askText(q);

  const confirms = {};
  for (const c of CONFIRMS) confirms[c.key] = await askConfirm(c);

  rl.close();

  console.log('\n  Applying configuration to:', targetDir, '\n');
  const results = applyConfig({
    targetDir,
    answers,
    useClaude: confirms.useClaude,
    useCodex: confirms.useCodex,
    copyPipeline: confirms.copyPipeline,
    copyDocsVault: confirms.copyDocsVault,
    force: FORCE,
  });

  for (const r of results) console.log(`    [${r.status}] ${r.path}`);

  console.log('');
  console.log('  Done. Next steps:');
  console.log('    1. Open AGENTS.md and resolve any <<TODO: ...>> markers.');
  console.log('    2. If you copied docs-vault, rename the PROJECT_NAME folder to your project.');
  if (confirms.useClaude) {
    console.log('    3. Claude Code: /plugin marketplace add TmsNine/tms-pipeline → /plugin install tms-pipeline@tms-pipeline → /reload-plugins');
  }
  if (confirms.useCodex) {
    console.log('    3. Codex: install the skills/agents for Codex (see docs/02-configuration.md#codex).');
  }
  console.log('    4. Start a task: /tms-ticket <your first ticket>');
  console.log('');
}

main().catch((err) => {
  console.error('\n  tms-pipeline onboarding failed:', err.message, '\n');
  process.exit(1);
});
