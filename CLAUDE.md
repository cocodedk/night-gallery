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

- **Content pools**: `PUZZLES` (7 FEN mate-in-1/2 positions + notes),
  `CONCEPTS` (17 tagged cards), `AMBIENT_WORDS` — each drawn via `pool()`,
  a reshuffling no-repeat bag.
- **Card makers** (`cardPuzzle` / `cardConcept` / `cardAmbient`) each return
  `{ node, duration, onEnter?, onExit?, reveal? }` — the whole card contract.
- **Rotation engine**: `SEQUENCE = [puzzle, concept, concept, ambient]`
  (300s / 150s / 150s / 120s), two fixed stages crossfaded for transitions,
  history for back-navigation, rAF-driven progress bar, corner clock,
  cursor auto-hide. Puzzle solutions auto-reveal after 240s.

## Target hardware (hard constraints)

The TV is a **Samsung UE50AU8005 (2021) → Tizen 6.0 → Chromium 76**, frozen
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

Desktop preview (catches everything except real remote keys and fonts):

```bash
python3 -m http.server 8080   # from the app dir; open in Chrome at 1920×1080
```

Tizen pipeline (CLIs are not on PATH — `$HOME/tizen-studio/tools/ide/bin/tizen`
and `$HOME/tizen-studio/tools/sdb`):

```bash
sdb connect 192.168.0.201:26101        # known-good TV address
tizen package -t wgt -s BabakTV -- .   # reuse the existing signing profile
tizen install -n NightGallery.wgt -t UE50AU8005KXXC
tizen run -p <package.AppId> -t UE50AU8005KXXC
```

Traps (both cost hours in Babak TV — see its `scripts/install-tv.sh`):
`tizen build-web` prints a scary-but-cosmetic Java stack trace; and a `.wgt`
whose **filename contains a space fails to install with a silent, reasonless
error** — always copy to a space-free name first. `sdb shell` does not work on
this retail TV. Developer mode: Apps panel → type `12345` → toggle on → set
host PC IP → reboot.

## Skills

| Situation | Skill |
|---|---|
| Any Tizen build/package/install/debug or engine-compat question | `samsung-tizen-app` (read its references before fighting the TV) |
| Before writing or editing code | `karpathy-guidelines` |
| UI / visual work | `frontend-design:frontend-design` |
| After implementing, before commit | `simplify` (loop until zero edits), then `/code-review` |

## Related projects

- `~/projects/Babak TV` — sibling Tizen app for the **same TV**. Its
  `tizen/DEVELOPMENT.md` (spatial nav, key codes, config.xml, image CORS) and
  `scripts/install-tv.sh` (full auto-discover→package→install pipeline) are
  the authoritative platform references; copy patterns from there first.
- [`cocodedk/chess-puzzles`](https://github.com/cocodedk/chess-puzzles) —
  Android chess puzzle game built on real Lichess tactics. Source of puzzle
  data/format ideas when the puzzle channel outgrows the built-in seven; the
  planned refresh path is Lichess's free daily-puzzle API (needs `<access>` +
  CSP `connect-src`, and must degrade gracefully offline).

## Engineering principles

- **200-line max per file.** The prototype is one 519-line file; the port
  splits it (content data / card makers / rotation engine / platform glue).
- **TDD for logic.** FEN→board parsing, the pool/shuffle, and the rotation
  engine are pure and testable headless in Node; write those tests first.
- **DRY / KISS / YAGNI.** No speculative abstraction; the card contract
  (`{node, duration, onEnter, onExit, reveal}`) is the only extension point
  needed for new channels.
- **Conventional Commits.**

## Roadmap

- [ ] Scaffold `tizen/` (config.xml, index.html, css/, js/, icon.png) from the
      prototype, applying the prototype→TV fixes above
- [ ] Package/sign/install on the TV via the BabakTV profile; verify fonts and
      chess glyphs on-device
- [ ] Lichess daily-puzzle integration (offline-safe)
- [ ] Rebalance rotation weights after living with it (the schedule is one line)
