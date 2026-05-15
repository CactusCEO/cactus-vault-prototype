import { extractDealDocumentToVaultRow, type VaultGridRow } from "./cactus-extraction";
import { createSpaceDraftFromVaultRows, type CactusSpaceDraft } from "./cactus-space";
import { createWorkflowOutcome, type WorkflowActionMode, type WorkflowOutcome } from "./cactus-workflows";
import { redactPotentialSecrets } from "./cactus-settings";

export type CactusId = string;

export type CactusAuditEvent = {
  id: CactusId;
  organizationId: CactusId;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
};

export type CactusOrganization = {
  id: CactusId;
  name: string;
  primaryVaultId: CactusId;
  createdAt: string;
};

export type CactusDocument = {
  id: CactusId;
  organizationId: CactusId;
  name: string;
  kind: "pdf" | "excel" | "csv" | "email" | "web" | "note";
  source: string;
  textPreview: string;
  status: "uploaded" | "extracting" | "extracted" | "needs_review" | "failed";
  createdAt: string;
};

export type CactusVaultFact = {
  id: CactusId;
  organizationId: CactusId;
  vaultRowId: CactusId;
  field: string;
  value: string;
  confidence: number;
  sourceDocumentId: CactusId;
  evidence: string;
  status: "needs_review" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
};

export type CactusExtractionJob = {
  id: CactusId;
  organizationId: CactusId;
  documentId: CactusId;
  status: "queued" | "running" | "completed" | "needs_review" | "failed";
  vaultRowId?: CactusId;
  factsCreated: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type CactusSpace = {
  id: CactusId;
  organizationId: CactusId;
  title: string;
  contextLabel: string;
  vaultRowIds: CactusId[];
  artifact: CactusSpaceDraft;
  createdAt: string;
};

export type CactusWorkflowRun = WorkflowOutcome & {
  id: CactusId;
  organizationId: CactusId;
  createdAt: string;
};

export type CactusWorkflowSchedule = {
  id: CactusId;
  organizationId: CactusId;
  workflow: string;
  cadence: "manual" | "daily" | "weekly" | "monthly";
  status: "approval_required" | "enabled" | "paused";
  approvalSummary: string;
  createdAt: string;
};

export type CactusSourceConnection = {
  id: CactusId;
  organizationId: CactusId;
  name: string;
  direction: "Read to Vault" | "Write from Vault" | "Read + write";
  status: "draft" | "approval_required" | "connected" | "paused";
  createdAt: string;
};

export type CactusMapFeature = {
  id: CactusId;
  organizationId: CactusId;
  vaultRowId: CactusId;
  label: string;
  latitude: number;
  longitude: number;
  confidence: number;
  createdAt: string;
};

export type CactusAnalyzerRun = {
  id: CactusId;
  organizationId: CactusId;
  analyzer: "deal_screen" | "rent_roll" | "t12" | "comps" | "market" | "ic_memo" | "lender_package" | "devil_advocate";
  vaultRowIds: CactusId[];
  status: "completed" | "needs_review";
  summary: string;
  createdAt: string;
};

export type CactusTask = {
  id: CactusId;
  organizationId: CactusId;
  title: string;
  queue: "Vault review" | "Workflows" | "Spaces" | "Diligence" | "Maintenance";
  status: "Inbox" | "Doing" | "Review" | "Done";
  targetType: string;
  targetId: string;
  createdAt: string;
};

export type CactusBackendState = {
  version: 1;
  organizations: CactusOrganization[];
  vaultRows: VaultGridRow[];
  vaultFacts: CactusVaultFact[];
  documents: CactusDocument[];
  extractionJobs: CactusExtractionJob[];
  spaces: CactusSpace[];
  workflowRuns: CactusWorkflowRun[];
  workflowSchedules: CactusWorkflowSchedule[];
  sourceConnections: CactusSourceConnection[];
  mapFeatures: CactusMapFeature[];
  analyzerRuns: CactusAnalyzerRun[];
  tasks: CactusTask[];
  auditEvents: CactusAuditEvent[];
};

export const DEFAULT_ORG_ID = "org_cactus_capital";
export const DEFAULT_VAULT_ID = "vault_main";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function createEmptyBackendState(): CactusBackendState {
  const createdAt = now();
  return {
    version: 1,
    organizations: [{ id: DEFAULT_ORG_ID, name: "Cactus Capital Partners", primaryVaultId: DEFAULT_VAULT_ID, createdAt }],
    vaultRows: [],
    vaultFacts: [],
    documents: [],
    extractionJobs: [],
    spaces: [],
    workflowRuns: [],
    workflowSchedules: [],
    sourceConnections: [],
    mapFeatures: [],
    analyzerRuns: [],
    tasks: [],
    auditEvents: [],
  };
}

function audit(state: CactusBackendState, action: string, targetType: string, targetId: string, summary: string) {
  state.auditEvents.unshift({
    id: id("audit"),
    organizationId: DEFAULT_ORG_ID,
    actor: "Tyler",
    action,
    targetType,
    targetId,
    summary: redactPotentialSecrets(summary),
    createdAt: now(),
  });
}

function factsFromRow(row: VaultGridRow, documentId: string): CactusVaultFact[] {
  const values: Array<[string, string, number]> = [
    ["location", row.location, 0.92],
    ["owner", row.owner, 0.82],
    ["yr1Noi", row.yr1Noi, 0.88],
    ["entryCap", row.entryCap, 0.84],
    ["marketCap", row.marketCap, 0.79],
    ["noiGrowth", row.noiGrowth, 0.77],
  ];
  return values.map(([field, value, confidence]) => ({
    id: id("fact"),
    organizationId: DEFAULT_ORG_ID,
    vaultRowId: row.id,
    field,
    value,
    confidence,
    sourceDocumentId: documentId,
    evidence: `Extracted ${field} from uploaded source document`,
    status: confidence >= 0.85 ? "approved" : "needs_review",
    createdAt: now(),
    approvedAt: confidence >= 0.85 ? now() : undefined,
  }));
}

export function ingestDocument(state: CactusBackendState, input: { name: string; text: string; kind?: CactusDocument["kind"]; source?: string; rowId?: string }) {
  const safeName = redactPotentialSecrets(input.name || "Uploaded CRE source");
  const safeText = redactPotentialSecrets(input.text || "");
  const document: CactusDocument = {
    id: id("doc"),
    organizationId: DEFAULT_ORG_ID,
    name: safeName,
    kind: input.kind ?? "note",
    source: input.source ?? "manual upload",
    textPreview: safeText.slice(0, 500),
    status: "extracting",
    createdAt: now(),
  };
  state.documents.unshift(document);
  const job: CactusExtractionJob = { id: id("job"), organizationId: DEFAULT_ORG_ID, documentId: document.id, status: "running", factsCreated: 0, createdAt: now() };
  state.extractionJobs.unshift(job);
  const row = extractDealDocumentToVaultRow(safeText, input.rowId ?? id("row"));
  state.vaultRows = [row, ...state.vaultRows.filter((existing) => existing.id !== row.id)];
  const facts = factsFromRow(row, document.id);
  state.vaultFacts = [...facts, ...state.vaultFacts.filter((fact) => fact.vaultRowId !== row.id)];
  document.status = facts.some((fact) => fact.status === "needs_review") ? "needs_review" : "extracted";
  job.status = document.status === "needs_review" ? "needs_review" : "completed";
  job.vaultRowId = row.id;
  job.factsCreated = facts.length;
  job.completedAt = now();
  state.tasks.unshift({ id: id("task"), organizationId: DEFAULT_ORG_ID, title: `Review extracted facts for ${row.location.split("\n")[0]}`, queue: "Vault review", status: "Review", targetType: "vault_row", targetId: row.id, createdAt: now() });
  audit(state, "document.ingested", "document", document.id, `Created ${facts.length} Vault facts from ${safeName}`);
  return { document, job, row, facts };
}

export function approveVaultFact(state: CactusBackendState, factId: string) {
  const fact = state.vaultFacts.find((candidate) => candidate.id === factId);
  if (!fact) throw new Error(`Vault fact not found: ${factId}`);
  fact.status = "approved";
  fact.approvedAt = now();
  audit(state, "vault_fact.approved", "vault_fact", fact.id, `Approved ${fact.field} = ${fact.value}`);
  return fact;
}

export function createBackendSpaceFromRows(state: CactusBackendState, vaultRowIds: string[]) {
  const rows = state.vaultRows.filter((row) => vaultRowIds.includes(row.id));
  if (rows.length === 0) throw new Error("Select at least one Vault row before creating a Space");
  const artifact = createSpaceDraftFromVaultRows(rows);
  const space: CactusSpace = {
    id: id("space"),
    organizationId: DEFAULT_ORG_ID,
    title: artifact.title,
    contextLabel: artifact.contextLabel,
    vaultRowIds: rows.map((row) => row.id),
    artifact,
    createdAt: now(),
  };
  state.spaces.unshift(space);
  audit(state, "space.created", "space", space.id, `Created Space ${space.title}`);
  return space;
}

export function runWorkflow(state: CactusBackendState, workflow: string, mode: WorkflowActionMode) {
  const outcome = createWorkflowOutcome(workflow, mode);
  const run: CactusWorkflowRun = { ...outcome, id: id("wfrun"), organizationId: DEFAULT_ORG_ID, createdAt: now() };
  state.workflowRuns.unshift(run);
  if (mode === "Enable") {
    state.workflowSchedules.unshift({
      id: id("schedule"),
      organizationId: DEFAULT_ORG_ID,
      workflow,
      cadence: "weekly",
      status: "approval_required",
      approvalSummary: "Requires approval for cadence, source scope, cost, destinations, and side effects before scheduled automation starts.",
      createdAt: now(),
    });
  }
  audit(state, "workflow.run", "workflow", run.id, `${mode}: ${workflow}`);
  return run;
}

export function createSourceConnection(state: CactusBackendState, input: { name: string; direction: CactusSourceConnection["direction"] }) {
  const connection: CactusSourceConnection = { id: id("source"), organizationId: DEFAULT_ORG_ID, name: redactPotentialSecrets(input.name), direction: input.direction, status: "approval_required", createdAt: now() };
  state.sourceConnections.unshift(connection);
  audit(state, "source_connection.created", "source_connection", connection.id, `${connection.name} requires approval before syncing`);
  return connection;
}

export function createMapFeatureForRow(state: CactusBackendState, input: { vaultRowId: string; latitude: number; longitude: number }) {
  const row = state.vaultRows.find((candidate) => candidate.id === input.vaultRowId);
  if (!row) throw new Error(`Vault row not found: ${input.vaultRowId}`);
  const feature: CactusMapFeature = { id: id("map"), organizationId: DEFAULT_ORG_ID, vaultRowId: row.id, label: row.location.split("\n")[0], latitude: input.latitude, longitude: input.longitude, confidence: 0.81, createdAt: now() };
  state.mapFeatures.unshift(feature);
  audit(state, "map_feature.created", "map_feature", feature.id, `Mapped ${row.location.split("\n")[0]}`);
  return feature;
}

export function createAnalyzerRun(state: CactusBackendState, input: { analyzer: CactusAnalyzerRun["analyzer"]; vaultRowIds: string[] }) {
  const rows = state.vaultRows.filter((row) => input.vaultRowIds.includes(row.id));
  if (rows.length === 0) throw new Error("Analyzer needs at least one Vault row");
  const summary = redactPotentialSecrets(`${input.analyzer} reviewed ${rows.map((row) => row.location.split("\n")[0]).join(", ")} using approved Vault facts and citations.`);
  const run: CactusAnalyzerRun = { id: id("analyzer"), organizationId: DEFAULT_ORG_ID, analyzer: input.analyzer, vaultRowIds: rows.map((row) => row.id), status: "completed", summary, createdAt: now() };
  state.analyzerRuns.unshift(run);
  audit(state, "analyzer.completed", "analyzer_run", run.id, summary);
  return run;
}
