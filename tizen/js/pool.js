'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Fisher-Yates shuffle on a copy of `a`. Never mutates the input.
NG.shuffle = function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
};

// Returns a function that draws one item at a time from a shuffled bag,
// reshuffling from `items` whenever the bag empties.
NG.pool = function pool(items) {
  let bag = NG.shuffle(items);
  return function () {
    if (!bag.length) { bag = NG.shuffle(items); }
    return bag.pop();
  };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { shuffle: NG.shuffle, pool: NG.pool };
}
