// Pure square-attack detection, split out of board.mjs to keep files under
// the 200-line project cap. Only isAttacked is part of the public API
// contract (re-exported from board.mjs); the deltas/dirs are shared with
// movegen.mjs for pseudo-move generation.

export const KNIGHT_DELTAS = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];
export const KING_DELTAS = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]
];
export const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
export const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function fileOf(idx) { return idx % 8; }
function rankOf(idx) { return Math.floor(idx / 8); }
function inRange(f, r) { return f >= 0 && f < 8 && r >= 0 && r < 8; }

function slideAttacks(board, f, r, dirs, slider, queen) {
  for (const [df, dr] of dirs) {
    let nf = f + df;
    let nr = r + dr;
    while (inRange(nf, nr)) {
      const p = board[nr * 8 + nf];
      if (p) {
        if (p === slider || p === queen) { return true; }
        break;
      }
      nf += df;
      nr += dr;
    }
  }
  return false;
}

// Is square sqIndex attacked by any piece of side `bySide` ('w' | 'b')?
export function isAttacked(state, sqIndex, bySide) {
  const board = state.board;
  const f = fileOf(sqIndex);
  const r = rankOf(sqIndex);
  const isWhite = bySide === 'w';

  const pawnChar = isWhite ? 'P' : 'p';
  const pawnRank = isWhite ? r - 1 : r + 1;
  for (const df of [-1, 1]) {
    const pf = f + df;
    if (inRange(pf, pawnRank) && board[pawnRank * 8 + pf] === pawnChar) { return true; }
  }

  const knightChar = isWhite ? 'N' : 'n';
  for (const [df, dr] of KNIGHT_DELTAS) {
    const nf = f + df;
    const nr = r + dr;
    if (inRange(nf, nr) && board[nr * 8 + nf] === knightChar) { return true; }
  }

  const kingChar = isWhite ? 'K' : 'k';
  for (const [df, dr] of KING_DELTAS) {
    const nf = f + df;
    const nr = r + dr;
    if (inRange(nf, nr) && board[nr * 8 + nf] === kingChar) { return true; }
  }

  const bishopChar = isWhite ? 'B' : 'b';
  const rookChar = isWhite ? 'R' : 'r';
  const queenChar = isWhite ? 'Q' : 'q';
  if (slideAttacks(board, f, r, BISHOP_DIRS, bishopChar, queenChar)) { return true; }
  if (slideAttacks(board, f, r, ROOK_DIRS, rookChar, queenChar)) { return true; }

  return false;
}
