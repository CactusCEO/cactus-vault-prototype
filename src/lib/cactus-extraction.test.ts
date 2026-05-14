import * as assert from "node:assert/strict";
import { test } from "node:test";
import { extractDealDocumentToVaultRow, mergeVaultRows, sampleDealDocument } from "./cactus-extraction";

test("extracts a deal document into the existing Vault grid shape", () => {
  const row = extractDealDocumentToVaultRow(sampleDealDocument, "test-row");

  assert.equal(row.id, "test-row");
  assert.equal(row.kind, "Extracted deal");
  assert.match(row.location, /1450 Ocean Drive/);
  assert.equal(row.yr1Noi, "$1.18M");
  assert.equal(row.entryCap, "6.4%");
  assert.equal(row.marketCap, "6.1%");
  assert.equal(row.oneBedEffectiveRent, "$2,350");
  assert.equal(row.oneBedMarketRent, "$2,520");
  assert.equal(row.noiGrowth, "4.2%");
  assert.equal(row.owner, "Atlantic Harbor Partners");
});

test("routes incomplete source material to review without silently trusting blanks", () => {
  const row = extractDealDocumentToVaultRow("Address: 22 Unknown Ave\nOwner: Seller LLC", "review-row");

  assert.equal(row.yr1Noi, "Needs review");
  assert.equal(row.entryCap, "Needs review");
  assert.equal(row.owner, "Seller LLC");
});

test("merges extracted rows without duplicating the same location", () => {
  const first = extractDealDocumentToVaultRow(sampleDealDocument, "a");
  const second = extractDealDocumentToVaultRow(sampleDealDocument, "b");

  const merged = mergeVaultRows([first], second);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, "b");
});
