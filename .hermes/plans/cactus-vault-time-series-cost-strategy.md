# Cactus Vault: Data Cost, Time-Series Memory, and Auto-Update Strategy

Captured from Tyler's voice direction on 2026-05-10.

## Core idea

The Vault is not just a place to store the latest data point. It should become a time-aware CRE memory layer that saves provider data, customer data, market changes, assumptions, and model outputs over time so Cactus can tell a story:

- what changed,
- why it matters,
- how valuation/underwriting moved,
- whether the deal/portfolio risk changed,
- and what action should be taken.

Example: if Green Street cap rate is 6.0% last month, 6.5% this month, and 7.0% next month, Cactus should not overwrite the old value. It should preserve the series and explain that valuation pressure is increasing.

## Product principle

Every data point has a cost profile and a time profile.

1. Cost profile:
   - Direct API cost
   - Storage cost
   - Processing cost
   - Refresh cost
   - Premium vs free availability

2. Time profile:
   - Point-in-time snapshot
   - Slowly changing value
   - Frequently updated market indicator
   - Historical series
   - Forecast series

Cactus should make smart choices about what to fetch, what to cache, what to refresh, what to snapshot, and what to expose in the UI.

## Data should not just be replaced

Avoid a naive latest-value model:

```text
Property cap rate = 7.0%
```

Prefer a time-aware fact/event model:

```text
Green Street cap rate
- Apr 2026: 6.0%
- May 2026: 6.5%
- Jun 2026: 7.0%
Trend: +100 bps in 90 days
Cactus interpretation: exit valuation risk has increased; buyer should rerun pricing and debt sensitivity.
```

## Vault storage layers

### 1. Raw response/archive layer

Store provider responses and user uploads as evidence.

Fields:
- provider/source
- endpoint/file type
- fetched/uploaded at
- address/property/site key
- request params
- billing unit/cost estimate
- license/usage constraints
- raw payload/blob pointer

### 2. Normalized current-state layer

Store the best current view for fast UI and scoring.

Examples:
- current cap rate
- current owner
- latest assessment value
- current flood zone
- latest crime score
- latest rent comp summary

### 3. Time-series/history layer

Store changes over time.

Examples:
- cap rate monthly snapshots
- revenue/NOI growth forecasts by vintage date
- sale comp changes
- rent comp refreshes
- tax assessment changes
- insurance estimates
- crime/safety score updates
- supply pipeline changes
- mortgage balance estimate over time

### 4. Derived signal layer

Store Cactus interpretations.

Examples:
- valuation pressure increasing
- cap rate expansion reduced exit value by X
- tax reassessment risk rose after sale
- insurance cost risk increased
- rent growth no longer supports seller pricing
- supply pipeline weakened the development thesis

### 5. Decision/scenario layer

Store underwriting versions and assumptions.

Examples:
- seller case
- Cactus base case
- conservative case
- IC approved case
- voice/chat generated sensitivity case
- what-needs-to-change scenario

## Auto-update subscriptions

Customers should be able to subscribe parts of their Vault to auto-updates.

Examples:

### Property-level auto-update

"Keep this property updated monthly."

Refresh:
- cap rate benchmark
- rent comps
- ownership/sale changes
- flood/risk changes when relevant
- permits if Shovels enabled
- POI changes on slower cadence

### Portfolio auto-update

"Watch my owned assets."

Refresh:
- valuation benchmarks
- tax assessment risk
- insurance/risk signals
- market rent comp movement
- debt/refi signals
- nearby supply pipeline

### Market/submarket auto-update

"Watch Tampa multifamily."

Refresh:
- Green Street market/submarket/zip grades
- supply/demand metrics
- FRED permits/macro
- Census/BLS updates on release cadence
- relevant listings/comps if available

### Opportunity watchlist auto-update

"Keep this target list fresh."

Refresh:
- owner/sale/mortgage signals
- market pricing movement
- recent permits/new supply
- rent comp movement
- risk changes

## Save-last vs append-history policy

Not all data needs infinite history.

Recommended policy:

| Data type | Store policy |
| --- | --- |
| Expensive premium valuation data | Snapshot history + current value; refresh intentionally |
| Free/cheap public data | Snapshot when it changes materially or on release cadence |
| Raw documents/uploads | Keep original immutable copy |
| Large raw API payloads | Retain raw for audit for configurable period; keep normalized facts longer |
| Derived Cactus signals | Keep history because this explains how Cactus thinking changed |
| User assumptions/scenarios | Keep versions, never silently overwrite |
| External Space shared data | Keep immutable audit trail of what was shared and when |

## Cost-aware product behavior

Cactus should understand that data is not free.

### Free/cheap enrichments

Use broadly and make available in lower tiers:
- Census ACS
- FRED
- FEMA flood
- Walk Score if already licensed/cost-manageable
- Google Places depending on quota/caching
- BLS
- FBI crime
- FEMA NRI / USGS

### Premium/costly enrichments

Use intentionally and show value:
- Green Street
- ATTOM multi-call workflows
- CrimeOMeter
- Shovels.ai
- GreatSchools if paid separate from ATTOM

Premium calls should have:
- caching
- freshness labels
- usage tracking
- maybe user-visible credit/refresh controls for certain tiers
- clear moments in the UI where their value is visible

## UI implications

### Vault property page

Add a compact "Data story" section:

```text
What changed
- Cap rates: 6.0% → 6.5% → 7.0%
- Rent comp support: +12% upside → +8% upside
- New supply: 2 projects → 4 projects within 1 mile

Cactus view
Valuation risk increased. Deal now needs $1.2M price reduction or stronger NOI growth to hit target returns.
```

### Deal Analysis

Add "What changed since last review":

```text
Since your April review:
- Exit cap benchmark widened 50 bps
- Debt rate increased 35 bps
- Crime score unchanged
- Rent comp upside narrowed from 11% to 8%

Impact:
IRR moved from 15.8% to 12.9% under the same assumptions.
```

### Spaces

Spaces should declare whether they use:
- latest Vault data only,
- frozen point-in-time data,
- or auto-updating context.

This matters for external sharing and IC memo auditability.

Example:

```text
Space context: Frozen as of May 10, 2026
Auto-updates: Off
Reason: IC memo package shared externally
```

or:

```text
Space context: Auto-updating monthly
Auto-updates: Green Street, ATTOM owner/sale, HelloData comps, FEMA/FRED
Reason: Active watchlist
```

## Underwriting model implications

The Vault can eventually power semi-automated underwriting because it contains:

- property facts
- rent comps
- sales comps
- cap rates
- taxes/assessment
- insurance/risk data
- market growth forecasts
- supply/demand metrics
- customer portfolio actuals/historicals
- customer investment criteria
- prior decisions

Potential calculators/projectors:
- property tax reassessment projector
- insurance cost/risk projector
- mortgage balance estimator
- capex/deferred maintenance inference
- market rent growth scenario builder
- exit cap sensitivity builder
- automated base-case underwriting model

## Strategic value

The reason the Vault matters is not only storage. It creates proprietary edge over time.

A customer's Vault should become better than a one-off underwriting because it combines:

1. Cactus provider data,
2. customer portfolio and historicals,
3. deal review history,
4. time-series market changes,
5. approved/rejected assumptions,
6. and automatic updates.

That creates a data advantage against competitors and against generic AI tools.

## Prototype implications

The prototype should eventually show:

1. Vault as master memory and data story layer.
2. Data freshness and cost-aware refresh controls.
3. "What changed" cards on property/deal pages.
4. Auto-update subscriptions for properties, portfolios, markets, and watchlists.
5. Deal Analysis that can compare the current model to prior snapshots.
6. Spaces that can be frozen or auto-updating depending on collaboration/use case.
7. Sensitivity Playground using both latest data and historical market movement.
