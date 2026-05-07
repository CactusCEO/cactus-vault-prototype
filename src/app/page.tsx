"use client";

import { useMemo, useState } from "react";

const onboardingSteps = ["Sign up", "Account setup", "Create Vault", "Live Extraction"];

const appScreens = ["Vault Table", "Vault Map", "Deal Analysis", "Comps + Data", "Outputs", "Automations"];

const sourceCards = [
  {
    title: "Portfolio + operating systems",
    note: "Connect Property Management Software, Accounting Software, rent rolls, models, IC memos, and internal benchmarks.",
    cost: "Free trial",
    status: "Ready",
  },
  {
    title: "Market subscription tools",
    note: "Bring in market-data tools the team already uses so results get saved and reused.",
    cost: "Use your login",
    status: "Connect",
  },
  {
    title: "Listing scraper",
    note: "Track broker/listing sites by market, asset type, fields, and scrape frequency.",
    cost: "Setup guide",
    status: "Configure",
  },
  {
    title: "Email + Google Drive",
    note: "Capture broker emails, attachments, addresses, OMs, T12s, rent rolls, and development files.",
    cost: "Free trial",
    status: "Connect",
  },
  {
    title: "Deal rooms + NDAs",
    note: "Approval-gated CA/NDA signing and document extraction from protected rooms.",
    cost: "Approval step",
    status: "Approval required",
  },
  {
    title: "Cactus enrichment",
    note: "Activate parcel, market, flood, traffic, ownership, supply, comps, incentives, and funding endpoints.",
    cost: "Sample data",
    status: "Preview",
  },
  {
    title: "Premium providers",
    note: "Add Green Street, HelloData, ATTOM, or other paid sources later when needed.",
    cost: "Connect later",
    status: "Later",
  },
];

const extractionEvents = [
  ["Scanning Gmail label", "Broker Deals / Southeast", "running"],
  ["Documents found", "48 OMs, 14 T12s, 11 rent rolls", "done"],
  ["Addresses detected", "31 unique multifamily locations", "done"],
  ["Property records created", "24 rows added to The Vault", "done"],
  ["Fields extracted", "612 datapoints with 84% avg confidence", "running"],
  ["Review queue", "7 fields need analyst approval", "review"],
];

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
            Turn your existing real estate data into a proprietary edge.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-500">
            Cactus builds The Vault: a living customer brain for portfolio asset management, acquisitions, and new development. It gives investors a data analyst, underwriter, deal sourcer, and asset manager that never sleep — saving the portfolio data, market subscriptions, Property Management Software, Accounting Software, Google Drive files, broker emails, listing scrapers, deal rooms, and provider APIs your team already relies on so every customer builds a proprietary edge.
          </p>
          <div className="mt-8 grid max-w-3xl grid-cols-3 gap-3">
            {[
              ["Connect", "Operating systems, market subscriptions, documents, APIs, listing sites"],
              ["Think", "a data analyst, underwriter, deal sourcer, and asset manager working continuously"],
              ["Act", "portfolio management, acquisitions, development, outputs, hitlists"],
            ].map(([title, note]) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-950">{title}</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => go(1)} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm">Build your Vault</button>
          <button onClick={() => go(1)} className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700">Sign in</button>
        </div>
      </div>
      <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-4">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium">How each customer brain gets built</p>
          <p className="mt-2 text-xs leading-5 text-neutral-500">Start with whatever data the team already owns, then add connectors and scrapers as needed.</p>
          <div className="mt-5 space-y-3">
            {[
              ["Customer data", "Portfolio history, Property Management Software, Accounting Software, Google Drive, internal APIs, and provider accounts."],
              ["Market capture", "Save market-subscription research, build listing scrapers, and monitor broker sites, deal rooms, emails, and NDAs/CAs."],
              ["Cactus enrichment", "Add asset-specific signals: affordable housing funding/incentives, self-storage supply/demand, zoning, traffic, ownership, flood, comps, and provider data."],
              ["Decisions", "Use the brain for asset management, acquisitions, new development, IC memos, bank packages, and weekly hitlists."],
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
              <p className="mt-1 text-xs text-neutral-500">How Cactus turns scattered data into a customer brain</p>
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
                  <p className="text-sm font-medium">From scattered subscriptions to a proprietary edge</p>
                  <p className="mt-1 text-xs text-neutral-400">Portfolio + market data → Cactus enrichment → asset-class decisions</p>
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

function SignupScreen({ go }: { go: (screenIndex: number) => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isSignup = mode === "signup";
  const isDark = theme === "dark";

  const pageClass = isDark
    ? "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#1f2a23,transparent_34%),linear-gradient(135deg,#050505,#111312_45%,#171a18)] p-6 text-white"
    : "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f2f7f3,transparent_34%),linear-gradient(135deg,#f6f5f1,#eef0f3)] p-6 text-neutral-950";
  const panelClass = isDark
    ? "w-full max-w-4xl rounded-[1.5rem] border border-white/10 bg-[#0b0d0c]/92 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.55)] backdrop-blur"
    : "w-full max-w-4xl rounded-[1.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur";
  const muted = isDark ? "text-neutral-400" : "text-neutral-500";
  const softSurface = isDark ? "border-white/10 bg-white/[0.04]" : "border-neutral-200 bg-neutral-50/90";
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
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm ${softSurface} ${isDark ? "text-neutral-200" : "text-neutral-600"}`}
            >
              {isDark ? "☀" : "☾"}
            </button>
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

function AccountSetup({ go }: { go: (screenIndex: number) => void }) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef3ee,transparent_28%),linear-gradient(135deg,#f7f5ef_0%,#f4f4f2_48%,#eceff3_100%)] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex items-end justify-between gap-6">
          <SectionHeader eyebrow="Onboarding · Step 02" title="Create your corporate account" subtitle="Set the company defaults Cactus will use for your proprietary data ingestion." />
          <button onClick={() => setHelpOpen(!helpOpen)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm">{helpOpen ? "Close help" : "Ask a question"}</button>
        </div>

        <div className="rounded-[1.5rem] border border-white/80 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid grid-cols-[1fr_260px] gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-950">Company settings</p>
              <p className="mt-1 text-sm text-neutral-500">These settings become the defaults for your org, team access, reporting, and Vault ingestion.</p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  ["Company legal name", "Cactus Capital Partners"],
                  ["Default currency", "USD"],
                  ["Measurement", "$ / sq.ft"],
                ].map(([label, placeholder]) => (
                  <label key={label} className="text-sm font-medium text-neutral-700">{label}
                    <div className="mt-2 rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-4 py-3 text-sm text-neutral-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(15,23,42,0.04)]">{placeholder}</div>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Team access</p>
                    <p className="mt-1 text-xs text-neutral-500">Invite teammates and decide what each person can access.</p>
                  </div>
                  <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm">+ Add member</button>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  {[
                    ["Tyler Sellars", "tyler@company.com", "Owner", "All Vaults"],
                    ["Acquisitions Analyst", "analyst@company.com", "Editor", "Deals + comps"],
                    ["Asset Manager", "assetmanager@company.com", "Viewer", "Portfolio only"],
                  ].map(([name, email, role, access]) => (
                    <div key={email} className="grid grid-cols-[1.2fr_0.7fr_0.9fr] items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{name}</p>
                        <p className="text-xs text-neutral-500">{email}</p>
                      </div>
                      <button className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs font-medium text-neutral-700">{role}</button>
                      <button className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs font-medium text-neutral-700">{access}</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-neutral-700">Asset classes</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {["Multifamily", "Affordable housing", "Self storage", "Industrial", "Retail", "Office"].map((item, index) => (
                    <button key={item} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-sm ${index < 3 ? "border-[#d9d2c6] bg-[#f8f5ef] text-neutral-900" : "border-neutral-200 bg-white text-neutral-600"}`}>
                      <span className="flex items-center gap-2"><span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${index < 3 ? "border-neutral-400 bg-white text-neutral-900" : "border-neutral-300 text-transparent"}`}>✓</span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => go(3)} className="mt-8 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]">Continue to Vault setup</button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-900">Security + model training</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">Documents uploaded to your Vault stay inside your organization. Cactus does not train shared models on your documents outside your org.</p>
                <button className="mt-3 text-xs font-medium text-neutral-900 underline underline-offset-4">Learn about security</button>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-medium text-neutral-900">Trial access</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">50 documents to start. Deleted documents still count. No payment before setup.</p>
              </div>
              {helpOpen && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-4 text-white">
                  <p className="text-sm font-medium">Cactus help</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-400">Ask about team roles, security, data ingestion, or which settings matter for your first Vault.</p>
                  <div className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-neutral-300">How should we set this up for a multifamily investor?</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultSetup({ go }: { go: (screenIndex: number) => void }) {
  return (
    <div className="p-8">
      <SectionHeader eyebrow="Onboarding · Step 03" title="Create The Vault" subtitle="Choose the first sources for your Cactus engine. Start with documents, Google Drive, operating systems, APIs, or scrapers — Cactus will organize what it finds and show what needs review." />
      <div className="grid grid-cols-3 gap-4">
        {sourceCards.map((card) => (
          <div key={card.title} className="min-h-[210px] rounded-[1.6rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Pill tone={card.status === "Ready" ? "green" : card.status === "Approval required" ? "amber" : "default"}>{card.status}</Pill>
              <span className="text-xs text-neutral-400">{card.cost}</span>
            </div>
            <h3 className="mt-8 text-xl font-semibold tracking-[-0.04em] text-neutral-950">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-500">{card.note}</p>
            <button className="mt-6 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700">Set up</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={() => go(4)} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Start extracting data</button>
      </div>
    </div>
  );
}

function LiveExtraction({ go }: { go: (screenIndex: number) => void }) {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_360px] gap-5 p-8">
      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Onboarding · Step 04" title="Watch The Vault populate" subtitle="The system should feel alive immediately: extracting docs, detecting locations, creating records, and surfacing the review queue in real time." />
        <div className="space-y-3">
          {extractionEvents.map(([name, detail, status]) => (
            <div key={name} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${status === "running" ? "animate-pulse bg-blue-500" : status === "review" ? "bg-amber-400" : "bg-emerald-500"}`} />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{name}</p>
                  <p className="text-xs text-neutral-500">{detail}</p>
                </div>
              </div>
              <Pill tone={status === "review" ? "amber" : "default"}>{status}</Pill>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm text-emerald-300">Trial progress</p>
        <p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">48 / 50</p>
        <p className="mt-2 text-sm text-neutral-400">Documents scanned in your free trial. Deleted documents still count toward the trial limit.</p>
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-neutral-400">Documents uploaded</span><span>48</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">Documents remaining</span><span>2</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">Time limit</span><span>None</span></div>
        </div>
        <button onClick={() => go(5)} className="mt-10 w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-neutral-950">Enter Cactus app</button>
      </div>
    </div>
  );
}

function VaultTable() {
  return (
    <div className="p-8">
      <SectionHeader eyebrow="Vault workspace" title="Explore The Vault as a living table" subtitle="Rows are locations/properties. Columns are data endpoints from documents, emails, listings, Cactus data, premium sources, and user-approved edits." />
      <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex gap-2"><Pill>Rows: properties / locations</Pill><Pill>Columns: data endpoints</Pill><Pill tone="amber">7 review items</Pill></div>
          <div className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500">Ask your Vault: “Which properties fit our Nashville buy box?”</div>
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
        {['Drive time: 20 min', 'Radius: 5 miles', 'Units: 100-300', 'Vintage: 1975-2005', 'Flood zone: exclude AE', 'Source: all'].map((filter) => <div key={filter} className="mt-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600">{filter} <span className="float-right text-neutral-300">⌄</span></div>)}
        <div className="mt-5 border-t border-neutral-200 pt-5">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Matching records</p><span className="text-xs text-neutral-400">3</span></div>
          {['Riverside Flats', 'Hillside Trace', 'Rivergate Park'].map((property) => <div key={property} className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm"><p className="font-medium text-neutral-900">{property}</p><p className="mt-1 text-xs text-neutral-500">Internal comp · add to set</p></div>)}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-[#eef0eb] shadow-sm">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(35deg,transparent_47%,rgba(82,82,82,.16)_48%,rgba(82,82,82,.16)_52%,transparent_53%),linear-gradient(120deg,transparent_47%,rgba(82,82,82,.12)_48%,rgba(82,82,82,.12)_52%,transparent_53%)] [background-size:160px_160px,220px_220px]" />
        <div className="absolute left-[18%] top-[20%] h-[420px] w-[520px] rounded-full border border-emerald-500/30 bg-emerald-400/10" />
        <div className="absolute right-[10%] top-[18%] rounded-full border border-blue-400/40 bg-blue-100/50 px-3 py-1 text-xs text-blue-700">20-min drive time</div>
        {mapPins.map(([pos, name, detail]) => <div key={name} className={`absolute ${pos} group`}><div className="h-4 w-4 rounded-full border-2 border-white bg-neutral-950 shadow-lg" /><div className="mt-2 hidden rounded-xl bg-white p-3 text-xs shadow-xl group-hover:block"><p className="font-medium">{name}</p><p className="text-neutral-500">{detail}</p></div></div>)}
      </div>
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium">Map assistant</p>
        <div className="mt-5 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">Three records match the current drive-time, vintage, and flood-zone filters. Riverside Flats has the best rent-gap signal and two strong internal comps.</div>
        <div className="mt-3 rounded-2xl bg-neutral-950 p-4 text-sm leading-6 text-white">I can explain the match, widen the radius, or create a comp set from these 3 records.</div>
        <div className="mt-4 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-400">Ask about this map view…</div>
        <button className="mt-4 w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white">Create comp set from 3 matches</button>
      </div>
    </div>
  );
}

function DealAnalysis() {
  return (
    <div className="grid min-h-[690px] grid-cols-[260px_1fr_340px] gap-5 p-8">
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
        {['Overview', 'Documents', 'Extracted facts', 'Market', 'Rent comps', 'Sales comps', 'Underwriting', 'Memo'].map((item, i) => <div key={item} className={`rounded-xl px-3 py-2 text-sm ${i === 2 ? "bg-neutral-950 text-white" : "text-neutral-600"}`}>{item}</div>)}
      </aside>
      <main className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Deal workspace" title="Analyze a deal or address" subtitle="Drag documents into chat, select a Vault row, enter an address, or open deal-room data. Cactus extracts facts and ties every field back to source evidence." />
        <div className="grid grid-cols-2 gap-4">
          {dealFacts.map(([field, value, source, status]) => <div key={field} className="rounded-2xl border border-neutral-200 p-4"><div className="flex justify-between"><p className="text-xs text-neutral-400">{field}</p><Pill tone={status === "Review" ? "amber" : "green"}>{status}</Pill></div><p className="mt-3 text-lg font-medium tracking-[-0.03em]">{value}</p><p className="mt-2 text-xs text-neutral-400">Source: {source}</p></div>)}
        </div>
      </main>
      <aside className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
        <p className="text-sm font-medium">Deal chat</p>
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-neutral-600">Drop OM, T12, rent roll, or broker email here. I will match the address to The Vault, recommend comps, and flag missing data.</div>
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400">Drag documents</div>
      </aside>
    </div>
  );
}

function CompsData() {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_340px] gap-5 p-8">
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="Comps + enrichment" title="Approve comps and enrichments" subtitle="The system recommends comps, but the investor approves. Paid enrichment is offered at the moment of need with cost and value clearly shown." />
        <table className="w-full text-left text-sm"><thead className="text-xs text-neutral-500"><tr>{['Comp', 'Distance', 'Year', 'Units', '$/Unit', 'Decision'].map((h) => <th key={h} className="border-b border-neutral-200 px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{comps.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className="border-b border-neutral-100 px-3 py-4"><span className={i === 5 ? "rounded-full border border-neutral-200 px-2 py-1 text-xs" : ""}>{cell}</span></td>)}</tr>)}</tbody></table>
      </div>
      <div className="space-y-4">
        {['Cactus market pack — $49/deal', 'HelloData rent comps — $75/deal', 'ATTOM ownership/tax — $39/deal', 'Green Street outlook — quote'].map((item) => <div key={item} className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm"><p className="font-medium tracking-[-0.02em]">{item}</p><p className="mt-2 text-sm leading-6 text-neutral-500">Adds evidence to underwriting, comp support, and output citations.</p><button className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-sm">Add</button></div>)}
      </div>
    </div>
  );
}

function Outputs() {
  return (
    <div className="p-8">
      <SectionHeader eyebrow="Output builder" title="Generate IC and bank-ready outputs" subtitle="Convert the selected facts, comps, benchmarks, underwriting assumptions, and citations into professional materials the team can use." />
      <div className="grid grid-cols-3 gap-5">
        {['IC memo', 'Bank package', 'Investor package'].map((output, i) => <div key={output} className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm"><Pill tone={i === 2 ? "default" : "green"}>{i === 2 ? "Later" : "Ready"}</Pill><h3 className="mt-16 text-2xl font-semibold tracking-[-0.05em]">{output}</h3><p className="mt-3 text-sm leading-6 text-neutral-500">Executive summary, property overview, comps, market support, risks, citations, and appendix-ready source links.</p><button className="mt-6 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Preview</button></div>)}
      </div>
    </div>
  );
}

function Automations() {
  return (
    <div className="grid min-h-[690px] grid-cols-[1fr_380px] gap-5 p-8">
      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeader eyebrow="After MVP" title="Cheap automated weekly hitlists" subtitle="Screen many deals at low cost, enrich only the promising ones, and bring the team a ranked list of what to review every week." />
        <div className="grid grid-cols-3 gap-4">
          {['Tier 1: cheap screen', 'Tier 2: selective enrichment', 'Tier 3: deep analysis'].map((tier, i) => <div key={tier} className="rounded-2xl border border-neutral-200 p-5"><p className="text-sm font-medium">{tier}</p><p className="mt-10 text-4xl font-semibold tracking-[-0.06em]">{[124, 18, 4][i]}</p><p className="mt-2 text-sm text-neutral-500">deals/week</p></div>)}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm text-neutral-400">Broker product direction</p>
        <h3 className="mt-8 text-3xl font-semibold tracking-[-0.06em]">CRM-connected owner intelligence</h3>
        <p className="mt-4 text-sm leading-6 text-neutral-400">For brokers, the message shifts from investor brain to pipeline engine: connect Cactus data to CRM and outbound workflows, detect owner selling signals, prioritize pitch targets, generate BOV angles, and keep listing pursuits moving.</p>
        <div className="mt-6 space-y-2 text-xs text-neutral-300">
          <div className="rounded-xl bg-white/10 px-3 py-2">CRM sync + owner history</div>
          <div className="rounded-xl bg-white/10 px-3 py-2">Outbound sequences + pitch timing</div>
          <div className="rounded-xl bg-white/10 px-3 py-2">BOV targets + listing pipeline</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(0);
  const AppScreen = useMemo(() => [VaultTable, VaultMap, DealAnalysis, CompsData, Outputs, Automations][active - 5], [active]);

  if (active === 0) return <Homepage go={setActive} />;
  if (active === 1) return <SignupScreen go={setActive} />;

  const isOnboarding = active < 5;
  const shellTitle = isOnboarding ? "Onboarding" : "Cactus";
  const shellSubtitle = isOnboarding ? "Setup before app" : "Vault workspace";

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 p-3">
          <button onClick={() => setActive(0)} className="mb-7 flex items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-white">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-950 text-xs font-semibold text-white">C</div>
            <div><p className="text-xl font-light tracking-[-0.04em]">{shellTitle}</p><p className="text-xs text-neutral-400">{shellSubtitle}</p></div>
          </button>

          {isOnboarding ? (
            <>
              <p className="px-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Account setup flow</p>
              <nav className="mt-3 space-y-1">
                {onboardingSteps.map((step, index) => {
                  const screenIndex = index + 1;
                  return <button key={step} onClick={() => setActive(screenIndex)} className={`flex h-10 w-full items-center rounded-md px-3 text-left text-sm transition ${active === screenIndex ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:bg-white/70"}`}><span className="mr-3 text-xs text-neutral-400">{String(index + 1).padStart(2, "0")}</span>{step}</button>;
                })}
              </nav>
              <div className="mt-auto rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-medium">Not in the app yet</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">This rail is only the onboarding checklist: OAuth, company setup, Vault source setup, and first extraction. After this, the user enters the real app nav.</p>
              </div>
            </>
          ) : (
            <>
              <p className="px-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">App navigation</p>
              <nav className="mt-3 space-y-1">
                {appScreens.map((screen, index) => {
                  const screenIndex = index + 5;
                  return <button key={screen} onClick={() => setActive(screenIndex)} className={`flex h-10 w-full items-center rounded-md px-3 text-left text-sm transition ${active === screenIndex ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:bg-white/70"}`}><span className="mr-3 text-xs text-neutral-400">{String(index + 1).padStart(2, "0")}</span>{screen}</button>;
                })}
              </nav>
              <div className="mt-auto rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-medium">Product spine</p>
                <p className="mt-2 text-xs leading-5 text-neutral-500">Build The Vault → explore table/map/chat → select comps + enrichment → generate outputs.</p>
              </div>
            </>
          )}
        </aside>
        <section className="flex-1">
          {active === 2 && <AccountSetup go={setActive} />}
          {active === 3 && <VaultSetup go={setActive} />}
          {active === 4 && <LiveExtraction go={setActive} />}
          {active >= 5 && <AppScreen />}
        </section>
      </div>
    </main>
  );
}
