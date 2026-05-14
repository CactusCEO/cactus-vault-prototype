"use client";

import { Fragment, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

const sourceCards = [
  {
    title: "Upload documents",
    badge: "Best first source",
    note: "OMs, T12s, rent rolls, models.",
    next: "Cactus reads the files you approve and creates the first Vault records.",
  },
  {
    title: "Connect email or drive",
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
    title: "Use demo Vault",
    badge: "Explore first",
    note: "Sample data only.",
    next: "Cactus loads a realistic demo so you can see the workflow immediately.",
  },
];

const sourceRunLabels = [
  "7 uploaded documents extracting",
  "Approved Drive/email scope extracting",
  "Imported list/comps extracting",
  "Demo Vault loaded",
];

const sourceSetupKeyByIndex = ["deal", "connected", "portfolio", "deal"] as const;

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

function TopBar({ title, search, onSearch, searchPlaceholder = "Search…", cta, onCta, children }: { title: string; search?: string; onSearch?: (value: string) => void; searchPlaceholder?: string; cta?: string; onCta?: () => void; children?: ReactNode }) {
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
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition ${listening ? "shadow-[0_18px_60px_rgba(180,101,39,0.18)]" : ""} ${disabled ? "opacity-60" : ""}`}>
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

function SignupScreen({ go, theme, initialMode = "signup" }: { go: (screenIndex: number) => void; theme: "light" | "dark"; initialMode?: "signup" | "signin" }) {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [emailSent, setEmailSent] = useState(false);
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
            <button onClick={() => isSignup ? go(2) : go(5)} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="text-base">G</span>{isSignup ? "Sign up with Google" : "Sign in with Google"}
            </button>
            <button onClick={() => isSignup ? go(2) : go(5)} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="grid grid-cols-2 gap-0.5">
                <span className="h-2 w-2 bg-[#f25022]" /><span className="h-2 w-2 bg-[#7fba00]" /><span className="h-2 w-2 bg-[#00a4ef]" /><span className="h-2 w-2 bg-[#ffb900]" />
              </span>{isSignup ? "Sign up with Microsoft" : "Sign in with Microsoft"}
            </button>
          </div>

          <div className={`my-5 flex items-center gap-3 text-xs ${muted}`}><div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />or use work email<div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} /></div>
          <label className={`text-xs font-medium ${muted}`}>Work email</label>
          <input className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] ${inputClass}`} placeholder="you@company.com" />
          <button onClick={() => isSignup ? go(2) : setEmailSent(true)} className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition ${primaryCta}`}>{isSignup ? "Create account" : emailSent ? "Sign-in link sent" : "Email me a sign-in link"}</button>
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [setupStage, setSetupStage] = useState(1);
  const isDark = theme === "dark";
  const page = isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-white/80 bg-white/88";
  const surface = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white";
  const soft = isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-neutral-50";
  const field = isDark ? "border-white/10 bg-white/[0.06] text-neutral-100" : "border-neutral-300 bg-gradient-to-b from-white to-neutral-50 text-neutral-700";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const label = isDark ? "text-neutral-300" : "text-neutral-700";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";
  const summary = isDark ? "border-white/10 bg-white/[0.03] text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-600";
  const continueCopy = setupStage === 1 ? "Continue to team access" : setupStage === 2 ? "Continue to asset classes" : "Continue";

  const goBack = () => {
    if (setupStage > 1) setSetupStage(setupStage - 1);
    else go(1);
  };

  const goForward = () => {
    if (setupStage < 3) setSetupStage(setupStage + 1);
    else go(3);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Create your corporate account</h2>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 2 of 4</span>
          </div>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Add one layer at a time. Cactus uses these defaults to create a secure company Vault.</p>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <section>
            {setupStage > 1 && (
              <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${summary}`}>
                <div><span className="font-medium">Company details:</span> Cactus Capital Partners · USD · $ / sq.ft</div>
                <button onClick={() => setSetupStage(1)} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-white"}`}>Edit</button>
              </div>
            )}

            {setupStage === 1 && (
              <div className="grid grid-cols-[1fr_130px_150px] gap-3">
                {[
                  ["Company legal name", "Cactus Capital Partners", ""],
                  ["Currency", "USD", "⌄"],
                  ["Measurement", "$ / sq.ft", "⌄"],
                ].map(([fieldLabel, placeholder, icon]) => (
                  <label key={fieldLabel} className={`text-sm font-medium ${label}`}>{fieldLabel}
                    <div className={`mt-2 flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm shadow-sm ${field}`}>
                      <span>{placeholder}</span>
                      {icon && <span className="text-neutral-400">{icon}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {setupStage > 2 && (
              <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${summary}`}>
                <div><span className="font-medium">Team access saved:</span> 3 members · owner, editor, viewer</div>
                <button onClick={() => setSetupStage(2)} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-white"}`}>Edit team access</button>
              </div>
            )}

            {setupStage === 2 && (
              <div className={`rounded-xl border p-3 ${soft}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Team access</p>
                    <p className={`mt-1 text-xs ${muted}`}>Set who can review, edit, and use each part of the Vault.</p>
                  </div>
                  <button className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm ${surface} ${label}`}>+ Add member</button>
                </div>
                <div className="mt-2.5 grid grid-cols-[1.2fr_0.65fr_0.85fr] gap-3 px-3.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  <span>Member</span><span>Role</span><span>Access</span>
                </div>
                <div className={`mt-2 overflow-hidden rounded-xl border ${surface}`}>
                  {[
                    ["Tyler Sellars", "tyler@company.com", "Owner", "All Vaults"],
                    ["Acquisitions Analyst", "analyst@company.com", "Editor", "Deals + comps"],
                    ["Asset Manager", "assetmanager@company.com", "Viewer", "Portfolio only"],
                  ].map(([name, email, role, access]) => (
                    <div key={email} className={`grid grid-cols-[1.2fr_0.65fr_0.85fr] items-center gap-3 border-b px-3.5 py-2 last:border-b-0 ${isDark ? "border-white/10" : "border-neutral-100"}`}>
                      <div>
                        <p className="text-sm font-medium leading-5">{name}</p>
                        <p className={`text-xs ${muted}`}>{email}</p>
                      </div>
                      <button className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs font-medium shadow-sm ${field}`}><span>{role}</span><span className="text-neutral-400">⌄</span></button>
                      <button className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs font-medium shadow-sm ${field}`}><span>{access}</span><span className="text-neutral-400">⌄</span></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setupStage === 3 && (
              <div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-semibold">Asset classes</p>
                    <p className={`mt-1 text-xs ${muted}`}>Choose the markets this organization works with.</p>
                  </div>
                  <button onClick={() => setHelpOpen(!helpOpen)} className={`text-xs font-medium underline-offset-4 hover:underline ${label}`}>{helpOpen ? "Hide help" : "Need help?"}</button>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {["Multifamily", "Affordable housing", "Self storage", "Industrial", "Retail", "Office"].map((item, index) => (
                    <button key={item} className={`rounded-lg border px-3 py-2 text-left text-sm font-medium shadow-sm ${surface} ${label}`}>
                      <span className="flex items-center gap-2"><span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${index < 3 ? isDark ? "border-white bg-white text-neutral-950" : "border-neutral-700 bg-neutral-900 text-white" : "border-neutral-300 text-transparent"}`}>{index < 3 ? "✓" : ""}</span>{item}</span>
                    </button>
                  ))}
                </div>
                {helpOpen && <div className="mt-4 rounded-xl bg-neutral-950 p-3 text-xs leading-5 text-neutral-300">Tip: start broad. You can change asset classes after the first Vault is built.</div>}
              </div>
            )}
          </section>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={goBack} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>These defaults can be edited later.</span>
              <button onClick={goForward} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>{continueCopy}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultSetup({ go, theme, onChooseSource }: { go: (screenIndex: number) => void; theme: "light" | "dark"; onChooseSource: (sourceIndex: number) => void }) {
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [selectedSystem, setSelectedSystem] = useState(0);
  const isDark = theme === "dark";
  const source = selectedSource === null ? null : sourceCards[selectedSource];
  const system = systemCards[selectedSystem];
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
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Brief your Cactus analyst</h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 3 · trial setup</span>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <section className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-[#fbfaf7]"}`}>
            <p className="text-sm font-semibold">Start with one source, then one job.</p>
            <p className={`mt-1 text-sm ${muted}`}>You can add more sources and workflows later.</p>
          </section>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">First source</p>
              <div className="mt-2 space-y-2">
                {sourceCards.map((item, index) => {
                  const isSelected = selectedSource === index;
                  return (
                    <button key={item.title} onClick={() => setSelectedSource(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${isSelected ? selectedCard : card}`}>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold tracking-[-0.02em]">{item.title}</h3>
                        <p className={`mt-1 truncate text-xs ${isSelected && isDark ? "text-neutral-600" : isSelected ? "text-neutral-600" : muted}`}>{item.note}</p>
                      </div>
                      <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${isSelected ? isDark ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-300 text-transparent"}`}>{isSelected ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSource !== null ? (
            <div>
              <p className="text-sm font-semibold">First job</p>
              <div className="mt-2 space-y-2">
                {systemCards.map((item, index) => {
                  const isSelected = selectedSystem === index;
                  return (
                    <button key={item.title} onClick={() => setSelectedSystem(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${isSelected ? selectedCard : card}`}>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold tracking-[-0.02em]">{item.title}</h3>
                        <p className={`mt-1 truncate text-xs ${isSelected && isDark ? "text-neutral-600" : isSelected ? "text-neutral-600" : muted}`}>{item.note}</p>
                      </div>
                      <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${isSelected ? isDark ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-300 text-transparent"}`}>{isSelected ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            ) : (
              <div className={`flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed p-6 text-center ${isDark ? "border-white/10 text-neutral-500" : "border-neutral-200 text-neutral-400"}`}>
                <p className="text-sm font-medium">Choose a source to continue.</p>
              </div>
            )}
          </div>

          <div className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${soft}`}>
            <p className="text-sm"><span className={muted}>Path:</span> <strong>{source?.title ?? "Choose first source"}</strong>{source && <> → <strong>{system.title}</strong></>}</p>
            <span className={`hidden text-xs md:block ${muted}`}>Multiple sources can connect to this company Vault during trial.</span>
          </div>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={() => go(2)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <button disabled={selectedSource === null} onClick={() => { if (selectedSource !== null) { onChooseSource(selectedSource); go(6); } }} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${cta}`}>Continue to Vault setup</button>
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

function Opportunities({ go, onSubmit, hasIntake, initialSource }: { go: (screenIndex: number) => void; onSubmit: (sourceIndex: number) => void; hasIntake: boolean; initialSource: number; onSourceSelect: (sourceIndex: number) => void }) {
  const [activeComposerTool, setActiveComposerTool] = useState<"context" | "workflow" | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [asked, setAsked] = useState(false);
  const [vaultCheckbox, setVaultCheckbox] = useState(true);
  const [filesAdded, setFilesAdded] = useState(false);
  const [vaultAdded, setVaultAdded] = useState(hasIntake);
  const runFirstWin = () => {
    setFilesAdded(true);
    setVaultAdded(true);
    onSubmit(initialSource);
    go(6);
  };
  const contextChips = hasIntake || vaultAdded
    ? ["Subject Property", "City row", "MSA benchmark", "Green Street report", "HelloData rent set"]
    : ["Vault empty", "No rows selected"];
  const promptText = "What should Cactus work on?";
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
            context={[filesAdded ? "7 files" : "Add +", "Vault", "Workflow"]}
            contextActions={{
              [filesAdded ? "7 files" : "Add +"]: openAdd,
              Vault: () => openComposerTool("context"),
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
function Spaces({ go }: { go: (screenIndex: number) => void }) {
  const [search, setSearch] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<(typeof workspaceLibrary)[number] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [divider, setDivider] = useState(52);
  const [spaceCreated, setSpaceCreated] = useState(false);
  const [assistantSpaceTitle, setAssistantSpaceTitle] = useState("Assistant-created Space");
  const [artifact, setArtifact] = useState("Canvas empty");
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
  const startAssistantSpace = (label = "Help me start a Space") => {
    setAssistantSpaceTitle(label);
    setArtifact(`Cactus is setting up: ${label}`);
    setSpaceCreated(true);
    setNewOpen(false);
  };

  if (selectedWorkspace || spaceCreated) {
    const title = selectedWorkspace?.title ?? assistantSpaceTitle;
    return (
      <div className="relative flex h-screen flex-col bg-[#f8f7f4] text-neutral-950">
        <TopBar title={title} search={search} onSearch={setSearch} searchPlaceholder="Search this Space…" cta="Share" onCta={() => setTeamOpen(true)}>
          <button onClick={() => { setSelectedWorkspace(null); setSpaceCreated(false); }} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">← Spaces</button>
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
              <div className="mt-24 grid min-h-[300px] place-items-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center text-sm text-neutral-500">
                <div><p className="font-medium text-neutral-900">{artifact}</p><button onClick={() => setArtifact("IC memo block started")} className="mt-4 rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Start artifact</button></div>
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
              <SharedComposer placeholder="Review this deal, build comps, draft an IC memo, prepare a lender package…" context={["Vault", "Files", "People", "Outputs"]} onSend={() => startAssistantSpace("Assistant-created Space")} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {[
                  "Review a deal",
                  "Build comps",
                  "Draft IC memo",
                  "Prepare lender package"
                ].map((item) => <button key={item} onClick={() => startAssistantSpace(item)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-600 shadow-sm hover:border-neutral-300 hover:bg-neutral-50">{item}</button>)}
              </div>
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
      {newOpen && <div onClick={() => setNewOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25 p-4"><div onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"><div className="mb-4 flex justify-between"><div><p className="text-sm font-medium">Ask Cactus</p><p className="mt-1 text-xs text-neutral-500">Describe the work. Cactus creates the Space.</p></div><button onClick={() => setNewOpen(false)}>×</button></div><SharedComposer compact placeholder="What should this Space help with?" context={["Vault", "Files", "People", "Outputs"]} onSend={() => startAssistantSpace("Assistant-created Space")} /><div className="mt-3 grid grid-cols-2 gap-2 text-xs">{["Review a deal", "Build comps", "Draft IC memo", "Prepare lender package"].map((item) => <button key={item} onClick={() => startAssistantSpace(item)} className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-neutral-600 hover:bg-neutral-50">{item}</button>)}</div></div></div>}
    </div>
  );
}

function TasksActivity({ go }: { go: (screenIndex: number) => void }) {
  const folders = ["Vault review", "Workflows", "Spaces", "Diligence", "Investor reporting", "Maintenance"];
  const stages = ["Inbox", "Doing", "Review", "Done"];
  const [folder, setFolder] = useState("Vault review");
  const [selectedTask, setSelectedTask] = useState<(typeof taskRows)[number] | null>(taskRows[0]);
  const [done, setDone] = useState<string[]>([]);
  const [taskOwners, setTaskOwners] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState(teamDirectorySeed);
  const [teamOpen, setTeamOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [notification, setNotification] = useState("Select a task, open the work, assign it, or move it forward.");
  const ownerFor = (task: (typeof taskRows)[number]) => taskOwners[task.title] ?? task.owner;
  const openMember = (initials: string) => { setSelectedMember(initials); setTeamOpen(true); };
  const folderFor = (task: (typeof taskRows)[number]) => task.type === "Vault review" ? "Vault review" : task.type === "Maintenance" ? "Maintenance" : task.source.includes("workflow") || task.source.includes("Workflow") ? "Workflows" : task.space.includes("Space") ? "Spaces" : task.role === "Investor" ? "Investor reporting" : "Diligence";
  const stageFor = (task: (typeof taskRows)[number]) => done.includes(task.title) || task.status === "Done" ? "Done" : task.status === "Blocked" || task.status === "Maintenance" ? "Review" : task.status === "Open" ? "Doing" : "Inbox";
  const shownTasks = taskRows.filter((task) => folderFor(task) === folder);
  const addMember = () => {
    if (teamMembers.some((member) => member.initials === "NP")) return;
    setTeamMembers((current) => [...current, { initials: "NP", name: "New partner", email: "new.partner@cactus.local", role: "External collaborator", access: "View" }]);
    setNotification("Invite email queued to new.partner@cactus.local.");
  };
  const removeMember = (initials: string) => {
    setTeamMembers((current) => current.filter((member) => member.initials !== initials));
    setNotification(`${initials} removed. Reassign open tasks if needed.`);
    setTeamOpen(false);
  };
  const assignTask = (task: (typeof taskRows)[number], initials: string) => {
    setTaskOwners((current) => ({ ...current, [task.title]: initials }));
    const member = teamMembers.find((item) => item.initials === initials);
    setNotification(`Email queued to ${member?.email ?? initials}: “${task.title}” was assigned.`);
  };
  const completeTask = (task: (typeof taskRows)[number]) => {
    setDone((current) => current.includes(task.title) ? current : [...current, task.title]);
    setNotification(`Completed: ${task.title}`);
  };
  const removeTask = (task: (typeof taskRows)[number]) => {
    setDone((current) => current.includes(task.title) ? current : [...current, task.title]);
    setNotification(`Removed from active queue: ${task.title}`);
  };
  const statusClass = (status: string) => status === "Blocked" || status === "Maintenance" ? "bg-amber-50 text-amber-700" : status === "Done" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600";

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-[-0.03em] text-neutral-900">Tasks</h1>
          <p className="mt-1 text-xs text-neutral-500">Open work, approve, assign, remove, or complete.</p>
        </div>
        <button onClick={() => { setSelectedTask(taskRows[1]); setNotification("New task created in Inbox."); }} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">+ Task</button>
      </header>

      <div className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-neutral-100 px-8 text-xs">
        {folders.map((item) => <button key={item} onClick={() => setFolder(item)} className={`rounded-md px-3 py-2 ${folder === item ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>{item}</button>)}
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(720px,1fr)_380px] overflow-hidden">
        <section className="overflow-auto p-6">
          <div className="mb-4 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{notification}</div>
          <div className="grid grid-cols-4 gap-3">
            {stages.map((stage) => (
              <div key={stage} className="min-h-[520px] rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                <div className="flex items-center justify-between px-2 py-2 text-xs"><span className="font-medium text-neutral-700">{stage}</span><span className="text-neutral-400">{shownTasks.filter((task) => stageFor(task) === stage).length}</span></div>
                <div className="space-y-2">
                  {shownTasks.filter((task) => stageFor(task) === stage).map((task) => {
                    const taskStatus = done.includes(task.title) ? "Done" : task.status;
                    return <button key={task.title} onClick={() => setSelectedTask(task)} className={`w-full rounded-lg border bg-white p-3 text-left text-xs hover:border-neutral-300 ${selectedTask?.title === task.title ? "border-neutral-950" : "border-neutral-200"}`}><span className="block text-sm font-medium text-neutral-950">{task.title}</span><span className="mt-1 block text-neutral-500">{task.space}</span><div className="mt-3 flex items-center justify-between"><button onClick={(event) => { event.stopPropagation(); openMember(ownerFor(task)); }} className="grid h-6 w-6 place-items-center rounded-full bg-neutral-900 text-[10px] text-white">{ownerFor(task)}</button><span className={`rounded-md px-2 py-1 text-[10px] ${statusClass(taskStatus)}`}>{taskStatus}</span></div></button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="overflow-auto border-l border-neutral-100 bg-neutral-50 p-5">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{selectedTask.title}</p><p className="mt-1 text-xs text-neutral-500">{selectedTask.source}</p></div><span className={`rounded-md px-2 py-1 text-[11px] ${statusClass(done.includes(selectedTask.title) ? "Done" : selectedTask.status)}`}>{done.includes(selectedTask.title) ? "Done" : selectedTask.status}</span></div>
                <p className="mt-4 text-xs font-medium text-neutral-400">Why this exists</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{selectedTask.evidence}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {[["Owner", ownerFor(selectedTask)], ["Folder", folderFor(selectedTask)], ["Due", selectedTask.due], ["Priority", selectedTask.priority]].map(([label, value]) => <div key={label} className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">{label}</p>{label === "Owner" ? <button onClick={() => openMember(value)} className="mt-1 font-medium text-neutral-800 underline-offset-2 hover:underline">{value}</button> : <p className="mt-1 font-medium text-neutral-800">{value}</p>}</div>)}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => go(7)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Open work</button>
                  <button onClick={() => completeTask(selectedTask)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Approve / complete</button>
                  <button onClick={() => removeTask(selectedTask)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Remove</button>
                  <button onClick={() => go(6)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Open Vault</button>
                  <button onClick={() => go(8)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Open workflow</button>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">Assign</p>
                <div className="mt-2 flex flex-wrap gap-2">{teamMembers.map((member) => <button key={member.initials} onClick={() => assignTask(selectedTask, member.initials)} className={`rounded-full px-3 py-1 text-xs ${ownerFor(selectedTask) === member.initials ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600"}`}>{member.initials}</button>)}</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">Context</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">{selectedTask.context.split(" + ").map((item) => <button key={item} onClick={() => go(6)} className="rounded-md bg-neutral-50 px-2 py-1.5 text-neutral-700 hover:bg-neutral-50">{item}</button>)}</div>
              </div>
              <details className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 shadow-sm"><summary className="cursor-pointer font-medium text-neutral-900">Activity / history</summary><div className="mt-3 space-y-2">{["Task created", "Evidence linked", `Assigned to ${ownerFor(selectedTask)}`, "Awaiting human action"].map((item) => <div key={item} className="rounded-md bg-neutral-50 px-3 py-2">{item}</div>)}</div></details>
            </div>
          ) : <div className="text-sm text-neutral-400">Select a task.</div>}
        </aside>
      </main>
      {teamOpen && <TeamMemberDrawer member={selectedMember} members={teamMembers} notice={notification} onClose={() => setTeamOpen(false)} onAdd={addMember} onRemove={removeMember} />}
    </div>
  );
}

function Workflows({ go }: { go: (screenIndex: number) => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "template">("all");
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
    .filter((workflow) => activeTab === "all" || (activeTab === "ongoing" ? workflow.mode === "Ongoing" : workflow.mode === "Template"))
    .filter((workflow) => !search || [workflow.name, workflow.group, workflow.trigger, workflow.output].join(" ").toLowerCase().includes(search.toLowerCase()));
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
  const createWorkflow = () => {
    setWorkflowCreated(true);
    setApprovalState(`${workflowName} created · review before enabling background runs`);
    setRunState(`${workflowName} created · ${workflowSteps.length} steps`);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setSelectedWorkflow(null);
  };
  const updateTab = (value: "all" | "ongoing" | "template") => {
    setActiveTab(value);
    setSelectedWorkflow(null);
  };

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <TopBar title="Workflows" search={search} onSearch={updateSearch} searchPlaceholder="Search workflows…" cta="New workflow" onCta={() => { setWorkflowCreated(false); setNewOpen(true); }} />

      <div className="flex h-11 shrink-0 items-center justify-between overflow-x-auto border-b border-neutral-100 px-4 lg:px-8">
        <div className="flex shrink-0 items-center gap-5 text-sm">
          {[["all", "All"], ["ongoing", "Running"], ["template", "Templates"]].map(([key, label]) => (
            <button key={key} onClick={() => updateTab(key as "all" | "ongoing" | "template")} className={`${activeTab === key ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}>{label}</button>
          ))}
          <button onClick={() => updateSearch("Review")} className="text-neutral-400 hover:text-neutral-700">Needs review</button>
          <button onClick={() => updateSearch("Archived")} className="text-neutral-400 hover:text-neutral-700">Archived</button>
        </div>
        {selectedIds.length > 0 && <button onClick={() => setRunState(`${selectedIds.length} selected · batch action ready`)} className="text-xs text-neutral-700">Actions</button>}
      </div>

      <main className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <div className="flex h-9 items-center border-b border-neutral-200 pr-8 text-xs font-medium text-neutral-500">
            <div className="grid w-8 place-items-center"><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : filtered.map((workflow) => workflow.name))} className="h-2.5 w-2.5 accent-black" /></div>
            <div className="w-[280px] px-2">Workflow</div>
            <div className="w-36">Group</div>
            <div className="w-28">Mode</div>
            <div className="w-[300px]">Trigger</div>
            <div className="w-[260px]">Output</div>
            <div className="w-8" />
          </div>
          {filtered.map((workflow) => (
            <div key={workflow.name} className="group flex h-12 items-center border-b border-neutral-50 pr-8 text-sm hover:bg-neutral-50">
              <div className="grid w-8 place-items-center"><input type="checkbox" checked={selectedIds.includes(workflow.name)} onChange={() => toggle(workflow.name)} className="h-2.5 w-2.5 accent-black" /></div>
              <button onClick={() => setSelectedWorkflow(workflow.name)} className="w-[280px] truncate px-2 text-left font-medium text-neutral-800">{workflow.name}</button>
              <div className="w-36 text-xs text-neutral-600">{workflow.group}</div>
              <div className="w-28"><span className={`rounded-md px-2 py-1 text-[11px] ${workflow.mode === "Ongoing" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>{workflow.mode}</span></div>
              <div className="w-[300px] truncate text-xs text-neutral-500">{workflow.trigger}</div>
              <div className="w-[260px] truncate text-xs text-neutral-400">{workflow.output}</div>
              <button onClick={() => setSelectedWorkflow(workflow.name)} className="w-8 text-right text-neutral-300">⋯</button>
            </div>
          ))}
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
          <div className="mt-5 flex gap-2"><button onClick={() => { setRunState(`${detail.name} run preview created`); setRunPanel({ title: detail.name, mode: "Run once", note: "Preview extracts context, drafts artifacts, and creates review tasks without enabling a schedule." }); }} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Run once</button><button onClick={() => { setRunState(`${detail.name} approval gate opened`); setRunPanel({ title: detail.name, mode: "Enable", note: "Approve cadence, connector scope, cost, destinations, and side effects before this becomes always-on." }); }} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Enable</button><button onClick={() => { setRunState(`${detail.name} Space ready`); setRunPanel({ title: detail.name, mode: "Open Space", note: "Creates a workroom with Vault context, tasks, artifacts, and chat so the team can execute/review." }); go(7); }} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Open Space</button></div>
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
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs"><button onClick={() => setRunPanel({ title: workflowName, mode: "Run once", note: "Runs this stack once and opens a review result." })} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Run once</button><button onClick={() => { setRunPanel({ title: workflowName, mode: "Enable", note: "Review cadence, scope, cost, and side effects before background runs." }); setApprovalState("Needs review before enable"); }} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Enable</button><button onClick={() => { createWorkflow(); go(7); }} className="rounded-md border border-neutral-200 px-2 py-2 text-neutral-600">Open Space</button></div>
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

function VaultTable({ hasIntake, go, sourceIndex, onCompleteIntake }: { hasIntake: boolean; go: (screenIndex: number) => void; sourceIndex: number; onCompleteIntake: (sourceIndex: number) => void }) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showColumnBuilder, setShowColumnBuilder] = useState(false);
  const [vaultView, setVaultView] = useState<"table" | "map">("table");
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditFocus, setAuditFocus] = useState<{ row: string; field: string; value: string } | null>(null);
  const [sourceCenterOpen, setSourceCenterOpen] = useState(false);
  const [, setSourceSetupStatus] = useState("Not started");
  const [selectedSetupMode, setSelectedSetupMode] = useState<"deal" | "portfolio" | "connected">(sourceSetupKeyByIndex[sourceIndex]);
  const [microVault, setMicroVault] = useState("Main Vault");
  const [aiSearch, setAiSearch] = useState("");
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
  const vaultRows = [
    { id: "subject", kind: "Property", location: "16 Enviro Dr\nMoncton, NB", yr1Noi: "$1.42M", entryCap: "5.2%", marketCap: "5.5%", oneBedEffectiveRent: "$1,485", oneBedMarketRent: "$1,560", noiGrowth: "3.4%", owner: "Cactus Capital" },
    { id: "comp-1", kind: "Comp", location: "Riverside Flats\nNashville, TN", yr1Noi: "$2.18M", entryCap: "5.0%", marketCap: "5.3%", oneBedEffectiveRent: "$1,610", oneBedMarketRent: "$1,675", noiGrowth: "3.1%", owner: "Banyan RE" },
    { id: "city", kind: "Market", location: "Nashville\nUrban core", yr1Noi: "", entryCap: "", marketCap: "5.4%", oneBedEffectiveRent: "$1,570", oneBedMarketRent: "$1,640", noiGrowth: "2.9%", owner: "" },
    { id: "msa", kind: "Market", location: "Nashville MSA", yr1Noi: "", entryCap: "", marketCap: "5.6%", oneBedEffectiveRent: "$1,505", oneBedMarketRent: "$1,590", noiGrowth: "2.6%", owner: "" },
    { id: "provider-report", kind: "Report", location: "Green Street\nSoutheast MF", yr1Noi: "", entryCap: "", marketCap: "5.7%", oneBedEffectiveRent: "", oneBedMarketRent: "$1,620", noiGrowth: "2.8%", owner: "" },
  ];
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
  const toggleRow = (id: string) => setSelectedRows((current) => current.includes(id) ? current.filter((row) => row !== id) : [...current, id]);
  const vaultSetupModes = [
    {
      key: "deal" as const,
      title: "Deal documents",
      subtitle: "Add a single deal package or diligence folder.",
      examples: "T-12, rent roll, occupancy report, management summary, OM, market report, debt quote · PDF / Excel / CSV",
      primary: "Choose deal files",
      scope: "One property or one deal room",
      maps: "Property row, deal row, source documents, financial endpoints, market-report rows",
      review: "Citations from PDF pages, Excel cells, CSV rows, and report sections before facts become trusted",
      chips: ["T-12", "Rent roll", "Occupancy", "Management summary", "OM", "Market report", "Excel model"],
    },
    {
      key: "portfolio" as const,
      title: "Portfolio data",
      subtitle: "Build a multi-property Vault from historicals and systems.",
      examples: "Property schedules, trailing financials over time, missing-address files, PM/accounting exports, banking feeds",
      primary: "Start portfolio setup",
      scope: "Multiple properties, historical periods, systems, and unresolved addresses",
      maps: "Portfolio rows, property rows, time-series snapshots, missing-address review queue, KPI columns",
      review: "Address matching, property dedupe, period/version history, and source-system confidence before writes",
      chips: ["Portfolio schedule", "Historical T-12s", "Yardi", "RealPage", "AppFolio", "Accounting", "Banking"],
    },
    {
      key: "connected" as const,
      title: "Inbox + drive",
      subtitle: "Let Cactus watch approved folders and senders.",
      examples: "Gmail, Outlook, Google Drive, OneDrive, broker senders, shared folders, deal rooms",
      primary: "Connect inbox or drive",
      scope: "Specific labels, folders, senders, domains, date ranges, and file types only",
      maps: "Incoming deal docs, broker contacts, deadlines, source folders, review queues, Space context",
      review: "New items enter review first; recurring sync, freshness, and permissions stay visible",
      chips: ["Gmail", "Outlook", "Google Drive", "OneDrive", "Deal rooms", "Broker senders"],
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
    setSourceSetupStatus(`${selectedSetup.title} submitted`);
    setSourceCenterOpen(false);
    onCompleteIntake(selectedSetupSourceIndex);
  };
  const sourceSetupModal = (
    <div className="fixed inset-0 z-50 bg-white text-neutral-950" onClick={() => setSourceCenterOpen(false)}>
      <section onClick={(event) => event.stopPropagation()} className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
          <div>
            <p className="text-sm font-semibold">Connect a source</p>
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
            <button onClick={() => setSourceSetupStatus("Advanced integrations hidden until needed")} className="mt-4 text-xs text-neutral-500 underline-offset-2 hover:underline">Need API, exports, or provider feeds?</button>
          </aside>

          <main className="overflow-auto p-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{selectedSetup.title}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedSetup.key === "connected" ? "Connect one account." : selectedSetup.key === "portfolio" ? "Import portfolio data." : "Add deal files."}</h2>
                </div>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">Review before Vault</span>
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
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                  <p className="text-base font-semibold text-neutral-950">{selectedSetup.key === "portfolio" ? "Drop portfolio schedules or exports here" : "Drop deal files here"}</p>
                  <p className="mt-1 text-sm text-neutral-500">{selectedSetup.examples}</p>
                  <button onClick={runSelectedSource} className="mt-5 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white">{selectedSetup.key === "portfolio" ? "Import portfolio data" : "Choose files"}</button>
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
                <div className="w-full max-w-[560px] rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Empty Vault</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">No sources connected</h2>
                  <div className="mt-4 inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">From onboarding · {selectedSetup.title}</div>

                  <div className="mt-5 flex items-center gap-2">
                    <button onClick={() => setSourceCenterOpen(true)} className="rounded-md bg-neutral-950 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800">{selectedSetup.primary}</button>
                    <button onClick={() => setSourceCenterOpen(true)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">Change source</button>
                  </div>
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
          <TopBar title="Vault" search={aiSearch} onSearch={setAiSearch} searchPlaceholder="Search Vault: owners, missing addresses, rent growth…" cta="Add source" onCta={() => setSourceCenterOpen(true)}>
            <select value={microVault} onChange={(event) => setMicroVault(event.target.value)} className="h-8 rounded-md border border-neutral-200 bg-white px-3 pr-8 text-xs text-neutral-600 outline-none">
              <option>Main Vault</option>
              <option>Selected rows folder</option>
              <option>Drive-time micro Vault</option>
              <option>Unmatched portfolio queue</option>
            </select>
            {microVault !== "Main Vault" && <button onClick={() => setMicroVault("Main Vault")} className="text-xs text-neutral-500">← Main</button>}
            <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
              <button onClick={() => setVaultView("table")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "table" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500"}`}>Table</button>
              <button onClick={() => setVaultView("map")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "map" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500"}`}>Map</button>
            </div>
            <button onClick={() => setAuditOpen(true)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Audit</button>
          </TopBar>

          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
            {microVault} · {sourceRun} · {aiSearch ? `${filteredVaultRows.length}/${vaultRows.length} rows` : "property, market, benchmark, provider-report rows"}
          </div>

          {vaultView === "table" ? (
          <div className="relative overflow-auto">
            <table className="min-w-[1380px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-white">
                  {columns.map((column, index) => (
                    <th key={column.key} style={{ minWidth: column.width }} className={`group relative h-[50px] border-r border-neutral-200 px-3 text-sm font-semibold leading-tight text-neutral-950 ${index === 0 ? "sticky left-0 z-20 bg-white" : ""}`}>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1 h-3 w-3 accent-black" aria-label={`select ${column.label}`} />
                        <span className="whitespace-pre-line">{column.label}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-normal text-neutral-400 opacity-0 transition group-hover:opacity-100">
                        <button className="rounded border border-neutral-200 px-1.5 py-0.5 hover:bg-neutral-50">Filter</button>
                        <button className="rounded border border-neutral-200 px-1.5 py-0.5 hover:bg-neutral-50">Sort</button>
                      </div>
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
          <div className="grid h-[calc(100%-56px)] grid-cols-[1fr_380px]">
            <div className="overflow-auto bg-neutral-100 p-6">
              <div className="mx-auto w-[520px] rounded-sm bg-white p-8 shadow-xl ring-1 ring-neutral-200">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3 text-xs text-neutral-500">
                  <span>16 Enviro Drive - Final.pdf</span><span>Page 4 / original PDF view</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-950">Property Summary</h3>
                <div className="mt-5 space-y-4 text-sm leading-7 text-neutral-700">
                  <p>The property located at <mark className="rounded bg-yellow-200 px-1">16 Enviro Drive, Moncton, New Brunswick</mark> is a self-storage facility serving the Moncton market.</p>
                  <p>Total rentable square footage is <mark className="rounded bg-blue-100 px-1">18,000</mark>. The improvements were built in <mark className="rounded bg-emerald-100 px-1">2021</mark> with stabilized operating history provided in the package.</p>
                  <div className="mt-5 rounded border border-neutral-300 p-3">
                    <div className="grid grid-cols-2 border-b border-neutral-200 py-1"><span>Total Units</span><mark className="bg-yellow-200 px-1 text-right">136</mark></div>
                    <div className="grid grid-cols-2 border-b border-neutral-200 py-1"><span>Property Valuation</span><mark className="bg-blue-100 px-1 text-right">$2,159,000</mark></div>
                    <div className="grid grid-cols-2 py-1"><span>NOI Growth</span><mark className="bg-emerald-100 px-1 text-right">3.4%</mark></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-l border-neutral-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Extracted fields</p>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">6 extracted</span>
              </div>
              <div className="space-y-2">
                {[
                  [auditFocus?.field ?? "Total Units", auditFocus?.value ?? "136", "Selected Vault cell · source citation", "96%"],
                  ["Address", "16 Enviro Drive, Moncton", "PDF · page 4", "99%"],
                  ["Property Type", "Self-storage facility", "PDF · page 4", "95%"],
                  ["Year Built", "2021", "PDF · page 4", "97%"],
                  ["Rentable Square Feet", "18,000", "PDF · page 4", "97%"],
                  ["Property Valuation", "$2,159,000", "PDF · page 4", "94%"],
                ].map(([field, value, source, confidence], index) => (
                  <button key={field} className={`w-full rounded-xl border p-3 text-left hover:bg-neutral-50 ${index === 0 ? "border-neutral-950 bg-neutral-50" : "border-neutral-200"}`}>
                    <div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-neutral-950">{field}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{confidence}</span></div>
                    <p className="mt-1 text-sm text-neutral-700">{value}</p>
                    <p className="mt-1 text-xs text-neutral-400">{source} · click to highlight in source</p>
                    <div className="mt-3 flex gap-2"><span className="rounded-md bg-neutral-950 px-2 py-1 text-[11px] text-white">Approve</span><span className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Edit</span><span className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Reject</span></div>
                  </button>
                ))}
              </div>
              <button onClick={() => setAuditOpen(false)} className="mt-5 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Approve reviewed facts</button>
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
        <div className="fixed bottom-6 left-1/2 z-40 w-[760px] -translate-x-1/2 rounded-2xl border-4 border-neutral-950 bg-white p-5 shadow-2xl">
          <textarea className="h-20 w-full resize-none bg-transparent text-xl font-medium text-neutral-950 outline-none placeholder:text-neutral-400" placeholder={`Ask about ${selectedCount} selected Vault row${selectedCount === 1 ? "" : "s"}…`} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2 text-sm">
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-950">▣ Vault</span>
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-950">⚡ Skills</span>
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-950">◎ Web</span>
              <button onClick={() => setMicroVault("Selected rows folder")} className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-950">Create folder</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-neutral-500">⌕</button>
              <button onClick={() => go(7)} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-950 text-lg text-white">↑</button>
            </div>
          </div>
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
  const [hasIntake, setHasIntake] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === "dark";
  const renderAppScreen = () => {
    if (active === 5) return <Opportunities go={setActive} onSubmit={(index) => { setSourceIndex(index); setHasIntake(true); }} hasIntake={hasIntake} initialSource={sourceIndex} onSourceSelect={setSourceIndex} />;
    if (active === 6) return <VaultTable go={setActive} hasIntake={hasIntake} sourceIndex={sourceIndex} onCompleteIntake={(index) => { setSourceIndex(index); setHasIntake(true); }} />;
    if (active === 7) return <Spaces go={setActive} />;
    if (active === 8) return <Workflows go={setActive} />;
    if (active === 9) return <TasksActivity go={setActive} />;
    return <Spaces go={setActive} />;
  };

  if (active === 0) return <><ThemeToggle theme={theme} setTheme={setTheme} /><Homepage onSignup={() => { setAuthMode("signup"); setActive(1); }} onSignin={() => { setAuthMode("signin"); setActive(1); }} /></>;
  if (active === 1) return <><ThemeToggle theme={theme} setTheme={setTheme} /><SignupScreen go={setActive} theme={theme} initialMode={authMode} /></>;
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
              {!sidebarCollapsed && <span><span className="block text-sm font-medium">Tyler</span><span className="block text-xs text-neutral-500">Multifamily Vault</span></span>}
            </button>
            {accountOpen && (
              <div className={`absolute bottom-16 ${sidebarCollapsed ? "left-2" : "left-3"} z-50 w-72 rounded-xl border border-neutral-200 bg-white p-2 text-sm text-neutral-950 shadow-2xl`}>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Workspace actions</p>
                </div>
                <button onClick={() => { setActive(6); setAccountOpen(false); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"><span>Manage integrations in Vault</span><span className="text-neutral-400">▣</span></button>
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
        <section className="min-w-0 flex-1 overflow-hidden">
          {renderAppScreen()}
        </section>
      </div>
    </main>
  );
}
