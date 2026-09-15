import { api } from "./client-api";
let initialized: Promise<void> | undefined;
export async function nativeGoogleSignIn() {
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  const attempt = await api<{ id: string; nonce: string; clientId: string }>("/api/native-google", { action: "begin" });
  initialized ||= SocialLogin.initialize({ google: { webClientId: attempt.clientId, mode: "online" } }).catch(error => { initialized = undefined; throw error; });
  await initialized;
  // Android Credential Manager displays its native account picker; no browser redirect.
  const login = await SocialLogin.login({ provider: "google", options: { nonce: attempt.nonce, style: "standard", scopes: ["email", "profile"] } });
  if (login.result.responseType !== "online" || !login.result.idToken) throw new Error("Google sign-in did not finish.");
  await api("/api/native-google", { action: "finish", id: attempt.id, idToken: login.result.idToken });
  window.location.assign("/friends");
}
