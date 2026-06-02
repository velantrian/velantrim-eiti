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

test('input grows vertically and toggles compose mode while typing', async ({ page }) => {
  await gotoApp(page);

  const input = page.locator('#input');
  const panel = page.locator('.chat-input-panel');

  // Empty: default layout, not composing.
  await expect(panel).not.toHaveClass(/composing/);
  const h0 = await input.evaluate((el) => el.getBoundingClientRect().height);

  // Type several lines → grows and enters compose mode.
  await input.click();
  await input.fill('line1\nline2\nline3\nline4\nline5\nline6');
  await expect(panel).toHaveClass(/composing/);
  const h1 = await input.evaluate((el) => el.getBoundingClientRect().height);
  expect(h1).toBeGreaterThan(h0 + 10);

  // Clearing returns to the default single-row layout.
  await input.fill('');
  await expect(panel).not.toHaveClass(/composing/);
  const h2 = await input.evaluate((el) => el.getBoundingClientRect().height);
  expect(h2).toBeLessThan(h1);
});

test('in compose mode the input spans the full width above the buttons', async ({ page }) => {
  await gotoApp(page);

  const input = page.locator('#input');
  const center = page.locator('.chat-center-col');
  const sendBtn = page.locator('#send');

  await input.click();
  await input.fill('some text that triggers compose mode');
  await expect(page.locator('.chat-input-panel')).toHaveClass(/composing/);

  // The centre column (input) sits on its own row above the send button.
  const centerBox = await center.evaluate((el) => el.getBoundingClientRect());
  const sendBox = await sendBtn.evaluate((el) => el.getBoundingClientRect());
  expect(centerBox.bottom).toBeLessThanOrEqual(sendBox.top + 2);
});
