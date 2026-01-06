import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import moment from "moment";
import type { CalendarEvent } from "@/types";

export function useCalendarData(
  tasksWithDates: Array<Doc<"tasks">>,
  calendarEvents: CalendarEvent[],
  currentMonth: Date,
  currentWeek: Date
) {
  const tasksAndEventsByDate = useMemo(() => {
    const merged: Record<
      string,
      { tasks: Array<Doc<"tasks">>; events: CalendarEvent[] }
    > = {};

    tasksWithDates.forEach((task) => {
      if (task.googleCalendarEventId) {
        const taskDate = task.startDate || task.dueDate;
        if (taskDate) {
          const dateKey = moment(taskDate).format("YYYY-MM-DD");
          if (!merged[dateKey]) {
            merged[dateKey] = { tasks: [], events: [] };
          }
          merged[dateKey].tasks.push(task);
        }
      }
    });

    calendarEvents.forEach((event) => {
      const eventDate = moment(event.start);
      const dateKey = eventDate.format("YYYY-MM-DD");
      if (!merged[dateKey]) {
        merged[dateKey] = { tasks: [], events: [] };
      }
      merged[dateKey].events.push(event);
    });

    return merged;
  }, [tasksWithDates, calendarEvents]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: Date;
      tasks: Array<Doc<"tasks">>;
      events: CalendarEvent[];
    }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, -startingDayOfWeek + i + 1),
        tasks: [],
        events: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = moment(date).format("YYYY-MM-DD");
      const dayData = tasksAndEventsByDate[dateKey] || {
        tasks: [],
        events: [],
      };
      days.push({
        date,
        tasks: dayData.tasks || [],
        events: dayData.events || [],
      });
    }

    return days;
  }, [currentMonth, tasksAndEventsByDate]);

  const weekDays = useMemo(() => {
    const startOfWeek = moment(currentWeek).startOf("week");
    const today = moment().startOf("day");
    const days: Array<{
      date: Date;
      tasks: Array<Doc<"tasks">>;
      events: CalendarEvent[];
      isToday: boolean;
      dateKey: string;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const dateMoment = startOfWeek.clone().add(i, "days");
      const date = dateMoment.toDate();
      const dateKey = dateMoment.format("YYYY-MM-DD");
      const dayData = tasksAndEventsByDate[dateKey] || {
        tasks: [],
        events: [],
      };
      days.push({
        date,
        tasks: dayData.tasks || [],
        events: dayData.events || [],
        isToday: dateMoment.isSame(today, "day"),
        dateKey,
      });
    }

    return days;
  }, [currentWeek, tasksAndEventsByDate]);

  return {
    tasksAndEventsByDate,
    calendarDays,
    weekDays,
  };
}
