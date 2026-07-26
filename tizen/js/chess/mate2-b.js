// Mate in 2 — set B: batteries, checks that can't be parried, and the long walk.
'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});
NG.PUZZLES = NG.PUZZLES || [];
NG.PUZZLES.push(
  { fen:'2n4k/5ppp/8/8/3B4/8/8/QK1R4 w - - 0 1', task:'White to move — mate in 2', solution:'1. Bxg7+! Kg8  2. Rd8#', note:'The queen and bishop share a diagonal: the bishop can plunge into the pawn shield only because the queen guards the square from behind.' },
  { fen:'7k/5p1p/8/4N3/8/8/8/QK1R4 w - - 0 1', task:'White to move — mate in 2', solution:'1. Ng6+! Kg8  2. Rd8#', note:'A double check: knight and queen strike at once, and the king cannot block two lines with one move.' },
  { fen:'7k/5p1p/5N2/8/8/8/8/Q2RK3 w - - 0 1', task:'White to move — mate in 2', solution:'1. Nh5+! Kg8  2. Rd8#', note:'A discovered check: the knight steps aside to the rim, but the queen’s diagonal behind it was the real threat all along.' },
  { fen:'7k/3P1p1p/8/4N3/8/8/8/QK6 w - - 0 1', task:'White to move — mate in 2', solution:'1. Ng6+! Kg8  2. d8=Q#', note:'A pawn one square from queening turns the whole game the instant the king is driven onto its diagonal.' },
  { fen:'k7/1p6/8/K6R/8/8/8/8 w - - 0 1', task:'White to move — mate in 2', solution:'1. Kb6! Kb8  2. Rh8#', note:'The attacking king advances to seal the last escape square, leaving the rook a clear road down the rank.' },
  { fen:'k5n1/ppp5/8/8/4B3/8/8/4R1KQ w - - 0 1', task:'White to move — mate in 2', solution:'1. Bxb7+! Kb8  2. Re8#', note:'Every flight square was already spoken for; the bishop simply closes the last one, a move too late to be a stalemate.' },
  { fen:'6rk/6pp/6p1/8/Q7/8/8/1K5R w - - 0 1', task:'White to move — mate in 2', solution:'1. Rxh7+! Kxh7  2. Qh4#', note:'The rook sacrifices itself to tear the roof off the king’s shelter, and the queen simply walks in through the hole.' },
  { fen:'8/8/8/8/k6r/8/1P6/K7 b - - 0 1', task:'Black to move — mate in 2', solution:'1... Kb3! Kb1  2... Rh1#', note:'A cornered king falls to two minor forces working together: the king seals the last flight, the rook does the rest.' },
  { fen:'1k5r/8/8/q7/8/6P1/6PP/6RK b - - 0 1', task:'Black to move — mate in 2', solution:'1... Rxh2+! Kxh2  2... Qh5#', note:'The rook throws itself onto the shield pawn, and the queen collects on the file that opens behind it.' },
  { fen:'q2rk3/8/8/8/8/5n2/5P1P/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Nh4+! Kg1  2... Rd1#', note:'The knight ambles off toward the rim, unremarkable in itself. The queen’s own diagonal, silent until now, was the real attacker.' },
  { fen:'qk6/8/8/8/4n3/8/3p1P1P/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Ng3+! Kg1  2... d1=Q#', note:'One pace from the back rank, a pawn becomes the piece that ends the game the instant the king is driven onto its line.' },
  { fen:'qk1r4/8/8/8/4n3/8/5P1P/7K b - - 0 1', task:'Black to move — mate in 2', solution:'1... Ng3+! Kg1  2... Rd1#', note:'Two attackers land on the same move; capturing one still leaves the other, so the only answer left is to run.' }
);
