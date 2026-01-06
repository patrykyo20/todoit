import { TaskSkeleton } from "@/components/layout/Task/TaskSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export const ProjectSkeleton = () => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2 lg:gap-0 mb-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6 lg:gap-12 items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-4">
        <TaskSkeleton count={5} />
        <div className="pb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <TaskSkeleton count={3} />
      </div>
    </>
  );
};
