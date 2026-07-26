// Proves the test-only chess engine itself, before it is trusted to gate
// puzzle content in chess.test.mjs. perft is the standard movegen proof;
// the mate/stalemate cases prove keyMoves' search semantics.
import assert from 'node:assert/strict';
import { parseFen, makeMove } from './chess/board.mjs';
import { legalMoves } from './chess/movegen.mjs';
import { parseSan, moveToSan } from './chess/san.mjs';
import { isCheckmate, isStalemate, keyMoves } from './chess/mate.mjs';

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

function perft(state, depth) {
  if (depth === 0) { return 1; }
  let nodes = 0;
  for (const m of legalMoves(state)) { nodes += perft(makeMove(state, m), depth - 1); }
  return nodes;
}

// --- perft: the standard movegen correctness proof ---
const PERFT_CASES = [
  ['startpos', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', [20, 400, 8902, 197281]],
  ['kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['position3', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]]
];
for (const [name, fen, expected] of PERFT_CASES) {
  const state = parseFen(fen);
  expected.forEach((want, i) => {
    const depth = i + 1;
    check(perft(state, depth) === want, `perft ${name} depth ${depth} === ${want} (got ${perft(state, depth)})`);
  });
}

// --- known mates: exactly one key move each ---
const m1 = parseFen('6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1'); // mate in 1: Re8#
const keys1 = keyMoves(m1, 1);
check(keys1.length === 1, `mate-in-1 has exactly one key (got ${keys1.length})`);
check(moveToSan(m1, keys1[0]) === 'Re8#', `mate-in-1 key is Re8# (got ${moveToSan(m1, keys1[0])})`);

const m2 = parseFen('2r3k1/5ppp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1'); // mate in 2: Qe8+! Rxe8 Rxe8#
const keys2 = keyMoves(m2, 2);
check(keys2.length === 1, `mate-in-2 has exactly one key (got ${keys2.length})`);
check(moveToSan(m2, keys2[0]) === 'Qe8+', `mate-in-2 key is Qe8+ (got ${moveToSan(m2, keys2[0])})`);

// mate in 3: the smothered mate (Philidor's Legacy) — Nh6+ Kh8 Qg8+ Rxg8 Nf7#
const m3 = parseFen('5rk1/5Npp/8/3Q4/8/8/8/6K1 w - - 0 1');
const keys3 = keyMoves(m3, 3);
check(keys3.length === 1, `mate-in-3 has exactly one key (got ${keys3.length})`);
check(moveToSan(m3, keys3[0]) === 'Nh6+', `mate-in-3 key is Nh6+ (got ${moveToSan(m3, keys3[0])})`);
check(keyMoves(m3, 2).length === 0, 'mate-in-3 position is not secretly mate in 2');

// --- negative cases ---
const stale = parseFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
check(isStalemate(stale) === true, 'stalemate position is a stalemate');
check(isCheckmate(stale) === false, 'a stalemate position is not checkmate');

const dual = parseFen('7k/6pp/8/8/8/8/8/RR4K1 w - - 0 1'); // two rooks, two mating first moves
const dualKeys = keyMoves(dual, 1);
check(dualKeys.length === 2, `position with two mating tries returns 2 keys (got ${dualKeys.length})`);

check(parseSan(m1, 'Qh8') === null, 'parseSan returns null for an illegal token');
check(parseSan(m1, 'Zz9') === null, 'parseSan returns null for a nonsense token');

// promotion + en-passant: generated and parseable
const promoState = parseFen('8/P7/8/8/8/8/8/k6K w - - 0 1');
const promoMoves = legalMoves(promoState).filter((m) => m.promo);
check(promoMoves.length === 4, `promotion generates all 4 piece choices (got ${promoMoves.length})`);
const promoQueen = promoState && parseSan(promoState, 'a8=Q');
check(promoQueen !== null && promoQueen.promo === 'Q', 'parseSan parses a promotion move');

const epState = parseFen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2');
const epMoves = legalMoves(epState).filter((m) => m.flags && m.flags.ep);
check(epMoves.length === 1, `en-passant capture is generated (got ${epMoves.length})`);
const epParsed = parseSan(epState, 'exd6');
check(epParsed !== null && epParsed.flags.ep === true, 'parseSan parses an en-passant capture');

console.log(`ok chess-engine.test.mjs (${n} assertions)`);
