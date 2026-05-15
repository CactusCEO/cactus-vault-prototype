import * as assert from "node:assert/strict";
import { test } from "node:test";
import { addAuditApproval, createAiConnectionFromKey, redactPotentialSecrets, validateOpenAiKeyShape } from "./cactus-settings";

test("validates OpenAI project and classic key shapes without accepting short secrets", () => {
  assert.equal(validateOpenAiKeyShape("sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"), true);
  assert.equal(validateOpenAiKeyShape("sk-abcdefghijklmnopqrstuvwxyz1234567890"), true);
  assert.equal(validateOpenAiKeyShape("sk-short"), false);
  assert.equal(validateOpenAiKeyShape("not-a-key"), false);
});

test("stores only a redacted AI connection fingerprint", () => {
  const connection = createAiConnectionFromKey("sk-proj-abcdefghijklmnopqrstuvwxyz1234567890");

  assert.equal(connection.status, "connected");
  assert.equal(connection.provider, "OpenAI");
  assert.equal(connection.label, "OpenAI connected");
  assert.match(connection.fingerprint, /^sk-proj-…[a-z0-9]{4}$/i);
  assert.doesNotMatch(JSON.stringify(connection), /abcdefghijklmnopqrstuvwxyz1234567890/);
});

test("redacts possible API keys in user visible output", () => {
  const redacted = redactPotentialSecrets("Use sk-proj-abcdefghijklmnopqrstuvwxyz1234567890 and secret_token=abc");

  assert.match(redacted, /\[REDACTED\]/);
  assert.doesNotMatch(redacted, /sk-proj-abcdefghijklmnopqrstuvwxyz/);
  assert.doesNotMatch(redacted, /secret_token=abc/);
});

test("adds audit approvals idempotently per row and field", () => {
  const first = addAuditApproval([], { row: "1450 Ocean Drive", field: "YR 1 NOI", value: "$1.18M" }, "2026-05-15T12:00:00.000Z");
  const second = addAuditApproval(first, { row: "1450 Ocean Drive", field: "YR 1 NOI", value: "$1.19M" }, "2026-05-15T12:05:00.000Z");

  assert.equal(second.length, 1);
  assert.equal(second[0].value, "$1.19M");
  assert.equal(second[0].approvedAt, "2026-05-15T12:05:00.000Z");
});
