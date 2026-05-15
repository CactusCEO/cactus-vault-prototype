# Cactus A1 — Supabase/Postgres apply + verification

A1 is the production-persistence handoff: the app keeps the local JSON fallback, but when Supabase server env exists it should use Postgres and `/api/cactus/state` should report `provider: "supabase"`.

## Required Supabase project values

Create or open a Supabase project, then set these **server-only** values in `.env.local` and in the deployment host:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
```

Do not commit `.env.local`.

## Apply migration

Option 1 — CLI push:

```bash
CACTUS_SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
SUPABASE_ACCESS_TOKEN=[REDACTED]
npm run supabase:a1
```

Option 2 — SQL editor:

Paste and run:

```text
supabase/migrations/0001_cactus_foundation.sql
```

## Verify app provider

Start the app with the Supabase env loaded, then run:

```bash
npm run supabase:verify
```

Expected output includes:

```json
{
  "ok": true,
  "provider": "supabase"
}
```

Then run the browser flow:

```text
signup → org/session bootstrap → Vault/Add Data → document extraction → Space/workflow action
```

and confirm the same records exist in the Supabase tables.

## Current local behavior

If either `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing, Cactus intentionally uses:

```text
provider: local-json
```

This lets local prototype work continue without production credentials.
