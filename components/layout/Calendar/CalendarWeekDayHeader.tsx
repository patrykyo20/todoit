"use client";
import { memo } from "react";
import moment from "moment";
import { cn } from "@/lib/utils";

interface CalendarWeekDayHeaderProps {
  day: {
    date: Date;
    isToday: boolean;
  };
}

export const CalendarWeekDayHeader = memo(({ day }: CalendarWeekDayHeaderProps) => (
  <div
    key={day.date.toISOString()}
    className="p-3 text-center border-r last:border-r-0 bg-muted/50 pr-0 lg:pr-[14.5px]"
  >
    <div className="text-xs text-muted-foreground">
      {moment(day.date).format("ddd")}
    </div>
    <div
      className={cn(
        "text-lg font-semibold mt-1",
        moment(day.date).isSame(moment(), "day") && "text-primary"
      )}
    >
      {moment(day.date).format("D")}
    </div>
  </div>
));
CalendarWeekDayHeader.displayName = "CalendarWeekDayHeader";
