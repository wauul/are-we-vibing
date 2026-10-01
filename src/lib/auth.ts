import { randomBytes } from "node:crypto";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { validReviewPassword } from "./review-access";
import { friendPair } from "./social";
import { db } from "./db";
import { AppError } from "./errors";

export const authAvailable = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXTAUTH_SECRET);
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: authAvailable ? [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: { params: { scope: "openid email profile", prompt: "select_account" } },
  }), ...(process.env.PLAY_REVIEW_PASSWORD ? [CredentialsProvider({
    id: "play-review", name: "Review access",
    credentials: { password: { label: "Review password", type: "password" } },
    async authorize(credentials) {
      if (!validReviewPassword(credentials?.password)) return null;
      return db.$transaction(async tx => {
        const reviewer = await tx.user.upsert({
          where: { googleId: "play-review:reviewer" }, update: {},
          create: { googleId: "play-review:reviewer", name: "Play Reviewer", username: "play_reviewer" },
        });
        const friend = await tx.user.upsert({
          where: { googleId: "play-review:sample-friend" }, update: {},
          create: { googleId: "play-review:sample-friend", name: "Alex (sample friend)", username: "review_sample_friend" },
        });
        const pairKey = friendPair(reviewer.id, friend.id);
        await tx.friendship.upsert({ where: { pairKey }, update: { accepted: true },
          create: { pairKey, senderId: reviewer.id, recipientId: friend.id, accepted: true } });
        return { id: reviewer.id, name: reviewer.name };
      });
    },
  })] : [])] : [],
  pages: { signIn: "/friends", error: "/friends" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "play-review") return true;
      return account?.provider === "google" && (profile as { email_verified?: boolean })?.email_verified === true;
    },
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "play-review" && user) token.userId = user.id;
      if (account?.provider === "google") {
        // Google subject is the identity key. Never link accounts by a user-supplied email.
        const user = await db.user.upsert({
          where: { googleId: account.providerAccountId }, update: {},
          create: { googleId: account.providerAccountId, name: (profile?.name || "Music lover").slice(0, 40), username: `dj_${randomBytes(6).toString("hex")}` },
        });
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Keep Google tokens and email out of the client session and friends API.
      session.user = { id: String(token.userId || ""), name: session.user?.name };
      return session;
    },
  },
};
export async function currentUser() {
  if (!authAvailable) return null;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError("Sign in with Google to use your friends list.", 401);
  return user;
}
