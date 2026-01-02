"use client";
import { CheckCircle2, XCircle } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden sm:inline">Connected to Google Calendar</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Not connected</span>
        </div>
      )}
    </div>
  );
}
