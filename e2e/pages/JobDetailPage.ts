import { Page, Locator } from '@playwright/test';

export class JobDetailPage {
  readonly page: Page;
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly applyButton: Locator;
  readonly jobDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobTitle = page.locator('h1').first();
    this.companyName = page.locator('a[href*="http"]').filter({ hasText: /^(?!.*Homebase)/ }).first();
    this.applyButton = page.getByRole('button', { name: /Apply/i }).first();
    this.jobDescription = page.locator('.prose-custom');
  }

  async scrollToApplicationForm() {
    await this.applyButton.click();
  }

  async waitForLoad() {
    await this.jobTitle.waitFor({ state: 'visible' });
  }
}
