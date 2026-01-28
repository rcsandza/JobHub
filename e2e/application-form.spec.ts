import { test, expect } from '@playwright/test';
import { ApplicationFormPage } from './pages/ApplicationFormPage';

test.describe('Application Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a job detail page
    await page.goto('/');
    await page.waitForTimeout(1000);

    const firstJob = page.locator('.bg-card').filter({ hasText: /Posted/ }).first();
    const jobCount = await page.locator('.bg-card').filter({ hasText: /Posted/ }).count();

    if (jobCount > 0) {
      await firstJob.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display application form fields', async ({ page }) => {
    const formPage = new ApplicationFormPage(page);

    await expect(formPage.firstNameInput).toBeVisible();
    await expect(formPage.lastNameInput).toBeVisible();
    await expect(formPage.emailInput).toBeVisible();
    await expect(formPage.phoneInput).toBeVisible();
    await expect(formPage.zipcodeInput).toBeVisible();
    await expect(formPage.submitButton).toBeVisible();
  });

  test('should format phone number', async ({ page }) => {
    const formPage = new ApplicationFormPage(page);

    await formPage.phoneInput.fill('1234567890');
    const phoneValue = await formPage.getPhoneValue();

    expect(phoneValue).toBe('123-456-7890');
  });

  test('should limit zipcode to 5 digits', async ({ page }) => {
    const formPage = new ApplicationFormPage(page);

    await formPage.zipcodeInput.fill('1234567890');
    const zipcodeValue = await formPage.getZipcodeValue();

    expect(zipcodeValue).toBe('12345');
  });

  test('should fill and validate form', async ({ page }) => {
    const formPage = new ApplicationFormPage(page);

    await formPage.fillForm({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      zipcode: '12345',
    });

    await expect(formPage.firstNameInput).toHaveValue('John');
    await expect(formPage.lastNameInput).toHaveValue('Doe');
    await expect(formPage.emailInput).toHaveValue('john.doe@example.com');
    await expect(formPage.phoneInput).toHaveValue('123-456-7890');
    await expect(formPage.zipcodeInput).toHaveValue('12345');
  });

  test('should have job alerts checkboxes checked by default', async ({ page }) => {
    const jobAlertsCheckbox = page.getByLabel(/Receive alerts for more.*jobs/i).first();
    const companyAlertsCheckbox = page.getByLabel(/Receive alerts for more jobs from/i);

    await expect(jobAlertsCheckbox).toBeChecked();
    await expect(companyAlertsCheckbox).toBeChecked();
  });

  test('should toggle checkbox state', async ({ page }) => {
    const jobAlertsCheckbox = page.getByLabel(/Receive alerts for more.*jobs/i).first();

    await expect(jobAlertsCheckbox).toBeChecked();
    await jobAlertsCheckbox.click();
    await expect(jobAlertsCheckbox).not.toBeChecked();
    await jobAlertsCheckbox.click();
    await expect(jobAlertsCheckbox).toBeChecked();
  });
});
