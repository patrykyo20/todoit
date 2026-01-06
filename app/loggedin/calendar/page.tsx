"use client";

import { useTaskStore } from "@/stores/taskStore";
import {
  CalendarError,
  CalendarSkeleton,
  CalendarContent,
} from "./_components";

export default function CalendarPage() {
  const { tasksData, isLoading, isError } = useTaskStore();

  if (isLoading || !tasksData) {
    return <CalendarSkeleton />;
  }

  if (isError) {
    return <CalendarError />;
  }

  return <CalendarContent />;
}
