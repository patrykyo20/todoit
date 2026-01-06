"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface SearchSkeletonProps {
  searchQuery: string;
}

export const SearchSkeleton: React.FC<SearchSkeletonProps> = ({
  searchQuery,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Search: {searchQuery}
        </h1>
      </div>
      <div className="flex flex-col gap-1 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
};
