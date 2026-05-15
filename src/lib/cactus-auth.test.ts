import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyBackendState } from "./cactus-backend";
import { bootstrapAuthSession, safeEmailSlug } from "./cactus-auth";

test("auth bootstrap creates user, organization membership, session, task, and audit event", () => {
  const state = createEmptyBackendState();
  const session = bootstrapAuthSession(state, { email: "Tyler@CactusCRE.com", provider: "email", companyName: "Cactus Capital Partners" });

  assert.equal(session.email, "tyler@cactuscre.com");
  assert.equal(session.organizationId, "org_cactus_capital");
  assert.equal(session.role, "owner");
  assert.equal(state.users.length, 1);
  assert.equal(state.organizationMemberships.length, 1);
  assert.equal(state.organizationMemberships[0].userId, session.userId);
  assert.equal(state.tasks.some((task) => task.title.includes("Complete organization setup")), true);
  assert.equal(state.auditEvents.some((event) => event.action === "auth.session_bootstrap"), true);
});

test("auth bootstrap is idempotent for the same email and upgrades provider metadata", () => {
  const state = createEmptyBackendState();
  const first = bootstrapAuthSession(state, { email: "tyler@cactuscre.com", provider: "email" });
  const second = bootstrapAuthSession(state, { email: "TYLER@cactuscre.com", provider: "google" });

  assert.equal(first.userId, second.userId);
  assert.equal(state.users.length, 1);
  assert.equal(state.organizationMemberships.length, 1);
  assert.equal(state.users[0].authProvider, "google");
  assert.equal(state.auditEvents.filter((event) => event.action === "auth.session_bootstrap").length, 2);
});

test("auth bootstrap rejects invalid work email and never stores passwords or secrets", () => {
  const state = createEmptyBackendState();
  assert.throws(() => bootstrapAuthSession(state, { email: "not-an-email", provider: "email" }), /valid work email/i);
  bootstrapAuthSession(state, { email: "owner@example.com", provider: "microsoft", displayName: "Owner sk-proj-secret" });

  assert.equal(JSON.stringify(state).includes("sk-proj-secret"), false);
  assert.equal(state.users[0].displayName.includes("[REDACTED]"), true);
});

test("safe email slug creates stable ids without exposing full raw email casing", () => {
  assert.equal(safeEmailSlug("Tyler.Sellars+Cactus@Example.com"), "tyler-sellars-cactus-example-com");
});
