export type VaultGridRow = {
  id: string;
  kind: string;
  location: string;
  yr1Noi: string;
  entryCap: string;
  marketCap: string;
  oneBedEffectiveRent: string;
  oneBedMarketRent: string;
  noiGrowth: string;
  owner: string;
};

export const sampleDealDocument = `
Ocean Drive Retail Center offering memorandum
Address: 1450 Ocean Drive, Miami Beach, FL
Asset type: Retail center
Owner: Atlantic Harbor Partners
Year 1 NOI: $1.18M
Asking price: $18.4M
Entry cap rate: 6.4%
Market cap rate: 6.1%
1 Bed Effective Rent: $2,350
1 Bed Market Rent: $2,520
NOI Growth: 4.2%
Source: OM page 3, T-12 page 8, rent survey tab
`;

const moneyMatch = (text: string, label: string) => {
  const match = text.match(new RegExp(`(?:${label})\\s*:?\\s*(\\$?[0-9.,]+\\s*[MKmk]?)`, "i"));
  return match?.[1]?.replace(/\s+/g, "") ?? "";
};

const percentMatch = (text: string, label: string) => {
  const match = text.match(new RegExp(`(?:${label})\\s*:?\\s*([0-9.]+\\s*%)`, "i"));
  return match?.[1]?.replace(/\s+/g, "") ?? "";
};

const textMatch = (text: string, label: string) => {
  const match = text.match(new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i"));
  return match?.[1]?.trim() ?? "";
};

export function extractDealDocumentToVaultRow(documentText: string, id = `extracted-${Date.now()}`): VaultGridRow {
  const address = textMatch(documentText, "Address") || "Unmatched property\nNeeds review";
  const owner = textMatch(documentText, "Owner") || "Needs review";
  return {
    id,
    kind: "Extracted deal",
    location: address.replace(/,\s*/g, "\n"),
    yr1Noi: moneyMatch(documentText, "Year 1 NOI|YR 1 NOI|NOI") || "Needs review",
    entryCap: percentMatch(documentText, "Entry cap rate|Entry Cap") || "Needs review",
    marketCap: percentMatch(documentText, "Market cap rate|Market Cap") || "Needs review",
    oneBedEffectiveRent: moneyMatch(documentText, "1 Bed Effective Rent") || "Needs review",
    oneBedMarketRent: moneyMatch(documentText, "1 Bed Market Rent") || "Needs review",
    noiGrowth: percentMatch(documentText, "NOI Growth") || "Needs review",
    owner,
  };
}

export function mergeVaultRows(existing: VaultGridRow[], next: VaultGridRow) {
  return [next, ...existing.filter((row) => row.id !== next.id && row.location !== next.location)];
}
