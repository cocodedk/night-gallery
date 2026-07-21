'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

NG.PUZZLES = [
  { fen:'6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1', task:'White to move — mate in 1', solution:'1. Re8#', note:'The back rank: the king’s own pawns become the walls of its prison.' },
  { fen:'6rk/6pp/8/4N3/8/8/8/7K w - - 0 1', task:'White to move — mate in 1', solution:'1. Nf7#', note:'A smothered mate — every escape square is occupied by the king’s own army.' },
  { fen:'7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qg7#', note:'The queen walks up under her king’s protection. The simplest machine in chess.' },
  { fen:'2r3k1/5ppp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe8+! Rxe8  2. Rxe8#', note:'The queen is given away to drag the defender onto the fatal square.' },
  { fen:'7k/6p1/5N2/8/8/8/8/R4K2 w - - 0 1', task:'White to move — mate in 1', solution:'1. Rh1#', note:'The Arabian mate — one of the oldest recorded patterns, from 9th-century manuscripts.' },
  { fen:'k7/8/8/8/8/8/6R1/K6R w - - 0 1', task:'White to move — mate in 2', solution:'1. Rg7 Kb8  2. Rh8#', note:'The ladder mate: one rook seals the seventh rank, the other delivers on the eighth.' },
  { fen:'6k1/5ppp/8/8/8/8/1Q6/B5K1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxg7#', note:'Battery on the long diagonal: the bishop behind makes the queen untouchable.' }
];

// Concept cards live one file per tag under js/content/ (each pushes into
// this array). content.js only initializes it so load order stays flexible.
NG.CONCEPTS = NG.CONCEPTS || [];

NG.AMBIENT_WORDS = ['stilhed', 'tænkepause', 'nightfall', 'interlude', 'ro', 'tusmørke'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLES: NG.PUZZLES, CONCEPTS: NG.CONCEPTS, AMBIENT_WORDS: NG.AMBIENT_WORDS };
}
