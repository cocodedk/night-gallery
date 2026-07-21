'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// keyCode -> action name. Arrows (37/39), Enter (13) and Back (10009) arrive
// automatically on the TV and must never be passed to registerKey (throws).
// 32 (Space) is a desktop-preview convenience only; 10252/415/19 are the TV's
// media-key codes (Play/Pause variants) for pause; 403/83 are reveal
// (ColorF0Red / desktop 'S'); 406/68 are debug (ColorF3Blue / desktop 'D').
NG.KEY_ACTIONS = {
  39: 'next',
  37: 'prev',
  13: 'toggle-pause',
  32: 'toggle-pause',
  10252: 'toggle-pause',
  415: 'toggle-pause',
  19: 'toggle-pause',
  403: 'reveal',
  83: 'reveal',
  406: 'debug',
  68: 'debug',
  10009: 'back'
};

// Registers the TV remote color/media keys we actually use. Each call is
// isolated in its own try/catch: on desktop `tizen` is undefined and the
// whole function must not throw; on the TV a single bad key name must not
// stop the rest from registering. Arrows/Enter/Back are NEVER registered
// here — see the comment above NG.KEY_ACTIONS.
NG.registerTvKeys = function registerTvKeys() {
  var names = ['ColorF0Red', 'ColorF3Blue', 'MediaPlay', 'MediaPause', 'MediaPlayPause'];
  for (var i = 0; i < names.length; i++) {
    try {
      tizen.tvinputdevice.registerKey(names[i]);
    } catch (e) {
      // desktop preview (no tizen global) or key unsupported on this
      // firmware — either way, keep registering the rest.
    }
  }
};

// Wires a single document-level keydown listener that maps NG.KEY_ACTIONS
// entries to handler functions supplied by the caller (app.js).
NG.initKeys = function initKeys(handlers) {
  document.addEventListener('keydown', function (e) {
    var code = e.keyCode;
    if (NG.debug && NG.debug.noteKey) {
      NG.debug.noteKey(code);
    }
    var action = NG.KEY_ACTIONS[code];
    if (!action) { return; }
    e.preventDefault();
    if (handlers[action]) {
      handlers[action](e);
    }
  });
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KEY_ACTIONS: NG.KEY_ACTIONS };
}
