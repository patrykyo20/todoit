"use client";

import { FC, useState } from "react";
import { TaskSort } from "./TaskSort";
import type { SortBy, SortOrder } from "@/types";
import { AddTaskButton } from "@/components/functional/AddTask";
import { CreateTaskDialog } from "../../functional/AddTask/CreateTaskDialog";
import { Id } from "@/convex/_generated/dataModel";

interface TitleViewProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  showSort?: boolean;
  title: string;
  projectId?: Id<"projects">;
  showAddTask?: boolean;
}

export const TitleView: FC<TitleViewProps> = ({
  title,
  sortBy,
  sortOrder,
  onSortChange,
  showSort = true,
  projectId,
  showAddTask = true,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-2">
          {showAddTask && (
            <AddTaskButton
              onClick={() => setIsDialogOpen(true)}
              title="Add task"
            />
          )}
          {showSort && (
            <TaskSort
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          )}
        </div>
      </div>
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
      />
    </>
  );
};
