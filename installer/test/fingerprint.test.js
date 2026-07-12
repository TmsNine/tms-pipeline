const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..', '..');
const codexHelper = path.join(
  repoRoot,
  'codex-skills',
  'tms-04-implement',
  'references',
  'task-fingerprint.mjs',
);
const claudeHelper = path.join(
  repoRoot,
  'skills',
  'tms-implement',
  'references',
  'task-fingerprint.mjs',
);

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
}

function gitNull(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args])
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .sort();
}

test('Claude and Codex use one byte-identical fingerprint helper', () => {
  assert.deepEqual(fs.readFileSync(claudeHelper), fs.readFileSync(codexHelper));
});

test('worked example labels format-valid SHA-256 values as illustrative', () => {
  const exampleDir = path.join(repoRoot, 'templates', 'example-task', 'ACME-101');
  const contents = fs.readdirSync(exampleDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => fs.readFileSync(path.join(exampleDir, name), 'utf8'))
    .join('\n');
  assert.doesNotMatch(contents, /impl-acme|pkg-acme/);
  const hashes = [...contents.matchAll(/sha256:([0-9a-f]+)/g)];
  assert.ok(hashes.length > 0);
  for (const match of hashes) assert.equal(match[1].length, 64);
  assert.match(contents, /illustrative,\n  format-valid values/);
  assert.match(contents, /Base SHA: `[0-9a-f]{40}`/);
});

test('canonical fingerprints match between worktree and staged package', async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-fingerprint-'));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));

  git(repo, 'init', '--quiet');
  git(repo, 'config', 'user.name', 'TMS Test');
  git(repo, 'config', 'user.email', 'test@example.invalid');
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'docs', 'ACME-1'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'app.js'), 'export const value = 1;\n');
  fs.writeFileSync(path.join(repo, 'src', 'removed.js'), 'remove me\n');
  fs.writeFileSync(
    path.join(repo, 'docs', 'ACME-1', '04_implementation.md'),
    '- Package fingerprint: initial\n',
  );
  git(repo, 'add', '.');
  git(repo, 'commit', '--quiet', '-m', 'base');
  const base = git(repo, 'rev-parse', 'HEAD');

  fs.writeFileSync(path.join(repo, 'src', 'app.js'), 'export const value = 2;\n');
  fs.rmSync(path.join(repo, 'src', 'removed.js'));
  fs.writeFileSync(
    path.join(repo, 'docs', 'ACME-1', '04_implementation.md'),
    '- Package fingerprint: worktree-value\n',
  );
  fs.writeFileSync(
    path.join(repo, 'implementation.manifest'),
    'src/removed.js\nsrc/app.js\n',
  );
  fs.writeFileSync(
    path.join(repo, 'package.manifest'),
    'src/removed.js\ndocs/ACME-1/04_implementation.md\nsrc/app.js\n',
  );

  const { computeFingerprint } = await import(pathToFileURL(codexHelper).href);
  const implementationWorktree = computeFingerprint({
    repo,
    base,
    scope: 'implementation',
    source: 'worktree',
    manifest: 'implementation.manifest',
  });
  const packageWorktree = computeFingerprint({
    repo,
    base,
    scope: 'package',
    source: 'worktree',
    manifest: 'package.manifest',
  });

  git(repo, 'add', 'src/app.js', 'src/removed.js', 'docs/ACME-1/04_implementation.md');
  const implementationIndex = computeFingerprint({
    repo,
    base,
    scope: 'implementation',
    source: 'index',
    manifest: 'implementation.manifest',
  });
  const packageIndex = computeFingerprint({
    repo,
    base,
    scope: 'package',
    source: 'index',
    manifest: 'package.manifest',
    observed: 'package.manifest',
  });

  assert.match(packageWorktree, /^sha256:[0-9a-f]{64}$/);
  assert.equal(implementationWorktree, implementationIndex);
  assert.equal(packageWorktree, packageIndex);

  fs.writeFileSync(
    path.join(repo, 'docs', 'ACME-1', '04_implementation.md'),
    '- Package fingerprint: a-different-stored-value\n',
  );
  assert.equal(
    computeFingerprint({
      repo,
      base,
      scope: 'package',
      source: 'worktree',
      manifest: 'package.manifest',
    }),
    packageIndex,
  );

  fs.writeFileSync(path.join(repo, 'src', 'app.js'), 'export const value = 3;\n');
  assert.notEqual(
    computeFingerprint({
      repo,
      base,
      scope: 'implementation',
      source: 'worktree',
      manifest: 'implementation.manifest',
    }),
    implementationIndex,
  );

  fs.writeFileSync(path.join(repo, 'src', '.config'), 'valid dotted name\n');
  fs.writeFileSync(path.join(repo, 'valid.manifest'), 'src/.config\n');
  assert.match(
    computeFingerprint({
      repo,
      base,
      scope: 'implementation',
      source: 'worktree',
      manifest: 'valid.manifest',
    }),
    /^sha256:[0-9a-f]{64}$/,
  );

  if (process.platform !== 'win32') {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-fingerprint-outside-'));
    t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
    fs.writeFileSync(path.join(outside, 'secret.txt'), 'must not be hashed\n');
    fs.symlinkSync(outside, path.join(repo, 'linked-dir'), 'dir');
    fs.writeFileSync(path.join(repo, 'symlink.manifest'), 'linked-dir/secret.txt\n');
    assert.throws(
      () => computeFingerprint({
        repo,
        base,
        scope: 'implementation',
        source: 'worktree',
        manifest: 'symlink.manifest',
      }),
      /Intermediate symlink is not allowed/,
    );
  }

  for (const invalidPath of ['../outside.txt', 'a/../../outside.txt', '.', '..']) {
    fs.writeFileSync(path.join(repo, 'invalid.manifest'), `${invalidPath}\n`);
    assert.throws(
      () => computeFingerprint({
        repo,
        base,
        scope: 'implementation',
        source: 'worktree',
        manifest: 'invalid.manifest',
      }),
      /not canonical|repo-relative POSIX path|escapes repository root/,
    );
  }

  fs.writeFileSync(path.join(repo, 'src', 'extra.js'), 'unexpected staged task file\n');
  git(repo, 'add', 'src/extra.js');
  fs.writeFileSync(
    path.join(repo, 'observed-staged.manifest'),
    'src/removed.js\ndocs/ACME-1/04_implementation.md\nsrc/app.js\nsrc/extra.js\n',
  );
  assert.throws(
    () => computeFingerprint({
      repo,
      base,
      scope: 'package',
      source: 'index',
      manifest: 'package.manifest',
      observed: 'observed-staged.manifest',
    }),
    /Manifest path-set mismatch.*extra in observed: src\/extra\.js/,
  );
});

test('rename keeps the same source and destination path set before and after staging', async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-fingerprint-rename-'));
  const control = fs.mkdtempSync(path.join(os.tmpdir(), 'tms-fingerprint-manifests-'));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  t.after(() => fs.rmSync(control, { recursive: true, force: true }));

  git(repo, 'init', '--quiet');
  git(repo, 'config', 'user.name', 'TMS Test');
  git(repo, 'config', 'user.email', 'test@example.invalid');
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'old-name.js'), 'export const renamed = true;\n');
  git(repo, 'add', '.');
  git(repo, 'commit', '--quiet', '-m', 'base');
  const base = git(repo, 'rev-parse', 'HEAD');
  fs.renameSync(path.join(repo, 'src', 'old-name.js'), path.join(repo, 'src', 'new-name.js'));

  const manifest = path.join(control, 'package.manifest');
  const observedWorktree = path.join(control, 'observed-worktree.manifest');
  const observedIndex = path.join(control, 'observed-index.manifest');
  const expectedPaths = ['src/new-name.js', 'src/old-name.js'];
  fs.writeFileSync(manifest, `${expectedPaths.join('\n')}\n`);

  const worktreePaths = [
    ...gitNull(repo, 'diff', '--name-only', '-z', '--no-renames', base, '--'),
    ...gitNull(repo, 'ls-files', '--others', '--exclude-standard', '-z'),
  ].sort();
  assert.deepEqual(worktreePaths, expectedPaths);
  fs.writeFileSync(observedWorktree, `${worktreePaths.join('\n')}\n`);

  const { computeFingerprint } = await import(pathToFileURL(codexHelper).href);
  const worktreeHash = computeFingerprint({
    repo,
    base,
    scope: 'implementation',
    source: 'worktree',
    manifest,
    observed: observedWorktree,
  });

  git(repo, 'add', '-A', '--', 'src/old-name.js', 'src/new-name.js');
  const indexPaths = gitNull(
    repo,
    'diff',
    '--cached',
    '--name-only',
    '-z',
    '--no-renames',
    base,
    '--',
  );
  assert.deepEqual(indexPaths, expectedPaths);
  fs.writeFileSync(observedIndex, `${indexPaths.join('\n')}\n`);

  const indexHash = computeFingerprint({
    repo,
    base,
    scope: 'implementation',
    source: 'index',
    manifest,
    observed: observedIndex,
  });
  assert.equal(worktreeHash, indexHash);
});
