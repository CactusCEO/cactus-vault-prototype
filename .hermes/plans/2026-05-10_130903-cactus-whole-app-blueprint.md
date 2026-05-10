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

**Purpose:** Let the user choose what Cactus should start watching/finding and where it should learn from first.

**Primary CTA:** Start live build.

**First-source options:**
- Upload documents.
- Connect email or drive.
- Import lists or comps.
- Use sample Vault.

**First always-on system options:**
- Opportunity Finder — find acquisition targets and deal signals.
- Site Selection — find promising areas/sites using demographics, supply/demand, traffic, zoning, flood risk, comps, and market gaps.
- Deal Intake — process incoming broker packages/deal rooms quickly.
- Portfolio Monitor — watch owned assets and market movement.

**Message:**
Start with one system and one source. Cactus will keep watching, ranking, analyzing, and learning. Add more sources and agents later.

**Security/trust:**
- User controls folders, labels, senders, and approved sources.
- Do not imply Cactus scans everything.

---

### 5. Live build / activation

**Purpose:** Make users feel they activated an always-on system, not a one-time upload.

**Primary CTA:** Open opportunity engine.

**Show visible artifacts:**
- Opportunity shortlist being created.
- Site-selection signals being scored.
- Vault rows being created.
- Properties detected.
- Addresses mapped.
- Facts extracted.
- Citations attached.
- Review statuses assigned.
- Learned preferences captured.
- Outputs unlocking.

**Avoid:**
- Generic loading bars.
- Vague “AI magic” copy.

---

### 6. Main app shell

**Purpose:** Provide the persistent workspace after onboarding.

**Recommended primary nav:**
- Opportunities.
- Vault.
- Map.
- Agents.
- Deal Analysis.
- Comps + Data.
- Outputs.
- Activity.

**Global rules:**
- Compact nav.
- Clear active state.
- Search / command-style interaction should be available later.
- Do not wrap onboarding in this shell.

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
- Rows for properties / deals / sites / documents.
- Columns for asset class, address, market, status, source, confidence, last updated.
- Review states: Ready, Extracting, Needs review, Mapped.
- Source/citation access.

**Primary CTA:** Analyze selected opportunity or Add source.

---

### 9. Map

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

### 10. Agents

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

### 11. Deal Analysis

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

### 12. Comps + Data

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

### 13. Outputs

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

### 14. Activity / Learning

**Purpose:** Make continuous improvement visible.

**Core elements:**
- Agent activity log.
- Sources monitored.
- Reviews completed.
- Preferences learned.
- Rejections/approvals that changed rankings.
- Audit-log placeholder.

**Primary CTA:** Review what Cactus learned.

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
- Map with site-selection and opportunity signals.
- Agents surface.
- Deal Analysis.
- Outputs placeholder.
- Realistic sample CRE data.

Excludes:
- Real email/Drive connectors.
- Real credential vault.
- Production auth.
- Payment.
- Full live scrapers.
- Full GIS/data-provider integrations.

### Build Slice 2 — Trust/provenance pass

Goal: make the prototype feel professional and enterprise-grade.

Includes:
- Source links / citations in visible places.
- Confidence states.
- Timestamps.
- Review queue states.
- Editable assumptions.
- Audit-log placeholder.

### Build Slice 3 — Always-on agent pass

Goal: make Cactus feel like a system that gets better over time.

Includes:
- Opportunity Finder.
- Site Selection.
- Deal Intake.
- Portfolio Monitor.
- Weekly Hitlist.
- What Cactus learned.
- Feedback actions: approve, reject, teach, ignore, edit criteria.

### Build Slice 4 — Polish / mike-style pass

Goal: compress, simplify, and visually align all screens.

Includes:
- Remove excess text.
- Reduce card bulk.
- Tighten spacing.
- Improve CTA distinction.
- Verify dark mode.
- Browser QA every route.

## Suggested execution workflow

1. Inspect current code and routes.
2. Update the blueprint and prototype copy around always-on opportunity intelligence.
3. Update shared navigation to include Opportunities and Agents.
4. Add Opportunity Engine screen.
5. Add Agents/Learning screen.
6. Update onboarding/Vault setup/live build to activate first always-on systems.
7. Update Vault/Map/Deal Analysis/Outputs copy to reference deal finding and site selection, not only deal intake.
8. Run lint/build.
9. Browser QA the full clickthrough.
10. Do a final mike-style compression pass.
11. Present Tyler with review buckets instead of page-by-page questions.

## Review buckets for Tyler

After the connected prototype is built, Tyler should review in this order:

1. **Onboarding:** signup, corporate setup, opportunity/Vault setup, live activation.
2. **Opportunity engine:** deal finding, site selection, agent cards, learning loop.
3. **Core Vault:** table, map, property/deal/site detail.
4. **Investor workflow:** deal analysis, comps, outputs, hitlists.
5. **Polish:** spacing, copy, CTAs, dark mode, overall mike-style fit.

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