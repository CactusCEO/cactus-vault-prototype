"use client";

import { Fragment, useState } from "react";

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

const appNav = [
  ["Assistant", "✦", 5],
  ["Spaces", "□", 7],
  ["Vault", "▣", 6],
  ["Workflows", "▤", 8],
] as const;


const workflowLibrary = [
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

function AvatarStack({ team, size = "sm" }: { team: readonly string[] | string[]; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";
  return (
    <div className="flex -space-x-2">
      {team.slice(0, 4).map((person, index) => (
        <span key={`${person}-${index}`} className={`${dim} grid place-items-center rounded-full border-2 border-white bg-neutral-900 font-medium text-white shadow-sm`}>{person}</span>
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
          <section className={`rounded-2xl border p-3 ${isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-[#fbfaf7]"}`}>
            <div className="flex items-center gap-2">
              <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${cta}`}>AI</div>
              <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-white"}`}>
                <span className={`min-w-0 flex-1 truncate text-sm ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Ask which first source/job fits you, or ask how Cactus uses your Vault.</span>
                <button className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300" : "border-neutral-200 text-neutral-600"}`}>Ask AI</button>
                <button className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${isDark ? "border-white/10 text-neutral-300" : "border-neutral-200 text-neutral-600"}`}>🎙</button>
              </div>
            </div>
            <p className={`mt-3 text-sm ${muted}`}>Choose the first source to start your company Vault. During the trial, you can connect multiple sources, jobs, teammates, and workflows.</p>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm font-semibold">Step 3.1 · First source</p>
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
              <p className="text-sm font-semibold">Step 3.2 · First job</p>
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
              <div className={`flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed p-6 text-center ${isDark ? "border-white/10 text-neutral-500" : "border-neutral-200 text-neutral-400"}`}>
                <div><p className="text-sm font-medium">Step 3.2 unlocks after Step 3.1</p><p className="mt-1 text-xs">Pick the first source, then Cactus can suggest the first job.</p></div>
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
            <button onClick={() => go(5)} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>Continue to data intake</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Opportunities({ go, onSubmit, hasIntake, initialSource }: { go: (screenIndex: number) => void; onSubmit: (sourceIndex: number) => void; hasIntake: boolean; initialSource: number; onSourceSelect: (sourceIndex: number) => void }) {
  const [activeComposerTool, setActiveComposerTool] = useState<"context" | "workflow" | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [asked, setAsked] = useState(false);
  const [vaultCheckbox, setVaultCheckbox] = useState(true);
  const [filesAdded, setFilesAdded] = useState(false);
  const [vaultAdded, setVaultAdded] = useState(hasIntake);
  const [listening, setListening] = useState(false);
  const runFirstWin = () => {
    setFilesAdded(true);
    setVaultAdded(true);
    onSubmit(initialSource);
    go(6);
  };
  const contextChips = hasIntake || vaultAdded
    ? ["Subject Property", "City row", "MSA benchmark", "Green Street report", "HelloData rent set"]
    : ["Vault empty", "No rows selected"];
  const promptText = enhanced
    ? "Review the files/context I attach, create a Space if this is durable work, and call a workflow when the request repeats."
    : "Ask Cactus to review a deal, create a Space, build a Vault datapoint, or run a saved CRE workflow…";
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
      <header className="flex h-12 items-center justify-end border-b border-neutral-100 px-8">
        <div className="flex items-center gap-2">
          <button onClick={() => openComposerTool("context")} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Context</button>
          <button onClick={() => openComposerTool("workflow")} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Workflow</button>
          <button onClick={openAdd} className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white">Add +</button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 pb-10">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#2b0052] text-sm font-semibold text-white">C</div>
            <h1 className="font-serif text-4xl font-light tracking-[-0.03em] text-neutral-900">Hi, Tyler</h1>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <textarea className="h-32 w-full resize-none px-3 py-3 text-[15px] outline-none placeholder:text-neutral-400" placeholder={promptText} defaultValue={enhanced ? promptText : ""} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-2 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={openAdd} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Add +</button>
                <button onClick={() => openComposerTool("context")} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">▣ Context</button>
                <button onClick={() => openComposerTool("workflow")} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">▤ Workflow</button>
                <button onClick={() => setEnhanced(true)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">Enhance prompt</button>
                {filesAdded && <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">7 files attached</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setListening((value) => !value)} aria-label="Talk to Cactus" className={`relative grid h-9 w-9 place-items-center rounded-full border text-sm ${listening ? "border-[#2b0052] bg-[#fbf4ff] text-[#2b0052] shadow-[0_0_0_4px_rgba(43,0,82,0.08)]" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>🎙{listening && <span className="absolute -bottom-1 h-1.5 w-8 rounded-full bg-[#2b0052]/50" />}</button>
                <button onClick={() => { setAsked(true); go(7); }} aria-label="Send to Cactus" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-950 text-sm font-medium text-white">↗</button>
              </div>
            </div>
          </div>

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
                <button onClick={() => go(6)} className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-[#2b0052]">Open Vault</button>
              </div>
              <input className="mb-3 h-8 w-full rounded-md border border-neutral-200 px-3 text-xs outline-none placeholder:text-neutral-300" placeholder="Search properties, micro-vaults, reports, owners, markets…" />
              <div className="grid grid-cols-2 gap-2">
                {[...contextChips.slice(0, 4), "Drive-time micro Vault", "Unmatched portfolio queue"].map((chip) => <button key={chip} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs text-neutral-700 hover:border-[#2b0052]"><span>{chip}</span><span className="text-neutral-400">+</span></button>)}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs"><span className="text-neutral-500">3 Vault rows · 1 report · latest context</span><button onClick={() => setActiveComposerTool(null)} className="rounded-md bg-neutral-950 px-3 py-2 font-medium text-white">Apply context</button></div>
            </div>
          )}

          {activeComposerTool === "workflow" && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-700">Call a saved workflow from Assistant</p>
                <button onClick={() => go(8)} className="text-xs text-[#2b0052]">Open Workflows</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {workflowLibrary.slice(0, 8).map((workflow) => <button key={workflow.name} onClick={() => setAsked(true)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-xs hover:bg-neutral-50"><span className="font-medium text-neutral-800">{workflow.name}</span><span className="ml-2 text-neutral-400">{workflow.mode}</span><span className="mt-1 block text-neutral-500">{workflow.output}</span></button>)}
              </div>
            </div>
          )}
        </div>
      </main>

      {sourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25">
          <div className="w-[620px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
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
  const [view, setView] = useState<"grid" | "list" | "map">("list");
  const [selectedWorkspace, setSelectedWorkspace] = useState<(typeof workspaceLibrary)[number] | null>(null);
  const [spaceTab, setSpaceTab] = useState<"work" | "playground" | "outputs">("work");
  const [shareOpen, setShareOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [scenario, setScenario] = useState("Base case");
  const [outputReady, setOutputReady] = useState(false);
  const [newContext, setNewContext] = useState("Selected Vault rows");
  const [newMode, setNewMode] = useState("Latest Vault context");
  const viewButtons: Array<["grid" | "list" | "map", string]> = [["list", "List"], ["grid", "Grid"], ["map", "Map"]];
  const currentTeam = selectedWorkspace?.team ?? ["TS", "AK", "MR"];

  if (selectedWorkspace) {
    return (
      <div className="relative flex h-screen flex-col bg-[#f7f5f0] text-neutral-950">
        <header className="flex h-14 items-center justify-between border-b border-neutral-100 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedWorkspace(null)} className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100">← Spaces</button>
            <div>
              <p className="text-sm font-medium">{selectedWorkspace.title}</p>
              <p className="text-xs text-neutral-500">{selectedWorkspace.address} · {selectedWorkspace.market}</p>
            </div>
            <AvatarStack team={currentTeam} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(6)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600">Vault context</button>
            <button onClick={() => go(8)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600">Automate</button>
            <button onClick={() => setShareOpen(true)} className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white">Share</button>
          </div>
        </header>

        <div className="flex h-11 items-center gap-5 border-b border-neutral-100 px-6 text-sm">
          {[["work", "Work"], ["playground", "Playground"], ["outputs", "Outputs"]].map(([key, label]) => (
            <button key={key} onClick={() => setSpaceTab(key as "work" | "playground" | "outputs")} className={`${spaceTab === key ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}>{label}</button>
          ))}
        </div>

        <main className="grid min-h-0 flex-1 grid-cols-[minmax(420px,0.92fr)_minmax(500px,1.08fr)] overflow-hidden bg-[#f7f5f0]">
          <section className="overflow-auto border-r border-neutral-200/70 px-7 py-6">
            {spaceTab === "work" && (
              <div className="mx-auto max-w-2xl space-y-4">
                <div className="rounded-2xl border border-neutral-200 bg-[linear-gradient(180deg,#ffffff,#fbfaf7)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Space workroom</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Ask, verify, and produce from one context</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">Left side is the work stream and chat. Right side is the output canvas for documents, maps, results, tasks, and context.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><p className="text-sm font-medium">Work stream</p><button onClick={() => go(8)} className="text-xs text-neutral-500">Save as workflow</button></div>
                  {[
                    ["Scope the Space", "Vault rows, source files, people, and update mode are set.", "Context"],
                    ["Verify T12 / rent roll facts", "Open source audit before facts become durable Vault data.", taskDone ? "Done" : "Review"],
                    ["Run comp finder + market rent survey", "Pull sales/rent comps and explain which comps Cactus weighted.", "Open"],
                    ["Clean T-12 and benchmark expenses", "Normalize one-time items, owner-paid utilities, reserves, and opex categories.", "Queued"],
                    ["Draft recommendation and diligence asks", "Create IC memo/BOV/debt memo sections from verified facts only.", "Ready"],
                  ].map(([title, note, status], index) => (
                    <button key={title} onClick={() => index === 1 && setTaskDone(true)} className="flex w-full items-start justify-between gap-4 border-b border-neutral-50 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50">
                      <span><span className="block text-sm font-medium text-neutral-900">{title}</span><span className="mt-1 block text-xs text-neutral-500">{note}</span></span>
                      <span className={`rounded-md px-2 py-1 text-[11px] ${status === "Done" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{status}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                  <textarea className="h-24 w-full resize-none text-sm outline-none placeholder:text-neutral-400" placeholder="Chat with this Space. Use @AK to assign a person or /task, /draft, /map, /workflow to create an action…" />
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div className="flex gap-2 text-xs text-neutral-500"><span className="rounded-md border border-neutral-200 px-2 py-1">@person</span><span className="rounded-md border border-neutral-200 px-2 py-1">/task</span><span className="rounded-md border border-neutral-200 px-2 py-1">/draft</span><span className="rounded-md border border-neutral-200 px-2 py-1">/workflow</span></div>
                    <button onClick={() => setTaskDone(true)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Send</button>
                  </div>
                </div>
              </div>
            )}

            {spaceTab === "playground" && (
              <div className="mx-auto max-w-3xl">
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                  <p className="text-sm font-medium">Playground</p>
                  <p className="mt-1 text-xs text-neutral-500">Run scenario, sensitivity, and what-needs-to-change work against verified Vault facts and market benchmarks.</p>
                  <div className="mt-5 flex flex-wrap gap-2">{["Base case", "Seller case", "Downside", "$1.3M price cut", "Debt quote stress", "Rent growth miss"].map((item) => <button key={item} onClick={() => setScenario(item)} className={`rounded-md border px-3 py-2 text-xs ${scenario === item ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-600"}`}>{item}</button>)}</div>
                  <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200"><table className="w-full text-left text-sm"><tbody>{[["Scenario", scenario], ["Cactus base", scenario === "$1.3M price cut" ? "16.1% IRR" : "12.4% IRR"], ["Needed", scenario === "$1.3M price cut" ? "Meets hurdle" : "$1.3M price cut or +9% NOI"], ["Evidence", "T12 + rent comps + market row + debt quote"], ["Next", "Save scenario to Vault or output"]].map(([label, value]) => <tr key={label} className="border-b border-neutral-100 last:border-b-0"><td className="w-40 bg-neutral-50 px-3 py-3 text-xs text-neutral-500">{label}</td><td className="px-3 py-3 font-medium">{value}</td></tr>)}</tbody></table></div>
                </div>
              </div>
            )}

            {spaceTab === "outputs" && (
              <div className="mx-auto max-w-3xl">
                <div className="rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><p className="text-sm font-medium">Outputs</p><div className="flex gap-2"><button onClick={() => setOutputReady(true)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Generate IC memo</button><button onClick={() => go(8)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Automate output</button></div></div>
                  {[...outputArtifacts, ["BOV", "Broker valuation package", "Template", "Selected comps"], ["Debt quote table", "Lender comparison", "Queued", "Capital workflow"]].map(([type, name, status, context]) => <button key={`${type}-${name}`} className="flex w-full items-center justify-between border-b border-neutral-50 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50"><span><span className="block text-sm font-medium">{type}</span><span className="block text-xs text-neutral-500">{name} · {context}</span></span><span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{outputReady && type === "IC memo" ? "Draft created" : status}</span></button>)}
                </div>
              </div>
            )}
          </section>

          <aside className="overflow-auto bg-[linear-gradient(180deg,#fbfaf7,#f3f0ea)] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Output canvas</p>
              <div className="flex rounded-md border border-neutral-200 bg-white p-0.5 text-xs">{["Docs", "Map", "Results"].map((item) => <button key={item} className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-50">{item}</button>)}</div>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500">Document / output preview</p>
              <div className="mt-3 space-y-2">{["IC memo draft", "T-12 audit table", "Rent comp map", "Diligence request list"].map((row) => <button key={row} onClick={() => row.includes("map") ? go(6) : setOutputReady(true)} className="block w-full rounded-md border border-neutral-100 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50">{row}</button>)}</div>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500">Assigned tasks</p>
              <div className="mt-3 space-y-2 text-xs">{[["@AK", "Verify rent roll anomalies", taskDone ? "Done" : "Open"], ["@MR", "Pull 15-minute drive-time comps", "Queued"], ["@TS", "Approve draft lender reply", "Review"]].map(([person, task, status]) => <button key={task} onClick={() => setTaskDone(true)} className="flex w-full items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-left"><span><span className="font-medium">{person}</span> {task}</span><span className="text-neutral-400">{status}</span></button>)}</div>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-neutral-500">Context</p><div className="mt-3 flex flex-wrap gap-2">{['Subject Property', 'Nashville MSA', 'Green Street report', 'T12 + rent roll', 'HelloData comps'].map((row) => <button key={row} onClick={() => go(6)} className="rounded-md bg-neutral-50 px-2 py-1.5 text-xs text-neutral-700 hover:bg-[#fbf4ff]">{row}</button>)}</div><button onClick={() => go(6)} className="mt-3 rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">+ Add Vault rows</button></div>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-neutral-500">People</p><div className="mt-3 flex items-center justify-between"><AvatarStack team={currentTeam} size="md" /><button onClick={() => setShareOpen(true)} className="text-xs text-neutral-600">Manage</button></div></div>
          </aside>
        </main>
        {shareOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25"><div className="w-96 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl"><div className="flex items-center justify-between"><p className="text-sm font-medium">Share Space</p><button onClick={() => setShareOpen(false)}>×</button></div><div className="mt-4 space-y-2 text-sm">{[["TS", "Tyler Sellars", "Edit"], ["AK", "Acquisitions", "Edit"], ["MR", "Market research", "View"], ["JL", "External lender", "No access"]].map(([initials, name, access]) => <button key={name} className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left"><span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-[10px] text-white">{initials}</span>{name}</span><span>{access}</span></button>)}</div><button onClick={() => setShareOpen(false)} className="mt-4 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Copy share link</button></div></div>}
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-white text-neutral-950">
      <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-6">
        <h2 className="font-serif text-2xl font-medium tracking-[-0.03em]">Spaces</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
            {viewButtons.map(([key, label]) => <button key={key} onClick={() => setView(key)} className={`rounded px-3 py-1.5 text-xs ${view === key ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500"}`}>{label}</button>)}
          </div>
          <button onClick={() => setNewOpen(true)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">+ New Space</button>
        </div>
      </div>
      <main className="overflow-auto p-6">
        {view === "list" && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-neutral-100 text-xs text-neutral-400"><tr>{["Name", "Type", "Location", "People", "Updated", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{workspaceLibrary.map((workspace) => <tr key={workspace.title} onClick={() => setSelectedWorkspace(workspace)} className="cursor-pointer border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50"><td className="px-4 py-3 font-medium text-neutral-950">{workspace.title}</td><td className="px-4 py-3 text-neutral-500">{workspace.type}</td><td className="px-4 py-3 text-neutral-500">{workspace.address}</td><td className="px-4 py-3"><AvatarStack team={workspace.team} /></td><td className="px-4 py-3 text-neutral-500">{workspace.updated}</td><td className="px-4 py-3"><span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{workspace.status}</span></td></tr>)}</tbody></table></div>
        )}
        {view === "grid" && (
          <div className="grid grid-cols-3 gap-4">{workspaceLibrary.map((workspace) => <button key={workspace.title} onClick={() => setSelectedWorkspace(workspace)} className="rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{workspace.title}</p><AvatarStack team={workspace.team} /></div><p className="mt-2 text-xs text-neutral-500">{workspace.address}<br />{workspace.market}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs text-neutral-400">{workspace.updated}</span><span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{workspace.status}</span></div></button>)}</div>
        )}
        {view === "map" && (
          <div className="grid min-h-[560px] grid-cols-[1fr_340px] gap-4"><div className="relative rounded-xl border border-neutral-200 bg-[#eef0eb]"><div className="absolute left-5 top-5 rounded-md bg-white px-3 py-2 text-xs text-neutral-600">Spaces map</div>{workspaceLibrary.map((workspace, index) => <button key={workspace.title} onClick={() => setSelectedWorkspace(workspace)} className={`absolute ${workspace.pin}`}><span className="grid h-8 w-8 place-items-center rounded-full bg-[#2b0052] text-xs text-white">{index + 1}</span></button>)}</div><div className="overflow-auto rounded-xl border border-neutral-200 bg-white p-3">{workspaceLibrary.map((workspace) => <button key={`side-${workspace.title}`} onClick={() => setSelectedWorkspace(workspace)} className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-neutral-50"><span><span className="block text-sm font-medium">{workspace.title}</span><span className="text-xs text-neutral-500">{workspace.market}</span></span><AvatarStack team={workspace.team} /></button>)}</div></div>
        )}
      </main>
      {newOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/25"><div className="w-[560px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"><div className="flex justify-between"><div><p className="text-sm font-medium">New Space</p><p className="mt-1 text-xs text-neutral-500">Simple workroom setup. Start blank, from Vault context, or from a workflow.</p></div><button onClick={() => setNewOpen(false)}>×</button></div><input className="mt-4 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" defaultValue="Riverside Flats Deal Review" /><p className="mt-4 text-xs font-medium text-neutral-500">Start with</p><div className="mt-2 grid grid-cols-2 gap-2 text-xs">{["Selected Vault rows", "Vault folder", "Uploaded source", "Saved workflow", "Blank Space", "Market watch"].map((item)=><button key={item} onClick={() => setNewContext(item)} className={`rounded-lg border px-3 py-3 text-left hover:bg-neutral-50 ${newContext===item ? "border-neutral-950 bg-neutral-50" : "border-neutral-200"}`}>{item}</button>)}</div><p className="mt-4 text-xs font-medium text-neutral-500">Context mode</p><div className="mt-2 flex gap-2 text-xs">{["Frozen snapshot", "Latest Vault context", "Auto-updating"].map((mode)=><button key={mode} onClick={() => setNewMode(mode)} className={`rounded-md border px-3 py-2 ${newMode===mode ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-600"}`}>{mode}</button>)}</div><div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2"><span className="text-xs text-neutral-500">Collaborators</span><AvatarStack team={["TS", "AK", "MR"]} /></div><button onClick={() => { setSelectedWorkspace(workspaceLibrary[0]); setNewOpen(false); }} className="mt-4 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Create Space from {newContext}</button></div></div>}
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
  const [newMode, setNewMode] = useState("Ongoing");
  const [newStart, setNewStart] = useState("Assistant command");
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-8">
        <h1 className="font-serif text-2xl font-medium tracking-[-0.03em] text-neutral-900">Workflows</h1>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(event) => updateSearch(event.target.value)} className="h-8 w-64 rounded-md border border-neutral-200 px-3 text-sm outline-none placeholder:text-neutral-300" placeholder="Search OM parser, BOV, submarket pulse…" />
          <button onClick={() => setNewOpen(true)} className="grid h-8 w-8 place-items-center rounded-md text-lg text-neutral-500 hover:bg-neutral-100">+</button>
        </div>
      </header>

      <div className="flex h-11 shrink-0 items-center justify-between border-b border-neutral-100 px-8">
        <div className="flex items-center gap-5 text-sm">
          {[["all", "All"], ["ongoing", "Ongoing automations"], ["template", "One-off templates"]].map(([key, label]) => (
            <button key={key} onClick={() => updateTab(key as "all" | "ongoing" | "template")} className={`${activeTab === key ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}>{label}</button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          {selectedIds.length > 0 && <button onClick={() => setRunState(`${selectedIds.length} selected · batch action ready`)} className="text-neutral-700">Actions</button>}
          <button onClick={() => updateSearch("Sourcing")}>Sourcing</button>
          <button onClick={() => updateSearch("Underwriting")}>Underwriting</button>
          <button onClick={() => updateSearch("Market Intel")}>Market intel</button>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-[1080px]">
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

      <div className="border-t border-neutral-100 px-8 py-3 text-xs text-neutral-400">
        {runState}. Workflows can be called from Assistant, attached to a Space, or run on top of selected Vault rows.
        <button onClick={() => go(5)} className="ml-3 text-neutral-700">Open Assistant</button>
        <button onClick={() => go(6)} className="ml-3 text-neutral-700">Choose Vault rows</button>
      </div>
      <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-8 py-2 text-xs text-amber-800">
        <span className="font-medium">Maintenance</span>
        {maintenanceTasks.map(([title, source, action]) => (
          <button key={title} onClick={() => setMaintenanceOpen(true)} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-left text-amber-800 hover:bg-amber-100">
            {title} <span className="text-amber-500">· {source} · {action}</span>
          </button>
        ))}
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
          <div className="mt-5 flex gap-2"><button onClick={() => setRunState(`${detail.name} run queued`)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Run once</button><button onClick={() => setRunState(`${detail.name} automation enabled`)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Enable</button><button onClick={() => go(7)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600">Open Space</button></div>
        </aside>
      )}

      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-[560px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
            <div className="flex justify-between"><div><p className="text-sm font-medium">New workflow</p><p className="mt-1 text-xs text-neutral-500">Save repeatable CRE work as a one-off template or ongoing automation.</p></div><button onClick={() => setNewOpen(false)}>×</button></div>
            <input className="mt-4 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" defaultValue="Weekly multifamily deal intake" />
            <p className="mt-4 text-xs font-medium text-neutral-500">Mode</p><div className="mt-2 flex gap-2 text-xs">{["Ongoing", "Template"].map((mode)=><button key={mode} onClick={() => setNewMode(mode)} className={`rounded-md border px-3 py-2 ${newMode===mode ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-600"}`}>{mode}</button>)}</div>
            <p className="mt-4 text-xs font-medium text-neutral-500">Trigger / entry point</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">{[
              ["Assistant command", "User asks: run this workflow"],
              ["Selected Vault rows", "Runs on chosen properties/markets"],
              ["Space", "Runs inside a workroom"],
              ["Source watcher", "Email, scraper, Drive, deal room"],
              ["Schedule", "Daily/weekly/monthly"],
              ["Blank", "Build from scratch"]
            ].map(([item, note])=><button key={item} onClick={() => setNewStart(item)} className={`rounded-lg border px-3 py-2 text-left hover:bg-neutral-50 ${newStart===item ? "border-neutral-950 bg-neutral-50" : "border-neutral-200"}`}><span className="block font-medium">{item}</span><span className="mt-1 block text-neutral-400">{note}</span></button>)}</div>
            <p className="mt-4 text-xs font-medium text-neutral-500">Steps</p>
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 text-xs">
              {[
                ["1", "Extract email + attachments", "approved sender/folder only"],
                ["2", "Prompt + analyze", "use Vault rows and source citations"],
                ["3", "Draft email reply", "human approval required"],
                ["4", "Create task / update Space", "owner, due date, maintenance state"]
              ].map(([num, title, tag]) => <div key={num} className="flex items-center gap-3 border-b border-neutral-100 px-3 py-2 last:border-b-0"><span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-950 text-[10px] text-white">{num}</span><span className="font-medium">{title}</span><span className="ml-auto text-neutral-400">{tag}</span></div>)}
            </div>
            <button onClick={() => { setNewOpen(false); setRunState(`${newMode} workflow draft created from ${newStart} · 4 steps · task queue ready`); }} className="mt-4 w-full rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Save workflow template</button>
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
  const [templateOpen, setTemplateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sourceCenterOpen, setSourceCenterOpen] = useState(false);
  const [sourceSetupStatus, setSourceSetupStatus] = useState("Not started");
  const [selectedSetupMode, setSelectedSetupMode] = useState<"deal" | "portfolio" | "connected">(sourceSetupKeyByIndex[sourceIndex]);
  const [microVault, setMicroVault] = useState("Main Vault");
  const [aiSearch, setAiSearch] = useState("");
  const [columns, setColumns] = useState([
    { key: "location", label: "Location", prompt: "Identify the property or market geography.", format: "Text", width: 210 },
    { key: "client", label: "Client Name", prompt: "Extract the client or source relationship if available.", format: "Text", width: 165 },
    { key: "irr", label: "IRR Risk Adjusted", prompt: "Return risk-adjusted IRR from the model or Cactus base case.", format: "Percent", width: 165 },
    { key: "cap", label: "Cap Rate Nominal", prompt: "Extract or benchmark the nominal cap rate.", format: "Percent", width: 165 },
    { key: "noi", label: "NOI Growth\n(Asset-class filtered)", prompt: "Extract NOI growth for the matching geography and asset class.", format: "Percent", width: 185 },
    { key: "demand", label: "Demand Growth\n(Asset-class filtered)", prompt: "Extract demand growth for the matching geography and asset class.", format: "Percent", width: 185 },
    { key: "climate", label: "Climate Risk", prompt: "Summarize flood, disaster, and insurance risk from approved sources.", format: "Score", width: 165 },
    { key: "rent", label: "Avg 1BR Rent\n(Class A)", prompt: "Extract average monthly 1BR rent for Class A multifamily properties in the subject ZIP code. Return $X,XXX (±Y% · n=Z).", format: "Number", width: 185 },
  ]);
  const vaultRows = [
    { id: "subject", kind: "Property", location: "Subject Property\n(geo-mapped)", client: "Fidelity\nInvestments", irr: "8.6%", cap: "5.1%", noi: "3.4%", demand: "2.8%", climate: "Low", rent: "$1,510 (±4% · n=22)" },
    { id: "city", kind: "Market", location: "City", client: "", irr: "", cap: "", noi: "3.1%", demand: "2.5%", climate: "Medium", rent: "$1,460 (±4% · n=22)" },
    { id: "msa", kind: "Market", location: "MSA", client: "", irr: "", cap: "", noi: "2.8%", demand: "2.2%", climate: "Medium", rent: "$1,420 (±4% · n=22)" },
    { id: "national", kind: "Benchmark", location: "U.S. National\n(same asset class)", client: "", irr: "", cap: "", noi: "2.2%", demand: "1.8%", climate: "Varies", rent: "$1,310 (±4% · n=22)" },
    { id: "provider-report", kind: "Report", location: "Green Street report\n(Southeast MF)", client: "", irr: "", cap: "5.4%", noi: "2.9%", demand: "2.1%", climate: "Source", rent: "" },
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
      primary: "Approve read-only scope",
      scope: "Specific labels, folders, senders, domains, date ranges, and file types only",
      maps: "Incoming deal docs, broker contacts, deadlines, source folders, review queues, Space context",
      review: "New items enter review first; recurring sync, freshness, and permissions stay visible",
      chips: ["Gmail", "Outlook", "Google Drive", "OneDrive", "Deal rooms", "Broker senders"],
    },
  ];
  const selectedSetup = vaultSetupModes.find((mode) => mode.key === selectedSetupMode) ?? vaultSetupModes[0];
  const addColumn = () => {
    setColumns((current) => [...current, { key: `custom-${current.length}`, label: "YR 1 NOI", prompt: "Extract Year 1 NOI from the selected documents or model and cite the source line.", format: "Currency", width: 170 }]);
    setShowColumnBuilder(false);
  };
  const resizeColumn = (key: string) => setColumns((current) => current.map((column) => column.key === key ? { ...column, width: column.width >= 240 ? 140 : column.width + 30 } : column));
  const selectedSetupSourceIndex = selectedSetup.key === "deal" ? 0 : selectedSetup.key === "connected" ? 1 : 2;
  const runSelectedSource = () => {
    setSourceSetupStatus(`${selectedSetup.title} submitted`);
    setSourceCenterOpen(false);
    onCompleteIntake(selectedSetupSourceIndex);
  };
  const sourceSetupModal = (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-neutral-950/20">
      <aside className="flex h-full w-[520px] flex-col border-l border-neutral-200 bg-white text-neutral-950 shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Create your Vault</p>
            <p className="mt-1 text-xs text-neutral-500">One source path, one review queue, then Cactus writes approved rows and endpoint columns.</p>
          </div>
          <button onClick={() => setSourceCenterOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Selected from onboarding</p>
          <div className="mt-3 rounded-xl border border-neutral-950 bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em]">{selectedSetup.title}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">{selectedSetup.examples}</p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-[11px] text-neutral-500">{sourceSetupStatus}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {vaultSetupModes.map((mode) => (
              <button key={mode.key} onClick={() => { setSelectedSetupMode(mode.key); setSourceSetupStatus("Not started"); }} className={`rounded-md border px-2.5 py-1.5 text-xs ${selectedSetupMode === mode.key ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}>{mode.title}</button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200">
            {[
              ["Choose", selectedSetup.primary, selectedSetup.scope],
              ["Review", "Cactus shows the queue first", selectedSetup.review],
              ["Vault", "Rows + endpoint columns", selectedSetup.maps],
            ].map(([label, title, note]) => (
              <button key={label} onClick={() => setSourceSetupStatus(`${label} ready`)} className="flex w-full gap-3 border-b border-neutral-100 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50">
                <span className="mt-0.5 w-14 shrink-0 text-xs font-medium text-neutral-400">{label}</span>
                <span>
                  <span className="block text-sm font-medium text-neutral-950">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">{note}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">
            <p className="font-medium text-neutral-950">Review before trust</p>
            <p className="mt-1">Every value keeps file/page/cell/email provenance and stays untrusted until approved, edited, or rejected.</p>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-white p-4 text-center">
            <p className="text-sm font-medium text-neutral-950">{selectedSetup.primary}</p>
            <p className="mt-1 text-xs text-neutral-500">Prototype action: create the first source and open the extracting Vault.</p>
            <button onClick={runSelectedSource} className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-xs font-medium text-white">Submit to Vault</button>
          </div>
        </div>
      </aside>
    </div>
  );

  if (!hasIntake) {
    return (
      <div className="flex h-screen flex-col bg-white text-neutral-950">
        <header className="flex h-14 items-center justify-between border-b border-neutral-100 px-6">
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-[-0.03em]">Vault</h1>
            <p className="text-xs text-neutral-500">Cactus Capital Partners · Multifamily · no sources connected</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSourceCenterOpen(true)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">Change path</button>
            <button onClick={() => setSourceCenterOpen(true)} className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">{selectedSetup.primary}</button>
          </div>
        </header>

        <div className="flex h-10 items-center justify-between border-b border-neutral-100 px-6 text-xs text-neutral-500">
          <span>Selected in onboarding: <strong className="font-medium text-neutral-800">{sourceTitle}</strong></span>
          <span>Source → Review queue → Vault rows/columns → Spaces/outputs</span>
        </div>

        <main className="flex min-h-0 flex-1 flex-col p-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="grid h-9 grid-cols-[220px_160px_160px_160px_1fr] border-b border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-neutral-400">
              {['Entity / source', 'Address / market', 'Owner', 'NOI', 'Source status'].map((heading) => <div key={heading} className="flex items-center border-r border-neutral-200 last:border-r-0">{heading}</div>)}
            </div>
            <div className="relative min-h-[430px] bg-white">
              {Array.from({ length: 8 }).map((_, row) => (
                <div key={row} className="grid h-12 grid-cols-[220px_160px_160px_160px_1fr] border-b border-neutral-50 px-3">
                  {Array.from({ length: 5 }).map((__, col) => <div key={col} className="flex items-center border-r border-neutral-50 last:border-r-0"><span className="h-4 w-24 rounded bg-neutral-100" /></div>)}
                </div>
              ))}
              <section className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="w-full max-w-[520px] rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Empty Vault</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{selectedSetup.primary}</h2>
                      <p className="mt-2 text-sm leading-6 text-neutral-500">Selected in onboarding: <span className="font-medium text-neutral-800">{sourceTitle}</span>. Start this path now; review/audit happens before facts become trusted Vault data.</p>
                    </div>
                    <button onClick={() => setSourceCenterOpen(true)} className="shrink-0 rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">Change</button>
                  </div>
                  <button onClick={runSelectedSource} className="mt-5 flex w-full items-center justify-between rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-left hover:bg-neutral-100">
                    <span><span className="block text-sm font-medium text-neutral-950">{selectedSetup.key === "deal" ? "Drop deal documents or choose files" : selectedSetup.key === "portfolio" ? "Upload portfolio schedule or start address matching" : "Approve read-only email/drive scope"}</span><span className="mt-1 block text-xs text-neutral-500">{selectedSetup.chips.slice(0, 4).join(" · ")}</span></span>
                    <span className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white">{selectedSetup.primary}</span>
                  </button>
                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span>Next: review queue → Vault rows/columns → Space</span>
                    <button onClick={() => go(5)} className="text-[#2b0052]">Ask AI first</button>
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
    <div className="relative min-h-[760px] bg-white p-0 pb-32 text-[#22003f]">
      <div className="min-h-[760px] border-t border-neutral-200">
        <main className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <button onClick={() => setSourceCenterOpen(true)} className="rounded-md bg-[#2b0052] px-3 py-2 text-xs font-medium text-white">+ Add source</button>
              <button onClick={() => setTemplateOpen(true)} className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-[#2b0052]">▣ Templates</button>
              <div className="relative">
                <select value={microVault} onChange={(event) => setMicroVault(event.target.value)} className="h-8 rounded-md border border-neutral-200 bg-white px-3 pr-8 text-xs text-neutral-600 outline-none">
                  <option>Main Vault</option>
                  <option>Selected rows folder</option>
                  <option>Drive-time micro Vault</option>
                  <option>Unmatched portfolio queue</option>
                </select>
              </div>
              {microVault !== "Main Vault" && <button onClick={() => setMicroVault("Main Vault")} className="text-xs text-neutral-500">← Main Vault</button>}
              <input value={aiSearch} onChange={(event) => setAiSearch(event.target.value)} className="h-8 w-72 rounded-md border border-neutral-200 px-3 text-xs outline-none placeholder:text-neutral-300" placeholder="AI search Vault: owners, missing addresses, rent growth…" />
              <button onClick={() => setFilterOpen((open) => !open)} className="rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-500">Filters</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
                <button onClick={() => setVaultView("table")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "table" ? "bg-white text-[#2b0052] shadow-sm" : "text-neutral-500"}`}>Table</button>
                <button onClick={() => setVaultView("map")} className={`rounded px-3 py-1.5 text-xs font-medium ${vaultView === "map" ? "bg-white text-[#2b0052] shadow-sm" : "text-neutral-500"}`}>Map</button>
              </div>
              <button onClick={() => setAuditOpen(true)} className="rounded-md bg-[#2b0052] px-3 py-2 text-xs font-medium text-white">Audit</button>
            </div>
          </div>

          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
            {microVault} · {sourceRun} · extraction filling this grid · {aiSearch ? `AI search: ${aiSearch} · ${filteredVaultRows.length}/${vaultRows.length} rows visible` : "rows may be properties, markets, or provider reports"} · columns are data endpoints you can create
          </div>

          {aiSearch && (
            <div className="border-b border-purple-100 bg-[#fbf4ff] px-4 py-2 text-xs text-[#2b0052]">
              AI search preview: filtered the Vault locally for “{aiSearch}”. Backend AI will expand this into semantic search, citations, and suggested micro-vaults.
            </div>
          )}

          {filterOpen && (
            <div className="border-b border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                {["Property rows", "Market rows", "Needs review", "Provider reports", "Fresh < 30 days"].map((filter) => <button key={filter} className="rounded-md border border-neutral-200 px-2.5 py-1.5 hover:bg-neutral-50">{filter}</button>)}
              </div>
            </div>
          )}

          {vaultView === "table" ? (
          <div className="relative overflow-auto">
            <table className="min-w-[1380px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-white">
                  {columns.map((column, index) => (
                    <th key={column.key} style={{ minWidth: column.width }} className={`group relative h-[50px] border-r border-neutral-200 px-3 text-sm font-semibold leading-tight text-[#22003f] ${index === 0 ? "sticky left-0 z-20 bg-white" : ""}`}>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1 h-3 w-3 accent-[#2b0052]" aria-label={`select ${column.label}`} />
                        <span className="whitespace-pre-line">{column.label}</span>
                      </div>
                      <button onClick={() => setShowColumnBuilder(true)} className="absolute -right-3 top-1/2 z-30 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-sm font-medium text-[#2b0052] opacity-0 shadow-sm transition group-hover:opacity-100" aria-label={`Add data point after ${column.label}`}>+</button>
                      <button onClick={() => resizeColumn(column.key)} className="absolute bottom-1 right-1 text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100" aria-label={`Resize ${column.label}`}>⇔</button>
                    </th>
                  ))}
                  <th className="h-[50px] min-w-[210px] border-r border-neutral-200 bg-neutral-50 px-3 text-left text-xs font-medium text-neutral-500">
                    <button onClick={() => setShowColumnBuilder(true)} className="flex w-full items-center justify-between rounded-md border border-dashed border-neutral-300 bg-white px-3 py-2 text-left hover:border-[#2b0052] hover:text-[#2b0052]">
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
                    <tr key={row.id} className={`${selected ? "bg-[#fbf4ff]" : rowIndex % 2 ? "bg-white" : "bg-white"} hover:bg-[#fbf4ff]`}>
                      {columns.map((column, index) => {
                        const value = row[column.key as keyof typeof row] as string | undefined;
                        return (
                          <td key={`${row.id}-${column.key}`} className={`h-[64px] border-b border-r border-neutral-200 px-3 align-middle ${index === 0 ? "sticky left-0 z-10 bg-inherit font-medium text-[#22003f]" : "text-[#22003f]"}`}>
                            <div className="flex items-center gap-2">
                              {index === 0 && <input type="checkbox" checked={selected} onChange={() => toggleRow(row.id)} className="h-3 w-3 accent-[#2b0052]" aria-label={`select ${row.location}`} />}
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
                <div className="absolute left-5 top-5 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-xs font-medium text-[#2b0052] shadow-sm">Mapped Vault · same rows as table</div>
                <div className="absolute left-5 top-16 flex gap-2 rounded-xl border border-neutral-200 bg-white/95 p-2 text-xs shadow-sm">
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md bg-[#2b0052] px-2 py-1.5 text-white">Drop pin</button>
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md border border-neutral-200 px-2 py-1.5 text-neutral-600">3 mi radius</button>
                  <button onClick={() => setMicroVault("Drive-time micro Vault")} className="rounded-md border border-neutral-200 px-2 py-1.5 text-neutral-600">15 min drive</button>
                </div>
                {filteredVaultRows.map((row, index) => (
                  <button key={`vault-pin-${row.id}`} onClick={() => toggleRow(row.id)} className={`absolute ${["left-[28%] top-[45%]", "left-[36%] top-[38%]", "left-[48%] top-[50%]", "left-[62%] top-[42%]", "left-[72%] top-[58%]"][index]} group`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-semibold shadow-lg ${selectedRows.includes(row.id) ? "bg-pink-200 text-[#2b0052]" : "bg-[#2b0052] text-white"}`}>{index + 1}</span>
                    <span className="absolute left-7 top-8 hidden w-56 rounded-xl border border-neutral-200 bg-white p-3 text-left text-xs shadow-xl group-hover:block"><span className="font-semibold text-neutral-950">{row.location.split("\n").join(" ")}</span><br /><span className="text-neutral-500">{row.kind} · {row.cap || row.noi || "source context"}</span></span>
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-3"><p className="text-sm font-semibold text-[#22003f]">Vault rows on map</p><p className="mt-1 text-xs text-neutral-500">Select rows or draw a radius/drive time to open a micro-vault, then chat to create a Space.</p></div>
                <div className="max-h-[500px] overflow-auto p-3">
                  {filteredVaultRows.map((row) => (
                    <button key={`vault-map-list-${row.id}`} onClick={() => toggleRow(row.id)} className={`mb-2 flex w-full items-start justify-between rounded-xl border p-3 text-left ${selectedRows.includes(row.id) ? "border-[#2b0052] bg-[#fbf4ff]" : "border-neutral-200 hover:bg-neutral-50"}`}>
                      <span><span className="block text-sm font-medium text-[#22003f]">{row.location.split("\n").join(" ")}</span><span className="mt-1 block text-xs text-neutral-500">{row.kind} · Cap {row.cap || "—"} · NOI {row.noi || "—"}</span></span>
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
        <div className="absolute right-14 top-28 z-40 w-[390px] rounded-2xl border border-neutral-200 bg-white p-5 text-[#22003f] shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2b0052]">Add data point column</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Search the property, market, geography, or report first. Then define what Cactus should extract or calculate.</p>
            </div>
            <button onClick={() => setShowColumnBuilder(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
          </div>
          <label className="mt-4 block text-xs font-semibold">Property / market context</label>
          <input className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#2b0052]" defaultValue="Subject Property + MSA" placeholder="Search property, MSA, market, report…" />
          <label className="mt-4 block text-xs font-semibold">Label</label>
          <input className="mt-1 w-full rounded-lg border border-pink-300 px-3 py-2 text-sm outline-none" defaultValue="Avg 1BR Rent" />
          <label className="mt-4 block text-xs font-semibold">Format</label>
          <button className="mt-1 flex w-40 items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">Number <span>↓</span></button>
          <label className="mt-4 block text-xs font-semibold">Prompt</label>
          <textarea className="mt-1 h-32 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-5 outline-none" defaultValue={"For the searched property/market context, extract the average monthly 1BR rent for Class A multifamily properties.\n\nReturn: $X,XXX (±Y% · n=Z)\n\nCite the file, page, cell, email, or provider row used."} />
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-400"><span>Use @ to mention columns</span><button onClick={addColumn} className="rounded-full bg-[#2b0052] px-3 py-2 text-xs font-medium text-white">AI generate</button></div>
        </div>
      )}

      {auditOpen && (
        <aside className="fixed right-0 top-0 z-50 h-full w-[980px] border-l border-neutral-200 bg-white text-[#22003f] shadow-2xl">
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
                  <button key={field} className={`w-full rounded-xl border p-3 text-left hover:bg-neutral-50 ${index === 0 ? "border-[#2b0052] bg-[#fbf4ff]" : "border-neutral-200"}`}>
                    <div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-neutral-950">{field}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{confidence}</span></div>
                    <p className="mt-1 text-sm text-neutral-700">{value}</p>
                    <p className="mt-1 text-xs text-neutral-400">{source} · click to highlight in source</p>
                    <div className="mt-3 flex gap-2"><span className="rounded-md bg-neutral-950 px-2 py-1 text-[11px] text-white">Approve</span><span className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Edit</span><span className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Reject</span></div>
                  </button>
                ))}
              </div>
              <button onClick={() => setAuditOpen(false)} className="mt-5 w-full rounded-md bg-[#2b0052] px-3 py-2 text-xs font-medium text-white">Approve reviewed facts</button>
            </div>
          </div>
        </aside>
      )}

      {templateOpen && (
        <div className="absolute left-5 top-20 z-40 w-[340px] rounded-2xl border border-neutral-200 bg-white p-4 text-[#22003f] shadow-2xl">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold">Vault templates</p><button onClick={() => setTemplateOpen(false)}>×</button></div>
          <div className="mt-4 space-y-2 text-sm">{["Acquisition screen", "Market benchmark pack", "Owner/contact research", "Debt quote comparison"].map((template) => <button key={template} onClick={() => setTemplateOpen(false)} className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-50">{template}</button>)}</div>
        </div>
      )}

      {sourceCenterOpen && sourceSetupModal}

      {selectedCount === 0 ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-500 shadow-xl">
          Select at least one Vault row to chat or create a Space.
        </div>
      ) : (
        <div className="fixed bottom-6 left-1/2 z-40 w-[760px] -translate-x-1/2 rounded-2xl border-4 border-[#2b0052] bg-white p-5 shadow-2xl">
          <textarea className="h-20 w-full resize-none bg-transparent text-xl font-medium text-[#22003f] outline-none placeholder:text-neutral-400" placeholder={`Ask about ${selectedCount} selected Vault row${selectedCount === 1 ? "" : "s"}…`} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2 text-sm">
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-[#2b0052]">▣ Vault</span>
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-[#2b0052]">⚡ Skills</span>
              <span className="rounded-full border border-neutral-200 px-3 py-2 text-[#2b0052]">◎ Web</span>
              <button onClick={() => setMicroVault("Selected rows folder")} className="rounded-full border border-neutral-200 px-3 py-2 text-[#2b0052]">Create folder</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-neutral-500">⌕</button>
              <button onClick={() => go(7)} className="grid h-10 w-10 place-items-center rounded-full bg-[#2b0052] text-lg text-white">↑</button>
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
  const [accountPage, setAccountPage] = useState("Account");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === "dark";
  const renderAppScreen = () => {
    if (active === 5) return <Opportunities go={setActive} onSubmit={(index) => { setSourceIndex(index); setHasIntake(true); }} hasIntake={hasIntake} initialSource={sourceIndex} onSourceSelect={setSourceIndex} />;
    if (active === 6) return <VaultTable go={setActive} hasIntake={hasIntake} sourceIndex={sourceIndex} onCompleteIntake={(index) => { setSourceIndex(index); setHasIntake(true); }} />;
    if (active === 7) return <Spaces go={setActive} />;
    if (active === 8) return <Workflows go={setActive} />;
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
        <aside className={`flex h-screen ${sidebarCollapsed ? "w-16" : "w-64"} shrink-0 flex-col border-r transition-all ${isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setActive(5)} className="flex items-center gap-2 text-left">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2b0052] text-xs font-semibold text-white">C</span>
              {!sidebarCollapsed && <span className="font-serif text-2xl font-light tracking-[-0.04em]">Cactus</span>}
            </button>
            <button onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100">☰</button>
          </div>

          <nav className="px-2.5">
            {appNav.map(([screen, icon, screenIndex]) => {
              const activeNav = active === screenIndex;
              return (
                <button
                  key={screen}
                  onClick={() => setActive(screenIndex)}
                  title={screen}
                  aria-label={screen}
                  className={`mb-1 flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${activeNav ? "bg-neutral-200/70 text-neutral-950" : isDark ? "text-neutral-300 hover:bg-white/10" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  <span className="w-4 text-center text-base">{icon}</span>
                  {!sidebarCollapsed && <span className="font-medium">{screen}</span>}
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
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2b0052] text-xs font-semibold text-white">T</span>
              {!sidebarCollapsed && <span><span className="block text-sm font-medium">Tyler</span><span className="block text-xs text-neutral-500">Multifamily Vault</span></span>}
            </button>
            {accountOpen && (
              <div className={`absolute bottom-16 ${sidebarCollapsed ? "left-2" : "left-3"} z-50 w-64 rounded-xl border border-neutral-200 bg-white p-2 text-sm shadow-2xl`}>
                {["Account", "Organization", "Members", "Billing + trial", "Integrations", "Security + audit", "Notifications", "Appearance"].map((item) => (
                  <button key={item} onClick={() => setAccountPage(item)} className={`block w-full rounded-md px-3 py-2 text-left ${accountPage === item ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:bg-neutral-50"}`}>{item}</button>
                ))}
                <div className="my-1 border-t border-neutral-100" />
                <button onClick={() => setActive(0)} className="block w-full rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </aside>
        {accountOpen && <button aria-label="Close account menu" onClick={() => setAccountOpen(false)} className="fixed inset-0 z-30 cursor-default bg-transparent" />}
        {accountOpen && (
          <div className={`fixed bottom-20 ${sidebarCollapsed ? "left-20" : "left-72"} z-40 w-[520px] rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-2xl`}>
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-semibold">{accountPage}</p><p className="mt-1 text-xs text-neutral-500">{accountPage === "Appearance" ? "Theme and sidebar preferences." : accountPage === "Billing + trial" ? "Trial usage, billing owner, and plan controls." : accountPage === "Integrations" ? "Connected sources and connector health." : accountPage === "Security + audit" ? "Access, audit log, and approval controls." : `${accountPage} settings for this organization.`}</p></div>
              <button onClick={() => setAccountOpen(false)} className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100">×</button>
            </div>
            {accountPage === "Appearance" ? (
              <div className="mt-4 space-y-3 text-xs">
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center justify-between rounded-xl border border-neutral-200 p-3 text-left hover:bg-neutral-50"><span><span className="block font-medium">Theme</span><span className="text-neutral-500">Switch between light and dark mode.</span></span><span className="rounded-md bg-neutral-100 px-2 py-1">{theme === "dark" ? "Dark" : "Light"}</span></button>
                <button onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="flex w-full items-center justify-between rounded-xl border border-neutral-200 p-3 text-left hover:bg-neutral-50"><span><span className="block font-medium">Sidebar</span><span className="text-neutral-500">Collapse or expand the app menu.</span></span><span className="rounded-md bg-neutral-100 px-2 py-1">{sidebarCollapsed ? "Collapsed" : "Expanded"}</span></button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                {(accountPage === "Account" ? [["Name", "Tyler Sellars"], ["Email", "tyler@company.com"], ["Role", "Owner"], ["Login", "Google + email link"]] : accountPage === "Organization" ? [["Org", "Cactus Capital Partners"], ["Workspace", "Multifamily Vault"], ["Asset classes", "Multifamily + Self storage"], ["Region", "US"]] : accountPage === "Members" ? [["Active", "3 members"], ["Pending", "1 invite"], ["Default access", "Deals + comps"], ["External", "View-only links"]] : accountPage === "Billing + trial" ? [["Plan", "Trial access"], ["Documents", "7 / 50 used"], ["Billing", "No payment before setup"], ["Upgrade", "Add card later"]] : accountPage === "Integrations" ? [["Gmail", "Needs scope"], ["Google Drive", "Pending"], ["Yardi", "Not connected"], ["Scrapers", "2 maintenance tasks"]] : accountPage === "Security + audit" ? [["Audit log", "Enabled"], ["Approvals", "Human review before writes"], ["SSO", "Later"], ["Scopes", "Least privilege"]] : [["Email", "Weekly digest"], ["Workflow tasks", "Immediate"], ["Source errors", "Immediate"], ["Billing", "Owner only"]]).map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-neutral-200 p-3"><p className="text-neutral-400">{label}</p><p className="mt-1 font-medium text-neutral-800">{value}</p></div>
                ))}
              </div>
            )}
          </div>
        )}
        <section className="min-w-0 flex-1 overflow-hidden">
          {renderAppScreen()}
        </section>
      </div>
    </main>
  );
}
