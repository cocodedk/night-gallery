// Mate in 2 — set A.
'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});
NG.PUZZLES = NG.PUZZLES || [];
NG.PUZZLES.push(
  { fen:'2r3k1/5ppp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe8+! Rxe8  2. Rxe8#', note:'The queen is given away to drag the defender onto the fatal square.' },
  { fen:'k7/6p1/8/8/8/8/6R1/2K4R w - - 0 1', task:'White to move — mate in 2', solution:'1. Rxg7! Kb8  2. Rh8#', note:'The ladder mate: one rook seals the seventh rank while the other delivers on the eighth, a lone pawn swept aside to keep the rungs clear.' },
  { fen:'5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qg8+! Rxg8  2. Nf7#', note:'Philidor’s Legacy: the queen dies so the knight can finish a king smothered by its own rook and pawns.' },
  { fen:'6k1/3b1ppp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe8+! Bxe8  2. Rxe8#', note:'The bishop watches the mating square from a distance; drawn in to capture, it only clears the rank for the rook behind it.' },
  { fen:'7k/5ppp/8/6P1/7Q/8/8/K7 w - - 0 1', task:'White to move — mate in 2', solution:'1. g6! f6  2. Qxh7#', note:'Damiano’s mate: a pawn quietly steps up to guard the queen’s arrival, and the corner has nowhere left to hide.' },
  { fen:'6k1/5ppp/2q5/8/8/4Q3/5PPP/4R1K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe8+! Qxe8  2. Rxe8#', note:'Not even the enemy queen is spared the same bait; trading down leaves only the rook’s recapture, and mate.' },
  { fen:'6k1/5ppp/3n4/8/8/4Q3/5PPP/4R1K1 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe8+! Nxe8  2. Rxe8#', note:'The knight is the only defender close enough to intervene, and the only one that cannot also hold a rank once it lands.' },
  { fen:'7k/6p1/4K3/8/8/8/8/R7 w - - 0 1', task:'White to move — mate in 2', solution:'1. Kf7! Kh7  2. Rh1#', note:'No check, no capture: the king only edges one square closer, and the last open door turns out to be a corridor the rook has owned all along.' },
  { fen:'r7/8/8/8/8/4k3/6P1/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Kf2!  2. Kh2 Rh8#', note:'Black needs no threat at all: one unhurried step by the king leaves White a single square to shuffle into before the rook seals the file.' },
  { fen:'6k1/8/8/8/3q4/7n/6PP/5R1K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Qg1+!  2. Rxg1 Nf2#', note:'A queen offered at the rook’s own door, so a knight tucked in the corner can finish a king with no escape of its own making.' },
  { fen:'k7/8/8/7q/6p1/8/5PPP/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... g3!  2. h3 Qd1#', note:'One pawn slides forward in silence, and a king already crowded by its own men finds the last gap closed.' },
  { fen:'4r1k1/5ppp/4q3/8/8/3N4/5PPP/6K1 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Qe1+!  2. Nxe1 Rxe1#', note:'Only the knight can reach the rescue square in time, and having reached it, cannot also guard the rank it just gave up.' },
  { fen:'4r1k1/5ppp/4q3/8/8/2Q5/5PPP/6K1 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Qe1+!  2. Qxe1 Rxe1#', note:'Two queens leave the board in a single exchange, and what remains is exactly enough material to mate.' }
);
