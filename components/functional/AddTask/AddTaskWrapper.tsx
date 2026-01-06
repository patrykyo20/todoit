"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { FC, useState } from "react";
import { AddTaskInline } from "./AddTaskInline";
import { AddTaskButton } from "./AddTaskButton";

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
