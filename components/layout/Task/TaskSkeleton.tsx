"use client";

import { FC } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface TaskSkeletonProps {
  count?: number;
}

export const TaskSkeleton: FC<TaskSkeletonProps> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 border-b-2 p-2 border-gray-100"
        >
          <Skeleton className="w-5 h-5 rounded-xl" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
};
