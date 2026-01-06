"use client";
import { Calendar as CalendarIcon, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewModeToggleProps {
  viewMode: "month" | "week";
  onViewModeChange: (mode: "month" | "week") => void;
}

export function CalendarViewModeToggle({
  viewMode,
  onViewModeChange,
}: CalendarViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 border rounded-lg p-1 bg-background">
      <button
        onClick={() => onViewModeChange("month")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          viewMode === "month"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Grid className="w-4 h-4 inline mr-1" />
        Month
      </button>
      <button
        onClick={() => onViewModeChange("week")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          viewMode === "week"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarIcon className="w-4 h-4 inline mr-1" />
        Week
      </button>
    </div>
  );
}
