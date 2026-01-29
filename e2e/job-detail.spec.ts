import { test, expect } from '@playwright/test';
import { JobDetailPage } from './pages/JobDetailPage';

test.describe('Job Detail', () => {
  test('should display job details', async ({ page }) => {
    // Navigate to a job (assuming there's at least one job)
    await page.goto('/');

    // Wait for jobs to load
    await Promise.race([
      page.locator('.bg-card').filter({ hasText: /Posted/ }).first().waitFor({ timeout: 10000 }),
      page.getByText('No jobs found').waitFor({ timeout: 10000 })
    ]).catch(() => {});

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);

      // Wait for navigation and page load with explicit state checks
      await page.waitForURL(/\/job\/.+/, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      await jobDetailPage.waitForLoad();

      // Extra wait for browser-specific rendering (Firefox/WebKit)
      await page.waitForTimeout(1000);

      await expect(jobDetailPage.jobTitle).toBeVisible({ timeout: 10000 });
      await expect(jobDetailPage.companyName).toBeVisible({ timeout: 10000 });
      await expect(jobDetailPage.applyButton).toBeVisible({ timeout: 10000 });
    }
  });

  test('should scroll to application form when Apply button is clicked', async ({ page }) => {
    await page.goto('/');

    // Wait for jobs to load
    await Promise.race([
      page.locator('.bg-card').filter({ hasText: /Posted/ }).first().waitFor({ timeout: 10000 }),
      page.getByText('No jobs found').waitFor({ timeout: 10000 })
    ]).catch(() => {});

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);

      // Wait for navigation and page load
      await page.waitForURL(/\/job\/.+/, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      await jobDetailPage.waitForLoad();

      // Extra wait for browser-specific rendering
      await page.waitForTimeout(1000);

      await jobDetailPage.scrollToApplicationForm();

      // Check that application form is in view
      const formHeader = page.getByText('Apply to this job');
      await expect(formHeader).toBeInViewport({ timeout: 10000 });
    }
  });

  test('should display job description', async ({ page }) => {
    await page.goto('/');

    // Wait for jobs to load
    await Promise.race([
      page.locator('.bg-card').filter({ hasText: /Posted/ }).first().waitFor({ timeout: 10000 }),
      page.getByText('No jobs found').waitFor({ timeout: 10000 })
    ]).catch(() => {});

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);

      // Wait for navigation and page load
      await page.waitForURL(/\/job\/.+/, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      await jobDetailPage.waitForLoad();

      // Extra wait for browser-specific rendering
      await page.waitForTimeout(1000);

      // Check for job description section
      const descriptionSection = page.getByText('Job Description');
      await expect(descriptionSection).toBeVisible({ timeout: 10000 });
    }
  });
});
