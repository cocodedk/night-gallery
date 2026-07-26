'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Builds one '.board' element from a FEN string, consuming NG.fenToGrid
// (fen.js) for the 8x8 layout and NG.GLYPH (fen.js) for piece glyphs.
//
// opts (all optional):
//   flip  - draw from Black's side: h1 top-left, a8 bottom-right.
//   marks - array of algebraic squares (e.g. ['e4','h8']) to flag with the
//           'mark' class on their '.sq' element.
//
// Screen position (sr, sc; both 0..7, top-to-bottom / left-to-right in DOM
// order) is decoupled from grid position (r, f into NG.fenToGrid's array)
// so flipping only changes which grid cell lands at a given screen spot,
// never the loop shape. Square color and coordinate labels are derived from
// r/f (the true rank/file), so they stay correct after flipping; the file
// row (sr===7) and rank column (sc===0) stay pinned to the same screen edge
// either way, per the existing prototype convention.
NG.buildBoard = function buildBoard(fen, opts) {
  opts = opts || {};
  const flip = !!opts.flip;
  const marks = opts.marks || [];
  const markSet = {};
  for (const name of marks) { markSet[name] = true; }

  const board = document.createElement('div');
  board.className = 'board';
  const grid = NG.fenToGrid(fen);

  for (let sr = 0; sr < 8; sr++) {
    for (let sc = 0; sc < 8; sc++) {
      const r = flip ? 7 - sr : sr;
      const f = flip ? 7 - sc : sc;
      const fileChar = 'abcdefgh'[f];
      const rankChar = String(8 - r);

      const sq = document.createElement('div');
      sq.className = 'sq ' + (((r + f) % 2 === 0) ? 'light' : 'dark');
      if (markSet[fileChar + rankChar]) { sq.classList.add('mark'); }

      const piece = grid[r][f];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'pc ' + (piece === piece.toUpperCase() ? 'w' : 'b');
        // Trailing VS15 (︎) forces text-style glyph rendering over emoji.
        span.textContent = NG.GLYPH[piece] + '︎';
        sq.appendChild(span);
      }
      if (sr === 7) {
        const file = document.createElement('span');
        file.className = 'coord file';
        file.textContent = fileChar;
        sq.appendChild(file);
      }
      if (sc === 0) {
        const rank = document.createElement('span');
        rank.className = 'coord rank';
        rank.textContent = rankChar;
        sq.appendChild(rank);
      }
      board.appendChild(sq);
    }
  }
  return board;
};
