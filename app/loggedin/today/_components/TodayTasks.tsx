"use client";

import { FC, useCallback, useState } from "react";
import moment from "moment";
import { Dot } from "lucide-react";
import { Tasks } from "@/components/layout";
import { TitleView } from "@/components/layout/Task/TitleView";
import type { SortBy, SortOrder } from "@/types";
import { Doc } from "@/convex/_generated/dataModel";

interface TodayTasksProps {
  todayTasks: Array<Doc<"tasks">>;
  overdueTasks: Array<Doc<"tasks">>;
}

export const TodayTasks: FC<TodayTasksProps> = ({
  todayTasks,
  overdueTasks,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSortChange = useCallback(
    (newSortBy: SortBy, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    []
  );

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
};
