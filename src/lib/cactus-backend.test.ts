import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  approveVaultFact,
  createAnalyzerRun,
  createBackendSpaceFromRows,
  createEmptyBackendState,
  createMapFeatureForRow,
  createSourceConnection,
  ingestDocument,
  runWorkflow,
} from "./cactus-backend";
import { sampleDealDocument } from "./cactus-extraction";

test("backend ingests a document into documents, jobs, vault rows, facts, tasks, and audit", () => {
  const state = createEmptyBackendState();
  const result = ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument, kind: "pdf" });

  assert.equal(state.documents.length, 1);
  assert.equal(state.extractionJobs.length, 1);
  assert.equal(state.vaultRows.length, 1);
  assert.equal(state.vaultFacts.length, 6);
  assert.equal(state.tasks.length, 1);
  assert.equal(state.auditEvents[0].action, "document.ingested");
  assert.equal(result.row.yr1Noi, "$1.18M");
});

test("backend audit approval updates a single Vault fact", () => {
  const state = createEmptyBackendState();
  ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument });
  const needsReview = state.vaultFacts.find((fact) => fact.status === "needs_review");
  assert.ok(needsReview);

  const approved = approveVaultFact(state, needsReview.id);

  assert.equal(approved.status, "approved");
  assert.ok(approved.approvedAt);
  assert.equal(state.auditEvents[0].action, "vault_fact.approved");
});

test("backend creates Spaces from selected Vault rows", () => {
  const state = createEmptyBackendState();
  const { row } = ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument });

  const space = createBackendSpaceFromRows(state, [row.id]);

  assert.equal(state.spaces.length, 1);
  assert.match(space.title, /1450 Ocean Drive/);
  assert.match(space.artifact.artifactBody, /YR 1 NOI \$1.18M/);
});

test("backend workflow run and enable create visible outcomes and approval-gated schedules", () => {
  const state = createEmptyBackendState();

  const preview = runWorkflow(state, "Crexi multifamily scraper", "Run once");
  const scheduleApproval = runWorkflow(state, "Crexi multifamily scraper", "Enable");

  assert.equal(preview.status, "Preview ready");
  assert.equal(scheduleApproval.status, "Approval required");
  assert.equal(state.workflowRuns.length, 2);
  assert.equal(state.workflowSchedules.length, 1);
  assert.match(state.workflowSchedules[0].approvalSummary, /cadence, source scope, cost/);
});

test("backend source connections are approval gated and declare data direction", () => {
  const state = createEmptyBackendState();

  const connection = createSourceConnection(state, { name: "Google Drive", direction: "Read to Vault" });

  assert.equal(connection.status, "approval_required");
  assert.equal(connection.direction, "Read to Vault");
});

test("backend map features and analyzer runs attach to Vault context", () => {
  const state = createEmptyBackendState();
  const { row } = ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument });

  const mapFeature = createMapFeatureForRow(state, { vaultRowId: row.id, latitude: 25.7907, longitude: -80.1300 });
  const analyzerRun = createAnalyzerRun(state, { analyzer: "deal_screen", vaultRowIds: [row.id] });

  assert.equal(mapFeature.label, "1450 Ocean Drive");
  assert.match(analyzerRun.summary, /1450 Ocean Drive/);
  assert.equal(analyzerRun.status, "completed");
});

test("backend redacts obvious secrets from documents and audit summaries", () => {
  const state = createEmptyBackendState();
  ingestDocument(state, { name: "sk-proj-secret.pdf", text: `${sampleDealDocument}\nAPI key sk-proj-abcdefghijklmnopqrstuvwxyz1234567890` });

  assert.equal(JSON.stringify(state).includes("abcdefghijklmnopqrstuvwxyz1234567890"), false);
  assert.match(state.documents[0].name, /\[REDACTED\]/);
});
