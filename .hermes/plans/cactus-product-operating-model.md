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
- Assistant should now be treated as pure chat/command. Remove separate page sections below the composer unless they are transient results; users add files/context/workflows through compact controls attached to the composer.

Workflow page correction:
- Mirror Mike's Workflows page more closely: a calm list/table with tabs, search/filter controls, small plus action, checkboxes, and compact rows.
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

Vault interaction model:
- Vault should feel like a configurable CRE data grid, not just a fixed list of extracted records.
- Rows can represent properties, deals, sites, markets, submarkets, cities, MSAs, national benchmarks, provider reports, or broker-shared market reports. Market-level and national rows are valuable because they become context for property-level analysis.
- Columns are user-created data endpoints/prompts. Examples: YR 1 NOI, YR 2 cap rate, owner name, NOI growth, demand growth, climate risk, average 1BR rent, sale comp range, supply pipeline, tax reassessment risk.
- Each custom column should preserve label, format, prompt, source/provider scope, geography/asset-class filter, citations, confidence, and review state.
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

A clear **+ New Workspace** CTA belongs in Spaces History header. Past-work examples include finding rental/sales comps, building a BOV presentation, credit memo + underwriting builds, buyer identification + OM creation, sponsor/borrower diligence, operational efficiency audits, portfolio analysis, and IC memo creation.

Show collaborator/profile avatars directly in Spaces History and Space detail headers so users can see who shared or worked on each Space. New Space creation should be intentionally simple: choose a starting context, name it, pick frozen/latest/auto-updating context, and add collaborators/access. Do not turn this into a complex workflow builder.

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
