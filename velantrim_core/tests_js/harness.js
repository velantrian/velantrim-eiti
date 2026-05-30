'use strict';
// Read-only test harness for the EITI single-file PWA.
//
// We do NOT modify index.html (the "single-file is sacred" rule in AGENTS.md).
// Instead we read it, slice out individual top-level functions by name, and run
// them inside an isolated Node `vm` sandbox so their pure logic can be unit-tested.
//
// Extraction relies on the monolith's consistent formatting: every top-level
// script function is indented by exactly 8 spaces, and its closing brace sits on
// its own line at the same 8-space indent. Nested braces are always more deeply
// indented, so this is robust against `{` inside regex/strings (e.g. `{3,}`).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INDEX_HTML = path.join(__dirname, '..', '..', 'index.html');
const LINES = fs.readFileSync(INDEX_HTML, 'utf8').split('\n');

/** Return the exact source text of a top-level function by name. */
function extractFunction(name) {
  const startRe = new RegExp('^ {8}(?:async )?function ' + name + '\\b');
  let start = -1;
  for (let i = 0; i < LINES.length; i++) {
    if (startRe.test(LINES[i])) { start = i; break; }
  }
  if (start === -1) throw new Error('Function not found in index.html: ' + name);

  const closeRe = /^ {8}\}\s*$/;
  let end = -1;
  for (let i = start + 1; i < LINES.length; i++) {
    if (closeRe.test(LINES[i])) { end = i; break; }
  }
  if (end === -1) throw new Error('Closing brace not found for: ' + name);

  return LINES.slice(start, end + 1).join('\n');
}

/**
 * Build a sandbox, define the named functions inside it, and return the sandbox.
 * `extras` injects/overrides globals the functions reference as free variables
 * (e.g. _pkgCache, eitiDb, PKG_DECAY_PER_DAY, window, a fake Date).
 */
function loadFunctions(names, extras) {
  const sandbox = Object.assign({
    Math, Date, RegExp, Array, Object, JSON,
    parseFloat, parseInt, isNaN, String, Number, console,
  }, extras || {});
  vm.createContext(sandbox);
  for (const name of names) {
    vm.runInContext(extractFunction(name), sandbox, { filename: name + '.extracted.js' });
  }
  return sandbox;
}

module.exports = { extractFunction, loadFunctions, INDEX_HTML };
