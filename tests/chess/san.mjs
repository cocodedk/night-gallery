// Standard Algebraic Notation: parse a token to a legal move, and render a
// legal move back to SAN (used for readable failure messages).
import { squareToIndex, indexToSquare, makeMove, inCheck } from './board.mjs';
import { legalMoves } from './movegen.mjs';

const FILES = 'abcdefgh';
const TOKEN_RE = /^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(?:=([QRBN]))?$/;

function fileIndex(ch) { return FILES.indexOf(ch); }

export function parseSan(state, token) {
  if (typeof token !== 'string') { return null; }
  const t = token.trim().replace(/[+#!?]+$/, '');

  if (t === 'O-O' || t === '0-0') {
    const m = legalMoves(state).find((mv) => mv.flags && mv.flags.castle === 'k');
    return m || null;
  }
  if (t === 'O-O-O' || t === '0-0-0') {
    const m = legalMoves(state).find((mv) => mv.flags && mv.flags.castle === 'q');
    return m || null;
  }

  const match = TOKEN_RE.exec(t);
  if (!match) { return null; }
  const [, pieceLetter, disFile, disRank, captureMark, destStr, promoLetter] = match;
  const piece = pieceLetter || 'P';
  const to = squareToIndex(destStr);

  const candidates = legalMoves(state).filter((mv) => {
    if (mv.flags && mv.flags.castle) { return false; }
    if (mv.piece !== piece || mv.to !== to) { return false; }
    if (Boolean(captureMark) !== Boolean(mv.capture)) { return false; }
    if (disFile && (mv.from % 8) !== fileIndex(disFile)) { return false; }
    if (disRank && Math.floor(mv.from / 8) !== Number(disRank) - 1) { return false; }
    if ((promoLetter || null) !== (mv.promo || null)) { return false; }
    return true;
  });

  return candidates.length === 1 ? candidates[0] : null;
}

function disambiguation(state, move) {
  if (move.piece === 'P') { return move.capture ? FILES[move.from % 8] : ''; }
  const others = legalMoves(state).filter((o) => (
    o.piece === move.piece && o.to === move.to && o.from !== move.from && !(o.flags && o.flags.castle)
  ));
  if (others.length === 0) { return ''; }
  const sameFile = others.some((o) => (o.from % 8) === (move.from % 8));
  const sameRank = others.some((o) => Math.floor(o.from / 8) === Math.floor(move.from / 8));
  if (!sameFile) { return FILES[move.from % 8]; }
  if (!sameRank) { return String(Math.floor(move.from / 8) + 1); }
  return indexToSquare(move.from);
}

export function moveToSan(state, move) {
  const next = makeMove(state, move);
  let suffix = '';
  if (inCheck(next, next.side)) {
    suffix = legalMoves(next).length === 0 ? '#' : '+';
  }

  if (move.flags && move.flags.castle) {
    return (move.flags.castle === 'k' ? 'O-O' : 'O-O-O') + suffix;
  }

  const pieceLetter = move.piece === 'P' ? '' : move.piece;
  const dis = disambiguation(state, move);
  const captureMark = move.capture ? 'x' : '';
  const dest = indexToSquare(move.to);
  const promo = move.promo ? `=${move.promo}` : '';
  return `${pieceLetter}${dis}${captureMark}${dest}${promo}${suffix}`;
}
