'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// Chess puzzles live one file per set under js/chess/ (each pushes into this
// array). content.js only initializes it so load order stays flexible.
NG.PUZZLES = NG.PUZZLES || [];

// Diagram-only "position" cards ({ fen, kind, title, note, marks, flip }) — a
// separate pool from PUZZLES, also filled one file per set under js/chess/.
NG.POSITIONS = NG.POSITIONS || [];

// Concept cards live one file per tag under js/content/ (each pushes into
// this array). content.js only initializes it so load order stays flexible.
NG.CONCEPTS = NG.CONCEPTS || [];

NG.AMBIENT_WORDS = ['stilhed', 'tænkepause', 'nightfall', 'interlude', 'ro', 'tusmørke'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLES: NG.PUZZLES, POSITIONS: NG.POSITIONS, CONCEPTS: NG.CONCEPTS, AMBIENT_WORDS: NG.AMBIENT_WORDS };
}
