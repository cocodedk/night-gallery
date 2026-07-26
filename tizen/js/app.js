'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Bootstrap: wires the content/rotation/stage/card pieces together and
// handles the platform bits (TV keys, screensaver suppression, cursor
// auto-hide, double-press-to-exit) that the prototype didn't need.
document.addEventListener('DOMContentLoaded', function () {
  NG.debug.init();
  NG.registerTvKeys();
  NG.startClock(document.getElementById('clock'));

  // Ambient always-on app: try to keep the panel from sleeping. Guarded —
  // webapis is only present on the TV, never on desktop preview.
  try {
    webapis.appcommon.setScreenSaver(
      webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF,
      function () { NG.debug.state.screensaver = 'off (api ok)'; },
      function (e) { NG.debug.state.screensaver = 'error: ' + e.message; }
    );
  } catch (e) {
    NG.debug.state.screensaver = 'unavailable: ' + e.message;
  }

  // 15-minute cycle: a board is on screen for eight of those minutes (the
  // puzzle's five plus the position card's three), concepts and ambient
  // light fill the rest.
  var sequence = [NG.cardPuzzle, NG.cardConcept, NG.cardPosition, NG.cardConcept, NG.cardAmbient];
  var rotation = NG.createRotation({ length: sequence.length, now: function () { return performance.now(); } });
  var stage = NG.createStage();
  var bar = document.getElementById('bar');

  function show(i) {
    var card = sequence[i]();
    stage.show(card);
    rotation.start(card.duration * 1000);
  }

  var backArmed = false;
  var backTimer = null;
  function backHandler() {
    var hintEl = document.getElementById('exit-hint');
    if (backArmed) {
      try { tizen.application.getCurrentApplication().exit(); } catch (e) {}
      return;
    }
    backArmed = true;
    if (hintEl) { hintEl.classList.remove('hidden'); }
    clearTimeout(backTimer);
    backTimer = setTimeout(function () {
      backArmed = false;
      if (hintEl) { hintEl.classList.add('hidden'); }
    }, 3000);
  }

  NG.initKeys({
    next: function () { show(rotation.advance(1)); },
    prev: function () { show(rotation.advance(-1)); },
    'toggle-pause': function () { rotation.togglePause(); },
    reveal: function () {
      var c = stage.current();
      if (c && c.reveal) { c.reveal(); }
    },
    debug: function () { NG.debug.toggle(); },
    back: backHandler
  });

  function loop() {
    bar.style.width = (rotation.frac() * 100) + '%';
    if (rotation.due()) { show(rotation.advance(1)); }
    NG.debug.frame();
    requestAnimationFrame(loop);
  }

  // Cursor auto-hide + hint fade-out, ported from the prototype: an ambient
  // app should not leave a stray pointer or instructions on screen forever.
  var cursorTimer = null;
  function poke() {
    document.body.classList.remove('hidecursor');
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(function () { document.body.classList.add('hidecursor'); }, 3000);
  }
  document.addEventListener('mousemove', poke);
  poke();
  setTimeout(function () {
    var hintEl = document.getElementById('hint');
    if (hintEl) { hintEl.classList.add('gone'); }
  }, 14000);

  show(rotation.advance(1));
  requestAnimationFrame(loop);
});
