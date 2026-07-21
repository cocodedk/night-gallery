import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { PUZZLES, CONCEPTS, AMBIENT_WORDS } = require('../tizen/js/content.js');
const { fenToGrid } = require('../tizen/js/fen.js');

// Tag files push into the CONCEPTS array exported above.
const contentDir = fileURLToPath(new URL('../tizen/js/content/', import.meta.url));
for (const f of readdirSync(contentDir).sort()) {
  if (f.endsWith('.js')) { require(path.join(contentDir, f)); }
}

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

// --- counts ---
const EXPECTED_TAGS = {
  Chess: 50, Dansk: 60, Design: 30, Electronics: 50, Geography: 45,
  History: 25, Latin: 35, Math: 45, Physics: 35, Security: 50,
  'Sun Tzu': 25, Systems: 50, Thinking: 50
};
const EXPECTED_TOTAL = Object.values(EXPECTED_TAGS).reduce((a, b) => a + b, 0);
check(Array.isArray(PUZZLES) && PUZZLES.length === 7, 'PUZZLES has 7 entries');
check(Array.isArray(CONCEPTS) && CONCEPTS.length === EXPECTED_TOTAL, `CONCEPTS has ${EXPECTED_TOTAL} entries (got ${CONCEPTS.length})`);
check(Array.isArray(AMBIENT_WORDS) && AMBIENT_WORDS.length === 6, 'AMBIENT_WORDS has 6 entries');

const tally = {};
for (const c of CONCEPTS) { tally[c.tag] = (tally[c.tag] || 0) + 1; }
for (const [tag, count] of Object.entries(EXPECTED_TAGS)) {
  check(tally[tag] === count, `tag '${tag}' has ${count} cards (got ${tally[tag]})`);
}
for (const tag of Object.keys(tally)) {
  check(tag in EXPECTED_TAGS, `tag '${tag}' is a known tag`);
}

// --- global title uniqueness (cross-file dedupe gate) ---
const seen = new Set();
for (const c of CONCEPTS) {
  check(!seen.has(c.title), `duplicate concept title: '${c.title}'`);
  seen.add(c.title);
}

// --- puzzles ---
for (const [i, p] of PUZZLES.entries()) {
  check(typeof p.fen === 'string' && p.fen.length > 0, `puzzle[${i}].fen is non-empty string`);
  check(typeof p.task === 'string' && p.task.length > 0, `puzzle[${i}].task is non-empty string`);
  check(typeof p.solution === 'string' && p.solution.length > 0, `puzzle[${i}].solution is non-empty string`);
  check(typeof p.note === 'string' && p.note.length > 0, `puzzle[${i}].note is non-empty string`);

  const grid = fenToGrid(p.fen);
  check(Array.isArray(grid) && grid.length === 8, `puzzle[${i}] grid has 8 rows`);
  for (const [r, row] of grid.entries()) {
    check(Array.isArray(row) && row.length === 8, `puzzle[${i}] row ${r} has 8 cells`);
  }

  let kings = 0;
  let blackKings = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === 'K') { kings++; }
      if (cell === 'k') { blackKings++; }
    }
  }
  check(kings === 1, `puzzle[${i}] has exactly one 'K'`);
  check(blackKings === 1, `puzzle[${i}] has exactly one 'k'`);

  const fields = p.fen.split(' ');
  check(fields.length >= 2 && fields[1] === 'w', `puzzle[${i}] side-to-move field is 'w'`);
}

// --- concepts (structure) ---
for (const [i, c] of CONCEPTS.entries()) {
  check(typeof c.tag === 'string' && c.tag.length > 0, `concept[${i}].tag is non-empty string`);
  check(typeof c.title === 'string' && c.title.length > 0, `concept[${i}].title is non-empty string`);
  check(typeof c.body === 'string' && c.body.length > 0, `concept[${i}].body is non-empty string`);
}

// --- ambient words ---
for (const [i, w] of AMBIENT_WORDS.entries()) {
  check(typeof w === 'string' && w.length > 0, `ambient word[${i}] is non-empty string`);
}

console.log(`ok content.test.mjs (${n} assertions)`);
