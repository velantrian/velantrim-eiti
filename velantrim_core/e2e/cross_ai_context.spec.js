// @ts-check
const { test, expect } = require('@playwright/test');

// Cross-AI context continuity — the "Perplexity effect".
//
// EITI keeps one shared chatLog and injects a labelled transcript of who-said-what
// into the system prompt, so when the user switches providers the *new* model can
// read what the *previous* model discussed. This logic lives inside the large
// eitiAskDeepSeek() function (DOM + fetch), so it cannot be unit-tested via the
// read-only harness. Here we drive the real app and intercept the outgoing API
// request to assert the prior turn from a DIFFERENT provider is present.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('eiti_onboarded', 'true');
  });
});

async function waitForApp(page) {
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => typeof window.eitiAskDeepSeek === 'function', null,
    { timeout: 15_000 });
}

test('a DeepSeek request carries the prior Gemini turn in its system prompt', async ({ page }) => {
  await waitForApp(page);

  // Capture the chat-completion request body and fulfil it with a canned SSE
  // reply so the network call never leaves the machine.
  const captured = { systemPrompt: null };
  await page.route('https://api.deepseek.com/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON();
    const sys = (body.messages || []).find((m) => m.role === 'system');
    captured.systemPrompt = sys ? sys.content : '';
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'data: {"choices":[{"delta":{"content":"ок"}}]}\n\ndata: [DONE]\n\n',
    });
  });

  // Seed a conversation where the previous answer came from Gemini, then switch
  // the active provider to DeepSeek and send a follow-up.
  await page.evaluate(() => {
    localStorage.setItem('eiti_ai_provider', 'deepseek');
    localStorage.setItem('deepseek_api_key', window._obfKey('sk-test-key-123'));
    localStorage.removeItem('eiti_ds_off');
    // Strict memory mode is off by default; pin it off so the provider is
    // always called (strict mode could otherwise block on the Truth Gate).
    localStorage.setItem('eiti_strict_memory_mode', '0');
    window.chatLog = [
      { id: 'm1', role: 'user', text: 'давай обсудим квантовую запутанность', ts: Date.now() - 3000 },
      { id: 'm2', role: 'assistant', text: 'Запутанность — корреляция состояний частиц.',
        ts: Date.now() - 2000, provider: 'gemini' },
      { id: 'm3', role: 'user', text: 'а теперь подробнее', ts: Date.now() - 1000 },
    ];
  });

  await page.evaluate(() => window.eitiAskDeepSeek('а теперь подробнее'));
  await page.waitForFunction(() => true);
  await expect.poll(() => captured.systemPrompt, { timeout: 10_000 }).not.toBeNull();

  const sys = captured.systemPrompt || '';
  // The new model (DeepSeek) must see the previous Gemini answer AND that it was
  // Gemini who said it — that labelling is what makes the handoff seamless.
  expect(sys).toContain('Запутанность — корреляция состояний частиц.');
  expect(sys).toMatch(/Gemini/);
  expect(sys).toMatch(/Руслан/); // user turns are labelled too
});
