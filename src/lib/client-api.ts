/** Keep provider/proxy failures readable; never automatically repeat a mutation. */
export async function api<T>(url: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(body === undefined ? 20000 : 65000),
      ...(body === undefined ? {} : {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new Error("The connection skipped a beat. Check your internet and try again. Your picks are still here.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "The music room is taking a moment. Please retry, or open are-we-vibing.vercel.app for the latest version.");
  return data as T;
}

const createdThisVisit = new Set<string>();
export function rememberCreator(id: string) {
  // Restricted storage must never turn a successfully saved session into an error.
  createdThisVisit.add(id);
  try { localStorage.setItem(`vibing:${id}`, "A"); } catch { /* In-memory ownership lasts for this visit. */ }
}
export function isCreator(id: string) {
  if (createdThisVisit.has(id)) return true;
  try { return localStorage.getItem(`vibing:${id}`) === "A"; } catch { return false; }
}
