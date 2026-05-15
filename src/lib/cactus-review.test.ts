import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyBackendState, ingestDocument } from "./cactus-backend";
import { sampleDealDocument } from "./cactus-extraction";
import { buildExtractionReviewQueue, editVaultFact, rejectVaultFact } from "./cactus-review";

test("builds a visual extraction review queue with document evidence", () => {
  const state = createEmptyBackendState();
  ingestDocument(state, { name: "Ocean Drive OM.txt", kind: "note", source: "test upload", text: sampleDealDocument });

  const queue = buildExtractionReviewQueue(state);

  assert.equal(queue.length, 1);
  assert.equal(queue[0].row.location.includes("1450 Ocean Drive"), true);
  assert.equal(queue[0].document?.name, "Ocean Drive OM.txt");
  assert.equal(queue[0].facts.length, 6);
  assert.ok(queue[0].facts.some((fact) => fact.status === "needs_review"));
  assert.match(queue[0].sourcePreview, /1450 Ocean Drive/);
  assert.match(queue[0].sourcePreview, /Year 1 NOI/);
});

test("edits a fact value, keeps it in review, and writes audit evidence", () => {
  const state = createEmptyBackendState();
  const { facts } = ingestDocument(state, { name: "Ocean Drive OM.txt", kind: "note", source: "test upload", text: sampleDealDocument });
  const fact = facts.find((item) => item.field === "marketCap");
  assert.ok(fact);

  const updated = editVaultFact(state, fact.id, "$2,525", "Rent survey page 7 corrected comp set");

  assert.equal(updated.value, "$2,525");
  assert.equal(updated.status, "needs_review");
  assert.match(updated.evidence, /Rent survey page 7/);
  assert.equal(state.auditEvents[0].action, "vault_fact.edited");
});

test("rejects a fact and leaves source-linked evidence for audit", () => {
  const state = createEmptyBackendState();
  const { facts } = ingestDocument(state, { name: "Ocean Drive OM.txt", kind: "note", source: "test upload", text: sampleDealDocument });
  const fact = facts.find((item) => item.field === "noiGrowth");
  assert.ok(fact);

  const rejected = rejectVaultFact(state, fact.id, "NOI growth was inferred from rent growth, not stated in source");

  assert.equal(rejected.status, "rejected");
  assert.match(rejected.evidence, /not stated in source/);
  assert.equal(state.auditEvents[0].action, "vault_fact.rejected");
});
