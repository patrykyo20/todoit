"use client";
import { Tasks } from "@/components/layout";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Search() {
  const { searchQuery } = useParams<{ searchQuery: string }>();
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const [searchResults, setSearchResults] = useState<Array<Doc<"tasks">>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vectorSearch = useAction(api.search.searchTasks);

  useEffect(() => {
    const handleSearch = async () => {
      if (!decodedQuery || decodedQuery.trim() === "") {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSearchResults([]);

      try {
        const results = await vectorSearch({
          query: decodedQuery.trim(),
        });

        setSearchResults(results || []);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to search tasks. Please try again.";
        setError(errorMessage);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [decodedQuery, vectorSearch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">
            Search: {decodedQuery}
          </h1>
        </div>
        <div className="flex flex-col gap-1 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">
            Search: {decodedQuery}
          </h1>
        </div>
        <div className="p-4 text-center text-muted-foreground">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Search: {decodedQuery}
        </h1>
      </div>
      {searchResults.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <p>No tasks found for &quot;{decodedQuery}&quot;</p>
        </div>
      ) : (
        <Tasks items={searchResults} />
      )}
    </div>
  );
}