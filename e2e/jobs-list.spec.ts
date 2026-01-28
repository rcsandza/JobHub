import { test, expect } from '@playwright/test';
import { JobsListPage } from './pages/JobsListPage';

test.describe('Jobs List', () => {
  test('should load jobs list page', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    await expect(page.getByText('Job Listings')).toBeVisible();
  });

  test('should display search filters', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    await expect(jobsListPage.companySearchInput).toBeVisible();
    await expect(jobsListPage.titleSearchInput).toBeVisible();
    await expect(jobsListPage.zipcodeSearchInput).toBeVisible();
    await expect(jobsListPage.applyFiltersButton).toBeVisible();
    await expect(jobsListPage.clearFiltersButton).toBeVisible();
  });

  test('should display job cards', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    const jobCount = await jobsListPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);
  });

  test('should filter by company', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    // Wait for initial load
    await page.waitForTimeout(1000);

    await jobsListPage.searchByCompany('test');

    // Wait for results
    await page.waitForTimeout(1000);
  });

  test('should clear filters', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    await jobsListPage.companySearchInput.fill('test');
    await jobsListPage.clearFilters();

    await expect(jobsListPage.companySearchInput).toHaveValue('');
  });

  test('should navigate to job detail', async ({ page }) => {
    const jobsListPage = new JobsListPage(page);
    await jobsListPage.goto();

    // Wait for jobs to load
    await page.waitForTimeout(1000);

    const jobCount = await jobsListPage.getJobCount();
    if (jobCount > 0) {
      await jobsListPage.clickFirstJob();
      await expect(page).toHaveURL(/\/job\/.+/);
    }
  });
});
