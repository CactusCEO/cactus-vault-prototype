import type { CactusSpaceDraft } from "./cactus-space";

export type WorkflowActionMode = "Run once" | "Enable" | "Open Space";

export type WorkflowOutcome = {
  workflow: string;
  mode: WorkflowActionMode;
  status: "Preview ready" | "Approval required" | "Space opened";
  note: string;
  createdAt: string;
};

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const redact = (value: string) => clean(value).replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]").replace(/secret[A-Za-z0-9_-]*/gi, "[REDACTED]");

export function createWorkflowOutcome(workflow: string, mode: WorkflowActionMode, createdAt = new Date().toISOString()): WorkflowOutcome {
  const safeWorkflow = redact(workflow || "Untitled workflow");
  if (mode === "Run once") {
    return {
      workflow: safeWorkflow,
      mode,
      status: "Preview ready",
      note: "Preview run created review tasks, draft artifacts, and source-linked changes without enabling a schedule.",
      createdAt,
    };
  }
  if (mode === "Enable") {
    return {
      workflow: safeWorkflow,
      mode,
      status: "Approval required",
      note: "Enable request is waiting on human approval for cadence, connector scope, cost, destinations, and side effects.",
      createdAt,
    };
  }
  return {
    workflow: safeWorkflow,
    mode,
    status: "Space opened",
    note: "Workflow workroom opened with Vault context, review checklist, tasks, and an output canvas.",
    createdAt,
  };
}

export function appendWorkflowOutcome(current: WorkflowOutcome[], next: WorkflowOutcome, limit = 8): WorkflowOutcome[] {
  const withoutDuplicate = current.filter((item) => !(item.workflow === next.workflow && item.mode === next.mode));
  return [next, ...withoutDuplicate].slice(0, limit);
}

export function createWorkflowSpaceDraft(workflow: string): CactusSpaceDraft {
  const safeWorkflow = redact(workflow || "Workflow");
  const artifactBody = [
    "Workflow execution brief",
    `Workflow: ${safeWorkflow}`,
    "Context: @ Workflow + approved Vault facts",
    "",
    "Review checklist:",
    "- Confirm connector/source scope before background work runs.",
    "- Review extracted facts, assumptions, and citations before trusted writes.",
    "- Create owner tasks for low-confidence fields and stale sources.",
    "- Keep all external sends/downloads behind explicit approval.",
  ].join("\n");
  return {
    title: `${safeWorkflow} Space`,
    contextLabel: "@ Workflow",
    artifactTitle: "Workflow execution brief",
    artifactBody,
    downloadText: `Cactus Workflow Space\n${safeWorkflow}\n\n${artifactBody}`,
    shareText: `${safeWorkflow}: workflow Space opened for review, approvals, and output drafting.`,
  };
}
