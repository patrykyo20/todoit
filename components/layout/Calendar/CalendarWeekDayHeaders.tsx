"use client";
import { memo } from "react";
import { CalendarWeekDayHeader } from "./CalendarWeekDayHeader";

interface CalendarWeekDayHeadersProps {
  weekDays: Array<{
    date: Date;
    isToday: boolean;
  }>;
}

export const CalendarWeekDayHeaders = memo(({ weekDays }: CalendarWeekDayHeadersProps) => (
  <div
    className="grid grid-cols-[40px_repeat(7,1fr)] bg-muted/50 border-b shrink-0 sticky top-0 z-30"
    style={{ paddingRight: "17px" }}
  >
    <div className="p-3 border-r bg-muted/50 w-10"></div>
    {weekDays.map((day) => (
      <CalendarWeekDayHeader key={day.date.toISOString()} day={day} />
    ))}
  </div>
));
CalendarWeekDayHeaders.displayName = "CalendarWeekDayHeaders";
