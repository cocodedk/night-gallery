import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { shuffle, pool } = require('../tizen/js/pool.js');

let n = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  n++;
}

function sortedCopy(a) {
  return a.slice().sort();
}

// --- shuffle: permutation, no mutation ---
const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const originalSnapshot = original.slice();
const shuffled = shuffle(original);

check(shuffled !== original, 'shuffle returns a new array, not the same reference');
check(
  JSON.stringify(original) === JSON.stringify(originalSnapshot),
  'shuffle does not mutate its input'
);
check(shuffled.length === original.length, 'shuffle preserves length');
check(
  JSON.stringify(sortedCopy(shuffled)) === JSON.stringify(sortedCopy(original)),
  'shuffle is a permutation of the input (same multiset)'
);

// shuffle of empty array
check(JSON.stringify(shuffle([])) === '[]', 'shuffle of empty array is empty array');

// shuffle of single-element array
check(JSON.stringify(shuffle(['x'])) === JSON.stringify(['x']), 'shuffle of single element is itself');

// --- shuffle: statistically produces different orders (not the identity every time) ---
{
  const big = Array.from({ length: 50 }, (_, i) => i);
  let anyDifferent = false;
  for (let i = 0; i < 20; i++) {
    const s = shuffle(big);
    if (JSON.stringify(s) !== JSON.stringify(big)) { anyDifferent = true; break; }
  }
  check(anyDifferent, 'shuffle produces a different order than input across attempts');
}

// --- pool: draws each item exactly once per N draws, across several cycles ---
{
  const items = ['a', 'b', 'c', 'd', 'e'];
  const draw = pool(items);
  const cycles = 5;
  for (let c = 0; c < cycles; c++) {
    const drawn = [];
    for (let i = 0; i < items.length; i++) {
      drawn.push(draw());
    }
    check(
      JSON.stringify(sortedCopy(drawn)) === JSON.stringify(sortedCopy(items)),
      `pool cycle ${c} returns each item exactly once (multiset match)`
    );
  }
}

// --- pool: does not mutate the source items array ---
{
  const items = [1, 2, 3];
  const itemsSnapshot = items.slice();
  const draw = pool(items);
  for (let i = 0; i < 10; i++) { draw(); }
  check(
    JSON.stringify(items) === JSON.stringify(itemsSnapshot),
    'pool does not mutate the source items array'
  );
}

// --- pool: single-item pool always returns that item ---
{
  const draw = pool(['only']);
  for (let i = 0; i < 5; i++) {
    check(draw() === 'only', 'single-item pool always draws the only item');
  }
}

console.log(`ok pool.test.mjs (${n} assertions)`);
