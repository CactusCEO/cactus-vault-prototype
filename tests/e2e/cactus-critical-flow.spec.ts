import { expect, test } from "@playwright/test";

const dealText = `Ocean Drive Retail Center offering memorandum
Address: 1450 Ocean Drive, Miami Beach, FL
Owner: Atlantic Harbor Partners
Year 1 NOI: $1.18M
Entry cap rate: 6.4%
Market cap rate: 6.1%
NOI Growth: 4.2%
`;

test("landing hydrates and advances into signup", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Build always-on CRE agents/i })).toBeVisible();
  await page.getByRole("button", { name: "Build your engine" }).click();
  await expect(page.getByRole("heading", { name: "Create your company Vault." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("work email signup reaches corporate account setup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Build your engine" }).click();
  await page.getByPlaceholder("you@company.com").fill(`qa-${Date.now()}@cactuscre.com`);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Create your corporate account" })).toBeVisible();
});

test("full user loop creates a source-linked Space output that can download and share", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Build your engine" }).click();
  await page.getByPlaceholder("you@company.com").fill(`qa-loop-${Date.now()}@cactuscre.com`);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Create your corporate account" })).toBeVisible();

  await page.getByPlaceholder("Your company name").fill("QA Capital Partners");
  await page.getByRole("button", { name: "Currency" }).click();
  await page.getByRole("button", { name: /EUR/ }).click();
  await page.getByRole("button", { name: "Measurement" }).click();
  await expect(page.getByRole("button", { name: "sq.ft & km" })).toBeVisible();
  await expect(page.getByRole("button", { name: "sq.m & km" })).toBeVisible();
  await expect(page.getByRole("button", { name: /kilometers/i })).toHaveCount(0);
  await page.getByRole("button", { name: "sq.ft & miles" }).click();
  await page.getByRole("button", { name: "Continue to team access" }).click();
  await page.getByPlaceholder("teammate@company.com").fill("analyst@qacapital.com");
  await page.getByRole("button", { name: "+ Add member" }).click();
  await expect(page.getByText("analyst@qacapital.com")).toBeVisible();
  await page.getByRole("button", { name: /Data sharing analyst@qacapital.com|Data sharing analyst/i }).click();
  await page.getByRole("button", { name: /Space — this deal\/workroom only/i }).click();
  await page.getByRole("button", { name: "Continue to asset classes" }).click();
  await page.getByRole("button", { name: "Industrial" }).click();
  await page.getByPlaceholder("Other asset class").fill("Hospitality");
  await page.getByRole("button", { name: "Add other" }).click();
  await expect(page.getByText("Hospitality ×")).toBeVisible();
  await page.getByRole("button", { name: "Continue to data setup" }).click();
  await expect(page.getByRole("heading", { name: "Start your proprietary database" })).toBeVisible();

  await page.getByRole("button", { name: /Add property documents/i }).click();
  await page.getByRole("button", { name: "Continue to add documents" }).click();

  await expect(page.getByRole("heading", { name: "No data yet" })).toBeVisible();
  await expect(page.getByText(/Selected in onboarding/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Assistant" }).click();
  await expect(page.getByRole("button", { name: "Add +" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Workflow" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Enhance prompt" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sources" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create" })).toHaveCount(0);
  await page.getByTitle("Vault").click();
  await page.getByRole("button", { name: "Add Data" }).click();
  await expect(page.getByRole("heading", { name: "Add deal files." })).toBeVisible();
  await page.setInputFiles("input[type='file']", {
    name: "full-loop-ocean-drive-om.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(dealText),
  });

  await expect(page.getByText(/1450 Ocean Drive/i)).toBeVisible();
  await page.locator("button").filter({ hasText: /^Audit/ }).first().click();
  await expect(page.getByText("Original source on the left")).toBeVisible();
  await expect(page.getByText(/full-loop-ocean-drive-om.txt/i)).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText(/approved/i).first()).toBeVisible();
  await page.getByRole("button", { name: "×" }).click();

  await page.getByLabel("Select all locations").check();
  await expect(page.getByText("@ Selected Properties")).toBeVisible();
  await page.getByLabel("Select all locations").uncheck();
  await page.getByLabel(/select 1450 Ocean Drive/i).check();
  await expect(page.getByText("@ Selected Property")).toBeVisible();
  await page.getByLabel("Send to Cactus").click();
  await expect(page.getByRole("heading", { name: "1450 Ocean Drive Deal Review" })).toBeVisible();
  await expect(page.getByText("Output Canvas", { exact: true })).toBeVisible();
  await expect(page.getByText(/IC memo starter/i).first()).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("1450-ocean-drive-deal-review");

  await page.getByRole("button", { name: "Share" }).nth(1).click();
  await expect(page.getByText(/1450 Ocean Drive Deal Review: 1450 Ocean Drive · IC memo starter ready for review/i)).toBeVisible();

  await page.getByTitle("Vault").click();
  await page.getByLabel(/select 16 Enviro Dr/i).check();
  await page.getByRole("button", { name: "Delete 1" }).click();
  await expect(page.getByText(/16 Enviro Dr/i)).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test("file upload API creates reviewable facts and fact actions mutate status", async ({ page }) => {
  await page.goto("/");
  const before = await page.request.get("/api/cactus/state").then((response) => response.json());
  const beforeFactCount = before.state.vaultFacts.length;

  const response = await page.request.post("/api/cactus/documents", {
    multipart: {
      source: "Playwright E2E upload",
      file: {
        name: "playwright-ocean-drive-om.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(dealText),
      },
    },
  });
  expect(response.ok()).toBeTruthy();
  const upload = await response.json();
  expect(upload.ok).toBe(true);
  expect(upload.provider).toBe("local-json");
  expect(upload.result.row.location).toContain("1450 Ocean Drive");

  const state = await page.request.get("/api/cactus/state").then((res) => res.json());
  expect(state.state.vaultFacts.length).toBeGreaterThan(beforeFactCount);
  const facts = state.state.vaultFacts.filter((fact: { vaultRowId: string }) => fact.vaultRowId === upload.result.row.id);
  expect(facts.length).toBeGreaterThan(0);

  const editTarget = facts.find((fact: { status: string }) => fact.status === "needs_review") ?? facts[0];
  const rejectTarget = facts.find((fact: { id: string }) => fact.id !== editTarget.id) ?? facts[0];

  const edit = await page.request.post("/api/cactus/vault-facts", {
    data: { factId: editTarget.id, action: "edit", value: "6.2%", evidence: "Playwright corrected market cap evidence" },
  });
  expect(edit.ok()).toBeTruthy();
  const edited = await edit.json();
  expect(edited.result.value).toBe("6.2%");
  expect(edited.result.status).toBe("needs_review");

  const reject = await page.request.post("/api/cactus/vault-facts", {
    data: { factId: rejectTarget.id, action: "reject", reason: "Playwright rejected unsupported value" },
  });
  expect(reject.ok()).toBeTruthy();
  const rejected = await reject.json();
  expect(rejected.result.status).toBe("rejected");
});
