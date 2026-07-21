'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Rotation engine state machine, extracted from the prototype and decoupled
// from the DOM and performance.now(). opts = { length: int, now: () => ms }.
NG.createRotation = function createRotation(opts) {
  const length = opts.length;
  const now = opts.now;

  let seqIndex = 0;
  let history = [];

  let cardStart = 0;
  let cardDuration = 0;
  let paused = false;
  let pausedElapsed = 0;

  function advance(step) {
    if (step === -1 && history.length > 1) {
      history.pop(); // drop current
      const makerIdx = history[history.length - 1];
      seqIndex = (makerIdx + 1) % length;
      return makerIdx;
    }
    const idx = seqIndex;
    history.push(idx);
    if (history.length > 40) { history.shift(); }
    seqIndex = (idx + 1) % length;
    return idx;
  }

  function start(durationMs) {
    cardStart = now();
    cardDuration = durationMs;
    pausedElapsed = 0;
  }

  function frac() {
    if (!cardDuration) { return 0; }
    const elapsed = paused ? pausedElapsed : now() - cardStart;
    return Math.min(1, elapsed / cardDuration);
  }

  function due() {
    return !paused && frac() >= 1;
  }

  function togglePause() {
    if (!paused) {
      paused = true;
      pausedElapsed = now() - cardStart;
    } else {
      paused = false;
      cardStart = now() - pausedElapsed;
    }
    return paused;
  }

  function isPaused() {
    return paused;
  }

  return { advance: advance, start: start, frac: frac, due: due, togglePause: togglePause, isPaused: isPaused };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createRotation: NG.createRotation };
}
