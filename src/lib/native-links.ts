export const APP_ORIGIN = "https://are-we-vibing.vercel.app";
export function appLinkPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.origin !== APP_ORIGIN || url.username || url.password) return null;
    if (!/^\/(results|session)\/[0-9a-f-]{36}$/.test(url.pathname) && url.pathname !== "/friends") return null;
    return url.pathname;
  } catch { return null; }
}
