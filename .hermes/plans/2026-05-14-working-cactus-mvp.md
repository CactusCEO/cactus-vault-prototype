# Working Cactus MVP Implementation Plan

> **For Hermes:** Build the fastest useful hosted/shareable version while preserving the current prototype backup at `/Users/tysellars/cactus-vault-prototype-backups/cactus-vault-prototype-20260514-232537`.

**Goal:** Convert the Cactus prototype into a working local/web app where a user can sign up, connect a ChatGPT/OpenAI API key, extract deal documents into the Vault, ask the Assistant using Vault context and shortcuts, create a Space/output, download/share it, and verify every component through realistic end-to-end testing.

**Architecture:** Keep a single Next.js app for speed. Use client-side localStorage as the MVP persistence layer so it works without external database credentials; add Next API routes for backend behaviors and OpenAI-compatible chat calls. This is intentionally a demo-grade working app for team validation, not final production architecture.

**Tech Stack:** Next.js, React, TypeScript, Tailwind, browser File APIs, Next API route for chat, Node test runner for extraction logic, browser E2E using Hermes browser tools.

---

## Product/UX slice

1. **Goal:** A CRE user can move from signup to output using real app behavior.
2. **Target user:** CRE investor/operator testing whether Cactus can organize deal docs and reason over a Vault.
3. **Decision supported:** “Can I quickly extract a deal package, use the Vault as context, and produce a credible memo/comps/output?”
4. **Simplest UX:** One app shell with Assistant, Vault, Spaces, Workflows, Settings. No fake pages. Every CTA mutates state, opens a panel, downloads, or routes.
5. **Data model:** User, API key status, documents, extracted Vault rows, selected row ids, messages, spaces, outputs, workflows.
6. **Build slice:** Local persistent demo app; OpenAI call route if key exists; deterministic fallback assistant if no live key.

## Testing strategy before coding

Test a real user job, not isolated widgets:

1. New user signs up.
2. User connects an invalid API key and sees safe failure.
3. User saves demo/local API key state.
4. User uploads/pastes a South Beach shopping center deal note.
5. App extracts structured fields into Vault with source citations.
6. User selects extracted Vault row.
7. User uses Assistant shortcut/context to build comps/review deal.
8. Assistant response references selected Vault row/context.
9. User creates Space from the conversation.
10. User generates output/memo.
11. User downloads output.
12. User shares/copies share link.
13. User creates/filters Workflows including Needs review and Archived.
14. User refreshes; data persists.
15. Browser console contains no unexpected JS errors.
16. Lint, build, and automated tests pass.

## Implementation tasks

### Task 1: Shared domain/extraction module
- Create `src/lib/cactus.ts` with types, seed state, local extraction helper, deterministic assistant fallback, output generator, and storage schema version.
- Create `src/lib/cactus.test.ts` using Node test runner.
- Test extraction for property name, location, asset class, class, size, NOI, cap rate, source citation.

### Task 2: API route for chat
- Create `src/app/api/chat/route.ts`.
- Accept `{ apiKey, messages, vaultContext, mode }`.
- If no valid-looking key, return deterministic fallback with status metadata.
- If key is provided, call OpenAI chat completions with safe server-side error handling.
- Never log/persist the key.

### Task 3: Working app UI
- Replace prototype-only flow in `src/app/page.tsx` with working app shell.
- Preserve UI spirit: compact, Legora-like assistant, action-led, low text.
- Screens: Assistant, Vault, Spaces, Workflows, Settings.
- Implement signup/onboarding state, API key connection, document paste/upload extraction, Vault table/map toggle, selection context, chat, shortcuts, Space creation, output download/share.
- Persist all demo data in localStorage.

### Task 4: Deep test harness
- Add npm scripts: `test`, `test:e2e:manual-note` if useful.
- Automated tests for extraction/output/fallback assistant.
- Browser E2E via Hermes browser tools with real clicking/typing.

### Task 5: Validation loop
- Run `npm run lint && npm run test && npm run build`.
- Start app, browser-click through full real job.
- Fix until no unexpected failures/errors.
- Commit final working version.
