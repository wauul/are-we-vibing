import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "./db";

export function pushConfigured() { return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); }
/** Optional delivery is isolated from successful AI generation. Never log tokens or credentials. */
export async function notifyCreator(id: string) {
  if (!pushConfigured()) return;
  const session = await db.session.findUnique({ where: { id }, select: { deviceToken: true, pushSentAt: true, resultJson: true } });
  if (!session?.deviceToken || session.pushSentAt || !session.resultJson) return;
  const token = session.deviceToken;
  try {
    const app = getApps().find(a => a.name === "vibe-push") || initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
    }, "vibe-push");
    await getMessaging(app).send({ token,
      notification: { title: "Your friend just vibed!", body: "See how compatible you two really are 👀" },
      data: { url: `https://are-we-vibing.vercel.app/results/${id}`, sessionId: id },
      android: { priority: "high", ttl: 86400000, notification: { channelId: "vibe-results", tag: id, icon: "ic_stat_vibe", color: "#e9794c" } },
    });
    await db.session.updateMany({ where: { id, deviceToken: token }, data: { pushSentAt: new Date() } });
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.warn("Optional push delivery failed", code || "unavailable");
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token")
      await db.session.updateMany({ where: { id, deviceToken: token }, data: { deviceToken: null } });
  }
}
