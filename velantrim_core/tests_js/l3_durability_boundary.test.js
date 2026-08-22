'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { extractFunction, INDEX_HTML } = require('./harness');
const fs = require('fs');

test('L3 promotion is durability-only in both KB and SQLite paths', () => {
  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  const start = html.indexOf('window.eitiPromoteToL3 = async function');
  const end = html.indexOf('// Convenience for the Pending UI', start);
  assert.ok(start >= 0 && end > start);
  const src = html.slice(start, end);
  assert.match(src, /SET memory_layer='L3' WHERE id=\?/);
  assert.doesNotMatch(src, /SET[^\n]*epistemic_state/);
  assert.doesNotMatch(src, /epistemic_state\s*=\s*'Validated'/);
  assert.match(src, /memory_layer_promoted/);
});
