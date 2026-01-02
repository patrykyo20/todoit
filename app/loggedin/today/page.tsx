"use client";

import moment from "moment";
import { Dot } from "lucide-react";
import { Tasks } from "@/components/layout";
import { useTaskStore } from "@/stores/taskStore";
import { TitleView } from "@/components/layout/Task/TitleView";
import { SkeletonToday } from "@/components/layout/Task/SkeletonToday";
import { useCallback, useState } from "react";
import { SortBy, SortOrder } from "@/components/layout/Task/Tasks";

export default function Today() {
  const { tasksData, isLoading } = useTaskStore();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSortChange = useCallback(
    (newSortBy: SortBy, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    []
  );

  // Early return pattern - najlepsza praktyka dla loading states
  if (isLoading || !tasksData) {
    return <SkeletonToday />;
  }

  const todayTasks = tasksData.today ?? [];
  const overdueTasks = tasksData.overdue ?? [];

  return (
    <>
      <TitleView
        title="Today"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      <div className="flex flex-col gap-1 py-4">
        <p className="font-bold flex text-sm">Overdue</p>
        <Tasks items={overdueTasks} sortBy={sortBy} sortOrder={sortOrder} />
      </div>
      <div className="flex flex-col gap-1 py-4">
        <p className="font-bold flex text-sm items-center border-b-2 p-2 border-gray-100">
          {moment(new Date()).format("LL")}
          <Dot />
          Today
          <Dot />
          {moment(new Date()).format("dddd")}
        </p>
        <Tasks items={todayTasks} sortBy={sortBy} sortOrder={sortOrder} />
      </div>
    </>
  );
}
