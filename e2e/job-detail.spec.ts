import { test, expect } from '@playwright/test';
import { JobDetailPage } from './pages/JobDetailPage';

test.describe('Job Detail', () => {
  test('should display job details', async ({ page }) => {
    // Navigate to a job (assuming there's at least one job)
    await page.goto('/');
    await page.waitForTimeout(1000);

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);
      await jobDetailPage.waitForLoad();

      await expect(jobDetailPage.jobTitle).toBeVisible();
      await expect(jobDetailPage.companyName).toBeVisible();
      await expect(jobDetailPage.applyButton).toBeVisible();
    }
  });

  test('should scroll to application form when Apply button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);
      await jobDetailPage.waitForLoad();

      await jobDetailPage.scrollToApplicationForm();

      // Check that application form is in view
      const formHeader = page.getByText('Apply to this job');
      await expect(formHeader).toBeInViewport();
    }
  });

  test('should display job description', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();

      const jobDetailPage = new JobDetailPage(page);
      await jobDetailPage.waitForLoad();

      // Check for job description section
      const descriptionSection = page.getByText('Job Description');
      await expect(descriptionSection).toBeVisible();
    }
  });
});
