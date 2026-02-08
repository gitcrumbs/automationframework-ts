import { test, expect } from "@playwright/test";
import { MakeMyTripPage } from "../pages/LandingPage/MakeMyTripLandingPage";
import validation from "ajv/dist/vocabularies/validation";

test("Search Flights", async ({ page }) => {
  const mmt = new MakeMyTripPage(page);

  await page.goto("https://www.makemytrip.com/");

  await mmt.closeModal.click();
  await mmt.flightsTab.click();
  await mmt.minimizeIcon.click();
  await mmt.regularCard.click();
  await mmt.fromcoachmark.click();

  let fromCity: string = "Mumbai";
  await mmt.selectFromCity(fromCity);

  await mmt.tocoachmark.click();

  let toCity: string = "Delhi";
  await mmt.selectToCity(toCity);

  await mmt.selectMonth("February");
  await mmt.selectDate("February", "15");
  await mmt.searchFlights();

  let validationTextforPage = `Flights from ${fromCity} to ${toCity}`;

  await expect(page.getByText(validationTextforPage)).toBeVisible();
});
