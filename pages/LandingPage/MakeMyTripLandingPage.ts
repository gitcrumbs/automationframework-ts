import { Page, Locator } from "@playwright/test";

export class MakeMyTripPage {
  readonly page: Page;

  readonly closeModal: Locator;
  readonly flightsTab: Locator;
  readonly minimizeIcon: Locator;
  readonly fromcoachmark: Locator;
  readonly fromTextbox: Locator;
  readonly toTextbox: Locator;
  readonly tocoachmark: Locator;
  readonly searchButton: Locator;
  readonly fromSuggestions: Locator;
  readonly regularCard: Locator;
  readonly calendarPanel: Locator;
  constructor(page: Page) {
    this.page = page;

    this.closeModal = page.locator(".commonModal__close");
    this.flightsTab = page.getByRole("link", { name: "Flights", exact: true });
    this.minimizeIcon = page.getByRole("img", { name: "minimize" });
    this.regularCard = page.getByText("RegularRegular fares");
    this.fromcoachmark = page.locator('//label[@for="fromCity"]');
    this.fromTextbox = page.getByPlaceholder("From");
    this.fromSuggestions = page.getByText("BOMMumbai, IndiaChhatrapati");
    this.tocoachmark = page.locator('//label[@for="toCity"]');
    this.toTextbox = page.getByPlaceholder("To").first();
    this.searchButton = page.getByText("Search");
    this.calendarPanel = page.locator(".DayPicker-Months");
  }

  async selectFromCity(city: string) {
    await this.fromTextbox.click();
    await this.fromTextbox.fill(city);
    await this.page.getByText(`${city}, India`, { exact: true }).click();
  }

  async selectToCity(city: string) {
    await this.toTextbox.click();
    await this.toTextbox.fill(city);
    await this.page.getByText(`New Delhi, IndiaIndira Gandhi`).click();
  }

  async selectMonth(targetMonth: string) {
    const monthLocator = this.page.locator(
      `//*[@class='DayPicker-Months']//*[contains(text(),'${targetMonth}')]`,
    );

    const nextButton = this.page.locator(
      "//span[@role='button' and @aria-label='Next Month']",
    );

    // Safety limit to avoid infinite loop
    for (let i = 0; i < 12; i++) {
      if ((await monthLocator.count()) > 0) {
        console.log(`${targetMonth} found`);
        return;
      }

      await nextButton.click();
      await this.page.waitForTimeout(500); // small stabilization wait
    }

    throw new Error(`Month ${targetMonth} not found after 12 attempts`);
  }

  async selectDate(targetMonth: string, targetDate: string) {
    const monthDate = this.page.locator(
      `//*[@class='DayPicker-Months']
     //*[contains(text(),'${targetMonth}')]
     /ancestor::*[@role='grid']
     //*[contains(text(),'${targetDate}')]`,
    );

    await monthDate.first().click();
  }

  async searchFlights() {
    await this.searchButton.click();
  }
}
