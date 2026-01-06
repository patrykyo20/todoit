"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTaskStore } from "@/stores/taskStore";
import { Skeleton } from "@/components/ui";

export const ProjectError: React.FC = () => {
  const { setError, setLoading } = useTaskStore();

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2 lg:gap-0 mb-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6 lg:gap-12 items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">
            Failed to load project
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            We couldn&apos;t load the project details. Please try again or check
            your connection.
          </p>
        </div>
        <Button onClick={handleRetry} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </>
  );
};
