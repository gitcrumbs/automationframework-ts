import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly userNameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameInput = page.locator("");
    this.passwordInput = page.locator("");
    this.signInButton = page.locator("");
  }
}
