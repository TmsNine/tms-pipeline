// engine.js — pure setup logic shared by all onboarding front-ends.
// Given a map of answers, it renders AGENTS.md + CLAUDE.md from the templates and (optionally) copies the
// pipeline and docs-vault skeletons into a target project. No prompting here — front-ends collect input.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { DEFERRED_TOKENS } = require('./questions');

// Repo root = two levels up from installer/core/
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES = path.join(REPO_ROOT, 'templates');

// Where Codex looks for globally-available skills and agents. Codex has no `/plugin install`
// equivalent, so to make the tms-* skills available to Codex we copy them here.
const CODEX_HOME = path.join(os.homedir(), '.codex');

/**
 * Strip template authoring guidance so the generated file is clean:
 *  - remove HTML comment blocks  <!-- ... -->
 *  - remove inline guidance notes « ... »
 * Then collapse any blank-line runs left behind.
 */
function stripGuidance(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/«[\s\S]*?»/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
}

/**
 * Replace {{TOKEN}} placeholders. Answered tokens get their value; deferred or unanswered tokens become a
 * visible TODO so nothing silently ships empty.
 */
function fillTokens(text, answers) {
  return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, token) => {
    if (Object.prototype.hasOwnProperty.call(answers, token) && answers[token] !== '') {
      return answers[token];
    }
    if (DEFERRED_TOKENS.includes(token)) {
      return `<<TODO: ${token} — fill this in (see the template comments in the tms-pipeline repo)>>`;
    }
    return `<<TODO: ${token}>>`;
  });
}

function renderTemplate(templateFile, answers) {
  const raw = fs.readFileSync(path.join(TEMPLATES, templateFile), 'utf8');
  return fillTokens(stripGuidance(raw), answers);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileSafe(filePath, contents, { force = false, dryRun = false } = {}) {
  if (fs.existsSync(filePath) && !force) {
    return { path: filePath, status: 'skipped (exists — pass --force to overwrite)' };
  }
  if (dryRun) {
    return { path: filePath, status: 'would write (dry-run)' };
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
  return { path: filePath, status: 'written' };
}

function copyDir(srcDir, destDir) {
  ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

// Copy a directory only when not in dry-run; return a status record either way.
function copyDirSafe(srcDir, destDir, label, { dryRun = false } = {}) {
  if (dryRun) return { path: destDir, status: `would copy (dry-run) — ${label}` };
  copyDir(srcDir, destDir);
  return { path: destDir, status: `copied (${label})` };
}

/**
 * Apply the configuration to a target project directory.
 * @param {object} opts
 * @param {string} opts.targetDir       absolute path of the project to configure
 * @param {object} opts.answers         token -> value
 * @param {boolean} opts.useClaude      write .claude/CLAUDE.md (Claude Code). Default true.
 * @param {boolean} opts.useCodex       gates the Codex asset install below.
 * @param {boolean} opts.copyPipeline   copy the task-pipeline template into the project.
 * @param {boolean} opts.copyDocsVault  copy the docs-vault skeletons into the project.
 * @param {boolean} opts.copyCodexAssets copy skills/ + agents/ into ~/.codex (Codex has no plugin install).
 * @param {string}  opts.codexHome      override the Codex home dir (defaults to ~/.codex; for tests).
 * @param {boolean} opts.force          overwrite existing AGENTS.md / CLAUDE.md
 * @param {boolean} opts.dryRun         compute and report actions without writing anything
 * @returns {Array} list of {path, status}
 */
function applyConfig({
  targetDir,
  answers,
  useClaude = true,
  useCodex = true,
  copyPipeline,
  copyDocsVault,
  copyCodexAssets = false,
  codexHome = CODEX_HOME,
  force = false,
  dryRun = false,
}) {
  const results = [];

  // AGENTS.md is the shared canon — both Claude Code (via import) and Codex (natively) read it.
  const agents = renderTemplate('AGENTS.template.md', answers);
  results.push(writeFileSafe(path.join(targetDir, 'AGENTS.md'), agents, { force, dryRun }));

  // CLAUDE.md is Claude-Code-specific — only write it if the user uses Claude Code.
  if (useClaude) {
    const claude = renderTemplate('CLAUDE.template.md', answers);
    results.push(writeFileSafe(path.join(targetDir, '.claude', 'CLAUDE.md'), claude, { force, dryRun }));
  } else {
    results.push({ path: '.claude/CLAUDE.md', status: 'skipped (Claude Code not selected)' });
  }
  if (!useCodex && !useClaude) {
    results.push({ path: '(tools)', status: 'warning: neither Claude Code nor Codex selected' });
  }

  if (copyPipeline) {
    const dest = path.join(targetDir, 'docs', '_pipeline_template');
    results.push(copyDirSafe(path.join(TEMPLATES, 'pipeline'), dest, 'pipeline template', { dryRun }));
  }

  if (copyDocsVault) {
    const dest = path.join(targetDir, 'docs', 'docs-vault');
    results.push(copyDirSafe(path.join(TEMPLATES, 'docs-vault'), dest, 'docs-vault skeletons — rename the PROJECT_NAME folder', { dryRun }));
  }

  // Codex has no `/plugin install` — make the skills/agents available by copying them into ~/.codex.
  // Only do this when the user actually uses Codex.
  if (copyCodexAssets) {
    if (!useCodex) {
      results.push({ path: codexHome, status: 'skipped (Codex not selected)' });
    } else {
      results.push(copyDirSafe(path.join(REPO_ROOT, 'skills'), path.join(codexHome, 'skills'), 'Codex skills → ~/.codex/skills', { dryRun }));
      results.push(copyDirSafe(path.join(REPO_ROOT, 'agents'), path.join(codexHome, 'agents'), 'Codex agents → ~/.codex/agents', { dryRun }));
    }
  }

  return results;
}

module.exports = { applyConfig, renderTemplate, stripGuidance, fillTokens, copyDir, REPO_ROOT, TEMPLATES, CODEX_HOME };
