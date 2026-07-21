# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Night Gallery

An **ambient learning canvas for a Samsung Tizen TV** — something between a
screensaver and a course. One beautiful full-screen "card" at a time, styled
like a museum at night (deep warm black, gilded hairline frame, large serif
type readable across the room). It must always satisfy three functions:

1. **Teach** — chess puzzles with delayed solution reveal, concept cards
   (systems design, electronics, chess ideas, geography, Danish words,
   thinking tools).
2. **Run in the background** — fully autonomous rotation, nothing urgent,
   no sound, no required input. It *rewards glances*, never demands attention.
3. **Beautify the room** — every card is decor first; ambient interludes with
   slow drifting light let the room breathe between learning cards.

Any change that weakens one of the three functions is wrong, however pretty
the code.

**Hard constraint — no server, ever.** The app is a fully self-contained
`.wgt`: all content, fonts, and assets ship inside the widget, and it must run
complete with the TV's network unplugged. No backend, no companion server, no
host machine, no CDN — this is the opposite of Babak TV's architecture, so
never copy its server/client split. Content updates happen by editing the data
files, bumping the version, and reinstalling. Direct TV→internet calls (e.g.
Lichess) are permitted only as optional enhancement: the app must behave
identically minus freshness when they fail.

## Agent workflow (IMPORTANT — how to work on this repo)

- **Fable** (`claude-fable-5`) is the **advisor & planner**: owns architecture,
  design decisions, task breakdown, and reviewing/verifying executor output.
  Fable plans and delegates rather than doing bulk implementation itself.
- **Sonnet** (`claude-sonnet-5`) is the **executor**: writes and edits code from
  Fable's spec. Dispatch via the Agent tool with `model: "sonnet"`.
- **Per task:** Fable plans → dispatches one or more Sonnet executors with a
  precise spec → Fable reviews/verifies before moving on.

## Current state: greenfield

There is **no app code yet**. The reference implementation is
`docs/inspiration/night-gallery.html` — a working single-file desktop
prototype. It defines the aesthetic, content, and rotation mechanics; port it,
don't reinvent it. Its anatomy:

- **Content pools**: `PUZZLES` (7 FEN mate-in-1/2 positions + notes) and
  `AMBIENT_WORDS` live in `js/content.js`; `CONCEPTS` (585 tagged cards) is
  filled by one file per tag under `js/content/` (14 tags — Dansk, Farsi,
  Chess, Latin, Sun Tzu, Math, …). Each pool draws via `pool()`, a reshuffling
  no-repeat bag. `docs/CONTENT-INDEX.md` lists every card (generated —
  `npm run content-index`).
- **Card makers** (`cardPuzzle` / `cardConcept` / `cardAmbient`) each return
  `{ node, duration, onEnter?, onExit?, reveal? }` — the whole card contract.
- **Rotation engine**: `SEQUENCE = [puzzle, concept, concept, ambient]`
  (300s / 150s / 150s / 120s), two fixed stages crossfaded for transitions,
  history for back-navigation, rAF-driven progress bar, corner clock,
  cursor auto-hide. Puzzle solutions auto-reveal after 240s.

## Target hardware (hard constraints)

The TV is a **2021 Samsung → Tizen 6.0 → Chromium 76**, frozen
forever. Chromium 76 is law: check every CSS/JS feature against it (caniuse)
before use. ES2015 (`const`, arrows, `for…of`, destructuring) is fine — the
prototype already complies. **Not** available on 76: `?.`, `??`, flex `gap`,
`aspect-ratio`, `inset` shorthand, `min()/max()/clamp()`, `:focus-visible`.

Known prototype → TV fixes (found by audit, do these during the port):

- `inset:` shorthand is used throughout (`#frame`, `.stage`, canvas…) —
  Chrome 87+. Replace with `top/right/bottom/left`.
- The Google Fonts `@import` needs network and blocks the museum look if it
  fails — bundle Cormorant Garamond + IBM Plex Sans as woff2 in the `.wgt`,
  with system-font fallbacks.
- Chess pieces are Unicode glyphs relying on desktop fonts (DejaVu/Segoe UI
  Symbol) — verify glyph coverage on the actual TV early; fall back to a
  bundled font or inline SVG pieces.
- Remote has no Space/S: remap prototype keys — ArrowLeft/Right stay (delivered
  automatically), pause → OK/Enter (13), reveal solution → a color key
  (register it first), and **Back (10009) must be handled** or it exits the app.

Platform rules (proven in the sibling Babak TV project):

- Arrows (37–40), Enter (13), Back (10009) arrive automatically — registering
  them throws. Every other key needs `tizen.tvinputdevice.registerKey()` and
  the `tv.inputdevice` privilege.
- Load `$WEBAPIS/webapis/webapis.js` before app scripts; guard every
  `tizen`/`webapis` call in try/catch so desktop preview keeps working.
- No frameworks, no build step: plain HTML/CSS/JS packaged as a signed `.wgt`.

## Commands

```bash
npm run smoke        # G1: node --check every tizen/js file
npm run test         # G2: unit tests (Node, zero deps)
npm run guard        # G3: Chromium-76 feature guard (scripts/es-guard.js)
npm run e2e          # G4: Playwright 1920×1080 over file:// (devDep: playwright)
npm run check        # G1+G2+G3+G4
npm run install-tv   # G5: package, verify, install, launch (scripts/install-tv.sh)
python3 scripts/make-icon.py   # regenerate tizen/icon.png
npm run content-index          # regenerate docs/CONTENT-INDEX.md (pre-commit
                               # fails if it is stale — never edit it by hand)
```

Desktop preview (catches everything except real remote keys and fonts):

```bash
python3 -m http.server 8080   # from the app dir; open in Chrome at 1920×1080
```

This server is a **dev convenience only** — the app itself must never depend
on one. It should equally work opened as a plain `file://` page.

Tizen pipeline (CLIs are not on PATH — `$HOME/tizen-studio/tools/ide/bin/tizen`
and `$HOME/tizen-studio/tools/sdb`):

```bash
sdb connect <tv-ip>:26101              # or let install-tv.sh auto-discover
tizen package -t wgt -s <profile> -- . # reuse the existing signing profile
tizen install -n NightGallery.wgt -t <target>
tizen run -p <package.AppId> -t <target>
```

(The known-good TV address, target name, and profile for this household live
in local memory, not in the repo — the installer auto-discovers the TV.)

Traps (both cost hours in Babak TV — see its `scripts/install-tv.sh`):
`tizen build-web` prints a scary-but-cosmetic Java stack trace; and a `.wgt`
whose **filename contains a space fails to install with a silent, reasonless
error** — always copy to a space-free name first. `sdb shell` does not work on
this retail TV. Developer mode: Apps panel → type `12345` → toggle on → set
host PC IP → reboot.

## Install strategy — fewest retrials (IMPORTANT)

TV installs are the expensive, slow, half-blind part of the loop. Never
install to "see if it works". Every install must pass ALL gates first, in
order (`npm run check` runs G1–G4):

- **G1 `npm run smoke`** — `node --check` syntax pass over every `tizen/js`
  file.
- **G2 `npm run test`** — unit tests for the pure logic (content data, FEN,
  pools, rotation engine with a fake clock).
- **G3 `npm run guard`** — static scan that fails on any Chromium-76-unsupported
  feature (`?.`, `??`, `inset:`, `gap:`, `clamp()/min()/max()`, `aspect-ratio`,
  `:focus-visible`, `@import`). This gate exists because these break silently,
  at runtime, on the TV only.
- **G4 `npm run e2e`** — Playwright at exactly 1920×1080 against the app over
  `file://`: boot, fonts load, rotation, every remote key action via synthetic
  `keyCode` events, zero unexpected console errors.
- **G5 package verify** — built into `scripts/install-tv.sh`: unzip listing of
  the `.wgt`, build stamp check, space-free filename.
- **G6 the first install is a PROBE, not a test.** The app ships an on-screen
  debug overlay (BLUE key / D) that reports every device unknown at once:
  build stamp, font/glyph load results, fps, screensaver-API outcome, last
  received key codes, captured console log. One instrumented session answers
  all "only-on-TV" questions; fix everything it reveals as one batch, then
  reinstall once.
- **G7 soak.** Let it run for hours; watch for screen dimming (screensaver
  suppression), canvas slowdown, memory creep. Note: the TV's Eco "Auto Power
  Off" setting can kill any always-on app regardless of code — disable it in
  TV settings for gallery use.

Bump the `#stamp` build number in `tizen/index.html` on **every** install and
confirm it on-screen — reinstalls don't always reload the page, and debugging
stale code is how you lose an evening.

## Skills

| Situation | Skill |
|---|---|
| Any Tizen build/package/install/debug or engine-compat question | `samsung-tizen-app` (read its references before fighting the TV) |
| Before writing or editing code | `karpathy-guidelines` |
| UI / visual work | `frontend-design:frontend-design` |
| After implementing, before commit | `simplify` (loop until zero edits), then `/code-review` |

## Related projects

- **Babak TV** — private sibling Tizen app for the same TV (local checkout;
  path in local memory). Its `tizen/DEVELOPMENT.md` (spatial nav, key codes,
  config.xml, image CORS) and installer are the authoritative platform
  references; copy its *platform* patterns, but **not** its client↔server
  architecture (see the no-server constraint).
- [`cocodedk/chess-puzzles`](https://github.com/cocodedk/chess-puzzles) —
  Android chess puzzle game built on real Lichess tactics. Source of puzzle
  data/format ideas when the puzzle channel outgrows the built-in seven; the
  planned refresh path is Lichess's free daily-puzzle API (needs `<access>` +
  CSP `connect-src`, and must degrade gracefully offline).

## Git hooks (same regime as Babak TV)

Versioned in `.githooks/`; activate once per clone with
`bash scripts/install-hooks.sh` (sets `core.hooksPath`).

- **pre-commit** — fast deterministic gates only: `npm run smoke`, `npm test`,
  `npm run guard` (the Chromium-76 guard), and a 200-line advisory on staged
  files. The slow e2e gate is deliberately NOT here — it belongs to the
  pre-install checklist.
- **commit-msg** — enforces Conventional Commits.
- **pre-push** — locks pushes to `cocodedk/*` remotes, blocks deletion and
  non-fast-forward pushes to protected branches, re-runs smoke.

## Engineering principles

- **200-line max per code file** (js/mjs/css/html/sh). Markdown is exempt —
  docs are allowed to be long. The prototype is one 519-line file; the port
  splits it (content data / card makers / rotation engine / platform glue).
  Card data lives one file per tag under `tizen/js/content/`; a tag that
  outgrows the cap splits into `<tag>-2.js`, never into per-card files.
- **TDD for logic.** FEN→board parsing, the pool/shuffle, and the rotation
  engine are pure and testable headless in Node; write those tests first.
- **DRY / KISS / YAGNI.** No speculative abstraction; the card contract
  (`{node, duration, onEnter, onExit, reveal}`) is the only extension point
  needed for new channels.
- **Conventional Commits.**

## Roadmap

- [x] Scaffold `tizen/` (config.xml, index.html, css/, js/, icon.png) from the
      prototype, applying the prototype→TV fixes above (2026-07-21; all four
      gates green, adversarially reviewed)
- [ ] Package/sign/install on the TV via the BabakTV profile; verify fonts and
      chess glyphs on-device
- [ ] Optional: Lichess daily-puzzle fetch, direct TV→lichess.org (no middle
      server; built-in puzzles remain the fully functional offline baseline)
- [ ] Rebalance rotation weights after living with it (the schedule is one line)
