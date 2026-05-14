# Cactus Whole-App Blueprint

> **Purpose:** Use this as the source of truth before building more isolated pages. The goal is to build a connected, clickable Cactus prototype in larger sections, then collect Tyler's feedback by section instead of page-by-page.

## Product thesis

Cactus is a plain-English CRE agent platform for building always-on opportunity intelligence systems.

It turns a real estate firm's scattered documents, deal materials, portfolio data, market subscriptions, maps, broker activity, listing sources, ownership signals, and internal feedback into a customer-specific CRE brain/edge.

The product should feel less like file storage and more like activating persistent agents that never sleep: they find deals and sites, watch markets, analyze opportunities, organize the Vault, generate ideas, produce outputs, learn from feedback, and improve over time.

## Primary users

Initial wedge:
- Multifamily investors and operators.
- Mid-market to high-mid-market private equity and family-office CRE teams where defensibility matters because debt, partnerships, underwriting models, approvals, and reporting are nuanced.

Expansion paths:
- Portfolio asset managers.
- Acquisitions teams.
- New development teams.
- Brokers and capital markets teams later: BOV targets, owner selling-signal detection, listing-pitch hitlists.

## Core loop

Cactus should be built around this loop:

1. **Find** — discover deals, sites, market shifts, ownership signals, broker activity, and off-market opportunities.
2. **Analyze** — map, comp, enrich, risk-score, and underwrite the opportunity using Vault + market context.
3. **Review** — expose citations, confidence, assumptions, and items needing human judgment.
4. **Learn** — capture what the team approved, rejected, edited, or ignored.
5. **Improve** — use feedback to rank future deals/sites and prepare better outputs automatically.

This means deal intake is not the whole product. Deal finding and site selection should fuel faster deal intake because Cactus has already built the context before the deal arrives.

## Design standard

Cactus should follow Tyler's mike-style preference:
- Simple.
- Compact.
- White-space disciplined.
- Action-focused.
- Minimal but clear copy.
- Strong CTA hierarchy.
- Technical in power, plain-English in setup and actions.
- No bulky cards or nested card-inside-card layouts.
- One-screen layouts where possible.
- Agentic work should be shown through artifacts, not generic spinners.

## Language rules

Use plain-English actions instead of developer vocabulary:

- Use “Start watching for opportunities,” not “configure trigger.”
- Use “Teach Cactus what a good deal looks like,” not “define scoring model.”
- Use “Find properties, facts, and risks,” not “run extraction pipeline.”
- Use “Make these sources searchable by property, market, and deal terms,” not “vectorize documents.”
- Use “Review what Cactus learned,” not “inspect agent memory.”

## Whole-app structure

### 1. Landing / marketing

**Purpose:** Explain Cactus as an always-on CRE opportunity engine and route users into signup.

**Primary CTA:** Start building your opportunity engine.

**Should communicate:**
- Cactus organizes scattered CRE data into a proprietary firm brain.
- It finds deals/sites, watches markets, maps opportunities, analyzes risk, learns from team feedback, and prepares outputs.
- It supports acquisitions, asset management, and development.

**Do not overbuild yet:**
- Long marketing site.
- Pricing pages.
- Heavy enterprise sales copy.

---

### 2. Signup / login

**Purpose:** Get the user into setup with minimal friction.

**Primary CTA:** Continue.

**Options:**
- Google.
- Microsoft.
- Work email.

**Rules:**
- Signup should be default.
- Sign-in should be a small alternate link.
- No payment before setup.
- No app nav yet.

---

### 3. Corporate account setup

**Purpose:** Create the company workspace / Vault boundary.

**Primary CTA flow:**
1. Continue to team access.
2. Continue to asset classes.
3. Continue to opportunity setup.

**Sections:**
- Company defaults: legal name, currency, measurement.
- Team access: solo, invite later, invite now.
- Asset classes: multifamily default, expandable later.

**UX pattern:**
- Progressive reveal.
- Completed sections collapse into compact summary cards.
- Inline Edit buttons for completed summaries.
- No top mini-progress chip row.
- Back moves through inner Step 2 layers before leaving the step.

---

### 4. Opportunity + Vault setup

**Purpose:** Make the user feel like they are briefing an AI CRE analyst, not filling out a SaaS setup form. The screen should explain what Cactus needs, what the user is choosing, and what will happen next.

**Primary CTA:** Start this build.

**UX pattern:**
- Keep this screen sparse. It should feel like a calm analyst brief, not a dense configuration dashboard.
- Use one short analyst prompt with chat/voice affordances, then two plain decision groups: **1 source** and **1 first job**.
- Remove redundant explainers, badges, helper labels, and stacked side panels. One sentence should explain the rule: pick a source and first job; Cactus shows the plan before anything runs.
- Show the selected brief in a compact one-line preview near the CTA.
- Voice/chat should be present as an alternate natural input, but should not create a large chat widget on this first setup screen.

**First-source options:**
- Upload documents.
- Connect email or drive.
- Import lists or comps.
- Use demo Vault.

**First always-on system options:**
- Opportunity Finder — find acquisition targets and deal signals.
- Site Selection — find promising areas/sites using demographics, supply/demand, traffic, zoning, flood risk, comps, and market gaps.
- Deal Intake — process incoming packages faster with context already built.
- Portfolio Monitor — watch owned assets and market movement.

**Message:**
Pick one source and one first job. Cactus will show a plan before anything runs. Keep the detailed activation artifacts for the next screen, not this setup screen.

**Security/trust:**
- User controls folders, labels, senders, and approved sources.
- Do not imply Cactus scans everything.

---

### 5. Plan review / activation

**Purpose:** Removed from the primary onboarding flow. Step 3 already asks the user to choose the first source/path, so adding a confirmation screen creates friction and confusion. Route directly from Step 3 into the app Assistant with the chosen first-source action visible.

**Primary CTA:** None in the normal flow; Step 3 CTA should enter the app intake surface directly.

**UX pattern:**
- Do not show this as a separate confirmation screen in the main flow.
- The Step 3 choice itself is the plan: selected source/path plus selected first job.
- After Step 3, open directly into the selected first-source path. For Vault-building source choices, this can be the empty Vault setup surface rather than generic Assistant.
- Avoid forcing the user to re-confirm the same source/job or re-choose among all sources.
- Make the post-onboarding app start as an empty MikeOSS-like workspace/table when no data is connected: the Vault exists, but rows are empty until the selected source runs.
- The first app screen must include an obvious upload/connect/import action plus a visible explanation of how source data becomes Cactus value: source → extract/review → Vault rows/columns → Spaces/outputs.
- Only show generated opportunities, rows, maps, or memos after real source data or demo data has been explicitly chosen.

**Avoid:**
- Full live activity feeds during onboarding.
- Large tables of generated opportunities before the user has approved source data.
- Dropping the user into a fake populated dashboard after onboarding.
- Copy written from the system’s perspective like “The user approves…”
- Vague “AI magic” copy.

---

### 6. Main app shell

**Purpose:** Provide the persistent workspace after onboarding.

**Recommended primary nav:**
- Rebuild the post-onboarding shell as a Cactus-context version of Mike's system UI: restrained sidebar, Assistant-first home, dense list/table surfaces, compact toolbar actions, and minimal chrome.
- **Assistant** — same core Mike assistant pattern: centered chat, prompt enhancement, add documents, add Vault context, and create workflows.
- **Spaces** — Mike Projects renamed for Cactus. Spaces are project/workroom containers for scoped CRE work, documents, chats, outputs, sharing, and history.
- **Vault** — Mike Tabular Review renamed and expanded for Cactus. Vault is the configurable CRE data grid where added documents/data sources auto-create extracting rows, citations, confidence states, and user-defined data endpoint columns.
- **Workflows** — same Mike concept, adapted to CRE repeatable work: intake packages, owner-signal scans, comp pulls, IC memo drafting, BOV packages, and portfolio monitoring.

Keep secondary product areas like Agents, Outputs, Map, Analysis, and Activity available through Assistant/Spaces/Workflows rather than cluttering the main app shell.

For internal/product review, explain each primary page's job in chat or docs rather than adding visible “Page goal” explainer blocks to the app UI. The product itself should communicate through layout, labels, and next actions, not meta-commentary.

- The prototype should be a full clickable Mike-derived Cactus app, not isolated page mockups. Use Mike as the primary source for shell/list/table/modal interaction patterns, then adapt every feature to Cactus's CRE operating model. Users should be able to click through the intended loop end-to-end: add a source in Assistant → extract into Vault → select rows/chat/open audit/add datapoints → create/open Space → switch Work/Playground/Outputs → generate/share output → turn repeated work into a Workflow. Every visible action should either open a concrete modal/drawer, change state, navigate, or produce an artifact-like visible result.
- Assistant source intake should not show a separate “upload documents into Vault” confirmation card after onboarding. Users add files directly in the Assistant composer/drop zone; a small checkbox can opt those facts into the Vault automatically. The Assistant `Add +` affordance should offer local documents and Vault context. Live/ongoing sources such as Drive/email/provider feeds should route users into the Vault source center because approval scope, recurring sync, and cost controls belong there.
- Source popups must be practical action surfaces, not three-step confirmation pages. Prefer drag/drop, selected files, Vault-import controls, and clear “live sources are managed in Vault” routing over selectable pseudo-steps.
- Extraction audit is a core competitive surface. Users need a visual document/fact verification view: the original PDF/Excel/design stays visually intact on one side, while extracted facts, confidence, source location, and approve/edit/reject controls sit beside it. Clicking a fact should reveal the exact page/cell/line highlight without redesigning the source document.

**Pre-backend hardening rules:**
- Landing `Sign in` must route directly to login mode, while `Build your engine` routes to signup mode.
- Login email actions should show a visible magic-link confirmation state before real auth exists.
- Assistant composer tools are mutually exclusive: Context, Workflow, and Add should not stack on top of each other.
- Vault AI search must visibly respond before backend integration, even if only through local row filtering plus a small result/status panel.
- Vault audit should be row/cell-aware: clicking a fact should open audit focused on that selected row/field, not a generic review drawer.
- Workflow search/filter changes must close or reconcile stale detail drawers when the selected workflow is no longer visible.
- Workflow maintenance issues should be task chips/drawers with assign/retry/review affordances, not clipped status prose.

**Tasks + Activity:**
- Add a first-class Tasks + Activity destination before backend integration so tasks are not hidden inside Workflows or Spaces only.
- Tasks should roll up work from Vault review, workflow maintenance, Spaces collaboration, investor workflows, lender workflows, broker workflows, connectors, scrapers, and output approvals.
- The page should support user-created folders/queues and kanban-like progress stages rather than confusing persona summary cards. Suggested folders: `Vault review`, `Workflows`, `Spaces`, `Diligence`, `Investor reporting`, and `Maintenance`. Suggested stages: `Inbox`, `Doing`, `Review`, `Done`.
- Each task row/card should show title, source/workflow, related Space/Vault context, owner/assignee, due state, priority, and one primary action: `Open`, `Approve`, `Remove`, `Assign`, `Retry`, or `Complete`.
- Selecting a task opens a detail drawer with evidence/context, related Space/Vault/workflow, assignee, due state, actions, assignment controls, and a visible email-notification state when a task is created or assigned.
- Team member chips/avatars across Tasks and Spaces should be clickable and open a member/team drawer where the user can add/remove teammates or change assignment/access.
- Member/collaborator surfaces should support add/remove/access management, and task creation/assignment should visibly queue email notification to the assignee.
- Activity should show meaningful product events — source connected, extraction completed, fact approved/rejected, workflow failed/retried, scraper repaired, Space created, output drafted/sent — not just technical logs.

**Scraper/source workflow builder:**
- A new workflow flow should support a dedicated `Scraper / source watcher` type.
- Required fields: source URL, cadence (`Daily`, `Weekly`, `Monthly`, `Quarterly`), what to pull, format/schema, output target, and optional follow-on analysis skill.
- Default output should be `Add/update Vault rows` with provenance, timestamp, confidence, and review status.
- Follow-on workflows should let each new Vault row/deal run through financial analysis, market analysis, lender analysis, broker BOV/listing analysis, or review-only task creation.
- UI should preview the chain: `Scrape source → normalize fields → add to Vault → analyze new rows → create Space/task/output`, with approval before scheduled/background runs.
- Workflow running actions must be understandable and visible: `Run once` creates a run preview/status, `Enable` opens an approval gate for schedule/cost/side effects, and `Open Space` creates or opens the workroom where artifacts/tasks are reviewed. Do not leave buttons as silent state changes.

**Workflow examples / next templates:**
- Workflows should include a compact example gallery for high-value next automations rather than forcing a blank builder.
- Investor examples: acquisition screen, underwriting review, IC memo starter, portfolio variance monitor, investor update drafter.
- Lender examples: debt quote comparison, lender package completeness, DSCR/LTV/debt-yield credit screen, borrower follow-up draft.
- Broker examples: BOV/listing pitch, owner outreach, comp package review, buyer-list personalization, OM/data-room refresh.
- Market/internal examples: market pulse, trigger monitor, scraper/watch maintenance, unmatched Vault review queue.
- Selecting an example should prefill the builder with trigger/source, cadence, fields/data endpoints, output target, follow-on skill, review gates, and likely task/Space outputs.
- Workflow creation must present a multi-step stack for non-technical users: choose trigger/source → pull/extract data → review/approval step → analyze/enrich → output/write/send. The builder can change available step options by workflow type, but the sequence should remain visible. Put the primary `Create workflow` CTA in the preview rail and keep it visible on smaller desktop screens. After creation, show a concrete created workflow/run preview; avoid vague “draft for approval” dead ends.
- Design for smaller desktop screens: modals/drawers must fit within viewport height, use responsive grids, sticky primary CTAs, horizontal scroll only for dense tables, and avoid hiding critical actions below the fold.
- Remove noisy onboarding microcopy such as `Step 3.1`, `Step 3.2`, locked step explanations, and non-action buttons like `Ask AI` where the user should simply choose a source/job and move forward.
- Workflow maintenance should be a quiet health summary plus Tasks routing, not a persistent busy bottom bar.

**Global rules:**
- Compact nav.
- Clear active state.
- Search / command-style interaction should be available later.
- Do not wrap onboarding in this shell.
- Assistant is the home page. It should let users add documents, add context from the Vault, create workflows like Mike, and improve their request through an **Enhance prompt** action.
- Pre-data app landing must contain a real-looking data-intake module: upload/drop zone or connector scope controls, plus a compact value path showing `Extract facts → Vault records → Review/Spaces/Outputs`.
- The onboarding source choice must carry into the app. If the user chose Upload documents, Connect email/drive, Import lists/comps, or Use demo Vault, the Assistant and empty Vault should open on that exact first-source setup instead of asking them to choose again from scratch. Do not show all four source options again after onboarding.
- Build all four first-source paths as simple, actionable setup flows: upload/submit files, choose a connector scope, import a list/CSV, or load clearly labeled demo data. Each path should have one obvious first-win CTA.
- Do not make users infer that a generic `Connect data` button will handle ingestion; the selected upload/connect/import/demo surface must be visible in the app.
- After the user completes the selected first-source action, open the Vault while extraction is happening. The Vault should show source records/facts being added in real time, not magically appear fully populated.
- Pair extraction visibility with one primary CTA: **Check extraction status + audit**. Keep **Add more sources** as a second CTA.
- If the user connects ongoing sources, ask whether they want a continuous flow/subscription because it adds recurring monthly cost.
- Vault should feel like a structured CRE data grid, not a generic records table. Users can add their own columns; each column is a data endpoint/prompt such as Location (address), YR 1 NOI, entry cap rate, market cap rate, 1 bed effective rent, 1 bed market rent, NOI growth, owner, sale comp range, supply pipeline, or tax reassessment risk. Header examples must look like real CRE underwriting fields, not generic `Entity/source`, `Address/market`, `Owner`, `NOI`, `Source status` placeholders. Column resizing should work like a spreadsheet: hover the column boundary and drag horizontally; do not require a visible resize button click.
- Vault rows can be property-level or market-level. A row may represent a subject property, city, MSA, U.S. national benchmark, submarket, comp set, or provider/broker report geography that helps analyze a property.
- Vault should include filtering, multi-select, folder creation, tabular and mapped views, and a sticky hover chat for asking questions about selected Vault context.
- Chat with the Vault should be gated until the user selects at least one row; multi-select defines the context boundary for chat. The flow is `Vault → Chat Assistant → Space`: selected rows/properties become direct working context for the Assistant, and the resulting analysis/work should open or create a durable Space.
- Do **not** automatically create micro-vaults from map selections or multi-select. Micro-vaults are user-created, folder-like Vaults for durable asset-class-specific, portfolio, or curated contexts, like Google Drive folders/subfolders. Map selections can be saved into a user-created micro-vault only when the user explicitly chooses to save them.
- Chatting about selected Vault context should create a Space. Folders/user-created micro-vaults should also have their own hover chat and can become Spaces.
- Spaces are where work gets done: shareable with edit/view access, able to accept additional documents, and similar to a Claude project with scoped context.
- Spaces should stay close to Mike Projects: a quiet library/list first, then a clean workroom after opening. Avoid dashboard-like Space details. The workroom should prioritize chat/work stream because 95% of user time happens there, with a resizable split between conversation/context gathering and output canvas. Keep context, tasks, people, docs, map, and results available as lightweight rails/tabs rather than stacked equally weighted cards.
- Space setup and operation should be understandable to non-technical users: add/choose context, ask Cactus, review evidence, approve artifacts, assign tasks, produce/export, save repeatable workflow. The interface should react to tasks by showing needed context, current artifact, approval state, and next best action rather than dumping every panel at once.
- Assistant should be only the chat/command surface. Keep the centered composer and its compact controls; remove separate source/status/recent-work sections from the page body. `Add +` is enough for files, Vault context, and workflow attachment.
- The Vault source center is where users build the Vault from all source types: one-off files, Excel/models, rent rolls, T12s, OMs, imported CRM/comps/lists, broker emails, deal-room folders, Drive/OneDrive, Gmail/Outlook, CoStar/Crexi/LoopNet watchers, county records, CMBS/distress lists, and provider enrichments such as Green Street, ATTOM, ReportAll, HelloData, Radius Plus, Census ACS, FRED, FEMA, Walk Score, Google Places, CrimeOMeter, GreatSchools, BLS, FBI, FEMA NRI/USGS, and Shovels. The UI should make this simple through action-first tiles: drag/drop/import documents or choose an app/source. Avoid explanatory text under every app tile. Every source type needs an explicit creation path: choose source, scope access/search/provider endpoints, map fields into Vault rows and endpoint columns, set refresh/cost rules, and review/audit before activation. Live/recurring sources must show scope, cadence, cost/freshness, and approval state before activation.
- Uploaded/imported documents that cannot be confidently matched to a property, entity, market, or Vault location should enter an audit/unmatched queue, not disappear. The uploader can `Approve`, `Remove`, or `Assign` the confirmation as a task to another teammate.
- Vault integrations should expose direction: `Read to Vault`, `Write from Vault`, or `Read + write`. Incoming integrations feed/enrich the Vault; outgoing integrations export approved facts/artifacts only after review.
- Workflows should support both one-off saved templates and ongoing automated processes callable from Assistant, Vault, or Spaces. Examples span deal sourcing/screening, underwriting/analysis, broker/GTM, portfolio/asset management, investor reporting, and market intelligence: off-market sniffer, OM parser, rent-roll normalizer, T12 cleaner, listing watcher, distressed radar, comp finder, rent surveyor, expense benchmarker, sensitivity generator, debt quote aggregator, zoning checker, flood/environmental risk, BOV/proposal, tour scheduling, outreach personalization, LOI, pipeline hygiene, lease abstracts, rollover risk, tax appeal scout, CapEx reserves, waterfalls, investor letters, K-1 tracking, capital calls, submarket pulse, news/trigger monitoring, competitor watch, and CRE macro snapshots.
- Spaces should show who is working in or has access to a Space with small profile avatars in History rows/cards and in the Space header/share controls. Empty Spaces should preserve the simple open canvas, but should not require the user to name a Space before they understand what it does. The empty state should expose Assistant functionality directly: the user describes the work, attaches/chooses context, and Cactus creates/names the Space from that request. Manual New Space can open the same assistant-first creation surface, not a name-first modal.
- A Space is the Manus/Claude/Hermes-style workroom for real CRE work: multi-step analyst tasks, file/context collection, fact verification, model changes, scenario/playground, outputs, collaborator review, and conversion into reusable workflows. Keep the interface simple but make the work model clear.

---

### 7. Opportunities

**Purpose:** The main always-on opportunity engine surface.

**Core elements:**
- Ranked acquisition targets.
- Site-selection candidates.
- Market signals.
- Deal/source signals.
- “Why this surfaced” explanations.
- Status: watching, ready, needs review, rejected, promoted to analysis.

**Primary CTA:** Analyze opportunity or teach Cactus.

---

### 8. Vault

**Purpose:** The structured source of truth for assets, deals, sites, comps, documents, sources, and extracted facts.

**Core elements:**
- Spreadsheet-like grid, not a generic dashboard table.
- Rows represent properties, deals, sites, markets, submarkets, cities, MSAs, national benchmarks, provider reports, or broker-shared market reports.
- Users can create custom columns. Each column is a data endpoint/prompt Cactus fills and cites, such as YR 1 NOI, YR 2 cap rate, owner name, NOI growth, demand growth, climate risk, or average 1BR rent.
- Custom data endpoints should be added from the column-header/navigation area, not as a global top-right Vault action. The flow should first search/select the relevant property, market, geography, or report context, then define label, format, and prompt.
- Columns can have label, format, extraction prompt, source scope, confidence/review state, and citations.
- Location/geography rows can be used as context for property-level analysis; e.g. Subject Property, City, MSA, and U.S. National rows can all support one deal review.
- Filters and templates for common CRE grids.
- Multi-select rows to create folders or launch chat.
- Vault chat is enabled only after at least one row is selected; selected rows define the context boundary.
- Source/citation access and extraction/audit states remain visible.
- Vault has both **tabular** and **mapped** modes. Tabular mode is the primary spreadsheet/data-endpoint grid; mapped mode shows the same property/market/report rows spatially with a paired list/grid, so users can move between data work and location context without leaving the Vault.

**Primary CTA:** Check extraction status + audit, Add documents/source, or Chat with selected rows.

---
### 9. Spaces / Spaces History

**Purpose:** The Spaces rail item opens **Spaces History**: the dashboard/history of all past work and active workrooms. It should feel like Tyler's library sketch, not a single active-space detail page by default.

**Core elements:**
- Header: **Spaces History** with a clear **+ New Workspace** CTA.
- View modes: **List**, **Grid**, and **Map**. Users should be able to switch between them from Spaces History.
- Grid view: compact workspace cards showing the work name, property/address/market, collaborator avatars, and status.
- List view: dense rows for work history with type, address/market, last activity, owner/team, and status.
- Map view: geographic workspace history with pins paired with a compact list so CRE work remains spatial.
- Past work examples: rental/sales comps, BOV presentation, credit memo + underwriting build, buyer identification + OM, sponsor/borrower diligence, operational efficiency audit, portfolio analysis, IC memo.
- Opening a workspace can reveal the detailed Space workroom: selected Vault context, documents/custom extraction, market evidence, Playground, chat/voice, outputs, and automation.

**Primary CTA:** + New Workspace from Spaces History; Generate output / Automate this workflow inside an individual workspace.

**Rules:**
- Spaces are shareable; Vault is private by default.
- Spaces can be selected-context, folder-context, blank/no prior context, frozen point-in-time, or auto-updating.
- Keep context boundaries visible so users know what Cactus is and is not using.
- Spaces History is the default Spaces dashboard/history, while detailed Space workrooms are opened from history items or Vault chat.

---

### 10. Map

**Purpose:** Let professional users understand geography, market context, and portfolio/deal/site distribution visually.

**Core elements:**
- Map with property/site pins.
- Highlighted submarkets / zones.
- Flood zone / risk layer placeholder.
- Demographics, traffic density, supply/demand drivers.
- Site-selection layer for development workflows.
- List paired with map.

**Primary CTA:** Open opportunity / Compare area.

---

### 11. Agents

**Purpose:** Show the always-on systems that keep working over time.

**Core agent cards:**
- Opportunity Finder Agent.
- Site Selection Agent.
- Deal Intake Agent.
- Portfolio Monitoring Agent.
- Weekly Hitlist Agent.

**Each card should show:**
- Status.
- What it watches.
- Last worked.
- Next run.
- Work created.
- Needs review.
- What it learned.

**Actions:**
- View work.
- Edit instructions.
- Teach Cactus.
- Pause.

---

### 12. Analysis

**Purpose:** Help answer: should I spend time on this deal/site?

**Core elements:**
- Opportunity summary.
- Key metrics.
- Risks.
- Upside / value-add notes.
- Site-selection context if relevant.
- Missing info / diligence requests.
- Comparable evidence.
- Recommended next action.

**Primary CTA:** Draft IC memo or Send to review.

---

### 13. Comps + Data

**Purpose:** Make Cactus feel stronger than generic LLM summaries by showing structured, editable market evidence.

**Core elements:**
- Sales comps.
- Rent comps.
- Site/location comps.
- Market data sources.
- Editable assumptions.
- Confidence/source metadata.

**Primary CTA:** Apply comps to analysis.

---

### 14. Outputs

**Purpose:** Convert Vault and opportunity intelligence into professional artifacts.

**Output types:**
- IC memo.
- Deal summary.
- Site-selection memo.
- Weekly hitlist.
- Lender package.
- Partner update.
- Diligence checklist.
- Broker follow-up.

**Primary CTA:** Generate / export selected output.

---

### 15. Activity / Learning

**Purpose:** Make continuous improvement visible.

**Core elements:**
- Agent activity log.
- Sources monitored.
- Reviews completed.
- Preferences learned.
- Rejections/approvals that changed rankings.
- Audit-log placeholder.

**Primary CTA:** Review what Cactus learned.

## Cohesive redesign principle

The app should not feel like nine separate dashboards. It should feel like one operating room for the same CRE job, with every surface answering a different question in the same loop:

```text
What surfaced? → What do we know? → Where is the work happening? → What does the map/data say? → What should change? → What output ships? → What should run automatically next time?
```

Durable UX rules for the redesign pass:

- Keep a persistent **current work spine** after onboarding: active opportunity/Space, next best action, sources/review state, and the Find → Vault → Space → Analysis → Output → Automate loop.
- Make **Opportunities** the start-here surface, but connect every primary action into the Riverside Flats active Space, Analysis, Output, or Agent automation instead of leaving each page as an isolated destination.
- Use consistent page framing: plain-English page purpose, one primary action, one secondary action, and compact evidence/status chips.
- Treat the left navigation as product areas, not the user's workflow. The visible workflow spine should explain how a non-technical user moves through the product.
- Preserve compact mike-like styling: less chrome, smaller panels, fewer nested cards, tighter copy, and clear CTA hierarchy.
- Every major app page should reinforce the value: Cactus finds opportunities, turns them into source-linked Vault facts, lets the team work in Spaces, pressure-tests assumptions, produces outputs, and automates repeatable work.

## Build strategy

### Build Slice 1 — Connected product prototype

Goal: make the whole product clickable and coherent without full backend complexity.

Includes:
- Shared design system.
- Onboarding flow.
- Opportunity + Vault setup.
- Live activation showing always-on systems.
- Main app shell.
- Opportunities surface.
- Vault table.
- Spaces overview and one detailed deal Space.
- Map with site-selection and opportunity signals.
- Agents surface.
- Analysis with playground/pro forma context inside Spaces.
- Outputs placeholder.
- Realistic sample CRE data.

Excludes:
- Real email/Drive connectors.
- Real credential vault.
- Production auth.
- Payment.
- Full live scrapers.
- Full GIS/data-provider integrations.

### Build Slice 1A — Spaces clickability + mike-style compression

Goal: make the first Spaces-centered flow feel like a real product demo before expanding trust/data/output detail.

Includes:
- Opportunity action opens the active Space.
- Space header states the full work loop in one compact room.
- Space workflow rail: Opportunity → Space → Extract → Playground → Output → Automate.
- CTAs connect to Analysis, Comps + Data, Outputs, Agents, and Activity.
- Playground block answers “What needs to change?” directly.
- Layout stays compact and avoids disconnected dashboard sprawl.

### Build Slice 2 — Trust/provenance + cost/freshness pass

Goal: make the prototype feel professional, defensible, and cost-aware. Users should understand where conclusions came from, when data was refreshed, whether it is paid/free/cached/frozen, and what changed over time.

Includes:
- Source/provider ledger in Spaces and Comps + Data.
- Visible source links/citations, confidence states, and timestamps.
- Data freshness labels: live, cached, frozen snapshot, monthly refresh, on-demand refresh.
- Cost labels: free/public, included, paid refresh, premium provider, cached to save credits.
- Space context mode: selected/latest, frozen point-in-time, or auto-updating.
- Compact Vault “data story” card showing cap-rate/rent/supply movement and underwriting impact.
- Deal Analysis “what changed since last review” card.
- Review queue states and editable assumptions.
- Audit-log placeholder.

### Build Slice 3 — Output artifact experience

Goal: show that Cactus does real CRE work by converting Space context, extraction, assumptions, market evidence, and source history into a professional artifact.

Includes:
- IC memo draft as the first investor workflow artifact.
- Memo sections with source/provenance chips: thesis, deal summary, assumption checks, devil's advocate, what needs to change, diligence questions, and source appendix.
- Artifact status: Draft, needs review, approved, frozen snapshot, ready to share.
- Export/share actions: PDF, PowerPoint, share Space, push to customer template, save to Vault.
- Evidence trail showing which Space, Vault snapshot, Excel model, and provider sources support the memo.
- Reusable automation prompt: create an IC memo agent from this reviewed workflow.

### Build Slice 4 — Always-on agent pass

Goal: make Cactus feel like a system that gets better over time.

Includes:
- Opportunity Finder.
- Site Selection.
- Deal Intake.
- Portfolio Monitor.
- Weekly Hitlist.
- What Cactus learned.
- Feedback actions: approve, reject, teach, ignore, edit criteria.

### Build Slice 5 — Polish / mike-style pass

Goal: compress, simplify, and visually align all screens.

Includes:
- Remove excess text.
- Reduce card bulk.
- Tighten spacing.
- Improve CTA distinction.
- Verify dark mode.
- Browser QA every route.

## Suggested execution workflow

1. Inspect current code, docs, and routes.
2. Update the blueprint/context docs before product changes.
3. Add Spaces as the work center between Vault and Map.
4. Connect an Opportunity row into a detailed Space.
5. Show selected Vault context, custom extraction, market evidence, playground scenarios, analyst chat/voice, output draft, and automation suggestion.
6. Keep the UI mike-like: compact, direct, no heavy enterprise clutter.
7. Run lint/build.
8. Browser QA the full clickthrough: onboarding → Opportunities → Space → Output/Agent.
9. Present Tyler with review buckets instead of page-by-page questions.

## Review buckets for Tyler

After the connected prototype is built, Tyler should review in this order:

1. **Onboarding:** signup, corporate setup, opportunity/Vault setup, live activation.
2. **Opportunity engine:** deal finding, site selection, agent cards, learning loop.
3. **Spaces workflow:** context boundary, extraction, playground, collaboration, output, automation.
4. **Core Vault:** table, map, property/deal/site detail.
5. **Investor workflow:** analysis, comps, outputs, hitlists.
6. **Polish:** spacing, copy, CTAs, dark mode, overall mike-style fit.

## Open decisions

These do not block the first prototype, but should be answered before production build:

1. Which route should be the first post-login home: Opportunities, Vault, Map, or Agents?
2. Should the first agent activated in onboarding default to Opportunity Finder, Site Selection, or a combined Opportunity Engine?
3. Should Cactus use a chat surface early, or should chat appear only inside specific artifacts/deal views?
4. What sample markets/deals/sites should the prototype use?
5. What output should be the “wow moment”: weekly hitlist, site-selection memo, IC memo, map, or deal screen?

## Validation checklist

Before showing Tyler the next full prototype:

- `npm run lint` passes.
- `npm run build` passes.
- All major routes render.
- Onboarding clickthrough works end-to-end.
- Main app nav works.
- Dark mode does not break onboarding or app pages.
- Selected cards do not look like primary CTAs.
- There are no generic loading bars where agentic artifacts should be shown.
- Pages feel compact, simple, and aligned with mike-style whitespace.
- Opportunity finding and site selection are first-class, not hidden under deal intake.
- Always-on learning/improvement is visible.

## 2026-05 correction: make the operating surfaces action-clear

- Onboarding Step 3 uses inner labels `1. First source` and `2. First job`; copy says trial access starts with one focused setup and more sources/jobs can be added later.
- Vault top chrome should stay sparse: source/add, templates, AI search, micro-vault dropdown, Table/Map, audit. Avoid stacked filter-chip bars unless actively opened.
- Vault map supports selecting properties and drawing a radius or drive-time area from a dropped pin; that selection creates a micro-vault whose rows/data endpoints can be searched, chatted with, and turned into a Space.
- Workflows page should make multi-step workflow construction obvious: step blocks with source/extract/prompt/review/draft/action/tasks; `Share` language should become `Save template` for workflow artifacts.
- Add a Tasks surface or task drawer for workflow maintenance, scraper failures, review gates, and Space assignments.
- Spaces detail should prioritize a left-side chat/work stream and a right-side output/artifact canvas for docs/maps/results, with assignable tasks and @person or /action command shortcuts.

## Latest interaction corrections — auth, onboarding, assistant, Vault, shell

- Login and signup should be distinct flows: signup starts the free trial/company setup; login is for returning users and should not reuse the same trial/create-account mental model.
- Step 2 final CTA should be plain `Continue`; Step 2 team-access rows need editable controls that visibly mutate or open edit state, not inert buttons.
- Step 3 should progressively reveal: show Step 3.1 first-source choices first; only reveal Step 3.2 first-job choices after a source is selected. The Step 3 AI prompt is there to help the user choose a path or ask about Cactus, not to imply setup has already run. Copy should say users can connect multiple sources to the company Vault during the trial.
- Empty Vault after onboarding should go directly to the selected action path. For upload documents, show a simple drop/choose-files action and minimal review path; avoid a centered explanatory card with multiple fake steps.
- Spaces need texture/depth and clearer hierarchy: quieter history, cleaner split workroom, left chat/workstream, right output canvas. Avoid busy undifferentiated boxes.
- Global theme belongs inside the bottom-left account menu, not as a floating button. The app hamburger must collapse/expand the sidebar. The bottom-left account menu should be action-only, not a static showcase for Account/Organization/Members/Billing/Integrations. Route integrations to Vault/source setup, team/member work to team surfaces, billing/privacy/security to external or dedicated pages until they have real in-app actions. Clicking outside any popup, modal, or side drawer should close it.
- Assistant Vault Context should be a simple context picker only after invoked from inside the composer: current context chips, search/select Vault rows/datasets, and a clear apply/open Vault action. Assistant send uses an icon; mic uses a minimal line icon rather than an emoji. Sending opens/creates a Mike-like chat/Space page instead of just showing a small result card. Do not duplicate `Add`, `Context`, `Workflow`, `Enhance`, quick starts, or other Assistant controls outside the chat bubble — the power should live inside the bubble. When listening is active, show a warm bottom hue/glow inside the composer.

## 2026-05 unified action-led cleanup

- Standardize every main app surface around the same top bar: page title on the left, search in the same position, one primary CTA on the right. Assistant, Spaces, Vault, Workflows, and Tasks should not invent different toolbar patterns.
- The onboarding handoff should go directly to the chosen Vault action. If the user selected Upload documents, land in Vault with choose/drop files prominent; if email/drive, land on scope approval; if import/list, land on import setup. Do not route to a prefilled Space or imply work already exists.
- Spaces should be empty until the user creates/opens work. Remove fake-full states, `Space workroom`, tabs like Work/Playground/Output, context/automate buttons, and chat/canvas size buttons. A Space is a simple split: chat on the left, canvas on the right, with a draggable divider.
- Use one composer pattern across Assistant, Vault, and Spaces: same rounded input, same send icon, same mic/voice affordance, same compact context chips. Context changes should appear as chips, not different designs.
- Vault should use the shared top bar, one obvious search, one `Add Data` CTA, neutral colors, and column-level filters like Excel/Airtable. Filters should expose real column values/counts, blanks, search-within-values, sort, clear, and apply—not generic `Has value / Needs extraction` placeholder choices. Empty Vault should say only `No data yet` plus `Add Data`. The Add Data page should make the pipeline visually obvious: sources fill the Vault. Use `Connect a Data Source`, `API partner feed`, and `Confirm before saving`; avoid `Connect one account`, dead `Need API...` links, and `Review before Vault`.
- Tasks should be user-organized around folders and people, not pushed system tabs. The left rail should prioritize user-created folders (`Inbox`, `Today`, `Assigned to me`, acquisitions/reporting folders), people filters, and search. `+ Task` should open a real creation UI. Task detail should have one primary action plus quiet secondary actions under `More`; remove explanatory copy such as `Open work, approve, assign, remove, or complete`.
- Workflows should remove persona/example cards from the top of the page. Use standard views: All, Running, Needs review, Templates, Archived. Workflow rows should focus on trigger/status/owner/last output/action.
- Keep colors consistent: neutral primary CTAs, neutral text, status colors only for states, purple only as light brand accent when selected/contextual.
