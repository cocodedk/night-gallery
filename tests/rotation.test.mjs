import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createRotation } = require('../tizen/js/rotation.js');

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

// Independent reference model transcribed from the prose spec, used as an
// oracle for property-based comparison against the real implementation.
function makeRefAdvance(length) {
  let seqIndex = 0;
  let history = [];
  return function (step) {
    if (step === -1 && history.length > 1) {
      history.pop();
      const makerIdx = history[history.length - 1];
      seqIndex = (makerIdx + 1) % length;
      return makerIdx;
    }
    const idx = seqIndex;
    history.push(idx);
    if (history.length > 40) { history.shift(); }
    seqIndex = (idx + 1) % length;
    return idx;
  };
}

// --- 1. advance cycles 0,1,2,3,0,1,2,3... on fresh state ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  const got = [];
  for (let i = 0; i < 9; i++) { got.push(rot.advance(1)); }
  check(
    JSON.stringify(got) === JSON.stringify([0, 1, 2, 3, 0, 1, 2, 3, 0]),
    'advance(1) cycles 0,1,2,3,0,1,2,3,0'
  );
}

// --- 2. back with history.length > 1 returns previous index; forward resumes correctly ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  check(rot.advance(1) === 0, 'forward #1 -> 0');
  check(rot.advance(1) === 1, 'forward #2 -> 1');
  check(rot.advance(1) === 2, 'forward #3 -> 2 (history=[0,1,2])');
  check(rot.advance(-1) === 1, 'back returns previous index (1), not current (2)');
  check(rot.advance(1) === 2, 'forward after back resumes at 2 (not 3)');
  check(rot.advance(1) === 3, 'forward continues normally afterward');
}

// --- 3. back at start (history.length <= 1) behaves like forward (prototype quirk) ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  check(rot.advance(-1) === 0, 'back on empty history behaves like forward -> 0');
  check(rot.advance(-1) === 1, 'back with history.length===1 still behaves like forward -> 1');
}

// --- 4. history cap at 40: property-based comparison against reference oracle ---
{
  let t = 0;
  const rot = createRotation({ length: 5, now: () => t });
  const ref = makeRefAdvance(5);
  // Long run: push far past the 40-entry cap, then peel back with -1 repeatedly.
  const steps = [];
  for (let i = 0; i < 60; i++) { steps.push(1); }
  for (let i = 0; i < 55; i++) { steps.push(-1); }
  for (let i = 0; i < 20; i++) { steps.push(i % 3 === 0 ? -1 : 1); }
  for (const step of steps) {
    const actual = rot.advance(step);
    const expected = ref(step);
    check(actual === expected, `advance(${step}) matches oracle (got ${actual}, want ${expected})`);
  }
}

// --- 5/6. frac progression, clamping, and due() flip ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  check(rot.frac() === 0, 'frac() is 0 before start() is ever called');
  rot.start(1000);
  check(rot.frac() === 0, 'frac() is 0 right at start()');
  t = 250;
  check(rot.frac() === 0.25, 'frac() progresses proportionally (250/1000)');
  check(rot.due() === false, 'due() is false before duration elapses');
  t = 999;
  check(rot.due() === false, 'due() is false just under duration');
  t = 1000;
  check(rot.frac() === 1, 'frac() reaches exactly 1 at duration');
  check(rot.due() === true, 'due() flips true once frac() >= 1');
  t = 5000;
  check(rot.frac() === 1, 'frac() clamps at 1 well past duration');
  check(rot.due() === true, 'due() stays true past duration');
}

// --- 7/8. pause freezes frac; resume continues without a jump ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  rot.start(1000);
  t = 300;
  check(rot.isPaused() === false, 'not paused initially');
  const pausedState = rot.togglePause();
  check(pausedState === true, 'togglePause() returns true on pause');
  check(rot.isPaused() === true, 'isPaused() reflects pause');
  const fracAtPause = rot.frac();
  check(fracAtPause === 0.3, 'frac() at pause moment is 0.3');
  t = 900; // time passes while paused
  check(rot.frac() === fracAtPause, 'frac() stays frozen while paused, even as t advances');
  check(rot.due() === false, 'due() is false while paused, even if frac would exceed 1 unpaused');
  const resumedState = rot.togglePause();
  check(resumedState === false, 'togglePause() returns false on resume');
  check(rot.isPaused() === false, 'isPaused() reflects resume');
  check(rot.frac() === fracAtPause, 'frac() right after resume equals frozen value (no jump)');
  t = 900 + 100; // advance real time by 100ms after resume
  check(
    Math.abs(rot.frac() - 0.4) < 1e-9,
    'frac() after resume continues accumulating from the frozen point (0.3 + 0.1 = 0.4)'
  );
}

// --- 9. start() resets frac to 0, including when called while paused ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  rot.start(1000);
  t = 500;
  rot.togglePause();
  rot.start(2000);
  check(rot.frac() === 0, 'start() resets frac() to 0 even while paused');
  check(rot.isPaused() === true, 'start() preserves paused state across cards');
  t = 700;
  check(rot.frac() === 0, 'frac() stays 0 while paused after a fresh start()');
  rot.togglePause();
  check(rot.frac() === 0, 'resuming right after a fresh start() still reads 0 (no jump)');
  t = 800;
  check(rot.frac() === 0.05, 'frac() progresses normally after resume (100/2000)');
}

// --- 10. frac clamps at 1 even with huge elapsed time ---
{
  let t = 0;
  const rot = createRotation({ length: 4, now: () => t });
  rot.start(10);
  t = 1000000;
  check(rot.frac() === 1, 'frac() clamps at 1 for very large elapsed time');
}

console.log(`ok rotation.test.mjs (${n} assertions)`);
