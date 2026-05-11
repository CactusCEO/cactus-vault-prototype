# Cactus Product Context Index

This index exists so future Cactus work starts from the latest product context instead of re-discovering the same decisions in chat.

## How to use this

Before building or changing Cactus product/UI/infrastructure, read the relevant context files below. After Tyler gives durable product direction, update the right file before or alongside code changes.

## Canonical context files

| File | Purpose | Update when |
| --- | --- | --- |
| `.hermes/plans/2026-05-10_130903-cactus-whole-app-blueprint.md` | Whole-app blueprint: positioning, product loop, app surfaces, review buckets | App direction/nav/core product story changes |
| `.hermes/plans/cactus-data-sources-vault-strategy.md` | Live/paid/free data sources, costs, product role, Vault implications | Data providers, pricing, availability, or provider strategy changes |
| `.hermes/plans/cactus-vault-time-series-cost-strategy.md` | Cost-aware data refresh, time-series Vault history, auto-updates, data story | Vault refresh, storage, snapshots, auto-update, or time-series strategy changes |
| `.hermes/plans/cactus-product-operating-model.md` | Vault + Spaces + Playground-in-Spaces + custom extraction + outputs + automation | Workflow/product operating model changes |
| `docs/product/cactus-context-index.md` | This navigation/index file | New context files are added or context ownership changes |

## Durable product model

Cactus should be understood as:

```text
Find opportunities → Fill/enrich the Vault → Work in Spaces → Analyze/playground inside Spaces → Produce outputs → Automate repeatable work
```

Core concepts:

- **Vault**: master CRE memory and system of record; source-linked facts, documents, market/provider data, portfolio historicals, assumptions, scenarios, outputs, decisions, learnings, and time-series changes.
- **Spaces**: focused work areas where work happens with scoped Vault context, teammates/external collaborators, files, tasks, chat/voice, analysis, assumptions, and outputs.
- **Playground**: sensitivity/scenario/what-needs-to-change capability inside Spaces, not a disconnected standalone product.
- **Custom extraction**: Cactus should work inside customer environments by extracting into their own Excel models/templates.
- **Outputs**: IC memos, debt memos, lender packages, OMs, BOVs, listing pitches, diligence summaries, investor updates, credit memo support.
- **Agents/automation**: after repeated work is understood, automate intake, enrichment, scoring, monitoring, analysis, opportunity finding, and output drafting.

## MD update rule

When Tyler gives durable guidance about product direction, design, data architecture, Vault/Spaces behavior, workflow, automation, or outputs:

1. Decide whether it changes an existing context file or deserves a new one.
2. Update the relevant `.md` file before or alongside code changes.
3. Keep the docs concise and connected; avoid duplicating full content across many files.
4. Prefer adding a short canonical statement plus links over creating overlapping Frankenstein docs.
5. If a prototype/code change implements a product decision, the corresponding context doc should already contain that decision.

## What not to put here

Do not use these docs for temporary TODOs, short-lived implementation notes, or one-off chat summaries. Only capture durable context that should improve future builds.
