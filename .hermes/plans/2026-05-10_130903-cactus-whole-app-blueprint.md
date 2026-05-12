# Cactus Whole-App Blueprint

> **Purpose:** Use this as the source of truth before building more isolated pages. The goal is to build a connected, clickable Cactus prototype in larger sections, then collect Tyler's feedback by section instead of page-by-page.

## Product thesis

Cactus is a plain-English CRE agent platform for building always-on opportunity intelligence systems.

It turns a real estate firm's scattered documents, deal materials, portfolio data, market subscriptions, maps, broker activity, listing sources, ownership signals, and internal feedback into a customer-specific CRE brain/edge.

The product should feel less like file storage and more like activating persistent agents that never sleep: they find deals and sites, watch markets, analyze opportunities, organize the Vault, generate ideas, produce outputs, learn from feedback, and improve over time.

## Primary users

Initial wedge:
- Multifamily investors and operators.

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
- After Step 3, open Assistant directly with the selected source action already visible.
- Avoid forcing the user to re-confirm the same source/job or re-choose among all sources.
- Make the post-onboarding app start as an empty assistant/workspace with documents/projects/workflows concepts, adapted from MikeOSS for CRE.
- The first app screen must include an obvious upload/connect function plus a visible explanation of how source data becomes Cactus value: extract facts → create Vault records → surface review lists/Spaces/outputs.
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
- Use a narrow icon rail as the app menu.
- Top icon: **Assistant** — the home page for adding documents, adding Vault context, creating workflows, and chatting.
- Second icon: **Vault** — the structured CRE data grid/source of truth.
- Third/last icon: **Spaces** — the Spaces dashboard/history of all past work.
- Remove the extra cube/third icon from the rail; it is not a primary app area.

Keep secondary product areas like Agents, Outputs, Map, Analysis, and Activity available later through Assistant/Spaces workflows, but do not show them as primary left-rail items in the sparse app shell.

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
- Vault should feel like a structured CRE data grid, not a generic records table. Users can add their own columns; each column is a data endpoint/prompt such as YR 1 NOI, YR 2 cap rate, owner name, demand growth, climate risk, or average 1BR rent.
- Vault rows can be property-level or market-level. A row may represent a subject property, city, MSA, U.S. national benchmark, submarket, comp set, or provider/broker report geography that helps analyze a property.
- Vault should include filtering, multi-select, folder creation, tabular and mapped views, and a sticky hover chat for asking questions about selected Vault context.
- Chat with the Vault should be gated until the user selects at least one row; multi-select defines the context boundary for chat.
- Chatting about selected Vault context should create a Space. Folders should also have their own hover chat and can become Spaces.
- Spaces are where work gets done: shareable with edit/view access, able to accept additional documents, and similar to a Claude project with scoped context.

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