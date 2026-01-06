"use client";

import { FC } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Tasks } from "@/components/layout";

interface SearchBodyProps {
  searchQuery: string;
  searchResults: Array<Doc<"tasks">>;
}

export const SearchBody: FC<SearchBodyProps> = ({
  searchQuery,
  searchResults,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Search: {searchQuery}
        </h1>
      </div>
      <Tasks items={searchResults} />
    </div>
  );
};
