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
  { tag:'Systems', title:'Backpressure', body:'When a system is overwhelmed, the healthy response is to slow the sender, not to buffer in silence. Queues that only ever grow are outages <em>scheduled for later</em>.' },
  { tag:'Systems', title:'The circuit breaker', body:'A service that keeps hammering a dying dependency finishes the job. After repeated failures, trip open, fail fast, and only <em>probe</em> for recovery — the electrical part, translated into software.' },
  { tag:'Systems', title:'Bulkheads', body:'Ships survive holes because compartments flood alone. Give each tenant, feature and thread pool its own compartment, and one failure stays a leak instead of a sinking.' },
  { tag:'Systems', title:'The thundering herd', body:'One cache entry expires, and a thousand waiting clients charge the database at once. Stagger the timers — synchronized recovery is just a second outage.' },
  { tag:'Electronics', title:'Parallel & series', body:'In parallel, every branch sees the full supply voltage and draws its own current. In series, one current flows through all — and one break darkens everything.' },
  { tag:'Electronics', title:'Why the fuse sits on the live wire', body:'A fuse on neutral still blows — but leaves the whole circuit sitting at full potential. Protection belongs <em>upstream of the danger</em>.' },
  { tag:'Electronics', title:'The residual-current device', body:'An RCD never measures how much current flows — only whether what leaves on live returns on neutral. A few milliamps of imbalance, and it opens in under 30 ms.' },
  { tag:'Electronics', title:'Ohm’s law', body:'V = I × R. Three quantities, one triangle — cover the one you want, and the other two tell you how to find it.' },
  { tag:'Electronics', title:'The reservoir capacitor', body:'Rectified mains is a series of humps, not a steady rail. The capacitor fills on each peak and quietly carries the load through the valleys — a water tower for electrons.' },
  { tag:'Electronics', title:'Why the earth wire exists', body:'In normal life it carries nothing at all. It exists for the fault: a low-resistance road home that turns a live chassis into a blown fuse <em>before</em> it turns into a shock.' },
  { tag:'Electronics', title:'Inrush current', body:'Cold filaments, empty capacitors and idle motors all gulp far more than their running current. It is why breakers tolerate a surge — and why fuses come in <em>slow-blow</em>.' },
  { tag:'Electronics', title:'The voltage divider', body:'Two resistors in series, and the midpoint reads any fraction of the supply you choose. Half of sensor electronics is this one trick, dressed up.' },
  { tag:'Chess', title:'Zugzwang', body:'A position where every legal move makes things worse — the obligation to act becomes the losing condition. German for “compulsion to move.”' },
  { tag:'Chess', title:'Prophylaxis', body:'Before improving your own position, ask what your opponent wants — and quietly take it away. The strongest moves often look like nothing happened.' },
  { tag:'Chess', title:'The opposition', body:'Two kings, one square apart, and whoever must move gives way. In king-and-pawn endings this single idea decides more games than any tactic.' },
  { tag:'Chess', title:'The outpost', body:'A square in enemy territory, guarded by your pawn, unreachable by theirs. A knight planted there stops being a minor piece — it becomes an occupation.' },
  { tag:'Chess', title:'Two weaknesses', body:'One weakness can usually be defended forever. Winning technique is creating a <em>second</em> one, then stretching the defence between them until it tears.' },
  { tag:'Chess', title:'Good bishop, bad bishop', body:'A bishop locked behind its own pawns is a tall pawn. Before trading minor pieces, read the pawn chains — they decide which pieces are actually alive.' },
  { tag:'Chess', title:'The blockade', body:'“The passed pawn is a criminal, who should be kept under lock and key” — Nimzowitsch. Park a knight directly in front: it stops the pawn and loses nothing of its own reach.' },
  { tag:'Chess', title:'Tempo', body:'Every move is a unit of time. Develop with threats, and your opponent spends their turns answering instead of playing — you are effectively moving twice.' },
  { tag:'Chess', title:'The exchange sacrifice', body:'Rook for knight, willingly. Material is only one currency — structure, squares and initiative are others, and the exchange rate shifts with every pawn move.' },
  { tag:'Chess', title:'King activity', body:'Through the middlegame the king hides; in the endgame it fights. With equal material, the side whose king arrives first usually wins — centralise it the moment the queens leave.' },
  { tag:'Geography', title:'Chokepoints', body:'Roughly a fifth of the world’s oil passes through the Strait of Hormuz; a quarter of traded goods through Malacca. Geography still writes the rules of power.' },
  { tag:'Geography', title:'Exclave', body:'A territory separated from its motherland by other states — Kaliningrad, cut off from Russia by Lithuania and Poland, is Europe’s most consequential example.' },
  { tag:'Geography', title:'The Danish straits', body:'Nearly everything sailing out of the Baltic squeezes past Denmark — through Øresund or the Great Belt. A small country, sitting on one of the world’s oldest maritime chokepoints.' },
  { tag:'Geography', title:'Panama’s water problem', body:'Each transit of the canal spends a lakeful of fresh water — around 200 million litres, lifted from Gatún. In a drought year, rain in Panama sets freight rates in Rotterdam.' },
  { tag:'Dansk', title:'Overskud', body:'Literally “surplus” — the spare mental energy to be patient, generous, or playful. You don’t <em>find</em> time for people; you need overskud for them.' },
  { tag:'Dansk', title:'Arbejdsglæde', body:'“Work-joy” — a single Danish word for finding genuine happiness in one’s work. Scandinavian languages have it; most others need a sentence.' },
  { tag:'Dansk', title:'Fingerspidsfornemmelse', body:'“Fingertip-feeling” — the intuitive touch for a delicate situation that no rulebook can teach. Knowing exactly how far to go, and no further.' },
  { tag:'Dansk', title:'Pyt', body:'A tiny word for letting small annoyances go — Danish schools even keep a physical <em>pyt-knap</em> to press. Not resignation; a decision that this one is not worth your overskud.' },
  { tag:'Dansk', title:'Ildsjæl', body:'“Fire-soul” — the volunteer who keeps the club, the festival or the association running on sheer inner flame. Danish civil society is built from ildsjæle.' },
  { tag:'Dansk', title:'Vemod', body:'A soft, quiet melancholy — sadness without an object, closer to longing than to grief. The Danish autumn, distilled into two syllables.' },
  { tag:'Dansk', title:'Tidsoptimist', body:'“Time-optimist” — the person who sincerely believes the drive takes ten minutes, every single time it has taken twenty. A diagnosis, delivered affectionately.' },
  { tag:'Dansk', title:'Træls', body:'Jutland’s all-purpose word for tiresome — the delayed train, the flat tyre, the form that must be printed to be signed. Mild enough to say to anyone, precise enough to need no more.' },
  { tag:'Dansk', title:'Janteloven', body:'The Law of Jante, from Sandemose’s 1933 novel: <em>don’t think you are anything special</em>. Denmark’s unwritten leveling code — resented, defended, and obeyed in equal measure.' },
  { tag:'Dansk', title:'Nærvær', body:'Literally “near-being” — full presence in the room you are actually in. The opposite of a glance at the phone; the quality hygge quietly depends on.' },
  { tag:'Dansk', title:'Fjumreår', body:'“Fumble-year” — the gap year between school and study, officially frowned upon and privately treasured. A word that admits wandering has value.' },
  { tag:'Security', title:'Defense in depth', body:'Every layer assumes the one before it has already failed. Not paranoia — arithmetic: three imperfect barriers multiply into one very good one.' },
  { tag:'Security', title:'Attack surface', body:'Every port, page, dependency and forgotten subdomain is a door. Security work is less about stronger locks than about <em>counting the doors</em> — and bricking up the unused ones.' },
  { tag:'Security', title:'Zero trust', body:'Being inside the network proves nothing; every request authenticates as if it came from the open internet. The castle-and-moat era ended when the laptops walked out the gate.' },
  { tag:'Thinking', title:'Chesterton’s fence', body:'Never remove a fence until you know why it was put up. Reforms made in ignorance of a rule’s purpose tend to rediscover that purpose the hard way.' },
  { tag:'Thinking', title:'Goodhart’s law', body:'When a measure becomes a target, it ceases to be a good measure. People don’t optimize what you want — they optimize what you <em>count</em>.' },
  { tag:'Thinking', title:'Inversion', body:'Instead of asking how to succeed, ask what would guarantee failure — then avoid it. Some problems are only solvable <em>backwards</em>.' },
  { tag:'Thinking', title:'Survivorship bias', body:'The returning bombers were shot everywhere except the engines — so Abraham Wald armoured the engines. The data you are missing is often the message.' },
  { tag:'Thinking', title:'Second-order effects', body:'Cheap credit builds houses; the houses need roads; the roads decide elections. The first consequence is visible — the important ones are its children. Always ask: <em>and then what</em>.' }
];

NG.AMBIENT_WORDS = ['stilhed', 'tænkepause', 'nightfall', 'interlude', 'ro', 'tusmørke'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLES: NG.PUZZLES, CONCEPTS: NG.CONCEPTS, AMBIENT_WORDS: NG.AMBIENT_WORDS };
}
