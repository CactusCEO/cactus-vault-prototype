import * as assert from "node:assert/strict";
import { test } from "node:test";
import { buildSupabaseCliCommands, getA1Readiness, publicA1EnvSummary, redactEnvValue, shellQuote } from "./cactus-supabase-a1";

test("A1 readiness keeps local fallback until provider env exists", () => {
  const readiness = getA1Readiness({});
  assert.equal(readiness.ready, false);
  assert.equal(readiness.providerEnvReady, false);
  assert.deepEqual(readiness.missing, ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  assert.match(readiness.message, /local-json fallback/i);
});

test("A1 readiness separates provider env from migration CLI env", () => {
  const readiness = getA1Readiness({ SUPABASE_URL: "https://project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-secret" });
  assert.equal(readiness.ready, true);
  assert.equal(readiness.providerEnvReady, true);
  assert.equal(readiness.migrationEnvReady, false);
  assert.deepEqual(readiness.optionalMissing, ["CACTUS_SUPABASE_PROJECT_REF", "SUPABASE_ACCESS_TOKEN"]);
});

test("A1 command builder emits Supabase link and db push only when migration env is complete", () => {
  assert.deepEqual(buildSupabaseCliCommands({ SUPABASE_URL: "x", SUPABASE_SERVICE_ROLE_KEY: "y" }), []);
  const commands = buildSupabaseCliCommands({ CACTUS_SUPABASE_PROJECT_REF: "abc123", SUPABASE_ACCESS_TOKEN: "token with space", SUPABASE_URL: "x", SUPABASE_SERVICE_ROLE_KEY: "y" });
  assert.equal(commands.length, 2);
  assert.match(commands[0], /supabase@latest link --project-ref 'abc123'/);
  assert.match(commands[1], /supabase@latest db push/);
  assert.match(commands[0], /SUPABASE_ACCESS_TOKEN='token with space'/);
});

test("A1 summaries redact secrets and quote shell input safely", () => {
  assert.equal(redactEnvValue("SUPABASE_SERVICE_ROLE_KEY", "super-secret"), "[REDACTED]");
  assert.equal(redactEnvValue("SUPABASE_URL", "https://abcdefgh.supabase.co"), "https:…e.co");
  assert.equal(shellQuote("a'b"), `'a'"'"'b'`);
  const summary = publicA1EnvSummary({ SUPABASE_URL: "https://abcdefgh.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "secret" });
  assert.equal(summary.SUPABASE_SERVICE_ROLE_KEY, "[REDACTED]");
});
