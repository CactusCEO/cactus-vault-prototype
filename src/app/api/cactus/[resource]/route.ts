import { NextResponse } from "next/server";
import {
  approveVaultFact,
  createAnalyzerRun,
  createBackendSpaceFromRows,
  createMapFeatureForRow,
  createSourceConnection,
  ingestDocument,
  runWorkflow,
} from "@/lib/cactus-backend";
import { bootstrapAuthSession } from "@/lib/cactus-auth";
import { loadCactusBackendState, updateCactusBackendState, activePersistenceProvider } from "@/lib/cactus-persistence";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string }> };

const jsonError = (message: string, status = 400) => NextResponse.json({ ok: false, error: message }, { status });

export async function GET(_request: Request, context: RouteContext) {
  const { resource } = await context.params;
  const state = await loadCactusBackendState();
  if (resource === "state") return NextResponse.json({ ok: true, provider: activePersistenceProvider(), state });
  const value = state[resource as keyof typeof state];
  if (!Array.isArray(value)) return jsonError(`Unknown Cactus resource: ${resource}`, 404);
  return NextResponse.json({ ok: true, [resource]: value });
}

export async function POST(request: Request, context: RouteContext) {
  const { resource } = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
    const { state, result } = await updateCactusBackendState((draft) => {
      switch (resource) {
        case "auth":
          return bootstrapAuthSession(draft, { email: body.email ?? "tyler@company.com", provider: body.provider ?? "email", displayName: body.displayName, companyName: body.companyName });
        case "documents":
          return ingestDocument(draft, { name: body.name ?? "Uploaded CRE source", text: body.text ?? "", kind: body.kind, source: body.source, rowId: body.rowId });
        case "vault-facts":
          if (!body.factId) throw new Error("factId is required");
          return approveVaultFact(draft, body.factId);
        case "spaces":
          return createBackendSpaceFromRows(draft, body.vaultRowIds ?? []);
        case "workflows":
          return runWorkflow(draft, body.workflow ?? "Untitled workflow", body.mode ?? "Run once");
        case "sources":
          return createSourceConnection(draft, { name: body.name ?? "Draft source", direction: body.direction ?? "Read to Vault" });
        case "maps":
          return createMapFeatureForRow(draft, { vaultRowId: body.vaultRowId, latitude: Number(body.latitude), longitude: Number(body.longitude) });
        case "analyzers":
          return createAnalyzerRun(draft, { analyzer: body.analyzer ?? "deal_screen", vaultRowIds: body.vaultRowIds ?? [] });
        default:
          throw new Error(`Unknown Cactus resource: ${resource}`);
      }
    });
    return NextResponse.json({ ok: true, provider: activePersistenceProvider(), result, state });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Cactus backend action failed");
  }
}
