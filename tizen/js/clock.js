'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Writes HH:MM into `el` immediately, then refreshes every 10s.
NG.startClock = function startClock(el) {
  function updateClock() {
    const d = new Date();
    el.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  updateClock();
  setInterval(updateClock, 10000);
};
