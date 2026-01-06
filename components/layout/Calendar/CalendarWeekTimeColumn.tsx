"use client";
import { memo } from "react";
import { cn } from "@/lib/utils";

export const CalendarWeekTimeColumn = memo(() => (
  <div className="border-r sticky left-0 z-20 bg-background w-10">
    {Array.from({ length: 24 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-16 border-b border-border flex items-start justify-end pr-2 pt-1",
          i < 8
            ? "bg-muted/40 text-muted-foreground/60"
            : "bg-background text-foreground"
        )}
      >
        <span className="text-xs">{i.toString().padStart(2, "0")}:00</span>
      </div>
    ))}
  </div>
));
CalendarWeekTimeColumn.displayName = "CalendarWeekTimeColumn";
