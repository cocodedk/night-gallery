'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// index.html loads content.js and pool.js before this file, so eager init
// would be safe — but staying lazy costs nothing and is defensive against
// load-order changes. Draws live on NG (not top-level vars) so plain-script
// loading doesn't mint window globals.
NG.draws = NG.draws || {};

// Card contract: { node, duration(s), onEnter?, onExit?, reveal? }
NG.cardPuzzle = function cardPuzzle() {
  if (!NG.draws.puzzle) { NG.draws.puzzle = NG.pool(NG.PUZZLES); }
  const p = NG.draws.puzzle();

  const node = document.createElement('div');
  node.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.innerHTML = 'Tactics <span class="dim">·</span> ' + p.task;

  const caption = document.createElement('div');
  caption.className = 'caption';
  const sol = document.createElement('div');
  sol.className = 'solution';
  sol.textContent = p.solution;
  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.style.cssText = 'font-family:var(--utility);font-weight:300;font-size:2vmin;letter-spacing:0.06em;color:var(--smoke);margin-top:1.4vmin;';
  sub.textContent = p.note;
  caption.appendChild(sol);
  caption.appendChild(sub);

  node.appendChild(eyebrow);
  node.appendChild(NG.buildBoard(p.fen));
  node.appendChild(caption);

  let timer = null;
  const reveal = function () { sol.classList.add('shown'); };
  return {
    node: node,
    duration: 300,
    onEnter: function () { timer = setTimeout(reveal, 240000); },
    onExit: function () { clearTimeout(timer); },
    reveal: reveal
  };
};

NG.cardConcept = function cardConcept() {
  if (!NG.draws.concept) { NG.draws.concept = NG.pool(NG.CONCEPTS); }
  const c = NG.draws.concept();

  const node = document.createElement('div');
  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = c.tag;

  const title = document.createElement('div');
  title.className = 'concept-title';
  title.textContent = c.title;

  const rule = document.createElement('div');
  rule.className = 'concept-rule';

  const body = document.createElement('div');
  body.className = 'concept-body';
  body.innerHTML = c.body;

  node.appendChild(eyebrow);
  node.appendChild(title);
  node.appendChild(rule);
  node.appendChild(body);

  return { node: node, duration: 150 };
};
