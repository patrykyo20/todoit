"use client";
import { ReactNode } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "@/hooks";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </SessionProvider>
  );
}
