"use client";
import { memo, useRef, useMemo, useCallback, type RefObject } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import moment from "moment";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "../hooks/useCalendarData";

interface WeekViewProps {
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

// Time column component
const TimeColumn = memo(() => (
  <div className="border-r sticky left-0 z-20 bg-background">
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
TimeColumn.displayName = "TimeColumn";

// Day header component
interface DayHeaderProps {
  day: {
    date: Date;
    isToday: boolean;
  };
}

const DayHeader = memo(({ day }: DayHeaderProps) => (
  <div
    key={day.date.toISOString()}
    className="p-3 text-center border-r last:border-r-0 bg-muted/50"
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
DayHeader.displayName = "DayHeader";

// Event item component
interface EventItemProps {
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

const EventItem = memo(
  ({
    item,
    isAllDay,
    topPosition,
    height,
    timeStr,
    endTimeStr,
    dateKey,
    eventIndex,
  }: EventItemProps) => {
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
EventItem.displayName = "EventItem";

// Day column component
interface DayColumnProps {
  day: {
    date: Date;
    tasks: Array<Doc<"tasks">>;
    events: CalendarEvent[];
    isToday: boolean;
    dateKey: string;
  };
  onHourClick: (date: Date, hour: number) => void;
}

const DayColumn = memo(
  ({ day, onHourClick }: DayColumnProps) => {
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

    const handleHourClick = useCallback(
      (hour: number) => {
        onHourClick(day.date, hour);
      },
      [day.date, onHourClick]
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
            onClick={() => handleHourClick(i)}
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
            <EventItem
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
DayColumn.displayName = "DayColumn";

// Day headers component
interface DayHeadersProps {
  weekDays: Array<{
    date: Date;
    isToday: boolean;
  }>;
}

const DayHeaders = memo(({ weekDays }: DayHeadersProps) => (
  <div
    className="grid grid-cols-8 bg-muted/50 border-b shrink-0 sticky top-0 z-30"
    style={{ paddingRight: "17px" }}
  >
    <div className="p-3 border-r bg-muted/50"></div>
    {weekDays.map((day) => (
      <DayHeader key={day.date.toISOString()} day={day} />
    ))}
  </div>
));
DayHeaders.displayName = "DayHeaders";

export const WeekView = memo(
  ({ weekDays, onHourClick, weekCalendarRef }: WeekViewProps) => {
    // Use provided ref or create a local one if not provided
    const localRef = useRef<HTMLDivElement>(null);
    const ref = weekCalendarRef || localRef;

    return (
      <div
        className="border rounded-lg overflow-hidden bg-background flex flex-col"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <DayHeaders weekDays={weekDays} />

        {/* Scrollable time slots grid */}
        <div
          ref={ref}
          className="grid grid-cols-8 relative overflow-y-auto flex-1"
          style={{
            scrollbarGutter: "stable",

            willChange: "scroll-position",
          }}
        >
          <TimeColumn />

          {/* Days columns with positioned events */}
          {weekDays.map((day) => (
            <DayColumn key={day.dateKey} day={day} onHourClick={onHourClick} />
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
WeekView.displayName = "WeekView";
