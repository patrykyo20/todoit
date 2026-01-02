import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ConvexAdapter } from "./app/ConvexAdapter";
import { importPKCS8, SignJWT } from "jose";

if (process.env.CONVEX_AUTH_PRIVATE_KEY === undefined) {
  throw new Error("Missing CONVEX_AUTH_PRIVATE_KEY");
}

if (process.env.JWKS === undefined) {
  throw new Error("Missing JWKS");
}

if (process.env.NEXT_PUBLIC_CONVEX_URL === undefined) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
}

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
  /.cloud$/,
  ".site"
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
        },
      },
      // Allow linking this OAuth account to existing user with same email
      // This is needed when re-authenticating after deleting the account
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: ConvexAdapter,
  callbacks: {
    async signIn({ account, user }) {
      console.log("🔐 SignIn callback - Account data from Google:", {
        provider: account?.provider,
        hasAccessToken: !!account?.access_token,
        hasRefreshToken: !!account?.refresh_token,
        scope: account?.scope,
        expiresAt: account?.expires_at,
        userId: user?.id,
      });

      if (account && !account.refresh_token) {
        console.error("❌ WARNING: Google did NOT return a refresh token!");
        console.error("Possible causes:");
        console.error(
          "1. You didn't revoke access in Google before re-authenticating"
        );
        console.error("2. Browser has cached credentials (try incognito mode)");
        console.error("3. Google didn't show consent screen");
      }

      // CRITICAL: Force update account tokens even if user already exists
      // This is necessary because NextAuth v5 doesn't always call linkAccount for existing users
      if (account && account.refresh_token && account.providerAccountId) {
        console.log("🔄 Forcing account tokens update for existing user...");
        try {
          // Import fetchMutation dynamically to avoid circular dependency
          const { fetchMutation } = await import("convex/nextjs");
          const { api } = await import("@/convex/_generated/api");

          // Update tokens using providerAccountId (no userId needed)
          await fetchMutation(api.authAdopter.forceUpdateAccountTokens, {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
            secret: process.env.CONVEX_AUTH_ADAPTER_SECRET!,
          });
          console.log(
            "✅ Account tokens forcefully updated with refresh token!"
          );
        } catch (error) {
          console.error("❌ Failed to force update account tokens:", error);
        }
      }

      return true;
    },
    async session({ session }) {
      const privateKey = await importPKCS8(
        process.env.CONVEX_AUTH_PRIVATE_KEY!,
        "RS256"
      );

      const convexToken = await new SignJWT({
        sub: session.userId,
      })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setIssuer(CONVEX_SITE_URL)
        .setAudience("convex")
        .setExpirationTime("1h")
        .sign(privateKey);

      return { ...session, convexToken };
    },
  },
});
