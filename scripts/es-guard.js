#!/usr/bin/env node
'use strict';
// es-guard: deterministic static gate against Chromium-76-unsupported syntax.
// The target TV (2021 Samsung -> Tizen 6.0) is frozen on Chromium 76 forever;
// this catches regressions before they reach the device, where debugging is
// hard (no remote DevTools, no sdb shell). Scans tizen/js/*.js,
// tizen/css/*.css and tizen/index.html; exits 1 on any finding.
//
// Why each rule (Chromium version syntax landed, per caniuse):
// - optional chaining `?.`      -> Chrome 80
// - nullish coalescing `??`     -> Chrome 80 (`??=` is caught by the same rule)
// - logical assignment `&&=` `||=` -> Chrome 85
// - `String.replaceAll`         -> Chrome 85
// - `Array/String .at()`        -> Chrome 92
// - `Promise.any`               -> Chrome 85
// - `Object.hasOwn`             -> Chrome 93
// - `structuredClone`           -> Chrome 98
// - `inset:` shorthand          -> Chrome 87
// - `aspect-ratio`               -> Chrome 88
// - `clamp()/min()/max()`       -> Chrome 79/87; banned wholesale, kept simple
// - `gap:` (flexbox gap)        -> Chrome 84; grid-gap predates this but the
//                                  property name is banned wholesale to stay
//                                  strict and avoid a smarter (fragile) rule
// - `:focus-visible`            -> Chrome 86
// - `:is()` / `:where()`        -> Chrome 88
// - `@container` / `content-visibility` -> Chrome 105 / 85
// - `@import`                   -> works, but pulls a network fetch into a
//                                  serverless/offline-first app; banned as a
//                                  style-loading pattern regardless of syntax

const fs = require('fs');
const path = require('path');

// Rule lists are data so new bans are a one-line addition, not a code change.
const JS_RULES = [
  { name: 'optional-chaining', re: /\?\./ },
  { name: 'nullish-coalescing', re: /\?\?/ },
  { name: 'logical-assignment', re: /&&=|\|\|=/ },
  { name: 'replace-all', re: /\.replaceAll\s*\(/ },
  { name: 'dot-at', re: /\.at\s*\(/ },
  { name: 'promise-any', re: /\bPromise\.any\b/ },
  { name: 'object-has-own', re: /\bObject\.hasOwn\b/ },
  { name: 'structured-clone', re: /\bstructuredClone\b/ }
];

const CSS_RULES = [
  { name: 'inset-shorthand', re: /\binset\s*:/ },
  { name: 'aspect-ratio', re: /\baspect-ratio\b/ },
  { name: 'clamp-min-max', re: /(^|[^a-z-])(clamp|min|max)\(/ },
  { name: 'flex-gap', re: /\bgap\s*:/ },
  { name: 'focus-visible', re: /:focus-visible/ },
  { name: 'is-where-pseudo', re: /:(is|where)\(/ },
  { name: 'container-queries', re: /@container|\bcontent-visibility\b/ },
  { name: 'at-import', re: /@import/ }
];

const REPO_ROOT = path.join(__dirname, '..');
const findings = [];

function scanText(relPath, text, rules) {
  const lines = text.split('\n');
  for (const rule of rules) {
    const re = new RegExp(rule.re.source, 'g');
    for (let i = 0; i < lines.length; i++) {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(lines[i])) !== null) {
        findings.push(relPath + ':' + (i + 1) + ': ' + rule.name + ' matched "' + m[0] + '"');
        if (m.index === re.lastIndex) { re.lastIndex++; }
      }
    }
  }
}

function scanFile(absPath, rules) {
  let text;
  try {
    text = fs.readFileSync(absPath, 'utf8');
  } catch (e) {
    return; // missing file: skip gracefully, never crash
  }
  scanText(path.relative(REPO_ROOT, absPath), text, rules);
}

function scanDir(absDir, ext, rules) {
  let entries;
  try {
    entries = fs.readdirSync(absDir);
  } catch (e) {
    return; // missing dir (peer files not written yet): skip gracefully
  }
  for (const entry of entries) {
    if (entry.endsWith(ext)) {
      scanFile(path.join(absDir, entry), rules);
    }
  }
}

scanDir(path.join(REPO_ROOT, 'tizen', 'js'), '.js', JS_RULES);
scanDir(path.join(REPO_ROOT, 'tizen', 'js', 'content'), '.js', JS_RULES);
scanDir(path.join(REPO_ROOT, 'tizen', 'css'), '.css', CSS_RULES);
// index.html gets both rule sets applied to the whole file (script content
// and any inline/embedded CSS) — dumb and strict, per design.
const indexHtml = path.join(REPO_ROOT, 'tizen', 'index.html');
scanFile(indexHtml, JS_RULES);
scanFile(indexHtml, CSS_RULES);

if (findings.length) {
  for (const f of findings) { console.error(f); }
  process.exit(1);
} else {
  console.log('es-guard: clean');
  process.exit(0);
}
