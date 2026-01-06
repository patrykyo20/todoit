import { Skeleton } from "@/components/ui/Skeleton";

export const ProjectsSkeleton = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col gap-1 py-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 border-b-2 p-2 border-gray-100"
          >
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </>
  );
};
