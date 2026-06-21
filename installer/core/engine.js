// engine.js — pure setup logic shared by all onboarding front-ends.
// Given a map of answers, it renders AGENTS.md + CLAUDE.md from the templates and (optionally) copies the
// pipeline and docs-vault skeletons into a target project. No prompting here — front-ends collect input.

'use strict';

const fs = require('fs');
const path = require('path');
const { DEFERRED_TOKENS } = require('./questions');

// Repo root = two levels up from installer/core/
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES = path.join(REPO_ROOT, 'templates');

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

function writeFileSafe(filePath, contents, { force = false } = {}) {
  if (fs.existsSync(filePath) && !force) {
    return { path: filePath, status: 'skipped (exists)' };
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

/**
 * Apply the configuration to a target project directory.
 * @param {object} opts
 * @param {string} opts.targetDir   absolute path of the project to configure
 * @param {object} opts.answers     token -> value
 * @param {boolean} opts.useClaude  write .claude/CLAUDE.md (Claude Code). Default true.
 * @param {boolean} opts.useCodex   informational — Codex reads AGENTS.md natively, no extra file.
 * @param {boolean} opts.copyPipeline
 * @param {boolean} opts.copyDocsVault
 * @param {boolean} opts.force      overwrite existing AGENTS.md / CLAUDE.md
 * @returns {Array} list of {path, status}
 */
function applyConfig({ targetDir, answers, useClaude = true, useCodex = true, copyPipeline, copyDocsVault, force = false }) {
  const results = [];

  // AGENTS.md is the shared canon — both Claude Code (via import) and Codex (natively) read it.
  const agents = renderTemplate('AGENTS.template.md', answers);
  results.push(writeFileSafe(path.join(targetDir, 'AGENTS.md'), agents, { force }));

  // CLAUDE.md is Claude-Code-specific — only write it if the user uses Claude Code.
  if (useClaude) {
    const claude = renderTemplate('CLAUDE.template.md', answers);
    results.push(writeFileSafe(path.join(targetDir, '.claude', 'CLAUDE.md'), claude, { force }));
  } else {
    results.push({ path: '.claude/CLAUDE.md', status: 'skipped (Claude Code not selected)' });
  }
  if (!useCodex && !useClaude) {
    results.push({ path: '(tools)', status: 'warning: neither Claude Code nor Codex selected' });
  }

  if (copyPipeline) {
    const dest = path.join(targetDir, 'docs', '_pipeline_template');
    copyDir(path.join(TEMPLATES, 'pipeline'), dest);
    results.push({ path: dest, status: 'copied (pipeline template)' });
  }

  if (copyDocsVault) {
    const dest = path.join(targetDir, 'docs', 'docs-vault');
    copyDir(path.join(TEMPLATES, 'docs-vault'), dest);
    results.push({ path: dest, status: 'copied (docs-vault skeletons — rename the PROJECT_NAME folder)' });
  }

  return results;
}

module.exports = { applyConfig, renderTemplate, stripGuidance, fillTokens, REPO_ROOT, TEMPLATES };
