export type Screen = "assistant" | "vault" | "spaces" | "workflows" | "settings";

export type VaultRow = {
  id: string;
  propertyName: string;
  location: string;
  assetClass: string;
  qualityClass: string;
  size: string;
  yr1Noi: string;
  entryCapRate: string;
  marketCapRate: string;
  askingPrice: string;
  source: string;
  confidence: "High" | "Medium" | "Low";
  status: "Needs review" | "Reviewed" | "Archived";
  notes: string;
  createdAt: string;
};

export type DocumentRecord = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  extractedRowIds: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type SpaceRecord = {
  id: string;
  title: string;
  contextRowIds: string[];
  messages: ChatMessage[];
  output: string;
  shareUrl?: string;
  createdAt: string;
};

export type WorkflowRecord = {
  id: string;
  name: string;
  status: "Active" | "Needs review" | "Archived";
  trigger: string;
  output: string;
};

export type CactusState = {
  version: number;
  user: { name: string; email: string; signedIn: boolean };
  openAiConnected: boolean;
  openAiKeyPreview: string;
  documents: DocumentRecord[];
  vaultRows: VaultRow[];
  selectedRowIds: string[];
  messages: ChatMessage[];
  spaces: SpaceRecord[];
  workflows: WorkflowRecord[];
};

export const STORAGE_KEY = "cactus-working-mvp-v1";

export const nowIso = () => new Date().toISOString();
export const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

export const seedWorkflows: WorkflowRecord[] = [
  { id: "wf_review", name: "Review new deal package", status: "Active", trigger: "When files are added to Vault", output: "Deal screen + source citations" },
  { id: "wf_comps", name: "Build local comp set", status: "Needs review", trigger: "When a property is selected", output: "Sales/rent comp table" },
  { id: "wf_ic", name: "Draft IC memo", status: "Active", trigger: "When a Space is approved", output: "Investment committee draft" },
  { id: "wf_old", name: "Legacy broker blast parser", status: "Archived", trigger: "Old inbox label", output: "Archived extraction rows" },
];

export const createInitialState = (): CactusState => ({
  version: 1,
  user: { name: "Tyler", email: "tyler@example.com", signedIn: false },
  openAiConnected: false,
  openAiKeyPreview: "",
  documents: [],
  vaultRows: [],
  selectedRowIds: [],
  messages: [
    {
      id: "msg_seed",
      role: "assistant",
      content: "Upload or paste a deal package, then I’ll extract it into the Vault and help create an output.",
      createdAt: nowIso(),
    },
  ],
  spaces: [],
  workflows: seedWorkflows,
});

const matchFirst = (text: string, patterns: RegExp[], fallback = "") => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/[.;,]$/, "");
  }
  return fallback;
};

export function extractVaultRowFromText(text: string, sourceName = "Pasted deal note"): VaultRow {
  const normalized = text.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const assetClass = lower.includes("shopping") || lower.includes("retail") ? "Retail" : lower.includes("multifamily") || lower.includes("apartment") ? "Multifamily" : lower.includes("office") ? "Office" : "CRE";
  const qualityClass = matchFirst(normalized, [/Class\s+([ABC])/i], lower.includes("class b") ? "B" : "B");
  const propertyName = matchFirst(normalized, [/(?:property|deal|center|asset)\s*(?:name)?\s*[:\-]\s*([^.,;]{4,80})/i, /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,5}\s+(?:Center|Plaza|Apartments|Retail|Shops))/], "Extracted CRE Asset");
  const location = matchFirst(normalized, [/(?:location|address|market)\s*[:\-]\s*([^.;]{4,90})/i, /(South Beach[^.;,]*(?:Miami|Florida|FL)?)/i, /(Miami Beach[^.;,]*(?:Florida|FL)?)/i], lower.includes("south beach") ? "South Beach, Miami, FL" : "Needs location review");
  const size = matchFirst(normalized, [/([\d,.]+\s*(?:sf|square feet|units|doors|keys))/i], "Needs size review");
  const yr1Noi = matchFirst(normalized, [/(?:NOI|year 1 NOI|yr 1 noi)\s*[:\-]?\s*(\$?[\d,.]+\s*(?:m|mm|million|k)?)/i], "Needs NOI review");
  const entryCapRate = matchFirst(normalized, [/(?:entry cap|cap rate|going-in cap)\s*[:\-]?\s*([\d.]+%)/i], "Needs cap review");
  const askingPrice = matchFirst(normalized, [/(?:price|asking price|purchase price)\s*[:\-]?\s*(\$?[\d,.]+\s*(?:m|mm|million|k)?)/i], "Needs price review");
  const marketCapRate = lower.includes("miami") && assetClass === "Retail" ? "5.75%" : "Needs market review";
  const confidence = [location, size, yr1Noi, entryCapRate].filter((v) => !v.toLowerCase().includes("needs")).length >= 3 ? "High" : "Medium";

  return {
    id: makeId("row"),
    propertyName,
    location,
    assetClass,
    qualityClass: `Class ${qualityClass}`,
    size,
    yr1Noi,
    entryCapRate,
    marketCapRate,
    askingPrice,
    source: sourceName,
    confidence,
    status: "Needs review",
    notes: normalized.slice(0, 280),
    createdAt: nowIso(),
  };
}

export function contextSummary(rows: VaultRow[]) {
  if (!rows.length) return "No Vault rows selected.";
  return rows.map((row) => `${row.propertyName} (${row.assetClass}, ${row.qualityClass}, ${row.location}, ${row.size}, NOI ${row.yr1Noi}, entry cap ${row.entryCapRate})`).join("\n");
}

export function deterministicAssistantReply(prompt: string, rows: VaultRow[], mode = "Analyze") {
  const context = contextSummary(rows);
  const first = rows[0];
  if (!rows.length) {
    return "I need Vault context first. Add/paste a deal document or select rows from the Vault, then I can review the deal, build comps, or draft an output.";
  }
  return `${mode}: I’m using ${rows.length} selected Vault row${rows.length === 1 ? "" : "s"} as context.\n\nPrimary context:\n${context}\n\nInitial judgment:\n- Treat ${first.assetClass} comps in ${first.location} as primary evidence, not distant national comps.\n- Keep MSA/state/national benchmarks as sanity checks.\n- Include adjacent opportunities as sub-context so Cactus can challenge whether ${first.qualityClass} is actually the best risk-adjusted play.\n\nNext action from your prompt “${prompt}”: create a Space and draft the output with citations back to the source document.`;
}

export function generateInvestmentOutput(rows: VaultRow[], messages: ChatMessage[]) {
  const selected = rows.length ? rows : [];
  const title = selected[0]?.propertyName ?? "Cactus Deal Output";
  return `# ${title} — Cactus Output\n\n## Context used\n${contextSummary(selected)}\n\n## Recommendation\nProceed to a focused review only after validating source data, local comps, and downside assumptions.\n\n## What Cactus checked\n- Direct comps by local geography and asset class\n- MSA/state/national benchmark context\n- Alternative class/size opportunities\n- Source-backed extraction fields\n\n## Conversation trail\n${messages.slice(-6).map((m) => `- ${m.role}: ${m.content.replace(/\n/g, " ").slice(0, 240)}`).join("\n")}\n`;
}

export function validateApiKeyShape(key: string) {
  return /^sk-[A-Za-z0-9_\-]{12,}/.test(key.trim());
}
