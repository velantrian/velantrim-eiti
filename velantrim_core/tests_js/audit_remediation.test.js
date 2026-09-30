'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { extractFunction, loadFunctions, INDEX_HTML } = require('./harness');

const INDEX = fs.readFileSync(INDEX_HTML, 'utf8');
const SW = fs.readFileSync(path.join(__dirname, '..', '..', 'sw.js'), 'utf8');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'manifest.json'), 'utf8'));
const README = fs.readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf8');

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

test('runtime, service worker, manifest, and README versions stay synchronized', () => {
  const runtime = INDEX.match(/var EITI_VERSION = "([^"]+)"/);
  const cache = SW.match(/var CACHE = 'eiti-v([^']+)'/);
  const updated = SW.match(/SW_UPDATED', version: '([^']+)'/);
  const manifest = MANIFEST.description.match(/v(\d+\.\d+\.\d+)/);
  const readme = README.match(/version-(\d+\.\d+\.\d+)-gold/);

  assert.ok(runtime && cache && updated && manifest && readme);
  const versions = [runtime[1], cache[1], updated[1], manifest[1], readme[1]];
  assert.ok(versions.every((v) => v === runtime[1]),
    'runtime/SW/manifest/README versions must match, got ' + JSON.stringify(versions));
  assert.match(runtime[1], /^\d+\.\d+\.\d+$/);
  assert.equal(INDEX.includes('EITI_BUILD_DATE'), false);
});


test('OpenRouter thinking toggle persists and disables reasoning on all OR request paths', () => {
  assert.match(INDEX, /id="or-thinking-row"/);
  assert.match(INDEX, /localStorage\.getItem\('eiti_or_thinking'\) !== '0'/);
  assert.match(INDEX, /out\.reasoning = \{ enabled: false, effort: 'none', exclude: true \}/);
  assert.equal(INDEX.includes("out.reasoning_effort = 'none'"), false);
  assert.match(INDEX, /function eitiApplyORThinking\(body\)/);

  const endpoints = INDEX.match(/https:\/\/openrouter\.ai\/api\/v1\/chat\/completions/g) || [];
  assert.equal(endpoints.length, 8, 'unexpected OpenRouter chat endpoint count');

  const callSites = [
    /eitiApplyORThinking\(suggBody\)/,
    /eitiApplyORThinking\(orBody\)/,
    /eitiApplyORThinking\(\{ model: model, messages: \[\{ role: 'user', content: 'hi' \}\], max_tokens: 5 \}\)/,
    /eitiApplyORThinking\(\{ model: _orModel, messages: history, max_tokens: _maxTok, stream: true \}\)/,
    /if \(_l2Provider === 'openrouter'\) eitiApplyORThinking\(_l2Body\)/,
    /eitiApplyORThinking\(\{\s*model: 'deepseek\/deepseek-chat'/,
    /eitiApplyORThinking\(orBody\);\s*var orr = await fetch\('https:\/\/openrouter\.ai\/api\/v1\/chat\/completions'/,
    /eitiApplyORThinking\(\{ model: model, messages: apiMsgs, max_tokens: 2000 \}\)/
  ];
  callSites.forEach((re) => assert.match(INDEX, re));
});


function orSandbox(store, meta) {
  const ls = { getItem: (k) => (k in store ? store[k] : null) };
  const sb = loadFunctions([
    'eitiIsORThinking', 'eitiORThinkingKind', 'eitiORThinkingActive', 'eitiApplyORThinking',
    'eitiGetOpenRouterModelBrand', 'eitiORModelIconHtml', 'eitiOREscape', 'eitiORModelDisplayName',
    'eitiORModelLabelHtml', 'eitiORSenderHtml', 'eitiDetectThinkMode', 'eitiThinkModeLabel'
  ], { localStorage: ls, _eitiORModelMeta: meta || {}, eitiGetDsModel: () => 'deepseek-v4-pro',
       eitiIsDsReasoningMode: () => true,
       });
  loadBrandTables(sb);
  return sb;
}
function loadBrandTables(sb) {
  const src = INDEX.slice(INDEX.indexOf('var EITI_OR_BRANDS'), INDEX.indexOf('// Returns a key of EITI_OR_BRANDS'));
  require('node:vm').runInContext(src, sb);
}

test('OR Thinking OFF sends the unified disabling reasoning object only', () => {
  const sb = orSandbox({ eiti_or_thinking: '0' });
  const out = sb.eitiApplyORThinking({ model: 'xiaomi/mimo-v2.6-pro', reasoning_effort: 'high' });
  assert.deepEqual(JSON.parse(JSON.stringify(out.reasoning)), { enabled: false, effort: 'none', exclude: true });
  assert.equal('reasoning_effort' in out, false);
});

test('OR Thinking ON (or unset) forces nothing', () => {
  for (const store of [{ eiti_or_thinking: '1' }, {}]) {
    const out = orSandbox(store).eitiApplyORThinking({ model: 'openai/gpt-6' });
    assert.equal('reasoning' in out, false);
    assert.equal('reasoning_effort' in out, false);
  }
});

test('OR Thinking OFF is not claimed for mandatory/unsupported models', () => {
  const meta = { 'a/m': { mandatory: true, supported: true }, 'a/u': { mandatory: false, supported: false } };
  const sb = orSandbox({ eiti_or_thinking: '0' }, meta);
  assert.equal('reasoning' in sb.eitiApplyORThinking({ model: 'a/m' }), false);
  assert.equal('reasoning' in sb.eitiApplyORThinking({ model: 'a/u' }), false);
  assert.equal(sb.eitiORThinkingActive('a/m'), true);
  assert.equal(sb.eitiORThinkingKind('openrouter/auto'), 'router');
});

test('Thinking OFF header has no Think/Thinking/brain; ON may show it', () => {
  const off = orSandbox({ eiti_ai_provider: 'openrouter', eiti_or_thinking: '0' });
  // DeepSeek Pro settings must not leak a Think badge into an OpenRouter reply
  assert.equal(off.eitiDetectThinkMode('объясни подробно'), 'normal');
  const h = off.eitiORSenderHtml('xiaomi/mimo-v2.6-pro', false);
  assert.doesNotMatch(h, /Think|Thinking|🧠/);
  const on = orSandbox({ eiti_ai_provider: 'openrouter' });
  assert.equal(on.eitiDetectThinkMode('hi'), 'think_pro');
  assert.match(on.eitiORSenderHtml('xiaomi/mimo-v2.6-pro', true), /Think.*🧠/);
});

test('OpenRouter brand mapping is prefix-first with neutral fallback', () => {
  const sb = orSandbox({});
  loadBrandTables(sb);
  const b = sb.eitiGetOpenRouterModelBrand;
  const cases = {
    'openai/gpt-6-luna': 'openai', 'anthropic/claude-sonnet-5.5': 'anthropic', 'deepseek/deepseek-v4.1-flash': 'deepseek',
    'xiaomi/mimo-v2.6-pro': 'mimo', 'z-ai/glm-5.3-flash': 'glm', 'moonshotai/kimi-k3': 'kimi',
    'nvidia/nemotron-3-ultra:free': 'nvidia', 'google/gemma-4:free': 'google', 'qwen/qwen3:free': 'qwen',
    'meta-llama/llama-3.3-70b-instruct': 'meta', 'mistralai/mistral-large': 'mistral', 'x-ai/grok-4': 'xai',
    'minimax/minimax-m2': 'minimax', 'cohere/north-mini-code:free': 'cohere', 'poolside/laguna-s-2.1:free': 'poolside', 'liquid/lfm2.5:free': 'liquid', 'inclusionai/ling-3.0:free': 'inclusion', 'thinkingmachines/inkling:free': 'thinking', 'unknown/foo': 'openrouter', 'openrouter/auto': 'openrouter', '': 'openrouter'
  };
  for (const [id, brand] of Object.entries(cases)) assert.equal(b(id), brand, id);
  assert.equal(b('someone/kimi-clone'), 'kimi'); // family matcher fallback
});

test('OR model names are escaped before innerHTML; icons come from local table', () => {
  const sb = orSandbox({}, { 'x/y': { name: '<img src=x onerror=alert(1)>' } });
  loadBrandTables(sb);
  const h = sb.eitiORSenderHtml('x/y', false);
  assert.equal(h.includes('<img'), false);
  assert.match(h, /&lt;img/);
  assert.equal(/<img|href=|xlink|https?:/.test(sb.eitiORModelIconHtml('x/y')), false);
});

test('OpenRouter errors expose provider detail and escape it; speed badge and custom list exist', () => {
  assert.match(INDEX, /_em\.provider_name/);
  assert.match(INDEX, /eitiOREscape\(errMsg\)/);
  assert.match(INDEX, /ток\/с/);
  assert.match(INDEX, /function eitiRenderORFreeList\(\)/);
  assert.match(INDEX, /t\.textContent = opt\.textContent/);
});

test('OR chat: Think badge comes only from real reasoning deltas; one retry on 429', () => {
  assert.equal(INDEX.includes("eitiORSenderHtml(_orLiveModel, _thinkMode"), false);
  assert.match(INDEX, /_orrc && eitiORThinkingActive\(_orModel\)/);
  assert.match(INDEX, /r0\.status !== 429/);
});
