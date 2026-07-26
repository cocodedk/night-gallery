// Board representation, FEN <-> state, and move application.
// State shape: { board: Array(64) of piece-char|null, side: 'w'|'b',
//                castling: subset-string of 'KQkq' ('' = none),
//                ep: 'e3'-style square|null, halfmove, fullmove }
// Square index 0 = a1, 7 = h1, 56 = a8, 63 = h8 (index = rank*8 + file).
import { isAttacked } from './attacks.mjs';

export { isAttacked };

const FILES = 'abcdefgh';

export function squareToIndex(sq) {
  const file = FILES.indexOf(sq[0]);
  const rank = Number(sq[1]) - 1;
  return rank * 8 + file;
}

export function indexToSquare(idx) {
  const file = idx % 8;
  const rank = Math.floor(idx / 8);
  return FILES[file] + String(rank + 1);
}

export function parseFen(fen) {
  if (typeof fen !== 'string' || !fen.trim()) {
    throw new Error(`malformed FEN (empty or not a string): ${fen}`);
  }
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) { throw new Error(`malformed FEN (need >=4 fields): ${fen}`); }
  const [placement, sideStr, castling, epStr, halfmoveStr, fullmoveStr] = parts;
  const rows = placement.split('/');
  if (rows.length !== 8) { throw new Error(`malformed FEN (need 8 ranks): ${fen}`); }

  const board = new Array(64).fill(null);
  for (let r = 0; r < 8; r++) {
    const rank = 8 - r;
    let file = 0;
    for (const ch of rows[r]) {
      if (/[1-8]/.test(ch)) {
        file += Number(ch);
      } else if (/[pnbrqkPNBRQK]/.test(ch)) {
        if (file > 7) { throw new Error(`malformed FEN (rank overflow): ${fen}`); }
        board[(rank - 1) * 8 + file] = ch;
        file++;
      } else {
        throw new Error(`malformed FEN (bad piece char '${ch}'): ${fen}`);
      }
    }
    if (file !== 8) { throw new Error(`malformed FEN (rank ${rank} wrong length): ${fen}`); }
  }

  if (sideStr !== 'w' && sideStr !== 'b') { throw new Error(`malformed FEN (side-to-move): ${fen}`); }
  if (!/^(-|K?Q?k?q?)$/.test(castling) || castling === '') {
    if (castling !== '-') { throw new Error(`malformed FEN (castling field): ${fen}`); }
  }
  let ep = null;
  if (epStr !== '-') {
    if (!/^[a-h][36]$/.test(epStr)) { throw new Error(`malformed FEN (en-passant square): ${fen}`); }
    ep = epStr;
  }
  const halfmove = halfmoveStr === undefined ? 0 : Number(halfmoveStr);
  const fullmove = fullmoveStr === undefined ? 1 : Number(fullmoveStr);
  if (!Number.isInteger(halfmove) || halfmove < 0) { throw new Error(`malformed FEN (halfmove clock): ${fen}`); }
  if (!Number.isInteger(fullmove) || fullmove < 1) { throw new Error(`malformed FEN (fullmove number): ${fen}`); }

  return { board, side: sideStr, castling: castling === '-' ? '' : castling, ep, halfmove, fullmove };
}

export function toFen(state) {
  let placement = '';
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    let row = '';
    for (let file = 0; file < 8; file++) {
      const p = state.board[(rank - 1) * 8 + file];
      if (p === null) {
        empty++;
      } else {
        if (empty) { row += empty; empty = 0; }
        row += p;
      }
    }
    if (empty) { row += empty; }
    placement += row + (rank > 1 ? '/' : '');
  }
  const castling = state.castling === '' ? '-' : state.castling;
  const ep = state.ep || '-';
  return `${placement} ${state.side} ${castling} ${ep} ${state.halfmove} ${state.fullmove}`;
}

export function inCheck(state, side) {
  const kingChar = side === 'w' ? 'K' : 'k';
  const kingIdx = state.board.indexOf(kingChar);
  return isAttacked(state, kingIdx, side === 'w' ? 'b' : 'w');
}

function updateCastlingRights(castling, from, to, movingPiece) {
  let rights = castling;
  if (movingPiece === 'K') { rights = rights.replace('K', '').replace('Q', ''); }
  if (movingPiece === 'k') { rights = rights.replace('k', '').replace('q', ''); }
  if (from === 0 || to === 0) { rights = rights.replace('Q', ''); }
  if (from === 7 || to === 7) { rights = rights.replace('K', ''); }
  if (from === 56 || to === 56) { rights = rights.replace('q', ''); }
  if (from === 63 || to === 63) { rights = rights.replace('k', ''); }
  return rights;
}

// Returns a NEW state; never mutates `state`.
export function makeMove(state, move) {
  const board = state.board.slice();
  const { from, to, promo, flags } = move;
  const movingPiece = board[from];
  const white = state.side === 'w';

  if (flags && flags.ep) {
    board[white ? to - 8 : to + 8] = null;
  }

  const halfmove = (move.capture || movingPiece.toUpperCase() === 'P') ? 0 : state.halfmove + 1;

  board[from] = null;
  board[to] = promo ? (white ? promo.toUpperCase() : promo.toLowerCase()) : movingPiece;

  if (flags && flags.castle === 'k') {
    if (white) { board[7] = null; board[5] = 'R'; } else { board[63] = null; board[61] = 'r'; }
  } else if (flags && flags.castle === 'q') {
    if (white) { board[0] = null; board[3] = 'R'; } else { board[56] = null; board[59] = 'r'; }
  }

  const castling = updateCastlingRights(state.castling, from, to, movingPiece);
  const ep = (flags && flags.double) ? indexToSquare(white ? from + 8 : from - 8) : null;
  const side = white ? 'b' : 'w';
  const fullmove = white ? state.fullmove : state.fullmove + 1;

  return { board, side, castling, ep, halfmove, fullmove };
}
