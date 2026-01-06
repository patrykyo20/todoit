"use client";

import { FC, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTaskStore } from "@/stores/taskStore";
import { useEventStore } from "@/stores/eventStore";
import moment from "moment";
import {
  CalendarViewModeToggle,
  CalendarHeader,
  CalendarMonthView,
  CalendarWeekView,
} from "@/components/layout/Calendar";
import { AddEventDialog } from "@/components/functional";
import {
  useCalendarEvents,
  useCalendarNavigation,
  useCalendarData,
} from "@/hooks";

export const CalendarContent: FC = () => {
  const { tasksData } = useTaskStore();
  const isConnected = useQuery(api.googleCalendar.isCalendarConnected) ?? false;

  const {
    viewMode,
    setViewMode,
    currentMonth,
    currentWeek,
    weekCalendarRef,
    navigateMonth,
    navigateWeek,
  } = useCalendarNavigation();

  const { calendarEvents, isLoadingEvents, refreshEvents } = useCalendarEvents(
    isConnected,
    viewMode,
    currentMonth,
    currentWeek
  );

  const tasksWithDates = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.incomplete.filter(
      (task) => task.startDate || task.dueDate
    );
  }, [tasksData]);

  const { calendarDays, weekDays } = useCalendarData(
    tasksWithDates,
    calendarEvents,
    currentMonth,
    currentWeek
  );

  const {
    isOpen,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    openDialog,
    closeDialog,
  } = useEventStore();

  const handleRefreshMonth = useCallback(async () => {
    const startOfMonth = moment(currentMonth).startOf("month").toDate();
    const endOfMonth = moment(currentMonth).endOf("month").toDate();
    await refreshEvents(startOfMonth.getTime(), endOfMonth.getTime());
  }, [currentMonth, refreshEvents]);

  const handleRefreshWeek = useCallback(async () => {
    const startOfWeek = moment(currentWeek).startOf("week").toDate();
    const endOfWeek = moment(currentWeek).endOf("week").toDate();
    await refreshEvents(startOfWeek.getTime(), endOfWeek.getTime());
  }, [currentWeek, refreshEvents]);

  const handleDayClick = useCallback(
    (date: Date) => {
      openDialog(date);
    },
    [openDialog]
  );

  const handleHourClick = useCallback(
    (date: Date, hour: number) => {
      const startDate = new Date(date);
      startDate.setHours(hour, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      openDialog(date, startDate, endDate);
    },
    [openDialog]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold md:text-2xl">Calendar</h1>
        <div className="flex items-center gap-4">
          {isConnected && (
            <CalendarViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}
        </div>
      </div>

      <AddEventDialog
        isOpen={isOpen}
        onClose={closeDialog}
        initialDate={selectedDate}
        initialStartTime={selectedStartTime}
        initialEndTime={selectedEndTime}
      />

      {viewMode === "month" && isConnected && (
        <div className="space-y-4">
          <CalendarHeader
            title={moment(currentMonth).format("MMMM YYYY")}
            isLoadingEvents={isLoadingEvents}
            onPrevious={() => navigateMonth("prev")}
            onNext={() => navigateMonth("next")}
            onRefresh={handleRefreshMonth}
            onCreateEvent={() => openDialog(new Date())}
          />
          <CalendarMonthView
            calendarDays={calendarDays}
            currentMonth={currentMonth}
            onDayClick={handleDayClick}
          />
        </div>
      )}

      {viewMode === "week" && isConnected && (
        <div className="space-y-4">
          <CalendarHeader
            title={`${moment(currentWeek).startOf("week").format("MMM D")} - ${moment(currentWeek).endOf("week").format("MMM D, YYYY")}`}
            isLoadingEvents={isLoadingEvents}
            onPrevious={() => navigateWeek("prev")}
            onNext={() => navigateWeek("next")}
            onRefresh={handleRefreshWeek}
            onCreateEvent={() => openDialog(new Date())}
          />
          <CalendarWeekView
            weekDays={weekDays}
            currentWeek={currentWeek}
            onHourClick={handleHourClick}
            weekCalendarRef={weekCalendarRef}
          />
        </div>
      )}
    </div>
  );
};
