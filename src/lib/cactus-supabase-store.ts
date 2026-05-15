import { createEmptyBackendState, DEFAULT_ORG_ID, type CactusAnalyzerRun, type CactusAuditEvent, type CactusAuthSession, type CactusBackendState, type CactusDocument, type CactusExtractionJob, type CactusOrganization, type CactusOrganizationMembership, type CactusSourceConnection, type CactusSpace, type CactusTask, type CactusUser, type CactusVaultFact, type CactusWorkflowRun, type CactusWorkflowSchedule } from "./cactus-backend";
import type { VaultGridRow } from "./cactus-extraction";

export type SupabaseEnv = Record<string, string | undefined>;

export const cactusTableNames = [
  "organizations",
  "user_profiles",
  "organization_memberships",
  "auth_sessions",
  "vault_rows",
  "documents",
  "extraction_jobs",
  "vault_facts",
  "spaces",
  "workflow_runs",
  "workflow_schedules",
  "source_connections",
  "map_features",
  "analyzer_runs",
  "tasks",
  "audit_events",
] as const;

type CactusTableName = (typeof cactusTableNames)[number];
type TableRows = Record<CactusTableName, Record<string, unknown>[]>;

export function hasSupabaseConfig(env: SupabaseEnv = process.env): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

const created = (value: string | undefined) => value ?? new Date().toISOString();

export function mapStateToSupabaseTables(state: CactusBackendState): TableRows {
  return {
    organizations: state.organizations.map((org) => ({ id: org.id, name: org.name, primary_vault_id: org.primaryVaultId, created_at: org.createdAt })),
    user_profiles: state.users.map((user) => ({ id: user.id, email: user.email, display_name: user.displayName, auth_provider: user.authProvider, created_at: user.createdAt, last_seen_at: user.lastSeenAt })),
    organization_memberships: state.organizationMemberships.map((membership) => ({ id: membership.id, organization_id: membership.organizationId, user_id: membership.userId, role: membership.role, created_at: membership.createdAt })),
    auth_sessions: state.authSessions.map((session) => ({ id: session.id, user_id: session.userId, organization_id: session.organizationId, email: session.email, role: session.role, auth_provider: session.authProvider, created_at: session.createdAt, expires_at: session.expiresAt })),
    vault_rows: state.vaultRows.map((row) => ({ id: row.id, organization_id: DEFAULT_ORG_ID, vault_id: "vault_main", row, status: "active", created_at: created(undefined), updated_at: created(undefined) })),
    documents: state.documents.map((doc) => ({ id: doc.id, organization_id: doc.organizationId, name: doc.name, kind: doc.kind, source: doc.source, text_preview: doc.textPreview, status: doc.status, created_at: doc.createdAt })),
    extraction_jobs: state.extractionJobs.map((job) => ({ id: job.id, organization_id: job.organizationId, document_id: job.documentId, status: job.status, vault_row_id: job.vaultRowId ?? null, facts_created: job.factsCreated, error: job.error ?? null, created_at: job.createdAt, completed_at: job.completedAt ?? null })),
    vault_facts: state.vaultFacts.map((fact) => ({ id: fact.id, organization_id: fact.organizationId, vault_row_id: fact.vaultRowId, field: fact.field, value: fact.value, confidence: fact.confidence, source_document_id: fact.sourceDocumentId, evidence: fact.evidence, status: fact.status, created_at: fact.createdAt, approved_at: fact.approvedAt ?? null })),
    spaces: state.spaces.map((space) => ({ id: space.id, organization_id: space.organizationId, title: space.title, context_label: space.contextLabel, vault_row_ids: space.vaultRowIds, artifact: space.artifact, created_at: space.createdAt })),
    workflow_runs: state.workflowRuns.map((run) => ({ id: run.id, organization_id: run.organizationId, workflow: run.workflow, mode: run.mode, status: run.status, summary: run.note, outcome: run, created_at: run.createdAt })),
    workflow_schedules: state.workflowSchedules.map((schedule) => ({ id: schedule.id, organization_id: schedule.organizationId, workflow: schedule.workflow, cadence: schedule.cadence, status: schedule.status, approval_summary: schedule.approvalSummary, created_at: schedule.createdAt })),
    source_connections: state.sourceConnections.map((source) => ({ id: source.id, organization_id: source.organizationId, name: source.name, direction: source.direction, status: source.status, created_at: source.createdAt })),
    map_features: state.mapFeatures.map((feature) => ({ id: feature.id, organization_id: feature.organizationId, vault_row_id: feature.vaultRowId, label: feature.label, latitude: feature.latitude, longitude: feature.longitude, confidence: feature.confidence, created_at: feature.createdAt })),
    analyzer_runs: state.analyzerRuns.map((run) => ({ id: run.id, organization_id: run.organizationId, analyzer: run.analyzer, vault_row_ids: run.vaultRowIds, status: run.status, summary: run.summary, created_at: run.createdAt })),
    tasks: state.tasks.map((task) => ({ id: task.id, organization_id: task.organizationId, title: task.title, queue: task.queue, status: task.status, target_type: task.targetType, target_id: task.targetId, created_at: task.createdAt })),
    audit_events: state.auditEvents.map((event) => ({ id: event.id, organization_id: event.organizationId, actor: event.actor, action: event.action, target_type: event.targetType, target_id: event.targetId, summary: event.summary, created_at: event.createdAt })),
  };
}

function stateFromSupabaseTables(tables: Partial<TableRows>): CactusBackendState {
  const fallback = createEmptyBackendState();
  return {
    version: 1,
    organizations: (tables.organizations ?? []).map((row) => ({ id: String(row.id), name: String(row.name), primaryVaultId: String(row.primary_vault_id), createdAt: String(row.created_at) })) as CactusOrganization[] || fallback.organizations,
    users: (tables.user_profiles ?? []).map((row) => ({ id: String(row.id), email: String(row.email), displayName: String(row.display_name), authProvider: row.auth_provider as CactusUser["authProvider"], createdAt: String(row.created_at), lastSeenAt: String(row.last_seen_at) })) as CactusUser[],
    organizationMemberships: (tables.organization_memberships ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), userId: String(row.user_id), role: row.role as CactusOrganizationMembership["role"], createdAt: String(row.created_at) })) as CactusOrganizationMembership[],
    authSessions: (tables.auth_sessions ?? []).map((row) => ({ id: String(row.id), userId: String(row.user_id), organizationId: String(row.organization_id), email: String(row.email), role: row.role as CactusAuthSession["role"], authProvider: row.auth_provider as CactusAuthSession["authProvider"], createdAt: String(row.created_at), expiresAt: String(row.expires_at) })) as CactusAuthSession[],
    vaultRows: (tables.vault_rows ?? []).map((row) => row.row as VaultGridRow),
    documents: (tables.documents ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), name: String(row.name), kind: row.kind as CactusDocument["kind"], source: String(row.source), textPreview: String(row.text_preview ?? ""), status: row.status as CactusDocument["status"], createdAt: String(row.created_at) })),
    extractionJobs: (tables.extraction_jobs ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), documentId: String(row.document_id), status: row.status as CactusExtractionJob["status"], vaultRowId: row.vault_row_id ? String(row.vault_row_id) : undefined, factsCreated: Number(row.facts_created ?? 0), createdAt: String(row.created_at), completedAt: row.completed_at ? String(row.completed_at) : undefined, error: row.error ? String(row.error) : undefined })),
    vaultFacts: (tables.vault_facts ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), vaultRowId: String(row.vault_row_id), field: String(row.field), value: String(row.value), confidence: Number(row.confidence), sourceDocumentId: String(row.source_document_id), evidence: String(row.evidence), status: row.status as CactusVaultFact["status"], createdAt: String(row.created_at), approvedAt: row.approved_at ? String(row.approved_at) : undefined })),
    spaces: (tables.spaces ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), title: String(row.title), contextLabel: String(row.context_label), vaultRowIds: row.vault_row_ids as string[], artifact: row.artifact as CactusSpace["artifact"], createdAt: String(row.created_at) })),
    workflowRuns: (tables.workflow_runs ?? []).map((row) => ({ ...(row.outcome as Omit<CactusWorkflowRun, "id" | "organizationId" | "createdAt">), id: String(row.id), organizationId: String(row.organization_id), createdAt: String(row.created_at) })),
    workflowSchedules: (tables.workflow_schedules ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), workflow: String(row.workflow), cadence: row.cadence as CactusWorkflowSchedule["cadence"], status: row.status as CactusWorkflowSchedule["status"], approvalSummary: String(row.approval_summary), createdAt: String(row.created_at) })),
    sourceConnections: (tables.source_connections ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), name: String(row.name), direction: row.direction as CactusSourceConnection["direction"], status: row.status as CactusSourceConnection["status"], createdAt: String(row.created_at) })),
    mapFeatures: (tables.map_features ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), vaultRowId: String(row.vault_row_id), label: String(row.label), latitude: Number(row.latitude), longitude: Number(row.longitude), confidence: Number(row.confidence), createdAt: String(row.created_at) })),
    analyzerRuns: (tables.analyzer_runs ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), analyzer: row.analyzer as CactusAnalyzerRun["analyzer"], vaultRowIds: row.vault_row_ids as string[], status: row.status as CactusAnalyzerRun["status"], summary: String(row.summary), createdAt: String(row.created_at) })),
    tasks: (tables.tasks ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), title: String(row.title), queue: row.queue as CactusTask["queue"], status: row.status as CactusTask["status"], targetType: String(row.target_type), targetId: String(row.target_id), createdAt: String(row.created_at) })),
    auditEvents: (tables.audit_events ?? []).map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), actor: String(row.actor), action: String(row.action), targetType: String(row.target_type), targetId: String(row.target_id), summary: String(row.summary), createdAt: String(row.created_at) })) as CactusAuditEvent[],
  };
}

export function createSupabaseRestClient({ url, serviceRoleKey, fetcher = fetch }: { url: string; serviceRoleKey: string; fetcher?: typeof fetch }) {
  const base = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetcher(`${base}/${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string> | undefined) } });
    if (!response.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`);
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  };
  return {
    select: <T extends Record<string, unknown>>(table: CactusTableName) => request<T[]>(`${table}?select=*`),
    async replaceTable(table: CactusTableName, rows: Record<string, unknown>[]) {
      await request(`${table}?organization_id=eq.${encodeURIComponent(DEFAULT_ORG_ID)}`, { method: "DELETE" });
      if (rows.length > 0) await request(table, { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(rows) });
    },
  };
}

function clientFromEnv(env: SupabaseEnv = process.env, fetcher?: typeof fetch) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase server configuration");
  return createSupabaseRestClient({ url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY, fetcher });
}

export async function loadSupabaseBackendState(env: SupabaseEnv = process.env, fetcher?: typeof fetch): Promise<CactusBackendState> {
  const client = clientFromEnv(env, fetcher);
  const entries = await Promise.all(cactusTableNames.map(async (table) => [table, await client.select(table)] as const));
  const tables = Object.fromEntries(entries) as Partial<TableRows>;
  const state = stateFromSupabaseTables(tables);
  return state.organizations.length ? state : createEmptyBackendState();
}

export async function saveSupabaseBackendState(state: CactusBackendState, env: SupabaseEnv = process.env, fetcher?: typeof fetch): Promise<CactusBackendState> {
  const client = clientFromEnv(env, fetcher);
  const tables = mapStateToSupabaseTables(state);
  for (const table of cactusTableNames) await client.replaceTable(table, tables[table]);
  return state;
}

export async function updateSupabaseBackendState<T>(mutate: (state: CactusBackendState) => T | Promise<T>, env: SupabaseEnv = process.env, fetcher?: typeof fetch): Promise<{ state: CactusBackendState; result: T }> {
  const state = await loadSupabaseBackendState(env, fetcher);
  const result = await mutate(state);
  await saveSupabaseBackendState(state, env, fetcher);
  return { state, result };
}
