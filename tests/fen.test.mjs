import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { GLYPH, fenToGrid } = require('../tizen/js/fen.js');

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

// --- known fen ---
const fen = '6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1';
const grid = fenToGrid(fen);

check(Array.isArray(grid) && grid.length === 8, 'grid has 8 rows');
for (const [r, row] of grid.entries()) {
  check(Array.isArray(row) && row.length === 8, `row ${r} has 8 cells`);
}

check(grid[0][6] === 'k', "grid[0][6] === 'k'");
check(grid[1][5] === 'p', "grid[1][5] === 'p'");
check(grid[7][4] === 'R', "grid[7][4] === 'R'");
check(grid[7][7] === 'K', "grid[7][7] === 'K'");

// empty squares are null
const emptyCoords = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 7],
  [1, 0], [1, 1], [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7]
];
for (const [r, f] of emptyCoords) {
  check(grid[r][f] === null, `grid[${r}][${f}] is null (empty square)`);
}

// row 2 through 6 are fully empty (all '8')
for (let r = 2; r <= 6; r++) {
  check(
    grid[r].every((cell) => cell === null),
    `row ${r} is entirely empty`
  );
}

// row 7 layout: 4 empty, R, 2 empty, K
check(
  JSON.stringify(grid[7]) === JSON.stringify([null, null, null, null, 'R', null, null, 'K']),
  'row 7 matches expected layout'
);

// row 0 layout: 6 empty, k, 1 empty
check(
  JSON.stringify(grid[0]) === JSON.stringify([null, null, null, null, null, null, 'k', null]),
  'row 0 matches expected layout'
);

// row 1 layout: 5 empty, p, p, p
check(
  JSON.stringify(grid[1]) === JSON.stringify([null, null, null, null, null, 'p', 'p', 'p']),
  'row 1 matches expected layout'
);

// --- GLYPH ---
check(Object.keys(GLYPH).length === 12, 'GLYPH has 12 entries');
check(GLYPH.K === '♔', "GLYPH.K === '♔'");
check(GLYPH.Q === '♕', "GLYPH.Q === '♕'");
check(GLYPH.R === '♖', "GLYPH.R === '♖'");
check(GLYPH.B === '♗', "GLYPH.B === '♗'");
check(GLYPH.N === '♘', "GLYPH.N === '♘'");
check(GLYPH.P === '♙', "GLYPH.P === '♙'");
check(GLYPH.k === '♚', "GLYPH.k === '♚'");
check(GLYPH.q === '♛', "GLYPH.q === '♛'");
check(GLYPH.r === '♜', "GLYPH.r === '♜'");
check(GLYPH.b === '♝', "GLYPH.b === '♝'");
check(GLYPH.n === '♞', "GLYPH.n === '♞'");
check(GLYPH.p === '♟', "GLYPH.p === '♟'");

// --- fen ignores fields after placement (only first field matters) ---
const gridIgnoresTail = fenToGrid('8/8/8/8/8/8/8/8 b KQkq e3 0 1');
check(
  gridIgnoresTail.every((row) => row.every((cell) => cell === null)),
  'fenToGrid only parses the placement field, ignoring the rest'
);

console.log(`ok fen.test.mjs (${n} assertions)`);
