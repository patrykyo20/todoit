"use client";
import { Doc } from "@/convex/_generated/dataModel";
import moment from "moment";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";
import { memo, useMemo, useCallback } from "react";

interface CalendarMonthViewProps {
  calendarDays: Array<{
    date: Date;
    tasks: Array<Doc<"tasks">>;
    events: CalendarEvent[];
  }>;
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

const DayHeaders = memo(() => (
  <div className="grid grid-cols-7 bg-muted/50">
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
      <div
        key={day}
        className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
      >
        {day}
      </div>
    ))}
  </div>
));
DayHeaders.displayName = "DayHeaders";

interface CalendarDayProps {
  day: {
    date: Date;
    tasks: Array<Doc<"tasks">>;
    events: CalendarEvent[];
  };
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

const CalendarDay = memo(({ day, currentMonth, onDayClick }: CalendarDayProps) => {
  const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
  const isToday = moment(day.date).isSame(moment(), "day");
  const taskCount = day.tasks.length;
  const eventCount = day.events.length;
  const totalItems = taskCount + eventCount;

  const allItems = useMemo(() => {
    return [
      ...day.tasks.map((t) => ({ type: "task" as const, data: t })),
      ...day.events.map((e) => ({ type: "event" as const, data: e })),
    ].slice(0, 3);
  }, [day.tasks, day.events]);

  const handleClick = useCallback(() => {
    onDayClick(day.date);
  }, [day.date, onDayClick]);

  const dateKey = day.date.toISOString();

  return (
    <div
      key={dateKey}
      className={cn(
        "min-h-[120px] border-r border-b border-border p-2 transition-colors relative group cursor-pointer hover:bg-muted/50",
        !isCurrentMonth && "bg-muted/20",
        isToday && "bg-primary/10"
      )}
      onClick={handleClick}
      title="Click to add event"
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            !isCurrentMonth && "text-muted-foreground",
            isToday && "text-primary font-bold"
          )}
        >
          {day.date.getDate()}
        </span>
        {totalItems > 0 && (
          <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
            {totalItems}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {allItems.map((item, itemIndex) => {
          if (item.type === "task") {
            const task = item.data;
            const hasEvent = !!task.googleCalendarEventId;
            return (
              <div
                key={`task-${task._id}-${dateKey}-${itemIndex}`}
                className={cn(
                  "text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate",
                  hasEvent
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                )}
                title={task.taskName || "Untitled Task"}
              >
                {task.taskName || "Untitled Task"}
              </div>
            );
          } else {
            const event = item.data;
            const startTime = event.isAllDay
              ? ""
              : moment(event.start).format("HH:mm");
            return (
              <div
                key={`event-${event.id}-${dateKey}-${itemIndex}`}
                className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                title={`${event.title}${startTime ? ` at ${startTime}` : ""}`}
              >
                {startTime && (
                  <span className="font-medium">{startTime} </span>
                )}
                {event.title}
              </div>
            );
          }
        })}
        {totalItems > 3 && (
          <div className="text-xs text-muted-foreground px-1">
            +{totalItems - 3} more
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.day.date.getTime() === nextProps.day.date.getTime() &&
    prevProps.currentMonth.getTime() === nextProps.currentMonth.getTime() &&
    prevProps.day.tasks.length === nextProps.day.tasks.length &&
    prevProps.day.events.length === nextProps.day.events.length &&
    prevProps.day.tasks.every(
      (task, i) => task._id === nextProps.day.tasks[i]?._id &&
        task.isCompleted === nextProps.day.tasks[i]?.isCompleted
    ) &&
    prevProps.day.events.every(
      (event, i) => event.id === nextProps.day.events[i]?.id
    )
  );
});
CalendarDay.displayName = "CalendarDay";

export const CalendarMonthView = memo(({
  calendarDays,
  currentMonth,
  onDayClick,
}: CalendarMonthViewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <DayHeaders />
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            day={day}
            currentMonth={currentMonth}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  if (
    prevProps.currentMonth.getTime() !== nextProps.currentMonth.getTime() ||
    prevProps.calendarDays.length !== nextProps.calendarDays.length
  ) {
    return false;
  }

  return prevProps.calendarDays.every((day, index) => {
    const nextDay = nextProps.calendarDays[index];
    if (!nextDay) return false;
    return (
      day.date.getTime() === nextDay.date.getTime() &&
      day.tasks.length === nextDay.tasks.length &&
      day.events.length === nextDay.events.length
    );
  });
});
CalendarMonthView.displayName = "CalendarMonthView";

