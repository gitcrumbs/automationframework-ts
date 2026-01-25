import { test, expect } from "@playwright/test";

test("get started link", async ({ page }) => {
  await page.goto("https://www.makemytrip.com/");

  await page.locator(".commonModal__close").click();
  await page.getByRole("link", { name: "Flights", exact: true }).click();
  await page.getByRole("img", { name: "minimize" }).click();
  await page.locator(".coachmark").click();
  await page.getByText("FromDEL, Delhi Airport India").click();
  await page.getByRole("textbox", { name: "From", exact: true }).click();
  await page.getByRole("textbox", { name: "From", exact: true }).fill("Mumbai");
  await page.getByText("Mumbai, India", { exact: true }).click();
  await page.getByRole("textbox", { name: "To BLR, Bengaluru" }).click();
  await page.getByRole("textbox", { name: "To", exact: true }).click();
  await page.getByRole("textbox", { name: "To", exact: true }).fill("Delhi");
  await page.getByText("New Delhi, IndiaIndira Gandhi").click();
  await page.getByText("314,744").click();
  await page.getByText("Search").click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" })
  ).toBeVisible();
});
