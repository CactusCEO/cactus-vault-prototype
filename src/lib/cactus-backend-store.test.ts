import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ingestDocument } from "./cactus-backend";
import { loadBackendState, updateBackendState } from "./cactus-backend-store";
import { sampleDealDocument } from "./cactus-extraction";

test("backend store persists updated state to disk", async () => {
  const dir = await mkdtemp(join(tmpdir(), "cactus-backend-store-"));
  const path = join(dir, "state.json");
  try {
    const first = await loadBackendState(path);
    assert.equal(first.version, 1);
    assert.equal(first.vaultRows.length, 0);

    await updateBackendState((state) => ingestDocument(state, { name: "Ocean Drive OM.pdf", text: sampleDealDocument, rowId: "frontend-row-1" }), path);
    const second = await loadBackendState(path);

    assert.equal(second.documents.length, 1);
    assert.equal(second.vaultRows[0].id, "frontend-row-1");
    assert.equal(second.vaultRows[0].yr1Noi, "$1.18M");
    assert.equal(second.auditEvents.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
