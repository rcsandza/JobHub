import { Page, Locator } from '@playwright/test';

export class JobsListPage {
  readonly page: Page;
  readonly companySearchInput: Locator;
  readonly titleSearchInput: Locator;
  readonly zipcodeSearchInput: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly jobCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.companySearchInput = page.getByLabel('Company');
    this.titleSearchInput = page.getByLabel('Job Title');
    this.zipcodeSearchInput = page.getByLabel('Zip Code');
    this.applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' });
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear All' });
    this.jobCards = page.locator('.bg-card').filter({ hasText: /Posted/ });
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchByCompany(company: string) {
    await this.companySearchInput.fill(company);
    await this.applyFiltersButton.click();
  }

  async searchByTitle(title: string) {
    await this.titleSearchInput.fill(title);
    await this.applyFiltersButton.click();
  }

  async searchByZipcode(zipcode: string) {
    await this.zipcodeSearchInput.fill(zipcode);
    await this.applyFiltersButton.click();
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async clickFirstJob() {
    await this.jobCards.first().click();
  }

  async getJobCount(): Promise<number> {
    return await this.jobCards.count();
  }
}
