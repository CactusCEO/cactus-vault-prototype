import type { VaultGridRow } from "./cactus-extraction";

export type CactusSpaceDraft = {
  title: string;
  contextLabel: string;
  artifactTitle: string;
  artifactBody: string;
  downloadText: string;
  shareText: string;
};

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const firstLine = (value: string) => clean(value.split("\n")[0] ?? value);
const redactSecrets = (value: string) => value
  .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
  .replace(/secret[A-Za-z0-9_-]*/gi, "[REDACTED]");

const rowSummary = (row: VaultGridRow) => {
  const parts = [
    firstLine(row.location),
    row.owner ? `owner ${row.owner}` : "owner needs review",
    row.yr1Noi ? `YR 1 NOI ${row.yr1Noi}` : "NOI needs review",
    row.entryCap ? `entry cap ${row.entryCap}` : "entry cap needs review",
    row.marketCap ? `market cap ${row.marketCap}` : "market cap needs review",
    row.noiGrowth ? `NOI growth ${row.noiGrowth}` : "NOI growth needs review",
  ];
  return redactSecrets(parts.join(" · "));
};

export function createSpaceDraftFromVaultRows(rows: VaultGridRow[], request = "Review this deal"): CactusSpaceDraft {
  const safeRows = rows.length > 0 ? rows : [{ id: "empty", kind: "Draft", location: "Unscoped Space", yr1Noi: "Needs review", entryCap: "Needs review", marketCap: "Needs review", oneBedEffectiveRent: "Needs review", oneBedMarketRent: "Needs review", noiGrowth: "Needs review", owner: "Needs review" }];
  const first = safeRows[0];
  const contextLabel = safeRows.length === 1 ? "@ Selected Property" : "@ Selected Properties";
  const title = safeRows.length === 1 ? `${firstLine(first.location)} Deal Review` : `${safeRows.length} Property Review Space`;
  const artifactTitle = /lender/i.test(request) ? "Lender screen draft" : /compare/i.test(request) ? "Comparison brief draft" : "IC memo starter";
  const bullets = safeRows.map((row) => `- ${rowSummary(row)}`).join("\n");
  const artifactBody = redactSecrets([
    `${artifactTitle}`,
    `Request: ${clean(request)}`,
    `Context: ${contextLabel}`,
    "",
    "Selected Vault rows:",
    bullets,
    "",
    "Cactus next actions:",
    "- Verify source citations in Vault audit before external sharing.",
    "- Draft thesis, risk, diligence gaps, and what-must-change sections.",
    "- Keep assumptions editable in the Space output canvas.",
  ].join("\n"));
  const downloadText = redactSecrets(`Cactus Space Output\n${title}\n\n${artifactBody}`);
  const shareText = redactSecrets(`${title}: ${safeRows.map((row) => firstLine(row.location)).join(", ")} · ${artifactTitle} ready for review.`);

  return { title, contextLabel, artifactTitle, artifactBody, downloadText, shareText };
}
