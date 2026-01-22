"use client";
import { memo, useMemo, useCallback } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import moment from "moment";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";
import { useEventStore } from "@/stores/eventStore";
import { CalendarWeekEventItem } from "./CalendarWeekEventItem";

interface CalendarWeekDayColumnProps {
  day: {
    date: Date;
    tasks: Array<Doc<"tasks">>;
    events: CalendarEvent[];
    isToday: boolean;
    dateKey: string;
  };
  onHourClick?: (date: Date, hour: number) => void;
}

export const CalendarWeekDayColumn = memo(
  ({ day, onHourClick }: CalendarWeekDayColumnProps) => {
    const { openDialog } = useEventStore();

    const allItems = useMemo(() => {
      return [
        ...day.tasks.map((t) => ({ type: "task" as const, data: t })),
        ...day.events.map((e) => ({
          type: "event" as const,
          data: e,
        })),
      ];
    }, [day.tasks, day.events]);

    const eventPositions = useMemo(() => {
      return allItems.map((item) => {
        let hour = 0;
        let minutes = 0;
        let isAllDay = false;
        let duration = 1;
        let timeStr = "";
        let endTimeStr = "";

        if (item.type === "task") {
          const task = item.data as Doc<"tasks">;
          const taskStartTime = task.startDate || task.dueDate;
          const taskEndTime = task.endDate;

          if (taskStartTime) {
            const startMoment = moment(taskStartTime);
            hour = startMoment.hour();
            minutes = startMoment.minute();
            timeStr = startMoment.format("HH:mm");

            if (taskEndTime) {
              const endMoment = moment(taskEndTime);
              endTimeStr = endMoment.format("HH:mm");
              duration = endMoment.diff(startMoment, "hours", true);
              if (duration < 0.5) duration = 0.5;
            } else {
              duration = 1;
            }
          } else {
            isAllDay = true;
          }
        } else {
          const event = item.data as CalendarEvent;
          if (event.isAllDay) {
            isAllDay = true;
          } else {
            const startMoment = moment(event.start);
            const endMoment = moment(event.end);
            hour = startMoment.hour();
            minutes = startMoment.minute();
            timeStr = startMoment.format("HH:mm");
            endTimeStr = endMoment.format("HH:mm");
            duration = endMoment.diff(startMoment, "hours", true);
            if (duration < 0.5) duration = 0.5;
          }
        }

        const topPosition = hour * 64 + (minutes / 60) * 64;
        const height = duration * 64;

        return {
          item,
          isAllDay,
          topPosition,
          height,
          timeStr,
          endTimeStr,
        };
      });
    }, [allItems]);

    const handleCellClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>, hour: number) => {
        e.stopPropagation();
        if (onHourClick) {
          onHourClick(day.date, hour);
        } else {
          const clickedDate = new Date(day.date);
          clickedDate.setHours(hour, 0, 0, 0);
          const endDate = new Date(clickedDate);
          endDate.setHours(hour + 1, 0, 0, 0);
          openDialog(day.date, clickedDate, endDate);
        }
      },
      [day.date, onHourClick, openDialog]
    );

    return (
      <div
        key={day.dateKey}
        className={
          day.isToday
            ? "border-r last:border-r-0 relative bg-primary/5"
            : "border-r last:border-r-0 relative"
        }
      >
        {/* Hour slots - clickable to create event */}
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            onClick={(e) => handleCellClick(e, i)}
            className={cn(
              "h-16 border-b border-border cursor-pointer hover:bg-primary/5 transition-colors",
              i < 8 ? "bg-muted/30" : "bg-background"
            )}
          />
        ))}

        {/* Events positioned by time */}
        {eventPositions.map(
          (
            { item, isAllDay, topPosition, height, timeStr, endTimeStr },
            eventIndex
          ) => (
            <CalendarWeekEventItem
              key={
                item.type === "task"
                  ? `task-${(item.data as Doc<"tasks">)._id}-${day.dateKey}-${eventIndex}`
                  : `event-${(item.data as CalendarEvent).id}-${day.dateKey}-${eventIndex}`
              }
              item={item}
              isAllDay={isAllDay}
              topPosition={topPosition}
              height={height}
              timeStr={timeStr}
              endTimeStr={endTimeStr}
              dateKey={day.dateKey}
              eventIndex={eventIndex}
            />
          )
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
      prevProps.day.dateKey === nextProps.day.dateKey &&
      prevProps.day.isToday === nextProps.day.isToday &&
      prevProps.day.tasks.length === nextProps.day.tasks.length &&
      prevProps.day.events.length === nextProps.day.events.length &&
      prevProps.onHourClick === nextProps.onHourClick &&
      prevProps.day.tasks.every(
        (task, i) =>
          task._id === nextProps.day.tasks[i]?._id &&
          task.isCompleted === nextProps.day.tasks[i]?.isCompleted
      ) &&
      prevProps.day.events.every(
        (event, i) => event.id === nextProps.day.events[i]?.id
      )
    );
  }
);
CalendarWeekDayColumn.displayName = "CalendarWeekDayColumn";
