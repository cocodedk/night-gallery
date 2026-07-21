import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

// Console/pageerror entries whose text or url mention 'webapis' are expected
// on desktop: the $WEBAPIS/webapis/webapis.js script (loaded before the app
// scripts, per CLAUDE.md) only resolves inside the Tizen web runtime, never
// on a desktop file:// load. Everything else is a real regression.
const WHITELIST_RE = /webapis/i;

export function isWhitelisted(entry) {
  return WHITELIST_RE.test(entry.text || '') || WHITELIST_RE.test(entry.url || '');
}

// Launches headless Chromium at TV resolution, opens `url`, and starts
// collecting console 'error' + uncaught pageerror entries for the whole
// session (including across page.reload()).
export async function launchPage(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ text: msg.text(), url: (msg.location() || {}).url || '' });
    }
  });
  page.on('pageerror', (err) => {
    errors.push({ text: String((err && err.message) || err), url: String((err && err.stack) || '') });
  });
  await page.goto(url);
  return { browser, page, errors };
}

// Dispatches a synthetic keydown with a fixed keyCode/which (TV remotes set
// keyCode; synthetic KeyboardEvents default it to 0, so it must be forced
// via defineProperty). Lazily (re-)defines window.key so this also works
// right after a page.reload() wipes the previous injection.
export async function pressKey(page, code) {
  await page.evaluate((c) => {
    if (typeof window.key !== 'function') {
      window.key = function (code) {
        var e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
        Object.defineProperty(e, 'keyCode', { get: function () { return code; } });
        Object.defineProperty(e, 'which', { get: function () { return code; } });
        document.dispatchEvent(e);
      };
    }
    window.key(c);
  }, code);
}

export class AssertionError extends Error {}

// Returns an assertTrue(cond, desc) that prints "ok <n> <desc>" and
// increments a running counter, or throws AssertionError(desc) on failure.
export function makeAssert() {
  let n = 0;
  return function assertTrue(cond, desc) {
    if (!cond) { throw new AssertionError(desc); }
    n += 1;
    console.log('ok ' + n + ' ' + desc);
  };
}

// Polls `fn` (a self-contained function, no outer closures — it runs inside
// the page) via page.waitForFunction, then feeds the pass/fail into
// assertTrue under a single `desc`. Converts a timeout into a normal
// assertion failure instead of an uncaught exception.
export async function expectSoon(page, fn, desc, assertTrue, timeout) {
  try {
    await page.waitForFunction(fn, { timeout: timeout || 3000 });
    assertTrue(true, desc);
  } catch (e) {
    assertTrue(false, desc);
  }
}
