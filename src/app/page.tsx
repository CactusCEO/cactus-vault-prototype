"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createInitialState,
  deterministicAssistantReply,
  extractVaultRowFromText,
  generateInvestmentOutput,
  makeId,
  nowIso,
  STORAGE_KEY,
  validateApiKeyShape,
  type CactusState,
  type ChatMessage,
  type DocumentRecord,
  type Screen,
  type SpaceRecord,
  type VaultRow,
  type WorkflowRecord,
} from "@/lib/cactus";

const sampleDeal = `Property: Ocean Drive Retail Center.
Location: South Beach Miami FL.
Asset class: retail shopping center.
Class B.
Size: 48,000 sf.
Price: $18.5M.
NOI: $1.18M.
Entry cap: 6.4%.
Tenant mix includes restaurants, boutique fitness, and local services. Sponsor wants Class A comps but is open to Class B if margins are stronger.`;

const nav: Array<[Screen, string]> = [
  ["assistant", "Assistant"],
  ["vault", "Vault"],
  ["spaces", "Spaces"],
  ["workflows", "Workflows"],
  ["settings", "Settings"],
];

function loadState(): CactusState {
  if (typeof window === "undefined") return createInitialState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw) as CactusState;
    return { ...createInitialState(), ...parsed, workflows: parsed.workflows?.length ? parsed.workflows : createInitialState().workflows };
  } catch {
    return createInitialState();
  }
}

function selectedRows(state: CactusState) {
  return state.vaultRows.filter((row) => state.selectedRowIds.includes(row.id));
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${tones[tone]}`}>{children}</span>;
}

function Composer({ value, setValue, onSend, disabled }: { value: string; setValue: (value: string) => void; onSend: () => void; disabled?: boolean }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.14)]">
      <textarea
        aria-label="Assistant prompt"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") onSend();
        }}
        placeholder="How can I help? Use @ Selected Properties or # Main Vault…"
        className="min-h-24 w-full resize-none rounded-2xl border-0 bg-neutral-50 p-4 text-sm outline-none placeholder:text-neutral-400"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs">
          {['@ Selected Properties', '# Main Vault', 'Sources', 'Create', 'Workflow'].map((chip) => <span key={chip} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-600">{chip}</span>)}
        </div>
        <button disabled={disabled} onClick={onSend} className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300">Ask Cactus</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [state, setState] = useState<CactusState>(() => createInitialState());
  const [screen, setScreen] = useState<Screen>("assistant");
  const [apiKey, setApiKey] = useState("");
  const [dealText, setDealText] = useState(sampleDeal);
  const [prompt, setPrompt] = useState("Review this South Beach shopping center deal and tell me what to verify before IC.");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("Working app mode: local persistent demo.");
  const [workflowFilter, setWorkflowFilter] = useState<"All" | WorkflowRecord["status"]>("All");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setState(loadState()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const rows = useMemo(() => selectedRows(state), [state]);

  const updateState = (updater: (current: CactusState) => CactusState) => setState((current) => updater(current));

  const signup = () => {
    updateState((current) => ({ ...current, user: { name: "Tyler", email: "tyler@example.com", signedIn: true } }));
    setToast("Signed in. Start by adding a deal document.");
  };

  const connectApiKey = () => {
    if (!validateApiKeyShape(apiKey)) {
      updateState((current) => ({ ...current, openAiConnected: false, openAiKeyPreview: "" }));
      setToast("API key rejected safely. Use an OpenAI-style key beginning with sk-. Cactus fallback still works.");
      return;
    }
    updateState((current) => ({ ...current, openAiConnected: true, openAiKeyPreview: `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}` }));
    setToast("OpenAI key connected for this local demo. It is only sent to the server when you ask Cactus.");
  };

  const addDocument = (text: string, name = "pasted-deal-note.txt") => {
    const row = extractVaultRowFromText(text, name);
    const doc: DocumentRecord = { id: makeId("doc"), name, text, createdAt: nowIso(), extractedRowIds: [row.id] };
    updateState((current) => ({
      ...current,
      documents: [doc, ...current.documents],
      vaultRows: [row, ...current.vaultRows],
      selectedRowIds: [row.id],
    }));
    setScreen("vault");
    setToast(`Extracted ${row.propertyName} into Vault and selected it as Assistant context.`);
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    addDocument(text || `Document uploaded: ${file.name}. Needs OCR/extraction review.`, file.name);
  };

  const sendPrompt = async (mode = "Analyze") => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    setBusy(true);
    const userMessage: ChatMessage = { id: makeId("msg"), role: "user", content: cleanPrompt, createdAt: nowIso() };
    updateState((current) => ({ ...current, messages: [...current.messages, userMessage] }));
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, prompt: cleanPrompt, mode, vaultContext: rows }),
      });
      const data = await response.json();
      const assistantMessage: ChatMessage = { id: makeId("msg"), role: "assistant", content: data.content || deterministicAssistantReply(cleanPrompt, rows, mode), createdAt: nowIso() };
      updateState((current) => ({ ...current, messages: [...current.messages, assistantMessage] }));
      setToast(data.connected ? "OpenAI answered using selected Vault context." : "Cactus fallback answered using selected Vault context.");
    } catch {
      const assistantMessage: ChatMessage = { id: makeId("msg"), role: "assistant", content: deterministicAssistantReply(cleanPrompt, rows, mode), createdAt: nowIso() };
      updateState((current) => ({ ...current, messages: [...current.messages, assistantMessage] }));
      setToast("Network failed; deterministic Cactus fallback answered instead.");
    } finally {
      setBusy(false);
    }
  };

  const createSpace = () => {
    const output = generateInvestmentOutput(rows, state.messages);
    const space: SpaceRecord = {
      id: makeId("space"),
      title: rows[0] ? `${rows[0].propertyName} Review` : "Untitled Cactus Space",
      contextRowIds: state.selectedRowIds,
      messages: state.messages,
      output,
      createdAt: nowIso(),
    };
    updateState((current) => ({ ...current, spaces: [space, ...current.spaces] }));
    setScreen("spaces");
    setToast("Created a Space from the selected Vault context and Assistant conversation.");
  };

  const downloadOutput = (space: SpaceRecord) => {
    const blob = new Blob([space.output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${space.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Downloaded markdown output.");
  };

  const shareSpace = async (space: SpaceRecord) => {
    const shareUrl = `${window.location.origin}/share/${space.id}`;
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    updateState((current) => ({ ...current, spaces: current.spaces.map((item) => item.id === space.id ? { ...item, shareUrl } : item) }));
    setToast("Copied share link and saved it on the Space.");
  };

  const resetDemo = () => {
    const next = createInitialState();
    setState(next);
    setApiKey("");
    setScreen("assistant");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setToast("Demo reset. Backup remains available locally.");
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-neutral-200 bg-white p-4">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-950 text-sm font-semibold text-white">C</div>
            <div><p className="font-serif text-2xl tracking-[-0.05em]">Cactus</p><p className="text-xs text-neutral-400">Working MVP</p></div>
          </div>
          {!state.user.signedIn && <button onClick={signup} className="mb-4 w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white">Sign up / enter app</button>}
          <nav className="space-y-1">
            {nav.map(([key, label]) => (
              <button key={key} onClick={() => setScreen(key)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${screen === key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <span>{label}</span>
                {key === "vault" && <span>{state.vaultRows.length}</span>}
                {key === "spaces" && <span>{state.spaces.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
            <p className="font-medium text-neutral-800">Current context</p>
            <p className="mt-1">{rows.length ? `${rows.length} selected Vault row${rows.length === 1 ? "" : "s"}` : "No selected rows"}</p>
            <p className="mt-1">API: {state.openAiConnected ? state.openAiKeyPreview : "Fallback mode"}</p>
          </div>
        </aside>

        <section className="flex-1 overflow-auto p-6">
          <header className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Vault → Assistant → Space → Output</p>
              <h1 className="font-serif text-4xl tracking-[-0.06em]">{nav.find(([key]) => key === screen)?.[1]}</h1>
            </div>
            <div className="flex items-center gap-2"><Pill tone={state.user.signedIn ? "green" : "amber"}>{state.user.signedIn ? "Signed in" : "Not signed in"}</Pill><Pill tone={state.openAiConnected ? "green" : "blue"}>{state.openAiConnected ? "OpenAI connected" : "Fallback AI"}</Pill></div>
          </header>

          <div role="status" className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">{toast}</div>

          {screen === "assistant" && (
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <section className="space-y-4">
                <Composer value={prompt} setValue={setPrompt} onSend={() => sendPrompt("Analyze")} disabled={busy} />
                <div className="flex flex-wrap gap-2">
                  {[
                    ["Review a deal", "Review this deal like an acquisitions associate. What matters before IC?"],
                    ["Build comps", "Build a local comp strategy from selected Vault rows. Separate direct comps from benchmark context."],
                    ["Draft IC memo", "Draft an IC memo section using selected Vault rows and cite the source fields."],
                    ["Prepare lender package", "Prepare lender package talking points and missing diligence list."],
                  ].map(([label, text]) => <button key={label} onClick={() => { setPrompt(text); void sendPrompt(label); }} className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 shadow-sm hover:bg-neutral-50">{label}</button>)}
                  <button onClick={createSpace} className="rounded-full bg-neutral-950 px-3 py-2 text-xs text-white shadow-sm">Create Space</button>
                </div>
                <div className="space-y-3">
                  {state.messages.map((message) => <article key={message.id} className={`rounded-3xl border p-4 text-sm shadow-sm ${message.role === "user" ? "ml-12 border-neutral-200 bg-white" : "mr-12 border-neutral-200 bg-neutral-50"}`}><p className="mb-1 text-xs uppercase tracking-[0.14em] text-neutral-400">{message.role}</p><p className="whitespace-pre-wrap leading-6">{message.content}</p></article>)}
                </div>
              </section>
              <AddDocumentPanel dealText={dealText} setDealText={setDealText} addDocument={addDocument} fileInput={fileInput} handleFile={handleFile} documents={state.documents} />
            </div>
          )}

          {screen === "vault" && <VaultScreen state={state} setState={setState} setScreen={setScreen} />}
          {screen === "spaces" && <SpacesScreen spaces={state.spaces} rows={state.vaultRows} downloadOutput={downloadOutput} shareSpace={shareSpace} createSpace={createSpace} />}
          {screen === "workflows" && <WorkflowsScreen workflows={state.workflows} filter={workflowFilter} setFilter={setWorkflowFilter} setState={setState} />}
          {screen === "settings" && <SettingsScreen apiKey={apiKey} setApiKey={setApiKey} connectApiKey={connectApiKey} resetDemo={resetDemo} state={state} />}
        </section>
      </div>
    </main>
  );
}

function AddDocumentPanel({ dealText, setDealText, addDocument, fileInput, handleFile, documents }: { dealText: string; setDealText: (value: string) => void; addDocument: (text: string, name?: string) => void; fileInput: React.RefObject<HTMLInputElement | null>; handleFile: (file: File) => Promise<void>; documents: DocumentRecord[] }) {
  return <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="font-medium">Sources</p><p className="text-xs text-neutral-400">Paste or upload a deal note</p></div><Pill>{documents.length} docs</Pill></div><textarea aria-label="Deal document text" value={dealText} onChange={(event) => setDealText(event.target.value)} className="mt-4 h-56 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm outline-none focus:border-neutral-400" /><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => addDocument(dealText)} className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white">Extract to Vault</button><button onClick={() => fileInput.current?.click()} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700">Upload file</button></div><input ref={fileInput} type="file" className="hidden" accept=".txt,.md,.csv,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); }} /><div className="mt-4 space-y-2 text-xs text-neutral-500">{documents.slice(0, 4).map((doc) => <p key={doc.id} className="truncate rounded-lg bg-neutral-50 px-3 py-2">{doc.name}</p>)}</div></aside>;
}

function VaultScreen({ state, setState, setScreen }: { state: CactusState; setState: React.Dispatch<React.SetStateAction<CactusState>>; setScreen: (screen: Screen) => void }) {
  const [query, setQuery] = useState("");
  const filtered = state.vaultRows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => setState((current) => ({ ...current, selectedRowIds: current.selectedRowIds.includes(id) ? current.selectedRowIds.filter((rowId) => rowId !== id) : [...current.selectedRowIds, id] }));
  return <section className="space-y-4"><div className="flex gap-2"><input aria-label="Search Vault" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Vault rows…" className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none" /><button onClick={() => setScreen("assistant")} className="rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white">Ask with selection</button></div><div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-neutral-100 text-xs uppercase tracking-[0.12em] text-neutral-500"><tr><th className="p-3">Use</th><th>Property</th><th>Location</th><th>Asset</th><th>Class</th><th>Size</th><th>YR 1 NOI</th><th>Entry Cap</th><th>Status</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id} className="border-t border-neutral-100 hover:bg-neutral-50"><td className="p-3"><input aria-label={`Select ${row.propertyName}`} type="checkbox" checked={state.selectedRowIds.includes(row.id)} onChange={() => toggle(row.id)} /></td><td className="font-medium">{row.propertyName}<p className="text-xs font-normal text-neutral-400">Source: {row.source}</p></td><td>{row.location}</td><td>{row.assetClass}</td><td>{row.qualityClass}</td><td>{row.size}</td><td>{row.yr1Noi}</td><td>{row.entryCapRate}</td><td><Pill tone={row.status === "Needs review" ? "amber" : row.status === "Reviewed" ? "green" : "neutral"}>{row.status}</Pill></td></tr>)}</tbody></table>{!filtered.length && <p className="p-6 text-sm text-neutral-500">No rows yet. Add a source from Assistant.</p>}</div><div className="grid gap-4 lg:grid-cols-3"><div className="rounded-3xl border border-neutral-200 bg-white p-4"><p className="font-medium">Map context</p><div className="relative mt-3 h-48 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_35%_45%,rgba(245,158,11,.35),transparent_18%),radial-gradient(circle_at_65%_35%,rgba(59,130,246,.28),transparent_16%),linear-gradient(135deg,#f5f5f4,#e7e5e4)]"><span className="absolute left-1/2 top-1/2 rounded-full bg-neutral-950 px-3 py-1 text-xs text-white">{state.selectedRowIds.length || state.vaultRows.length} pins</span></div></div><div className="rounded-3xl border border-neutral-200 bg-white p-4"><p className="font-medium">Primary context</p><p className="mt-2 text-sm text-neutral-500">Selected local/asset-specific comps feed Assistant first.</p></div><div className="rounded-3xl border border-neutral-200 bg-white p-4"><p className="font-medium">Benchmark context</p><p className="mt-2 text-sm text-neutral-500">MSA, state, national data are sanity checks and devil’s-advocate context.</p></div></div></section>;
}

function SpacesScreen({ spaces, rows, downloadOutput, shareSpace, createSpace }: { spaces: SpaceRecord[]; rows: VaultRow[]; downloadOutput: (space: SpaceRecord) => void; shareSpace: (space: SpaceRecord) => Promise<void>; createSpace: () => void }) {
  return <section className="space-y-4"><button onClick={createSpace} className="rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white">Create Space from current context</button>{spaces.map((space) => <article key={space.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl tracking-[-0.04em]">{space.title}</h2><p className="mt-1 text-sm text-neutral-500">Context rows: {space.contextRowIds.length} · {new Date(space.createdAt).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => downloadOutput(space)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm">Download</button><button onClick={() => void shareSpace(space)} className="rounded-xl bg-neutral-950 px-3 py-2 text-sm text-white">Share</button></div></div><pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{space.output}</pre>{space.shareUrl && <p className="mt-3 text-xs text-neutral-500">Share link: {space.shareUrl}</p>}</article>)}{!spaces.length && <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">No Spaces yet. Ask Cactus, then create a Space.</div>}<p className="text-xs text-neutral-400">Available Vault rows for outputs: {rows.length}</p></section>;
}

function WorkflowsScreen({ workflows, filter, setFilter, setState }: { workflows: WorkflowRecord[]; filter: "All" | WorkflowRecord["status"]; setFilter: (filter: "All" | WorkflowRecord["status"]) => void; setState: React.Dispatch<React.SetStateAction<CactusState>> }) {
  const shown = filter === "All" ? workflows : workflows.filter((workflow) => workflow.status === filter);
  const cycle = (workflow: WorkflowRecord) => setState((current) => ({ ...current, workflows: current.workflows.map((item) => item.id === workflow.id ? { ...item, status: workflow.status === "Active" ? "Needs review" : workflow.status === "Needs review" ? "Archived" : "Active" } : item) }));
  return <section className="space-y-4"><div className="flex flex-wrap gap-2">{(["All", "Active", "Needs review", "Archived"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-2 text-sm ${filter === item ? "bg-neutral-950 text-white" : "border border-neutral-200 bg-white text-neutral-600"}`}>{item}</button>)}</div><div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">{shown.map((workflow) => <div key={workflow.id} className="grid grid-cols-[1fr_160px_160px] items-center gap-4 border-b border-neutral-100 p-4 text-sm"><div><p className="font-medium">{workflow.name}</p><p className="text-xs text-neutral-400">{workflow.trigger} → {workflow.output}</p></div><Pill tone={workflow.status === "Active" ? "green" : workflow.status === "Needs review" ? "amber" : "neutral"}>{workflow.status}</Pill><button onClick={() => cycle(workflow)} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs">Cycle status</button></div>)}</div>{!shown.length && <p className="rounded-3xl bg-white p-6 text-sm text-neutral-500">No workflows in this status.</p>}</section>;
}

function SettingsScreen({ apiKey, setApiKey, connectApiKey, resetDemo, state }: { apiKey: string; setApiKey: (value: string) => void; connectApiKey: () => void; resetDemo: () => void; state: CactusState }) {
  return <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl tracking-[-0.04em]">Connect ChatGPT API</h2><p className="mt-2 text-sm text-neutral-500">Paste an OpenAI key for live calls. Without it, Cactus uses deterministic fallback so the demo still works.</p><input aria-label="OpenAI API key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-…" type="password" className="mt-4 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" /><button onClick={connectApiKey} className="mt-3 rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white">Connect OpenAI</button><p className="mt-3 text-xs text-neutral-400">Status: {state.openAiConnected ? `Connected ${state.openAiKeyPreview}` : "Fallback mode"}</p></div><div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl tracking-[-0.04em]">Demo data</h2><p className="mt-2 text-sm text-neutral-500">Local persistence uses this browser’s storage so refresh testing behaves like a working app.</p><button onClick={resetDemo} className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Reset local demo</button></div></section>;
}
