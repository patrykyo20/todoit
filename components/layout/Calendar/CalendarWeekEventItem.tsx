"use client";
import { memo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import type { CalendarEvent } from "@/types";

interface CalendarWeekEventItemProps {
  item: {
    type: "task" | "event";
    data: Doc<"tasks"> | CalendarEvent;
  };
  isAllDay: boolean;
  topPosition: number;
  height: number;
  timeStr: string;
  endTimeStr: string;
  dateKey: string;
  eventIndex: number;
}

export const CalendarWeekEventItem = memo(
  ({
    item,
    isAllDay,
    topPosition,
    height,
    timeStr,
    endTimeStr,
    dateKey,
    eventIndex,
  }: CalendarWeekEventItemProps) => {
    if (isAllDay) {
      const bgClass =
        item.type === "task"
          ? (item.data as Doc<"tasks">).googleCalendarEventId
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";

      return (
        <div
          key={
            item.type === "task"
              ? `task-${(item.data as Doc<"tasks">)._id}-${dateKey}-${eventIndex}`
              : `event-${(item.data as CalendarEvent).id}-${dateKey}-${eventIndex}`
          }
          className={`absolute top-0 left-0 right-0 p-1.5 rounded text-xs cursor-pointer hover:opacity-80 z-10 ${bgClass}`}
          title={
            item.type === "task"
              ? (item.data as Doc<"tasks">).taskName
              : (item.data as CalendarEvent).title
          }
        >
          <div className="font-semibold text-[10px] mb-0.5">All day</div>
          <div className="line-clamp-1 text-[10px]">
            {item.type === "task"
              ? (item.data as Doc<"tasks">).taskName
              : (item.data as CalendarEvent).title}
          </div>
        </div>
      );
    }

    const bgClass =
      item.type === "task"
        ? (item.data as Doc<"tasks">).googleCalendarEventId
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-500"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-500"
        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-500";

    return (
      <div
        key={
          item.type === "task"
            ? `task-${(item.data as Doc<"tasks">)._id}-${dateKey}-${eventIndex}`
            : `event-${(item.data as CalendarEvent).id}-${dateKey}-${eventIndex}`
        }
        className={`absolute left-0 right-0 p-1.5 rounded text-xs cursor-pointer hover:opacity-80 z-10 border-l-2 ${bgClass}`}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
          minHeight: "32px",
        }}
        title={
          item.type === "task"
            ? (item.data as Doc<"tasks">).taskName
            : (item.data as CalendarEvent).title
        }
      >
        <div className="font-semibold text-[10px] mb-0.5">
          {timeStr}
          {endTimeStr && ` - ${endTimeStr}`}
        </div>
        <div className="line-clamp-2 text-[10px]">
          {item.type === "task"
            ? (item.data as Doc<"tasks">).taskName
            : (item.data as CalendarEvent).title}
        </div>
      </div>
    );
  }
);
CalendarWeekEventItem.displayName = "CalendarWeekEventItem";
