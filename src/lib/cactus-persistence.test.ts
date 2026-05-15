import * as assert from "node:assert/strict";
import { test } from "node:test";
import { activePersistenceProvider } from "./cactus-persistence";

test("persistence provider uses local JSON fallback until Supabase server env exists", () => {
  assert.equal(activePersistenceProvider({}), "local-json");
  assert.equal(activePersistenceProvider({ SUPABASE_URL: "https://project.supabase.co" }), "local-json");
  assert.equal(activePersistenceProvider({ SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-secret" }), "supabase");
});
