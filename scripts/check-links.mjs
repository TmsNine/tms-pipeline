// Zero-dependency relative-link checker for the docs. Scans every tracked .md file for
// [text](target) links, ignores external (http/https/mailto) and pure-anchor (#…) links,
// and asserts the local target exists (anchor part stripped). Exits 1 on any broken link.
//
// Run: node scripts/check-links.mjs

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), acc);
    } else if (entry.name.endsWith('.md')) {
      acc.push(join(dir, entry.name));
    }
  }
  return acc;
}

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
const broken = [];

for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(LINK_RE)) {
    let target = m[1].trim();
    if (!target || /^(https?:|mailto:|#)/.test(target)) continue; // external or pure-anchor
    target = target.split('#')[0]; // drop in-page anchor
    if (!target) continue;
    const resolved = resolve(dirname(file), target);
    if (!existsSync(resolved)) {
      broken.push(`${relative(ROOT, file)} → ${m[1]}`);
    }
  }
}

if (broken.length) {
  console.error(`Broken relative links (${broken.length}):`);
  for (const b of broken) console.error('  ✖ ' + b);
  process.exit(1);
}
console.log('All relative markdown links resolve. ✓');
