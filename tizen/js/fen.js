'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

NG.GLYPH = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

// Parses only the placement field (before the first space) of a FEN string
// into an 8x8 grid of rows, each entry a piece letter (KQRBNP/kqrbnp) or null.
NG.fenToGrid = function fenToGrid(fen) {
  const rows = fen.split(' ')[0].split('/');
  const grid = [];
  for (let r = 0; r < 8; r++) {
    const cells = [];
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < +ch; i++) { cells.push(null); }
      } else {
        cells.push(ch);
      }
    }
    grid.push(cells);
  }
  return grid;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GLYPH: NG.GLYPH, fenToGrid: NG.fenToGrid };
}
