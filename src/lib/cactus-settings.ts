export type CactusAiConnection = {
  status: "not_connected" | "connected" | "invalid";
  provider: "OpenAI";
  label: string;
  fingerprint: string;
};

export type VaultAuditApproval = {
  row: string;
  field: string;
  value: string;
  approvedAt: string;
};

const normalize = (value: string) => value.trim();

export function validateOpenAiKeyShape(key: string): boolean {
  const value = normalize(key);
  return /^sk-(proj-)?[A-Za-z0-9_-]{30,}$/.test(value);
}

export function createAiConnectionFromKey(key: string): CactusAiConnection {
  const value = normalize(key);
  if (!validateOpenAiKeyShape(value)) {
    return { status: "invalid", provider: "OpenAI", label: "Invalid OpenAI key", fingerprint: "" };
  }
  const prefix = value.startsWith("sk-proj-") ? "sk-proj-" : "sk-";
  return {
    status: "connected",
    provider: "OpenAI",
    label: "OpenAI connected",
    fingerprint: `${prefix}…${value.slice(-4)}`,
  };
}

export function redactPotentialSecrets(value: string): string {
  return value
    .replace(/sk-(?:proj-)?[A-Za-z0-9_-]{12,}/g, "[REDACTED]")
    .replace(/\b(?:secret|token|api[_-]?key|password)[\w-]*\s*[:=]\s*[^\s,;]+/gi, "[REDACTED]");
}

export function addAuditApproval(existing: VaultAuditApproval[], approval: Omit<VaultAuditApproval, "approvedAt">, now = new Date().toISOString()): VaultAuditApproval[] {
  const next: VaultAuditApproval = { ...approval, approvedAt: now };
  return [next, ...existing.filter((item) => !(item.row === approval.row && item.field === approval.field))];
}
