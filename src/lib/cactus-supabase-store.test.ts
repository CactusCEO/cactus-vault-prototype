import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyBackendState, ingestDocument, runWorkflow } from "./cactus-backend";
import { sampleDealDocument } from "./cactus-extraction";
import {
  cactusTableNames,
  createSupabaseRestClient,
  hasSupabaseConfig,
  mapStateToSupabaseTables,
} from "./cactus-supabase-store";

test("Supabase config requires URL and server-only service role key", () => {
  assert.equal(hasSupabaseConfig({}), false);
  assert.equal(hasSupabaseConfig({ SUPABASE_URL: "https://example.supabase.co" }), false);
  assert.equal(hasSupabaseConfig({ SUPABASE_SERVICE_ROLE_KEY: "service-role" }), false);
  assert.equal(hasSupabaseConfig({ SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service-role" }), true);
});

test("Supabase mapper preserves backend state shape in table payloads", () => {
  const state = createEmptyBackendState();
  const result = ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument, rowId: "row_1450" });
  runWorkflow(state, "Crexi multifamily scraper", "Enable");

  const tables = mapStateToSupabaseTables(state);

  assert.equal(tables.organizations[0].id, "org_cactus_capital");
  assert.equal(tables.vault_rows[0].id, "row_1450");
  assert.equal(tables.vault_rows[0].row.location, result.row.location);
  assert.equal(tables.documents[0].status, "needs_review");
  assert.equal(tables.vault_facts.length, 6);
  assert.equal(tables.workflow_runs[0].mode, "Enable");
  assert.equal(tables.workflow_schedules[0].status, "approval_required");
});

test("Supabase REST client uses service role on server requests and deterministic table order", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  };
  const client = createSupabaseRestClient({ url: "https://project.supabase.co", serviceRoleKey: "server-secret", fetcher });

  await client.select("vault_rows");
  await client.replaceTable("vault_rows", [{ id: "row_1", organization_id: "org_1", row: { location: "Test" } }]);

  assert.deepEqual(cactusTableNames.slice(0, 3), ["organizations", "user_profiles", "organization_memberships"]);
  assert.equal(calls[0].url, "https://project.supabase.co/rest/v1/vault_rows?select=*");
  assert.equal((calls[0].init.headers as Record<string, string>).apikey, "server-secret");
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer server-secret");
  assert.equal(calls[1].init.method, "DELETE");
  assert.equal(calls[2].init.method, "POST");
  assert.match(String(calls[2].init.body), /row_1/);
});
