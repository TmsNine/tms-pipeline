#!/usr/bin/env node
// `npx tms-pipeline` — a THIN, zero-dependency installer.
// It only does what must happen before an AI agent is in the loop:
//   1. pick language (EN/RU) and the agent tool(s) you use;
//   2. install the tms-* skill files (~/.claude and/or ~/.codex);
//   3. drop a starter AGENTS.md (+ .claude/CLAUDE.md) — mostly <<TODO>> placeholders.
// It does NOT interrogate you about the project (test commands, ticket format, doc paths, …).
// That is the job of the agent-driven `/tms-init`, which reads your repo and fills AGENTS.md for you.
// It NEVER overwrites an existing AGENTS.md / CLAUDE.md unless you pass --force.

'use strict';

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { QUESTIONS } = require('../core/questions');
const { applyConfig } = require('../core/engine');
const pkg = require('../../package.json');

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const YES = argv.includes('--yes') || argv.includes('-y');
const DRY_RUN = argv.includes('--dry-run');
const HELP = argv.includes('--help') || argv.includes('-h');
const VERSION = argv.includes('--version') || argv.includes('-v');

// ── Colors (raw ANSI, zero-dependency). Disabled on a non-TTY or when NO_COLOR is set. ──
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const sgr = (n) => (COLOR ? `\x1b[${n}m` : '');
const C = {
  reset: sgr(0), bold: sgr(1), dim: sgr(2),
  // Main accent: acid green (xterm-256 color 118 ≈ #87ff00).
  acid: sgr('38;5;118'), green: sgr(32), yellow: sgr(33), gray: sgr(90),
};
const paint = (s, color) => `${color}${s}${C.reset}`;

// ANSI Shadow "TMS" banner.
const BANNER = [
  '████████╗███╗   ███╗███████╗',
  '╚══██╔══╝████╗ ████║██╔════╝',
  '   ██║   ██╔████╔██║███████╗',
  '   ██║   ██║╚██╔╝██║╚════██║',
  '   ██║   ██║ ╚═╝ ██║███████║',
  '   ╚═╝   ╚═╝     ╚═╝╚══════╝',
];

function flagValue(name) {
  // supports both `--answers file.json` and `--answers=file.json`
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const i = argv.indexOf(name);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('-')) return argv[i + 1];
  return null;
}
const ANSWERS_FILE = flagValue('--answers');

// ── Localized wizard strings (EN/RU). Only the few prompts the thin installer still asks. ──
const STRINGS = {
  en: {
    tagline: 'staged AI-agent delivery pipeline',
    pickTools: 'Which agent tool(s) do you use?',
    toolClaude: 'Claude Code', toolCodex: 'Codex', toolBoth: 'Both',
    projectPath: 'Path to the project to set up',
    installSkills: (where) => `Install the tms-* skill files now into ${where}?`,
    skipHint: 'skip → for Claude Code you can instead run /plugin install',
    applying: 'Applying', dryRunFor: 'Dry-run for',
    done: 'Done. Next steps:',
    step_init: 'Run  /tms-init  inside Claude Code / Codex — it reads your repo and fills AGENTS.md',
    step_init2: '(test/build commands, paths, ticket format), asking you only about the gaps.',
    step_claudeInstalled: 'Claude Code: skills are in ~/.claude — restart Claude Code to load them (don\'t also /plugin install).',
    step_claudePlugin: 'Claude Code: /plugin marketplace add TmsNine/tms-pipeline → /plugin install tms-pipeline@tms-pipeline → /reload-plugins',
    step_codex: 'Codex: re-run and accept the skill install, or: cp -R codex-skills/* ~/.codex/skills/ && cp -R agents/* ~/.codex/agents/',
    step_task: 'Then start a task:  /tms-ticket <your first ticket>',
    enterHint: 'Enter = default',
  },
  ru: {
    tagline: 'стадийный конвейер доставки для AI-агентов',
    pickTools: 'Какой агент-инструмент(ы) вы используете?',
    toolClaude: 'Claude Code', toolCodex: 'Codex', toolBoth: 'Оба',
    projectPath: 'Путь к проекту для настройки',
    installSkills: (where) => `Установить файлы скиллов tms-* сейчас в ${where}?`,
    skipHint: 'пропустить → для Claude Code можно вместо этого выполнить /plugin install',
    applying: 'Применяю', dryRunFor: 'Тест (dry-run) для',
    done: 'Готово. Дальше:',
    step_init: 'Выполните  /tms-init  в Claude Code / Codex — он читает ваш репозиторий и заполняет AGENTS.md',
    step_init2: '(команды тестов/сборки, пути, формат тикета), спрашивая только то, что не смог вывести.',
    step_claudeInstalled: 'Claude Code: скиллы в ~/.claude — перезапустите Claude Code (не делайте ещё и /plugin install).',
    step_claudePlugin: 'Claude Code: /plugin marketplace add TmsNine/tms-pipeline → /plugin install tms-pipeline@tms-pipeline → /reload-plugins',
    step_codex: 'Codex: перезапустите и согласитесь на установку, или: cp -R codex-skills/* ~/.codex/skills/ && cp -R agents/* ~/.codex/agents/',
    step_task: 'Затем запустите задачу:  /tms-ticket <первый тикет>',
    enterHint: 'Enter = значение по умолчанию',
  },
};

function printHelp() {
  console.log(`
  tms-pipeline ${pkg.version} — thin installer for the delivery methodology.

  It installs the tms-* skills (~/.claude and/or ~/.codex) and drops a starter AGENTS.md
  (+ .claude/CLAUDE.md). It does NOT interview you about the project — run the agent-driven
  /tms-init afterward and it fills AGENTS.md by reading your repo.

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
      "answers": { "OUTPUT_LANGUAGE": "English", "DOC_BASE_PATH": "...", "TEST_CMD": "...", ... },
      "useClaude": true, "useCodex": true,
      "copyDocsVault": false, "copyClaudeAssets": false, "copyCodexAssets": true
    }

  Docs:    https://github.com/TmsNine/tms-pipeline
  Example: templates/example-task/ACME-101/ — a full task run through the staged pipeline.
`);
}

// Robust line reader that works for both an interactive TTY and piped/redirected stdin.
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
  for (const line of BANNER) console.log('  ' + paint(line, C.bold + C.acid));
  console.log('  ' + paint(STRINGS.en.tagline + '  ·  ' + STRINGS.ru.tagline, C.dim));
  if (DRY_RUN) console.log('  ' + paint('(dry-run: nothing will be written to disk)', C.yellow));
  console.log('');
}

// Ask a free-text value with a shown [default].
async function askText(label, def) {
  if (YES) return def || '';
  const suffix = def ? paint(` [${def}]`, C.dim) : '';
  const raw = await prompt(`  ${paint(label, C.bold)}${suffix}\n  ${paint('>', C.acid)} `);
  return raw === '' ? (def || '') : raw;
}

// Ask Y/n. Returns boolean.
async function askYesNo(label, def) {
  if (YES) return def;
  const hint = def ? 'Y/n' : 'y/N';
  const raw = (await prompt(`  ${paint(label, C.bold)} ${paint(`(${hint})`, C.dim)}\n  ${paint('>', C.acid)} `)).toLowerCase();
  if (raw === '') return def;
  return raw === 'y' || raw === 'yes';
}

// Numeric menu. options = [{key,label,note}]; returns the chosen key (defaults to first).
async function askMenu(title, options) {
  if (YES) return options[0].key;
  console.log('');
  console.log('  ' + paint(title, C.bold));
  for (const o of options) {
    const note = o.note ? paint('  ' + o.note, C.dim) : '';
    console.log(`    ${paint(o.key + ')', C.acid)} ${o.label}${note}`);
  }
  const raw = await prompt(`  ${paint('>', C.acid)} `);
  const hit = options.find((o) => o.key === raw);
  return hit ? hit.key : options[0].key;
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
    copyPipeline: confirm('copyPipeline', false),
    copyDocsVault: confirm('copyDocsVault', false),
    copyClaudeAssets: confirm('copyClaudeAssets', false),
    copyCodexAssets: confirm('copyCodexAssets', false),
  };
}

async function collectInteractive() {
  banner();
  openReader();

  // 1) Language first — drives both the wizard UI and OUTPUT_LANGUAGE in AGENTS.md.
  const lang = await askMenu('Language / Язык', [
    { key: '1', label: 'English' },
    { key: '2', label: 'Русский' },
  ]) === '2' ? 'ru' : 'en';
  const S = STRINGS[lang];
  if (!YES) console.log('  ' + paint(S.enterHint, C.dim));

  // 2) Which agent tool(s) — gates which config + which skill homes.
  const toolKey = await askMenu(S.pickTools, [
    { key: '1', label: S.toolClaude },
    { key: '2', label: S.toolCodex },
    { key: '3', label: S.toolBoth },
  ]);
  const useClaude = toolKey === '1' || toolKey === '3';
  const useCodex = toolKey === '2' || toolKey === '3';

  // 3) Where to write the starter AGENTS.md.
  const targetDir = path.resolve(await askText(S.projectPath, process.cwd()));

  // 4) Install the skill files now (the install-scope question — legitimately a terminal step).
  const homes = [useClaude ? '~/.claude' : null, useCodex ? '~/.codex' : null].filter(Boolean).join(' + ');
  let copyClaudeAssets = false;
  let copyCodexAssets = false;
  if (YES) {
    copyCodexAssets = useCodex; // -y: Codex copy on; Claude left to /plugin install
  } else {
    console.log('  ' + paint(S.skipHint, C.dim));
    if (await askYesNo(S.installSkills(homes || '~/.claude'), true)) {
      copyClaudeAssets = useClaude;
      copyCodexAssets = useCodex;
    }
  }

  rl.close();
  // The thin installer only knows the language. Everything else stays <<TODO>> until /tms-init.
  return {
    lang,
    targetDir,
    answers: { OUTPUT_LANGUAGE: lang === 'ru' ? 'Russian' : 'English' },
    useClaude,
    useCodex,
    copyPipeline: false,
    copyDocsVault: false,
    copyClaudeAssets,
    copyCodexAssets,
  };
}

async function main() {
  if (HELP) { printHelp(); return; }
  if (VERSION) { console.log(pkg.version); return; }

  const cfg = ANSWERS_FILE ? fromAnswersFile(ANSWERS_FILE) : await collectInteractive();
  const S = STRINGS[cfg.lang] || STRINGS.en;

  console.log(`\n  ${paint((DRY_RUN ? S.dryRunFor : S.applying) + ':', C.bold)} ${cfg.targetDir}\n`);
  const results = applyConfig({
    targetDir: cfg.targetDir,
    answers: cfg.answers,
    useClaude: cfg.useClaude,
    useCodex: cfg.useCodex,
    copyPipeline: cfg.copyPipeline,
    copyDocsVault: cfg.copyDocsVault,
    copyClaudeAssets: cfg.copyClaudeAssets,
    copyCodexAssets: cfg.copyCodexAssets,
    force: FORCE,
    dryRun: DRY_RUN,
  });

  for (const r of results) {
    const ok = /written|copied/.test(r.status);
    console.log(`    ${paint('[' + r.status + ']', ok ? C.green : C.gray)} ${r.path}`);
  }

  console.log('');
  console.log('  ' + paint(S.done, C.bold + C.acid));
  console.log('    ' + paint('1.', C.acid) + ' ' + paint(S.step_init, C.bold));
  console.log('       ' + paint(S.step_init2, C.dim));
  if (cfg.useClaude && cfg.copyClaudeAssets) {
    console.log('    ' + paint('2.', C.acid) + ' ' + S.step_claudeInstalled);
  } else if (cfg.useClaude) {
    console.log('    ' + paint('2.', C.acid) + ' ' + S.step_claudePlugin);
  }
  if (cfg.useCodex && !cfg.copyCodexAssets) {
    console.log('    ' + paint('2.', C.acid) + ' ' + S.step_codex);
  }
  console.log('    ' + paint('3.', C.acid) + ' ' + S.step_task);
  console.log('');
}

main().catch((err) => {
  console.error('\n  ' + paint('tms-pipeline install failed:', C.yellow), err.message, '\n');
  process.exit(1);
});
