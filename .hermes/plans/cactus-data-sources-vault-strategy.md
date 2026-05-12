# Cactus Data Sources + Vault Strategy

Source note captured from Tyler's `message.txt` on 2026-05-10. This is the current working data-source map for product, Vault, Spaces, scoring, and prototype decisions.

## Product principle

Cactus should make decisions and outputs visibly backed by data. The product should not feel like an AI summary tool; it should feel like a CRE decision system where every recommendation can be traced to market data, property data, source documents, user criteria, and review history.

## Live / available data sources

| Source | What it provides | Status | Product role |
| --- | --- | --- | --- |
| HelloData | Multifamily rental comps, roughly 10 comps per property | Live | Rent comp support, rent upside, underwriting assumptions |
| Radius Plus | Self-storage rental comps | Live | Self-storage rent comp support |
| Census ACS | Demographics, rent burden, income, population via internal pipeline | Live | Demand profile, renter base, market/submarket thesis |
| FRED | Economic data, interest rates, MSA building permits | Live | Macro context, rate assumptions, market momentum |
| FEMA | Flood zone designations per property | Live | Risk flags, map layer, insurance/diligence questions |
| Walk Score | Walk, transit, bike scores per property | Live | Neighborhood quality, tenant demand signal |
| Google Places | POI / proximity data | API access available | Neighborhood profile, nearby amenities, site-selection support |

## Paid data providers being added

### Green Street — highest priority

- Status: In negotiation; target 6-month pilot at launch.
- Pricing: $20,000 for 2,000 properties, approximately $10/property as one bundled API call; overages TBD.
- Timeline: Build May-June; live at launch.
- Sectors: Multifamily, Office, Industrial, Strip Centers, Self Storage.
- Data: zip-level cap rates, sale comps, revenue growth, NOI growth, market/submarket/zip grades, supply/demand metrics.
- Product role: Institutional valuation trust layer. Without market cap rates and sale comps, Cactus can produce an opinion but cannot benchmark against actual market pricing.

### ATTOM — P0, replaces Regrid

- Status: P0 primary parcel + property data provider.
- Pricing: $1,000/month for 5,000 calls, about $0.20/call; 3-5 calls/property = about $0.60-$1.00 per underwriting.
- Timeline: Build May-June; live at launch.
- Core calls:
  - `/property/basicprofile`: APN, address, lat/lng, zoning, year built, units/SF, assessment, market value, tax, improvement %, owner detail, latest sale, first-position mortgage.
  - `/saleshistory/expandedhistory`: full sale chain, mortgages, subordinate mortgages, foreclosure/distress when present; supports last sale history and mortgage calculator.
  - `/neighborhood/community`: ZIP-level demographics, employment, retail spending, transport, climate, disaster indices, crime, air quality.
- Optional calls:
  - `/transaction/salestrend`: 8-year ZIP sale trends for market momentum.
  - `/school/search` + `/school/profile`: school search and profile; compare against GreatSchools after testing.
  - Sale comps if coverage is good enough to supplement Green Street.
- Product role: Primary property identity, owner, mortgage, tax, assessment, sale chain, and neighborhood data layer.

### ReportAll — P0 parcel + building geometry

- Status: P0; replaces Regrid parcel geometry and removes need for OSM building footprints in this stage.
- Pricing: $1,050/year for 15,000 parcel calls + 375,000 map tiles; about $0.07/parcel call.
- Timeline: Build May-June; live at launch.
- Data: parcel boundary geometry, building footprint polygon(s), parcel map tiles.
- Product role: Map truth layer: parcel outlines, building outlines, lot size/frontage/shape, geometry-driven map UX.

### CrimeOMeter — Tomas priority 1

- Status: Target live at launch or shortly after.
- Pricing: Ultra $249/month for 1,000 calls; Mega $490/month for 5,000 calls; about $0.10/call.
- Data: SQI score, incident counts in configurable radius, violent/property breakdown, crime density and trends.
- Product role: Property-level safety/risk signal for tenant quality, vacancy, rent assumptions, and institutional underwriting credibility.

### GreatSchools — Tomas priority 2

- Status: Target July-August 2026.
- Pricing: $97.50/month, 15,000 calls included, $0.006/call overage; 14-day trial.
- Data: nearest 3-5 schools, rating bands, names, addresses, grades, distance.
- Product role: MF family-submarket rent premium / tenant stability signal. Test overlap with ATTOM school calls.

### Shovels.ai — Phase 2

- Status: Target August-September 2026.
- Pricing: $249/month base + $0.25/call.
- Data: permit number/type/status/dates/job value/fees, plain-English summary, category tags, inspections, property details, owner/applicant/contractor details, contractor license/status/rating/pass rate.
- Product role: Physical condition inference, deferred maintenance, recent capex, hidden upside, supply pipeline, sustainability, and contractor-quality flags.

## Free data sources being added

### FBI Crime Data

- Effort: 3-4 days.
- Data: violent/property crime rates at county/agency level and comparisons to state/national averages.
- Product role: Market-level supplement to CrimeOMeter property-level score.

### Google Places POI enrichment

- Effort: 2 days.
- Data: counts and nearest distances for grocery, restaurants, pharmacies, hospitals, transit, gyms, major retailers.
- Product role: Standardized neighborhood profile. Cache by lat/lng with 90-day TTL.

### BLS Employment Concentration

- Effort: 2 days.
- Data: top 5 industries by county employment share; concentration risk flag above 25-30%.
- Product role: Economic diversification risk.

### Natural Disaster Risk

- Effort: 2-3 days.
- Data: FEMA NRI composite score for 18 hazards at tract level; USGS earthquake hazard data.
- Product role: Climate/natural-hazard risk beyond FEMA flood zones.

### Census ACS expansion

- Effort: 1 day.
- Data: property tax rates, vacancy by type, age of housing stock, commute patterns.
- Product role: Rounds out expense benchmarking, housing supply context, and tenant/demand context.

## Vault implications

Every provider should feed the Vault as source-linked facts, not just raw blobs or one-off model context.

Recommended structure:

1. Raw source/provider response retained with provider, endpoint, call timestamp, cost estimate, address/property key, and license constraints.
2. Normalized facts written to canonical Cactus objects: Property, Site, Opportunity, Owner, Comp, Market Signal, Risk Signal, Criteria Fit, Output.
3. Facts include source/provider, endpoint, confidence, freshness, geography level, and review status.
4. Conflicts are preserved until reviewed. Example: ATTOM unit count vs OM unit count vs county record.
5. Spaces use scoped subsets of these facts, so external collaborators only see approved context.

## Data category map

| Category | Providers | Used for |
| --- | --- | --- |
| Identity / parcel / ownership | ATTOM, ReportAll | Property record, owner record, parcel/building map |
| Valuation / pricing | Green Street, ATTOM optional comps, HelloData, Radius Plus | Cap rate, sale comps, rent comps, pricing support |
| Market growth / supply-demand | Green Street, FRED, Census ACS, Shovels nearby permits | Market thesis, supply risk, opportunity score |
| Physical / capex | Shovels, ATTOM, ReportAll | Condition flags, deferred maintenance, recent capex, building/lot geometry |
| Neighborhood quality | Google Places, Walk Score, GreatSchools, ATTOM neighborhood | Tenant demand, amenities, school quality, livability |
| Risk | FEMA, FEMA NRI, USGS, CrimeOMeter, FBI, ATTOM disaster/crime | Flood, natural hazard, crime, climate, insurance/diligence |
| Economic / demographic | Census ACS, ATTOM neighborhood, BLS, FRED | Demand, employment concentration, income, rent burden, macro context |

## Vault creation setup model

The Vault source center should give every source type a clear creation path, not just a list of possible integrations. The default UI should be organized around the three jobs users understand first:

1. **Deal documents** — T-12s, rent rolls, occupancy reports, management summaries, OMs, market reports, debt quotes, and Excel/CSV/PDF deal materials.
2. **Portfolio data** — historical multi-property documents, files with missing addresses, property-management/accounting software, and potentially banking data.
3. **Inbox + drive** — Gmail, Outlook, Google Drive, OneDrive, broker senders, and deal-room folders.

Provider APIs, public data, and listing/records watchers should be available as secondary/advanced additions, not the first thing users have to parse.

Each source setup should answer five questions, but the default prototype should answer them inline and lightly rather than through a heavy modal/wizard:

1. **Choose source type** — one-off file, imported list/comps, live inbox/folder, listing/record watcher, or provider/public data API.
2. **Scope** — exact files, folders, senders, markets, saved searches, providers, endpoints, asset classes, and geography levels Cactus may use.
3. **Map into the Vault** — which Vault rows and endpoint columns will be created or updated; e.g. properties, owners, comps, markets, risks, debt quotes, rent roll lines, T-12 line items, provider benchmarks.
4. **Set refresh/cost rules** — one-time extraction, manual refresh, daily watcher, weekly pulse, monthly provider refresh, premium call approval, cache/freshness labels.
5. **Review before activation** — facts enter the Vault with source link, citation/cell/page/URL, confidence, freshness, cost state, and approve/edit/reject review state.

The first-run empty Vault should carry the onboarding choice directly into the Vault surface. Use a Mike-like empty table/workspace: quiet toolbar, no connected sources, a centered source-specific first action, and a compact preview of the rows/columns Cactus will create. `Add to Vault` should open a narrow focused sheet/drawer for the selected path, not a large left-nav modal. Let users switch paths only as a small secondary control.

Source-specific setup examples:

- **OM PDFs / T12s / rent rolls / Excel models / debt quotes / broker emails / notes:** upload or attach files, choose extraction template, map fields/endpoints, then verify extracted facts against original source preview.
- **Property lists / sales comps / lease comps / CRM exports / watchlists / portfolio schedules:** import CSV/XLS/CRM table, map columns to Vault objects, dedupe properties/owners/comps, choose whether rows are frozen import or watchlist.
- **Gmail / Outlook / approved broker senders:** choose mailbox/label/senders/date range, approve read-only scope, decide whether future matching emails create review queue items or auto-update existing Vault rows.
- **Google Drive / OneDrive / deal rooms:** choose folder/subfolder, file types, sync cadence, and whether new files create Spaces, add to existing folders, or only enter review.
- **CoStar / Crexi / LoopNet:** define saved-search geography, asset class, size, price/cap-rate/buy-box filters, dedupe rules, and alert/Space creation behavior.
- **County records / foreclosure filings / CMBS watchlists:** choose jurisdictions/assets, signal types, cadence, and which events create ownership/distress/debt rows.
- **Provider/public APIs:** choose provider bundle, endpoint/fact categories, geography/property scope, refresh cadence, cache policy, and premium-call approval threshold.

The setup UI should keep the left side as a compact source library and the right side as the selected source's creation steps. Avoid a heavy multi-page wizard; make each source feel actionable and reviewable in one surface.

## Product/UI implications

Cactus should show users not just conclusions, but the evidence behind conclusions:

- "Why Cactus surfaced this" should cite Green Street, ATTOM, HelloData/Radius Plus, Google Places, FEMA, and team criteria as applicable.
- Deal Analysis should include a compact evidence strip: Pricing, Demand, Risk, Physical, Neighborhood, Criteria Fit.
- Vault property pages should show data freshness and provider/source for each major field.
- Spaces should show which Vault context/data sources are included and which are excluded.
- Outputs should include a source appendix or citation drawer.

## Cost implications

- Treat Green Street as premium/high-cost data: use intentionally, cache, and make its value visible in the product.
- ATTOM variable cost is moderate per underwriting but can add up at 3-5 calls/property; cache by property and separate required vs optional calls.
- ReportAll parcel calls are cheap; tiles effectively low-cost at expected volume.
- CrimeOMeter is reasonably cheap but should still be cached by lat/lng/radius and refreshed on a sensible schedule.
- GreatSchools and free sources are low-cost enrichment layers.
- Shovels is valuable but later and per-call expensive enough to use on active reviews, watchlist signals, or when physical-condition uncertainty matters.

## Launch priority recommendation

1. Keep live sources visible: HelloData, Radius Plus, Census ACS, FRED, FEMA, Walk Score, Google Places.
2. P0 launch: ATTOM + ReportAll + Green Street if pilot closes.
3. Launch/near-launch risk layer: CrimeOMeter and FBI supplement.
4. Quick free enrichment: Google Places, BLS, FEMA NRI/USGS, ACS expansion.
5. Post-launch/Phase 2: GreatSchools after ATTOM overlap test; Shovels for permit/capex and supply pipeline depth.

## Portfolio and inbox/drive ingestion edge cases

- Portfolio uploads often lack clean addresses. The ingestion flow should create provisional property rows from file/folder names, owner/entity names, PM/accounting IDs, bank references, parcel/city hints, and time periods, then route unresolved matches to a review queue before trusted Vault write.
- Email and drive connectors must start with scoped filters: approved folders/labels, senders/domains, date ranges, file types, thread types, and deal-room paths. Extraction should capture attachments plus email-body metadata: broker/contact names, phone numbers, addresses, owner/entity names, deadlines, asking price, and related documents.
- Recurring connectors and scrapers require maintenance tasks when auth expires, source formats change, selectors fail, confidence drops, or refreshes become stale/costly.

## Latest Vault creation simplification

For the first selected onboarding source, Vault setup should go directly to the action path. Upload documents should show a file drop/choose-files surface immediately. Connect email/drive should show scope/filter controls immediately. Import lists/comps should show list/import mapping immediately. Review/audit, provenance, and micro-vault outputs remain visible but secondary.
