import { useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { convexTokenFromSession } from "@/lib/utils/convexTokenFromSession";

function base64UrlDecode(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  // atob exists in browsers; Next.js client component hook
  return atob(padded);
}

function getJwtExpMs(token: string): number | null {
  // JWT: header.payload.signature
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function useAuth() {
  const { data: session, status, update } = useSession();

  // NextAuth state machine:
  // - status === "loading" -> session is typically undefined
  // - status === "authenticated" -> session object
  // - status === "unauthenticated" -> session is null
  const isLoading = status === "loading";

  const convexToken = useMemo(
    () => convexTokenFromSession(session),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.convexToken]
  );

  // Cache token to avoid "forceRefreshToken" storms causing /api/auth/session spam.
  const tokenCacheRef = useRef<{ token: string | null; expMs: number | null }>({
    token: null,
    expMs: null,
  });

  // Keep cache in sync when session token changes.
  if (tokenCacheRef.current.token !== convexToken) {
    tokenCacheRef.current.token = convexToken;
    tokenCacheRef.current.expMs = convexToken ? getJwtExpMs(convexToken) : null;
  }

  return useMemo(
    () => ({
      isLoading,
      // Consider authenticated only when we actually have a Convex token.
      // This prevents "auth flapping" where session is undefined/null briefly
      // and Convex queries run as anonymous (viewerId null).
      isAuthenticated: !!convexToken,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        // If NextAuth is still resolving the session, don't force refresh yet.
        if (isLoading) {
          return null;
        }

        const cached = tokenCacheRef.current;
        const now = Date.now();
        const safetyWindowMs = 60_000; // 60s

        // If we already have a token that isn't near expiry, reuse it even if refresh is requested.
        if (
          cached.token &&
          cached.expMs &&
          cached.expMs - now > safetyWindowMs
        ) {
          return cached.token;
        }

        // If refresh is requested and token is missing/expired, ask NextAuth to update session (new token).
        if (forceRefreshToken) {
          const session = await update();

          return convexTokenFromSession(session);
        }

        // No refresh requested: return whatever we have (might be null).
        return convexToken;
      },
    }),
    // We only care about the user changes, and don't want to
    // bust the memo when we fetch a new token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, convexToken]
  );
}
