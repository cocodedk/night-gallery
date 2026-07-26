// Pseudo-legal move generation + legality filter (make-move-then-check).
import { squareToIndex, makeMove, inCheck, isAttacked } from './board.mjs';
import { KNIGHT_DELTAS, KING_DELTAS, BISHOP_DIRS, ROOK_DIRS } from './attacks.mjs';

function fileOf(idx) { return idx % 8; }
function rankOf(idx) { return Math.floor(idx / 8); }
function inRange(f, r) { return f >= 0 && f < 8 && r >= 0 && r < 8; }
const PROMOS = ['Q', 'R', 'B', 'N'];

function pushPawn(moves, from, to, capture, promoteRank) {
  const nr = rankOf(to);
  if (nr === promoteRank) {
    for (const promo of PROMOS) { moves.push({ from, to, piece: 'P', capture, promo, flags: {} }); }
  } else {
    moves.push({ from, to, piece: 'P', capture, promo: null, flags: {} });
  }
}

function pawnMoves(state, idx, moves) {
  const white = state.side === 'w';
  const board = state.board;
  const f = fileOf(idx);
  const r = rankOf(idx);
  const dir = white ? 1 : -1;
  const startRank = white ? 1 : 6;
  const promoteRank = white ? 7 : 0;
  const oneIdx = (r + dir) * 8 + f;

  if (board[oneIdx] === null) {
    pushPawn(moves, idx, oneIdx, false, promoteRank);
    if (r === startRank && board[(r + 2 * dir) * 8 + f] === null) {
      moves.push({ from: idx, to: (r + 2 * dir) * 8 + f, piece: 'P', capture: false, promo: null, flags: { double: true } });
    }
  }
  const opp = white ? /[a-z]/ : /[A-Z]/;
  for (const df of [-1, 1]) {
    const nf = f + df;
    const nr = r + dir;
    if (!inRange(nf, nr)) { continue; }
    const targetIdx = nr * 8 + nf;
    const targetSq = board[targetIdx];
    if (targetSq && opp.test(targetSq)) {
      pushPawn(moves, idx, targetIdx, true, promoteRank);
    } else if (state.ep && squareToIndex(state.ep) === targetIdx) {
      moves.push({ from: idx, to: targetIdx, piece: 'P', capture: true, promo: null, flags: { ep: true } });
    }
  }
}

function stepMoves(state, idx, deltas, pieceLetter, moves) {
  const board = state.board;
  const own = state.side === 'w' ? /[A-Z]/ : /[a-z]/;
  const f = fileOf(idx);
  const r = rankOf(idx);
  for (const [df, dr] of deltas) {
    const nf = f + df;
    const nr = r + dr;
    if (!inRange(nf, nr)) { continue; }
    const targetIdx = nr * 8 + nf;
    const target = board[targetIdx];
    if (target && own.test(target)) { continue; }
    moves.push({ from: idx, to: targetIdx, piece: pieceLetter, capture: Boolean(target), promo: null, flags: {} });
  }
}

function slideMoves(state, idx, dirs, pieceLetter, moves) {
  const board = state.board;
  const own = state.side === 'w' ? /[A-Z]/ : /[a-z]/;
  const f = fileOf(idx);
  const r = rankOf(idx);
  for (const [df, dr] of dirs) {
    let nf = f + df;
    let nr = r + dr;
    while (inRange(nf, nr)) {
      const targetIdx = nr * 8 + nf;
      const target = board[targetIdx];
      if (target && own.test(target)) { break; }
      moves.push({ from: idx, to: targetIdx, piece: pieceLetter, capture: Boolean(target), promo: null, flags: {} });
      if (target) { break; }
      nf += df;
      nr += dr;
    }
  }
}

function castleMoves(state, kingIdx, moves) {
  const white = state.side === 'w';
  const rights = state.castling;
  const board = state.board;
  const oppSide = white ? 'b' : 'w';
  const rank0 = white ? 0 : 56;
  if (rights.includes(white ? 'K' : 'k')) {
    const empty = board[rank0 + 5] === null && board[rank0 + 6] === null;
    const safe = [rank0 + 4, rank0 + 5, rank0 + 6].every((sq) => !isAttacked(state, sq, oppSide));
    if (empty && safe) {
      moves.push({ from: kingIdx, to: rank0 + 6, piece: 'K', capture: false, promo: null, flags: { castle: 'k' } });
    }
  }
  if (rights.includes(white ? 'Q' : 'q')) {
    const empty = board[rank0 + 1] === null && board[rank0 + 2] === null && board[rank0 + 3] === null;
    const safe = [rank0 + 4, rank0 + 3, rank0 + 2].every((sq) => !isAttacked(state, sq, oppSide));
    if (empty && safe) {
      moves.push({ from: kingIdx, to: rank0 + 2, piece: 'K', capture: false, promo: null, flags: { castle: 'q' } });
    }
  }
}

function pseudoMoves(state) {
  const board = state.board;
  const own = state.side === 'w' ? /[A-Z]/ : /[a-z]/;
  const moves = [];
  for (let idx = 0; idx < 64; idx++) {
    const p = board[idx];
    if (!p || !own.test(p)) { continue; }
    const type = p.toUpperCase();
    if (type === 'P') { pawnMoves(state, idx, moves); }
    else if (type === 'N') { stepMoves(state, idx, KNIGHT_DELTAS, 'N', moves); }
    else if (type === 'B') { slideMoves(state, idx, BISHOP_DIRS, 'B', moves); }
    else if (type === 'R') { slideMoves(state, idx, ROOK_DIRS, 'R', moves); }
    else if (type === 'Q') {
      slideMoves(state, idx, BISHOP_DIRS, 'Q', moves);
      slideMoves(state, idx, ROOK_DIRS, 'Q', moves);
    } else if (type === 'K') {
      stepMoves(state, idx, KING_DELTAS, 'K', moves);
      castleMoves(state, idx, moves);
    }
  }
  return moves;
}

export function legalMoves(state) {
  const legal = [];
  for (const m of pseudoMoves(state)) {
    if (!inCheck(makeMove(state, m), state.side)) { legal.push(m); }
  }
  return legal;
}
