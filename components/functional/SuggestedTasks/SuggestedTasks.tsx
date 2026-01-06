"use client";

import { FC } from "react";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { useSuggestedTasks } from "@/hooks";

interface SuggestedTasksProps {
  projectId: Id<"projects">;
  isSubTask?: boolean;
  taskName?: string;
  description?: string;
  parentId?: Id<"tasks">;
}

export const SuggestedTasks: FC<SuggestedTasksProps> = ({
  projectId,
  isSubTask = false,
  taskName = "",
  description = "",
  parentId,
}) => {
  const { isLoading, handleMissingTasks, handleMissingSubTasks, project } =
    useSuggestedTasks({
      projectId,
      taskName,
      description,
      parentId,
    });

  if (!project) {
    return null;
  }

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={isSubTask ? handleMissingSubTasks : handleMissingTasks}
    >
      {isLoading ? (
        <div className="flex gap-2">
          Loading Tasks (AI)
          <Loader className="h-5 w-5 text-primary" />
        </div>
      ) : (
        "Suggest Missing Tasks (AI) 💖"
      )}
    </Button>
  );
};
