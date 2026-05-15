#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";

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

async function main() {
  loadDotEnv();
  const baseUrl = process.env.CACTUS_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/cactus/state`);
  if (!response.ok) throw new Error(`GET /api/cactus/state failed: ${response.status}`);
  const payload = await response.json();
  console.log(JSON.stringify({ ok: payload.ok, provider: payload.provider, organizations: payload.state?.organizations?.length ?? 0, users: payload.state?.users?.length ?? 0 }, null, 2));
  if (payload.provider !== "supabase") {
    throw new Error(`Expected provider=supabase, got ${payload.provider}. Check server env and migration.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
