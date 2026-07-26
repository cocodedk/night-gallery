// Mate in 2 — set C: generated in bulk, filtered by the engine, hand-curated
// for quiet keys and pieces that only guard a square instead of striking it.
'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});
NG.PUZZLES = NG.PUZZLES || [];
NG.PUZZLES.push(
  { fen:'8/8/3K4/8/7Q/8/6pp/7k w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe4! Kg1  2. Qe1#', note:'A queen’s quiet step lands on the king’s own diagonal, pinning the one pawn that could still move and leaving a single square to stand on.' },
  { fen:'7k/3K3p/8/8/8/1R2Q3/8/8 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qe7! Kg8  2. Rb8#', note:'Nothing is threatened directly; Black simply runs out of moves that don’t open the back rank to the rook.' },
  { fen:'8/8/4R3/8/7Q/2p5/p4K2/k7 w - - 0 1', task:'White to move — mate in 2', solution:'1. Rb6! c2  2. Qh8#', note:'The rook retreats from the fight altogether, and the pawn’s forced answer clears the one diagonal the queen needed, all the way from the far corner of the board.' },
  { fen:'2KB3k/3P1p1p/8/8/8/8/8/8 w - - 0 1', task:'White to move — mate in 2', solution:'1. Bf6+! Kg8  2. d8=Q#', note:'A bishop’s check does one small job on the way past: it clears the square its own pawn needs to become a queen.' },
  { fen:'k6K/8/1p6/8/N7/2Q5/8/8 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qc7! b5  2. Nb6#', note:'A quiet queen move is all it takes to force a losing reply; a knight three squares off does the actual work of mating.' },
  { fen:'4B3/8/8/8/8/5K1p/5B1p/7k w - - 0 1', task:'White to move — mate in 2', solution:'1. Ke2! Kg2  2. Bc6#', note:'The white king had been blocking its own bishop’s diagonal; stepping off it is the whole point, and Black’s king is left with nowhere else to go.' },
  { fen:'2Q5/k7/8/p1p5/4N3/6K1/8/8 w - - 0 1', task:'White to move — mate in 2', solution:'1. Nd6! Kb6  2. Qb7#', note:'Guarding a single square is the knight’s whole contribution here: no check, no capture, and no need for either.' },
  { fen:'8/8/8/8/8/4N1pp/4Q3/3K3k w - - 0 1', task:'White to move — mate in 2', solution:'1. Qf1+! Kh2  2. Ng4#', note:'Driven back to the only square available, the king meets a knight posted at the rim of the board.' },
  { fen:'8/2B5/4B3/8/8/8/p2K4/k7 w - - 0 1', task:'White to move — mate in 2', solution:'1. Be5+! Kb1  2. Bf5#', note:'One bishop herds the king forward with a direct check, and the second, working a completely different diagonal, is the one that actually finishes it.' },
  { fen:'6K1/8/8/8/2Q5/6N1/1p6/3k4 w - - 0 1', task:'White to move — mate in 2', solution:'1. Qd3+! Kc1  2. Ne2#', note:'The check leaves the king two ways to run, and a different piece is waiting on each: the queen finishes one, the knight finishes the other.' },
  { fen:'K7/PP1q4/8/7k/8/8/8/8 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Qd5!  2. Kb8 Qd8#', note:'White’s own pawns stand one step from becoming queens, yet neither can move without laying its own king open to check.' },
  { fen:'K7/P6b/2P5/8/5k2/8/8/5r2 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Rb1!  2. c7 Be4#', note:'Only one legal move remains, and it happens to be the same move that opens the diagonal under its own king.' },
  { fen:'8/P7/KP5r/1P6/6k1/2q5/8/8 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Qf3!  2. a8=Q Qxa8#', note:'Whatever the pawn is crowned as on arrival, the new piece is captured on the spot, and mate follows regardless.' },
  { fen:'8/8/3r4/3k4/8/3n3P/7P/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Rg6!  2. h4 Nf2#', note:'A rook’s move that threatens nothing leaves White shuffling pawns, and a knight nobody was watching ends it just the same.' },
  { fen:'8/8/8/6b1/8/8/P1P5/K1k5 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Bf6+!  2. c3 Bxc3#', note:'The only way to answer the check is to block it with a pawn, and the bishop simply takes the blocker along with the king behind it.' },
  { fen:'8/8/8/8/8/b5pb/7P/3k3K b - - 0 1', task:'Black to move — mate in 2', solution:'1... g2+!  2. Kg1 Bc5#', note:'A pawn’s ordinary step forward is check enough, and it drives the king onto the one diagonal the other bishop still commands.' }
);
