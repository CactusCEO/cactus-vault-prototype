"use client";

import { Fragment, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { extractDealDocumentToVaultRow, mergeVaultRows, sampleDealDocument, type VaultGridRow } from "@/lib/cactus-extraction";
import { createSpaceDraftFromVaultRows, type CactusSpaceDraft } from "@/lib/cactus-space";
import { addAuditApproval, createAiConnectionFromKey, type CactusAiConnection, type VaultAuditApproval } from "@/lib/cactus-settings";
import { postCactusResource } from "@/lib/cactus-api";
import type { CactusAuthSession, CactusBackendState, CactusVaultFact } from "@/lib/cactus-backend";
import { appendWorkflowOutcome, createWorkflowOutcome, createWorkflowSpaceDraft, type WorkflowActionMode, type WorkflowOutcome } from "@/lib/cactus-workflows";

const sourceCards = [
  {
    title: "Add property documents",
    badge: "Start here",
    note: "OMs, T12s, rent rolls, models.",
    next: "Cactus extracts source-linked facts into your proprietary database.",
  },
  {
    title: "Connect email or drive later",
    badge: "Broker flow + folders",
    note: "Approved senders and folders only.",
    next: "Cactus watches only those senders/folders and queues new packages for review.",
  },
  {
    title: "Import lists or comps",
    badge: "Saved work",
    note: "Property lists, comps, CRM exports.",
    next: "Cactus turns rows into searchable properties, comps, assumptions, and map pins.",
  },
  {
    title: "Use demo database",
    badge: "Explore first",
    note: "Sample data only.",
    next: "Cactus loads a realistic demo so you can see the workflow immediately.",
  },
];

const sourceRunLabels = [
  "7 uploaded documents extracting",
  "Approved Drive/email scope extracting",
  "Imported list/comps extracting",
  "Demo database loaded",
];

const sourceSetupKeyByIndex = ["deal", "connected", "portfolio", "deal"] as const;
const CACTUS_WORKING_STATE_KEY = "cactus-working-app-state-v1";
const emptyAiConnection: CactusAiConnection = { status: "not_connected", provider: "OpenAI", label: "Connect OpenAI", fingerprint: "" };

type CactusWorkingState = { hasIntake: boolean; sourceIndex: number; extractedRows: VaultGridRow[]; aiConnection: CactusAiConnection; auditApprovals: VaultAuditApproval[]; workflowOutcomes: WorkflowOutcome[]; authSession: CactusAuthSession | null };
type ReviewQueueItem = {
  row: VaultGridRow;
  document?: CactusBackendState["documents"][number];
  facts: CactusVaultFact[];
  sourcePreview: string;
  reviewCount: number;
  approvedCount: number;
  rejectedCount: number;
};
const emptyWorkingState = (): CactusWorkingState => ({ hasIntake: false, sourceIndex: 0, extractedRows: [], aiConnection: emptyAiConnection, auditApprovals: [], workflowOutcomes: [], authSession: null });

function loadWorkingState(): CactusWorkingState {
  if (typeof window === "undefined") return emptyWorkingState();
  try {
    const saved = window.localStorage.getItem(CACTUS_WORKING_STATE_KEY);
    if (!saved) return emptyWorkingState();
    const parsed = JSON.parse(saved) as Partial<CactusWorkingState>;
    return {
      hasIntake: Boolean(parsed.hasIntake),
      sourceIndex: typeof parsed.sourceIndex === "number" ? parsed.sourceIndex : 0,
      extractedRows: Array.isArray(parsed.extractedRows) ? parsed.extractedRows : [],
      aiConnection: parsed.aiConnection?.status ? parsed.aiConnection : emptyAiConnection,
      auditApprovals: Array.isArray(parsed.auditApprovals) ? parsed.auditApprovals : [],
      workflowOutcomes: Array.isArray(parsed.workflowOutcomes) ? parsed.workflowOutcomes : [],
      authSession: parsed.authSession?.email ? parsed.authSession as CactusAuthSession : null,
    };
  } catch {
    return emptyWorkingState();
  }
}

const systemCards = [
  {
    title: "Opportunity Finder",
    prompt: "Find acquisition targets that fit my buy box.",
    note: "New deals and owner signals.",
    artifact: "weekly target list",
  },
  {
    title: "Site Selection",
    prompt: "Rank markets and parcels for development.",
    note: "Demand, traffic, zoning, risk.",
    artifact: "site-selection map",
  },
  {
    title: "Deal Intake",
    prompt: "Process incoming packages into review-ready Spaces.",
    note: "Extract facts and diligence gaps.",
    artifact: "deal review Space",
  },
  {
    title: "Portfolio Monitor",
    prompt: "Watch owned assets and tell me what changed.",
    note: "Rents, comps, taxes, risk.",
    artifact: "portfolio change brief",
  },
];

const mapPins = [
  ["top-[28%] left-[35%]", "Riverside Flats", "$133k/unit"],
  ["top-[50%] left-[56%]", "The Mercer", "248 units"],
  ["top-[62%] left-[28%]", "Pine Hollow", "6.2% cap"],
  ["top-[37%] left-[68%]", "Lakeside Commons", "A score"],
  ["top-[71%] left-[72%]", "Cedar Point", "B score"],
];

const dealFacts = [
  ["Address", "1180 Riverside Dr, Nashville, TN", "OM p.3", "Verified"],
  ["Units", "184", "Rent roll", "Verified"],
  ["T12 NOI", "$1.42M", "T12 p.8", "Review"],
  ["Avg rent", "$1,462", "Rent roll", "Verified"],
  ["Flood zone", "Zone X", "Cactus flood layer", "Verified"],
];

const comps = [
  ["Rivergate Park", "2.4 mi", "1990", "172", "$151k/unit", "Use"],
  ["Hillside Trace", "14 min", "1986", "210", "$139k/unit", "Use"],
  ["Metro Pointe", "22 min", "2003", "260", "$176k/unit", "Maybe"],
  ["East Bend", "4.8 mi", "1978", "120", "$118k/unit", "Exclude"],
];

const workspaceLibrary = [
  { title: "Find Rental & Sales Comps", type: "Comps", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Ready", updated: "12 min ago", team: ["TS", "AK", "MR", "JL"], pin: "left-[18%] top-[54%]" },
  { title: "Build BOV Presentation for Client B", type: "BOV", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Draft", updated: "Today", team: ["TS", "AK"], pin: "left-[26%] top-[48%]" },
  { title: "Credit memo + underwriting build for Client Y", type: "Credit memo", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Review", updated: "Yesterday", team: ["MR", "AK", "TS"], pin: "left-[36%] top-[58%]" },
  { title: "Identify buyers + create OM", type: "OM", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Active", updated: "2 days ago", team: ["TS", "JL"], pin: "left-[55%] top-[40%]" },
  { title: "Sponsor/borrower diligence for Client Z", type: "Diligence", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Shared", updated: "3 days ago", team: ["TS", "MR", "AK"], pin: "left-[62%] top-[57%]" },
  { title: "Property Z Operational Efficiency audit", type: "Operations", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Needs review", updated: "May 8", team: ["JL", "AK"], pin: "left-[72%] top-[45%]" },
  { title: "Ongoing surveillance (“what changed?”) Deal X", type: "Surveillance", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Watching", updated: "Daily", team: ["TS"], pin: "left-[47%] top-[68%]" },
  { title: "Fund A Portfolio Analysis", type: "Portfolio", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Ready", updated: "May 6", team: ["TS", "MR", "AK"], pin: "left-[68%] top-[68%]" },
  { title: "Create IC Memo for Property X", type: "IC memo", address: "1351 E 41st St", market: "Los Angeles, CA 90011", status: "Draft", updated: "May 4", team: ["TS", "JL"], pin: "left-[80%] top-[62%]" },
];

const providerPacks = [
  ["Green Street market outlook", "Premium", "Cached May 10", "Exit cap, demand grade, growth forecast", "Refresh if price changes"],
  ["HelloData rent comps", "Paid", "12 days old", "Rent upside and comp support", "Use cached"],
  ["FEMA flood layer", "Free", "Monthly", "Flood zone and risk screen", "Included"],
  ["ATTOM tax + ownership", "Paid", "On demand", "Owner, parcel, tax assessment", "Refresh $0.60–$1"],
];

const outputArtifacts = [
  ["IC memo", "Riverside Flats", "Needs review", "Active Space"],
  ["Debt memo", "East Loop Lender Package", "Draft", "Frozen May 10"],
  ["BOV", "Pine Hollow", "Needs data", "Broker Space"],
  ["Weekly hitlist", "Southeast value-add", "Ready", "Auto-updating"],
];

const memoSections = [
  ["Investment thesis", "Value-add multifamily fits unit-count and market-growth criteria, but seller pricing only works with a lower basis or stronger NOI proof.", "OM · Green Street · HelloData", "Review"],
  ["Assumption checks", "Exit cap and rent growth are above market-supported ranges; renovation cost is supported by comps and prior portfolio actuals.", "Excel model · Green Street · prior decisions", "Needs review"],
  ["Cactus devil's advocate", "The deal is not broken, but the current seller case depends on two aggressive assumptions at once: 6.0% rent growth and 5.25% exit cap.", "Benchmarks · data story", "Included"],
  ["What needs to change", "To hit 16% IRR, price needs to fall $1.3M or NOI must run 9% above Cactus base. A refreshed ATTOM tax pull may change the tax reserve.", "Playground · ATTOM", "Action"],
  ["Diligence asks", "Confirm T12 NOI variance, tax reassessment exposure, renovation reserve, and whether new supply changes lease-up timing.", "T12 · rent roll · FEMA", "Open"],
];

const memoEvidence = [
  ["Space", "Riverside Flats Deal Review", "Latest Vault context"],
  ["Snapshot", "May 10 provider cache", "Freeze before external share"],
  ["Model", "Tyler value-add Excel", "Acquisition tab mapped"],
  ["Sources", "OM, T12, rent roll, Green Street, HelloData, ATTOM, FEMA", "Appendix ready"],
];

const artifactActions = ["Export PDF", "Push to PowerPoint", "Share Space", "Save to Vault"];

const agentCards = [
  ["Opportunity Finder", "Watching brokers, listings, owner signals, permits", "18 min ago", "19 leads found", "3 need review"],
  ["Site Selection", "Scoring demographics, traffic, zoning, flood, supply", "Today", "6 zones ranked", "1 memo ready"],
  ["Deal Intake", "Reading approved inbox labels and deal rooms", "42 min ago", "4 packages structured", "7 facts need review"],
  ["Portfolio Monitor", "Watching owned assets, rents, taxes, insurance, comps", "Daily", "3 alerts created", "0 blocked"],
];

const learnedItems = [
  "Prefers 80–250 unit value-add multifamily in growth markets.",
  "Flags flood risk and unclear T12s before underwriting.",
  "Ranks sites higher when traffic, job growth, and supply gap align.",
  "Uses conservative rent-growth assumptions unless Tyler approves otherwise.",
];

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "dark" | "green" | "amber" }) {
  const tones = {
    default: "border-neutral-200 bg-white text-neutral-600",
    dark: "border-neutral-900 bg-neutral-950 text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${tones[tone]}`}>{children}</span>;
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">{subtitle}</p>
      </div>
      <Pill>Part of active workflow</Pill>
    </div>
  );
}

function TopBar({ title, search, onSearch, searchPlaceholder = "Search…", cta, onCta, children }: { title: ReactNode; search?: string; onSearch?: (value: string) => void; searchPlaceholder?: string; cta?: string; onCta?: () => void; children?: ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-4 lg:px-8">
      <h1 className="font-serif text-2xl font-medium tracking-[-0.03em] text-neutral-900">{title}</h1>
      <div className="flex min-w-0 items-center gap-2">
        {children}
        {onSearch && <input value={search ?? ""} onChange={(event) => onSearch(event.target.value)} className="h-9 w-64 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none placeholder:text-neutral-500 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 lg:w-96" placeholder={searchPlaceholder} />}
        {cta && <button onClick={onCta} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">{cta}</button>}
      </div>
    </header>
  );
}

function SharedComposer({ placeholder, context = [], contextActions = {}, onSend, disabled = false, compact = false }: { placeholder: string; context?: string[]; contextActions?: Record<string, () => void>; onSend?: () => void; disabled?: boolean; compact?: boolean }) {
  const [listening, setListening] = useState(false);
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.16)] transition ${listening ? "shadow-[0_22px_70px_rgba(180,101,39,0.24)]" : ""} ${disabled ? "opacity-60" : ""}`}>
      <textarea disabled={disabled} className={`${compact ? "h-16" : "h-28"} w-full resize-none px-2 py-2 text-sm outline-none placeholder:text-neutral-400 disabled:bg-white`} placeholder={placeholder} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-1 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {context.map((chip) => contextActions[chip]
            ? <button key={chip} onClick={contextActions[chip]} className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-50">{chip}</button>
            : <span key={chip} className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-neutral-600">{chip}</span>)}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setListening((value) => !value)} aria-label="Talk to Cactus" className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border transition ${listening ? "border-amber-200 bg-amber-50 text-amber-900 shadow-[0_0_0_4px_rgba(251,191,36,0.14)]" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0V6A2.5 2.5 0 0 0 10 3.5Z" /><path d="M5.75 9.5a4.25 4.25 0 0 0 8.5 0" /><path d="M10 14v2.5" /></svg>
          </button>
          <button disabled={disabled} onClick={onSend} aria-label="Send to Cactus" className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-neutral-950 text-sm font-medium text-white disabled:bg-neutral-200 disabled:text-neutral-400">↗</button>
        </div>
      </div>
      {listening && <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 bottom-0 h-10 rounded-t-full bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.55),rgba(251,146,60,0.22)_45%,transparent_75%)] blur-xl" />}
    </div>
  );
}

const appNav = [
  ["Assistant", "✦", 5],
  ["Spaces", "□", 7],
  ["Vault", "▣", 6],
  ["Workflows", "▤", 8],
  ["Tasks", "✓", 9],
] as const;


const workflowLibrary = [
  { name: "Crexi multifamily scraper → Vault", group: "Sourcing", mode: "Ongoing", trigger: "Weekly scraper on approved Crexi URL", output: "New deal rows in Vault + financial/market analysis tasks", context: "Source URL + Vault schema + analysis skills" },
  { name: "Off-market deal sniffer", group: "Sourcing", mode: "Ongoing", trigger: "CoStar, Crexi, LoopNet, broker blasts, county records", output: "Scored buy-box leads", context: "Buy box + market rows" },
  { name: "OM parser", group: "Screening", mode: "Template", trigger: "OM PDF added", output: "Rent roll, T12, unit mix, asking price, cap rate", context: "Documents → Vault" },
  { name: "Rent roll normalizer", group: "Screening", mode: "Template", trigger: "Yardi, RealPage, Excel rent roll", output: "Standardized rent roll schema", context: "File + model template" },
  { name: "T-12 cleaner", group: "Screening", mode: "Template", trigger: "T12 added", output: "Normalized income/expense lines + flags", context: "T12 + expense benchmarks" },
  { name: "LoopNet / Crexi watcher", group: "Sourcing", mode: "Ongoing", trigger: "Saved listing searches", output: "Deduped listing alerts", context: "Geo + size + cap criteria" },
  { name: "Distressed asset radar", group: "Sourcing", mode: "Ongoing", trigger: "Foreclosure, CMBS watchlists, servicer transfers", output: "Distress opportunities", context: "County + CMBS sources" },
  { name: "Comp finder", group: "Underwriting", mode: "Template", trigger: "Selected property rows", output: "Weighted sales/rent comp set", context: "CoStar/Reonomy/county/provider rows" },
  { name: "Market rent surveyor", group: "Underwriting", mode: "Ongoing", trigger: "Comp property list", output: "Rents, concessions, occupancy", context: "Phone/scrape notes + rent comps" },
  { name: "Expense benchmarker", group: "Underwriting", mode: "Template", trigger: "T12 or model", output: "Opex variance flags", context: "IREM/NAA + submarket" },
  { name: "Sensitivity table generator", group: "Underwriting", mode: "Template", trigger: "Model assumptions", output: "IRR/YOC matrix", context: "Exit cap, rent growth, vacancy" },
  { name: "Debt quote aggregator", group: "Capital", mode: "Ongoing", trigger: "Approved lender list", output: "Term sheet comparison", context: "Deal summary + lender replies" },
  { name: "Zoning & entitlement checker", group: "Diligence", mode: "Template", trigger: "Address/site row", output: "Use, FAR, parking, entitlement risk", context: "Zoning code + parcel" },
  { name: "Flood/environmental risk agent", group: "Diligence", mode: "Template", trigger: "Property row", output: "FEMA/EPA/Phase I risk flags", context: "FEMA + EPA + source docs" },
  { name: "BOV/proposal drafter", group: "Broker/GTM", mode: "Template", trigger: "Property + comps approved", output: "BOV/proposal draft", context: "Property data + comps" },
  { name: "Tour scheduler", group: "Broker/GTM", mode: "Ongoing", trigger: "Tour request", output: "Broker/principal calendar holds", context: "Calendar + contacts" },
  { name: "Investor outreach personalizer", group: "Broker/GTM", mode: "Template", trigger: "Buyer list + listing", output: "Tailored teaser emails", context: "CRM + deal profile" },
  { name: "LOI generator", group: "Broker/GTM", mode: "Template", trigger: "Deal term sheet", output: "LOI draft", context: "Term sheet + standard clauses" },
  { name: "Pipeline hygiene agent", group: "Broker/GTM", mode: "Ongoing", trigger: "Pipeline changes", output: "Stalled deal / missing step alerts", context: "CRM + MEDDPICC" },
  { name: "Lease abstract agent", group: "Portfolio", mode: "Template", trigger: "Lease added", output: "Dates, options, CAM, exclusives", context: "Lease docs" },
  { name: "Rollover risk scanner", group: "Portfolio", mode: "Ongoing", trigger: "Portfolio lease schedule", output: "12–24 month rollover risk", context: "Tenant concentration + rents" },
  { name: "Property tax appeal scout", group: "Portfolio", mode: "Ongoing", trigger: "Assessment refresh", output: "Appeal candidates", context: "Assessed value + comps" },
  { name: "CapEx reserve modeler", group: "Portfolio", mode: "Template", trigger: "PCR added", output: "10-year CapEx schedule", context: "Property condition report" },
  { name: "Distribution calculator", group: "Portfolio", mode: "Template", trigger: "Waterfall inputs", output: "LP distributions", context: "Pref/catchup/promote tiers" },
  { name: "Quarterly investor letter drafter", group: "Reporting", mode: "Template", trigger: "Quarter close", output: "GP-voice letter + financial summary", context: "Property performance" },
  { name: "K-1 status tracker", group: "Reporting", mode: "Ongoing", trigger: "Tax season", output: "LP K-1 status alerts", context: "LP positions" },
  { name: "Capital call coordinator", group: "Reporting", mode: "Ongoing", trigger: "Approved capital call", output: "Notices + response tracking", context: "Investors + notices" },
  { name: "Submarket pulse agent", group: "Market Intel", mode: "Ongoing", trigger: "Weekly schedule", output: "Starts, deliveries, absorption, transactions", context: "Target submarkets" },
  { name: "News & trigger monitor", group: "Market Intel", mode: "Ongoing", trigger: "News/events", output: "Tenant, zoning, employer alerts", context: "Markets + tenants" },
  { name: "Competitor watch", group: "Market Intel", mode: "Ongoing", trigger: "Transaction refresh", output: "Active buyer map", context: "Buyer activity + comps" },
  { name: "CRE macro snapshot", group: "Market Intel", mode: "Ongoing", trigger: "Daily schedule", output: "Treasury, SOFR, CMBS, cap trends", context: "Macro feeds" },
];

const workflowStatusFor = (name: string) => {
  if (["Crexi multifamily scraper → Vault", "LoopNet / Crexi watcher", "Market rent surveyor", "Review BOV comp package"].includes(name)) return "Needs review";
  if (["Tour scheduler", "K-1 status tracker", "Capital call coordinator"].includes(name)) return "Archived";
  return "Active";
};

const workflowExamples = [
  { title: "Investor acquisition screen", role: "Investor", trigger: "New deal row added to Vault", cadence: "On new row", source: "Vault · new sourced deals", fields: ["Asking price", "Units", "T12 NOI", "Rent growth", "Debt terms", "Market score"], output: "Score + IC memo starter", skill: "Financial analysis skill", result: "Creates Space, assigns review tasks, drafts why-this-deal / risks / what-must-change." },
  { title: "Lender package / credit screen", role: "Lender", trigger: "Borrower package or selected deal rows", cadence: "On demand", source: "Vault · borrower + deal package", fields: ["DSCR", "LTV", "Debt yield", "Sponsor", "Missing diligence", "Rent roll exceptions"], output: "Credit checklist + borrower follow-up", skill: "Lender screen skill", result: "Creates diligence tasks, drafts lender memo section, highlights missing items." },
  { title: "Broker BOV / listing pitch", role: "Broker", trigger: "Property + approved comp rows", cadence: "On demand", source: "Vault · owner + comps + market rows", fields: ["Owner", "Sales comps", "Rent comps", "Demand growth", "Active buyers", "Pitch angle"], output: "BOV range + owner outreach", skill: "Broker BOV/listing skill", result: "Creates proposal Space, comp-review task, and tailored talking points." },
  { title: "Portfolio variance monitor", role: "Investor", trigger: "Monthly accounting / PM report", cadence: "Monthly", source: "Drive or accounting export", fields: ["NOI variance", "Occupancy", "Delinquency", "Payroll", "Insurance", "Budget notes"], output: "Variance tasks + investor update notes", skill: "Financial analysis skill", result: "Flags assets needing attention and drafts monthly/quarterly update bullets." },
  { title: "Market pulse / trigger monitor", role: "Market", trigger: "Market/provider/news refresh", cadence: "Weekly", source: "Market feeds + news + permits", fields: ["Permits", "Deliveries", "Absorption", "Transactions", "SOFR", "Employer news"], output: "Market rows + opportunity flags", skill: "Market analysis skill", result: "Adds market context to Vault and opens Spaces for notable changes." },
] as const;

const taskRows = [
  { title: "Approve Riverside IC memo sections", owner: "TS", role: "Investor", source: "IC memo workflow", space: "Riverside Flats Deal Review", status: "Review", priority: "High", due: "Today", action: "Review output", type: "My tasks", context: "Verified T12, rent comps, debt quote", evidence: "3 draft sections need approval before investor memo export." },
  { title: "Resolve missing addresses in portfolio import", owner: "AK", role: "Investor", source: "Unmatched portfolio queue", space: "Portfolio cleanup", status: "Open", priority: "High", due: "Today", action: "Match rows", type: "Vault review", context: "12 rows · owner/entity hints", evidence: "Rows have property names, PM IDs, city/state, and bank/account references but no trusted address." },
  { title: "Gmail re-auth for broker package watcher", owner: "TS", role: "Internal", source: "Inbox + drive connector", space: "Deal intake automation", status: "Blocked", priority: "High", due: "Now", action: "Reconnect", type: "Maintenance", context: "Broker senders + attachments", evidence: "OAuth token expired. No new broker emails have been checked since 9:14 AM." },
  { title: "Retry Crexi scraper after selector change", owner: "MR", role: "Broker", source: "LoopNet / Crexi watcher", space: "Off-market deal sniffer", status: "Maintenance", priority: "Medium", due: "Today", action: "Retry scraper", type: "Maintenance", context: "Saved searches · Nashville 80+ units", evidence: "Listing card selector changed. Last run captured 0 results where 18 were expected." },
  { title: "Draft lender follow-up from debt quote table", owner: "JL", role: "Lender", source: "Debt quote aggregator", space: "Riverside lender package", status: "Ready", priority: "Medium", due: "Tomorrow", action: "Draft reply", type: "Team", context: "DSCR/LTV checks + lender terms", evidence: "Two lenders need clarification on IO period, reserves, and rate-lock timing." },
  { title: "Review BOV comp package before owner outreach", owner: "AK", role: "Broker", source: "BOV/proposal drafter", space: "Owner pitch: East Nashville", status: "Review", priority: "Medium", due: "Tomorrow", action: "Open comps", type: "Team", context: "Sales comps + owner profile", evidence: "Cactus drafted valuation range and three talking points; comps need broker approval." },
  { title: "Approve Q3 investor update variance notes", owner: "TS", role: "Investor", source: "Quarterly investor letter drafter", space: "Portfolio reporting", status: "Review", priority: "Low", due: "Fri", action: "Approve notes", type: "My tasks", context: "Portfolio monitor + accounting export", evidence: "Insurance and payroll variances are cited; GP voice needs final approval." },
  { title: "Check low-confidence owner phone extraction", owner: "MR", role: "Broker", source: "Email contact extraction", space: "Owner outreach list", status: "Review", priority: "Low", due: "Fri", action: "Verify contact", type: "Vault review", context: "Email thread + signature block", evidence: "Phone number confidence is 63%; source email signature has two possible numbers." },
];

const activityRows = [
  ["10:42 AM", "Workflow", "Crexi scraper failed and created a maintenance task", "LoopNet / Crexi watcher"],
  ["10:31 AM", "Vault", "12 imported portfolio rows moved to Unmatched portfolio queue", "Portfolio cleanup"],
  ["10:18 AM", "Space", "@AK was assigned rent roll anomaly review", "Riverside Flats Deal Review"],
  ["9:55 AM", "Output", "BOV/proposal draft created for owner outreach", "Owner pitch: East Nashville"],
  ["9:41 AM", "Connector", "Gmail token expired; watcher paused safely", "Inbox + drive connector"],
  ["9:16 AM", "Audit", "T12 NOI fact approved with citation", "Vault · Subject Property"],
  ["Yesterday", "Lender", "Debt quote comparison generated follow-up task", "Riverside lender package"],
];

const teamDirectorySeed = [
  { initials: "TS", name: "Tyler Sellars", email: "tyler@cactus.local", role: "Admin / investor", access: "Owner" },
  { initials: "AK", name: "Acquisitions", email: "acquisitions@cactus.local", role: "Acquisitions", access: "Edit" },
  { initials: "MR", name: "Market research", email: "research@cactus.local", role: "Research", access: "Edit" },
  { initials: "JL", name: "External lender", email: "lender@cactus.local", role: "Lender", access: "View" },
];

function TeamMemberDrawer({ member, members, onClose, onAdd, onRemove, notice }: { member: string | null; members: typeof teamDirectorySeed; onClose: () => void; onAdd: () => void; onRemove: (initials: string) => void; notice?: string }) {
  const [activeMember, setActiveMember] = useState(member ?? members[0]?.initials ?? "TS");
  const selected = members.find((item) => item.initials === activeMember) ?? members[0] ?? teamDirectorySeed[0];
  return (
    <div className="fixed inset-0 z-[70] bg-neutral-950/10" onClick={onClose}>
    <aside onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 h-full w-[420px] border-l border-neutral-200 bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Team + access</p><p className="mt-1 text-xs text-neutral-500">Click people anywhere to manage team membership, access, and assignments.</p></div><button onClick={onClose}>×</button></div>
      {notice && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{notice}</div>}
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-neutral-900 text-xs text-white">{selected.initials}</span><div><p className="text-sm font-medium">{selected.name}</p><p className="text-xs text-neutral-500">{selected.email}</p></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-white p-3"><p className="text-neutral-400">Role</p><p className="mt-1 font-medium">{selected.role}</p></div><div className="rounded-lg bg-white p-3"><p className="text-neutral-400">Access</p><p className="mt-1 font-medium">{selected.access}</p></div></div>
        <div className="mt-4 flex gap-2"><button className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Edit access</button><button onClick={() => onRemove(selected.initials)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Remove from team</button></div>
      </div>
      <div className="mt-5 flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Workspace team</p><button onClick={onAdd} className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600">+ Add member</button></div>
      <div className="mt-3 space-y-2">{members.map((item) => <button key={item.initials} onClick={() => setActiveMember(item.initials)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:bg-neutral-50 ${activeMember === item.initials ? "border-neutral-950 bg-neutral-50" : "border-neutral-200"}`}><span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-[10px] text-white">{item.initials}</span><span><span className="block font-medium">{item.name}</span><span className="block text-xs text-neutral-500">{item.role}</span></span></span><span className="text-xs text-neutral-400">{item.access}</span></button>)}</div>
    </aside>
    </div>
  );
}

function AvatarStack({ team, size = "sm", onPersonClick }: { team: readonly string[] | string[]; size?: "sm" | "md"; onPersonClick?: (person: string) => void }) {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";
  return (
    <div className="flex -space-x-2">
      {team.slice(0, 4).map((person, index) => (
        <button key={`${person}-${index}`} onClick={(event) => { event.stopPropagation(); onPersonClick?.(person); }} className={`${dim} grid place-items-center rounded-full border-2 border-white bg-neutral-900 font-medium text-white shadow-sm ${onPersonClick ? "hover:scale-105" : ""}`}>{person}</button>
      ))}
    </div>
  );
}

function AppWorkHeader() {
  return null;
}

function Homepage({ onSignup, onSignin }: { onSignup: () => void; onSignin: () => void }) {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_440px] gap-8 p-8">
      <div className="flex flex-col justify-between rounded-[2rem] border border-neutral-200 bg-white p-10 shadow-sm">
        <div>
          <div className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-neutral-950 text-sm font-semibold text-white">C</div>
              <div>
                <p className="font-medium tracking-[-0.02em]">Cactus Vault</p>
                <p className="text-xs text-neutral-400">Portfolio, market, and development intelligence</p>
              </div>
            </div>
            <Pill tone="green">Private beta</Pill>
          </div>
          <h1 className="max-w-4xl text-6xl font-semibold leading-[0.96] tracking-[-0.065em] text-neutral-950">
            Build always-on CRE agents that find, analyze, and improve.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-500">
            Cactus gives real estate teams always-on systems that never sleep: they find deals and sites, watch markets, analyze opportunities, organize your Vault, learn from feedback, and prepare outputs while your team works on the highest-value decisions.
          </p>
          <div className="mt-8 grid max-w-3xl grid-cols-3 gap-3">
            {[
              ["Find", "deals, sites, market shifts, ownership signals, permits, broker activity"],
              ["Analyze", "maps, comps, risks, source citations, site-selection signals, rankings"],
              ["Improve", "learn from approvals, rejections, edits, assumptions, and team feedback"],
            ].map(([title, note]) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-950">{title}</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onSignup} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm">Build your engine</button>
          <button onClick={onSignin} className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700">Sign in</button>
        </div>
      </div>
      <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-4">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium">How the opportunity engine keeps working</p>
          <p className="mt-2 text-xs leading-5 text-neutral-500">Start with one approved source and one always-on system, then let Cactus keep watching, learning, and improving.</p>
          <div className="mt-5 space-y-3">
            {[
              ["Watch", "Approved markets, sources, broker activity, listing sites, permits, ownership signals, and portfolio changes."],
              ["Find", "Surface acquisition targets, site-selection zones, market gaps, and off-market signals before a formal deal arrives."],
              ["Analyze", "Map, comp, risk-score, cite sources, prepare memos, and show exactly why each opportunity surfaced."],
              ["Learn", "Capture approvals, rejections, assumptions, and edits so future rankings get sharper automatically."],
            ].map(([title, note], index) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neutral-100 text-xs text-neutral-500">{index + 1}</div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">{note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Help video</p>
              <p className="mt-1 text-xs text-neutral-500">How Cactus creates always-on opportunity intelligence</p>
            </div>
            <Pill tone="green">Playing</Pill>
          </div>
          <div className="relative mx-5 mb-5 h-44 overflow-hidden rounded-2xl bg-neutral-950 text-white">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.10)_1px,transparent_1px)] [background-size:34px_34px]" />
            <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300">00:18 / 01:42</div>
            <div className="absolute inset-x-6 bottom-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-neutral-950">▶</div>
                <div>
                  <p className="text-sm font-medium">Find → analyze → review → learn → improve</p>
                  <p className="mt-1 text-xs text-neutral-400">Deal finding + site selection + Vault context → faster intake</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/15"><div className="h-1.5 w-1/3 rounded-full bg-white" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`fixed bottom-5 right-5 z-50 grid h-9 w-9 place-items-center rounded-lg border text-sm shadow-sm backdrop-blur ${isDark ? "border-white/10 bg-white/10 text-neutral-100" : "border-neutral-200 bg-white/80 text-neutral-700"}`}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}

function SignupScreen({ go, theme, initialMode = "signup", onAuthenticate }: { go: (screenIndex: number) => void; theme: "light" | "dark"; initialMode?: "signup" | "signin"; onAuthenticate: (input: { email: string; provider: "email" | "google" | "microsoft"; displayName?: string }) => Promise<boolean> }) {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [emailSent, setEmailSent] = useState(false);
  const [workEmail, setWorkEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const isSignup = mode === "signup";
  const isDark = theme === "dark";

  const pageClass = isDark
    ? "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#1f2a23,transparent_34%),linear-gradient(135deg,#050505,#111312_45%,#171a18)] p-6 text-white"
    : "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f2f7f3,transparent_34%),linear-gradient(135deg,#f6f5f1,#eef0f3)] p-6 text-neutral-950";
  const panelClass = isDark
    ? "w-full max-w-4xl rounded-[1.5rem] border border-white/10 bg-[#0b0d0c]/92 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.55)] backdrop-blur"
    : "w-full max-w-4xl rounded-[1.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const authButton = isDark ? "border-white/10 bg-white/[0.06] text-neutral-100 hover:bg-white/[0.09]" : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50";
  const inputClass = isDark ? "border-white/10 bg-black/30 text-white placeholder:text-neutral-600 focus:border-white/30" : "border-neutral-200 bg-gradient-to-b from-white to-neutral-50 text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-400";
  const primaryCta = isDark
    ? "bg-[#f4f1ea] text-neutral-950 shadow-[0_16px_44px_rgba(244,241,234,0.16)] hover:bg-white"
    : "bg-neutral-950 text-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] hover:bg-neutral-800";
  const showOauthNotConnected = (provider: "Google" | "Microsoft") => {
    setAuthMessage(`${provider} OAuth is not connected yet. Use work email for this demo account.`);
  };
  const authenticate = async (provider: "email" | "google" | "microsoft", email = workEmail) => {
    setAuthMessage("");
    const ok = await onAuthenticate({ email, provider, displayName: email.split("@")[0] });
    if (ok) {
      if (isSignup) go(2);
      else setEmailSent(true);
    } else {
      setAuthMessage("Enter your real work email to create a Cactus demo account.");
    }
  };

  return (
    <div className={pageClass}>
      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold ${isDark ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"}`}>C</div>
            <div><p className="font-medium">Cactus</p><p className={`text-xs ${muted}`}>Secure access</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="green">Step 1 of 4</Pill>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-md text-center">
          <div className={`mx-auto mb-5 grid w-56 grid-cols-2 rounded-xl border p-1 text-xs ${isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-neutral-100"}`}>
            <button onClick={() => setMode("signup")} className={`rounded-lg px-3 py-2 font-medium ${isSignup ? isDark ? "bg-white text-neutral-950" : "bg-white text-neutral-950 shadow-sm" : muted}`}>Sign up</button>
            <button onClick={() => setMode("signin")} className={`rounded-lg px-3 py-2 font-medium ${!isSignup ? isDark ? "bg-white text-neutral-950" : "bg-white text-neutral-950 shadow-sm" : muted}`}>Log in</button>
          </div>
          <h1 className="text-4xl font-semibold leading-[1] tracking-[-0.06em]">{isSignup ? "Create your company Vault." : "Log back into Cactus."}</h1>
          <p className={`mx-auto mt-4 max-w-sm text-sm leading-6 ${muted}`}>
            {isSignup ? "Start a new company workspace and free trial. Setup comes next; no payment step before you build the first Vault." : "Use your existing workspace, org settings, Vaults, Spaces, and saved workflows."}
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-md">
          <div className="space-y-3">
            <button onClick={() => showOauthNotConnected("Google")} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="text-base">G</span>{isSignup ? "Continue with Google" : "Sign in with Google"}<span className={`text-xs font-normal ${muted}`}>Not connected</span>
            </button>
            <button onClick={() => showOauthNotConnected("Microsoft")} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="grid grid-cols-2 gap-0.5">
                <span className="h-2 w-2 bg-[#f25022]" /><span className="h-2 w-2 bg-[#7fba00]" /><span className="h-2 w-2 bg-[#00a4ef]" /><span className="h-2 w-2 bg-[#ffb900]" />
              </span>{isSignup ? "Continue with Microsoft" : "Sign in with Microsoft"}<span className={`text-xs font-normal ${muted}`}>Not connected</span>
            </button>
          </div>

          <div className={`my-5 flex items-center gap-3 text-xs ${muted}`}><div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />or use work email<div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} /></div>
          <label className={`text-xs font-medium ${muted}`}>Work email</label>
          <input value={workEmail} onChange={(event) => setWorkEmail(event.target.value)} className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] ${inputClass}`} placeholder="you@company.com" />
          <button onClick={() => void authenticate("email")} className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition ${primaryCta}`}>{isSignup ? "Create account" : emailSent ? "Sign-in link sent" : "Email me a sign-in link"}</button>
          {authMessage && <div className={`mt-3 rounded-xl border px-3 py-2 text-left text-xs leading-5 ${isDark ? "border-amber-400/20 bg-amber-400/10 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{authMessage}</div>}
          {!isSignup && emailSent && (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-left text-xs leading-5 ${isDark ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              Check your email for a secure sign-in link. Prototype state only — backend auth will own this action.
            </div>
          )}

          <p className={`mt-4 text-center text-xs leading-5 ${muted}`}>
            {isSignup ? "Free 50-document trial · No payment before setup · Add more sources during trial" : "Returning workspace · SSO and org login later"}
          </p>
          <p className={`mt-3 text-center text-xs ${muted}`}>
            {isSignup ? "Already have an account? " : "New to Cactus? "}
            <button onClick={() => { setEmailSent(false); setMode(isSignup ? "signin" : "signup"); }} className={`font-medium underline-offset-4 hover:underline ${isDark ? "text-emerald-200" : "text-neutral-900"}`}>
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountSetup({ go, theme }: { go: (screenIndex: number) => void; theme: "light" | "dark" }) {
  const [setupStage, setSetupStage] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [measurement, setMeasurement] = useState("$/sq.ft");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberNotice, setMemberNotice] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { id: "owner", name: "Account owner", email: "", role: "Owner", access: "All data" },
  ]);
  const [assetClasses, setAssetClasses] = useState<string[]>(["Multifamily"]);
  const isDark = theme === "dark";
  const page = isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-white/80 bg-white/88";
  const surface = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white";
  const field = isDark ? "border-white/10 bg-white/[0.06] text-neutral-100" : "border-neutral-300 bg-gradient-to-b from-white to-neutral-50 text-neutral-700";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const label = isDark ? "text-neutral-300" : "text-neutral-700";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";
  const summary = isDark ? "border-white/10 bg-white/[0.03] text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-600";
  const continueCopy = setupStage === 1 ? "Continue to team access" : setupStage === 2 ? "Continue to asset classes" : "Continue to data setup";
  const canContinue = setupStage !== 1 || companyName.trim().length > 1;

  const goBack = () => {
    if (setupStage > 1) setSetupStage(setupStage - 1);
    else go(1);
  };

  const goForward = () => {
    if (!canContinue) return;
    if (setupStage < 3) setSetupStage(setupStage + 1);
    else go(3);
  };

  const addMember = () => {
    const email = newMemberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setMemberNotice("Enter a teammate email first.");
      return;
    }
    if (teamMembers.some((member) => member.email === email)) {
      setMemberNotice("That teammate is already added.");
      return;
    }
    const prefix = email.split("@")[0].replace(/[._-]+/g, " ");
    const name = prefix.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "New teammate";
    setTeamMembers((members) => [...members, { id: email, name, email, role: "Team member", access: "Review only" }]);
    setNewMemberEmail("");
    setMemberNotice("Member added. You can change role and access below.");
  };

  const updateMember = (id: string, key: "role" | "access", value: string) => {
    setTeamMembers((members) => members.map((member) => member.id === id ? { ...member, [key]: value } : member));
  };

  const toggleAssetClass = (item: string) => {
    setAssetClasses((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Create your corporate account</h2>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 2 of 4</span>
          </div>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Set the basics for your company workspace.</p>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <section>
            {setupStage > 1 && (
              <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${summary}`}>
                <div><span className="font-medium">Company:</span> {companyName || "Not set"} · {currency} · {measurement}</div>
                <button onClick={() => setSetupStage(1)} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-white"}`}>Edit</button>
              </div>
            )}

            {setupStage === 1 && (
              <div className="grid grid-cols-[1fr_130px_150px] gap-3">
                <label className={`text-sm font-medium ${label}`}>Company legal name
                  <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none shadow-sm ${field}`} placeholder="Your company name" />
                </label>
                <label className={`text-sm font-medium ${label}`}>Currency
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none shadow-sm ${field}`}>
                    {['USD','EUR','GBP','CAD','AUD'].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className={`text-sm font-medium ${label}`}>Measurement
                  <select value={measurement} onChange={(event) => setMeasurement(event.target.value)} className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none shadow-sm ${field}`}>
                    {['$/sq.ft','$/sq.m','$/unit','€/sq.m','£/sq.ft'].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            )}

            {setupStage > 2 && (
              <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${summary}`}>
                <div><span className="font-medium">Team:</span> {teamMembers.length} member{teamMembers.length === 1 ? "" : "s"}</div>
                <button onClick={() => setSetupStage(2)} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-white"}`}>Edit team access</button>
              </div>
            )}

            {setupStage === 2 && (
              <div className={`rounded-xl border p-3 ${surface}`}>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Team access</p>
                    <p className={`mt-1 text-xs ${muted}`}>Invite the people who should help review, edit, or view work.</p>
                  </div>
                  <div className="flex min-w-[330px] gap-2">
                    <input value={newMemberEmail} onChange={(event) => setNewMemberEmail(event.target.value)} className={`h-9 flex-1 rounded-lg border px-3 text-xs outline-none ${field}`} placeholder="teammate@company.com" />
                    <button onClick={addMember} className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm ${surface} ${label}`}>+ Add member</button>
                  </div>
                </div>
                {memberNotice && <p className={`mt-2 text-xs ${memberNotice.includes("added") ? "text-emerald-600" : "text-amber-600"}`}>{memberNotice}</p>}
                <div className="mt-3 grid grid-cols-[1.2fr_0.75fr_0.85fr] gap-3 px-3.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  <span>Member</span><span>Role</span><span>Access</span>
                </div>
                <div className={`mt-2 overflow-hidden rounded-xl border ${surface}`}>
                  {teamMembers.map((member) => (
                    <div key={member.id} className={`grid grid-cols-[1.2fr_0.75fr_0.85fr] items-center gap-3 border-b px-3.5 py-2 last:border-b-0 ${isDark ? "border-white/10" : "border-neutral-100"}`}>
                      <div>
                        <p className="text-sm font-medium leading-5">{member.name}</p>
                        <p className={`text-xs ${muted}`}>{member.email || "Account creator"}</p>
                      </div>
                      <select value={member.role} onChange={(event) => updateMember(member.id, "role", event.target.value)} className={`rounded-md border px-2.5 py-1.5 text-left text-xs font-medium shadow-sm ${field}`}>
                        {['Owner','Partner','Acquisitions','Asset Management','Analyst','External advisor','Lender','Broker','Team member'].map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <select value={member.access} onChange={(event) => updateMember(member.id, "access", event.target.value)} className={`rounded-md border px-2.5 py-1.5 text-left text-xs font-medium shadow-sm ${field}`}>
                        {['All data','Deals + comps','Portfolio only','Review only','View only'].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setupStage === 3 && (
              <div>
                <div>
                  <p className="text-sm font-semibold">Asset classes</p>
                  <p className={`mt-1 text-xs ${muted}`}>Choose every property type your team works on.</p>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {["Multifamily", "Affordable housing", "Self storage", "Industrial", "Retail", "Office"].map((item) => {
                    const selected = assetClasses.includes(item);
                    return (
                      <button key={item} onClick={() => toggleAssetClass(item)} className={`rounded-lg border px-3 py-2 text-left text-sm font-medium shadow-sm ${selected ? isDark ? "border-white bg-white text-neutral-950" : "border-neutral-950 bg-neutral-950 text-white" : `${surface} ${label}`}`}>
                        <span className="flex items-center gap-2"><span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${selected ? isDark ? "border-neutral-950 bg-neutral-950 text-white" : "border-white bg-white text-neutral-950" : "border-neutral-300 text-transparent"}`}>{selected ? "✓" : ""}</span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={goBack} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>These defaults can be edited later.</span>
              <button disabled={!canContinue} onClick={goForward} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${cta}`}>{continueCopy}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultSetup({ go, theme, onChooseSource }: { go: (screenIndex: number) => void; theme: "light" | "dark"; onChooseSource: (sourceIndex: number) => void }) {
  const [selectedSource, setSelectedSource] = useState(0);
  const isDark = theme === "dark";
  const source = sourceCards[selectedSource];
  const page = isDark ? "bg-neutral-950 text-white" : "bg-[#f7f4ee] text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white/90";
  const card = isDark ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]" : "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400";
  const selectedCard = isDark ? "border-white bg-white text-neutral-950" : "border-neutral-950 bg-[#f1ede4] text-neutral-950";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const soft = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-neutral-50";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-4xl">
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Start your proprietary database</h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 3 of 4</span>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <section className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-[#fbfaf7]"}`}>
            <p className="text-sm font-semibold">Add documents for one property first.</p>
            <p className={`mt-1 text-sm ${muted}`}>Cactus extracts facts into your company database, then combines them with Cactus market/source data with citations.</p>
          </section>

          <div className="mt-5">
            <p className="text-sm font-semibold">Start with</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {sourceCards.map((item, index) => {
                const isSelected = selectedSource === index;
                return (
                  <button key={item.title} onClick={() => setSelectedSource(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${isSelected ? selectedCard : card}`}>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold tracking-[-0.02em]">{item.title}</h3>
                      <p className={`mt-1 truncate text-xs ${isSelected ? "text-neutral-600" : muted}`}>{item.note}</p>
                    </div>
                    <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${isSelected ? "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-300 text-transparent"}`}>{isSelected ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${soft}`}>
            <p className="text-sm"><span className={muted}>Next:</span> <strong>{source.title}</strong> → <strong>extract facts into your database</strong></p>
            <span className={`hidden text-xs md:block ${muted}`}>More sources and Cactus datasets are available after setup.</span>
          </div>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={() => go(2)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <button onClick={() => { onChooseSource(selectedSource); go(6); }} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>Continue to add documents</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveExtraction({ go, theme }: { go: (screenIndex: number) => void; theme: "light" | "dark" }) {
  const isDark = theme === "dark";
  const page = isDark ? "bg-neutral-950 text-white" : "bg-[#f7f4ee] text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white/90";
  const surface = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white";
  const soft = isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-neutral-50";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";
  const reviewRows = [
    ["Workspace", "Cactus Capital Partners · Multifamily", "from Step 2"],
    ["Source", "Upload documents", "from Step 3"],
    ["First job", "Opportunity Finder", "from Step 3"],
  ];

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-3xl">
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Review the first plan</h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 4 of 4</span>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <p className={`text-sm leading-6 ${muted}`}>Step 3 created a brief. It did not connect data. To begin, choose the source Cactus can read first.</p>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
            {reviewRows.map(([label, value, origin], index) => (
              <Fragment key={label}>
                <div className={`rounded-xl border px-3 py-3 ${surface}`}>
                  <p className={`text-xs ${muted}`}>{origin}</p>
                  <p className="mt-1 text-sm font-semibold">{label}</p>
                  <p className={`mt-1 truncate text-xs ${muted}`}>{value}</p>
                </div>
                {index < reviewRows.length - 1 && <div className={`flex items-center text-sm ${muted}`}>→</div>}
              </Fragment>
            ))}
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${soft}`}>
            <p className="text-sm font-semibold">Before Cactus can run</p>
            <div className="mt-3 grid gap-2 text-sm">
              <p><span className={muted}>1.</span> Upload documents or connect approved folders.</p>
              <p><span className={muted}>2.</span> Confirm markets and buy-box criteria.</p>
              <p><span className={muted}>3.</span> Then Cactus can create the first review list.</p>
            </div>
          </div>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={() => go(3)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <button onClick={() => go(6)} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>Continue to data intake</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Opportunities({ go, onSubmit, hasIntake, initialSource, onExtractDeal }: { go: (screenIndex: number) => void; onSubmit: (sourceIndex: number) => void; hasIntake: boolean; initialSource: number; onSourceSelect: (sourceIndex: number) => void; onExtractDeal: (row: VaultGridRow) => void }) {
  const [activeComposerTool, setActiveComposerTool] = useState<"context" | "workflow" | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [asked, setAsked] = useState(false);
  const [vaultCheckbox, setVaultCheckbox] = useState(true);
  const [filesAdded, setFilesAdded] = useState(false);
  const [vaultAdded, setVaultAdded] = useState(hasIntake);
  const runFirstWin = () => {
    setFilesAdded(true);
    setVaultAdded(true);
    onExtractDeal(extractDealDocumentToVaultRow(sampleDealDocument, "assistant-upload"));
    onSubmit(initialSource);
    go(6);
  };
  const contextChips = hasIntake || vaultAdded
    ? ["Subject Property", "City row", "MSA benchmark", "Green Street report", "HelloData rent set"]
    : ["Vault empty", "No rows selected"];
  const promptText = "How can I help? Use @ to add context…";
  const openComposerTool = (tool: "context" | "workflow") => {
    setSourceOpen(false);
    setActiveComposerTool((current) => current === tool ? null : tool);
  };
  const openAdd = () => {
    setActiveComposerTool(null);
    setSourceOpen(true);
  };

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <TopBar title="Assistant" searchPlaceholder="Search chats, Vault rows, workflows…" onSearch={() => {}} />

      <main className="flex flex-1 flex-col items-center justify-center px-8 pb-10">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-950 text-sm font-semibold text-white">C</div>
            <h1 className="font-serif text-4xl font-light tracking-[-0.03em] text-neutral-900">What should Cactus work on?</h1>
          </div>

          <SharedComposer
            placeholder={promptText}
            context={[filesAdded ? "7 files" : "Add +", "Sources", "Create", "Workflow"]}
            contextActions={{
              [filesAdded ? "7 files" : "Add +"]: openAdd,
              Sources: () => openComposerTool("context"),
              Create: () => go(7),
              Workflow: () => openComposerTool("workflow"),
            }}
            onSend={() => { setAsked(true); go(7); }}
          />
          {asked && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-neutral-950">Opening this request as a Space.</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">Chats become durable workrooms with Vault context, outputs, and tasks.</p>
                </div>
                <button onClick={() => go(7)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Create Space</button>
              </div>
            </div>
          )}

          {activeComposerTool === "context" && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-xs font-medium text-neutral-800">Vault context for this ask</p><p className="mt-1 text-xs text-neutral-500">Choose the rows, reports, maps, or datasets Cactus should use before it acts.</p></div>
                <button onClick={() => go(6)} className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-950">Open Vault</button>
              </div>
              <input className="mb-3 h-8 w-full rounded-md border border-neutral-200 px-3 text-xs outline-none placeholder:text-neutral-300" placeholder="Search properties, micro-vaults, reports, owners, markets…" />
              <div className="grid grid-cols-2 gap-2">
                {[...contextChips.slice(0, 4), "Drive-time micro Vault", "Unmatched portfolio queue"].map((chip) => <button key={chip} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs text-neutral-700 hover:border-neutral-950"><span>{chip}</span><span className="text-neutral-400">+</span></button>)}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs"><span className="text-neutral-500">3 Vault rows · 1 report · latest context</span><button onClick={() => setActiveComposerTool(null)} className="rounded-md bg-neutral-950 px-3 py-2 font-medium text-white">Apply context</button></div>
            </div>
          )}

          {activeComposerTool === "workflow" && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-700">Call a saved workflow from Assistant</p>
                <button onClick={() => go(8)} className="text-xs text-neutral-950">Open Workflows</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {workflowLibrary.slice(0, 8).map((workflow) => <button key={workflow.name} onClick={() => setAsked(true)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-xs hover:bg-neutral-50"><span className="font-medium text-neutral-800">{workflow.name}</span><span className="ml-2 text-neutral-400">{workflow.mode}</span><span className="mt-1 block text-neutral-500">{workflow.output}</span></button>)}
              </div>
            </div>
          )}
        </div>
      </main>

      {sourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25" onClick={() => setSourceOpen(false)}>
          <div onClick={(event) => event.stopPropagation()} className="w-[620px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-950">Add</p><p className="mt-1 text-xs text-neutral-500">Files stay in Assistant. Vault ingestion is controlled by the checkbox. Live sources are managed in Vault.</p></div>
              <button onClick={() => setSourceOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
              <p className="text-sm font-medium text-neutral-950">Drag and drop documents here</p>
              <p className="mt-1 text-xs text-neutral-500">PDF, Excel, email exports, OMs, T12s, rent rolls, models, notes.</p>
              <button onClick={vaultCheckbox ? runFirstWin : () => { setFilesAdded(true); setSourceOpen(false); }} className="mt-4 rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Choose files</button>
              <label className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-600">
                <input type="checkbox" checked={vaultCheckbox} onChange={() => setVaultCheckbox((checked) => !checked)} className="h-3.5 w-3.5 accent-black" />
                Add extracted facts to Vault after upload
              </label>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <button onClick={() => { setSourceOpen(false); setActiveComposerTool("context"); }} className="rounded-xl border border-neutral-200 p-4 text-left hover:bg-neutral-50"><span className="font-medium">Add from Vault</span><span className="mt-1 block text-xs text-neutral-500">Attach existing rows, folders, market rows, or provider datasets.</span></button>
              <button onClick={() => { setSourceOpen(false); go(6); }} className="rounded-xl border border-neutral-200 p-4 text-left hover:bg-neutral-50"><span className="font-medium">Live source</span><span className="mt-1 block text-xs text-neutral-500">Drive, email, deal rooms, listing watchers, and provider feeds need scope/sync/cost approval in Vault.</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Spaces({ go, spaceDraft, onClearSpaceDraft }: { go: (screenIndex: number) => void; spaceDraft?: CactusSpaceDraft | null; onClearSpaceDraft?: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<(typeof workspaceLibrary)[number] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [divider, setDivider] = useState(52);
  const [spaceCreated, setSpaceCreated] = useState(false);
  const [assistantSpaceTitle, setAssistantSpaceTitle] = useState("Assistant-created Space");
  const [artifact, setArtifact] = useState(spaceDraft?.artifactBody ?? "Canvas empty");
  const [shareNotice, setShareNotice] = useState("");
  const [teamMembers, setTeamMembers] = useState(teamDirectorySeed);
  const [teamOpen, setTeamOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [teamNotice, setTeamNotice] = useState("Space team changes are prototype state; backend member invites will send email later.");
  const openSpaceMember = (initials: string) => { setSelectedMember(initials); setTeamOpen(true); };
  const addSpaceMember = () => {
    if (teamMembers.some((member) => member.initials === "NP")) return;
    setTeamMembers((current) => [...current, { initials: "NP", name: "New partner", email: "new.partner@cactus.local", role: "External collaborator", access: "View" }]);
    setTeamNotice("Invite email queued to new.partner@cactus.local for this Space.");
  };
  const removeSpaceMember = (initials: string) => {
    setTeamMembers((current) => current.filter((member) => member.initials !== initials));
    setTeamNotice(`${initials} removed from this Space.`);
    setTeamOpen(false);
  };
  const filteredSpaces = search ? workspaceLibrary.filter((workspace) => [workspace.title, workspace.market, workspace.type].join(" ").toLowerCase().includes(search.toLowerCase())) : [];
  const currentTeam = selectedWorkspace?.team ?? ["TS", "AK", "MR"];
  const activeDraft = spaceDraft ?? null;
  const downloadSpaceOutput = () => {
    const text = activeDraft?.downloadText ?? `Cactus Space Output\n${assistantSpaceTitle}\n\n${artifact}`;
    const url = window.URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeDraft?.title ?? assistantSpaceTitle).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cactus-space-output"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
  const shareSpaceOutput = async () => {
    const text = activeDraft?.shareText ?? `${assistantSpaceTitle} ready to share.`;
    try {
      await navigator.clipboard?.writeText(text);
      setShareNotice("Share summary copied");
    } catch {
      setShareNotice(text);
    }
  };
  const startAssistantSpace = (label = "Help me start a Space") => {
    setAssistantSpaceTitle(label);
    setArtifact(`Cactus is setting up: ${label}`);
    setSpaceCreated(true);
    setNewOpen(false);
  };

  if (selectedWorkspace || spaceCreated || activeDraft) {
    const title = activeDraft?.title ?? selectedWorkspace?.title ?? assistantSpaceTitle;
    return (
      <div className="relative flex h-screen flex-col bg-[#f8f7f4] text-neutral-950">
        <TopBar title={title} search={search} onSearch={setSearch} searchPlaceholder="Search this Space…" cta="Share" onCta={() => setTeamOpen(true)}>
          <button onClick={() => { setSelectedWorkspace(null); setSpaceCreated(false); onClearSpaceDraft?.(); }} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">← Spaces</button>
          <AvatarStack team={currentTeam} onPersonClick={openSpaceMember} />
        </TopBar>
        <main className="grid min-h-0 flex-1 overflow-hidden" style={{ gridTemplateColumns: `${divider}% 8px 1fr` }}>
          <section className="flex min-h-0 flex-col bg-white">
            <div className="min-h-0 flex-1 overflow-auto p-6">
              <div className="mx-auto max-w-3xl space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  <span className="font-medium text-neutral-950">{title}</span>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">{["Vault", "@person", "/task", "/draft", "/map", "/workflow"].map((chip) => <button key={chip} onClick={() => setArtifact(`${chip} ready`)} className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-600">{chip}</button>)}</div>
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-200 bg-white p-4">
              <SharedComposer compact placeholder="Ask Cactus, @mention someone, or type /task, /draft, /map, /workflow…" context={["Space", "Vault context", "Tasks"]} onSend={() => setArtifact("Draft artifact created from chat")} />
            </div>
          </section>
          <button aria-label="Drag divider" onClick={() => setDivider((value) => value === 52 ? 64 : value === 64 ? 42 : 52)} className="h-full cursor-col-resize border-x border-neutral-200 bg-neutral-100 hover:bg-neutral-200" />
          <aside className="min-h-0 overflow-auto bg-[linear-gradient(180deg,#fbfaf7,#f3f0ea)] p-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm font-medium">Output Canvas</p><span className="text-xs text-neutral-400">{Math.round(100 - divider)}%</span></div>
              <div className="mt-8 min-h-[300px] rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900">{activeDraft?.artifactTitle ?? artifact}</p>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-xs leading-6 text-neutral-600">{activeDraft?.artifactBody ?? artifact}</pre>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => setArtifact("IC memo block started")} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Start artifact</button>
                  <button onClick={downloadSpaceOutput} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700">Download</button>
                  <button onClick={shareSpaceOutput} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700">Share</button>
                </div>
                {shareNotice && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{shareNotice}</p>}
              </div>
            </div>
          </aside>
        </main>
        {teamOpen && <TeamMemberDrawer member={selectedMember} members={teamMembers} notice={teamNotice} onClose={() => setTeamOpen(false)} onAdd={addSpaceMember} onRemove={removeSpaceMember} />}
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <TopBar title="Spaces" search={search} onSearch={setSearch} searchPlaceholder="Search Spaces…" cta="Ask Cactus" onCta={() => setNewOpen(true)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-auto p-6">
        {filteredSpaces.length === 0 ? (
          <div className="grid flex-1 place-items-center">
            <div className="w-full max-w-2xl">
              <div className="mb-4 text-center">
                <p className="font-serif text-2xl tracking-[-0.04em] text-neutral-950">What are we working on?</p>
                <p className="mt-2 text-sm text-neutral-500">Ask Cactus. It will create the Space.</p>
              </div>
              <SharedComposer placeholder="How can I help? Use @ to add context…" context={["Sources", "Create", "Workflow"]} contextActions={{ Create: () => startAssistantSpace("New Cactus Space"), Workflow: () => go(8) }} onSend={() => startAssistantSpace("Assistant-created Space")} />

            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 text-xs text-neutral-400"><tr>{["Name", "Type", "Location", "People", "Updated", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>{filteredSpaces.map((workspace) => <tr key={workspace.title} onClick={() => setSelectedWorkspace(workspace)} className="cursor-pointer border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50"><td className="px-4 py-3 font-medium text-neutral-950">{workspace.title}</td><td className="px-4 py-3 text-neutral-500">{workspace.type}</td><td className="px-4 py-3 text-neutral-500">{workspace.address}</td><td className="px-4 py-3"><AvatarStack team={workspace.team} onPersonClick={openSpaceMember} /></td><td className="px-4 py-3 text-neutral-500">{workspace.updated}</td><td className="px-4 py-3"><span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{workspace.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </main>
      {teamOpen && <TeamMemberDrawer member={selectedMember} members={teamMembers} notice={teamNotice} onClose={() => setTeamOpen(false)} onAdd={addSpaceMember} onRemove={removeSpaceMember} />}
      {newOpen && <div onClick={() => setNewOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25 p-4"><div onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"><div className="mb-4 flex justify-between"><div><p className="text-sm font-medium">Ask Cactus</p><p className="mt-1 text-xs text-neutral-500">Describe the work. Cactus creates the Space.</p></div><button onClick={() => setNewOpen(false)}>×</button></div><SharedComposer compact placeholder="How can I help? Use @ to add context…" context={["Sources", "Create", "Workflow"]} contextActions={{ Create: () => startAssistantSpace("New Cactus Space"), Workflow: () => go(8) }} onSend={() => startAssistantSpace("Assistant-created Space")} /></div></div>}
    </div>
  );
}

function TasksActivity({ go }: { go: (screenIndex: number) => void }) {
  const defaultFolders = ["Inbox", "Today", "Assigned to me", "Acquisitions", "Portfolio cleanup", "Investor reporting"];
  const [folders, setFolders] = useState(defaultFolders);
  const [folder, setFolder] = useState("Inbox");
  const [personFilter, setPersonFilter] = useState("All");
  const [taskSearch, setTaskSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<(typeof taskRows)[number] | null>(taskRows[1]);
  const [createdTasks, setCreatedTasks] = useState<(typeof taskRows)[number][]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskOwner, setNewTaskOwner] = useState("AK");
  const [newTaskFolder, setNewTaskFolder] = useState("Inbox");
  const [done, setDone] = useState<string[]>([]);
  const [taskOwners, setTaskOwners] = useState<Record<string, string>>({});
  const [taskFolders, setTaskFolders] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState(teamDirectorySeed);
  const [teamOpen, setTeamOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [notification, setNotification] = useState("Ready");
  const allTasks = [...taskRows, ...createdTasks];
  const ownerFor = (task: (typeof taskRows)[number]) => taskOwners[task.title] ?? task.owner;
  const openMember = (initials: string) => { setSelectedMember(initials); setTeamOpen(true); };
  const folderFor = (task: (typeof taskRows)[number]) => taskFolders[task.title] ?? (task.type === "Vault review" ? "Portfolio cleanup" : task.type === "Maintenance" ? "Inbox" : task.role === "Investor" ? "Investor reporting" : task.role === "Broker" ? "Acquisitions" : "Inbox");
  const activeTasks = allTasks.filter((task) => !done.includes(task.title));
  const filteredTasks = activeTasks
    .filter((task) => personFilter === "All" || ownerFor(task) === personFilter)
    .filter((task) => {
      if (folder === "Inbox") return true;
      if (folder === "Today") return task.due === "Today" || task.due === "Now";
      if (folder === "Assigned to me") return ownerFor(task) === "TS";
      return folderFor(task) === folder;
    })
    .filter((task) => !taskSearch || [task.title, task.source, task.space, task.context, task.role, ownerFor(task), folderFor(task)].join(" ").toLowerCase().includes(taskSearch.toLowerCase()));
  const addMember = () => {
    if (teamMembers.some((member) => member.initials === "NP")) return;
    setTeamMembers((current) => [...current, { initials: "NP", name: "New partner", email: "new.partner@cactus.local", role: "External collaborator", access: "View" }]);
    setNotification("Invite queued");
  };
  const removeMember = (initials: string) => {
    setTeamMembers((current) => current.filter((member) => member.initials !== initials));
    setNotification(`${initials} removed`);
    setTeamOpen(false);
  };
  const assignTask = (task: (typeof taskRows)[number], initials: string) => {
    setTaskOwners((current) => ({ ...current, [task.title]: initials }));
    setNotification(`Assigned to ${initials}`);
  };
  const completeTask = (task: (typeof taskRows)[number]) => {
    setDone((current) => current.includes(task.title) ? current : [...current, task.title]);
    setNotification(`Done: ${task.title}`);
  };
  const removeTask = (task: (typeof taskRows)[number]) => {
    setDone((current) => current.includes(task.title) ? current : [...current, task.title]);
    setNotification(`Removed: ${task.title}`);
  };
  const createTask = () => {
    const title = newTaskTitle.trim() || "Review new portfolio item";
    const task = { title, owner: newTaskOwner, role: "Investor", source: "Manual task", space: newTaskFolder, status: "Open", priority: "Medium", due: "Today", action: "Open work", type: "My tasks", context: "Manual context", evidence: "Created by Tyler." };
    setCreatedTasks((current) => [task, ...current]);
    setTaskFolders((current) => ({ ...current, [title]: newTaskFolder }));
    if (!folders.includes(newTaskFolder)) setFolders((current) => [...current, newTaskFolder]);
    setSelectedTask(task);
    setFolder(newTaskFolder);
    setCreateOpen(false);
    setNewTaskTitle("");
    setNotification("Task created");
  };
  const addFolder = () => {
    const next = "New folder";
    if (!folders.includes(next)) setFolders((current) => [...current, next]);
    setFolder(next);
  };
  const primaryAction = selectedTask?.status === "Blocked" || selectedTask?.status === "Maintenance" ? "Resolve" : selectedTask?.status === "Review" ? "Review" : "Open work";
  const statusClass = (status: string) => status === "Blocked" || status === "Maintenance" ? "bg-amber-50 text-amber-700" : status === "Done" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600";

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <TopBar title="Tasks" search={taskSearch} onSearch={setTaskSearch} searchPlaceholder="Search tasks…" cta="+ Task" onCta={() => setCreateOpen(true)} />
      <main className="grid min-h-0 flex-1 grid-cols-[240px_minmax(520px,1fr)_360px] overflow-hidden">
        <aside className="overflow-auto border-r border-neutral-100 bg-neutral-50 p-4 text-sm">
          <button onClick={() => setCreateOpen(true)} className="mb-4 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">+ Create task</button>
          <p className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">Folders</p>
          <div className="mt-2 space-y-1">
            {folders.map((item) => <button key={item} onClick={() => setFolder(item)} className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs ${folder === item ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:bg-white"}`}><span>{item}</span><span className="text-neutral-400">{item === "Inbox" ? activeTasks.length : activeTasks.filter((task) => item === "Today" ? task.due === "Today" || task.due === "Now" : item === "Assigned to me" ? ownerFor(task) === "TS" : folderFor(task) === item).length}</span></button>)}
            <button onClick={addFolder} className="w-full rounded-md px-2 py-2 text-left text-xs text-neutral-500 hover:bg-white">+ New folder</button>
          </div>
          <p className="mt-6 px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">People</p>
          <div className="mt-2 flex flex-wrap gap-2 px-2">
            {["All", ...teamMembers.map((member) => member.initials)].map((initials) => <button key={initials} onClick={() => setPersonFilter(initials)} className={`rounded-full px-3 py-1 text-xs ${personFilter === initials ? "bg-neutral-950 text-white" : "bg-white text-neutral-600"}`}>{initials}</button>)}
          </div>
        </aside>

        <section className="overflow-auto p-5">
          {notification !== "Ready" && <div className="mb-3 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{notification}</div>}
          <div className="mb-3 flex items-center justify-between text-xs text-neutral-500"><span>{folder}{personFilter !== "All" ? ` · ${personFilter}` : ""}</span><span>{filteredTasks.length} tasks</span></div>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {filteredTasks.map((task) => {
              const taskStatus = done.includes(task.title) ? "Done" : task.status;
              return <button key={task.title} onClick={() => setSelectedTask(task)} className={`grid w-full grid-cols-[1fr_96px_76px_86px] items-center gap-3 border-b border-neutral-100 px-4 py-3 text-left text-xs last:border-b-0 hover:bg-neutral-50 ${selectedTask?.title === task.title ? "bg-neutral-50" : "bg-white"}`}>
                <span className="min-w-0"><span className="block truncate text-sm font-medium text-neutral-950">{task.title}</span><span className="mt-1 block truncate text-neutral-500">{task.space} · {task.source}</span></span>
                <span onClick={(event) => { event.stopPropagation(); openMember(ownerFor(task)); }} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-white">{ownerFor(task)}</span>
                <span className="text-neutral-500">{task.due}</span>
                <span className={`w-fit rounded-md px-2 py-1 text-[10px] ${statusClass(taskStatus)}`}>{taskStatus}</span>
              </button>;
            })}
            {filteredTasks.length === 0 && <div className="p-8 text-center text-sm text-neutral-400">No matching tasks.</div>}
          </div>
        </section>

        <aside className="overflow-auto border-l border-neutral-100 bg-neutral-50 p-5">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{selectedTask.title}</p><p className="mt-1 text-xs text-neutral-500">{selectedTask.source}</p></div><span className={`rounded-md px-2 py-1 text-[11px] ${statusClass(done.includes(selectedTask.title) ? "Done" : selectedTask.status)}`}>{done.includes(selectedTask.title) ? "Done" : selectedTask.status}</span></div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {[["Owner", ownerFor(selectedTask)], ["Folder", folderFor(selectedTask)], ["Due", selectedTask.due], ["Priority", selectedTask.priority]].map(([label, value]) => <div key={label} className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">{label}</p>{label === "Owner" ? <button onClick={() => openMember(value)} className="mt-1 font-medium text-neutral-800 underline-offset-2 hover:underline">{value}</button> : <p className="mt-1 font-medium text-neutral-800">{value}</p>}</div>)}
                </div>
                <p className="mt-4 text-xs font-medium text-neutral-400">Why this exists</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{selectedTask.evidence}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => go(7)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">{primaryAction}</button>
                  <button onClick={() => completeTask(selectedTask)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Mark done</button>
                  <details className="relative"><summary className="list-none rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">More</summary><div className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-neutral-200 bg-white p-1 text-xs shadow-xl"><button onClick={() => go(6)} className="block w-full rounded-md px-3 py-2 text-left hover:bg-neutral-50">Open Vault</button><button onClick={() => go(8)} className="block w-full rounded-md px-3 py-2 text-left hover:bg-neutral-50">Open workflow</button><button onClick={() => removeTask(selectedTask)} className="block w-full rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50">Remove</button></div></details>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">Assign</p>
                <div className="mt-2 flex flex-wrap gap-2">{teamMembers.map((member) => <button key={member.initials} onClick={() => assignTask(selectedTask, member.initials)} className={`rounded-full px-3 py-1 text-xs ${ownerFor(selectedTask) === member.initials ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600"}`}>{member.initials}</button>)}</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">Context</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">{selectedTask.context.split(" + ").map((item) => <button key={item} onClick={() => go(6)} className="rounded-md bg-neutral-50 px-2 py-1.5 text-neutral-700 hover:bg-neutral-100">{item}</button>)}</div>
              </div>
              <details className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 shadow-sm"><summary className="cursor-pointer font-medium text-neutral-900">Activity</summary><div className="mt-3 space-y-2">{["Task created", "Context linked", `Assigned to ${ownerFor(selectedTask)}`, "Waiting on owner"].map((item) => <div key={item} className="rounded-md bg-neutral-50 px-3 py-2">{item}</div>)}</div></details>
            </div>
          ) : <div className="text-sm text-neutral-400">Select a task.</div>}
        </aside>
      </main>
      {createOpen && <div onClick={() => setCreateOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25 p-4"><div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Create task</p><button onClick={() => setCreateOpen(false)} className="text-neutral-400">×</button></div><label className="mt-4 block text-xs text-neutral-500">What needs to happen?</label><textarea value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} className="mt-2 h-24 w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-950" placeholder="Have AK review missing addresses by Friday" /><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><label className="block text-neutral-500">Assign<select value={newTaskOwner} onChange={(event) => setNewTaskOwner(event.target.value)} className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-neutral-950">{teamMembers.map((member)=><option key={member.initials}>{member.initials}</option>)}</select></label><label className="block text-neutral-500">Folder<input value={newTaskFolder} onChange={(event) => setNewTaskFolder(event.target.value)} className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-950" /></label></div><button onClick={createTask} className="mt-4 w-full rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white">Create task</button></div></div>}
      {teamOpen && <TeamMemberDrawer member={selectedMember} members={teamMembers} notice={notification} onClose={() => setTeamOpen(false)} onAdd={addMember} onRemove={removeMember} />}
    </div>
  );
}

function Workflows({ go, workflowOutcomes, onWorkflowOutcome, onCreateWorkflowSpace }: { go: (screenIndex: number) => void; workflowOutcomes: WorkflowOutcome[]; onWorkflowOutcome: (outcome: WorkflowOutcome) => void; onCreateWorkflowSpace: (workflow: string) => void }) {
  const [workflowView, setWorkflowView] = useState<"all" | "ongoing" | "template" | "review" | "archived">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [runState, setRunState] = useState("Ready");
  const [runPanel, setRunPanel] = useState<{ title: string; mode: "Run once" | "Enable" | "Open Space"; note: string } | null>(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("Weekly Crexi multifamily deal scraper");
  const [workflowType, setWorkflowType] = useState("Scraper / source watcher");
  const [sourceUrl, setSourceUrl] = useState("https://www.crexi.com/properties?place=Nashville&types=multifamily");
  const [cadence, setCadence] = useState("Weekly");
  const [pullFields, setPullFields] = useState<string[]>(["Extract deal facts", "Normalize rent roll", "Find sales comps", "Find rent comps", "Run financial screen", "Draft IC memo"]);
  const [outputFormat, setOutputFormat] = useState("Vault columns");
  const [outputTarget, setOutputTarget] = useState("Add/update Vault rows");
  const [analysisSkill, setAnalysisSkill] = useState("Financial analysis");
  const [approvalState, setApprovalState] = useState("Not enabled");
  const [workflowCreated, setWorkflowCreated] = useState(false);
  const [, setSelectedExample] = useState<(typeof workflowExamples)[number] | null>(null);
  const togglePullField = (field: string) => setPullFields((current) => current.includes(field) ? current.filter((item) => item !== field) : [...current, field]);
  const loadWorkflowExample = (example: (typeof workflowExamples)[number]) => {
    setSelectedExample(example);
    setWorkflowName(example.title);
    setWorkflowType(example.title.includes("scraper") ? "Scraper / source watcher" : "AI analysis");
    setSourceUrl(example.source);
    setCadence(example.cadence);
    setPullFields([...example.fields]);
    setOutputFormat("Vault columns");
    setOutputTarget(example.output);
    setAnalysisSkill(example.skill);
    setApprovalState(`${example.title} loaded · edit steps, then create workflow`);
    setWorkflowCreated(false);
    setNewOpen(true);
  };
  const filtered = workflowLibrary
    .filter((workflow) => {
      const status = workflowStatusFor(workflow.name);
      if (workflowView === "all") return status !== "Archived";
      if (workflowView === "ongoing") return workflow.mode === "Ongoing" && status !== "Archived";
      if (workflowView === "template") return workflow.mode === "Template" && status !== "Archived";
      if (workflowView === "review") return status === "Needs review";
      return status === "Archived";
    })
    .filter((workflow) => !search || [workflow.name, workflow.group, workflow.trigger, workflow.output, workflowStatusFor(workflow.name)].join(" ").toLowerCase().includes(search.toLowerCase()));
  const toggle = (name: string) => setSelectedIds((current) => current.includes(name) ? current.filter((id) => id !== name) : [...current, name]);
  const allSelected = filtered.length > 0 && filtered.every((workflow) => selectedIds.includes(workflow.name));
  const detail = workflowLibrary.find((workflow) => workflow.name === selectedWorkflow);
  const maintenanceTasks = [
    ["Gmail re-auth", "Inbox watcher", "Assign"],
    ["Crexi selector changed", "Listing scraper", "Retry"],
    ["Review queue overdue", "Extraction review", "Open"]
  ];
  const selectedSkillsSummary = pullFields.length > 2 ? `${pullFields.slice(0, 2).join(", ")} +${pullFields.length - 2}` : pullFields.join(", ") || "Choose skills";
  const workflowSteps = workflowType === "Scraper / source watcher"
    ? [
      ["Trigger", cadence, "When Cactus runs"],
      ["Source", sourceUrl || "Add source", "URL, inbox, folder, API, or Vault rows"],
      ["Skills", selectedSkillsSummary, outputFormat],
      ["Review", "Human check", "approve facts before trusted writes"],
      ["Output", outputTarget, analysisSkill]
    ]
    : workflowType === "Review / approval"
      ? [
        ["Trigger", cadence, "selected work needing review"],
        ["Context", sourceUrl || "Vault rows / Space", "evidence and owner"],
        ["Check", selectedSkillsSummary, "citations + confidence"],
        ["Decision", "approve / edit / reject", "assigned reviewer"],
        ["Output", outputTarget, "task + audit trail"]
      ]
      : workflowType === "Output drafter"
        ? [
          ["Trigger", cadence, "Space or selected Vault rows"],
          ["Context", sourceUrl || "approved artifacts", "facts only"],
          ["Assemble", outputTarget, "memo / BOV / email blocks"],
          ["Review", "human edit", "no send until approved"],
          ["Output", "Space + export", analysisSkill]
        ]
        : [
          ["Trigger", cadence, "Assistant, Space, or Vault rows"],
          ["Context", sourceUrl || "selected rows", "files + endpoints"],
          ["Analyze", analysisSkill, selectedSkillsSummary],
          ["Review", "assumptions", "confidence + citations"],
          ["Output", outputTarget, "tasks / Space / Vault update"]
        ];
  const recordWorkflowAction = (title: string, mode: WorkflowActionMode) => {
    const outcome = createWorkflowOutcome(title, mode);
    onWorkflowOutcome(outcome);
    setRunState(`${outcome.workflow} · ${outcome.status}`);
    setRunPanel({ title: outcome.workflow, mode, note: outcome.note });
  };
  const createWorkflow = () => {
    setWorkflowCreated(true);
    setApprovalState(`${workflowName} created · review before enabling background runs`);
    setRunState(`${workflowName} created · ${workflowSteps.length} steps`);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setSelectedWorkflow(null);
  };
  const updateView = (value: "all" | "ongoing" | "template" | "review" | "archived") => {
    setWorkflowView(value);
    setSearch("");
    setSelectedWorkflow(null);
  };

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <TopBar title="Workflows" search={search} onSearch={updateSearch} searchPlaceholder="Search workflows…" cta="New workflow" onCta={() => { setWorkflowCreated(false); setNewOpen(true); }} />

      <div className="flex h-11 shrink-0 items-center justify-between overflow-x-auto border-b border-neutral-100 px-4 lg:px-8">
        <div className="flex shrink-0 items-center gap-5 text-sm">
          {[["all", "All"], ["ongoing", "Running"], ["template", "Templates"], ["review", "Needs review"], ["archived", "Archived"]].map(([key, label]) => (
            <button key={key} onClick={() => updateView(key as "all" | "ongoing" | "template" | "review" | "archived")} className={`${workflowView === key ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}>{label}</button>
          ))}
        </div>
        {selectedIds.length > 0 && <button onClick={() => setRunState(`${selectedIds.length} selected · batch action ready`)} className="text-xs text-neutral-700">Actions</button>}
      </div>

      {workflowOutcomes.length > 0 && <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-neutral-100 px-4 py-2 text-xs lg:px-8"><span className="shrink-0 text-neutral-400">Recent runs</span>{workflowOutcomes.slice(0, 3).map((outcome) => <button key={`${outcome.workflow}-${outcome.mode}-${outcome.createdAt}`} onClick={() => setRunPanel({ title: outcome.workflow, mode: outcome.mode, note: outcome.note })} className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 hover:bg-neutral-50">{outcome.workflow} · {outcome.status}</button>)}</div>}

      <main className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <div className="flex h-9 items-center border-b border-neutral-200 pr-8 text-xs font-medium text-neutral-500">
            <div className="grid w-8 place-items-center"><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : filtered.map((workflow) => workflow.name))} className="h-2.5 w-2.5 accent-black" /></div>
            <div className="w-[280px] px-2">Workflow</div>
            <div className="w-36">Group</div>
            <div className="w-28">Mode</div>
            <div className="w-[300px]">Trigger</div>
            <div className="w-[220px]">Output</div>
            <div className="w-28">Status</div>
            <div className="w-8" />
          </div>
          {filtered.map((workflow) => {
            const status = workflowStatusFor(workflow.name);
            return (
            <div key={workflow.name} className="group flex h-12 items-center border-b border-neutral-50 pr-8 text-sm hover:bg-neutral-50">
              <div className="grid w-8 place-items-center"><input type="checkbox" checked={selectedIds.includes(workflow.name)} onChange={() => toggle(workflow.name)} className="h-2.5 w-2.5 accent-black" /></div>
              <button onClick={() => setSelectedWorkflow(workflow.name)} className="w-[280px] truncate px-2 text-left font-medium text-neutral-800">{workflow.name}</button>
              <div className="w-36 text-xs text-neutral-600">{workflow.group}</div>
              <div className="w-28"><span className={`rounded-md px-2 py-1 text-[11px] ${workflow.mode === "Ongoing" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>{workflow.mode}</span></div>
              <div className="w-[300px] truncate text-xs text-neutral-500">{workflow.trigger}</div>
              <div className="w-[220px] truncate text-xs text-neutral-400">{workflow.output}</div>
              <div className="w-28"><span className={`rounded-md px-2 py-1 text-[11px] ${status === "Needs review" ? "bg-amber-50 text-amber-700" : status === "Archived" ? "bg-neutral-100 text-neutral-400" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></div>
              <button onClick={() => setSelectedWorkflow(workflow.name)} className="w-8 text-right text-neutral-300">⋯</button>
            </div>
            );
          })}
        </div>
      </main>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500 lg:px-8">
        <span>{runState}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setMaintenanceOpen(true)} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">3 maintenance tasks</button>
          <button onClick={() => go(9)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-700">Tasks</button>
        </div>
      </div>

      {maintenanceOpen && (
        <aside className="absolute right-0 top-0 z-50 h-full w-[420px] border-l border-amber-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Workflow maintenance tasks</p><p className="mt-1 text-xs text-neutral-500">Failures and upkeep become assignable tasks before backend automation runs unattended.</p></div><button onClick={() => setMaintenanceOpen(false)}>×</button></div>
          <div className="mt-5 space-y-3">
            {maintenanceTasks.map(([title, source, action]) => (
              <div key={title} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="font-medium text-neutral-950">{title}</p><p className="mt-1 text-xs text-amber-800">{source} · owner needed · due today</p></div><span className="rounded-md bg-white px-2 py-1 text-[11px] text-amber-700">{action}</span></div>
                <div className="mt-3 flex gap-2"><button onClick={() => setRunState(`${title} assigned to TS`)} className="rounded-md bg-neutral-950 px-2.5 py-1.5 text-xs text-white">Assign</button><button onClick={() => setRunState(`${title} retry queued`)} className="rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-amber-800">Retry</button><button onClick={() => setRunState(`${title} review opened`)} className="rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-amber-800">Review</button></div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {detail && (
        <aside className="absolute right-0 top-0 z-40 h-full w-[460px] border-l border-neutral-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between"><p className="text-sm font-medium">{detail.name}</p><button onClick={() => setSelectedWorkflow(null)}>×</button></div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl border border-neutral-200 p-3"><p className="text-xs text-neutral-400">Mode</p><p className="mt-1">{detail.mode === "Ongoing" ? "Ongoing automation that watches approved sources and creates/updates Vault rows or Spaces." : "One-off saved template that Assistant or a Space can call on demand."}</p></div>
            <div className="rounded-xl border border-neutral-200 p-3"><p className="text-xs text-neutral-400">Trigger</p><p className="mt-1">{detail.trigger}</p></div>
            <div className="rounded-xl border border-neutral-200 p-3"><p className="text-xs text-neutral-400">Context</p><p className="mt-1">{detail.context}</p></div>
            <div className="rounded-xl border border-neutral-200 p-3"><p className="text-xs text-neutral-400">Steps</p><ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-neutral-600"><li>Trigger from Assistant, Space, selected Vault rows, schedule, or watcher.</li><li>Extract source data, contacts, documents, and facts.</li><li>Run prompts/enrichment with citations and confidence.</li><li>Draft output/action and create review tasks before side effects.</li></ol></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs text-amber-700">Maintenance tasks</p><p className="mt-1 text-xs text-amber-800">Auth expired, scraper selector changed, stale source, low confidence, or human review overdue → assign to owner and show in Tasks.</p></div>
          </div>
          <div className="mt-5 flex gap-2"><button onClick={() => recordWorkflowAction(detail.name, "Run once")} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Run once</button><button onClick={() => recordWorkflowAction(detail.name, "Enable")} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Enable</button><button onClick={() => { recordWorkflowAction(detail.name, "Open Space"); onCreateWorkflowSpace(detail.name); }} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Open Space</button></div>
        </aside>
      )}

      {runPanel && (
        <div className="absolute bottom-20 right-8 z-30 w-[380px] rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-2xl">
          <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{runPanel.mode}: {runPanel.title}</p><p className="mt-1 text-xs leading-5 text-neutral-500">{runPanel.note}</p></div><button onClick={() => setRunPanel(null)}>×</button></div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">{["Context", "Artifacts", "Approval"].map((item) => <div key={item} className="rounded-lg bg-neutral-50 p-2 text-center text-neutral-600">{item}</div>)}</div>
          <button onClick={() => setRunPanel(null)} className="mt-3 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Got it</button>
        </div>
      )}

      {newOpen && (
        <div onClick={() => setNewOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-3 lg:p-6">
          <div onClick={(event) => event.stopPropagation()} className="grid max-h-[92vh] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl lg:grid-cols-[280px_minmax(0,1fr)_340px]">
            <section className="min-h-0 overflow-auto border-r border-neutral-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium">Create workflow</p><p className="mt-1 text-xs text-neutral-500">Pick start → type → source → skills → output.</p></div>
                <button onClick={() => setNewOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
              </div>
              <input value={workflowName} onChange={(event) => { setWorkflowName(event.target.value); setWorkflowCreated(false); }} className="mt-5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">1 · Start</p>
              <div className="mt-2 space-y-2 text-sm">
                {["On demand", "On new Vault row", "Weekly", "When source updates"].map((item)=><button key={item} onClick={() => { setCadence(item); setWorkflowCreated(false); }} className={`w-full rounded-lg border px-3 py-2 text-left ${cadence===item ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}>{item}</button>)}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">2 · Workflow type</p>
              <div className="mt-2 space-y-2 text-sm">
                {["Source watcher", "Analyze selected rows", "Draft output", "Review facts"].map((type)=>{
                  const mapped = type === "Source watcher" ? "Scraper / source watcher" : type === "Analyze selected rows" ? "AI analysis" : type === "Draft output" ? "Output drafter" : "Review / approval";
                  return <button key={type} onClick={() => { setWorkflowType(mapped); setWorkflowCreated(false); }} className={`w-full rounded-lg border px-3 py-2 text-left ${workflowType===mapped ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}>{type}</button>;
                })}
              </div>
            </section>

            <section className="min-h-0 overflow-auto p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">3 · Source / context</p>
              <input value={sourceUrl} onChange={(event) => { setSourceUrl(event.target.value); setWorkflowCreated(false); }} className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" placeholder="Crexi URL, Gmail label, Drive folder, selected Vault rows…" />

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">4 · Skills</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {["Extract deal facts", "Normalize rent roll", "Find sales comps", "Find rent comps", "Run financial screen", "Draft IC memo"].map((field)=><button key={field} onClick={() => { togglePullField(field); setWorkflowCreated(false); }} className={`rounded-lg border px-3 py-2 text-left ${pullFields.includes(field) ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:bg-neutral-50"}`}>{field}</button>)}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">5 · Output</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {["Add/update Vault rows", "Create review task", "Open Space", "Draft output"].map((target)=><button key={target} onClick={() => { setOutputTarget(target); setWorkflowCreated(false); }} className={`rounded-lg border px-3 py-2 text-left ${outputTarget===target ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}>{target}</button>)}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Follow-on analysis</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {["Financial analysis", "Market analysis", "Lender screen", "Broker BOV", "Review only"].map((skill)=><button key={skill} onClick={() => { setAnalysisSkill(skill); setWorkflowCreated(false); }} className={`rounded-lg border px-3 py-2 text-left ${analysisSkill===skill ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}>{skill}</button>)}
              </div>
            </section>

            <aside className="flex min-h-0 flex-col border-t border-neutral-100 bg-neutral-50 lg:border-l lg:border-t-0">
              <div className="min-h-0 flex-1 overflow-auto p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Step stack</p>
                <div className="mt-4 space-y-2 text-sm">
                  {workflowSteps.map(([title, value], index) => <div key={`${title}-${index}`} className="rounded-xl border border-neutral-200 bg-white p-3"><div className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-950 text-[10px] text-white">{index + 1}</span><span className="font-medium">{title}</span></div><p className="mt-2 truncate text-xs text-neutral-700">{value}</p></div>)}
                </div>
                {workflowCreated && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><p className="font-medium">Workflow created</p><p className="mt-1">Run once, enable, or open a Space.</p></div>}
              </div>
              <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
                <button onClick={createWorkflow} className="w-full rounded-md bg-neutral-950 px-3 py-2.5 text-sm font-medium text-white">Create workflow</button>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs"><button onClick={() => recordWorkflowAction(workflowName, "Run once")} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Run once</button><button onClick={() => { recordWorkflowAction(workflowName, "Enable"); setApprovalState("Needs review before enable"); }} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Enable</button><button onClick={() => { createWorkflow(); recordWorkflowAction(workflowName, "Open Space"); onCreateWorkflowSpace(workflowName); }} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Open Space</button></div>
                <p className="mt-2 text-[11px] leading-4 text-neutral-400">{approvalState}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
function Agents() {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_360px] gap-5 p-8">
      <main className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Always-on agents" title="Systems that never stop working" subtitle="Each agent is a plain-English CRE workflow: it watches approved sources, creates work, asks for review when needed, and learns from every decision." />
        <div className="grid grid-cols-2 gap-4">
          {agentCards.map(([name, watches, last, created, review]) => (
            <div key={name} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-base font-semibold tracking-[-0.03em] text-neutral-950">{name}</p><p className="mt-2 text-xs leading-5 text-neutral-500">{watches}</p></div><Pill tone="green">Watching</Pill></div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-400">Last worked</p><p className="mt-1 font-medium text-neutral-800">{last}</p></div>
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-400">Created</p><p className="mt-1 font-medium text-neutral-800">{created}</p></div>
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-400">Review</p><p className="mt-1 font-medium text-neutral-800">{review}</p></div>
              </div>
              <div className="mt-4 flex gap-2"><button className="rounded-full bg-neutral-950 px-3 py-2 text-xs font-medium text-white">View work</button><button className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600">Edit instructions</button><button className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600">Teach</button></div>
            </div>
          ))}
        </div>
      </main>
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
        <p className="text-sm font-medium text-neutral-950">What Cactus learned</p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">Plain-English memory that users can confirm, edit, or remove.</p>
        <div className="mt-5 space-y-3">
          {learnedItems.map((item) => <div key={item} className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-700"><p>{item}</p><div className="mt-3 flex gap-2"><button className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs text-white">Confirm</button><button className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600">Edit</button></div></div>)}
        </div>
      </aside>
    </div>
  );
}

function VaultTable({ hasIntake, go, sourceIndex, onCompleteIntake, extractedRows, onUploadFile, reviewQueue, onReviewFactAction, onCreateSpaceFromRows, auditApprovals, onApproveAudit }: { hasIntake: boolean; go: (screenIndex: number) => void; sourceIndex: number; onCompleteIntake: (sourceIndex: number) => void; extractedRows: VaultGridRow[]; onUploadFile: (file: File, source?: string) => Promise<VaultGridRow | null>; reviewQueue: ReviewQueueItem[]; onReviewFactAction: (factId: string, action: "approve" | "reject" | "edit", value?: string) => Promise<void>; onCreateSpaceFromRows: (rows: VaultGridRow[], request?: string) => void; auditApprovals: VaultAuditApproval[]; onApproveAudit: (approval: Omit<VaultAuditApproval, "approvedAt">) => void }) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showColumnBuilder, setShowColumnBuilder] = useState(false);
  const [vaultView, setVaultView] = useState<"table" | "map">("table");
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditFocus, setAuditFocus] = useState<{ row: string; field: string; value: string } | null>(null);
  const [sourceCenterOpen, setSourceCenterOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const sourceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [, setSourceSetupStatus] = useState("Not started");
  const [selectedSetupMode, setSelectedSetupMode] = useState<"deal" | "portfolio" | "connected" | "api">(sourceSetupKeyByIndex[sourceIndex]);
  const [microVault, setMicroVault] = useState("Main Vault");
  const [vaultMenuOpen, setVaultMenuOpen] = useState(false);
  const [aiSearch, setAiSearch] = useState("");
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [columns, setColumns] = useState([
    { key: "location", label: "Location\n(address)", prompt: "Identify the property, comp, market, or report geography.", format: "Text", width: 240 },
    { key: "yr1Noi", label: "YR 1 NOI", prompt: "Extract Year 1 NOI from the model, T-12, or Cactus base case.", format: "Currency", width: 150 },
    { key: "entryCap", label: "Entry Cap\nRate", prompt: "Calculate entry cap rate from purchase price and Year 1 NOI.", format: "Percent", width: 150 },
    { key: "marketCap", label: "Market Cap\nRate", prompt: "Benchmark market cap rate from approved comps/provider data.", format: "Percent", width: 160 },
    { key: "oneBedEffectiveRent", label: "1 Bed Effective\nRent", prompt: "Extract current effective 1BR rent from rent roll or concessions-adjusted source.", format: "Currency", width: 170 },
    { key: "oneBedMarketRent", label: "1 Bed Market\nRent", prompt: "Benchmark market 1BR rent from comps/provider rows for the same asset class.", format: "Currency", width: 170 },
    { key: "noiGrowth", label: "NOI Growth", prompt: "Extract or calculate NOI growth for the relevant period.", format: "Percent", width: 145 },
    { key: "owner", label: "Owner", prompt: "Extract owner/sponsor from OM, county record, CRM, or broker email.", format: "Text", width: 160 },
  ]);
  const baseVaultRows: VaultGridRow[] = [
    { id: "subject", kind: "Property", location: "16 Enviro Dr\nMoncton, NB", yr1Noi: "$1.42M", entryCap: "5.2%", marketCap: "5.5%", oneBedEffectiveRent: "$1,485", oneBedMarketRent: "$1,560", noiGrowth: "3.4%", owner: "Cactus Capital" },
    { id: "comp-1", kind: "Comp", location: "Riverside Flats\nNashville, TN", yr1Noi: "$2.18M", entryCap: "5.0%", marketCap: "5.3%", oneBedEffectiveRent: "$1,610", oneBedMarketRent: "$1,675", noiGrowth: "3.1%", owner: "Banyan RE" },
    { id: "city", kind: "Market", location: "Nashville\nUrban core", yr1Noi: "", entryCap: "", marketCap: "5.4%", oneBedEffectiveRent: "$1,570", oneBedMarketRent: "$1,640", noiGrowth: "2.9%", owner: "" },
    { id: "msa", kind: "Market", location: "Nashville MSA", yr1Noi: "", entryCap: "", marketCap: "5.6%", oneBedEffectiveRent: "$1,505", oneBedMarketRent: "$1,590", noiGrowth: "2.6%", owner: "" },
    { id: "provider-report", kind: "Report", location: "Green Street\nSoutheast MF", yr1Noi: "", entryCap: "", marketCap: "5.7%", oneBedEffectiveRent: "", oneBedMarketRent: "$1,620", noiGrowth: "2.8%", owner: "" },
  ];
  const vaultRows = [...extractedRows, ...baseVaultRows];
  const normalizedSearch = aiSearch.trim().toLowerCase();
  const filteredVaultRows = normalizedSearch
    ? vaultRows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(normalizedSearch))
    : vaultRows;
  const openAuditFor = (row: typeof vaultRows[number], column: typeof columns[number]) => {
    setAuditFocus({ row: row.location.split("\n").join(" "), field: column.label.split("\n").join(" "), value: String(row[column.key as keyof typeof row] || "Needs extraction") });
    setAuditOpen(true);
  };
  const selectedCount = selectedRows.length;
  const sourceRun = sourceRunLabels[sourceIndex];
  const sourceTitle = sourceCards[sourceIndex].title;
  const auditApprovalCount = auditApprovals.length;
  const toggleRow = (id: string) => setSelectedRows((current) => current.includes(id) ? current.filter((row) => row !== id) : [...current, id]);
  const vaultSetupModes = [
    {
      key: "deal" as const,
      title: "Deal documents",
      subtitle: "Upload the whole deal package.",
      examples: "OM, T-12, rent roll, model, market report, debt quote, and extra broker attachments",
      primary: "Choose deal files",
      scope: "One deal package",
      maps: "Deal row, property row, documents, financial data, market facts",
      review: "Cactus flags useful, skipped, and uncertain files",
      chips: ["OM", "T-12", "Rent roll", "Model", "Debt quote", "Market report", "Other files"],
    },
    {
      key: "portfolio" as const,
      title: "Portfolio data",
      subtitle: "Import, connect, or watch portfolio reports.",
      examples: "Portfolio schedules, API partners, PM/accounting exports, monthly reports, bank feeds",
      primary: "Add portfolio data",
      scope: "Multiple properties and periods",
      maps: "Property rows, snapshots, KPI columns, missing-address queue",
      review: "Cactus matches properties and calls out conflicts",
      chips: ["Upload file", "API partner", "Monthly reports", "Yardi", "RealPage", "AppFolio", "Banking"],
    },
    {
      key: "connected" as const,
      title: "Inbox + drive",
      subtitle: "Use approved folders and senders.",
      examples: "Gmail, Outlook, Google Drive, OneDrive, broker senders, shared folders, deal rooms",
      primary: "Connect a Data Source",
      scope: "Selected labels, folders, senders, and file types",
      maps: "Incoming documents, broker contacts, deadlines, source folders, review queues",
      review: "New files are organized before saving facts",
      chips: ["Gmail", "Outlook", "Google Drive", "OneDrive", "Deal rooms", "Broker senders"],
    },
    {
      key: "api" as const,
      title: "API partner feed",
      subtitle: "Connect provider, export, or custom API data.",
      examples: "Yardi, RealPage, AppFolio, Green Street, HelloData, custom API",
      primary: "Set up partner feed",
      scope: "Partner, endpoints, and properties",
      maps: "Provider fields into Vault rows and data columns",
      review: "Freshness, cost, and confidence stay visible",
      chips: ["Yardi", "RealPage", "Green Street", "HelloData", "Custom API", "Exports"],
    },
  ];
  const selectedSetup = vaultSetupModes.find((mode) => mode.key === selectedSetupMode) ?? vaultSetupModes[0];
  const addColumn = () => {
    setColumns((current) => [...current, { key: `custom-${current.length}`, label: "YR 2 NOI", prompt: "Extract Year 2 NOI from the selected documents or model and cite the source line.", format: "Currency", width: 150 }]);
    setShowColumnBuilder(false);
  };
  const startColumnResize = (event: ReactMouseEvent, key: string) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columns.find((column) => column.key === key)?.width ?? 160;
    const onMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(110, Math.min(360, startWidth + moveEvent.clientX - startX));
      setColumns((current) => current.map((column) => column.key === key ? { ...column, width: nextWidth } : column));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const selectedSetupSourceIndex = selectedSetup.key === "deal" ? 0 : selectedSetup.key === "connected" ? 1 : 2;
  const runSelectedSource = () => {
    sourceFileInputRef.current?.click();
  };
  const ingestSelectedFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadStatus(`Reading ${file.name}…`);
    const uploadedRow = await onUploadFile(file, selectedSetup.title);
    if (!uploadedRow) {
      setUploadStatus("Could not extract readable CRE text from that file.");
      return;
    }
    setSourceSetupStatus(`${selectedSetup.title} submitted · ${uploadedRow.location.split("\n")[0]} extracted`);
    setUploadStatus(`${uploadedRow.location.split("\n")[0]} extracted into Vault review.`);
    setSourceCenterOpen(false);
    onCompleteIntake(selectedSetupSourceIndex);
  };
  const selectedContextLabel = selectedCount > 1 ? "@ Selected Properties" : "@ Selected Property";
  const vaultContextLabel = `# ${microVault}`;
  const vaultOptions = ["Main Vault", "Selected rows folder", "Drive-time micro Vault", "Unmatched portfolio queue"];
  const activeFilterColumnDef = columns.find((column) => column.key === activeFilterColumn);
  const activeFilterValues = activeFilterColumnDef
    ? Array.from(new Set(vaultRows.map((row) => String(row[activeFilterColumnDef.key as keyof typeof row] || "Blank"))))
      .map((value) => ({ value, count: vaultRows.filter((row) => String(row[activeFilterColumnDef.key as keyof typeof row] || "Blank") === value).length }))
    : [];
  const activeReviewItem = reviewQueue[0];
  const activeReviewFacts = activeReviewItem?.facts ?? [];
  const activeReviewDocument = activeReviewItem?.document;
  const activeReviewSource = activeReviewItem?.sourcePreview ?? "Upload a deal package to see source evidence beside extracted facts.";
  const sourceSetupModal = (
    <div className="fixed inset-0 z-50 bg-white text-neutral-950" onClick={() => setSourceCenterOpen(false)}>
      <section onClick={(event) => event.stopPropagation()} className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
          <div>
            <p className="text-sm font-semibold">Add Data to Vault</p>
            <p className="mt-0.5 text-xs text-neutral-500">Selected from onboarding: {selectedSetup.title}</p>
          </div>
          <button onClick={() => setSourceCenterOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)] gap-0 overflow-hidden">
          <aside className="border-r border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Source type</p>
            <div className="mt-3 space-y-2">
              {vaultSetupModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => { setSelectedSetupMode(mode.key); setSourceSetupStatus("Not started"); }}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition ${selectedSetupMode === mode.key ? "border-neutral-950 bg-white shadow-sm" : "border-transparent text-neutral-500 hover:border-neutral-200 hover:bg-white"}`}
                >
                  <span className="block font-medium text-neutral-950">{mode.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">{mode.subtitle}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setSelectedSetupMode("api"); setSourceSetupStatus("Partner feed selected"); }} className="mt-4 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-xs text-neutral-700 hover:border-neutral-950">API partner feed</button>
          </aside>

          <main className="overflow-auto p-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{selectedSetup.title}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedSetup.key === "connected" ? "Connect a Data Source." : selectedSetup.key === "portfolio" ? "Add portfolio data." : selectedSetup.key === "api" ? "Set up partner feed." : "Add deal files."}</h2>
                </div>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">Confirm before saving</span>
              </div>

              {selectedSetup.key === "connected" ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["G", "Google Drive", "Connect Google Drive"],
                    ["M", "Gmail", "Connect Gmail"],
                    ["O", "Outlook", "Connect Outlook"],
                    ["1", "OneDrive", "Connect OneDrive"],
                  ].map(([logo, name, action]) => (
                    <button key={name} onClick={() => setSourceSetupStatus(`${name} selected`)} className="group rounded-2xl border border-neutral-200 bg-white p-5 text-left hover:border-neutral-950">
                      <div className="flex items-center gap-4">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-950">{logo}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-neutral-950">{name}</span>
                          <span className="mt-3 inline-flex rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">{action}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedSetup.key === "portfolio" ? (
                <div className="grid grid-cols-3 gap-3">
                  {[["Upload file", "Portfolio schedule"], ["Connect API partner", "Yardi / RealPage / AppFolio"], ["Watch monthly reports", "Email or Drive extractor"]].map(([action, note]) => <button key={action} onClick={runSelectedSource} className="rounded-2xl border border-neutral-200 bg-white p-5 text-left hover:border-neutral-950"><span className="block text-sm font-semibold text-neutral-950">{action}</span><span className="mt-2 block text-xs text-neutral-500">{note}</span></button>)}
                </div>
              ) : selectedSetup.key === "api" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="grid grid-cols-3 gap-3">{["Yardi", "RealPage", "AppFolio", "Green Street", "HelloData", "Custom API"].map((partner) => <button key={partner} onClick={runSelectedSource} className="rounded-xl border border-neutral-200 px-4 py-3 text-left text-sm font-medium hover:border-neutral-950">{partner}</button>)}</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                  <p className="text-base font-semibold text-neutral-950">Drop the full deal package here</p>
                  <p className="mt-1 text-sm text-neutral-500">Useful files are extracted. Low-value files are skipped.</p>
                  <input ref={sourceFileInputRef} type="file" accept=".pdf,.txt,.csv,.tsv,.md,.markdown,.json,.html,.eml,.xls,.xlsx,text/*,application/pdf" className="hidden" onChange={(event) => void ingestSelectedFile(event.target.files?.[0])} />
                  <button onClick={runSelectedSource} className="mt-5 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Choose files</button>
                  {uploadStatus && <p className="mt-3 text-xs text-neutral-500">{uploadStatus}</p>}
                </div>
              )}
            </div>
          </main>
        </div>
      </section>
    </div>
  );


  if (!hasIntake) {
    return (
      <div className="flex h-screen flex-col bg-white text-neutral-950">
        <TopBar title="Vault" search={aiSearch} onSearch={setAiSearch} searchPlaceholder="Search Vault…" />

        <div className="flex h-10 items-center border-b border-neutral-100 px-6 text-xs text-neutral-500">
          <span>Selected in onboarding: <strong className="font-medium text-neutral-800">{sourceTitle}</strong></span>
        </div>

        <main className="flex min-h-0 flex-1 flex-col p-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="grid h-10 min-w-[1050px] grid-cols-[240px_150px_150px_160px_175px_175px] border-b border-neutral-200 bg-neutral-50 px-3 text-xs font-semibold text-neutral-500">
              {['Location (address)', 'YR 1 NOI', 'Entry Cap Rate', 'Market Cap Rate', '1 Bed Effective Rent', '1 Bed Market Rent'].map((heading) => <div key={heading} className="flex items-center border-r border-neutral-200 pr-3 last:border-r-0">{heading}</div>)}
            </div>
            <div className="relative min-h-[430px] min-w-[1050px] bg-white">
              {Array.from({ length: 8 }).map((_, row) => (
                <div key={row} className="grid h-12 grid-cols-[240px_150px_150px_160px_175px_175px] border-b border-neutral-50 px-3">
                  {Array.from({ length: 6 }).map((__, col) => <div key={col} className="flex items-center border-r border-neutral-50 pr-3 last:border-r-0"><span className="h-4 w-24 rounded bg-neutral-100" /></div>)}
                </div>
              ))}
              <section className="absolute inset-0 flex items-center justify-center bg-white/85">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em]">No data yet</h2>
                  <button onClick={() => setSourceCenterOpen(true)} className="mt-5 rounded-md bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">Add Data</button>
                </div>
              </section>
            </div>
          </div>
        </main>

        {sourceCenterOpen && sourceSetupModal}
      </div>
    );
  }

  return (
    <div className="relative min-h-[760px] bg-white p-0 pb-32 text-neutral-950">
      <div className="min-h-[760px] border-t border-neutral-200">
        <main className="min-w-0 overflow-hidden">
          <TopBar title={(
            <div className="relative -ml-1">
              <button onClick={() => { setActiveFilterColumn(null); setVaultMenuOpen((open) => !open); }} className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 font-serif text-2xl font-medium tracking-[-0.03em] text-neutral-900 hover:bg-neutral-50" aria-expanded={vaultMenuOpen}>
                <span>{microVault}</span>
                <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
              </button>
              {vaultMenuOpen && (
                <div className="absolute left-0 top-11 z-50 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 font-sans text-sm shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                  {vaultOptions.map((option) => (
                    <button key={option} onClick={() => { setMicroVault(option); setVaultMenuOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-neutral-50 ${microVault === option ? "font-medium text-neutral-950" : "text-neutral-600"}`}>
                      <span>{option}</span>
                      {microVault === option && <span className="text-xs text-neutral-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )} search={aiSearch} onSearch={setAiSearch} searchPlaceholder="Search Vault: owners, missing addresses, rent growth…" cta="Add Data" onCta={() => setSourceCenterOpen(true)}>
            {microVault !== "Main Vault" && <button onClick={() => setMicroVault("Main Vault")} className="text-xs text-neutral-500">← Main</button>}
            <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
              <button onClick={() => setVaultView("table")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "table" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500"}`}>Table</button>
              <button onClick={() => setVaultView("map")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "map" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500"}`}>Map</button>
            </div>
            <button onClick={() => setAuditOpen(true)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Audit{reviewQueue.length ? ` · ${reviewQueue.reduce((sum, item) => sum + item.reviewCount, 0)}` : ""}</button>
          </TopBar>

          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
            {microVault} · {sourceRun} · {auditApprovalCount ? `${auditApprovalCount} approved facts` : "review queue open"} · {aiSearch ? `${filteredVaultRows.length}/${vaultRows.length} rows` : "property, market, benchmark, provider-report rows"}
          </div>

          {vaultView === "table" ? (
          <div className="relative overflow-auto">
            <table className="min-w-[1380px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100/80">
                  {columns.map((column, index) => (
                    <th key={column.key} style={{ width: column.width, minWidth: column.width, maxWidth: column.width }} className={`group relative h-[64px] border-r border-neutral-200 px-3 pr-10 text-sm font-semibold leading-tight text-neutral-950 ${index === 0 ? "sticky left-0 z-20 bg-neutral-100" : "bg-neutral-100/80"}`}>
                      <div className="flex h-full min-w-0 items-center gap-2">
                        <input type="checkbox" className="h-3 w-3 shrink-0 accent-black" aria-label={`select ${column.label}`} />
                        <span className="min-w-0 whitespace-normal break-words leading-5">{column.label.split("\n").join(" ")}</span>
                      </div>
                      <button onClick={() => { setVaultMenuOpen(false); setActiveFilterColumn(activeFilterColumn === column.key ? null : column.key); }} className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 opacity-0 shadow-sm transition hover:border-neutral-950 hover:text-neutral-950 group-hover:opacity-100" aria-label={`Filter ${column.label}`}>
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 3.5h11" /><path d="M4.5 7.5h7" /><path d="M6.5 11.5h3" /></svg>
                      </button>
                      {activeFilterColumn === column.key && (
                        <div className="absolute right-3 top-[56px] z-50 w-72 rounded-xl border border-neutral-200 bg-white p-3 text-xs font-normal text-neutral-700 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-neutral-950">Filter {column.label.split("\n").join(" ")}</span>
                            <button onClick={() => setActiveFilterColumn(null)} className="text-neutral-400 hover:text-neutral-950">×</button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 border-b border-neutral-100 pb-2">
                            <button className="rounded-md px-2 py-1.5 text-left hover:bg-neutral-50">Sort ascending</button>
                            <button className="rounded-md px-2 py-1.5 text-left hover:bg-neutral-50">Sort descending</button>
                          </div>
                          <input className="my-2 h-8 w-full rounded-md border border-neutral-200 px-2 text-xs outline-none placeholder:text-neutral-400 focus:border-neutral-950" placeholder="Search values…" />
                          <div className="max-h-40 space-y-1 overflow-auto">
                            {activeFilterValues.map(({ value, count }) => (
                              <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-50">
                                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-black" />
                                <span className="min-w-0 flex-1 truncate">{value}</span>
                                <span className="text-[11px] text-neutral-400">{count}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2">
                            <button className="text-xs text-neutral-500 hover:text-neutral-950">Clear</button>
                            <button onClick={() => setActiveFilterColumn(null)} className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white">Apply</button>
                          </div>
                        </div>
                      )}
                      <button onClick={() => setShowColumnBuilder(true)} className="absolute -right-3 top-1/2 z-30 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-950 opacity-0 shadow-sm transition group-hover:opacity-100" aria-label={`Add data point after ${column.label}`}>+</button>
                      <div onMouseDown={(event) => startColumnResize(event, column.key)} className="absolute right-0 top-0 z-40 h-full w-2 cursor-col-resize touch-none bg-transparent transition hover:bg-neutral-950/20" aria-label={`Drag to resize ${column.label}`} />
                    </th>
                  ))}
                  <th className="h-[50px] min-w-[210px] border-r border-neutral-200 bg-neutral-50 px-3 text-left text-xs font-medium text-neutral-500">
                    <button onClick={() => setShowColumnBuilder(true)} className="flex w-full items-center justify-between rounded-md border border-dashed border-neutral-300 bg-white px-3 py-2 text-left hover:border-neutral-950 hover:text-neutral-950">
                      <span>Search property/market first</span>
                      <span className="text-base leading-none">+</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVaultRows.map((row, rowIndex) => {
                  const selected = selectedRows.includes(row.id);
                  return (
                    <tr key={row.id} className={`${selected ? "bg-neutral-50" : rowIndex % 2 ? "bg-white" : "bg-white"} hover:bg-neutral-50`}>
                      {columns.map((column, index) => {
                        const value = row[column.key as keyof typeof row] as string | undefined;
                        return (
                          <td key={`${row.id}-${column.key}`} className={`h-[64px] border-b border-r border-neutral-200 px-3 align-middle ${index === 0 ? "sticky left-0 z-10 bg-inherit font-medium text-neutral-950" : "text-neutral-950"}`}>
                            <div className="flex items-center gap-2">
                              {index === 0 && <input type="checkbox" checked={selected} onChange={() => toggleRow(row.id)} className="h-3 w-3 accent-black" aria-label={`select ${row.location}`} />}
                              {value ? <button onClick={() => openAuditFor(row, column)} className="whitespace-pre-line text-left leading-5 underline-offset-2 hover:underline">{value}</button> : <button onClick={() => openAuditFor(row, column)} className="block h-6 w-full rounded bg-neutral-100" aria-label={`Audit empty ${column.label} for ${row.location}`} />}
                            </div>
                            {index === 0 && <p className="ml-5 mt-1 text-[11px] text-neutral-400">{row.kind}</p>}
                          </td>
                        );
                      })}
                      <td className="h-[64px] border-b border-r border-neutral-200 bg-neutral-50 px-3 align-middle text-xs text-neutral-400" />
                    </tr>
                  );
                })}
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`blank-${rowIndex}`}>
                    {columns.map((column, index) => <td key={`blank-${rowIndex}-${column.key}`} className={`h-[52px] border-b border-r border-neutral-200 px-3 ${index === 0 ? "sticky left-0 bg-white" : ""}`}><span className="block h-6 rounded bg-neutral-100" /></td>)}
                    <td className="h-[52px] border-b border-r border-neutral-200 bg-neutral-50 px-3" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="grid min-h-[560px] grid-cols-[1fr_360px] gap-4 p-4">
              <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-[#eef0eb]">
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(35deg,transparent_47%,rgba(82,82,82,.14)_48%,rgba(82,82,82,.14)_52%,transparent_53%),linear-gradient(120deg,transparent_47%,rgba(82,82,82,.10)_48%,rgba(82,82,82,.10)_52%,transparent_53%)] [background-size:160px_160px,220px_220px]" />
                <div className="absolute left-5 top-5 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-xs font-medium text-neutral-950 shadow-sm">Mapped Vault · same rows as table</div>
                <div className="absolute left-5 top-16 flex gap-2 rounded-xl border border-neutral-200 bg-white/95 p-2 text-xs shadow-sm">
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md bg-neutral-950 px-2 py-1.5 text-white">Drop pin</button>
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md border border-neutral-200 px-2 py-1.5 text-neutral-600">3 mi radius</button>
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md border border-neutral-200 px-2 py-1.5 text-neutral-600">15 min drive</button>
                </div>
                {filteredVaultRows.map((row, index) => (
                  <button key={`vault-pin-${row.id}`} onClick={() => toggleRow(row.id)} className={`absolute ${["left-[28%] top-[45%]", "left-[36%] top-[38%]", "left-[48%] top-[50%]", "left-[62%] top-[42%]", "left-[72%] top-[58%]"][index]} group`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-semibold shadow-lg ${selectedRows.includes(row.id) ? "bg-pink-200 text-neutral-950" : "bg-neutral-950 text-white"}`}>{index + 1}</span>
                    <span className="absolute left-7 top-8 hidden w-56 rounded-xl border border-neutral-200 bg-white p-3 text-left text-xs shadow-xl group-hover:block"><span className="font-semibold text-neutral-950">{row.location.split("\n").join(" ")}</span><br /><span className="text-neutral-500">{row.kind} · {row.marketCap || row.yr1Noi || "source context"}</span></span>
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-3"><p className="text-sm font-semibold text-neutral-950">Vault rows on map</p><p className="mt-1 text-xs text-neutral-500">Select rows or draw a radius/drive time to open a micro-vault, then chat to create a Space.</p></div>
                <div className="max-h-[500px] overflow-auto p-3">
                  {filteredVaultRows.map((row) => (
                    <button key={`vault-map-list-${row.id}`} onClick={() => toggleRow(row.id)} className={`mb-2 flex w-full items-start justify-between rounded-xl border p-3 text-left ${selectedRows.includes(row.id) ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}>
                      <span><span className="block text-sm font-medium text-neutral-950">{row.location.split("\n").join(" ")}</span><span className="mt-1 block text-xs text-neutral-500">{row.kind} · Market cap {row.marketCap || "—"} · YR 1 NOI {row.yr1Noi || "—"}</span></span>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{selectedRows.includes(row.id) ? "Selected" : "Select"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showColumnBuilder && (
        <>
        <button aria-label="Close column builder" onClick={() => setShowColumnBuilder(false)} className="fixed inset-0 z-30 cursor-default bg-transparent" />
        <div className="absolute right-14 top-28 z-40 w-[390px] rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950">Add data point column</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Search the property, market, geography, or report first. Then define what Cactus should extract or calculate.</p>
            </div>
            <button onClick={() => setShowColumnBuilder(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
          </div>
          <label className="mt-4 block text-xs font-semibold">Property / market context</label>
          <input className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-950" defaultValue="Subject Property + MSA" placeholder="Search property, MSA, market, report…" />
          <label className="mt-4 block text-xs font-semibold">Label</label>
          <input className="mt-1 w-full rounded-lg border border-pink-300 px-3 py-2 text-sm outline-none" defaultValue="Avg 1BR Rent" />
          <label className="mt-4 block text-xs font-semibold">Format</label>
          <button className="mt-1 flex w-40 items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">Number <span>↓</span></button>
          <label className="mt-4 block text-xs font-semibold">Prompt</label>
          <textarea className="mt-1 h-32 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-5 outline-none" defaultValue={"For the searched property/market context, extract the average monthly 1BR rent for Class A multifamily properties.\n\nReturn: $X,XXX (±Y% · n=Z)\n\nCite the file, page, cell, email, or provider row used."} />
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-400"><span>Use @ to mention columns</span><button onClick={addColumn} className="rounded-full bg-neutral-950 px-3 py-2 text-xs font-medium text-white">AI generate</button></div>
        </div>
        </>
      )}

      {auditOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/15" onClick={() => setAuditOpen(false)}>
        <aside onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 h-full w-[980px] border-l border-neutral-200 bg-white text-neutral-950 shadow-2xl">
          <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-5">
            <div><p className="text-sm font-semibold">Verify extracted facts{auditFocus ? ` · ${auditFocus.field}` : ""}</p><p className="text-xs text-neutral-500">{auditFocus ? `${auditFocus.row} · current value: ${auditFocus.value}` : "Original source on the left. Facts, citations, and approval controls on the right."}</p></div>
            <button onClick={() => setAuditOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
          </div>
          <div className="grid h-[calc(100%-56px)] grid-cols-[1fr_420px]">
            <div className="overflow-auto bg-neutral-100 p-6">
              <div className="mx-auto min-h-[620px] w-[560px] rounded-sm bg-white p-8 shadow-xl ring-1 ring-neutral-200">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3 text-xs text-neutral-500">
                  <span>{activeReviewDocument?.name ?? "No uploaded source selected"}</span><span>{activeReviewDocument?.kind?.toUpperCase() ?? "SOURCE"} · visual evidence</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-950">{activeReviewItem?.row.location.split("\n")[0] ?? "Extraction source"}</h3>
                <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-7 text-neutral-700">{activeReviewSource}</pre>
              </div>
            </div>
            <div className="border-l border-neutral-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div><p className="text-sm font-semibold">Extracted fields</p><p className="mt-1 text-xs text-neutral-500">Approve, edit, or reject before trusting the Vault.</p></div>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{activeReviewFacts.length} extracted</span>
              </div>
              {reviewQueue.length > 1 && <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{reviewQueue.length} source rows in review queue. Showing highest-priority row.</div>}
              <div className="max-h-[calc(100vh-190px)] space-y-2 overflow-auto pr-1">
                {activeReviewFacts.length ? activeReviewFacts.map((fact) => (
                  <div key={fact.id} className={`w-full rounded-xl border p-3 text-left ${fact.status === "rejected" ? "border-red-200 bg-red-50" : fact.status === "approved" ? "border-emerald-200 bg-emerald-50/40" : "border-neutral-200 bg-white"}`}>
                    <div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-neutral-950">{fact.field}</span><span className={`rounded-full px-2 py-1 text-[11px] ${fact.status === "approved" ? "bg-emerald-100 text-emerald-700" : fact.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{Math.round(fact.confidence * 100)}% · {fact.status.replace("_", " ")}</span></div>
                    <input defaultValue={fact.value} onBlur={(event) => { if (event.currentTarget.value !== fact.value) void onReviewFactAction(fact.id, "edit", event.currentTarget.value); }} className="mt-2 w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-800 outline-none focus:border-neutral-950" />
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{fact.evidence}</p>
                    <div className="mt-3 flex gap-2"><button onClick={() => void onReviewFactAction(fact.id, "approve")} className="rounded-md bg-neutral-950 px-2 py-1 text-[11px] text-white">Approve</button><button onClick={() => void onReviewFactAction(fact.id, "edit", fact.value)} className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Keep in review</button><button onClick={() => void onReviewFactAction(fact.id, "reject")} className="rounded-md border border-red-200 px-2 py-1 text-[11px] text-red-600">Reject</button></div>
                  </div>
                )) : <div className="rounded-xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-500">No extracted facts yet. Upload a deal package from Add Data to populate this queue.</div>}
              </div>
              {auditApprovalCount > 0 && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-700">{auditApprovalCount} legacy cell approvals in this Vault.</p>}
            </div>
          </div>
        </aside>
        </div>
      )}



      {sourceCenterOpen && sourceSetupModal}

      {selectedCount === 0 ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-500 shadow-xl">
          Select at least one Vault row to chat or create a Space.
        </div>
      ) : (
        <div className="fixed bottom-6 left-1/2 z-40 w-[760px] -translate-x-1/2">
          <SharedComposer
            placeholder={`Ask about ${selectedCount === 1 ? "this selected property" : `${selectedCount} selected properties`}…`}
            context={[selectedContextLabel, vaultContextLabel, "Skills", "Web", "Create folder"]}
            contextActions={{ "Create folder": () => setMicroVault("Selected rows folder") }}
            onSend={() => onCreateSpaceFromRows(vaultRows.filter((row) => selectedRows.includes(row.id)), `Review ${selectedCount === 1 ? "this selected property" : `${selectedCount} selected properties`}`)}
          />
        </div>
      )}
    </div>
  );
}

function VaultMap() {
  return (
    <div className="grid min-h-[690px] grid-cols-[290px_1fr_320px] gap-5 p-8">
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium">Filters</p>
        {['Drive time: 20 min', 'Demand growth: high', 'Supply pipeline: low', 'Traffic density: strong', 'Flood zone: exclude AE', 'Zoning: multifamily-friendly'].map((filter) => <div key={filter} className="mt-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600">{filter} <span className="float-right text-neutral-300">⌄</span></div>)}
        <div className="mt-5 border-t border-neutral-200 pt-5">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Matching records</p><span className="text-xs text-neutral-400">3</span></div>
          {['East Loop Assemblage', 'Riverside Flats', 'West Mesa Corridor'].map((property) => <div key={property} className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm"><p className="font-medium text-neutral-900">{property}</p><p className="mt-1 text-xs text-neutral-500">Opportunity signal · open analysis</p></div>)}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-[#eef0eb] shadow-sm">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(35deg,transparent_47%,rgba(82,82,82,.16)_48%,rgba(82,82,82,.16)_52%,transparent_53%),linear-gradient(120deg,transparent_47%,rgba(82,82,82,.12)_48%,rgba(82,82,82,.12)_52%,transparent_53%)] [background-size:160px_160px,220px_220px]" />
        <div className="absolute left-[18%] top-[20%] h-[420px] w-[520px] rounded-full border border-emerald-500/30 bg-emerald-400/10" />
        <div className="absolute right-[10%] top-[18%] rounded-full border border-blue-400/40 bg-blue-100/50 px-3 py-1 text-xs text-blue-700">site-selection layer</div>
        {mapPins.map(([pos, name, detail]) => <div key={name} className={`absolute ${pos} group`}><div className="h-4 w-4 rounded-full border-2 border-white bg-neutral-950 shadow-lg" /><div className="mt-2 hidden rounded-xl bg-white p-3 text-xs shadow-xl group-hover:block"><p className="font-medium">{name}</p><p className="text-neutral-500">{detail}</p></div></div>)}
      </div>
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium">Map assistant</p>
        <div className="mt-5 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">Three opportunity zones match demand growth, traffic density, zoning, supply gap, and flood-risk filters. East Loop has the strongest site-selection signal.</div>
        <div className="mt-3 rounded-2xl bg-neutral-950 p-4 text-sm leading-6 text-white">I can explain why this site surfaced, compare nearby comps, or turn it into a development review packet.</div>
        <div className="mt-4 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-400">Ask about this site-selection view…</div>
        <button className="mt-4 w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white">Create site review from 3 signals</button>
      </div>
    </div>
  );
}

function DealAnalysis() {
  return (
    <div className="grid min-h-[690px] grid-cols-[260px_1fr_340px] gap-5 p-8">
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        {['Overview', 'Opportunity thesis', 'Extracted facts', 'Site signals', 'Market', 'Rent comps', 'Sales comps', 'Memo'].map((item, i) => <div key={item} className={`rounded-xl px-3 py-2 text-sm ${i === 2 ? "bg-neutral-950 text-white" : "text-neutral-600"}`}>{item}</div>)}
      </aside>
      <main className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Analysis" title="Analyze an opportunity, deal, or site" subtitle="Select an opportunity from the engine, open a Vault row, enter an address, or add documents. Cactus combines site-selection signals, comps, source facts, and learned criteria into one reviewable analysis." />
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-4"><p className="text-sm font-medium text-neutral-950">What changed since last review</p><span className="text-xs text-amber-700">April snapshot → May refresh</span></div>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Exit cap widened 50 bps, debt cost moved +35 bps, and rent comp upside narrowed from 11% to 8%. Same seller case now needs price reduction or stronger NOI support.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {dealFacts.map(([field, value, source, status]) => <div key={field} className="rounded-2xl border border-neutral-200 p-4"><div className="flex justify-between"><p className="text-xs text-neutral-400">{field}</p><Pill tone={status === "Review" ? "amber" : "green"}>{status}</Pill></div><p className="mt-3 text-lg font-medium tracking-[-0.03em]">{value}</p><p className="mt-2 text-xs text-neutral-400">Source: {source}</p></div>)}
        </div>
      </main>
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
        <p className="text-sm font-medium">Analysis assistant</p>
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-neutral-600">Ask why an opportunity surfaced, add an OM/T12/rent roll, or compare the site against demographics, traffic, supply, flood risk, and comps.</div>
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400">Add docs or ask why this surfaced</div>
      </aside>
    </div>
  );
}

function CompsData() {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_340px] gap-5 p-8">
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Comps + enrichment" title="Approve comps, site signals, and enrichments" subtitle="Cactus recommends evidence for deals and sites, but the investor approves. Paid enrichment appears only when it strengthens underwriting, site selection, or output citations." />
        <table className="w-full text-left text-sm"><thead className="text-xs text-neutral-500"><tr>{['Evidence', 'Distance', 'Year', 'Units', '$/Unit', 'Decision'].map((h) => <th key={h} className="border-b border-neutral-200 px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{comps.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className="border-b border-neutral-100 px-3 py-4"><span className={i === 5 ? "rounded-full border border-neutral-200 px-2 py-1 text-xs" : ""}>{cell}</span></td>)}</tr>)}</tbody></table>
      </div>
      <div className="space-y-4">
        {providerPacks.map(([name, cost, freshness, supports, action]) => <div key={name} className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="font-medium tracking-[-0.02em]">{name}</p><span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{cost}</span></div><p className="mt-2 text-sm leading-6 text-neutral-500">{supports}</p><div className="mt-4 flex items-center justify-between text-xs text-neutral-400"><span>{freshness}</span><button className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600">{action}</button></div></div>)}
      </div>
    </div>
  );
}

function Outputs({ go }: { go: (screenIndex: number) => void }) {
  return (
    <div className="grid min-h-[690px] grid-cols-[320px_1fr_340px] gap-5 p-8">
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-neutral-950">Output artifacts</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Work products generated from Spaces.</p>
          </div>
          <Pill tone="green">4 drafts</Pill>
        </div>
        <div className="mt-5 space-y-2">
          {outputArtifacts.map(([type, name, status, context], index) => (
            <button key={`${type}-${name}`} className={`w-full rounded-2xl border p-4 text-left transition ${index === 0 ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{type}</p>
                  <p className={`mt-1 text-xs ${index === 0 ? "text-neutral-400" : "text-neutral-500"}`}>{name}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] ${index === 0 ? "bg-white text-neutral-950" : "bg-neutral-100 text-neutral-500"}`}>{status}</span>
              </div>
              <p className={`mt-3 text-xs ${index === 0 ? "text-neutral-300" : "text-neutral-500"}`}>{context}</p>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Artifact rule</p>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Every shared output should know its Space, Vault snapshot, source appendix, model version, and review state.</p>
        </div>
      </aside>

      <main className="space-y-5">
        <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">IC memo artifact · generated from Space</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">Riverside Flats Investment Committee Memo</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">Cactus turned the active Space into a reviewable memo: source-linked thesis, extraction into Tyler&apos;s Excel model, market benchmarks, downside case, diligence asks, and appendix-ready evidence.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(7)} className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600">Open Space</button>
              <button className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Freeze for IC</button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              ["Status", "Needs review"],
              ["Snapshot", "Latest Vault"],
              ["Model", "Excel mapped"],
              ["Sources", "7 cited"],
              ["Next", "Freeze + share"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="mt-2 text-sm font-medium text-neutral-950">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-950">Memo sections</p>
              <p className="mt-1 text-xs text-neutral-500">Each section keeps the source trail visible so the team can trust, edit, or approve it.</p>
            </div>
            <Pill tone="amber">2 review items</Pill>
          </div>
          <div className="mt-4 space-y-3">
            {memoSections.map(([title, copy, sources, status]) => (
              <div key={title} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{copy}</p>
                  </div>
                  <Pill tone={status === "Needs review" || status === "Action" || status === "Open" ? "amber" : "default"}>{status}</Pill>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                  <span>Sources: {sources}</span>
                  <button className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600">Edit section</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-[1fr_300px] gap-5">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">Export and share</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {artifactActions.map((action, index) => <button key={action} className={`rounded-full px-3 py-2 text-xs font-medium ${index === 0 ? "bg-neutral-950 text-white" : "border border-neutral-200 text-neutral-600"}`}>{action}</button>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-neutral-500">Freezing the memo preserves the exact Vault snapshot, model case, sources, and assumptions shared with IC.</p>
          </div>
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">Save learning</p>
            <p className="mt-3 text-sm leading-6 text-neutral-500">If IC edits this memo, Cactus saves the approved case and decision back to the Vault.</p>
          </div>
        </section>
      </main>

      <aside className="space-y-5">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm">
          <p className="text-sm font-medium">Cactus recommendation</p>
          <p className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.05em]">Proceed only if basis improves or NOI support strengthens.</p>
          <p className="mt-3 text-sm leading-6 text-neutral-400">The memo is ready for team review, but Cactus recommends refreshing ATTOM taxes and resolving T12 NOI variance before external sharing.</p>
          <button onClick={() => go(9)} className="mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-neutral-950">Create IC memo agent</button>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-950">Evidence trail</p>
          <div className="mt-4 space-y-2">
            {memoEvidence.map(([label, value, note]) => (
              <div key={label} className="rounded-xl border border-neutral-200 p-3">
                <div className="flex justify-between gap-3 text-xs"><span className="font-medium text-neutral-950">{label}</span><span className="text-neutral-400">{note}</span></div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-950">Appendix ready</p>
          <p className="mt-3 text-sm leading-6 text-neutral-500">Source appendix includes OM pages, T12 lines, rent roll fields, provider refresh timestamps, and scenario versions.</p>
        </div>
      </aside>
    </div>
  );
}

function Activity() {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_380px] gap-5 p-8">
      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Activity + learning" title="Cactus improves from every review" subtitle="The activity log shows what agents did, what sources they touched, what they created, and how team feedback changes future rankings." />
        <div className="space-y-3">
          {[
            ['Opportunity Finder', 'Rejected two Nashville leads under 80 units; lowered future rank for similar deals.'],
            ['Site Selection', 'Promoted East Loop after traffic density, zoning, supply gap, and flood risk passed.'],
            ['Deal Intake', 'Linked Riverside Flats OM facts to source pages and queued T12 NOI for review.'],
            ['Portfolio Monitor', 'Flagged insurance renewal risk on Cedar Point and added it to weekly update.'],
          ].map(([agent, note]) => <div key={agent} className="rounded-2xl border border-neutral-200 p-4"><div className="flex items-center justify-between"><p className="text-sm font-medium text-neutral-950">{agent}</p><Pill>Audited</Pill></div><p className="mt-2 text-sm leading-6 text-neutral-500">{note}</p></div>)}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm text-neutral-400">Continuous improvement</p>
        <h3 className="mt-8 text-3xl font-semibold tracking-[-0.06em]">Every approval, rejection, and edit trains the system.</h3>
        <p className="mt-4 text-sm leading-6 text-neutral-400">Cactus should feel technical in power but plain-English in control: users teach it through normal CRE decisions, not developer-style configuration.</p>
        <div className="mt-6 space-y-2 text-xs text-neutral-300">
          <div className="rounded-xl bg-white/10 px-3 py-2">Approve or reject opportunities</div>
          <div className="rounded-xl bg-white/10 px-3 py-2">Edit assumptions and comps</div>
          <div className="rounded-xl bg-white/10 px-3 py-2">Confirm learned preferences</div>
          <div className="rounded-xl bg-white/10 px-3 py-2">Audit source-linked work</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const initialWorkingState = loadWorkingState();
  const [hasIntake, setHasIntake] = useState(initialWorkingState.hasIntake);
  const [sourceIndex, setSourceIndex] = useState(initialWorkingState.sourceIndex);
  const [extractedRows, setExtractedRows] = useState<VaultGridRow[]>(initialWorkingState.extractedRows);
  const [activeSpaceDraft, setActiveSpaceDraft] = useState<CactusSpaceDraft | null>(null);
  const [aiConnection, setAiConnection] = useState<CactusAiConnection>(initialWorkingState.aiConnection);
  const [auditApprovals, setAuditApprovals] = useState<VaultAuditApproval[]>(initialWorkingState.auditApprovals);
  const [workflowOutcomes, setWorkflowOutcomes] = useState<WorkflowOutcome[]>(initialWorkingState.workflowOutcomes);
  const [authSession, setAuthSession] = useState<CactusAuthSession | null>(initialWorkingState.authSession);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [aiSetupOpen, setAiSetupOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === "dark";
  useEffect(() => {
    window.localStorage.setItem(CACTUS_WORKING_STATE_KEY, JSON.stringify({ hasIntake, sourceIndex, extractedRows, aiConnection, auditApprovals, workflowOutcomes, authSession }));
  }, [hasIntake, sourceIndex, extractedRows, aiConnection, auditApprovals, workflowOutcomes, authSession]);
  const refreshReviewQueue = async () => {
    try {
      const payload = await fetch("/api/cactus/state").then((response) => response.json());
      const state = payload?.state as CactusBackendState | undefined;
      if (!state) return;
      const items = state.vaultRows.map((row) => {
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
      }).filter((item) => item.facts.length > 0).sort((a, b) => b.reviewCount - a.reviewCount);
      setReviewQueue(items);
    } catch {
      setReviewQueue([]);
    }
  };
  useEffect(() => {
    const id = window.setTimeout(() => { void refreshReviewQueue(); }, 0);
    return () => window.clearTimeout(id);
  }, []);
  const authenticate = async (input: { email: string; provider: "email" | "google" | "microsoft"; displayName?: string }) => {
    const response = await postCactusResource<CactusAuthSession>("auth", { ...input, companyName: "Cactus Capital Partners" });
    if (!response?.email) return false;
    setAuthSession(response);
    return true;
  };
  const addExtractedRow = (row: VaultGridRow) => {
    setExtractedRows((current) => mergeVaultRows(current, row));
    void postCactusResource("documents", { name: "Ocean Drive OM.pdf", kind: "pdf", source: "refined Vault source setup", text: sampleDealDocument, rowId: row.id }).then(() => refreshReviewQueue());
  };
  const uploadFileToVault = async (file: File, source = "direct file upload") => {
    const form = new FormData();
    form.set("file", file);
    form.set("source", source);
    try {
      const response = await fetch("/api/cactus/documents", { method: "POST", body: form });
      const payload = await response.json();
      const row = payload?.result?.row as VaultGridRow | undefined;
      if (!response.ok || !row?.id) return null;
      setExtractedRows((current) => mergeVaultRows(current, row));
      await refreshReviewQueue();
      return row;
    } catch {
      return null;
    }
  };
  const reviewFactAction = async (factId: string, action: "approve" | "reject" | "edit", value?: string) => {
    await postCactusResource("vault-facts", action === "approve" ? { factId } : action === "reject" ? { factId, action, reason: "Rejected in visual extraction review" } : { factId, action, value, evidence: "Edited in visual extraction review" });
    await refreshReviewQueue();
  };
  const approveAudit = (approval: Omit<VaultAuditApproval, "approvedAt">) => {
    setAuditApprovals((current) => addAuditApproval(current, approval));
    void postCactusResource("sources", { name: `Audit approval: ${approval.row} ${approval.field}`, direction: "Read to Vault" });
  };
  const connectOpenAi = () => {
    const next = createAiConnectionFromKey(apiKeyInput);
    if (next.status !== "connected") {
      setApiKeyMessage("Paste a valid OpenAI key shape. Cactus stores only a fingerprint in this local demo.");
      return;
    }
    setAiConnection(next);
    setApiKeyInput("");
    setApiKeyMessage(`${next.label} · ${next.fingerprint}`);
  };
  const createSpaceFromRows = (rows: VaultGridRow[], request = "Review this deal") => {
    setActiveSpaceDraft(createSpaceDraftFromVaultRows(rows, request));
    void postCactusResource("spaces", { vaultRowIds: rows.map((row) => row.id), request });
    setActive(7);
  };
  const recordWorkflowOutcome = (outcome: WorkflowOutcome) => {
    setWorkflowOutcomes((current) => appendWorkflowOutcome(current, outcome));
    void postCactusResource("workflows", { workflow: outcome.workflow, mode: outcome.mode });
  };
  const createWorkflowSpace = (workflow: string) => {
    setActiveSpaceDraft(createWorkflowSpaceDraft(workflow));
    void postCactusResource("workflows", { workflow, mode: "Open Space" });
    setActive(7);
  };
  const renderAppScreen = () => {
    if (active === 5) return <Opportunities go={setActive} onSubmit={(index) => { setSourceIndex(index); setHasIntake(true); }} hasIntake={hasIntake} initialSource={sourceIndex} onSourceSelect={setSourceIndex} onExtractDeal={addExtractedRow} />;
    if (active === 6) return <VaultTable go={setActive} hasIntake={hasIntake} sourceIndex={sourceIndex} onCompleteIntake={(index) => { setSourceIndex(index); setHasIntake(true); }} extractedRows={extractedRows} onUploadFile={uploadFileToVault} reviewQueue={reviewQueue} onReviewFactAction={reviewFactAction} onCreateSpaceFromRows={createSpaceFromRows} auditApprovals={auditApprovals} onApproveAudit={approveAudit} />;
    if (active === 7) return <Spaces go={setActive} spaceDraft={activeSpaceDraft} onClearSpaceDraft={() => setActiveSpaceDraft(null)} />;
    if (active === 8) return <Workflows go={setActive} workflowOutcomes={workflowOutcomes} onWorkflowOutcome={recordWorkflowOutcome} onCreateWorkflowSpace={createWorkflowSpace} />;
    if (active === 9) return <TasksActivity go={setActive} />;
    return <Spaces go={setActive} spaceDraft={activeSpaceDraft} onClearSpaceDraft={() => setActiveSpaceDraft(null)} />;
  };

  if (active === 0) return <><ThemeToggle theme={theme} setTheme={setTheme} /><Homepage onSignup={() => { setAuthMode("signup"); setActive(1); }} onSignin={() => { setAuthMode("signin"); setActive(1); }} /></>;
  if (active === 1) return <><ThemeToggle theme={theme} setTheme={setTheme} /><SignupScreen go={setActive} theme={theme} initialMode={authMode} onAuthenticate={authenticate} /></>;
  if (active === 2) return <><ThemeToggle theme={theme} setTheme={setTheme} /><AccountSetup go={setActive} theme={theme} /></>;
  if (active === 3) return <><ThemeToggle theme={theme} setTheme={setTheme} /><VaultSetup go={setActive} theme={theme} onChooseSource={setSourceIndex} /></>;
  if (active === 4) return <><ThemeToggle theme={theme} setTheme={setTheme} /><LiveExtraction go={setActive} theme={theme} /></>;

  return (
    <main className={`min-h-screen ${isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"}`}>
      <div className="flex h-screen overflow-hidden">
        <aside className={`flex h-screen ${sidebarCollapsed ? "w-14" : "w-64"} shrink-0 flex-col border-r transition-all ${isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-5"} py-4`}>
            <button onClick={() => setActive(5)} title="Assistant" className="flex min-w-0 items-center gap-2 text-left">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neutral-950 text-xs font-semibold text-white">C</span>
              {!sidebarCollapsed && <span className="font-serif text-2xl font-light tracking-[-0.04em]">Cactus</span>}
            </button>
            {!sidebarCollapsed && <button onClick={() => setSidebarCollapsed(true)} title="Collapse menu" className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-neutral-100">‹</button>}
          </div>
          {sidebarCollapsed && <button onClick={() => setSidebarCollapsed(false)} title="Expand menu" className="mx-auto mb-3 grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-neutral-100">›</button>}

          <nav className="px-2.5">
            {appNav.map(([screen, icon, screenIndex]) => {
              const activeNav = active === screenIndex;
              return (
                <button
                  key={screen}
                  onClick={() => setActive(screenIndex)}
                  title={screen}
                  aria-label={screen}
                  className={`group relative mb-1 flex h-9 w-full items-center gap-3 rounded-md ${sidebarCollapsed ? "justify-center px-0" : "px-3"} text-left text-sm transition ${activeNav ? "bg-neutral-200/70 text-neutral-950" : isDark ? "text-neutral-300 hover:bg-white/10" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  <span className="w-4 text-center text-base">{icon}</span>
                  {!sidebarCollapsed && <span className="font-medium">{screen}</span>}
                  {sidebarCollapsed && <span className="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 shadow-lg group-hover:block">{screen}</span>}
                </button>
              );
            })}
          </nav>

          {!sidebarCollapsed && <div className="mt-5 flex min-h-0 flex-1 flex-col px-5">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
              <span>Assistant History</span>
              <span>⌄</span>
            </div>
            <div className="mt-2 space-y-1 overflow-auto text-sm">
              {["Review first deal package", "Add YR 1 NOI endpoint", "Compare MSA rent growth"].map((item) => (
                <button key={item} onClick={() => setActive(5)} className="block w-full truncate rounded-md px-2 py-2 text-left text-neutral-600 hover:bg-white">{item}</button>
              ))}
            </div>
          </div>}

          <div className="mt-auto border-t border-neutral-200 p-3">
            <button onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); setAccountOpen((open) => !open); }} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-neutral-100">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-950 text-xs font-semibold text-white">T</span>
              {!sidebarCollapsed && <span><span className="block text-sm font-medium">{authSession?.email?.split("@")[0] ?? "Tyler"}</span><span className="block text-xs text-neutral-500">{authSession ? `${authSession.role} · Multifamily Vault` : "Multifamily Vault"}</span></span>}
            </button>
            {accountOpen && (
              <div className={`absolute bottom-16 ${sidebarCollapsed ? "left-2" : "left-3"} z-50 w-72 rounded-xl border border-neutral-200 bg-white p-2 text-sm text-neutral-950 shadow-2xl`}>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Workspace actions</p>
                </div>
                <button onClick={() => { setActive(6); setAccountOpen(false); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Manage integrations in Vault</span><span className="text-neutral-400">▣</span></button>
                <button onClick={() => { setAiSetupOpen(true); setAccountOpen(false); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>{aiConnection.status === "connected" ? `OpenAI · ${aiConnection.fingerprint}` : "Connect OpenAI key"}</span><span className="text-neutral-400">AI</span></button>
                <button onClick={() => { setActive(9); setAccountOpen(false); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Team + tasks</span><span className="text-neutral-400">✓</span></button>
                <button onClick={() => window.open("/billing", "_blank")} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Billing</span><span className="text-neutral-400">↗</span></button>
                <button onClick={() => window.open("/privacy-security", "_blank")} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Privacy + security</span><span className="text-neutral-400">↗</span></button>
                <div className="my-1 border-t border-neutral-100" />
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Theme</span><span className="rounded-md bg-neutral-100 px-2 py-1 text-xs">{theme === "dark" ? "Dark" : "Light"}</span></button>
                <button onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Sidebar</span><span className="rounded-md bg-neutral-100 px-2 py-1 text-xs">{sidebarCollapsed ? "Collapsed" : "Expanded"}</span></button>
                <div className="my-1 border-t border-neutral-100" />
                <button onClick={() => setActive(0)} className="block w-full rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </aside>
        {accountOpen && <button aria-label="Close account menu" onClick={() => setAccountOpen(false)} className="fixed inset-0 z-30 cursor-default bg-transparent" />}
        {aiSetupOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/20 p-6" onClick={() => setAiSetupOpen(false)}>
            <section onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Assistant connection</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Connect OpenAI for live responses.</h2></div>
                <button onClick={() => setAiSetupOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-500">For this local prototype, Cactus validates the key shape and stores only a redacted fingerprint. Do not paste production credentials unless the backend vault is added.</p>
              <label className="mt-5 block text-xs font-semibold text-neutral-700">OpenAI API key</label>
              <input value={apiKeyInput} onChange={(event) => setApiKeyInput(event.target.value)} type="password" placeholder="sk-proj-…" className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950" />
              {apiKeyMessage && <p className={`mt-3 rounded-md px-3 py-2 text-xs ${aiConnection.status === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{apiKeyMessage}</p>}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Current: {aiConnection.status === "connected" ? aiConnection.fingerprint : "deterministic fallback"}</span>
                <button onClick={connectOpenAi} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Connect</button>
              </div>
            </section>
          </div>
        )}
        <section className="min-w-0 flex-1 overflow-hidden">
          {renderAppScreen()}
        </section>
      </div>
    </main>
  );
}
