"use client";
import { FC } from "react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddTaskInline } from "./AddTaskInline";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface AddTaskWrapperProps {
  parentTask?: Doc<"tasks">;
  projectId?: Id<"projects">;
}

export const AddTaskWrapper: FC<AddTaskWrapperProps> = ({
  parentTask,
  projectId,
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
    />
  );
};

interface AddTaskButtonProps {
  onClick: () => void;
  title: string;
}

export const AddTaskButton: FC<AddTaskButtonProps> = ({ onClick, title }) => {
  return (
    <button
      className="pl-2 flex flex-1 cursor-pointer hover:bg-primary/90 bg-primary rounded-lg transition-colors p-2 w-full -ml-2"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Plus className="h-4 w-4 text-white hover:bg-white hover:rounded-xl transition-all" />
          <h3 className="text-base tracking-tight text-white hover:text-white transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </button>
  );
};
