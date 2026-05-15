import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const schema = readFileSync("supabase/migrations/0001_cactus_foundation.sql", "utf8");

test("Supabase schema creates Cactus foundation tables", () => {
  for (const table of [
    "organizations",
    "user_profiles",
    "organization_memberships",
    "auth_sessions",
    "vault_rows",
    "vault_facts",
    "documents",
    "extraction_jobs",
    "spaces",
    "workflow_runs",
    "workflow_schedules",
    "source_connections",
    "map_features",
    "analyzer_runs",
    "tasks",
    "audit_events",
  ]) {
    assert.match(schema, new RegExp(`create table if not exists public\\.${table}`));
  }
});

test("Supabase schema enables RLS and member policies on app tables", () => {
  for (const table of ["vault_rows", "documents", "vault_facts", "spaces", "workflow_runs", "tasks", "audit_events"]) {
    assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(schema, new RegExp(`members can read ${table}`));
  }
  assert.match(schema, /create or replace function public\.user_can_access_org/);
});

test("Supabase schema keeps flexible JSON columns for refined prototype row and artifact shapes", () => {
  assert.match(schema, /row jsonb not null/);
  assert.match(schema, /artifact jsonb not null/);
  assert.match(schema, /outcome jsonb not null/);
});
