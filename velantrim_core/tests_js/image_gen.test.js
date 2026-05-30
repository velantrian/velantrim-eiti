'use strict';
// Tests for the image-generation pure cores (parse command / build request /
// parse response). These let a model emit [IMG: ...] and have EITI call OpenAI
// or Gemini and attach the result. The HTTP call itself is not unit-tested
// (that needs the network); we pin the request shape and response decoding,
// which is where provider-API drift silently breaks the feature.

const test = require('node:test');
const assert = require('node:assert');
const { loadFunctions } = require('./harness');

const img = loadFunctions(
  ['eitiImgParseCommand', 'eitiImgBuildRequest', 'eitiImgParseResponse'],
  { Error }
);

test('parses [IMG:], [IMAGE:] and [КАРТИНКА:] prompts, trimmed', () => {
  const got = img.eitiImgParseCommand(
    'вот идея [IMG:  кот в скафандре ] и ещё [КАРТИНКА: закат над морем]'
  );
  // Spread to the test realm (elements are primitive strings) for comparison.
  assert.deepStrictEqual([...got], ['кот в скафандре', 'закат над морем']);
});

test('no command → empty list; falsy input is safe', () => {
  assert.strictEqual(img.eitiImgParseCommand('обычный текст').length, 0);
  assert.strictEqual(img.eitiImgParseCommand('').length, 0);
  assert.strictEqual(img.eitiImgParseCommand(null).length, 0);
});

test('OpenAI request targets the images endpoint with bearer auth', () => {
  const req = img.eitiImgBuildRequest('openai', 'a fox', { key: 'sk-x', size: '512x512' });
  assert.strictEqual(req.url, 'https://api.openai.com/v1/images/generations');
  assert.strictEqual(req.method, 'POST');
  assert.strictEqual(req.headers.Authorization, 'Bearer sk-x');
  assert.strictEqual(req.body.prompt, 'a fox');
  assert.strictEqual(req.body.size, '512x512');
  assert.strictEqual(req.body.n, 1);
});

test('Gemini request puts the key in the URL and asks for an IMAGE modality', () => {
  const req = img.eitiImgBuildRequest('gemini', 'a fox', { key: 'AIzaXYZ' });
  assert.match(req.url, /generativelanguage\.googleapis\.com/);
  assert.match(req.url, /:generateContent\?key=AIzaXYZ$/);
  assert.strictEqual(req.body.generationConfig.responseModalities[0], 'IMAGE');
  assert.strictEqual(req.body.contents[0].parts[0].text, 'a fox');
});

test('empty prompt and unknown provider throw', () => {
  assert.throws(() => img.eitiImgBuildRequest('openai', '   ', {}), /empty image prompt/);
  assert.throws(() => img.eitiImgBuildRequest('midjourney', 'x', {}), /unsupported image provider/);
});

test('OpenAI response: decodes base64 and falls back to url', () => {
  const b = img.eitiImgParseResponse('openai', { data: [{ b64_json: 'QUJD' }] });
  assert.strictEqual(b.mime, 'image/png');
  assert.strictEqual(b.b64, 'QUJD');
  const u = img.eitiImgParseResponse('openai', { data: [{ url: 'https://x/y.png' }] });
  assert.strictEqual(u.url, 'https://x/y.png');
  assert.strictEqual(img.eitiImgParseResponse('openai', { data: [] }), null);
});

test('Gemini response: pulls inlineData (camelCase or snake_case)', () => {
  const camel = {
    candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: 'ZZ' } }] } }],
  };
  const c = img.eitiImgParseResponse('gemini', camel);
  assert.strictEqual(c.mime, 'image/jpeg');
  assert.strictEqual(c.b64, 'ZZ');

  const snake = {
    candidates: [{ content: { parts: [{ inline_data: { mime_type: 'image/png', data: 'YY' } }] } }],
  };
  const s = img.eitiImgParseResponse('gemini', snake);
  assert.strictEqual(s.mime, 'image/png');
  assert.strictEqual(s.b64, 'YY');
});

test('Gemini response with only text parts → null (no image)', () => {
  const json = { candidates: [{ content: { parts: [{ text: 'sorry, no image' }] } }] };
  assert.strictEqual(img.eitiImgParseResponse('gemini', json), null);
});

test('null/empty responses never throw', () => {
  assert.strictEqual(img.eitiImgParseResponse('openai', null), null);
  assert.strictEqual(img.eitiImgParseResponse('gemini', {}), null);
});
