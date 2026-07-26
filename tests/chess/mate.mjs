// Checkmate/stalemate detection and mate-in-N key-move search.
import { toFen, makeMove, inCheck } from './board.mjs';
import { legalMoves } from './movegen.mjs';

export function isCheckmate(state) {
  return inCheck(state, state.side) && legalMoves(state).length === 0;
}

export function isStalemate(state) {
  return !inCheck(state, state.side) && legalMoves(state).length === 0;
}

// Precomputes { m, next, check, capture } for every legal move, ordered
// checks-first then captures-first, so mate search hits refutations early.
function orderedMoves(state) {
  const scored = legalMoves(state).map((m) => {
    const next = makeMove(state, m);
    return { m, next, check: inCheck(next, next.side), capture: Boolean(m.capture) };
  });
  scored.sort((a, b) => {
    if (a.check !== b.check) { return a.check ? -1 : 1; }
    if (a.capture !== b.capture) { return a.capture ? -1 : 1; }
    return 0;
  });
  return scored;
}

// Moves by which the side to move forces mate in AT MOST n of its own
// moves. A move m is a key when, after m, the opponent is checkmated, or
// every opponent reply still leaves a key for n-1. Exhaustive (no
// alpha-beta) so dual/cook detection is exact; opts.nodeCap bounds runaway
// searches on non-sparse positions.
export function keyMoves(state, n, opts = {}) {
  const nodeCap = opts.nodeCap ?? 2_000_000;
  const rootFen = toFen(state);
  let nodes = 0;
  function tick() {
    nodes++;
    if (nodes > nodeCap) {
      throw new RangeError(`keyMoves: node cap (${nodeCap}) exceeded searching mate-in-${n} for FEN: ${rootFen}`);
    }
  }

  function search(s, depth) {
    if (depth < 1) { return []; }
    const keys = [];
    for (const { m, next: afterM } of orderedMoves(s)) {
      tick();
      if (isCheckmate(afterM)) { keys.push(m); continue; }
      if (depth === 1) { continue; }
      if (isStalemate(afterM)) { continue; }
      let allGood = true;
      for (const { next: afterReply } of orderedMoves(afterM)) {
        tick();
        if (search(afterReply, depth - 1).length === 0) { allGood = false; break; }
      }
      if (allGood) { keys.push(m); }
    }
    return keys;
  }

  return search(state, n);
}
