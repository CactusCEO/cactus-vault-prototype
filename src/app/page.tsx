"use client";

import { useMemo, useState } from "react";

const appScreens = ["Opportunities", "Vault", "Spaces", "Map", "Agents", "Analysis", "Comps + Data", "Outputs", "Activity"];

const sourceCards = [
  {
    title: "Upload documents",
    badge: "Best first step",
    note: "OMs, T12s, rent rolls, market reports, spreadsheets.",
  },
  {
    title: "Connect email or drive",
    badge: "Broker flow + folders",
    note: "Gmail, Outlook, Drive, OneDrive, deal rooms.",
  },
  {
    title: "Import lists or comps",
    badge: "Market data + saved work",
    note: "Property lists, comps, CRM exports, underwriting models.",
  },
  {
    title: "Use sample Vault",
    badge: "Explore first",
    note: "Open a finished Vault before adding real data.",
  },
];

const agentPreview = [
  ["Watch", "approved markets, sources, brokers"],
  ["Find", "deals, sites, signals, risks"],
  ["Analyze", "maps, comps, citations, rankings"],
  ["Learn", "team feedback + rejected deals"],
];

const extractionEvents = [
  ["Watching approved markets", "Nashville, Tampa, Charlotte, Phoenix, and Dallas opportunity signals", "done"],
  ["Finding deals + sites", "19 acquisition leads and 6 development zones surfaced for review", "running"],
  ["Creating Vault records", "Properties, owners, submarkets, sources, and status fields are appearing", "running"],
  ["Scoring site-selection signals", "Demographics, traffic, flood risk, zoning, supply pipeline, and comps checked", "done"],
  ["Extracting deal facts", "612 fields pulled with citations back to source pages and files", "done"],
  ["Learning your criteria", "Cactus saved buy-box preferences and rejection reasons for future rankings", "review"],
];

const buildRows = [
  ["Riverside Flats", "Nashville", "184", "Deal signal + OM", "Ready"],
  ["East Loop Assemblage", "Tampa", "Site", "Permit + zoning", "Scoring"],
  ["Pine Hollow", "Charlotte", "132", "Broker email", "Mapped"],
  ["Cedar Point", "Tampa", "96", "Ownership signal", "Needs review"],
];

const unlockedOutputs = ["Opportunity list", "Vault table", "Map layers", "Site memo", "IC memo drafting"];

const vaultRows = [
  ["Riverside Flats", "Nashville", "184", "1988", "$24.6M", "$133k", "5.8%", "$1,462", "A-", "Email + OM"],
  ["Pine Hollow", "Charlotte", "132", "1976", "$15.9M", "$120k", "6.2%", "$1,318", "B+", "Scraper"],
  ["The Mercer", "Atlanta", "248", "1992", "$38.4M", "$155k", "5.4%", "$1,684", "A", "Deal room"],
  ["Cedar Point", "Tampa", "96", "1984", "$11.2M", "$117k", "6.6%", "$1,226", "B", "Portfolio"],
  ["Lakeside Commons", "Raleigh", "210", "2001", "$34.1M", "$162k", "5.1%", "$1,741", "A", "Cactus"],
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

const opportunityRows = [
  ["East Loop Assemblage", "Tampa", "Site selection", "91", "Supply gap + traffic", "Analyze"],
  ["Riverside Flats", "Nashville", "Acquisition", "88", "Rent gap + broker signal", "Analyze"],
  ["Pine Hollow", "Charlotte", "Acquisition", "82", "Owner age + comp support", "Review"],
  ["West Mesa Corridor", "Phoenix", "Site selection", "79", "Growth + zoning", "Watch"],
];

const spaceRows = [
  ["Riverside Flats Deal Review", "Acquisition", "Vault context", "Internal team", "IC memo", "Active"],
  ["Tampa Site Selection Sprint", "Development", "Auto-updating", "Team + broker", "Site memo", "Review"],
  ["East Loop Lender Package", "Debt", "Frozen May 10", "External lender", "Debt memo", "Draft"],
  ["Pine Hollow BOV", "Broker", "Blank + selected files", "Broker team", "BOV", "Needs data"],
];

const spaceContext = [
  ["Vault context", "Riverside Flats OM, rent roll, T12, Nashville rent comps, Southeast value-add criteria", "Included"],
  ["Market data", "Green Street cap benchmark, ATTOM ownership/tax, HelloData rent comps, FEMA flood, Walk Score", "Fresh"],
  ["Customer template", "Tyler value-add Excel model · assumptions mapped to Acquisition tab", "Ready"],
  ["Excluded context", "Full portfolio financials, private partner notes, unrelated Tampa watchlist", "Hidden"],
];

const extractionItems = [
  ["Extracted to model", "184 units, T12 NOI, rent roll averages, taxes, debt terms", "Ready"],
  ["Needs review", "T12 NOI and repair reserve differ from seller summary", "2 items"],
  ["Push to Excel", "Mapped fields can be exported into the customer template", "Available"],
];

const scenarioRows = [
  ["Seller case", "15.8%", "6.0% rent growth", "Aggressive"],
  ["Cactus base", "12.9%", "3.8% rent growth + 5.85% exit", "Supported"],
  ["What works", "16.0%", "$1.3M price cut or +9% NOI", "Needs change"],
];

const benchmarkRows = [
  ["Exit cap", "5.25%", "5.7–6.1%", "Aggressive"],
  ["Rent growth", "6.0%", "3.4–4.2%", "Above market"],
  ["Renovation cost", "$8.5k/unit", "$7–10k/unit", "Supported"],
  ["Flood risk", "None", "Zone X", "Supported"],
];

const sourceLedger = [
  ["Green Street", "Exit cap + market grade", "Refreshed May 10", "Premium · cached", "High"],
  ["HelloData", "Rent comps + upside", "12 days old", "Paid · no refresh needed", "High"],
  ["ATTOM", "Owner, tax, parcel", "On demand", "Paid refresh", "Medium"],
  ["FEMA", "Flood zone", "Monthly public", "Free", "High"],
];

const dataStoryRows = [
  ["Cap rate", "6.0% → 6.5% → 7.0%", "Valuation pressure increased"],
  ["Rent upside", "+12% → +8%", "Seller growth case weakened"],
  ["New supply", "2 → 4 projects", "Lease-up risk moved higher"],
];

const freshnessRows = [
  ["Space mode", "Latest Vault data", "Internal active review"],
  ["External package", "Freeze before sharing", "IC/lender auditability"],
  ["Auto-updates", "Off for this Space", "Turn on after IC decision"],
];

const providerPacks = [
  ["Green Street market outlook", "Premium", "Cached May 10", "Exit cap, demand grade, growth forecast", "Refresh if price changes"],
  ["HelloData rent comps", "Paid", "12 days old", "Rent upside and comp support", "Use cached"],
  ["FEMA flood layer", "Free", "Monthly", "Flood zone and risk screen", "Included"],
  ["ATTOM tax + ownership", "Paid", "On demand", "Owner, parcel, tax assessment", "Refresh $0.60–$1"],
];

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
      <Pill>Mike-style prototype</Pill>
    </div>
  );
}

function Homepage({ go }: { go: (screenIndex: number) => void }) {
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
          <button onClick={() => go(1)} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm">Build your engine</button>
          <button onClick={() => go(1)} className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700">Sign in</button>
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
      className={`fixed right-5 top-5 z-50 grid h-9 w-9 place-items-center rounded-lg border text-sm shadow-sm backdrop-blur ${isDark ? "border-white/10 bg-white/10 text-neutral-100" : "border-neutral-200 bg-white/80 text-neutral-700"}`}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}

function SignupScreen({ go, theme }: { go: (screenIndex: number) => void; theme: "light" | "dark" }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
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
          <h1 className="text-4xl font-semibold leading-[1] tracking-[-0.06em]">{isSignup ? "Create your Cactus account." : "Sign in to Cactus."}</h1>
          <p className={`mx-auto mt-4 max-w-sm text-sm leading-6 ${muted}`}>
            {isSignup ? "Start configuring your Cactus engine with a free 50-document trial. No payment step before setup." : "Welcome back. Sign in to continue managing your Cactus engine."}
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-md">
          <div className="space-y-3">
            <button onClick={() => go(2)} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="text-base">G</span>{isSignup ? "Sign up with Google" : "Sign in with Google"}
            </button>
            <button onClick={() => go(2)} className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${authButton}`}>
              <span className="grid grid-cols-2 gap-0.5">
                <span className="h-2 w-2 bg-[#f25022]" /><span className="h-2 w-2 bg-[#7fba00]" /><span className="h-2 w-2 bg-[#00a4ef]" /><span className="h-2 w-2 bg-[#ffb900]" />
              </span>{isSignup ? "Sign up with Microsoft" : "Sign in with Microsoft"}
            </button>
          </div>

          <div className={`my-5 flex items-center gap-3 text-xs ${muted}`}><div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />or use work email<div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} /></div>
          <label className={`text-xs font-medium ${muted}`}>Work email</label>
          <input className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] ${inputClass}`} placeholder="you@company.com" />
          <button onClick={() => go(2)} className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition ${primaryCta}`}>{isSignup ? "Create account" : "Email me a sign-in link"}</button>

          <p className={`mt-4 text-center text-xs leading-5 ${muted}`}>
            Free 50-document trial · No payment before setup · No time limit
          </p>
          <p className={`mt-3 text-center text-xs ${muted}`}>
            {isSignup ? "Already have an account? " : "New to Cactus? "}
            <button onClick={() => setMode(isSignup ? "signin" : "signup")} className={`font-medium underline-offset-4 hover:underline ${isDark ? "text-emerald-200" : "text-neutral-900"}`}>
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
  const continueCopy = setupStage === 1 ? "Continue to team access" : setupStage === 2 ? "Continue to asset classes" : "Continue to opportunity setup";

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
              <div className={`mb-3 rounded-xl border px-3 py-2.5 text-sm ${summary}`}>
                <span className="font-medium">Team access saved:</span> 3 members · owner, editor, viewer
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

function VaultSetup({ go, theme }: { go: (screenIndex: number) => void; theme: "light" | "dark" }) {
  const [selected, setSelected] = useState(0);
  const isDark = theme === "dark";
  const page = isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-white/80 bg-white/88";
  const card = isDark ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]" : "border-neutral-200 bg-neutral-50/70 text-neutral-950 hover:bg-white";
  const selectedCard = isDark ? "border-white/60 bg-white text-neutral-950 ring-1 ring-white/20" : "border-neutral-900 bg-[#f4f1ea] text-neutral-950 ring-1 ring-neutral-900/10";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const soft = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-neutral-50";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-5xl">
        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Start your opportunity engine</h2>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 3 of 4</span>
          </div>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Choose one source and one always-on system. Cactus will start finding deals/sites, building records, mapping facts, and learning what matters.</p>
          <p className={`mt-2 text-xs font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Start simple today. Add more sources, agents, and criteria later.</p>
        </div>

        <div className={`rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <div className="grid grid-cols-[1fr_300px] gap-5">
            <section>
              <p className="text-sm font-semibold">Choose the first source Cactus can learn from</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {sourceCards.map((source, index) => {
                  const isSelected = selected === index;
                  return (
                    <button key={source.title} onClick={() => setSelected(index)} className={`min-h-[118px] rounded-xl border p-4 text-left shadow-sm transition ${isSelected ? selectedCard : card}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-[10px] font-medium uppercase tracking-[0.14em] ${isSelected && !isDark ? "text-neutral-600" : "text-neutral-400"}`}>{source.badge}</span>
                        <span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${isSelected ? isDark ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-300 text-transparent"}`}>{isSelected ? "✓" : ""}</span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold tracking-[-0.03em]">{source.title}</h3>
                      <p className={`mt-2 text-sm leading-5 ${isSelected ? isDark ? "text-neutral-600" : "text-neutral-600" : muted}`}>{source.note}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold">Choose the first always-on system</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    ["Opportunity Finder", "Find acquisition targets and deal signals."],
                    ["Site Selection", "Rank areas/sites using demand, traffic, risk, and comps."],
                    ["Deal Intake", "Process incoming packages faster with context already built."],
                    ["Portfolio Monitor", "Watch owned assets and market changes."],
                  ].map(([title, copy], index) => (
                    <button key={title} className={`rounded-xl border p-3 text-left shadow-sm transition ${index === 0 ? selectedCard : card}`}>
                      <div className="flex items-center justify-between"><p className="text-sm font-semibold">{title}</p><span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${index === 0 ? isDark ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-300 text-transparent"}`}>{index === 0 ? "✓" : ""}</span></div>
                      <p className={`mt-2 text-xs leading-5 ${index === 0 ? "text-neutral-600" : muted}`}>{copy}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside className={`rounded-2xl border p-4 ${soft}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Cactus will keep working</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${isDark ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>Agent ready</span>
              </div>
              <div className="mt-4 space-y-2">
                {agentPreview.map(([verb, detail], index) => (
                  <div key={verb} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-white"}`}>
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${index === 0 ? cta : isDark ? "bg-white/10 text-neutral-300" : "bg-neutral-100 text-neutral-500"}`}>{index + 1}</span>
                    <div><p className="text-sm font-medium">{verb}</p><p className={`text-xs ${muted}`}>{detail}</p></div>
                  </div>
                ))}
              </div>
              <div className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${soft} ${muted}`}>You approve every source. Cactus only watches what you allow and keeps org-specific learning inside your organization.</div>
            </aside>
          </div>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
            <button onClick={() => go(2)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark ? "border-white/10 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>Back</button>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>More sources and agents can be added anytime.</span>
              <button onClick={() => go(4)} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>Start live activation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveExtraction({ go, theme }: { go: (screenIndex: number) => void; theme: "light" | "dark" }) {
  const isDark = theme === "dark";
  const page = isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950";
  const panel = isDark ? "border-white/10 bg-white/[0.05]" : "border-white/80 bg-white/88";
  const surface = isDark ? "border-white/10 bg-white/[0.05]" : "border-neutral-200 bg-white";
  const soft = isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-neutral-50";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const cta = isDark ? "bg-[#f6f0e6] text-neutral-950" : "bg-neutral-950 text-white";

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${page}`}>
      <div className="w-full max-w-6xl">
        <div className="mb-4 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Cactus is activating your engine</h2>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Step 4 of 4</span>
            </div>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>No generic loading screen. Cactus shows the always-on work: finding deals and sites, scoring signals, creating Vault rows, linking citations, learning criteria, and preparing outputs.</p>
          </div>
          <button onClick={() => go(5)} className={`rounded-xl px-5 py-3 text-sm font-medium shadow-sm ${cta}`}>Open opportunity engine</button>
        </div>

        <div className={`grid grid-cols-[1fr_330px] gap-5 rounded-[1.6rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur ${panel}`}>
          <div className="space-y-4">
            <div className={`rounded-2xl border shadow-sm ${surface}`}>
              <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? "border-white/10" : "border-neutral-200"}`}>
                <div><p className="text-sm font-semibold">Opportunities and Vault records appearing live</p><p className={`mt-1 text-xs ${muted}`}>Rows fill as Cactus finds opportunities, scores sites, extracts facts, and links evidence.</p></div>
                <Pill tone="green">19 opportunities found</Pill>
              </div>
              <table className="w-full text-left text-sm">
                <thead className={`text-xs ${isDark ? "bg-white/[0.04] text-neutral-400" : "bg-neutral-50 text-neutral-500"}`}><tr>{["Property", "Market", "Units", "Sources", "Status"].map((h) => <th key={h} className={`border-b px-4 py-2.5 font-medium ${isDark ? "border-white/10" : "border-neutral-200"}`}>{h}</th>)}</tr></thead>
                <tbody>{buildRows.map((row) => <tr key={row[0]} className={isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50"}>{row.map((cell, i) => <td key={`${row[0]}-${cell}`} className={`border-b px-4 py-3 ${isDark ? "border-white/10" : "border-neutral-100"} ${i === 0 ? "font-medium" : muted}`}>{i === 4 ? <span className={`rounded-full px-2 py-1 text-xs ${cell === "Ready" ? "bg-emerald-500/15 text-emerald-300" : cell === "Needs review" ? "bg-amber-500/15 text-amber-300" : "bg-blue-500/15 text-blue-300"}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["19 leads surfaced", "6 sites ranked", "4 learnings saved"].map((stat) => <div key={stat} className={`rounded-xl border p-4 text-sm font-medium ${soft}`}>{stat}<p className={`mt-2 text-xs font-normal ${muted}`}>Source-linked, ranked, and reviewable.</p></div>)}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-950 p-4 text-white shadow-sm">
              <p className="text-sm font-semibold">Cactus activity</p>
              <div className="mt-4 space-y-3">
                {extractionEvents.map(([name, detail, status]) => (
                  <div key={name} className="flex gap-3">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${status === "running" ? "animate-pulse bg-blue-300" : status === "review" ? "bg-amber-300" : "bg-emerald-300"}`} />
                    <div><p className="text-xs font-medium text-white">{name}</p><p className="mt-1 text-[11px] leading-4 text-neutral-400">{detail}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 shadow-sm ${surface}`}>
              <p className="text-sm font-semibold">Outputs unlocking</p>
              <div className="mt-3 flex flex-wrap gap-2">{unlockedOutputs.map((output, index) => <span key={output} className={`rounded-full border px-3 py-1.5 text-xs ${index < 3 ? isDark ? "border-white bg-white text-neutral-950" : "border-neutral-900 bg-neutral-950 text-white" : isDark ? "border-white/10 text-neutral-400" : "border-neutral-200 text-neutral-500"}`}>{output}</span>)}</div>
              <p className={`mt-4 text-xs leading-5 ${muted}`}>The user sees an always-on system becoming useful instead of staring at a loading bar.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Opportunities({ go }: { go: (screenIndex: number) => void }) {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_340px] gap-5 p-8">
      <main className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Opportunity engine" title="Find deals and sites before intake" subtitle="Cactus keeps watching approved markets, sources, broker activity, ownership signals, permits, supply gaps, and site-selection factors so deal intake starts with context already built." />
        <div className="grid grid-cols-4 gap-3">
          {["19 leads surfaced", "6 sites ranked", "4 markets watched", "3 need review"].map((stat) => (
            <div key={stat} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xl font-semibold tracking-[-0.04em] text-neutral-950">{stat.split(" ")[0]}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.split(" ").slice(1).join(" ")}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500"><tr>{["Opportunity", "Market", "Type", "Score", "Why surfaced", "Action"].map((h) => <th key={h} className="border-b border-neutral-200 px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{opportunityRows.map((row) => <tr key={row[0]} className="hover:bg-neutral-50">{row.map((cell, i) => <td key={`${row[0]}-${cell}`} className={`border-b border-neutral-100 px-4 py-4 ${i === 0 ? "font-medium text-neutral-950" : "text-neutral-600"}`}>{i === 5 ? <button onClick={() => go(7)} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:border-neutral-950 hover:text-neutral-950">{cell}</button> : cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[
            ["Deal finding", "Broker signals, listings, owner age, taxes, distress, and off-market patterns."],
            ["Site selection", "Demographics, traffic density, zoning, flood risk, supply/demand, and nearby comps."],
            ["Learning loop", "Approvals, rejects, edits, and assumptions change future rankings automatically."],
          ].map(([title, copy]) => <div key={title} className="rounded-2xl border border-neutral-200 p-4"><p className="text-sm font-medium text-neutral-950">{title}</p><p className="mt-2 text-xs leading-5 text-neutral-500">{copy}</p></div>)}
        </div>
      </main>
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm">
        <p className="text-sm font-medium">Why this is faster than intake alone</p>
        <p className="mt-4 text-3xl font-semibold leading-[1] tracking-[-0.06em]">The context is built before the deal arrives.</p>
        <div className="mt-6 space-y-2 text-xs text-neutral-300">
          {['Watches markets continuously', 'Scores locations and owner signals', 'Pre-builds comps and map context', 'Learns what the team rejects', 'Turns strong leads into analysis packets'].map((item) => <div key={item} className="rounded-xl bg-white/10 px-3 py-2">{item}</div>)}
        </div>
        <button onClick={() => go(13)} className="mt-6 w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-neutral-950">Teach Cactus criteria</button>
      </aside>
    </div>
  );
}

function Spaces({ go }: { go: (screenIndex: number) => void }) {
  return (
    <div className="grid min-h-[690px] grid-cols-[360px_1fr] gap-5 p-8">
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-950">Spaces</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Focused rooms where Cactus uses scoped Vault context to do work.</p>
          </div>
          <button className="rounded-full bg-neutral-950 px-3 py-2 text-xs font-medium text-white">New</button>
        </div>
        <div className="mt-5 space-y-2">
          {spaceRows.map(([name, type, context, people, output, status], index) => (
            <button key={name} onClick={() => go(index === 0 ? 7 : index === 1 ? 8 : 12)} className={`w-full rounded-2xl border p-4 text-left transition ${index === 0 ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className={`mt-1 text-xs ${index === 0 ? "text-neutral-400" : "text-neutral-500"}`}>{type} · {output}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] ${index === 0 ? "bg-white text-neutral-950" : "bg-neutral-100 text-neutral-500"}`}>{status}</span>
              </div>
              <p className={`mt-3 text-xs leading-5 ${index === 0 ? "text-neutral-300" : "text-neutral-500"}`}>{context} · {people}</p>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Context rule</p>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Spaces can use selected Vault context, a folder, auto-updating data, frozen point-in-time data, or no prior context.</p>
        </div>
      </aside>

      <main className="space-y-5">
        <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Deal Space · active workroom</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">Riverside Flats Deal Review</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">One compact room for the whole loop: scoped Vault context, extraction into the customer model, assumption pressure-test, output draft, and automation handoff.</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600">Share</button>
              <button onClick={() => go(12)} className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Generate IC memo</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {["Context: selected", "Model: Excel mapped", "Question: hit 16% IRR", "Next: memo draft"].map((item) => (
              <div key={item} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-950">{item.split(":")[0]}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.split(": ")[1]}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2 text-xs">
            {["Opportunity", "Space", "Extract", "Playground", "Output", "Automate"].map((step, index) => (
              <button key={step} onClick={() => go(index === 0 ? 5 : index === 4 ? 12 : index === 5 ? 9 : 7)} className={`rounded-full border px-3 py-2 text-left ${index === 1 ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>{index + 1}. {step}</button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-[1fr_340px] gap-5">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-950">Source ledger</p>
              <Pill tone="amber">Credits protected</Pill>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-400"><tr>{["Provider", "Supports", "Freshness", "Cost", "Confidence"].map((h) => <th key={h} className="border-b border-neutral-200 px-3 py-2 font-medium">{h}</th>)}</tr></thead>
                <tbody>{sourceLedger.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`border-b border-neutral-100 px-3 py-2.5 ${i === 0 ? "font-medium text-neutral-950" : "text-neutral-500"}`}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-neutral-500">Cactus uses cached paid data when it is still decision-useful and only recommends a refresh when it can change underwriting.</p>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">Freshness mode</p>
            <div className="mt-4 space-y-2">
              {freshnessRows.map(([label, value, note]) => <div key={label} className="rounded-xl border border-neutral-200 p-3"><div className="flex justify-between gap-3 text-xs"><span className="font-medium text-neutral-950">{label}</span><span className="text-neutral-500">{value}</span></div><p className="mt-1 text-xs text-neutral-400">{note}</p></div>)}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-[1fr_340px] gap-5">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-950">Vault context in this Space</p>
              <Pill tone="green">Visible boundary</Pill>
            </div>
            <div className="mt-4 space-y-3">
              {spaceContext.map(([title, detail, status]) => (
                <div key={title} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between gap-4"><p className="text-sm font-medium text-neutral-950">{title}</p><Pill tone={status === "Hidden" ? "amber" : "default"}>{status}</Pill></div>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm">
            <p className="text-sm font-medium">Analyst chat + voice</p>
            <p className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.05em]">“What needs to change for this to hit 16% IRR?”</p>
            <p className="mt-4 text-sm leading-6 text-neutral-400">At current price, the deal needs either a $1.3M price reduction or NOI 9% above the Cactus base case. Seller rent growth is above market support.</p>
            <div className="mt-5 rounded-2xl bg-white/10 p-3 text-xs text-neutral-300">Ask by voice, update assumptions, draft memo language, or push changes into Excel.</div>
            <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => go(10)} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Open analysis</button><button onClick={() => go(11)} className="rounded-full border border-white/20 px-3 py-2 text-xs text-white">Review comps</button></div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-5">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-sm font-medium text-neutral-950">Custom extraction</p><button onClick={() => go(10)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600">Open model</button></div>
            <div className="mt-4 space-y-3">
              {extractionItems.map(([title, note, status]) => <div key={title} className="rounded-2xl bg-neutral-50 p-4"><div className="flex justify-between gap-3"><p className="text-sm font-medium text-neutral-950">{title}</p><span className="text-xs text-neutral-400">{status}</span></div><p className="mt-2 text-xs leading-5 text-neutral-500">{note}</p></div>)}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">What needs to change?</p>
            <p className="mt-2 text-xs leading-5 text-neutral-500">To hit 16% IRR, price needs to fall $1.3M or NOI must run 9% above Cactus base.</p>
            <table className="mt-3 w-full text-left text-xs">
              <tbody>{scenarioRows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`border-b border-neutral-100 py-2.5 ${i === 0 ? "font-medium text-neutral-950" : "text-neutral-500"}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">Market benchmarks</p>
            <div className="mt-4 space-y-2">
              {benchmarkRows.map(([metric, user, market, view]) => <div key={metric} className="rounded-xl border border-neutral-200 p-3"><div className="flex justify-between text-xs"><span className="font-medium text-neutral-950">{metric}</span><span className="text-neutral-400">{view}</span></div><p className="mt-1 text-xs text-neutral-500">User {user} · Market {market}</p></div>)}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-[1fr_340px] gap-5">
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-sm font-medium text-neutral-950">Output draft</p><button onClick={() => go(12)} className="rounded-full bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Open outputs</button></div>
            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">Cactus drafted the IC memo thesis, assumption checks, downside case, source appendix, and lender-ready summary from this Space context.</div>
          </div>
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-950">Automate next time</p>
            <p className="mt-3 text-sm leading-6 text-neutral-500">Turn this review into a repeatable workflow: intake broker email, enrich with market data, populate Excel, run base case, and draft IC memo.</p>
            <button onClick={() => go(9)} className="mt-5 w-full rounded-full border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">Create agent from this Space</button>
          </div>
        </section>
      </main>
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

function VaultTable() {
  return (
    <div className="p-8">
      <SectionHeader eyebrow="Opportunity workspace" title="The Vault stores every deal, site, source, and learning" subtitle="Rows are opportunities, properties, sites, owners, comps, and documents. Columns are source-linked facts, map signals, underwriting inputs, review status, and what Cactus has learned." />
      <div className="mb-5 grid grid-cols-[1fr_340px] gap-5">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-neutral-950">Data story: Riverside Flats</p><Pill tone="amber">Changed since April</Pill></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {dataStoryRows.map(([metric, movement, impact]) => <div key={metric} className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs text-neutral-400">{metric}</p><p className="mt-2 text-sm font-medium text-neutral-950">{movement}</p><p className="mt-1 text-xs leading-5 text-neutral-500">{impact}</p></div>)}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm">
          <p className="text-sm font-medium">Cactus view</p>
          <p className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.05em]">Same assumptions now underwrite worse.</p>
          <p className="mt-3 text-sm leading-6 text-neutral-400">Cap-rate expansion and narrower rent upside moved the base case from 15.8% to 12.9% IRR. Refresh premium data only if the team keeps pursuing.</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex gap-2"><Pill>Deals + sites</Pill><Pill>Source-linked facts</Pill><Pill tone="amber">7 review items</Pill></div>
          <div className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500">Ask your Vault: “Which sites or deals fit our Tampa strategy?”</div>
        </div>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>{["Property", "Market", "Units", "Year", "Price", "$/Unit", "Cap", "Rent", "Score", "Source"].map((h) => <th key={h} className="border-b border-neutral-200 px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {vaultRows.map((row) => <tr key={row[0]} className="hover:bg-neutral-50">{row.map((cell, i) => <td key={`${row[0]}-${cell}`} className={`border-b border-neutral-100 px-4 py-4 ${i === 0 ? "font-medium text-neutral-950" : "text-neutral-600"}`}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
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

function Outputs() {
  return (
    <div className="p-8">
      <SectionHeader eyebrow="Output builder" title="Generate hitlists, site memos, IC, and bank-ready outputs" subtitle="Convert ranked opportunities, site-selection signals, facts, comps, assumptions, and citations into professional materials the team can review or send." />
      <div className="grid grid-cols-3 gap-5">
        {['Weekly hitlist', 'Site-selection memo', 'IC memo', 'Bank package'].map((output, i) => <div key={output} className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm"><Pill tone={i === 2 ? "default" : "green"}>{i === 2 ? "Later" : "Ready"}</Pill><h3 className="mt-16 text-2xl font-semibold tracking-[-0.05em]">{output}</h3><p className="mt-3 text-sm leading-6 text-neutral-500">Opportunity thesis, site/deal evidence, comps, market support, risks, citations, and appendix-ready source links.</p><button className="mt-6 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Preview</button></div>)}
      </div>
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
  const isDark = theme === "dark";
  const AppScreen = useMemo(() => [Opportunities, VaultTable, Spaces, VaultMap, Agents, DealAnalysis, CompsData, Outputs, Activity][active - 5] ?? Opportunities, [active]);

  if (active === 0) return <><ThemeToggle theme={theme} setTheme={setTheme} /><Homepage go={setActive} /></>;
  if (active === 1) return <><ThemeToggle theme={theme} setTheme={setTheme} /><SignupScreen go={setActive} theme={theme} /></>;
  if (active === 2) return <><ThemeToggle theme={theme} setTheme={setTheme} /><AccountSetup go={setActive} theme={theme} /></>;
  if (active === 3) return <><ThemeToggle theme={theme} setTheme={setTheme} /><VaultSetup go={setActive} theme={theme} /></>;
  if (active === 4) return <><ThemeToggle theme={theme} setTheme={setTheme} /><LiveExtraction go={setActive} theme={theme} /></>;

  return (
    <main className={`min-h-screen ${isDark ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950"}`}>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <div className="flex min-h-screen">
        <aside className={`sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r p-3 ${isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
          <button onClick={() => setActive(0)} className={`mb-7 flex items-center gap-2 rounded-xl px-2 py-2 text-left ${isDark ? "hover:bg-white/10" : "hover:bg-white"}`}>
            <div className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold ${isDark ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"}`}>C</div>
            <div><p className="text-xl font-light tracking-[-0.04em]">Cactus</p><p className="text-xs text-neutral-400">Opportunity workspace</p></div>
          </button>

          <p className="px-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">App navigation</p>
          <nav className="mt-3 space-y-1">
            {appScreens.map((screen, index) => {
              const screenIndex = index + 5;
              return <button key={screen} onClick={() => setActive(screenIndex)} className={`flex h-10 w-full items-center rounded-md px-3 text-left text-sm transition ${active === screenIndex ? isDark ? "bg-white text-neutral-950 shadow-sm" : "bg-white text-neutral-950 shadow-sm" : isDark ? "text-neutral-400 hover:bg-white/10" : "text-neutral-500 hover:bg-white/70"}`}><span className="mr-3 text-xs text-neutral-400">{String(index + 1).padStart(2, "0")}</span>{screen}</button>;
            })}
          </nav>
          <div className={`mt-auto rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.06]" : "border-neutral-200 bg-white"}`}>
            <p className="text-sm font-medium">Product spine</p>
            <p className="mt-2 text-xs leading-5 text-neutral-500">Find opportunities → fill the Vault → work in Spaces → pressure-test assumptions → produce outputs → automate.</p>
          </div>
        </aside>
        <section className="flex-1"><AppScreen go={setActive} /></section>
      </div>
    </main>
  );
}
