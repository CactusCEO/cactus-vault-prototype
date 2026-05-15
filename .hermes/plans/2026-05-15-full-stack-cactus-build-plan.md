# Full-Stack Cactus Working App Build Plan

> **For Hermes:** Preserve the refined UI. Build backend capability in small validated slices underneath existing Assistant, Vault, Spaces, and Workflows surfaces.

**Goal:** Turn the current refined Cactus prototype into a full working app with backend persistence, document extraction, Vault facts, Spaces outputs, workflows, schedulers, scrapers, maps, analyzers, and audit/security.

**Architecture:** Start with a typed backend domain layer and API routes that can run locally without external credentials, then swap storage adapters to Supabase/Postgres and object storage. Every visible UI action should create durable backend objects and audit events. Background jobs/scrapers/schedulers enter through workflow run records first, then real queues.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node tests via tsx, local JSON backend adapter for this slice, later Supabase/Postgres + Storage + Inngest/Trigger.dev + map/geocode providers + OCR/LLM extraction.

---

## Build Order

### Slice 1: Backend foundation now
- Create typed backend app state for organizations, vaults, documents, extraction jobs, spaces, artifacts, workflow runs, schedules, source connections, map features, analyzer runs, tasks, and audit events.
- Add local server-side JSON storage adapter for fast development.
- Add API routes for `/api/cactus/state`, `/api/cactus/documents`, `/api/cactus/spaces`, `/api/cactus/workflows`, `/api/cactus/maps`, and `/api/cactus/analyzers`.
- Add tests for persistence, extraction job creation, workflow scheduling semantics, map feature creation, analyzer result creation, and secret redaction.

### Slice 2: Wire current refined UI to backend-backed persistence
- Keep local UI feel unchanged.
- Add a small client API helper.
- On document upload/Choose files: create document + extraction job + Vault facts via API.
- On audit approval: persist audit approval server-side.
- On selected Vault context → Space: create backend Space/artifact.
- On workflow Run once/Enable/Open Space: create workflow run/schedule records server-side.

### Slice 3: Real file extraction
- Add storage adapter and file upload route.
- Extract text/tables from PDFs/CSV/XLSX.
- Save raw extracted text and source evidence.
- Generate Vault fact candidates requiring approval.

### Slice 4: Real AI context/analyzers
- Server-side AI route only.
- Use approved Vault facts and selected rows as context.
- Create analyzer runs for deal screen, T12/rent roll, comps, market, IC memo, lender package, and devil's advocate.

### Slice 5: Workflow engine + schedulers
- Add queue engine (Inngest/Trigger.dev).
- Run once creates preview run.
- Enable creates approval-gated schedule.
- Scheduler writes workflow runs and tasks.

### Slice 6: Scraper/source watchers
- Add source watcher abstraction.
- Build first structured CRE spider.
- Store source snapshots/change detection.
- Create Vault rows/facts/tasks from new or changed opportunities.

### Slice 7: Maps
- Geocode Vault rows.
- Add Vault map features and selections.
- Use map selections as Assistant/Space context.
- Add drive-time/radius selection and cached provider calls.

### Slice 8: Production auth/security/deploy
- Add Supabase Auth/Postgres/RLS or equivalent.
- Encrypt secrets server-side.
- OAuth-first connectors.
- Approval gates and audit logs for side effects.
- Deploy and run Playwright E2E.

## Done Criteria for Slice 1
- `npm run test`, `npm run lint`, and `npm run build` pass.
- Backend routes compile.
- Tests prove each major backend object type can be created safely.
- No full API key/secret can be stored in backend state.
- Commit a safe checkpoint.
