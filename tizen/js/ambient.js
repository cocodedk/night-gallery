'use strict';
var NG = typeof window !== 'undefined' ? (window.NG = window.NG || {}) : (globalThis.NG = globalThis.NG || {});

// TV deviation: draw the ambient word from a no-repeat pool instead of the
// prototype's raw Math.random() pick on AMBIENT_WORDS — reads better with
// only five words in rotation. The draw lives on NG (not a top-level var)
// so plain-script loading doesn't mint a window global.
NG.draws = NG.draws || {};

// Card contract: { node, duration(s), onEnter?, onExit? }
NG.cardAmbient = function cardAmbient() {
  if (!NG.draws.word) { NG.draws.word = NG.pool(NG.AMBIENT_WORDS); }

  const node = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-canvas';
  const word = document.createElement('div');
  word.className = 'ambient-word';
  word.textContent = NG.draws.word();
  node.appendChild(canvas);
  node.appendChild(word);

  let raf = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start() {
    const ctx = canvas.getContext('2d');
    // TV deviation: internal resolution is half the viewport. CSS
    // (cards.css .ambient-canvas) stretches it back to full-screen, giving
    // intentionally blurrier blobs — but it halves the pixels the TV's GPU
    // has to fill every draw.
    const resize = function () {
      canvas.width = Math.round(innerWidth / 2);
      canvas.height = Math.round(innerHeight / 2);
    };
    resize();

    const blobs = [];
    const palette = ['198,161,91', '94,107,102', '120,90,60', '60,70,90'];
    for (let i = 0; i < 5; i++) {
      blobs.push({
        x: Math.random(), y: Math.random(),
        r: 0.28 + Math.random() * 0.25,
        dx: (Math.random() * 2 - 1) * 0.00002, dy: (Math.random() * 2 - 1) * 0.000015,
        ph: Math.random() * Math.PI * 2,
        col: palette[i % palette.length]
      });
    }

    let t = 0;
    let frameCount = 0;
    function frame() {
      frameCount++;
      // TV deviation: throttle to ~30fps by only drawing on every other
      // rAF tick — full 60fps is wasted on slow-drifting blobs and costs
      // GPU budget this TV doesn't have to spare.
      if (frameCount % 2 !== 0) {
        raf = requestAnimationFrame(frame);
        return;
      }
      t += 1;
      ctx.fillStyle = 'rgba(12,10,7,0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        // Resolution halved above, so these canvas.width/.height-scaled
        // terms would otherwise drift at half speed; the 0.02 multipliers
        // are doubled to 0.04 so on-screen drift speed still matches the
        // prototype (the CSS 2x stretch then exactly cancels the halved
        // internal resolution).
        b.x += b.dx * canvas.width * 0.04 + Math.sin(t * 0.002 + b.ph) * 0.00008;
        b.y += b.dy * canvas.height * 0.04 + Math.cos(t * 0.0017 + b.ph) * 0.00006;
        if (b.x < -0.3) { b.x = 1.3; }
        if (b.x > 1.3) { b.x = -0.3; }
        if (b.y < -0.3) { b.y = 1.3; }
        if (b.y > 1.3) { b.y = -0.3; }
        const R = b.r * Math.min(canvas.width, canvas.height);
        const g = ctx.createRadialGradient(b.x * canvas.width, b.y * canvas.height, 0, b.x * canvas.width, b.y * canvas.height, R);
        const pulse = 0.05 + 0.02 * Math.sin(t * 0.004 + b.ph);
        g.addColorStop(0, 'rgba(' + b.col + ',' + pulse + ')');
        g.addColorStop(1, 'rgba(' + b.col + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      /* single static wash */
      ctx.fillStyle = '#0C0A07';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const R = b.r * Math.min(canvas.width, canvas.height);
        const g = ctx.createRadialGradient(b.x * canvas.width, b.y * canvas.height, 0, b.x * canvas.width, b.y * canvas.height, R);
        g.addColorStop(0, 'rgba(' + b.col + ',0.06)');
        g.addColorStop(1, 'rgba(' + b.col + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      frame();
    }
  }

  return {
    node: node,
    duration: 120,
    onEnter: function () { start(); },
    onExit: function () { if (raf) { cancelAnimationFrame(raf); } }
  };
};
