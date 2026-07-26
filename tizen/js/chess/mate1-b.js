// Mate in 1 — set B: queen & knight, bishop pair, rook lifts and kill boxes,
// promotions, double checks, Légal/Lolli/Blackburne patterns, opposition.
'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});
NG.PUZZLES = NG.PUZZLES || [];
NG.PUZZLES.push(
  { fen:'6k1/5ppp/4N2Q/8/8/8/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxg7#', note:'The knight never gives check here: its only task is guarding the square so the king cannot simply take the queen.' },
  { fen:'1K6/PPP5/q2n4/8/8/8/8/7k b - - 0 1', task:'Black to move — mate in 1', solution:'1... Qxb7#', note:'Three pawns that never left home become the walls of a cell, and the only guard the king needed was a knight two squares away.' },
  { fen:'7k/7p/1B6/3B4/8/8/8/7K w - - 0 1', task:'White to move — mate in 1', solution:'1. Bd4#', note:'The bishop pair splits the work of a mating net: one watches the king’s escape route from a distance, the other travels the long diagonal to strike.' },
  { fen:'6K1/8/8/p7/k7/p7/8/1R5R w - - 0 1', task:'White to move — mate in 1', solution:'1. Rh4#', note:'The rook lift: a piece parked on the back rank climbs the file until it finds the one rank that closes the kill box.' },
  { fen:'7k/5P1p/8/8/8/8/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. f8=Q#', note:'A pawn completes its long walk to the last rank and steps off as a queen, commanding a rank and a diagonal at once. A rook alone could not have managed it.' },
  { fen:'6R1/5Ppk/7p/8/8/1B6/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. f8=N#', note:'An underpromotion jewel: only a knight’s odd leap reaches the mating square, since a new-made queen or rook would not even give check.' },
  { fen:'7k/7p/6p1/4R3/8/8/1B6/7K w - - 0 1', task:'White to move — mate in 1', solution:'1. Re8#', note:'Double check: a rook’s line and a bishop’s diagonal land on the king in the same instant, and capturing one attacker is no answer when the other remains.' },
  { fen:'7k/6pr/8/8/5N2/1B6/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Ng6#', note:'The point of Légal’s trap: material given up along the way counts for nothing if a knight, propped up by a bishop, is left free to finish the king alone.' },
  { fen:'7k/7p/6P1/8/8/8/8/K6Q w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxh7#', note:'Lolli’s mate: one advanced pawn does two jobs at once, sealing an escape square and shielding the queen that lands beside the king.' },
  { fen:'7k/7p/1B5N/8/8/8/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Bd4#', note:'Blackburne’s mate: a knight blocks the king’s last flight square while a bishop rakes in along the long diagonal to finish the job.' },
  { fen:'k7/2K5/7Q/8/8/8/8/8 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qa6#', note:'The oldest checkmate technique there is: with the two kings in opposition, the queen needs only reach the file the lone king cannot leave.' },
  { fen:'8/8/8/2p5/k1Pb4/r7/QPp5/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxa3#', note:'Every other piece on the board is pinned or blocked shut: the queen’s single legal move happens to be checkmate.' },
  { fen:'6kn/5pP1/8/8/8/8/8/K6R w - - 0 1', task:'White to move — mate in 1', solution:'1. gxh8=Q#', note:'The pawn’s last step is a capture into the corner, and the queen it becomes is safe there only because a rook has guarded that square from afar the whole game.' },
  { fen:'1r5r/8/P7/K7/P7/8/8/6k1 b - - 0 1', task:'Black to move — mate in 1', solution:'1... Rh5#', note:'Two rooks close like pincers: one already seals a file, and the other only has to find the right rank.' },
  { fen:'7k/8/8/8/3b4/1b6/7P/7K b - - 0 1', task:'Black to move — mate in 1', solution:'1... Bd5#', note:'A bishop pair covers both colours of square at once, something no single bishop, however well placed, could ever manage alone.' },
  { fen:'k7/8/8/8/8/8/5p1P/7K b - - 0 1', task:'Black to move — mate in 1', solution:'1... f1=Q#', note:'From its starting square to the very last rank, a pawn’s whole reason for being is this one transformation.' },
  { fen:'8/8/8/8/8/7q/2k5/K7 b - - 0 1', task:'Black to move — mate in 1', solution:'1... Qa3#', note:'Reduced to three pieces on the board, chess still offers this: the simplest mate there is, kings in opposition and a queen closing the file.' },
  { fen:'7k/4N3/8/8/8/8/8/K5Q1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qg8#', note:'This queen does not hang back on a distant square. She walks up beside the king, and one knight three squares away is reason enough that she is safe.' },
  { fen:'2Q1N1k1/5pp1/8/8/8/8/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Nf6#', note:'A pawn could simply capture the checking knight, except a queen is delivering check as well from the far side of the rank, and one capture cannot answer two attackers.' },
  { fen:'8/8/8/2R5/8/2K5/3N4/k7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Ra5#', note:'Not every kill box needs two rooks: a knight and the king do the fencing here, while a single rook slides in from a distance to strike.' }
);
