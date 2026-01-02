"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTaskStore } from "@/stores/taskStore";
import { useMemo } from "react";
import moment from "moment";
import {
  AddEventDialog,
  ViewModeToggle,
  ConnectionStatus,
  CalendarHeader,
  MonthView,
  WeekView,
  ReAuthWarning,
  useCalendarEvents,
  useCalendarNavigation,
  useCalendarData,
  useEventDialog,
} from "@/components/layout/Calendar";

export default function CalendarPage() {
  const { tasksData, isLoading } = useTaskStore();
  const isConnected = useQuery(api.googleCalendar.isCalendarConnected) ?? false;
  const accountInfo = useQuery(api.googleCalendar.getAccountInfo);

  // Calendar navigation hook
  const {
    viewMode,
    setViewMode,
    currentMonth,
    currentWeek,
    weekCalendarRef,
    navigateMonth,
    navigateWeek,
  } = useCalendarNavigation();

  // Calendar events hook
  const { calendarEvents, isLoadingEvents, refreshEvents } = useCalendarEvents(
    isConnected,
    viewMode,
    currentMonth,
    currentWeek
  );

  // Tasks with dates
  const tasksWithDates = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.incomplete.filter(
      (task) => task.startDate || task.dueDate
    );
  }, [tasksData]);

  // Calendar data hook
  const { calendarDays, weekDays } = useCalendarData(
    tasksWithDates,
    calendarEvents,
    currentMonth,
    currentWeek
  );

  // Event dialog hook
  const eventDialog = useEventDialog();

  const handleRefreshMonth = async () => {
    const startOfMonth = moment(currentMonth).startOf("month").toDate();
    const endOfMonth = moment(currentMonth).endOf("month").toDate();
    await refreshEvents(startOfMonth.getTime(), endOfMonth.getTime());
  };

  const handleRefreshWeek = async () => {
    const startOfWeek = moment(currentWeek).startOf("week").toDate();
    const endOfWeek = moment(currentWeek).endOf("week").toDate();
    await refreshEvents(startOfWeek.getTime(), endOfWeek.getTime());
  };

  const handleDayClick = (date: Date) => {
    eventDialog.openDialog(date);
  };

  const handleHourClick = (date: Date, hour: number) => {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(hour + 1, 0, 0, 0);
    eventDialog.openDialog(date, startDate, endDate);
  };

  if (isLoading || !tasksData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold md:text-2xl">Calendar</h1>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          {isConnected && (
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}

          {/* Connection Status */}
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </div>

      <ReAuthWarning accountInfo={accountInfo} isConnected={isConnected} />

      {/* Add Event Dialog */}
      <AddEventDialog
        isOpen={eventDialog.isOpen}
        onClose={eventDialog.closeDialog}
        initialDate={eventDialog.selectedDate}
        initialStartTime={eventDialog.selectedStartTime}
        initialEndTime={eventDialog.selectedEndTime}
      />

      {/* Month Calendar View */}
      {viewMode === "month" && isConnected && (
        <div className="space-y-4">
          <CalendarHeader
            title={moment(currentMonth).format("MMMM YYYY")}
            isLoadingEvents={isLoadingEvents}
            onPrevious={() => navigateMonth("prev")}
            onNext={() => navigateMonth("next")}
            onRefresh={handleRefreshMonth}
            onCreateEvent={() => eventDialog.openDialog(new Date())}
          />
          <MonthView
            calendarDays={calendarDays}
            currentMonth={currentMonth}
            onDayClick={handleDayClick}
          />
        </div>
      )}

      {/* Week Calendar View */}
      {viewMode === "week" && isConnected && (
        <div className="space-y-4">
          <CalendarHeader
            title={`${moment(currentWeek).startOf("week").format("MMM D")} - ${moment(currentWeek).endOf("week").format("MMM D, YYYY")}`}
            isLoadingEvents={isLoadingEvents}
            onPrevious={() => navigateWeek("prev")}
            onNext={() => navigateWeek("next")}
            onRefresh={handleRefreshWeek}
            onCreateEvent={() => eventDialog.openDialog(new Date())}
          />
          <WeekView
            weekDays={weekDays}
            currentWeek={currentWeek}
            onHourClick={handleHourClick}
            weekCalendarRef={weekCalendarRef}
          />
        </div>
      )}

    </div>
  );
}
