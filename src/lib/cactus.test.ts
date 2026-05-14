import * as assert from "node:assert/strict";
import { test } from "node:test";
import { deterministicAssistantReply, extractVaultRowFromText, generateInvestmentOutput, validateApiKeyShape } from "./cactus";

const southBeachDeal = `
Property: Ocean Drive Retail Center.
Location: South Beach Miami FL.
Asset class: retail shopping center.
Class B.
Size: 48,000 sf.
Price: $18.5M.
NOI: $1.18M.
Entry cap: 6.4%.
Tenant mix includes restaurants, boutique fitness, and local services.
`;

test("extracts a South Beach retail deal into a source-backed Vault row", () => {
  const row = extractVaultRowFromText(southBeachDeal, "south-beach-retail.txt");

  assert.equal(row.assetClass, "Retail");
  assert.equal(row.qualityClass, "Class B");
  assert.match(row.location, /South Beach|Miami/i);
  assert.match(row.size, /48,000 sf/i);
  assert.match(row.yr1Noi, /1.18M/i);
  assert.match(row.entryCapRate, /6.4%/i);
  assert.equal(row.source, "south-beach-retail.txt");
  assert.equal(row.status, "Needs review");
});

test("assistant fallback requires Vault context before creating outputs", () => {
  const reply = deterministicAssistantReply("Draft IC memo", [], "Draft IC memo");
  assert.match(reply, /Vault context first/i);
});

test("assistant fallback references selected Vault context", () => {
  const row = extractVaultRowFromText(southBeachDeal, "memo.txt");
  const reply = deterministicAssistantReply("Build comps", [row], "Build comps");
  assert.match(reply, /selected Vault row/i);
  assert.match(reply, /South Beach|Miami/i);
  assert.match(reply, /MSA\/state\/national/i);
});

test("output generator includes context, recommendation, and conversation trail", () => {
  const row = extractVaultRowFromText(southBeachDeal, "memo.txt");
  const output = generateInvestmentOutput([row], [{ id: "1", role: "user", content: "Review this deal", createdAt: new Date().toISOString() }]);
  assert.match(output, /Cactus Output/);
  assert.match(output, /Context used/);
  assert.match(output, /Recommendation/);
  assert.match(output, /Review this deal/);
});

test("validates OpenAI-style key shape without accepting arbitrary text", () => {
  assert.equal(validateApiKeyShape("not-a-key"), false);
  assert.equal(validateApiKeyShape("sk-test_123456789abcdef"), true);
});
