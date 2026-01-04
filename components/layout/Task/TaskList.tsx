"use client";
import { Tasks } from "./Tasks";
import { CompletedTasks } from "./CompletedTasks";
import { AddTaskWrapper } from "./AddTaskButton";
import { TaskSkeleton } from "./TaskSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTaskStore } from "@/stores/taskStore";
import { TaskSort } from "./TaskSort";
import { useState } from "react";
import { SortBy, SortOrder } from "./Tasks";

export function TaskList() {
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
          <TaskSkeleton count={5} />
        </div>
      </>
    );
  }

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
        <TaskSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>
      <div className="flex flex-col gap-1 py-4">
        <Tasks 
          items={tasksData.incomplete} 
          sortBy={sortBy} 
          sortOrder={sortOrder}
          keyPrefix="incomplete"
        />
      </div>
      <AddTaskWrapper />
      <div className="flex flex-col gap-1 py-4">
        <Tasks 
          items={tasksData.completed} 
          sortBy={sortBy} 
          sortOrder={sortOrder}
          keyPrefix="completed"
        />
      </div>
      <CompletedTasks totalTasks={tasksData.total} />
    </>
  );
}
