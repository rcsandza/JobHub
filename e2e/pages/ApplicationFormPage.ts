import { Page, Locator } from '@playwright/test';

export class ApplicationFormPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly zipcodeInput: Locator;
  readonly resumeInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone number/i);
    this.zipcodeInput = page.getByLabel(/zip code/i);
    this.resumeInput = page.locator('#resume');
    this.submitButton = page.getByRole('button', { name: /submit application/i });
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zipcode: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.zipcodeInput.fill(data.zipcode);
  }

  async submit() {
    await this.submitButton.click();
  }

  async getPhoneValue(): Promise<string> {
    return await this.phoneInput.inputValue();
  }

  async getZipcodeValue(): Promise<string> {
    return await this.zipcodeInput.inputValue();
  }
}
