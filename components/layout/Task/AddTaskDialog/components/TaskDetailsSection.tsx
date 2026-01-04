"use client";
import { FC } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Hash, Flag } from "lucide-react";
import { TaskDetailField } from "./TaskDetailField";
import { TaskDueDateField } from "./TaskDueDateField";

interface TaskDetailsSectionProps {
  projects: Doc<"projects">[];
  projectId: Id<"projects"> | undefined;
  priority: number | undefined;
  dueDate: Date | undefined;
  onProjectChange: (value: Id<"projects">) => void;
  onProjectClear: () => void;
  onPriorityChange: (value: number) => void;
  onPriorityClear: () => void;
  onDueDateChange: (date: Date | undefined) => void;
  onSave: () => void;
}

export const TaskDetailsSection: FC<TaskDetailsSectionProps> = ({
  projects,
  projectId,
  priority,
  dueDate,
  onProjectChange,
  onProjectClear,
  onPriorityChange,
  onPriorityClear,
  onDueDateChange,
  onSave,
}) => {
  const priorityOptions = [1, 2, 3, 4].map((p) => ({
    id: p.toString(),
    name: `Priority ${p}`,
  }));

  return (
    <div className="w-full border-t border-border bg-background flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-border shrink-0">
        <h3 className="font-semibold text-base text-foreground">Details</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-w-0">
        {/* Project */}
        <TaskDetailField
          icon={<Hash className="w-4 h-4 text-primary capitalize" />}
          label="Project"
          value={projectId}
          placeholder="Select project"
          options={projects.map((p) => ({ id: p._id, name: p.name }))}
          onValueChange={(value) => {
            onProjectChange(value as Id<"projects">);
            onSave();
          }}
          onClear={() => {
            onProjectClear();
            onSave();
          }}
        />

        {/* Due Date */}
        <TaskDueDateField
          dueDate={dueDate}
          onDateChange={onDueDateChange}
          onSave={onSave}
        />

        {/* Priority */}
        <TaskDetailField
          icon={<Flag className="w-4 h-4 text-primary capitalize" />}
          label="Priority"
          value={priority?.toString()}
          placeholder="Select priority"
          options={priorityOptions}
          onValueChange={(value) => {
            onPriorityChange(parseInt(value));
            onSave();
          }}
          onClear={() => {
            onPriorityClear();
            onSave();
          }}
        />
      </div>
    </div>
  );
};
