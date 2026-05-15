export async function postCactusResource<T = unknown>(resource: string, body: Record<string, unknown>): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(`/api/cactus/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
