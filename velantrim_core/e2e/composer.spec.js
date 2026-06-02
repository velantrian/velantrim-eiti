// @ts-check
const { test, expect } = require('@playwright/test');

// Composer behaviour (v13.5+): the chat textarea grows upward as you type
// (ChatGPT-style, up to 40vh), and while there is text the panel enters
// "compose" mode — the input takes the full width on top and the +/send buttons
// drop to a bottom row. Empty input keeps the default single-row layout.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('eiti_onboarded', 'true');
  });
});

async function gotoApp(page) {
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => !!document.getElementById('input'), null, { timeout: 15_000 });
}

// Set the textarea value and fire a real `input` event (reliable multi-line
// content — Playwright's fill() can normalise newlines on some platforms).
async function setInput(page, value) {
  await page.evaluate((v) => {
    const el = document.getElementById('input');
    el.focus();
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

const MULTILINE = Array.from({ length: 8 }, (_, i) => 'строка номер ' + (i + 1) + ' — довольно длинная для переноса').join('\n');

test('input grows vertically and toggles compose mode while typing', async ({ page }) => {
  await gotoApp(page);

  const input = page.locator('#input');
  const panel = page.locator('.chat-input-panel');

  // Empty: default layout, not composing.
  await expect(panel).not.toHaveClass(/composing/);

  // Multi-line content → grows well beyond a single line and enters compose mode.
  await setInput(page, MULTILINE);
  await expect(panel).toHaveClass(/composing/);
  await page.waitForFunction(
    () => document.getElementById('input').getBoundingClientRect().height > 90,
    null, { timeout: 5000 },
  );

  // Clearing returns to the default single-row layout and shrinks the field.
  await setInput(page, '');
  await expect(panel).not.toHaveClass(/composing/);
  await page.waitForFunction(
    () => document.getElementById('input').getBoundingClientRect().height < 70,
    null, { timeout: 5000 },
  );
});

test('in compose mode the input spans the full width above the buttons', async ({ page }) => {
  await gotoApp(page);

  const center = page.locator('.chat-center-col');
  const sendBtn = page.locator('#send');

  await setInput(page, 'some text that triggers compose mode');
  await expect(page.locator('.chat-input-panel')).toHaveClass(/composing/);

  // The centre column (input) sits on its own row above the send button.
  const centerBox = await center.evaluate((el) => el.getBoundingClientRect().bottom);
  const sendTop = await sendBtn.evaluate((el) => el.getBoundingClientRect().top);
  expect(centerBox).toBeLessThanOrEqual(sendTop + 2);
});
