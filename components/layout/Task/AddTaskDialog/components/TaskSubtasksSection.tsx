"use client";
import { FC } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { ChevronDown } from "lucide-react";
import { Task } from "../../Task";
import { AddTaskWrapper } from "../../AddTaskButton";
import { SuggestMissingTasks } from "../../SuggestedTasks";
import { Id } from "@/convex/_generated/dataModel";

interface TaskSubtasksSectionProps {
  incompleteSubtasks: Doc<"subTasks">[];
  completedSubtasks: Doc<"subTasks">[];
  parentTask: Doc<"tasks">;
  projectId?: Id<"projects">;
  taskName: string;
  description: string;
  onCheckSubTask: (taskId: Id<"subTasks">) => void;
  onUncheckSubTask: (taskId: Id<"subTasks">) => void;
}

export const TaskSubtasksSection: FC<TaskSubtasksSectionProps> = ({
  incompleteSubtasks,
  completedSubtasks,
  parentTask,
  projectId,
  taskName,
  description,
  onCheckSubTask,
  onUncheckSubTask,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Sub-tasks</h3>
        </div>
        {projectId && (
          <SuggestMissingTasks
            projectId={projectId}
            taskName={taskName}
            description={description}
            parentId={parentTask._id}
            isSubTask={true}
          />
        )}
      </div>

      <div className="space-y-1">
        {incompleteSubtasks.map((task) => (
          <Task
            key={`subtask-incomplete-${parentTask._id}-${task._id}`}
            data={task}
            isCompleted={task.isCompleted}
            handleOnChange={() => onCheckSubTask(task._id)}
          />
        ))}

        <div className="py-2">
          <AddTaskWrapper parentTask={parentTask} />
        </div>

        {completedSubtasks.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Completed
            </p>
            {completedSubtasks.map((task) => (
              <Task
                key={`subtask-completed-${parentTask._id}-${task._id}`}
                data={task}
                isCompleted={task.isCompleted}
                handleOnChange={() => onUncheckSubTask(task._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
