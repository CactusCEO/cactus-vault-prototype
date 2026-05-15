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
