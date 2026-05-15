import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createEmptyBackendState, type CactusBackendState } from "./cactus-backend";

export const DEFAULT_BACKEND_STATE_PATH = process.env.CACTUS_BACKEND_STATE_PATH ?? "/tmp/cactus-vault-prototype/backend-state.json";

export async function loadBackendState(path = DEFAULT_BACKEND_STATE_PATH): Promise<CactusBackendState> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as CactusBackendState;
    return { ...createEmptyBackendState(), ...parsed, version: 1 };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    const state = createEmptyBackendState();
    await saveBackendState(state, path);
    return state;
  }
}

export async function saveBackendState(state: CactusBackendState, path = DEFAULT_BACKEND_STATE_PATH): Promise<CactusBackendState> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2), "utf8");
  return state;
}

export async function updateBackendState<T>(mutate: (state: CactusBackendState) => T | Promise<T>, path = DEFAULT_BACKEND_STATE_PATH): Promise<{ state: CactusBackendState; result: T }> {
  const state = await loadBackendState(path);
  const result = await mutate(state);
  await saveBackendState(state, path);
  return { state, result };
}
