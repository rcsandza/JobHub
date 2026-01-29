import { Page, Locator } from '@playwright/test';

export class JobDetailPage {
  readonly page: Page;
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly applyButton: Locator;
  readonly jobDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    // Select h1 by filtering for visible elements (handles both mobile and desktop layouts)
    this.jobTitle = page.locator('h1:visible').first();
    this.companyName = page.locator('a[href*="http"]').filter({ hasText: /^(?!.*Homebase)/ }).first();
    this.applyButton = page.getByRole('button', { name: /Apply/i }).first();
    this.jobDescription = page.locator('.prose-custom');
  }

  async scrollToApplicationForm() {
    // Wait for button to be ready
    await this.applyButton.waitFor({ state: 'attached', timeout: 10000 });

    // Scroll to the bottom of the page to reveal the application form
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait a moment for any animations to complete
    await this.page.waitForTimeout(500);

    // Try clicking the button - if it fails, the form should still be visible
    try {
      await this.applyButton.click({ timeout: 5000 });
    } catch (error) {
      // Button click failed, but form may already be visible from scrolling
      console.log('Apply button click failed, but form may be visible from scroll');
    }
  }

  async waitForLoad() {
    await this.jobTitle.waitFor({ state: 'visible' });
  }
}
