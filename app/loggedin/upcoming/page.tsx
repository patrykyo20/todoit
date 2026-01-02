"use client";

import { Dot } from "lucide-react";
import moment from "moment";
import { AddTaskWrapper } from "@/components/layout/Task/AddTaskButton";
import { Tasks } from "@/components/layout";
import { TaskSkeleton } from "@/components/layout/Task/TaskSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTaskStore } from "@/stores/taskStore";
import { TaskSort } from "@/components/layout/Task/TaskSort";
import { useState } from "react";
import { SortBy, SortOrder } from "@/components/layout/Task/Tasks";

export default function Upcoming() {
  const { tasksData, isLoading } = useTaskStore();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  if (isLoading || !tasksData) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col gap-1 py-4">
          <Skeleton className="h-5 w-20 mb-2" />
          <TaskSkeleton count={3} />
        </div>
        <div className="flex flex-col gap-1 py-4">
          <Skeleton className="h-5 w-40 mb-2" />
          <TaskSkeleton count={3} />
        </div>
      </>
    );
  }

  const overdueTasks = tasksData.overdue ?? [];
  const groupedByDate = tasksData.groupedByDate ?? {};

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Upcoming</h1>
        <TaskSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>
      <div className="flex flex-col gap-1 py-4">
        <p className="font-bold flex text-sm">Overdue</p>
        <Tasks items={overdueTasks} sortBy={sortBy} sortOrder={sortOrder} />
      </div>
      <div className="pb-6">
        <AddTaskWrapper />
      </div>
      <div className="flex flex-col gap-1 py-4">
        {sortedDates.map((dueDate) => {
          return (
            <div key={dueDate} className="mb-6">
              <p className="font-bold flex text-sm items-center">
                {moment(dueDate).format("LL")} <Dot />
                {moment(dueDate).format("dddd")}
              </p>
              <ul>
                <Tasks items={groupedByDate[dueDate]} sortBy={sortBy} sortOrder={sortOrder} />
                <AddTaskWrapper />
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
