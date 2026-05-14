# Cactus Working App Build Handoff — Preserve Refined UI

## Non-negotiable correction
Tyler is unhappy because the previous working-MVP pass replaced the refined prototype UI with a simplified shell. That was wrong. Future working-app build work must **preserve the refined Cactus UI/UX** and wire functionality into it surgically.

## Current repo state
- Repo: `/Users/tysellars/cactus-vault-prototype`
- Branch: `main`
- Correct restored commit after reverting wrong turn: `9da8e46 Revert "build working cactus mvp flow"`
- Wrong-turn simplified-MVP commit preserved only for reference on branch: `working-mvp-wrong-turn-08f5061`
- Local full backup before wrong-turn build: `/Users/tysellars/cactus-vault-prototype-backups/cactus-vault-prototype-20260514-232537`
- Baseline validation after revert: `npm run lint && npm run build` passed; lint has warnings only from unused prototype components.

## Product mandate
Build the working app **past MVP** using the refined UI Tyler spent hours shaping. Do not replace the app shell, Assistant, Vault, Spaces, Workflows, grid, composer, or nav with a new simplified UI. If a functionality change requires UI edits, make minimal surgical changes that preserve visual direction and ask before broad redesign.

## Preserved/refined UI expectations
- Compact/action-led, MikeOSS-like whitespace.
- “Text is the enemy, action is the friend.”
- Assistant is chat-first/Legora-like command center, not cards/button buffet.
- Composer controls live inside the bubble; shared composer across Assistant/Vault/Spaces.
- Context chips: `@ Selected Property`, `@ Selected Properties`, `# Vault Name`; compact controls like `Sources`, `Create`, `Workflow`.
- Avoid permanent generic Assistant chips `Vault`, `Files`, `People`, `Outputs`.
- Vault is CRE spreadsheet/data grid, not generic records/cards.
- Vault columns include CRE underwriting fields: Location, YR 1 NOI, Entry Cap Rate, Market Cap Rate, 1 Bed Effective Rent, 1 Bed Market Rent, NOI Growth, Owner.
- Vault header filters are Excel/Airtable-like in column headers; title dropdown is page-title style, not native select.
- Workflows `Needs review` and `Archived` are real functional filters/status views.
- Micro Vaults are durable user-created containers; selections/map areas are temporary Assistant/Space context unless explicitly saved.

## Correct build plan
1. Freeze current refined UI as source of truth.
2. Add real backend/state beneath current surfaces:
   - auth/signup/team-shareable access
   - secure OpenAI/ChatGPT API key connection
   - document upload/paste/PDF-text extraction
   - extraction review/audit queue
   - write extracted facts into existing Vault grid model
   - selected Vault rows/columns used as Assistant context
   - Assistant actions/shortcuts create durable Spaces/outputs
   - Workflows run/enable/open-space actions have visible outcomes
   - download/share output
   - persistence/hosted deployment
3. Add tests around the real user job, not just unit coverage.
4. Browser E2E must behave like a real user:
   - sign up/log in
   - connect invalid API key and see useful failure
   - connect valid key or mocked key path
   - upload/paste documents
   - review extraction/audit facts
   - confirm facts land in Vault
   - select rows/cells
   - ask Assistant with selected context
   - use shortcuts and create Space/output
   - download/share
   - click Workflows `Needs review` and `Archived`
   - refresh and confirm persistence
   - test empty/error paths and likely human mistakes
5. Loop: build → lint → tests → build → browser E2E → fix → repeat until no unexpected results.

## Implementation discipline
- Do not use a large overwrite of `src/app/page.tsx` unless preserving the existing visual structure line-by-line.
- Prefer extracting logic into new files/API routes and passing state into existing components.
- Commit before risky refactors.
- Keep small, reviewable commits.
- Use branch/checkpoints for experiments.
- If tool-call limits become a risk, write scripts to run repeated checks and use background processes/subagents rather than many tiny manual calls.

## Immediate next step after restart
Start from `9da8e46`, inspect current `src/app/page.tsx`, and make a surgical wiring plan. First likely implementation slice: add document extraction backend/state to the existing Vault/Add Data flow without changing the visual shell.
