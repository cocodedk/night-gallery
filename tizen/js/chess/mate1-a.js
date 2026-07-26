// Mate in 1 — set A.
'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});
NG.PUZZLES = NG.PUZZLES || [];
NG.PUZZLES.push(
  { fen:'6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1', task:'White to move — mate in 1', solution:'1. Re8#', note:'The back rank: the king’s own pawns become the walls of its prison.' },
  { fen:'6rk/6pp/8/4N3/8/8/8/7K w - - 0 1', task:'White to move — mate in 1', solution:'1. Nf7#', note:'A smothered mate: every escape square is occupied by the king’s own army.' },
  { fen:'7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qg7#', note:'The queen walks up under her king’s protection. The simplest machine in chess.' },
  { fen:'7k/6p1/5N2/8/8/8/8/R4K2 w - - 0 1', task:'White to move — mate in 1', solution:'1. Ra8#', note:'The Arabian mate is one of the oldest recorded patterns in chess, dating to 9th-century manuscripts.' },
  { fen:'6k1/1p3ppp/8/8/8/8/1Q6/B5K1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxg7#', note:'Battery on the long diagonal: the bishop behind makes the queen untouchable.' },
  { fen:'6k1/8/8/3r4/8/7n/6PP/7K b - - 0 1', task:'Black to move — mate in 1', solution:'1... Rd1#', note:'Anastasia’s mate: a knight seals the one escape square the pawns leave open, and the rook mates along the rank with nowhere left to run.' },
  { fen:'2kr4/3p4/8/8/8/3B2B1/8/6K1 w - - 0 1', task:'White to move — mate in 1', solution:'1. Ba6#', note:'Boden’s mate: two bishops crossing like scissors, each covering what the other cannot.' },
  { fen:'7k/6pp/7Q/8/8/3B4/8/K7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxh7#', note:'Damiano’s bishop mate: the queen captures the corner pawn, defended by a bishop lined up on an entirely different diagonal.' },
  { fen:'k6r/8/8/8/8/6n1/5PP1/6K1 b - - 0 1', task:'Black to move — mate in 1', solution:'1... Rh1#', note:'The hook mate: a knight curls beside the rook to guard its own square, while pawns wall off the rest.' },
  { fen:'4r2k/4q3/8/8/8/8/3PPP2/3RKR2 b - - 0 1', task:'Black to move — mate in 1', solution:'1... Qxe2#', note:'The epaulette mate: the king’s own rooks stand at its shoulders like epaulettes, turning parade dress into a trap.' },
  { fen:'4kr2/5p2/8/8/8/7B/8/3Q3K w - - 0 1', task:'White to move — mate in 1', solution:'1. Qd7#', note:'The dovetail, or Cozio’s mate: one step from the king, the queen alone covers both open squares, splayed like a swallow’s forked tail.' },
  { fen:'b2q3k/8/8/8/8/8/5P1P/6K1 b - - 0 1', task:'Black to move — mate in 1', solution:'1... Qd1#', note:'Greco’s mate: a bishop commands the long diagonal into the corner while the queen guards the rank from afar. It was a favourite construction of the 17th-century Italian master Gioachino Greco.' },
  { fen:'8/8/6p1/6pk/6p1/8/R7/4K3 w - - 0 1', task:'White to move — mate in 1', solution:'1. Rh2#', note:'The corridor mate: the king’s own pawns wall it into a single-file passage, and the rook checks straight down the corridor with no side door left.' },
  { fen:'7k/6p1/8/8/R7/1B6/8/4K3 w - - 0 1', task:'White to move — mate in 1', solution:'1. Rh4#', note:'Pillsbury’s mate: a rook slides down the file while a distant bishop on the long diagonal makes sure the corner was never safe to begin with.' },
  { fen:'5rk1/5p1p/6P1/8/8/8/8/K6Q w - - 0 1', task:'White to move — mate in 1', solution:'1. Qxh7#', note:'Lolli’s mate: an advanced pawn shields the queen as she takes the corner, a pattern named for the 18th-century Italian theorist Giambattista Lolli.' },
  { fen:'k2r4/8/8/8/8/8/r7/7K b - - 0 1', task:'Black to move — mate in 1', solution:'1... Rd1#', note:'Two rooks divide the board between them: one seals the second rank, the other closes the first. The king never had a third option.' },
  { fen:'7k/8/6K1/8/8/8/8/R7 w - - 0 1', task:'White to move — mate in 1', solution:'1. Ra8#', note:'No pawns, no tricks: the king simply stands close enough to guard two squares, and the rook does the rest from across the board.' },
  { fen:'7k/8/5PP1/8/8/8/8/K2R4 w - - 0 1', task:'White to move — mate in 1', solution:'1. Rd8#', note:'The advancing pawns do not block the king’s escape: they aim at it, covering both corner squares by threat alone while the rook walks in.' }
);
