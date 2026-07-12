const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function frontmatter(relativePath) {
  const contents = read(relativePath);
  const match = /^---\n([\s\S]*?)\n---/.exec(contents);
  assert.ok(match, `${relativePath} must have frontmatter`);
  return match[1];
}

test('Claude stage 04 uses profile-aware execution instead of a mandatory mob', () => {
  const skill = read('skills/tms-implement/SKILL.md');
  const template = read('templates/CLAUDE.template.md');

  for (const contents of [skill, template]) {
    assert.match(contents, /\*\*M[^\n]*lead implements inline|\*\*M[^\n]*lead.*inline/i);
    assert.match(contents, /\*\*E[^\n]*(bounded|Architect\/evidence)/i);
    assert.match(contents, /\*\*R[^\n]*(Developer|proving)/i);
    assert.match(contents, /\*\*C[^\n]*full role set/i);
    assert.doesNotMatch(contents, /Mandatory Multi-Agent Execution|mandatory Claude multi-agent mob/i);
  }

  assert.match(skill, /preferred model \| configured\/default model \| actual model or runtime-selected\/unknown/);
  assert.match(skill, /task\/wave ID, profile, `base_sha`, exact paths\/diff command/);
  assert.match(skill, /lead remains the single integration owner/i);
  assert.match(skill, /\*\*E[^\n]*one bounded read-only Architect\/evidence pass and a Tester/i);
  assert.match(skill, /Profile C must override Reviewer per invocation to the strongest available judgement model/i);
  assert.match(skill, /permissionMode[^\n]*ignored for plugin-shipped agents/i);
  assert.match(template, /lead remains the single integration owner/i);
  assert.match(template, /mandatory strongest-available per-invocation Reviewer override/i);
});

test('Claude proving roles declare model and copied-scope permission defaults', () => {
  const expected = {
    'agents/tms-developer.md': { model: 'sonnet', permissionMode: 'acceptEdits', writes: true },
    'agents/tms-tester.md': { model: 'sonnet', permissionMode: 'dontAsk', writes: false },
    'agents/tms-architect.md': { model: 'opus', permissionMode: 'plan', writes: false },
    'agents/tms-security.md': { model: 'opus', permissionMode: 'plan', writes: false },
    'agents/tms-reviewer.md': { model: 'sonnet', permissionMode: 'plan', writes: false },
  };

  for (const [relativePath, config] of Object.entries(expected)) {
    const header = frontmatter(relativePath);
    assert.match(header, new RegExp(`^model: ${config.model}$`, 'm'));
    assert.match(header, new RegExp(`^permissionMode: ${config.permissionMode}$`, 'm'));
    if (config.writes) {
      assert.match(header, /^  - (Write|Edit)$/m);
    } else {
      assert.doesNotMatch(header, /^  - (Write|Edit)$/m);
    }
  }
});

test('public docs describe the same Claude profile route', () => {
  const files = [
    'README.md',
    'README.ru.md',
    'docs/00-methodology.md',
    'docs/00-methodology.ru.md',
    'docs/02-configuration.md',
    'docs/02-configuration.ru.md',
    'docs/04-stages-deep-dive.md',
    'docs/04-stages-deep-dive.ru.md',
  ];

  for (const relativePath of files) {
    const contents = read(relativePath);
    assert.match(contents, /Claude[\s\S]{0,220}M[\s\S]{0,160}(inline|bounded)/i, relativePath);
  }

  const routing = read('docs/06-model-routing.md');
  const routingRu = read('docs/06-model-routing.ru.md');
  for (const contents of [routing, routingRu]) {
    assert.match(contents, /Claude Code/);
    assert.match(contents, /environment.*invocation.*agent frontmatter.*main conversation/s);
    assert.match(contents, /runtime-selected\/unknown/);
    assert.match(contents, /permissionMode/i);
    assert.match(contents, /plugin-shipped agents/i);
    assert.match(contents, /ignored|игнорируется/i);
  }
});
