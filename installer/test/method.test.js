// Locks in the shape of the current method (0.2.x): the eight stage skills, the retired names staying
// retired, model/effort pinned per agent role, and the stage rules the docs promise.

'use strict';

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

function dirs(relativeDir) {
  return fs.readdirSync(path.join(root, relativeDir), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

const STAGES = [
  'tms-00-ticket', 'tms-01-research', 'tms-02-design', 'tms-03-plan',
  'tms-04-implement', 'tms-04b-review', 'tms-05-test', 'tms-06-gate',
];

const RETIRED = [
  'tms-ticket', 'tms-research', 'tms-design', 'tms-gap-audit', 'tms-02b-gap-audit', 'tms-plan',
  'tms-implement', 'tms-loop-review', 'tms-04b-loop-review', 'tms-loop-code-review',
  'tms-94-loop-code-review', 'tms-review', 'tms-06-review', 'tms-test',
];

test('both trees ship the eight stage skills plus the orchestrator, byte-identical', () => {
  for (const tree of ['skills', 'codex-skills']) {
    const onDisk = dirs(tree);
    for (const skill of [...STAGES, 'tms-run', 'tms-new', 'tms-ui-screen']) {
      assert.ok(onDisk.includes(skill), `${tree}/${skill} exists`);
    }
  }
  for (const skill of [...STAGES, 'tms-run', 'tms-ui-screen']) {
    assert.equal(read(`skills/${skill}/SKILL.md`), read(`codex-skills/${skill}/SKILL.md`), `${skill} identical in both trees`);
  }
});

test('retired skill names are gone from both trees', () => {
  for (const tree of ['skills', 'codex-skills']) {
    const onDisk = dirs(tree);
    for (const name of RETIRED) assert.ok(!onDisk.includes(name), `${tree}/${name} must not exist`);
  }
});

test('every skill frontmatter name matches its folder', () => {
  for (const tree of ['skills', 'codex-skills']) {
    for (const name of dirs(tree)) {
      assert.match(frontmatter(`${tree}/${name}/SKILL.md`), new RegExp(`^name: "?${name}"?$`, 'm'), `${tree}/${name}`);
    }
  }
});

test('Claude agents pin a full model id and an effort per role', () => {
  const expected = {
    'tms-stage': ['opus', 'medium'],
    'tms-stage-deep': ['opus', 'high'],
    'tms-stage-light': ['sonnet', 'medium'],
    'tms-reviewer': ['opus', 'high'],
    'tms-security': ['opus', 'high'],
    'tms-architect': ['opus', 'high'],
    'tms-developer': ['opus', 'medium'],
    'tms-explorer': ['sonnet', 'medium'],
    'tms-tester': ['sonnet', 'low'],
  };
  assert.deepEqual(
    fs.readdirSync(path.join(root, 'agents')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort(),
    Object.keys(expected).sort(),
  );
  for (const [agent, [family, effort]] of Object.entries(expected)) {
    const header = frontmatter(`agents/${agent}.md`);
    // A full id such as claude-<family>-<version>, never a bare alias like `opus`.
    assert.match(header, new RegExp(`^model: claude-${family}-[0-9][0-9a-z.-]*$`, 'm'), `${agent} model`);
    assert.match(header, new RegExp(`^effort: ${effort}$`, 'm'), `${agent} effort`);
  }
  // Read-only roles never get write tools.
  for (const agent of ['tms-reviewer', 'tms-security', 'tms-architect', 'tms-explorer', 'tms-tester']) {
    assert.doesNotMatch(frontmatter(`agents/${agent}.md`), /^ {2}- (Write|Edit)$/m, `${agent} is read-only`);
  }
});

test('Codex agents declare model, effort and sandbox', () => {
  const files = fs.readdirSync(path.join(root, 'codex-agents')).filter((f) => f.endsWith('.toml')).sort();
  assert.deepEqual(files, ['tms_architect.toml', 'tms_developer.toml', 'tms_explorer.toml', 'tms_reviewer.toml', 'tms_security.toml', 'tms_validator.toml']);
  for (const f of files) {
    const toml = read(`codex-agents/${f}`);
    assert.match(toml, /^model = "[^"]+"$/m, f);
    assert.match(toml, /^model_reasoning_effort = "[a-z]+"$/m, f);
    assert.match(toml, /^sandbox_mode = "(read-only|workspace-write)"$/m, f);
  }
});

test('stage skills carry the method rules the docs promise', () => {
  const run = read('skills/tms-run/SKILL.md');
  for (const stage of STAGES) assert.ok(run.includes(`\`${stage}\``), `tms-run lists ${stage}`);
  assert.match(run, /Two owner stops/);

  const impl = read('skills/tms-04-implement/SKILL.md');
  assert.match(impl, /The stage agent is the executor/);
  assert.match(impl, /one pass over the whole diff/i);
  assert.match(impl, /File Ownership from the plan is the boundary/);
  assert.doesNotMatch(impl, /Profile [MERC]\b|fingerprint/i);

  const review = read('skills/tms-04b-review/SKILL.md');
  assert.match(review, /Default limit: five passes/);
  assert.match(review, /stagnation/i);
  assert.match(review, /Mode: INDEPENDENT_04B/);
  assert.doesNotMatch(review, /\d+\.\d\/10/);

  const gate = read('skills/tms-06-gate/SKILL.md');
  assert.match(gate, /An agent never writes `go`/);
  assert.match(gate, /`conditional_go` is the one exception, and the lead signs it/);
});

test('templates describe the same method and reference only current skills', () => {
  const agents = read('templates/AGENTS.template.md');
  const claude = read('templates/CLAUDE.template.md');
  for (const stage of STAGES) assert.ok(agents.includes(`\`${stage}\``), `AGENTS template lists ${stage}`);
  assert.match(agents, /Two owner stops: after design \(02\) and at the gate \(06\)/);
  assert.match(agents, /Only a human writes `go`/);
  assert.match(agents, /## Security Triggers/);
  for (const contents of [agents, claude]) {
    for (const name of RETIRED) assert.ok(!contents.includes(`\`${name}\``), `template mentions retired ${name}`);
    assert.doesNotMatch(contents, /Profile[- ]?[MERC]\b|02b_gap_audit|fingerprint/);
  }
});
