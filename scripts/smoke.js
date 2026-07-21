#!/usr/bin/env node
'use strict';
// Recursive `node --check` over every .js file under tizen/js, so new
// content files are covered automatically without editing package.json.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'tizen', 'js');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); }
    else if (e.name.endsWith('.js')) { files.push(p); }
  }
})(root);

for (const f of files) {
  execFileSync(process.execPath, ['--check', f], { stdio: 'inherit' });
}
console.log('smoke: ' + files.length + ' files node --check clean');
