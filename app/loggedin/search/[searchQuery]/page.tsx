"use client";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  SearchSkeleton,
  SearchError,
  SearchBody,
  SearchEmpty,
} from "./_components";

export default function Search() {
  const { searchQuery } = useParams<{ searchQuery: string }>();
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const [searchResults, setSearchResults] = useState<Array<Doc<"tasks">>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vectorSearch = useAction(api.search.searchTasks);

  const handleSearch = useCallback(async () => {
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to search tasks. Please try again.";
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [decodedQuery, vectorSearch]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleRetry = useCallback(() => {
    handleSearch();
  }, [handleSearch]);

  if (isLoading) {
    return <SearchSkeleton searchQuery={decodedQuery} />;
  }

  if (error) {
    return (
      <SearchError
        searchQuery={decodedQuery}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  if (searchResults.length === 0) {
    return <SearchEmpty searchQuery={decodedQuery} />;
  }

  return (
    <SearchBody searchQuery={decodedQuery} searchResults={searchResults} />
  );
}
