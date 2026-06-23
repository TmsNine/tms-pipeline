// Zero-dependency tests for the onboarding engine, run with `node --test`.
// They lock in the safety promises the README makes (never overwrite without --force,
// nothing ships as a raw {{TOKEN}}, Codex/Claude assets only when that tool is selected) and assert
// the four hardcoded version strings stay in sync.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  applyConfig,
  renderTemplate,
  stripGuidance,
  fillTokens,
} = require('../core/engine');
const { QUESTIONS, DEFERRED_TOKENS } = require('../core/questions');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tms-test-'));
}

// All tokens a fully-answered render would have values for.
function fullAnswers() {
  const a = {};
  for (const q of QUESTIONS) a[q.token] = q.default || `VALUE_${q.token}`;
  a.PROJECT_ONE_LINER = 'A demo app on Node.';
  return a;
}

test('stripGuidance removes HTML comments and « » notes and collapses blank runs', () => {
  const out = stripGuidance('# Title\n<!-- hidden -->\nLine «inline note» end\n\n\n\nTail\n');
  assert.ok(!out.includes('hidden'));
  assert.ok(!out.includes('inline note'));
  assert.ok(!out.includes('«'));
  assert.ok(!/\n{3,}/.test(out), 'no 3+ consecutive newlines');
});

test('fillTokens: answered → value, deferred → hinted TODO, unknown → bare TODO', () => {
  const out = fillTokens('{{FOO}} | {{PROFILE_C_TRIGGERS}} | {{NOPE}}', { FOO: 'bar' });
  assert.ok(out.includes('bar'));
  assert.ok(out.includes('<<TODO: PROFILE_C_TRIGGERS'), 'deferred token becomes a TODO');
  assert.ok(out.includes('<<TODO: NOPE>>'), 'unknown token becomes a bare TODO');
  assert.ok(!out.includes('{{'), 'no raw placeholder survives');
});

test('every DESIGN_SYSTEM_HINT-style template token is asked or deferred (no raw leak)', () => {
  for (const tplName of ['AGENTS.template.md', 'CLAUDE.template.md']) {
    const rendered = renderTemplate(tplName, fullAnswers());
    assert.ok(!rendered.includes('{{'), `${tplName} left a raw {{TOKEN}}: ${rendered.match(/\{\{[^}]+\}\}/g)}`);
  }
});

test('every template token is either a QUESTION or a DEFERRED token', () => {
  const known = new Set([...QUESTIONS.map((q) => q.token), ...DEFERRED_TOKENS]);
  for (const tplName of ['AGENTS.template.md', 'CLAUDE.template.md']) {
    // Scan the post-strip text — that is what actually gets token-replaced; literal
    // {{PLACEHOLDER}} mentions inside the HOW-TO-USE comments are removed first.
    const raw = stripGuidance(fs.readFileSync(path.join(REPO_ROOT, 'templates', tplName), 'utf8'));
    const tokens = [...raw.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]);
    for (const t of tokens) {
      assert.ok(known.has(t), `${tplName} uses {{${t}}} which is neither asked nor deferred`);
    }
  }
});

test('applyConfig writes AGENTS.md and CLAUDE.md when Claude is used', () => {
  const dir = tmp();
  const results = applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: true, useCodex: false });
  assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')));
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'CLAUDE.md')));
  assert.ok(results.some((r) => r.status === 'written'));
});

test('applyConfig skips CLAUDE.md when Claude is not used', () => {
  const dir = tmp();
  applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: false, useCodex: true });
  assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'CLAUDE.md')));
});

test('applyConfig warns when neither tool is selected', () => {
  const dir = tmp();
  const results = applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: false, useCodex: false });
  assert.ok(results.some((r) => /warning/.test(r.status)));
});

test('writeFileSafe (via applyConfig) never overwrites without --force', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'ORIGINAL');
  const skipped = applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: false, useCodex: true });
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), 'ORIGINAL');
  assert.ok(skipped.find((r) => r.path.endsWith('AGENTS.md')).status.startsWith('skipped'));

  const forced = applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: false, useCodex: true, force: true });
  assert.notEqual(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), 'ORIGINAL');
  assert.ok(forced.find((r) => r.path.endsWith('AGENTS.md')).status === 'written');
});

test('dry-run writes nothing to disk', () => {
  const dir = tmp();
  const results = applyConfig({
    targetDir: dir, answers: fullAnswers(), useClaude: true, useCodex: true,
    copyPipeline: true, copyDocsVault: true, copyCodexAssets: true, codexHome: path.join(dir, '.codex'),
    dryRun: true,
  });
  assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(dir, '.codex')));
  assert.ok(results.every((r) => /dry-run|skipped|warning/.test(r.status)));
});

test('Codex assets are copied only when Codex is selected', () => {
  const withCodex = tmp();
  applyConfig({
    targetDir: withCodex, answers: fullAnswers(), useClaude: true, useCodex: true,
    copyCodexAssets: true, codexHome: path.join(withCodex, '.codex'),
  });
  assert.ok(fs.existsSync(path.join(withCodex, '.codex', 'skills')), 'skills copied');
  assert.ok(fs.existsSync(path.join(withCodex, '.codex', 'agents')), 'agents copied');

  const noCodex = tmp();
  const results = applyConfig({
    targetDir: noCodex, answers: fullAnswers(), useClaude: true, useCodex: false,
    copyCodexAssets: true, codexHome: path.join(noCodex, '.codex'),
  });
  assert.ok(!fs.existsSync(path.join(noCodex, '.codex')), 'no Codex dir when Codex not selected');
  assert.ok(results.some((r) => /skipped \(Codex not selected\)/.test(r.status)));
});

test('Claude assets are copied only when Claude is selected', () => {
  const withClaude = tmp();
  applyConfig({
    targetDir: withClaude, answers: fullAnswers(), useClaude: true, useCodex: false,
    copyClaudeAssets: true, claudeHome: path.join(withClaude, '.claude-home'),
  });
  assert.ok(fs.existsSync(path.join(withClaude, '.claude-home', 'skills')), 'skills copied');
  assert.ok(fs.existsSync(path.join(withClaude, '.claude-home', 'agents')), 'agents copied');
  assert.ok(fs.existsSync(path.join(withClaude, '.claude-home', 'commands')), 'commands copied');

  const noClaude = tmp();
  const results = applyConfig({
    targetDir: noClaude, answers: fullAnswers(), useClaude: false, useCodex: true,
    copyClaudeAssets: true, claudeHome: path.join(noClaude, '.claude-home'),
  });
  assert.ok(!fs.existsSync(path.join(noClaude, '.claude-home')), 'no Claude global dir when Claude not selected');
  assert.ok(results.some((r) => /skipped \(Claude Code not selected\)/.test(r.status)));
});

test('copyPipeline lays down the pipeline template', () => {
  const dir = tmp();
  applyConfig({ targetDir: dir, answers: fullAnswers(), useClaude: true, useCodex: false, copyPipeline: true });
  assert.ok(fs.existsSync(path.join(dir, 'docs', '_pipeline_template')));
});

test('the four hardcoded version strings stay in sync', () => {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(REPO_ROOT, p), 'utf8'));
  const pkgV = read('package.json').version;
  assert.equal(read('.claude-plugin/plugin.json').version, pkgV, '.claude-plugin/plugin.json');
  assert.equal(read('.codex-plugin/plugin.json').version, pkgV, '.codex-plugin/plugin.json');
  assert.equal(read('.claude-plugin/marketplace.json').plugins[0].version, pkgV, 'marketplace.json');
});

test('plugin manifests list every skill on disk', () => {
  const onDisk = fs.readdirSync(path.join(REPO_ROOT, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  for (const manifest of ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
    const listed = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, manifest), 'utf8'))
      .skills.map((s) => s.replace('./skills/', '')).sort();
    assert.deepEqual(listed, onDisk, `${manifest} skill list matches skills/ on disk`);
  }
});
