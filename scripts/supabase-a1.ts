#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { getA1Readiness, publicA1EnvSummary } from "../src/lib/cactus-supabase-a1";

function loadDotEnv(path = ".env.local") {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").replace(/^['\"]|['\"]$/g, "");
  }
}

function run(command: string, args: string[], env = process.env) {
  console.log(`→ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit", env });
}

async function main() {
  loadDotEnv();
  const readiness = getA1Readiness(process.env);
  console.log("Cactus A1 Supabase readiness:", readiness.message);
  console.log("Env summary:", JSON.stringify(publicA1EnvSummary(process.env), null, 2));

  if (!readiness.providerEnvReady) {
    console.log("\nMissing provider env. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local or server env, then rerun.");
    process.exit(1);
  }

  if (readiness.migrationEnvReady) {
    run("npx", ["supabase@latest", "link", "--project-ref", process.env.CACTUS_SUPABASE_PROJECT_REF ?? ""], { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN ?? "" });
    run("npx", ["supabase@latest", "db", "push"], { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN ?? "" });
  } else {
    console.log("\nMigration CLI env missing. Apply supabase/migrations/0001_cactus_foundation.sql in Supabase SQL editor, or set CACTUS_SUPABASE_PROJECT_REF + SUPABASE_ACCESS_TOKEN and rerun.");
  }

  console.log("\nNext verification: run the app with these env vars and GET /api/cactus/state. Expected: provider === 'supabase'.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
