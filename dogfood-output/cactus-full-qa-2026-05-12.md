# Cactus Vault Prototype — Full QA Pass

Date: 2026-05-12
Repo: `/Users/tysellars/cactus-vault-prototype`
Baseline commit: `f0cc5ae simplify onboarding vault assistant and spaces UX`
URL tested: `http://localhost:3000`

## Executive summary

Yes — it makes sense to do this full QA pass before connecting backend/AI/OCR/maps/scrapers. The prototype is directionally testable and the main product loop is visible, but it still has several UX/functional rough edges that should be fixed before backend integration so we do not attach real services to unclear or conflicting interaction patterns.

Build health:
- `npm run lint` passed with 7 existing unused-component warnings.
- `npm run build` passed.
- Browser console after QA ended with `0` JS errors.

Coverage tested:
- Landing page
- Signup vs login
- Step 2 corporate/team/account setup
- Step 3 source/job onboarding
- Empty Vault direct source path
- Extracting Vault table
- Vault filters/templates/audit/map/grid/row selection
- Assistant context/workflow/add/mic/send behavior
- Sidebar collapse/account/settings/theme/outside close
- Spaces list/detail
- Workflows list/search/detail/maintenance task surface

## Critical path result

The intended high-level flow works:

Landing → Signup → Account setup → Step 3 source/job → Empty Vault action → Extracting Vault → Assistant/Spaces/Workflows.

However, the experience still has a few product-grade issues:

1. Assistant overlay panels can stack on top of each other instead of behaving like one active composer tool.
2. Workflow details can mismatch search/filter context: after searching `BOV`, the table shows BOV while the detail drawer can still show `OM parser`.
3. Some controls are clickable prototypes but do not provide enough visible feedback yet: Vault filters/templates, account menu settings, workflow action buttons.
4. The top-level landing `Sign in` button did not move directly into login during my first click attempt; the in-step login tab works once in auth.
5. Several surfaces still rely on fake static state, so backend connection should follow a deliberate state/data contract rather than wiring APIs directly into every static button.

## Detailed findings

### QA-01 — Assistant panels stack instead of acting like exclusive tools
Severity: Medium
Category: UX / Interaction

Steps:
1. Open Assistant.
2. Click `Context`.
3. Click `Workflow`.
4. Click `Add +`.

Expected:
- Only one composer expansion should be active at a time, or panels should be clearly layered/managed.

Actual:
- Context, Workflow, and Add overlays can remain open together, creating a busy and confusing Assistant surface.

Recommendation:
- Make Assistant composer tools mutually exclusive: `activeComposerTool = context | workflow | add | null`.
- Opening one should close the others.
- Closing modal should restore the clean chat composer.

### QA-02 — Workflow detail drawer can show stale selected workflow after search/filter
Severity: Medium
Category: Functional / UX

Steps:
1. Open Workflows.
2. Open `OM parser` detail.
3. Search for `BOV`.

Expected:
- Search should either close the stale detail drawer, preserve the selected row visibly, or update selection to the visible search result.

Actual:
- Table can show the `BOV/proposal drafter` result while the right drawer still says `OM parser`.

Recommendation:
- If selected workflow is filtered out, close the drawer or show a clear `Selected workflow hidden by current search` state.
- Prefer row-selected state in table if drawer remains open.

### QA-03 — Workflow bottom maintenance task text clips
Severity: Low/Medium
Category: Visual / UX

Observed:
- The maintenance task strip at the bottom truncates long text.

Expected:
- Maintenance issues should be individually actionable, not hidden in a clipped sentence.

Recommendation:
- Replace bottom sentence with compact task chips or a small task drawer: `Gmail re-auth`, `Crexi selector changed`, `Review queue overdue`.

### QA-04 — Landing page `Sign in` top-level CTA needs verification/fix
Severity: Medium
Category: Functional

Steps:
1. Load landing.
2. Click top-level `Sign in`.

Observed:
- Browser click on the landing `Sign in` did not visibly route on first attempt.
- `Build your engine` correctly routes to signup.
- The `Log in` tab inside auth works and shows `Log back into Cactus` / `Sign in with Google`.

Recommendation:
- Wire landing `Sign in` directly to the auth screen with login mode preselected.
- Add a tiny state param or separate `authMode` state.

### QA-05 — Login email action is currently non-operative prototype state
Severity: Medium once backend begins
Category: Functional

Steps:
1. Open auth.
2. Switch to login.
3. Enter email.
4. Click `Email me a sign-in link`.

Expected:
- In prototype, show confirmation state: `Check your email`.
- With backend, call magic-link auth.

Actual:
- No visible confirmation/change.

Recommendation:
- Before real auth, add prototype feedback state.
- Later wire to auth provider and disable while pending.

### QA-06 — Vault AI search input captures text but does not visibly filter/query yet
Severity: Medium for backend readiness
Category: Functional / Product expectation

Observed:
- AI search exists and accepts input.
- It does not visibly change results or create an answer/query panel yet.

Recommendation:
- Define two modes before backend:
  1. client-side table filtering for exact text; and
  2. AI query result panel once backend exists.
- Show pending state: `Searching selected Vault / all rows`.

### QA-07 — Vault filters/templates are visible but need stronger feedback
Severity: Low/Medium
Category: UX

Observed:
- `Filters` reveals filter chips.
- `Templates`/column-template behavior is less obvious visually and can be missed.

Recommendation:
- Use a compact popover with title, selected state, and close behavior.
- Avoid leaving long filter rows permanently open unless selected.

### QA-08 — Vault audit modal is useful but should be tied to selected fact/row
Severity: Medium for trust workflow
Category: UX / Trust

Observed:
- Audit opens with source/fact review content and no console errors.
- It is not yet strongly connected to the selected row/cell.

Recommendation:
- Clicking a cell should open audit focused on that exact fact.
- Audit state should include source page/cell/email, confidence, approve/edit/reject, and writeback state.

### QA-09 — Account/settings pages are still prototype-static
Severity: Low now; Medium before backend
Category: Functional / Settings

Observed:
- Account menu opens, outside close works, hamburger collapse works, Appearance includes theme/sidebar.
- Settings categories show distinct static data, but no edit flows.

Recommendation:
- Before backend: decide which settings are editable vs read-only placeholders.
- Backend integration: org/user/billing/integrations/security endpoints should map to separate panels.

### QA-10 — Spaces visual hierarchy improved, but list/detail transition needs stronger context
Severity: Low/Medium
Category: UX

Observed:
- Spaces list works and detail opens.
- Detail has Work/Playground/Outputs, work stream, output canvas, tasks, context.
- It is still dense; user may need clearer `current Space context` and action priority.

Recommendation:
- Keep list as Spaces History.
- In detail, make the first visible thing: Space name, scoped Vault context, primary next action.
- Keep output canvas but reduce repeated card borders.

## Positive confirmations

- Build and TypeScript pass.
- Browser console clean at end of QA.
- Step 3 progressively reveals Step 3.2 after source selection.
- Step 3 trial copy now says users can connect multiple sources during trial.
- Empty Vault no longer shows the big `Create your Vault from...` card.
- Empty Vault goes directly to the source action path.
- Sidebar hamburger collapses/expands.
- Bottom-left menu opens; outside click closes.
- Appearance menu controls theme/sidebar.
- Assistant `Context` panel has search/apply/open Vault controls.
- Assistant send icon routes to Spaces.
- Vault extracting grid renders with custom columns, selectable rows, column add/resize controls, map/table toggle, audit and micro-vault dropdown.
- Workflows list renders 30-workflow library with trigger/mode/task concepts.

## Backend/API integration readiness plan

Recommended integration order:

### 1. State/data contract first
Before external services, define shared domain models:
- `Organization`
- `User`
- `Vault`
- `VaultSource`
- `VaultRow`
- `VaultColumn/DataEndpoint`
- `SourceDocument`
- `ExtractionFact`
- `Citation`
- `ReviewTask`
- `Space`
- `Workflow`
- `WorkflowRun`
- `Connector`
- `MapSelection/MicroVault`

### 2. Auth/org/settings backend
Wire:
- signup/login
- org creation
- team access
- account menu pages
- billing/trial usage
- integrations status

Do this before connectors because connector permissions must be org/user scoped.

### 3. File upload + OCR/extraction pipeline
For `Upload documents`:
- file upload to storage
- OCR/document parsing
- extraction jobs
- source-linked facts
- review queue
- audit view
- approved writes to Vault rows/columns

### 4. Vault backend
Implement:
- CRUD rows/columns
- column width persistence
- row selection/micro-vault creation
- AI search endpoint
- audit/review state
- provenance/citations

### 5. AI API layer
Use AI for:
- Assistant chat
- Vault AI search
- custom data endpoint prompts
- extraction enrichment
- workflow step generation
- Space chat/output drafting

Keep all side effects gated by approval tasks.

### 6. Google Maps/geocoding
Implement after Vault rows have addresses/geocodes:
- geocode property rows
- map/table shared selection state
- dropped pin/radius/drive-time micro-vault creation
- map-to-Space flow

### 7. Email/Drive connectors
Wire read-only scoped connectors:
- Gmail/Outlook labels/folders/senders/date ranges/file types
- Drive/OneDrive folders/deal rooms
- thread/contact extraction
- attachment ingestion
- connector health/reauth tasks

### 8. Scrapers/watchers
Only after workflow maintenance/task model exists:
- listing watchers
- broker/source watchers
- retry/selector-change states
- maintenance queue
- cadence/cost/freshness controls

### 9. Workflows engine
Implement workflow definitions/runs:
- trigger/entry point
- steps
- status/events
- human approvals
- outputs
- task assignment
- retries/maintenance

### 10. Spaces backend
Wire Spaces as durable workrooms:
- chat thread
- scoped Vault context
- assigned tasks
- outputs/documents/maps/results
- saved workflow templates
- sharing/permissions

## Recommended next fix sprint before backend

1. Make Assistant composer panels mutually exclusive.
2. Fix landing `Sign in` to open login mode directly.
3. Add login magic-link confirmation placeholder.
4. Fix Workflow detail/search mismatch.
5. Turn workflow maintenance strip into clickable task chips/drawer.
6. Make Vault AI search visibly respond with filter/result state.
7. Tie Vault audit to selected row/cell context.

## Evidence

Workflow visual inspection screenshot:

MEDIA:/Users/tysellars/.hermes/cache/screenshots/browser_screenshot_eeb2fbb7d96543159e2190883246f551.png
