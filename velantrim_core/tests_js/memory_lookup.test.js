'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadFunctions } = require('./harness');

function makeSandbox(savedValue) {
  const values = new Map();
  if (savedValue !== undefined) values.set('eiti_memory_lookup_enabled', savedValue);
  const sandbox = loadFunctions(
    ['eitiMemoryLookupIsEnabled', 'eitiPrepareContext'],
    {
      MEMORY_LOOKUP_KEY: 'eiti_memory_lookup_enabled',
      localStorage: { getItem: (key) => values.has(key) ? values.get(key) : null },
      eitiDb: {},
      _db: {},
      window: {},
      archiveCalls: 0,
    }
  );
  sandbox.eitiSearchArchive = () => {
    sandbox.archiveCalls += 1;
    return Promise.resolve([{ chatId: 'chat-1', snippets: 'previously discussed fact' }]);
  };
  return sandbox;
}

function prepare(sandbox, query, options) {
  return new Promise((resolve) => {
    sandbox.eitiPrepareContext(query, [{ role: 'system', content: 'base prompt' }], resolve, options);
  });
}

test('archive lookup is off when the setting is missing or disabled', async () => {
  for (const savedValue of [undefined, '0']) {
    const sandbox = makeSandbox(savedValue);
    assert.equal(sandbox.eitiMemoryLookupIsEnabled(), false);
    const history = await prepare(sandbox, 'How should I structure this new project?');
    assert.equal(sandbox.archiveCalls, 0);
    assert.equal(history[0].content, 'base prompt');
  }
});

test('an explicit history request searches even when automatic lookup is off', async () => {
  const sandbox = makeSandbox(undefined);
  const history = await prepare(sandbox, 'Find that in chat history', { explicitArchiveRequest: true });
  assert.equal(sandbox.archiveCalls, 1);
  assert.match(history[0].content, /РЕЗУЛЬТАТЫ ПОИСКА ПО АРХИВУ/);
  assert.match(history[0].content, /previously discussed fact/);
});

test('the opt-in setting enables archive lookup for ordinary chat', async () => {
  const sandbox = makeSandbox('1');
  assert.equal(sandbox.eitiMemoryLookupIsEnabled(), true);
  await prepare(sandbox, 'How should I structure this new project?');
  assert.equal(sandbox.archiveCalls, 1);
});
