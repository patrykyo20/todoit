"use client";

import { FC } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskSkeleton } from "./TaskSkeleton";

interface SkeletonTodayProps {
  showOverdue?: boolean;
}

export const SkeletonToday: FC<SkeletonTodayProps> = ({
  showOverdue = true,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-32" />
      </div>
      {showOverdue && (
        <div className="flex flex-col gap-1 py-4">
          <Skeleton className="h-5 w-20 mb-2" />
          <TaskSkeleton count={3} />
        </div>
      )}
      <div className="flex flex-col gap-1 py-4">
        <Skeleton className="h-5 w-40 mb-2" />
        <TaskSkeleton count={3} />
      </div>
    </>
  );
};
