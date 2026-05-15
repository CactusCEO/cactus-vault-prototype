import * as assert from "node:assert/strict";
import { test } from "node:test";
import { extractDealDocumentToVaultRow, sampleDealDocument } from "./cactus-extraction";
import { createSpaceDraftFromVaultRows } from "./cactus-space";

test("creates a durable Space draft from selected Vault rows", () => {
  const row = extractDealDocumentToVaultRow(sampleDealDocument, "ocean-drive");

  const draft = createSpaceDraftFromVaultRows([row], "Draft IC memo");

  assert.equal(draft.title, "1450 Ocean Drive Deal Review");
  assert.equal(draft.contextLabel, "@ Selected Property");
  assert.match(draft.artifactTitle, /IC memo/i);
  assert.match(draft.artifactBody, /Atlantic Harbor Partners/);
  assert.match(draft.artifactBody, /6.4%/);
});

test("creates portfolio context labels for multiple selected Vault rows", () => {
  const first = extractDealDocumentToVaultRow(sampleDealDocument, "first");
  const second = { ...first, id: "second", location: "Riverside Flats\nNashville\nTN", owner: "Banyan RE", entryCap: "5.0%" };

  const draft = createSpaceDraftFromVaultRows([first, second], "Compare these properties");

  assert.equal(draft.title, "2 Property Review Space");
  assert.equal(draft.contextLabel, "@ Selected Properties");
  assert.match(draft.artifactBody, /1450 Ocean Drive/);
  assert.match(draft.artifactBody, /Riverside Flats/);
});

test("generates download and share text without exposing secrets", () => {
  const row = extractDealDocumentToVaultRow(`${sampleDealDocument}\nOpenAI key: sk-proj-secretshouldnotappear`, "secret-row");

  const draft = createSpaceDraftFromVaultRows([row], "Draft lender screen");

  assert.match(draft.downloadText, /Cactus Space Output/);
  assert.match(draft.shareText, /1450 Ocean Drive/);
  assert.doesNotMatch(draft.downloadText, /sk-proj/i);
  assert.doesNotMatch(draft.shareText, /secret/i);
});
