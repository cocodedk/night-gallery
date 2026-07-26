// Validates the app's shipped chess data (tizen/js/content.js + the puzzle
// files under tizen/js/chess/, if any) against the engine in tests/chess/.
// Counts belong to tests/content.test.mjs — this file only checks soundness.
import { createRequire } from 'node:module';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFen, inCheck, makeMove } from './chess/board.mjs';
import { keyMoves, isCheckmate } from './chess/mate.mjs';
import { parseSan, moveToSan } from './chess/san.mjs';

const require = createRequire(import.meta.url);
require('../tizen/js/content.js');

// `--only <basename>` loads a single set file, so an author working on one
// file sees only their own failures while peers are mid-edit. The full run
// (no flag) is the authoritative gate — it also catches cross-file duplicates.
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx === -1 ? null : process.argv[onlyIdx + 1];

// Puzzle/position set files push into NG.PUZZLES / NG.POSITIONS; the
// directory may not exist yet, or may be empty.
const chessDir = fileURLToPath(new URL('../tizen/js/chess/', import.meta.url));
if (existsSync(chessDir)) {
  for (const f of readdirSync(chessDir).sort()) {
    if (f.endsWith('.js') && (!only || f === only)) { require(path.join(chessDir, f)); }
  }
}

const PUZZLES = globalThis.NG.PUZZLES || [];
const POSITIONS = globalThis.NG.POSITIONS || [];

let n = 0;
const failures = [];
// Collect every failure rather than throwing on the first one: an author
// fixing a set file wants the full list of unsound puzzles from a single run.
function check(cond, msg) {
  n++;
  if (!cond) { failures.push(msg); }
}

const SIDE_WORD = { w: 'White', b: 'Black' };
function oppositeSide(side) { return side === 'w' ? 'b' : 'w'; }
function countPieces(fen, ch) { return fen.split(' ')[0].split('').filter((c) => c === ch).length; }

function tryParseFen(fen, label) {
  try {
    return parseFen(fen);
  } catch (e) {
    check(false, `${label}: FEN failed to parse (${fen}): ${e.message}`);
    return null;
  }
}

const placements = new Set();
function checkUniquePlacement(fen, label) {
  const placement = fen.split(' ')[0];
  check(!placements.has(placement), `duplicate board across the gallery: ${label} (${placement})`);
  placements.add(placement);
}

function checkOneKingEachNotInCheck(state, fen, label) {
  check(countPieces(fen, 'K') === 1, `${label}: exactly one 'K'`);
  check(countPieces(fen, 'k') === 1, `${label}: exactly one 'k'`);
  check(!inCheck(state, oppositeSide(state.side)), `${label}: side not to move is not in check (impossible position)`);
}

// --- puzzles ---
for (const [i, p] of PUZZLES.entries()) {
  const label = `puzzle[${i}]`;
  checkUniquePlacement(p.fen, label);
  const state = tryParseFen(p.fen, label);
  if (!state) { continue; }

  checkOneKingEachNotInCheck(state, p.fen, label);
  const whitePawns = countPieces(p.fen, 'P');
  const blackPawns = countPieces(p.fen, 'p');
  check(whitePawns <= 8 && blackPawns <= 8, `${label}: at most 8 pawns per side (got ${whitePawns}/${blackPawns})`);
  const fields = p.fen.split(' ');
  check(fields[2] === '-' && fields[3] === '-', `${label}: no castling rights and no en-passant square`);
  check(typeof p.note === 'string' && p.note.length > 0, `${label}.note is a non-empty string`);

  const taskMatch = /^(White|Black) to move — mate in (\d+)$/.exec(p.task);
  check(taskMatch !== null, `${label}: task matches 'Side to move — mate in N' (got '${p.task}')`);
  if (!taskMatch) { continue; }
  const [, sideWord, nStr] = taskMatch;
  check(sideWord === SIDE_WORD[state.side], `${label}: task side '${sideWord}' matches FEN side-to-move '${state.side}'`);

  const nMoves = Number(nStr);
  let keys;
  try {
    keys = keyMoves(state, nMoves);
    if (nMoves > 1) {
      check(keyMoves(state, nMoves - 1).length === 0, `${label}: is secretly mate in ${nMoves - 1} — FEN: ${p.fen}`);
    }
  } catch (e) {
    // The node cap is a content rule, not an engine failure: too dense to
    // verify means too dense to be an elegant puzzle. Report and move on.
    check(false, `${label}: search exceeded the node cap — use a sparser position (${e.message})`);
    continue;
  }
  check(keys.length === 1, `${label}: mate-in-${nMoves} should have exactly one key move (found ${keys.length}) — FEN: ${p.fen}`);
  if (keys.length === 0) { continue; }

  // Walk the whole printed line, not just the key: a mate-in-3 card shows
  // every move on screen, so a typo three plies deep is as visible as one in
  // the key. Move numbers ('1.', '2...') are stripped, leaving the plies in
  // order, so this check is independent of how the line is numbered.
  const plies = p.solution.trim().split(/\s+/)
    .filter((t) => !/^\d+\.+$/.test(t))
    .map((t) => t.replace(/[!?]+$/, ''));
  let walk = state;
  let walked = true;
  for (const tok of plies) {
    const mv = parseSan(walk, tok);
    if (!mv) {
      check(false, `${label}: solution move '${tok}' is not legal at that point — FEN: ${p.fen}, solution: '${p.solution}'`);
      walked = false;
      break;
    }
    walk = makeMove(walk, mv);
  }
  if (walked) {
    check(plies.length === 2 * nMoves - 1, `${label}: a mate in ${nMoves} needs ${2 * nMoves - 1} plies, solution has ${plies.length} — '${p.solution}'`);
    check(isCheckmate(walk), `${label}: the solution line does not end in checkmate — '${p.solution}'`);
  }

  const firstToken = (p.solution.trim().split(/\s+/)[1] || '').replace(/[!?]+$/, '');
  const parsedMove = parseSan(state, firstToken);
  const wantSan = moveToSan(state, keys[0]);
  check(
    parsedMove !== null && parsedMove.from === keys[0].from && parsedMove.to === keys[0].to && parsedMove.promo === keys[0].promo,
    `${label}: solution's first move '${firstToken}' should match the key move '${wantSan}' — FEN: ${p.fen}, solution: '${p.solution}'`
  );
}

// --- positions (diagram-only) ---
for (const [i, p] of POSITIONS.entries()) {
  const label = `position[${i}]`;
  checkUniquePlacement(p.fen, label);
  const state = tryParseFen(p.fen, label);
  if (!state) { continue; }

  checkOneKingEachNotInCheck(state, p.fen, label);
  check(typeof p.kind === 'string' && p.kind.length > 0, `${label}.kind is a non-empty string`);
  check(typeof p.title === 'string' && p.title.length > 0, `${label}.title is a non-empty string`);
  check(typeof p.note === 'string' && p.note.length > 0, `${label}.note is a non-empty string`);
  if (p.marks) {
    for (const sq of p.marks) {
      check(/^[a-h][1-8]$/.test(sq), `${label}.marks contains a valid square (got '${sq}')`);
    }
  }
}

if (failures.length) {
  for (const f of failures) { console.error('FAIL ' + f); }
  console.error(`chess.test.mjs: ${failures.length} of ${n} checks failed`);
  process.exit(1);
}
console.log(`ok chess.test.mjs (${n} assertions)`);
