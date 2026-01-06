"use client";

import { useTaskStore } from "@/stores/taskStore";
import { TodayError, TodaySkeleton, TodayTasks } from "./_components";

export default function Today() {
  const { tasksData, isLoading, isError } = useTaskStore();

  if (isLoading || !tasksData) {
    return <TodaySkeleton />;
  }

  if (isError) {
    return <TodayError />;
  }

  const todayTasks = tasksData.today ?? [];
  const overdueTasks = tasksData.overdue ?? [];

  return <TodayTasks todayTasks={todayTasks} overdueTasks={overdueTasks} />;
}
