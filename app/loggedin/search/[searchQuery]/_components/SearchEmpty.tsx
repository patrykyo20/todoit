"use client";

import { FC } from "react";
import { Search } from "lucide-react";

interface SearchEmptyProps {
  searchQuery: string;
}

export const SearchEmpty: FC<SearchEmptyProps> = ({ searchQuery }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Search: {searchQuery}
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Search className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            No tasks found
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            No tasks found for &quot;{searchQuery}&quot;. Try a different search
            term or check your spelling.
          </p>
        </div>
      </div>
    </div>
  );
};