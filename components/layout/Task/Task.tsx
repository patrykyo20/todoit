"use client";

import { FC, useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";
import { Dialog } from "@/components/ui";
import { useTaskStore } from "@/stores/taskStore";
import { AddTaskDialog, AddTaskInline } from "@/components/functional/AddTask";
import { SubtaskDialog } from "@/components/functional";
import {
  useTaskCalculations,
  useTaskColors,
  useSubTasks,
  useTaskDialogState,
  useTaskCheckbox,
  useTaskSubtasks,
} from "@/hooks";
import { TaskCheckbox } from "./TaskCheckbox";
import { TaskContent } from "./TaskContent";
import { SubtaskList } from "./SubtaskList";

function isSubTask(
  data: Doc<"tasks"> | Doc<"subTasks">
): data is Doc<"subTasks"> {
  return "parentId" in data;
}

interface TaskProps {
  data: Doc<"tasks"> | Doc<"subTasks">;
  isCompleted: boolean;
  handleOnChange: () => void;
  showDetails?: boolean;
  testId?: string;
}

export const Task: FC<TaskProps> = ({
  data,
  isCompleted,
  handleOnChange,
  showDetails = false,
  testId,
}) => {
  const { projects } = useTaskStore();

  // Extract task properties
  const taskName = "taskName" in data ? data.taskName : "";
  const dueDate = "dueDate" in data ? data.dueDate : undefined;
  const priority = "priority" in data ? data.priority : undefined;
  const projectId = "projectId" in data ? data.projectId : undefined;

  // Determine if this is a task or subtask
  const isTask = !("parentId" in data);
  const taskId = isTask ? data._id : undefined;

  // Hooks
  const { isDialogOpen, handleDialogChange } = useTaskDialogState({ data });
  const { isAnimating, isLoading, handleCheckboxChange } = useTaskCheckbox({
    isCompleted,
    handleOnChange,
  });
  const {
    isSubtasksExpanded,
    showAddSubtask,
    handleToggleSubtasks,
    handleAddSubtask,
    handleSubtaskAdded,
  } = useTaskSubtasks({ isTask });
  const { dateStatus, formattedTime } = useTaskCalculations({
    dueDate,
    isTask,
    creationTime: data._creationTime,
  });
  const { getPriorityColor } = useTaskColors();
  const {
    subtaskCount,
    incompleteSubtasks,
    incompleteSubtasksList,
    completedSubtasksList,
    handleSubTaskCheck,
    handleSubTaskUncheck,
  } = useSubTasks({ taskId });

  // Computed values
  const project = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p._id === projectId);
  }, [projects, projectId]);

  const priorityColor = getPriorityColor(priority);

  return (
    <div
      id={`task-${data._id}`}
      className={clsx(
        "group flex flex-col space-x-2 border-b-2 p-2 border-gray-100 animate-in fade-in hover:bg-muted/30 transition-all duration-300 rounded-sm",
        isAnimating &&
          (isCompleted ? "task-check-animation" : "task-uncheck-animation"),
        isSubTask(data) ? "z-999" : "z-10"
      )}
      data-testid={testId}
    >
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <div className="flex gap-2 items-center justify-end w-full group-hover:bg-muted/30">
          <TaskCheckbox
            isCompleted={isCompleted}
            isLoading={isLoading}
            onCheckedChange={handleCheckboxChange}
            testId={testId ? `${testId}-checkbox` : undefined}
          />

          <TaskContent
            data={data}
            taskName={taskName || ""}
            isCompleted={isCompleted}
            priority={priority}
            priorityColor={priorityColor}
            dueDate={dueDate}
            dateStatus={dateStatus}
            formattedTime={formattedTime ?? undefined}
            isTask={isTask}
            subtaskCount={subtaskCount}
            incompleteSubtasks={incompleteSubtasks}
            project={project ?? null}
            isSubtasksExpanded={isSubtasksExpanded}
            onToggleSubtasks={handleToggleSubtasks}
            onAddSubtask={isTask ? handleAddSubtask : undefined}
            showDetails={showDetails}
          />
        </div>

        {!isSubTask(data) ? (
          <AddTaskDialog data={data} isOpen={isDialogOpen} />
        ) : (
          <SubtaskDialog data={data} isOpen={isDialogOpen} />
        )}
      </Dialog>

      {isTask && showAddSubtask && (
        <div className="ml-6 mt-1">
          <AddTaskInline
            setShowAddTask={(value) => {
              if (!value) {
                handleSubtaskAdded();
              }
            }}
            parentTask={data}
          />
        </div>
      )}

      {isTask && subtaskCount > 0 && isSubtasksExpanded && (
        <SubtaskList
          parentId={data._id}
          incompleteSubtasks={incompleteSubtasksList}
          completedSubtasks={completedSubtasksList}
          onSubTaskCheck={handleSubTaskCheck}
          onSubTaskUncheck={handleSubTaskUncheck}
        />
      )}
    </div>
  );
};
