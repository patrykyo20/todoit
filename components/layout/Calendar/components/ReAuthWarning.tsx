"use client";
import { Button } from "@/components/ui/Button";
import { LogIn, RefreshCw, XCircle } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

interface ReAuthWarningProps {
  accountInfo:
    | {
        exists: boolean;
        hasAccessToken?: boolean | undefined;
        hasRefreshToken?: boolean | undefined;
        scope?: string | undefined;
        expiresAt?: number | undefined;
        isExpired?: boolean | null | undefined;
      }
    | null
    | undefined;
  isConnected: boolean;
}

export function ReAuthWarning({ accountInfo, isConnected }: ReAuthWarningProps) {
  const { toast } = useToast();
  const testAccess = useAction(api.googleCalendarTest.testCalendarAccess);
  const updateScope = useMutation(api.googleCalendar.updateAccountScope);
  const deleteAllAccountsAndSessions = useMutation(
    api.googleCalendar.deleteAllUserAccountsAndSessions
  );
  const [isTesting, setIsTesting] = useState(false);

  if (
    isConnected &&
    accountInfo?.scope?.includes("calendar") &&
    accountInfo?.hasRefreshToken
  ) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-sm text-red-900">
      <div className="flex items-start gap-3 mb-4">
        <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-base mb-2">
            ⚠️ Action Required: Re-authenticate to enable Google Calendar
          </p>
          <p className="mb-3">
            {!accountInfo?.hasRefreshToken
              ? "Your Google account is missing a refresh token. Without it, calendar access will expire and stop working."
              : !accountInfo?.scope?.includes("calendar")
                ? "Your Google account is missing calendar permissions."
                : "Your Google account needs to be re-authenticated."}{" "}
            To fix this:
          </p>
          <ol className="list-decimal list-inside space-y-2 mb-4 ml-2">
            <li>
              <strong>First, revoke access in Google:</strong> Go to{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 hover:text-blue-900"
              >
                Google Account Permissions
              </a>{" "}
              and remove access for this app
            </li>
            <li>
              Click the{" "}
              <strong>&quot;Re-authenticate with Calendar&quot;</strong> button
              below
            </li>
            <li>You will be signed out and redirected to Google</li>
            <li>
              Google will show a consent screen -{" "}
              <strong>
                make sure to check the box for calendar access and click Allow
              </strong>
            </li>
            <li>
              After signing in, you&apos;ll be redirected back and calendar will
              work
            </li>
          </ol>
          <div className="text-xs text-red-700 bg-red-100 p-3 rounded mb-4 space-y-2">
            <p>
              <strong>⚠️ CRITICAL - Why refresh token might be missing:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                You didn&apos;t revoke access in Google BEFORE
                re-authenticating
              </li>
              <li>
                You didn&apos;t check the calendar permission checkbox in
                Google&apos;s consent screen
              </li>
              <li>
                Your browser has cached credentials (try incognito mode)
              </li>
            </ul>
            <p className="mt-2">
              <strong>
                After re-authenticating, check the Convex logs (terminal) for
                messages starting with 🔐.
              </strong>{" "}
              They will show if Google returned a refresh token.
            </p>
          </div>
        </div>
      </div>

      {accountInfo && (
        <div className="mb-4 p-3 bg-yellow-100 rounded text-xs font-mono">
          <p>
            <strong>Debug info:</strong>
          </p>
          <p>Has account: {accountInfo.exists ? "Yes" : "No"}</p>
          {accountInfo.exists && (
            <>
              <p>
                Has access token:{" "}
                {accountInfo.hasAccessToken ? "Yes" : "No"}
              </p>
              <p>
                Has refresh token:{" "}
                {accountInfo.hasRefreshToken ? "Yes" : "No"}
              </p>
              <p>Scope: {accountInfo.scope}</p>
              <p>
                Has calendar in scope:{" "}
                {accountInfo.scope?.includes("calendar") ? "Yes" : "No"}
              </p>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={async () => {
            try {
              toast({
                title: "🔥 Nuclear Re-auth: Deleting everything...",
                description: "This will delete all accounts and sessions",
                duration: 3000,
              });

              const result = await deleteAllAccountsAndSessions();
              console.log("🗑️ Deleted:", result);

              localStorage.clear();
              sessionStorage.clear();

              await signOut({ redirect: false });

              await new Promise((resolve) => setTimeout(resolve, 1000));

              toast({
                title: "✅ Everything cleared! Redirecting to Google...",
                description: "You'll be asked to grant ALL permissions again.",
                duration: 2000,
              });

              await new Promise((resolve) => setTimeout(resolve, 500));
              await signIn("google", {
                callbackUrl: "/loggedin/calendar",
                redirect: true,
              });
            } catch (error) {
              console.error("Error during nuclear re-authentication:", error);
              toast({
                title: "❌ Error",
                description:
                  "Failed to start re-authentication. Please try again.",
                duration: 5000,
              });
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 text-base"
          size="lg"
        >
          <LogIn className="w-5 h-5 mr-2" />
          🔥 Nuclear Re-auth (Delete Everything & Start Fresh)
        </Button>
        {accountInfo?.scope && !accountInfo.scope.includes("calendar") && (
          <Button
            onClick={async () => {
              try {
                const newScope =
                  accountInfo.scope +
                  " https://www.googleapis.com/auth/calendar";
                await updateScope({ scope: newScope });
                toast({
                  title: "✅ Scope updated",
                  description:
                    "Calendar scope has been added. Please refresh the page.",
                  duration: 3000,
                });
                setTimeout(() => window.location.reload(), 1500);
              } catch {
                toast({
                  title: "❌ Error",
                  description: "Failed to update scope",
                  duration: 3000,
                });
              }
            }}
            variant="outline"
            className="border-yellow-600 text-yellow-800 hover:bg-yellow-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Fix Scope (Manual)
          </Button>
        )}
        <Button
          onClick={async () => {
            setIsTesting(true);
            try {
              const result = await testAccess({});
              if (result.connected) {
                toast({
                  title: "✅ Connected!",
                  description: result.message,
                  duration: 3000,
                });
                setTimeout(() => window.location.reload(), 1000);
              } else {
                toast({
                  title: "❌ Not Connected",
                  description: result.message,
                  duration: 3000,
                });
              }
            } catch {
              toast({
                title: "❌ Error",
                description: "Failed to test calendar access",
                duration: 3000,
              });
            } finally {
              setIsTesting(false);
            }
          }}
          variant="outline"
          className="border-yellow-600 text-yellow-800 hover:bg-yellow-100"
          disabled={isTesting}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isTesting ? "animate-spin" : ""}`}
          />
          {isTesting ? "Testing..." : "Test Connection"}
        </Button>
      </div>
    </div>
  );
}
