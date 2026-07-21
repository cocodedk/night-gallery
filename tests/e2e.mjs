// Playwright integration test: run with `node tests/e2e.mjs`. This is the
// last gate before packaging — it drives the real index.html headlessly and
// exercises the wired-together contract (keys -> rotation -> stage -> cards)
// the way a remote control would, plus the platform bits (fonts, debug
// overlay, back-to-exit) that unit tests can't see.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchPage, pressKey, isWhitelisted, makeAssert, expectSoon, AssertionError } from './e2e-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.join(__dirname, '..', 'tizen', 'index.html');

// Self-contained page-side predicates for page.waitForFunction — must not
// close over any outer-scope variable, they run inside the browser.
function boardReady() {
  const board = document.querySelector('.board');
  if (!board) { return false; }
  return board.querySelectorAll('.sq').length === 64 && board.querySelectorAll('.pc').length >= 1;
}
function solutionShown() {
  const sol = document.querySelector('.solution');
  return !!(sol && sol.classList.contains('shown'));
}
function conceptReady() {
  const t = document.querySelector('.concept-title');
  return !!(t && t.textContent && t.textContent.trim().length > 0);
}
function ambientReady() {
  return !!document.querySelector('canvas.ambient-canvas');
}

async function main() {
  const { browser, page, errors } = await launchPage(url);
  const assertTrue = makeAssert();
  try {
    const stampVisible = await page.locator('#stamp').isVisible();
    const stampText = ((await page.locator('#stamp').textContent()) || '').trim();
    assertTrue(stampVisible && /^b\d\d$/.test(stampText), '#stamp visible and matches /^b\\d\\d$/');

    await expectSoon(page, boardReady, 'first card is a chess puzzle (.board with 64 .sq, >=1 .pc)', assertTrue, 3000);

    await page.evaluate(() => document.fonts.ready);
    const fontsOk = await page.evaluate(() => {
      return document.fonts.check('17px "Cormorant Garamond"') &&
        document.fonts.check('17px "IBM Plex Sans"') &&
        document.fonts.check('17px "NG Chess"', '♔');
    });
    assertTrue(fontsOk, 'bundled fonts (Cormorant Garamond, IBM Plex Sans, NG Chess) load from file://');

    await pressKey(page, 403);
    await expectSoon(page, solutionShown, 'reveal (403) gives .solution the .shown class', assertTrue, 2000);

    await page.reload();
    await expectSoon(page, boardReady, 'fresh puzzle after reload', assertTrue, 3000);
    await pressKey(page, 83);
    await expectSoon(page, solutionShown, 'reveal (83) gives .solution the .shown class', assertTrue, 2000);

    await pressKey(page, 39);
    await expectSoon(page, conceptReady, 'next (39) -> concept card with non-empty .concept-title', assertTrue, 3000);
    await pressKey(page, 39);
    await pressKey(page, 39);
    await expectSoon(page, ambientReady, 'next (39) x2 more -> ambient canvas.ambient-canvas', assertTrue, 3000);
    await pressKey(page, 39);
    await expectSoon(page, boardReady, 'next (39) -> puzzle again', assertTrue, 3000);

    await pressKey(page, 37);
    await expectSoon(page, ambientReady, 'prev (37) -> back to ambient', assertTrue, 3000);

    const canvasWidth = await page.evaluate(() => {
      const c = document.querySelector('canvas.ambient-canvas');
      return c ? c.width : -1;
    });
    assertTrue(canvasWidth === 960, 'ambient canvas internal width is 960 (half of 1920, TV fill-cost adaptation)');

    await pressKey(page, 13);
    await page.waitForTimeout(100);
    const w1 = await page.$eval('#bar', (el) => el.style.width);
    await page.waitForTimeout(700);
    const w2 = await page.$eval('#bar', (el) => el.style.width);
    assertTrue(w1 === w2, 'paused: #bar width unchanged 700ms apart');
    await pressKey(page, 13);
    await page.waitForTimeout(700);
    const w3 = await page.$eval('#bar', (el) => el.style.width);
    assertTrue(parseFloat(w3) > parseFloat(w2), 'resumed: #bar width increased 700ms later');

    await pressKey(page, 10009);
    const hint1 = await page.locator('#exit-hint').isVisible();
    assertTrue(hint1, 'back (10009) shows #exit-hint');
    await pressKey(page, 10009);
    assertTrue(true, 'second back (10009) does not crash (tizen undefined caught on desktop)');
    await page.waitForTimeout(3200);
    const hint2 = await page.locator('#exit-hint').isVisible();
    assertTrue(!hint2, '#exit-hint hides again ~3.2s later (single-press path re-hides)');

    await pressKey(page, 406);
    const dbgVisible = await page.locator('#debug').isVisible();
    const dbgText = (await page.locator('#debug').textContent()) || '';
    assertTrue(dbgVisible && /fps/i.test(dbgText), 'debug (406) shows #debug with "fps" in its text');
    await pressKey(page, 406);
    const dbgVisible2 = await page.locator('#debug').isVisible();
    assertTrue(!dbgVisible2, 'debug (406) again hides #debug');

    const clockText = ((await page.locator('#clock').textContent()) || '').trim();
    assertTrue(/^\d\d:\d\d$/.test(clockText), '#clock matches /^\\d\\d:\\d\\d$/');

    const unexpected = errors.filter((e) => !isWhitelisted(e));
    assertTrue(unexpected.length === 0, 'no unexpected console/page errors' +
      (unexpected.length ? (': ' + JSON.stringify(unexpected.slice(0, 3))) : ''));

    console.log('e2e: all assertions passed');
    process.exitCode = 0;
  } catch (e) {
    if (e instanceof AssertionError) {
      console.error('FAIL ' + e.message);
    } else {
      console.error('FAIL (unexpected error): ' + ((e && e.stack) || e));
    }
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
