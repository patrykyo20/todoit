import { Session } from "next-auth";

export function convexTokenFromSession(
  session: Session | null | undefined
): string | null {
  return session?.convexToken ?? null;
}
