import { api } from "./client-api";
let initialized: Promise<void> | undefined;
export async function connectNativeYouTube() {
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  const attempt = await api<{ clientId: string }>("/api/native-google", { action: "begin" });
  initialized ||= SocialLogin.initialize({ google: { webClientId: attempt.clientId, mode: "online" } }).catch(error => { initialized = undefined; throw error; });
  await initialized;
  const login = await SocialLogin.login({ provider: "google", options: { scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/youtube.readonly"], forceRefreshToken: true } });
  if (login.result.responseType !== "online" || !login.result.accessToken?.token) throw new Error("YouTube access was not granted.");
  await api("/api/youtube/connect", { action: "native", accessToken: login.result.accessToken.token });
}
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
