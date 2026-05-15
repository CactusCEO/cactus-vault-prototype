import { expect, test } from "@playwright/test";

const signupToEmptyApp = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Build your engine" }).click();
  await page.getByPlaceholder("you@company.com").fill(`qa-empty-${Date.now()}@cactuscre.com`);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByPlaceholder("Your company name").fill("Empty State Capital");
  await page.getByRole("button", { name: "Continue to team access" }).click();
  await page.getByRole("button", { name: "Continue to asset classes" }).click();
  await page.getByRole("button", { name: "Continue to data setup" }).click();
  await page.getByRole("button", { name: "Continue to add documents" }).click();
};

test("new account starts empty across Vault, Spaces, Tasks, and Workflows", async ({ page }) => {
  await signupToEmptyApp(page);

  await expect(page.getByRole("heading", { name: "No data yet" })).toBeVisible();
  await page.getByTitle("Spaces").click();
  await expect(page.getByRole("heading", { name: "No Spaces yet" })).toBeVisible();

  await page.getByTitle("Tasks").click();
  await expect(page.getByText("No tasks yet")).toBeVisible();
  await expect(page.getByText("Approve Riverside IC memo sections")).toHaveCount(0);

  await page.getByTitle("Workflows").click();
  await expect(page.getByRole("heading", { name: "No workflows yet" })).toBeVisible();
  await expect(page.getByText("Crexi multifamily scraper → Vault")).toHaveCount(0);
});

test("creating first Space returns to searchable list/grid/map library with assistant filter", async ({ page }) => {
  await signupToEmptyApp(page);
  await page.getByTitle("Spaces").click();
  await page.getByRole("button", { name: "Ask Cactus" }).click();
  await page.getByRole("button", { name: "Send to Cactus" }).last().click();

  await expect(page.getByRole("button", { name: "List" })).toBeVisible();
  await expect(page.getByText("Assistant-created Space")).toBeVisible();
  await expect(page.getByRole("button", { name: "List" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Map" })).toBeVisible();

  await page.getByPlaceholder("Search Spaces…").fill("Assistant");
  await expect(page.getByText("Assistant-created Space")).toBeVisible();
  await page.getByRole("button", { name: "Grid" }).click();
  await expect(page.getByText("Created by Assistant").first()).toBeVisible();
  await page.getByRole("button", { name: "Map" }).click();
  await expect(page.getByText("Map view" )).toBeVisible();
  await page.getByRole("button", { name: "Send to Cactus" }).last().click();
  await expect(page.getByText(/AI filter applied/i)).toBeVisible();
});

test("user-created task folders can be deleted", async ({ page }) => {
  await signupToEmptyApp(page);
  await page.getByTitle("Tasks").click();
  await page.getByRole("button", { name: "+ New folder" }).click();
  await expect(page.getByRole("button", { name: "New folder 1 0" })).toBeVisible();
  await page.getByRole("button", { name: "Delete folder New folder 1" }).click();
  await expect(page.getByRole("button", { name: "New folder 1 0" })).toHaveCount(0);
});

test("workflows can be created from Workflows and from a Space", async ({ page }) => {
  await signupToEmptyApp(page);

  await page.getByTitle("Workflows").click();
  await page.locator("header").getByRole("button", { name: "New workflow" }).click();
  await page.getByLabel("Workflow name").fill("Weekly owner selling signal monitor");
  await page.getByRole("button", { name: "Create workflow" }).click();
  await expect(page.getByRole("button", { name: "Weekly owner selling signal monitor" })).toBeVisible();
  await expect(page.getByText(/created · review before enabling/i)).toBeVisible();

  await page.getByTitle("Spaces").click();
  await page.getByRole("button", { name: "Ask Cactus" }).click();
  await page.getByRole("button", { name: "Send to Cactus" }).last().click();
  await page.getByText("Assistant-created Space").click();
  await page.getByRole("button", { name: "/workflow" }).click();
  await expect(page.getByText(/Workflow brief ready/i)).toBeVisible();
  await page.getByRole("button", { name: "Create workflow from Space" }).click();
  await expect(page.getByText(/Space workflow created/i)).toBeVisible();
});
