import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to app and authenticate
  await page.goto(config.projects[0].use.baseURL || 'http://localhost:5173');

  // Fill in passphrase
  await page.getByPlaceholder('Enter passphrase').fill('Mediocris');
  await page.getByRole('button', { name: 'Access' }).click();

  // Wait for authentication to complete
  await page.waitForURL('**/', { timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: 'e2e/.auth/user.json' });

  await browser.close();
}

export default globalSetup;
