"use client";
import { FC } from "react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddTaskInline } from "./AddTaskInline";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils/cn";

interface AddTaskWrapperProps {
  parentTask?: Doc<"tasks">;
  projectId?: Id<"projects">;
  variant?: "primary" | "secondary";
}

export const AddTaskWrapper: FC<AddTaskWrapperProps> = ({
  parentTask,
  projectId,
  variant = "secondary",
}) => {
  const [showAddTask, setShowAddTask] = useState(false);

  if (showAddTask) {
    return (
      <AddTaskInline
        setShowAddTask={setShowAddTask}
        parentTask={parentTask}
        projectId={projectId}
      />
    );
  }

  return (
    <AddTaskButton
      onClick={() => setShowAddTask(true)}
      title={parentTask?._id ? "Add sub-task" : "Add task"}
      variant={variant}
    />
  );
};

interface AddTaskButtonProps {
  onClick: () => void;
  title: string;
  variant?: "primary" | "secondary";
}

export const AddTaskButton: FC<AddTaskButtonProps> = ({
  onClick,
  title,
  variant = "primary",
}) => {
  const isPrimary = variant === "primary";

  return (
    <button
      className={cn(
        "pl-2 flex flex-1 cursor-pointer rounded-lg transition-colors p-2 w-full -ml-2",
        isPrimary
          ? "bg-primary hover:bg-primary/90 text-white"
          : "bg-white hover:bg-gray-50 text-primary"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Plus
            className={cn(
              "h-4 w-4 transition-all",
              isPrimary
                ? "text-white hover:bg-white hover:rounded-xl hover:text-primary"
                : "text-primary hover:bg-primary hover:rounded-xl hover:text-white"
            )}
          />
          <h3
            className={cn(
              "text-base tracking-tight transition-colors",
              isPrimary
                ? "text-white hover:text-white"
                : "text-primary hover:text-primary"
            )}
          >
            {title}
          </h3>
        </div>
      </div>
    </button>
  );
};
