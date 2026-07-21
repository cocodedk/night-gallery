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

NG.CONCEPTS = [
  { tag:'Systems', title:'Blast radius', body:'Before asking whether a component can fail, ask what else burns when it does. Good architecture is mostly the art of <em>drawing smaller circles</em>.' },
  { tag:'Systems', title:'Time to live', body:'Nothing should be permanent by default. Access, records, automations — give each a clock, and let expiry do the housekeeping that humans forget.' },
  { tag:'Systems', title:'Idempotency', body:'An operation you can safely run twice is an operation you can safely retry. Most reliability engineering is just this idea, wearing different hats.' },
  { tag:'Systems', title:'Least privilege', body:'Grant the minimum needed to do the job, for the minimum time needed to do it. Not because people are untrustworthy — because <em>credentials leak</em>.' },
  { tag:'Electronics', title:'Parallel & series', body:'In parallel, every branch sees the full supply voltage and draws its own current. In series, one current flows through all — and one break darkens everything.' },
  { tag:'Electronics', title:'Why the fuse sits on the live wire', body:'A fuse on neutral still blows — but leaves the whole circuit sitting at full potential. Protection belongs <em>upstream of the danger</em>.' },
  { tag:'Electronics', title:'The residual-current device', body:'An RCD never measures how much current flows — only whether what leaves on live returns on neutral. A few milliamps of imbalance, and it opens in under 30 ms.' },
  { tag:'Electronics', title:'Ohm’s law', body:'V = I × R. Three quantities, one triangle — cover the one you want, and the other two tell you how to find it.' },
  { tag:'Chess', title:'Zugzwang', body:'A position where every legal move makes things worse — the obligation to act becomes the losing condition. German for “compulsion to move.”' },
  { tag:'Chess', title:'Prophylaxis', body:'Before improving your own position, ask what your opponent wants — and quietly take it away. The strongest moves often look like nothing happened.' },
  { tag:'Geography', title:'Chokepoints', body:'Roughly a fifth of the world’s oil passes through the Strait of Hormuz; a quarter of traded goods through Malacca. Geography still writes the rules of power.' },
  { tag:'Geography', title:'Exclave', body:'A territory separated from its motherland by other states — Kaliningrad, cut off from Russia by Lithuania and Poland, is Europe’s most consequential example.' },
  { tag:'Dansk', title:'Overskud', body:'Literally “surplus” — the spare mental energy to be patient, generous, or playful. You don’t <em>find</em> time for people; you need overskud for them.' },
  { tag:'Dansk', title:'Arbejdsglæde', body:'“Work-joy” — a single Danish word for finding genuine happiness in one’s work. Scandinavian languages have it; most others need a sentence.' },
  { tag:'Dansk', title:'Fingerspidsfornemmelse', body:'“Fingertip-feeling” — the intuitive touch for a delicate situation that no rulebook can teach. Knowing exactly how far to go, and no further.' },
  { tag:'Thinking', title:'Chesterton’s fence', body:'Never remove a fence until you know why it was put up. Reforms made in ignorance of a rule’s purpose tend to rediscover that purpose the hard way.' },
  { tag:'Thinking', title:'Goodhart’s law', body:'When a measure becomes a target, it ceases to be a good measure. People don’t optimize what you want — they optimize what you <em>count</em>.' }
];

NG.AMBIENT_WORDS = ['stilhed', 'tænkepause', 'nightfall', 'interlude', 'ro'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLES: NG.PUZZLES, CONCEPTS: NG.CONCEPTS, AMBIENT_WORDS: NG.AMBIENT_WORDS };
}
