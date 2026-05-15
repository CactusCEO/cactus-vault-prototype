import type { CactusBackendState } from "./cactus-backend";
import { loadBackendState as loadLocalBackendState, saveBackendState as saveLocalBackendState, updateBackendState as updateLocalBackendState } from "./cactus-backend-store";
import { hasSupabaseConfig, loadSupabaseBackendState, saveSupabaseBackendState, updateSupabaseBackendState } from "./cactus-supabase-store";

export type CactusPersistenceProvider = "supabase" | "local-json";

export function activePersistenceProvider(env: Record<string, string | undefined> = process.env): CactusPersistenceProvider {
  return hasSupabaseConfig(env) ? "supabase" : "local-json";
}

export async function loadCactusBackendState(): Promise<CactusBackendState> {
  return activePersistenceProvider() === "supabase" ? loadSupabaseBackendState() : loadLocalBackendState();
}

export async function saveCactusBackendState(state: CactusBackendState): Promise<CactusBackendState> {
  return activePersistenceProvider() === "supabase" ? saveSupabaseBackendState(state) : saveLocalBackendState(state);
}

export async function updateCactusBackendState<T>(mutate: (state: CactusBackendState) => T | Promise<T>): Promise<{ state: CactusBackendState; result: T }> {
  return activePersistenceProvider() === "supabase" ? updateSupabaseBackendState(mutate) : updateLocalBackendState(mutate);
}
