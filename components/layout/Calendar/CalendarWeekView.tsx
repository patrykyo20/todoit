"use client";
import { memo, useRef, type RefObject } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import type { CalendarEvent } from "@/types";
import { CalendarWeekTimeColumn } from "./CalendarWeekTimeColumn";
import { CalendarWeekDayColumn } from "./CalendarWeekDayColumn";
import { CalendarWeekDayHeaders } from "./CalendarWeekDayHeaders";

interface CalendarWeekViewProps {
  weekDays: Array<{
    date: Date;
    tasks: Array<Doc<"tasks">>;
    events: CalendarEvent[];
    isToday: boolean;
    dateKey: string;
  }>;
  currentWeek: Date;
  onHourClick: (date: Date, hour: number) => void;
  weekCalendarRef?: RefObject<HTMLDivElement | null>;
}

export const CalendarWeekView = memo(
  ({ weekDays, onHourClick, weekCalendarRef }: CalendarWeekViewProps) => {
    // Use provided ref or create a local one if not provided
    const localRef = useRef<HTMLDivElement>(null);
    const ref = weekCalendarRef || localRef;

    return (
      <div
        className="border rounded-lg overflow-hidden bg-background flex flex-col"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <CalendarWeekDayHeaders weekDays={weekDays} />

        {/* Scrollable time slots grid */}
        <div
          ref={ref}
          className="grid grid-cols-[40px_repeat(7,1fr)] relative overflow-y-auto flex-1"
          style={{
            scrollbarGutter: "stable",
            willChange: "scroll-position",
          }}
        >
          <CalendarWeekTimeColumn />

          {/* Days columns with positioned events */}
          {weekDays.map((day) => (
            <CalendarWeekDayColumn key={day.dateKey} day={day} onHourClick={onHourClick} />
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    if (
      prevProps.currentWeek.getTime() !== nextProps.currentWeek.getTime() ||
      prevProps.weekDays.length !== nextProps.weekDays.length
    ) {
      return false;
    }

    return prevProps.weekDays.every((day, index) => {
      const nextDay = nextProps.weekDays[index];
      if (!nextDay) return false;
      return (
        day.dateKey === nextDay.dateKey &&
        day.isToday === nextDay.isToday &&
        day.tasks.length === nextDay.tasks.length &&
        day.events.length === nextDay.events.length
      );
    });
  }
);
CalendarWeekView.displayName = "CalendarWeekView";
