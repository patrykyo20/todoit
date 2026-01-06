"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTaskStore } from "@/stores/taskStore";
import { useCallback } from "react";

export const ProjectsError = () => {
  const { setError, setLoading } = useTaskStore();

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    window.location.reload();
  }, [setError, setLoading]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Projects</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">
            Failed to load projects
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            We couldn&apos;t load your projects. Please try again or check your
            connection.
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
