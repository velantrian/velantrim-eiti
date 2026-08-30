'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { extractFunction, loadFunctions, INDEX_HTML } = require('./harness');

const INDEX = fs.readFileSync(INDEX_HTML, 'utf8');
const SW = fs.readFileSync(path.join(__dirname, '..', '..', 'sw.js'), 'utf8');

test('Trace line renderer escapes labels and values before innerHTML', () => {
  const s = loadFunctions(['eitiEsc', 'eitiTraceLineHTML']);
  const payload = '<img src=x onerror=alert(1)>';
  const out = s.eitiTraceLineHTML(payload, payload);

  assert.equal(out.includes('<img'), false);
  assert.equal(out.includes('&lt;img'), true);
  assert.equal(out.includes('onerror=alert(1)>'), false);
});

test('PKG negative feedback weakens existing nodes and never creates negative weights', () => {
  const writes = [];
  const cache = {
    pkg_topic: {
      id: 'pkg_topic',
      concept: 'topic',
      category: 'general',
      weight: 5,
      seenCount: 1,
      emotionalBoost: 0,
    },
  };
  const eitiDb = {
    transaction() {
      return { objectStore() { return { put(node) { writes.push({ ...node }); } }; } };
    },
  };
  const s = loadFunctions(['pkgSaveNode'], {
    eitiDb,
    _pkgCache: cache,
    PKG_EMOTIONAL_BOOST: 5,
  });

  s.pkgSaveNode({ concept: 'topic', category: 'feedback', weight: -0.8, emotional: false });
  assert.equal(cache.pkg_topic.weight, 4.2);
  assert.equal(cache.pkg_topic.emotionalBoost, 0);

  s.pkgSaveNode({ concept: 'new topic', category: 'feedback', weight: -0.8, emotional: false });
  assert.equal(cache.pkg_new_topic.weight, 0.1);
  assert.ok(writes.length >= 2);
});

test('AI command dispatcher invokes PKG parser exactly once', () => {
  const source = extractFunction('eitiProcessCommands');
  const calls = source.match(/pkgParseAICommands\(reply\)/g) || [];
  assert.equal(calls.length, 1);

  assert.doesNotMatch(
    INDEX,
    /eitiReceiveReply\(reply\);\s*eitiProcessCommands\(reply\);/,
    'reply rendering must not dispatch the same command block twice'
  );
});

test('known model and user-controlled innerHTML fields are escaped', () => {
  assert.match(INDEX, /eitiEsc\(String\(n\.concept \|\| ''\)\)/);
  assert.match(INDEX, /eitiEsc\(String\(e\.a \|\| ''\)\)/);
  assert.match(INDEX, /eitiEsc\(trigs\.slice\(0,70\)\)/);
  assert.match(INDEX, /eitiEsc\(\(f\.answer\|\|''\)\.slice\(0,150\)\)/);
  assert.match(INDEX, /var line = eitiTraceLineHTML;/);
});

test('Strict Memory fails closed and requires explicit confidence', () => {
  assert.match(INDEX, /reasoning trace is unavailable/);
  assert.match(INDEX, /var allowed = \['Validated', 'ImmutableCore'\];/);
  assert.match(INDEX, /: \{ passed: false, reason: '⚠️ Truth Gate недоступен' \};/);
  assert.match(INDEX, /var missingConfidence = valid\.some/);
  assert.match(INDEX, /Supported-факт нельзя повысить без source\/provenance\/evidence/);
});

test('removed optional files no longer generate known 404 requests', () => {
  assert.equal(INDEX.includes("fetch('./lemma.json')"), false);
  assert.equal(INDEX.includes("fetch('./eiti_kb_v3.json')"), false);
  assert.equal(INDEX.includes("fetch('./mosc_graph_v3.json')"), false);
  assert.equal(INDEX.includes('src="./EITI_DE_i18n_patch.js"'), false);
});

test('service worker does not report a healthy install with incomplete CORE', () => {
  const core = SW.slice(SW.indexOf('var CORE'), SW.indexOf('var HEAVY'));
  assert.equal(core.includes('https://'), false);
  assert.match(SW, /Reject installation: an incomplete CORE cache must not look healthy/);
  assert.match(SW, /throw err;/);
  assert.match(SW, /e\.waitUntil\(\s*self\.registration\.showNotification/);
});
