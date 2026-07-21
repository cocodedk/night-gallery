'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// On-device probe overlay: our DevTools substitute on the TV (no remote
// debugging on this retail set). Toggled by the 'debug' key action; renders
// build stamp, screen/font/fps facts and a tail of recent console output.
NG.debug = NG.debug || {};

(function () {
  var RING_MAX = 30;
  var KEY_MAX = 8;
  var FONTS = ['Cormorant Garamond', 'IBM Plex Sans', 'NG Chess'];

  var ring = [];
  var el = null;
  var renderTimer = null;
  var frameCount = 0;
  var fpsWindowStart = 0;

  function pushLog(tag, args) {
    try {
      var msg = '[' + tag + '] ' + Array.prototype.map.call(args, String).join(' ');
      ring.push(msg);
      if (ring.length > RING_MAX) { ring.shift(); }
    } catch (e) { /* logging must never break the app */ }
  }

  function wrap(tag, orig) {
    return function () {
      try { pushLog(tag, arguments); } catch (e) {}
      return orig.apply(console, arguments);
    };
  }

  NG.debug.init = function init() {
    NG.debug.state = { screensaver: 'not attempted', keys: [] };
    el = document.getElementById('debug');
    try {
      console.log = wrap('L', console.log);
      console.warn = wrap('W', console.warn);
      console.error = wrap('E', console.error);
    } catch (e) {}
  };

  NG.debug.noteKey = function noteKey(code) {
    try {
      NG.debug.state.keys.push(code);
      if (NG.debug.state.keys.length > KEY_MAX) { NG.debug.state.keys.shift(); }
    } catch (e) {}
  };

  NG.debug.frame = function frame() {
    try {
      var t = performance.now();
      if (!fpsWindowStart) { fpsWindowStart = t; }
      frameCount++;
      if (t - fpsWindowStart >= 1000) {
        NG.debug.state.fps = Math.round(frameCount * 1000 / (t - fpsWindowStart));
        frameCount = 0;
        fpsWindowStart = t;
      }
    } catch (e) {}
  };

  function fontLine(fam) {
    try {
      if (!document.fonts) { return fam + ': fonts API unavailable'; }
      var sample = fam === 'NG Chess' ? '♔' : 'ægØ';
      var loaded = document.fonts.check('17px "' + fam + '"', sample);
      return fam + ': ' + (loaded ? 'loaded' : 'missing');
    } catch (e) {
      return fam + ': error';
    }
  }

  function render() {
    if (!el) { return; }
    try {
      var stampEl = document.getElementById('stamp');
      var lines = [];
      lines.push('build: ' + (stampEl ? stampEl.textContent : '?'));
      lines.push('screen: ' + innerWidth + 'x' + innerHeight + ' @' + (window.devicePixelRatio || 1) + 'x');
      lines.push('ua: ' + navigator.userAgent);
      for (var i = 0; i < FONTS.length; i++) { lines.push(fontLine(FONTS[i])); }
      lines.push('fps: ' + (NG.debug.state.fps != null ? NG.debug.state.fps : '?'));
      lines.push('screensaver: ' + NG.debug.state.screensaver);
      lines.push('keys: ' + NG.debug.state.keys.join(','));
      lines.push('--- log ---');
      for (var j = 0; j < ring.length; j++) { lines.push(ring[j]); }
      el.textContent = lines.join('\n');
    } catch (e) {
      try { el.textContent = 'debug overlay error'; } catch (e2) {}
    }
  }

  NG.debug.toggle = function toggle() {
    try {
      if (!el) { el = document.getElementById('debug'); }
      if (!el) { return; }
      var hidden = el.classList.contains('hidden');
      if (hidden) {
        el.classList.remove('hidden');
        render();
        renderTimer = setInterval(render, 1000);
      } else {
        el.classList.add('hidden');
        if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
      }
    } catch (e) {}
  };
})();
