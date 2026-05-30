// @ts-check
const { test, expect } = require('@playwright/test');

// Paste-as-chip: pasting a large block of text into the chat input should not
// flood the textarea — it collapses into a small "Pasted content" chip, and the
// full text is re-injected only when the message is actually sent. This is the
// behaviour the backup paste-hook installs (with Android fallbacks); the test
// drives the real `paste` event through the page.

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

test('pasting a large block collapses into a chip instead of filling the input', async ({ page }) => {
  await gotoApp(page);

  const big = 'A'.repeat(1200); // well over the 300-char threshold

  // Dispatch a real paste event carrying clipboard text into #input.
  await page.evaluate((text) => {
    const input = document.getElementById('input');
    input.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    input.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true,
    }));
  }, big);

  // The chip appears and the textarea is NOT flooded with the pasted text.
  const chip = page.locator('#eiti-paste-chip');
  await expect(chip).toBeVisible();
  await expect(chip).toContainText('Pasted content');
  const inputVal = await page.evaluate(() => document.getElementById('input').value);
  expect(inputVal).not.toContain('AAAA');

  // The full text is buffered for send-time injection.
  const buffered = await page.evaluate(() => (window._eitiPastedTextBuffer || '').length);
  expect(buffered).toBe(big.length);
});

test('a small paste is left inline (no chip)', async ({ page }) => {
  await gotoApp(page);

  await page.evaluate(() => {
    const input = document.getElementById('input');
    input.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', 'short note');
    input.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true,
    }));
  });

  await expect(page.locator('#eiti-paste-chip')).toHaveCount(0);
});

test('clicking the chip opens a preview modal with the full text', async ({ page }) => {
  await gotoApp(page);

  const big = 'Длинный вставленный текст. '.repeat(60);
  await page.evaluate((text) => {
    const input = document.getElementById('input');
    input.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    input.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true,
    }));
  }, big);

  await page.locator('#eiti-paste-chip').click();
  const modal = page.locator('#eiti-paste-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Длинный вставленный текст');
});
