import * as assert from "node:assert/strict";
import { test } from "node:test";
import { appendWorkflowOutcome, createWorkflowOutcome, createWorkflowSpaceDraft } from "./cactus-workflows";

test("creates a safe workflow run preview outcome", () => {
  const outcome = createWorkflowOutcome("Crexi multifamily scraper → Vault", "Run once", "2026-05-15T00:00:00.000Z");
  assert.equal(outcome.status, "Preview ready");
  assert.equal(outcome.mode, "Run once");
  assert.match(outcome.note, /without enabling a schedule/i);
});

test("enable outcome keeps approval gate explicit", () => {
  const outcome = createWorkflowOutcome("Inbox watcher", "Enable", "2026-05-15T00:00:00.000Z");
  assert.equal(outcome.status, "Approval required");
  assert.match(outcome.note, /human approval/i);
  assert.match(outcome.note, /side effects/i);
});

test("workflow outcome history dedupes latest action and caps length", () => {
  const first = createWorkflowOutcome("A", "Run once", "1");
  const second = createWorkflowOutcome("A", "Run once", "2");
  const many = Array.from({ length: 10 }, (_, index) => createWorkflowOutcome(`W${index}`, "Enable", String(index)));
  const deduped = appendWorkflowOutcome([first], second);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].createdAt, "2");
  assert.equal(appendWorkflowOutcome(many, first, 5).length, 5);
});

test("workflow Space draft includes review checklist and redacts secrets", () => {
  const draft = createWorkflowSpaceDraft("Weekly sk-proj-secretkey watcher");
  assert.match(draft.title, /\[REDACTED\]/);
  assert.doesNotMatch(draft.downloadText, /sk-proj-secretkey/);
  assert.match(draft.artifactBody, /Review checklist/);
  assert.match(draft.shareText, /workflow Space opened/);
});
