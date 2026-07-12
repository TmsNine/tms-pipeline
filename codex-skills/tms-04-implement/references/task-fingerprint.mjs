#!/usr/bin/env node

// Canonical TMS task fingerprint v1. Keep the Claude and Codex copies byte-identical.
// The digest is SHA-256 over length-framed fields, so paths or file bytes cannot create
// delimiter ambiguity. Worktree and index sources must match after exact task staging.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VERSION = 'tms-task-fingerprint-v1';
const PACKAGE_FIELD = /^([ \t]*-[ \t]+[^:\r\n]*package fingerprint[^:\r\n]*:[ \t]*).*$/gim;

function git(repo, args, encoding = 'utf8') {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function canonicalRoot(repo) {
  return git(repo, ['rev-parse', '--show-toplevel']).trim();
}

function canonicalBase(repo, base) {
  const value = git(repo, ['rev-parse', '--verify', `${base}^{commit}`]).trim().toLowerCase();
  if (!/^[0-9a-f]{40,64}$/.test(value)) throw new Error(`Invalid base commit: ${base}`);
  return value;
}

function readManifest(file) {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const text = decoder.decode(fs.readFileSync(file));
  const seen = new Set();
  const paths = [];

  for (const rawLine of text.split('\n')) {
    const value = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    if (value === '') continue;
    if (
      value === '.'
      || value === '..'
      || value.startsWith('../')
      || value.includes('\0')
      || value.includes('\\')
      || path.posix.isAbsolute(value)
    ) {
      throw new Error(`Manifest path must be a repo-relative POSIX path: ${JSON.stringify(value)}`);
    }
    if (path.posix.normalize(value) !== value || value.normalize('NFC') !== value) {
      throw new Error(`Manifest path is not canonical: ${JSON.stringify(value)}`);
    }
    if (seen.has(value)) throw new Error(`Duplicate manifest path: ${value}`);
    seen.add(value);
    paths.push(value);
  }

  if (paths.length === 0) throw new Error('Manifest is empty');
  return paths.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
}

function assertSamePaths(manifestPaths, observedPaths) {
  const missing = manifestPaths.filter((entry) => !observedPaths.includes(entry));
  const extra = observedPaths.filter((entry) => !manifestPaths.includes(entry));
  if (missing.length || extra.length) {
    throw new Error(
      `Manifest path-set mismatch; missing from observed: ${missing.join(', ') || 'none'}; `
      + `extra in observed: ${extra.join(', ') || 'none'}`,
    );
  }
}

function worktreeEntry(root, relativePath) {
  const absolutePath = path.resolve(root, ...relativePath.split('/'));
  const rootPrefix = `${root}${path.sep}`;
  if (!absolutePath.startsWith(rootPrefix)) {
    throw new Error(`Manifest path escapes repository root: ${relativePath}`);
  }
  let cursor = root;
  for (const segment of relativePath.split('/').slice(0, -1)) {
    cursor = path.join(cursor, segment);
    let intermediate;
    try {
      intermediate = fs.lstatSync(cursor);
    } catch (error) {
      if (error.code === 'ENOENT') return { mode: '000000', content: Buffer.alloc(0) };
      throw error;
    }
    if (intermediate.isSymbolicLink()) {
      throw new Error(`Intermediate symlink is not allowed in manifest path: ${relativePath}`);
    }
    if (!intermediate.isDirectory()) {
      throw new Error(`Intermediate manifest component is not a directory: ${relativePath}`);
    }
  }
  const realRoot = fs.realpathSync.native(root);
  const realParent = fs.realpathSync.native(path.dirname(absolutePath));
  if (realParent !== realRoot && !realParent.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error(`Manifest path resolves outside repository root: ${relativePath}`);
  }
  let stat;
  try {
    stat = fs.lstatSync(absolutePath);
  } catch (error) {
    if (error.code === 'ENOENT') return { mode: '000000', content: Buffer.alloc(0) };
    throw error;
  }

  if (stat.isSymbolicLink()) {
    return { mode: '120000', content: fs.readlinkSync(absolutePath, { encoding: 'buffer' }) };
  }
  if (stat.isFile()) {
    return {
      mode: (stat.mode & 0o111) === 0 ? '100644' : '100755',
      content: fs.readFileSync(absolutePath),
    };
  }
  throw new Error(`Unsupported worktree entry type: ${relativePath}`);
}

function indexEntry(root, relativePath) {
  const output = git(root, ['ls-files', '--stage', '-z', '--', relativePath], 'buffer');
  const records = output.subarray(0, Math.max(0, output.length - (output.at(-1) === 0 ? 1 : 0)))
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  if (records.length === 0) return { mode: '000000', content: Buffer.alloc(0) };
  if (records.length !== 1) throw new Error(`Index has unresolved stages for: ${relativePath}`);

  const match = /^(\d{6}) ([0-9a-f]+) ([0-3])\t([\s\S]+)$/.exec(records[0]);
  if (!match || match[3] !== '0' || match[4] !== relativePath) {
    throw new Error(`Cannot resolve canonical index entry: ${relativePath}`);
  }
  const [, mode, object] = match;
  if (!['100644', '100755', '120000'].includes(mode)) {
    throw new Error(`Unsupported index mode ${mode}: ${relativePath}`);
  }
  return { mode, content: git(root, ['cat-file', 'blob', object], 'buffer') };
}

function normalizePackageEvidence(relativePath, content, scope) {
  if (scope !== 'package' || !relativePath.endsWith('.md')) return content;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const text = decoder.decode(content);
  return Buffer.from(text.replace(PACKAGE_FIELD, '$1<normalized>'), 'utf8');
}

function addField(hash, name, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  hash.update(Buffer.from(name, 'ascii'));
  hash.update(Buffer.from([0]));
  hash.update(Buffer.from(String(bytes.length), 'ascii'));
  hash.update(Buffer.from([0]));
  hash.update(bytes);
  hash.update(Buffer.from([0]));
}

export function computeFingerprint({ repo = process.cwd(), base, scope, source, manifest, observed }) {
  if (!['implementation', 'package'].includes(scope)) {
    throw new Error('Scope must be implementation or package');
  }
  if (!['worktree', 'index'].includes(source)) {
    throw new Error('Source must be worktree or index');
  }
  if (!base || !manifest) throw new Error('Both base and manifest are required');

  const root = canonicalRoot(repo);
  const baseSha = canonicalBase(root, base);
  const taskPaths = readManifest(path.resolve(repo, manifest));
  if (observed) {
    assertSamePaths(taskPaths, readManifest(path.resolve(repo, observed)));
  }
  const hash = crypto.createHash('sha256');

  addField(hash, 'version', VERSION);
  addField(hash, 'scope', scope);
  addField(hash, 'base_sha', baseSha);
  addField(hash, 'entry_count', String(taskPaths.length));

  for (const relativePath of taskPaths) {
    const entry = source === 'worktree'
      ? worktreeEntry(root, relativePath)
      : indexEntry(root, relativePath);
    const content = normalizePackageEvidence(relativePath, entry.content, scope);
    addField(hash, 'path', relativePath);
    addField(hash, 'mode', entry.mode);
    addField(hash, 'content', content);
  }

  return `sha256:${hash.digest('hex')}`;
}

function usage() {
  return [
    'Usage: task-fingerprint.mjs --base <sha> --scope <implementation|package>',
    '       --source <worktree|index> --manifest <path> [--observed <path>] [--repo <path>]',
    '',
    'Manifest: UTF-8, one canonical repo-relative POSIX path per line; blank lines ignored.',
    'Package mode replaces values of Markdown list fields containing "package fingerprint"',
    'with <normalized> before hashing. Deletions, symlinks, and executable mode are framed.',
    '--observed requires exact path-set equality with a Git-derived task-owned path list.',
    'Stage 06 must compare worktree and index package hashes after staging exact task paths.',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    if (flag === '--help') return { help: true };
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error(usage());
    options[flag.slice(2)] = value;
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(`${usage()}\n`);
    } else {
      process.stdout.write(`${computeFingerprint(options)}\n`);
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
