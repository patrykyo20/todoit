"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCallback } from "react";

interface SearchErrorProps {
  searchQuery: string;
  error: string;
  onRetry: () => void;
}

export const SearchError: React.FC<SearchErrorProps> = ({
  searchQuery,
  error,
  onRetry,
}) => {
  const handleRetry = useCallback(() => {
    onRetry();
  }, [onRetry]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Search: {searchQuery}
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">
            Failed to search tasks
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {error}
          </p>
        </div>
        <Button onClick={handleRetry} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
};
