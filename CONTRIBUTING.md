# Contributing to Night Gallery

Night Gallery is a serverless, self-contained Tizen TV app — no framework,
no build step, no backend. Contributions that keep it that way are welcome.

## Local setup

```bash
node --version   # >= 20
npm ci           # installs Playwright, the only devDependency
npx playwright install chromium
```

The app itself has zero runtime dependencies. `npm ci` only pulls in test
tooling.

## Install git hooks

```bash
bash scripts/install-hooks.sh
```

This points git at the versioned hooks in `.githooks/` for this clone:

- **pre-commit** — runs `npm run smoke`, `npm test`, `npm run guard`, and
  checks `docs/CONTENT-INDEX.md` isn't stale.
- **commit-msg** — enforces [Conventional Commits](https://www.conventionalcommits.org/).
- **pre-push** — locks pushes to `cocodedk/*` remotes, blocks force-pushes
  and deletion of protected branches, and re-runs the smoke check.

## Build/test commands

| Command | Gate | What it checks |
|---|---|---|
| `npm run smoke` | G1 | `node --check` syntax pass over every `tizen/js` file |
| `npm test` | G2 | Unit tests for the pure logic (content data, FEN parsing, pools, rotation) |
| `npm run guard` | G3 | Static scan for Chromium-76-unsupported CSS/JS |
| `npm run e2e` | G4 | Playwright at 1920×1080 over `file://`: boot, fonts, rotation, every remote key |
| `npm run check` | G1–G4 | All of the above, in order |
| `npm run content-index` | — | Regenerates `docs/CONTENT-INDEX.md` |
| `npm run install-tv` | — | Package, sign, install, and launch on a real TV |

Run `npm run check` before opening a pull request. It's the same set of
gates pre-commit runs, plus the slower Playwright pass that only runs here
and before a TV install.

## Adding content cards

This is the most common contribution: one concept card is one line, added to
the tag's file under `tizen/js/content/<tag>.js` (Systems, Electronics,
Chess, Geography, Dansk, Farsi, Latin, Sun Tzu, Math, Physics, Design,
History, Security, or Thinking). If a tag file is about to cross 200 lines,
split it into `<tag>-2.js` rather than moving to one file per card.

Style rules for card text:

- 1–2 sentences, 15–45 words total.
- At most one `<em>` per card.
- Curly quotes (`’ “ ”`), not straight ones.
- No `?.` or `??` sequences anywhere in the string — `npm run guard` scans
  card text along with code, since these are Chromium-76-unsupported syntax
  and a stray one in a string can still trip a naive scanner or, worse, get
  copy-pasted into real code later.
- State only what you can verify. If you can't confirm a fact, cut it or
  soften the claim rather than guess.

After adding or editing a card:

```bash
npm run content-index
```

and stage the regenerated `docs/CONTENT-INDEX.md` along with your change —
pre-commit fails if the index is stale, and it must never be hand-edited.

## The Chromium-76 rule

The target TV (2021 Tizen 6.0) is frozen on Chromium 76 forever. Before using
any new CSS or JS feature, check it against
[caniuse.com](https://caniuse.com) for Chrome 76 support. `npm run guard` is
the enforced gate — it fails the build on `?.`, `??`, `inset:` shorthand,
flex `gap`, `clamp()/min()/max()`, `aspect-ratio`, `:focus-visible`, `@import`,
and a few others. If `guard` passes, you're clear; if it's close, don't rely
on judgment — look it up.

## File size

200 lines max per code file (`.js`, `.mjs`, `.css`, `.html`, `.sh`).
Markdown is exempt. Split by concern, not by line-count games — a tag's
content file splits into `<tag>-2.js`, a module splits along a natural
boundary.

## Branches and commits

Branch names: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`, or `ci/`
followed by kebab-case, e.g. `feature/farsi-tag-cards`. Open pull requests
against `main`. Commit messages follow Conventional Commits
(`type(scope): description`); the `commit-msg` hook enforces this once
installed.

## Recommended local git config

```bash
git config pull.rebase true
git config core.autocrlf input
git config push.autoSetupRemote true
```

## PR checklist

- [ ] `npm run check` passes locally.
- [ ] `docs/CONTENT-INDEX.md` regenerated and staged, if content changed.
- [ ] New CSS/JS checked against Chromium 76 on caniuse, if applicable.
- [ ] No file over 200 lines (Markdown exempt).
- [ ] Commit messages follow Conventional Commits.
- [ ] Branch name follows the `type/kebab-case` convention.
