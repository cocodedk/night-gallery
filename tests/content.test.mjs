import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PUZZLES, CONCEPTS, AMBIENT_WORDS } = require('../tizen/js/content.js');
const { fenToGrid } = require('../tizen/js/fen.js');

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

// --- counts ---
check(Array.isArray(PUZZLES) && PUZZLES.length === 7, 'PUZZLES has 7 entries');
check(Array.isArray(CONCEPTS) && CONCEPTS.length === 17, 'CONCEPTS has 17 entries');
check(Array.isArray(AMBIENT_WORDS) && AMBIENT_WORDS.length === 5, 'AMBIENT_WORDS has 5 entries');

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

// --- concepts ---
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
