import type { CactusBackendState, CactusDocument, CactusVaultFact } from "./cactus-backend";
import { redactPotentialSecrets } from "./cactus-settings";

export type ExtractionReviewItem = {
  row: CactusBackendState["vaultRows"][number];
  document?: CactusDocument;
  facts: CactusVaultFact[];
  sourcePreview: string;
  reviewCount: number;
  approvedCount: number;
  rejectedCount: number;
};

const now = () => new Date().toISOString();
const auditId = () => `audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function buildExtractionReviewQueue(state: CactusBackendState): ExtractionReviewItem[] {
  return state.vaultRows
    .map((row) => {
      const facts = state.vaultFacts.filter((fact) => fact.vaultRowId === row.id);
      const document = state.documents.find((candidate) => candidate.id === facts[0]?.sourceDocumentId);
      return {
        row,
        document,
        facts,
        sourcePreview: document?.textPreview ?? "No source preview captured for this row.",
        reviewCount: facts.filter((fact) => fact.status === "needs_review").length,
        approvedCount: facts.filter((fact) => fact.status === "approved").length,
        rejectedCount: facts.filter((fact) => fact.status === "rejected").length,
      };
    })
    .filter((item) => item.facts.length > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount || (b.document?.createdAt ?? "").localeCompare(a.document?.createdAt ?? ""));
}

export function editVaultFact(state: CactusBackendState, factId: string, value: string, evidence: string) {
  const fact = findFact(state, factId);
  fact.value = redactPotentialSecrets(value).trim();
  fact.evidence = redactPotentialSecrets(evidence || `Edited ${fact.field} during review`);
  fact.status = "needs_review";
  fact.approvedAt = undefined;
  pushReviewAudit(state, "vault_fact.edited", fact, `Edited ${fact.field} = ${fact.value}`);
  return fact;
}

export function rejectVaultFact(state: CactusBackendState, factId: string, reason: string) {
  const fact = findFact(state, factId);
  fact.status = "rejected";
  fact.approvedAt = undefined;
  fact.evidence = redactPotentialSecrets(reason || `Rejected ${fact.field} during review`);
  pushReviewAudit(state, "vault_fact.rejected", fact, `Rejected ${fact.field}: ${fact.evidence}`);
  return fact;
}

function findFact(state: CactusBackendState, factId: string) {
  const fact = state.vaultFacts.find((candidate) => candidate.id === factId);
  if (!fact) throw new Error(`Vault fact not found: ${factId}`);
  return fact;
}

function pushReviewAudit(state: CactusBackendState, action: string, fact: CactusVaultFact, summary: string) {
  state.auditEvents.unshift({
    id: auditId(),
    organizationId: fact.organizationId,
    actor: "Tyler",
    action,
    targetType: "vault_fact",
    targetId: fact.id,
    summary: redactPotentialSecrets(summary),
    createdAt: now(),
  });
}
