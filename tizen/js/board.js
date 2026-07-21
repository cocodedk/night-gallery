'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Builds one '.board' element from a FEN string, consuming NG.fenToGrid
// (fen.js) for the 8x8 layout and NG.GLYPH (fen.js) for piece glyphs.
NG.buildBoard = function buildBoard(fen) {
  const board = document.createElement('div');
  board.className = 'board';
  const grid = NG.fenToGrid(fen);

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = document.createElement('div');
      sq.className = 'sq ' + (((r + f) % 2 === 0) ? 'light' : 'dark');

      const piece = grid[r][f];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'pc ' + (piece === piece.toUpperCase() ? 'w' : 'b');
        // Trailing VS15 (︎) forces text-style glyph rendering over emoji.
        span.textContent = NG.GLYPH[piece] + '︎';
        sq.appendChild(span);
      }
      if (r === 7) {
        const file = document.createElement('span');
        file.className = 'coord file';
        file.textContent = 'abcdefgh'[f];
        sq.appendChild(file);
      }
      if (f === 0) {
        const rank = document.createElement('span');
        rank.className = 'coord rank';
        rank.textContent = String(8 - r);
        sq.appendChild(rank);
      }
      board.appendChild(sq);
    }
  }
  return board;
};
