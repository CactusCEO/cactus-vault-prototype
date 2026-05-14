# Cactus Product Operating Model: Vault, Spaces, Playground, Workflows, Outputs

Captured from Tyler's voice direction on 2026-05-10. This file should be treated as a working product-context note for future prototype and architecture decisions.

## The clean model

Cactus should be organized around five connected layers:

```text
Find opportunities → Fill the Vault → Work in Spaces → Run analysis/playground → Produce outputs → Automate the repeatable parts
```

The product should feel like a CRE version of a powerful agentic work environment: easy for non-technical users, but capable of doing real work inside the user's own workflows and templates.

## Core product concept

Cactus is not just a data room, document extractor, spreadsheet helper, or AI summary tool.

Cactus should help users:

1. Find opportunities.
2. Analyze opportunities.
3. Fill and improve the Vault.
4. Work inside focused Spaces with teammates and outside partners.
5. Run sensitivities and market-backed analysis inside those Spaces.
6. Extract data into the user's own templates and Excel models.
7. Build professional outputs: IC memos, debt memos, OMs, BOVs, lender/investor packages.
8. Automate repeatable inputs, analysis, monitoring, and opportunity discovery.

## App menu

The persistent app menu should now mirror Mike's system model, translated into Cactus language:

1. **Assistant** — home page for chat, documents/data sources, Vault context attachment, prompt enhancement, and workflow creation.
2. **Spaces** — Mike Projects renamed. Spaces are project/workroom containers for CRE work, scoped Vault context, docs, chats, outputs, and sharing.
3. **Vault** — Mike Tabular Review renamed and expanded. The Vault is the source-linked tabular CRE memory where uploaded/connected data auto-creates extracting rows, citations, confidence states, and custom data endpoint columns.
4. **Workflows** — same Mike concept, adapted to CRE repeatable workflows such as package intake, comps, BOVs, IC memos, owner signals, and portfolio monitoring.

The shell should feel like Mike: quiet sidebar, compact toolbars, dense tables, assistant-first interaction, and no extra dashboard chrome. Do not add visible “Page goal” explainer blocks to the app; page goals are for chat/docs review, while the product UI should communicate through names, hierarchy, and actions.

Current build standard:
- Build a finished clickable prototype across the primary Mike-derived surfaces, not static screenshots.
- Use Mike interaction patterns to move faster: library tables, toolbar tabs, compact row actions, centered assistant prompt, modal creation flows, and right-side detail drawers where useful.
- Adapt those patterns to Cactus: sources/data sets, Vault extraction/audit, selectable CRE rows, Spaces workrooms, Playground, outputs, and reusable workflows.
- Any CTA in the prototype should navigate, open a modal/drawer, mutate state, or create an artifact-like visible result.
- Assistant intake should be direct: users drag/drop or choose documents in Assistant, optionally check “add extracted facts to Vault,” and keep writing. Do not show a separate upload-documents-to-Vault card or a pseudo-step confirmation modal. The Assistant add control should read `Add +`; live/ongoing sources should route to Vault where scope, sync, and cost approval can be reviewed.
- Assistant should now be treated as pure chat/command. Remove separate page sections below the composer unless they are transient results; users add files/context/workflows through compact controls attached to the composer. Use a Legora-like model: the composer is the command center, `@` adds context, `Sources` selects files/folders/databases/Vault context, `Create` starts work product, and `Workflow` calls saved prompts/templates. Avoid generic chip rows like `Vault`, `Files`, `People`, `Outputs` and avoid large prompt shortcut buffets such as `Review a deal`, `Build comps`, `Draft IC memo`, `Prepare lender package`; those jobs belong in natural language, saved workflows, or create modes.

Workflow page correction:
- Mirror Mike/Legora-style Workflows more closely: a calm list/table with tabs, search/filter controls, status filters that actually change the list (`Needs review`, `Archived`), small plus action, checkboxes, and compact rows.
- Avoid a busy split-pane builder with side explanations, large prompt editors, data-set panels, or too many simultaneous controls.
- Opening/creating a workflow can reveal details later, but the default page should be a quiet workflow library.
- Workflows must cover two modes: (1) one-off saved/templated work that can be called from Assistant or a Space, and (2) ongoing automations that watch sources/markets/portfolios and update the Vault or create Spaces. Use the 30-workflow taxonomy Tyler provided as product coverage: sourcing/screening, underwriting/analysis, broker/GTM, portfolio/asset management, investor reporting, and market intelligence.

## Vault

The Vault is the master memory and source of truth. It should be visibly filled by source data, not appear pre-populated without explanation.

First-use flow:
- Onboarding asks the user to choose one starting data provider/source: Upload documents, Connect email/drive, Import lists/comps, or Use demo Vault.
- That choice must carry into the app so the user lands on a simple, source-specific first-win setup rather than a generic connect-data prompt.
- Each source path should be action-complete in the prototype: submit files, approve connector scope, import list/comps, or load demo data. The user should see exactly what to click next.
- After the user completes that first-source action, Cactus opens the empty/extracting Vault and shows extraction creating records/facts in real time.
- The primary Vault CTA during this state is singular: **Check extraction status + audit**. This opens one review surface for extraction progress, source citations, confidence, and issues needing human confirmation.
- The audit surface should become a defensible fact-verification workspace: original documents stay visually intact on the left (PDF pages, Excel-like sheets, or source previews) and extracted facts sit beside them with confidence, page/cell/line citations, approve/edit/reject actions, and click-to-highlight source locations. This verification experience is a major trust differentiator versus generic AI summaries.
- A secondary CTA lets users **Add more sources**.
- If a source is continuous (email, drive folder, deal room, scraper, provider refresh), Cactus should ask whether the user wants a continuous flow/subscription and disclose recurring monthly cost/approval scope.
- Vault creation should be action-complete for every source type, but the default UI should start from the user's mental model instead of a long integration directory. Use three simple starting paths: **Deal documents** (T-12, rent roll, occupancy report, management summary, OM, market report, Excel/CSV/PDF), **Portfolio data** (historical multi-property documents, missing-address files, property-management/accounting/banking connections), and **Inbox + drive** (Gmail, Outlook, Google Drive, OneDrive, deal rooms). Each path can reveal source-specific setup for scope, mapping, refresh/cost/freshness, and review before activation. Advanced provider/watchers can live behind secondary options after the three main paths. Empty Vault CTAs such as `Add first source` must open this setup directly, not route users back to the generic Assistant.
- Empty Vault should look and behave like a Mike-style empty product surface, not a large explanatory modal. After onboarding, carry the selected source directly into Vault: show the company Vault exists, no sources are connected, and the selected next action is visible inline inside the empty table/workspace. `Add to Vault` should be a small focused setup drawer/sheet with one current path, concrete action controls, and a compact preview of what Cactus will create. Avoid a big two-column modal with long Scope/Map/Review rows as the first experience.

Vault interaction model:
- Vault should feel like a configurable CRE data grid, not just a fixed list of extracted records.
- Rows can represent properties, deals, sites, markets, submarkets, cities, MSAs, national benchmarks, provider reports, or broker-shared market reports. Market-level and national rows are valuable because they become context for property-level analysis.
- Columns are user-created data endpoints/prompts. Examples: YR 1 NOI, YR 2 cap rate, owner name, NOI growth, demand growth, climate risk, average 1BR rent, sale comp range, supply pipeline, tax reassessment risk.
- Each custom column should preserve label, format, prompt, source/provider scope, geography/asset-class filter, citations, confidence, and review state.
- Custom data endpoint creation belongs inside the grid header/column navigation, not as a top-right global `+` on the Vault page. The user should first search/select the property, market, geography, or report the endpoint applies to, then define the endpoint label, format, and prompt.
- Vault rows can be filtered, searched, multi-selected, and viewed in tabular or mapped modes. Tabular mode is the primary data-endpoint grid; mapped mode shows the same property/market/report rows geographically with a paired list.
- Multi-select can create folders/subfolders that preserve scoped context.
- Vault chat is enabled only after at least one row is selected; the selected rows define what the chat can use.
- Each folder can also have its own hover chat.
- Chatting with selected Vault context or a folder should create a Space so the conversation becomes durable work, not a lost one-off chat.

It contains:
- customer portfolio data,
- historicals,
- reviewed deals,
- target opportunities,
- market data,
- source documents,
- extracted facts,
- assumptions,
- scenarios,
- outputs,
- team decisions,
- Cactus learnings,
- and time-series data stories.

The Vault should get better as the customer uses Cactus.

## Spaces / Spaces History

Spaces are where work gets done, and the Spaces rail item should open the **Spaces History** by default: a dashboard/history of all past work and active workrooms.

The Spaces History should support three views:
- **Grid** — compact workspace cards for quick scanning, with work title, property/address/market, collaborators, status, and last activity.
- **List** — dense history rows for operators who want to sort by work type, client, property, status, or last updated.
- **Map** — geographic workspace history with map pins and a paired list so property/market work stays spatial.

A clear **+ New Workspace** CTA belongs in Spaces History header, but it should not force a name-first modal. Empty Spaces/New Workspace should start with the Assistant: the user says what they want to work on, attaches or chooses context, and Cactus creates/names the Space from the request. Past-work examples include finding rental/sales comps, building a BOV presentation, credit memo + underwriting builds, buyer identification + OM creation, sponsor/borrower diligence, operational efficiency audits, portfolio analysis, and IC memo creation.

Show collaborator/profile avatars directly in Spaces History and Space detail headers so users can see who shared or worked on each Space. New Space creation should be intentionally simple and assistant-first: describe the work, choose or attach context if needed, then enter the workroom. Naming, frozen/latest/auto-updating context, and collaborators can be suggested by Cactus or edited after the Space exists; do not make naming the gate before the user understands the Space.

Opening a history item can reveal the detailed Space workroom.

A detailed Space is a focused work area with selected Vault context, selected people, tasks, analysis, chat/voice, files, assumptions, and outputs. Spaces should feel like a CRE-specific project workspace: users can add more documents directly to the Space, share with collaborators, and assign view/edit access independently.

Spaces are also where larger agentic work happens: Cactus can run multi-step tasks like OM parsing, comp finding, debt quote comparison, BOV drafting, investor letter generation, zoning/flood diligence, market pulse research, and portfolio surveillance inside one workroom. The interface should feel closer to Manus/Claude/Hermes/OpenClaw: a work stream of steps/artifacts, scoped context, collaborator review, and a path to save the repeatable work as a workflow.

Space design should stay Mike-like: quiet library first, compact rows/tabs after opening, simple work/chat stream, and a restrained context drawer. Avoid turning Space detail into a busy dashboard with multiple competing panels.

Spaces can be created from:
- a chat over selected Vault records,
- a Vault folder/subfolder chat,
- an Assistant home-page request with attached Vault context,
- or a manual new Space action.

Share controls should distinguish **view** and **edit** access for each teammate/external collaborator.

Spaces can be:
- internal-only,
- shared with external parties,
- based on selected Vault context,
- based on a Vault folder/subfolder,
- blank/no prior context,
- frozen point-in-time,
- or auto-updating.

Examples:
- Deal Review Space
- Site Selection Space
- IC Memo Space
- Debt Memo Space
- Broker BOV Space
- OM Build Space
- Lender Review Space
- Portfolio Strategy Space
- Market Watch Space

## Playground lives inside Spaces

The Playground should not be a totally separate product area. It is a capability inside a Space.

Purpose:
- sensitivity analysis,
- assumption testing,
- scenario building,
- what-needs-to-change analysis,
- market benchmark comparison,
- voice/chat-driven analyst conversations.

Example user asks:
- "What needs to change for this deal to hit a 16% IRR?"
- "What if rents grow 6%?"
- "How much does price need to fall if exit cap is 6.25%?"
- "Show me seller case vs Cactus base case vs conservative case."
- "What does market data say against my assumptions?"

The Playground should compare user assumptions against market data, not just let users move sliders.

## Financial analysis tools already matter

Cactus already has or should support built workflows such as:

### Pro forma builder / financial analysis builder

Users should be able to build or use financial models inside Cactus to analyze deals.

Capabilities:
- build base case,
- run scenarios,
- adjust assumptions,
- compare to market benchmarks,
- generate IC/debt memo outputs,
- preserve versions.

### Custom extraction

Many customers already have their own Excel models, templates, and ways of underwriting.

Cactus should support:
- extracting incoming data into the customer's own template,
- mapping fields to their specific Excel structure,
- letting the user chat with extracted data,
- letting the user make changes,
- pulling in market data,
- then pushing clean data directly into their Excel model.

This is important because Cactus should work within people's environments, not force them to abandon existing workflows immediately.

### Template-aware workflows

Cactus should be able to learn:
- how a customer names fields,
- what their model expects,
- which tabs matter,
- how they calculate returns,
- which assumptions are editable,
- what output format they want.

## Outputs are the end goal

The purpose of Cactus work is to create professional outputs that help users make decisions, raise capital, win listings, approve loans, or move deals forward.

### Investor outputs

For investors:
- IC memo,
- debt memo,
- lender package,
- investor update,
- diligence checklist,
- market thesis,
- acquisition recommendation.

### Broker outputs

For brokers:
- OM,
- BOV,
- listing pitch,
- owner outreach package,
- buyer list support,
- market/value story.

### Debt provider outputs

For lenders/debt providers:
- diligence summary,
- credit memo support,
- yes/no recommendation against buy box/credit box,
- risk flags,
- source-linked document summary.

## Analyst chat and voice

Inside a Space, the user should be able to chat or talk with the analyst.

The analyst should have the right context:
- the Space context,
- relevant Vault facts,
- market data,
- financial model/scenarios,
- documents,
- assumptions,
- prior decisions,
- output target.

Voice/chat should not just answer questions. It should perform work:
- change assumptions,
- create scenarios,
- update the model,
- generate a memo section,
- compare to benchmarks,
- list missing diligence questions,
- prepare external package language.

## Automation layer

After work is done manually or semi-manually once, Cactus should help automate repeatable structures.

Examples:

### Input automation

- broker email intake,
- document extraction,
- rent roll/T12 parsing,
- source refreshes,
- provider data enrichment,
- Excel model population.

### Analysis automation

- automatically score new properties,
- run base-case underwriting,
- benchmark assumptions,
- flag broken assumptions,
- compare against buy box,
- generate what-needs-to-change analysis.

### Opportunity automation

- find properties/sites,
- monitor owners,
- watch markets,
- refresh watchlists,
- surface signals,
- create/update Spaces when something needs attention.

### Output automation

- draft IC memo,
- draft debt memo,
- draft BOV/OM sections,
- update a weekly hitlist,
- produce lender/investor-ready snapshots.

## The product loop

```text
1. Find or receive an opportunity
2. Save/enrich it in the Vault
3. Create a Space with scoped context
4. Extract documents and provider data
5. Run financial analysis and sensitivity playground
6. Challenge assumptions against market benchmarks
7. Collaborate with team/external partners
8. Produce the right output
9. Save decisions, scenarios, and learnings back to the Vault
10. Automate the repeatable parts going forward
```

## Design implications

The UI should stay mike-like: clean, compact, direct, and whitespace-disciplined.

Avoid turning Cactus into a cluttered enterprise dashboard. The interface should make complex work feel simple.

The post-onboarding app should present one connected operating model rather than separate pages. Persistent framing should show the active opportunity/Space and the workflow spine: Find opportunities → Fill the Vault → Work in Spaces → Analysis/playground → Outputs → Automate. Each page should feel like a lens on the same job: Opportunities explains why something surfaced, Vault shows what Cactus knows, Spaces shows where work happens, Map/Comps/Data show evidence, Analysis answers what needs to change, Outputs shows what ships, and Agents/Activity show how repeatable work improves over time.

Recommended app surfaces:
- Opportunities
- Vault
- Spaces
- Map
- Agents
- Analysis
- Outputs
- Activity

Potentially, `Analysis` contains the playground/pro forma/custom extraction capabilities inside the active Space rather than as a standalone disconnected page.

## Key product language

Good phrases:
- "Create a Space"
- "Choose Vault context"
- "Work with your analyst"
- "Push to your Excel model"
- "Pressure-test assumptions"
- "What needs to change?"
- "Compare your view to the market"
- "Generate IC memo"
- "Draft debt memo"
- "Build BOV"
- "Start monitoring this"
- "Automate this workflow"

Avoid phrases that feel too technical:
- pipeline execution,
- vectorized context,
- model orchestration,
- configure extraction schema,
- run agent chain.

## Important clarification

The Playground is a capability within Spaces. It should be available wherever the user is doing work on a deal/site/portfolio/market, rather than being treated as a separate isolated product area.

## Prototype implementation note — Option C

The first output artifact should be an IC memo because it demonstrates the investor workflow end-to-end: opportunity intelligence, scoped Space context, custom extraction, financial analysis, market evidence, sensitivity work, and a professional decision package.

The Outputs screen should show:

- an IC memo draft generated from the Riverside Flats Space,
- artifact status and review states: draft, needs review, frozen snapshot, ready to share,
- source-linked sections for thesis, assumptions, devil's advocate, what needs to change, diligence, and appendix,
- export/share actions such as PDF, PowerPoint, share Space, push to customer template, and save to Vault,
- and a prompt to automate the reviewed workflow into a repeatable IC memo agent.

The product message is: Cactus does the work inside the user's environment, produces a real artifact, preserves the evidence trail, and then turns repeatable work into automation.

## Next prototype implication

The next connected prototype pass should show a Space as the center of real work:

1. Create/open a deal Space.
2. Show selected Vault context.
3. Show documents/custom extraction.
4. Show market data evidence.
5. Show pro forma/sensitivity playground.
6. Show analyst chat/voice.
7. Show team/external sharing.
8. Generate an IC memo/debt memo/OM/BOV.
9. Save the scenario/output/learning back to the Vault.
10. Offer to automate future similar workflows.

## Latest UX corrections: onboarding, Vault, workflows, tasks, and Spaces

- Step 3 onboarding should behave like two small steps inside the same screen: **1. Choose first source** and **2. Choose first job**. Make clear this is part of the trial setup, not a permanent limitation: the user chooses one focused first path now and can add more sources, jobs, workflows, and teammates later.
- Portfolio upload must expect missing addresses. Cactus should ingest schedules, historical T-12s, PM/accounting exports, bank files, and loose documents, then create an **unmatched property review queue** where the user resolves addresses via owner/entity name, property name, city/state, parcel hints, file folders, banking/account numbers, and source-system IDs before facts become trusted Vault rows.
- Email/drive connectors should be filtered before activation: folders/labels, approved senders/domains, date ranges, file types, deal-room folders, and read-only scopes. Cactus extracts attachments, email body facts, sender/contact records, phone numbers, addresses, broker names, deadlines, and source threads into review queues before writing to Vault.
- Workflows need a real multi-step builder model, not a vague `Starts from` grid. A workflow consists of trigger/source, ordered steps, review gates, output/action, owner, schedule, and maintenance/error tasks. Examples: watch broker emails → extract contacts/docs → prompt/analyze → draft reply → create task for review → send only after approval.
- Ongoing workflows/scrapers need maintenance states and a task page: running, needs credentials, selector/source changed, low confidence, retrying, overdue review, and assigned owner.
- Spaces are where multi-step CRE work happens. Space detail should be split screen: left chat/work/task stream with @person and /action shortcuts; right artifact canvas for documents, maps, tables, outputs, and results. Workflows can run inside Spaces and repeated work can be saved as a template.
- Vault should support AI search, searchable micro-vault/folder dropdowns with a back path to main Vault, column resizing, cleaner top toolbar, and map-driven micro-vault creation from selected properties or dropped pins with radius/drive-time filters.
- Bottom-left profile menu should not showcase static Account, Organization, Members, Billing/trial, or Integrations pages unless they contain real actions. Keep it to immediate actions: manage workspace/team/billing/integrations via the correct product surface or external console, appearance/sidebar controls, privacy/security docs in a new tab, notifications if actionable, and logout. Clicking outside any popup/side menu should close it.

## Latest UX corrections — account shell, Assistant, Vault setup, Spaces

- Account shell: bottom-left profile menu is the home for account, organization, members, billing/trial, integrations, security/audit, notifications, appearance/theme, and logout. Each item should show distinct content. The floating light/dark toggle should be removed after onboarding and moved into this menu.
- Sidebar hamburger collapses/expands the app menu; account popovers close when clicking outside.
- Assistant: keep the composer simple. `Vault context` opens a focused context picker, not a confusing generic feature. Send is an icon button; mic is a separate voice affordance with a small glowing talk state. Sending should route into a Space/chat workroom so the request becomes durable.
- Empty Vault setup: after onboarding source selection, route directly to the relevant source action. Upload documents means choose/drop deal files immediately, with review/audit noted secondarily. The user should not have to decode an explanatory three-step card.
- Spaces should use depth/texture carefully to explain hierarchy: history/list first, then individual Space as split workroom with left chat/workstream and right output canvas/tasks/context.

## Pre-backend hardening sprint

Before wiring auth, AI APIs, OCR, Google Maps, email/Drive connectors, scrapers, or workflow execution, harden the prototype interaction contract:

- Auth must distinguish new signup from returning login; landing sign-in routes directly to login mode and email login shows a visible magic-link confirmation.
- Assistant composer tools are exclusive. Context, Workflow, and Add are different modes of the same composer, so opening one closes the others.
- Vault AI search should have a visible local response before a real AI endpoint exists: filtered rows/result count plus clear search scope.
- Vault audit should be focused by row/cell/fact selection so source verification feels connected to the grid.
- Workflow library search/filter must not leave stale detail drawers open when the selected workflow is hidden; maintenance issues should become task chips/drawers users can assign, retry, or review.
- Static prototype controls should either mutate visible state, open a drawer/modal, navigate, or clearly say what backend endpoint will own them later.

## Tasks and activity operating model

Cactus needs a first-class **Tasks + Activity** surface before backend integration. It should be the cross-product work inbox for investors, lenders, brokers, and internal teams, while Spaces remain the place where individual deal/workflow tasks are executed.

Task sources:

- **Vault review**: low-confidence extracted facts, unmatched portfolio rows, missing addresses, duplicate property/entity resolution, citation approval, stale market/provider rows.
- **Workflow maintenance**: connector auth expired, scraper selector changed, source refresh failed, cadence/cost approval, scheduled workflow overdue, automation retry needed.
- **Spaces collaboration**: `@person` assignments, `/task` commands, diligence asks, output approvals, lender/broker/client follow-ups.
- **Investor workflows**: acquisition screen, underwriting review, IC memo sections, investor update approvals, portfolio risk flags, capital call/K-1 status.
- **Lender workflows**: debt package requests, DSCR/LTV checks, missing diligence, quote comparison, credit memo review, borrower follow-up.
- **Broker workflows**: BOV/listing pitch tasks, owner outreach, comp package review, OM/data-room refresh, tour/follow-up actions.

Activity should not be a generic audit log only. It should show meaningful state changes across Vault/Spaces/Workflows: source connected, extraction completed, fact approved/rejected, Space created, workflow run started/failed, scraper repaired, output drafted/sent, and task assignment/status changes.

Recommended Tasks UI:

- Top-level app destination named `Tasks`, not a confusing activity dashboard. The user's job is to triage, open the related work, approve/remove/assign, move work across stages, and complete tasks.
- Default structure should behave more like folders/kanban than persona filters. Users can create or use folders such as `Vault review`, `Workflows`, `Spaces`, `Diligence`, `Investor reporting`, and `Maintenance`, then move tasks through `Inbox`, `Doing`, `Review`, and `Done`.
- Each task card/row should show title, source/workflow, related Space/Vault context, owner/assignee, due/status, priority, and one primary action: open, approve, remove, assign, retry, or complete.
- Selecting a task opens a detail drawer with evidence/context, next action, related Vault rows/Space/workflow, assignment controls, and direct `Open Space`, `Open Vault`, `Open workflow`, `Approve`, `Remove`, `Assign`, or `Complete` actions.
- Team members shown in tasks, Spaces, and collaboration surfaces should be clickable. Clicking a teammate opens a team/member drawer where the user can add/remove team members, adjust access, or reassign work.
- Creating or assigning a task should visibly queue an email notification to the assignee in prototype state; backend email delivery will later own the real notification.
- Activity should be secondary, not a primary page. Use it only when it creates value: evidence/history on a task, source provenance, org-level audit, workflow run history, or billing/security trace. Avoid generic usage feeds unless tied to an action or trust question.

## Scraper workflow builder

Scraper workflows should be created through a specific, non-technical workflow UI rather than a generic automation form. The core setup should ask:

1. **Type of workflow** — e.g. Scraper / source watcher, AI analysis, output drafter, review/approval.
2. **Source URL** — listing search, broker page, county source, lender/provider page, etc.
3. **Cadence** — daily, weekly, monthly, quarterly; show that costs/cadence require approval before background runs.
4. **What to pull** — fields/data endpoints such as property name, address, units, asking price, broker, owner, rents, taxes, fees, cap rate, listing URL, source date.
5. **Format/schema** — Vault columns/table, CSV, JSON, PDF/source attachment, or saved micro-vault.
6. **Output** — default is add/update Vault rows with citation, timestamp, confidence, and review state.
7. **Next workflow** — optionally run a financial analysis skill or market analysis skill on each new deal/row entering the Vault; outputs should be a Space, task, score, memo section, or review queue item.

The builder should preview the chain as `Scrape source → normalize fields → write to Vault → analyze new rows → create tasks/Spaces/outputs`, with human approval before continuous scraping or side effects.

## Workflow example gallery

After the scraper builder, the next workflow UX should expose example templates for each core customer job so investors, lenders, and brokers can understand what to automate next without starting from a blank canvas:

- **Investor acquisition screen**: trigger from new Vault deal row; run financial analysis and market analysis; output score, assumptions, IC memo starter, and review tasks.
- **Lender package / credit screen**: trigger from selected deal/borrower package; pull DSCR/LTV/debt yield, missing diligence, sponsor/entity facts; output credit checklist, borrower follow-up, and lender memo section.
- **Broker BOV / listing pitch**: trigger from property + comp rows; pull owner, comps, rent growth, demand, active buyer themes; output BOV range, pitch points, outreach tasks, and listing proposal draft.
- **Portfolio monitoring**: trigger from monthly/quarterly accounting or PM reports; pull NOI/occupancy/delinquency/budget variance; output variance tasks, investor update notes, and asset-management alerts.
- **Market pulse / trigger monitor**: trigger from scheduled market/provider/news refresh; pull permits, deliveries, transactions, employer news, treasury/SOFR; output market rows, opportunity flags, and Space/task creation.

Templates should load the builder with prefilled trigger/source, cadence, pull fields, output, and follow-on skill. The UI should keep the flow compact: pick example → inspect chain → edit fields → create workflow.

Workflow creation must feel like a visible step stack, not one generic form that stays the same for every type. Keep it simple enough for a non-technical user: choose start/trigger, choose source/context, choose skills, choose output, then review the step stack. The right preview rail should show and own the ordered chain, with the primary create CTA always visible at the bottom. Each step can be edited or typed differently: trigger/source, pull/extract, review/approval, analyze, output/write/send. Avoid vague “draft for approval” copy and avoid dumping dozens of tiny field chips; use clearer actions such as `Create workflow`, `Run once`, `Enable after review`, and show the created workflow/run state immediately.

Maintenance should not live as a noisy persistent warning bar. Show a quiet health summary in Workflows and route issues into Tasks, where users can assign, retry, or review. Only urgent/blocking maintenance should interrupt the page.

## Defensibility for PE / family-office complexity

Cactus should optimize for mid-market and high-mid-market private equity and family-office CRE users who need more than generic summaries. The product must respect complex, subjective workflows around debt, partnerships, waterfalls, assumptions, underwriting models, governance, and investor/lender reporting.

Workflow outputs should therefore be treated as defensible artifacts, not final AI answers:

- **Datapoints**: source-linked Vault cells/endpoints with confidence, freshness, and review status.
- **Model inputs**: mapped values for the user's Excel/model/template, with allowed-write scopes and change logs.
- **Assumptions**: editable assumption tables with citations, rationale, sensitivity impact, and approval state.
- **Analysis blocks**: NOI bridge, debt sizing, DSCR/LTV/debt yield, return sensitivity, risk/reward, and “what must be true” sections.
- **Partnership/capital artifacts**: waterfall inputs, promote/equity split assumptions, capital-call/K-1/investor update tasks, and approval gates.
- **Reports/dashboards**: assembled from reviewed artifacts rather than generated from scratch; each section should retain provenance and approval history.

Underwriting workflows should default to “prepare, check, map, and explain the underwriting,” not “Cactus owns the model.” Users should choose whether Cactus maps into their Excel model, creates a Cactus template, or produces review-only assumptions. Generative UI should stay bounded: Cactus can fill known output blocks, not invent arbitrary interfaces before the workflow/artifact model is trusted.

## Integrations, security, and data movement

The Vault needs the primary integration/source center. Account should not become a giant integration catalog or static settings showcase; when there are hundreds of integrations, users care about intent, source/destination direction, status, and the next action, not a vendor list in the profile menu. Organize connectors by user intent instead of a vendor list:

- **Incoming to Vault**: Clay/enrichment, email, Drive/OneDrive, CRMs, property-management systems, accounting systems, banking/Plaid, scrapers/watchers, provider APIs, uploaded files, custom API, webhooks, and MCP tools that can add or query approved context.
- **Outgoing from Vault**: exports to Excel/Sheets/CSV, CRM/task systems, email/report sending, webhooks, API reads, MCP tool calls, and downstream model/report destinations.
- **Connection setup**: scope first, then map fields to Vault rows/endpoints, set refresh/cost rules, require review before trusted writes, and show what data can leave the Vault. In the UI, integrations should be simple app tiles with no explanatory paragraph under every logo/name; detail appears only after selection.
- **Document intake/audit**: creating a Vault should start with drag/drop/import documents or choosing an incoming app/source. Documents with unclear property/entity/location mapping should enter audit as unmatched items. The uploader can `Approve`, `Remove`, or `Assign` the confirmation task to someone else.
- **Connector permissions**: show read/write direction plainly: `Read to Vault`, `Write from Vault`, or `Read + write`. Incoming connectors feed or enrich Vault facts; outgoing connectors export approved Vault facts/artifacts. Writes/sends require explicit approval.
- **Security posture**: clearly answer whether data trains models, where facts came from, where they are sent, who can access them, what scopes were granted, and what audit/approval gates protect side effects. Competitors or external LLMs must not have access to customer Vault data; model/provider usage should be explicit and governed by org policy.
- **Account security page**: the account menu should expose actionable settings only. If the surface is mostly policy/explanation, open a privacy/security page in a new tab instead of pretending it is an in-app workspace.

## Unified action-led app shell cleanup

- Every main workspace should share the same rhythm: compact title, same-position search, one primary CTA, then the work surface. Search bars and CTAs should not jump between corners or change styling by page.
- Onboarding should hand the user to a concrete Vault action selected in onboarding. Avoid a generic app arrival or already-full Spaces state; the Vault exists, but nothing should look populated until upload/connect/import/demo runs.
- Assistant, Vault row chat, and Space chat should share one composer component language: rounded input, compact context chips, mic affordance, send icon, neutral primary styling.
- Spaces are not a dashboard by default. The Spaces landing starts empty/quiet with `New Space`; an opened Space is just chat plus output canvas with a draggable divider. Remove extra workroom labels, context setup fields, work/playground/output tabs, automation buttons, and view-size buttons.
- Vault should feel like Airtable/Excel for CRE data endpoints: one top search, `Add source`, table/map toggle, audit, column-level filter/sort controls, and column-header data endpoint creation. Remove default template buttons and global filter chip drawers.
- Workflows should not be grouped by investor/lender/broker/market personas in the primary UI. Treat workflows as rows with trigger/status/owner/output/action, with top tabs for operational state.
- Skills are reusable capabilities Cactus can call; workflows are ordered jobs that combine triggers, sources, skills, approvals, and outputs. Show skills inside workflow steps, not as confusing top-level persona buckets.
- Colors stay consistent across app surfaces: neutral CTAs, neutral text, restrained brand accent for selected/context states, and status colors only for status.
