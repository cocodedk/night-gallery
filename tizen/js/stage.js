'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Two fixed, crossfaded stages. Owns only the "put this card on screen"
// mechanic — rotation/timing (advance, pause, sequence) belongs to app.js.
NG.createStage = function createStage() {
  const stages = [document.getElementById('stageA'), document.getElementById('stageB')];
  let activeStage = 0;
  let current = null;

  function show(card) {
    const incoming = stages[1 - activeStage];
    const outgoing = stages[activeStage];

    incoming.innerHTML = '';
    incoming.appendChild(card.node);
    incoming.classList.add('visible');
    outgoing.classList.remove('visible');

    const prev = current;
    setTimeout(function () {
      if (!outgoing.classList.contains('visible')) { outgoing.innerHTML = ''; }
      if (prev && prev.onExit) { prev.onExit(); }
    }, 1700);

    activeStage = 1 - activeStage;
    current = card;
    if (card.onEnter) { card.onEnter(); }
  }

  return {
    show: show,
    current: function () { return current; }
  };
};
