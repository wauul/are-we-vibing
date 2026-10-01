export const APP_ORIGIN = "https://are-we-vibing.vercel.app";
export function appLinkPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.origin !== APP_ORIGIN || url.username || url.password) return null;
    if (url.pathname === "/friends/add") {
      const username = url.searchParams.get("username");
      if (username === null) return url.pathname;
      if (!/^[a-z0-9_]{3,24}$/.test(username)) return null;
      return `${url.pathname}?username=${encodeURIComponent(username)}`;
    }
    if (!/^\/(results|session)\/[0-9a-f-]{36}$/.test(url.pathname) && url.pathname !== "/friends") return null;
    return url.pathname;
  } catch { return null; }
}
