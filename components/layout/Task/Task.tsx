"use client";

import { FC, useState, useCallback, useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";
import { Dialog, DialogTrigger } from "@/components/ui";
import { useQuery } from "convex/react";
import moment from "moment";
import { GitBranch, Calendar } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useTaskStore } from "@/stores/taskStore";
import { AddTaskDialog } from "./AddTaskDialog";
import { AddTaskInline } from "./AddTaskInline";
import { useTaskSound } from "./hooks/useTaskSound";
import { useTaskCalculations } from "./hooks/useTaskCalculations";
import { useTaskColors } from "./hooks/useTaskColors";
import { useSubTasks } from "./hooks/useSubTasks";
import { TaskCheckbox } from "./components/TaskCheckbox";
import { TaskIcons } from "./components/TaskIcons";
import { TaskMetadata } from "./components/TaskMetadata";
import { SubtaskList } from "./components/SubtaskList";

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
  const taskName = "taskName" in data ? data.taskName : "";
  const dueDate = "dueDate" in data ? data.dueDate : undefined;
  const priority = "priority" in data ? data.priority : undefined;
  const projectId = "projectId" in data ? data.projectId : undefined;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const { projects } = useTaskStore();
  const isTask = !("parentId" in data);
  const taskId = isTask ? data._id : undefined;
  const parentId = isSubTask(data) ? data.parentId : undefined;

  // Get parent task if this is a subtask
  const parentTask = useQuery(
    api.tasks.getTaskById,
    parentId ? { taskId: parentId } : "skip"
  );

  // Custom hooks
  const { playClickSound } = useTaskSound(isCompleted);
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

  // Get project name
  const project = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p._id === projectId);
  }, [projects, projectId]);

  const priorityColor = getPriorityColor(priority);

  const handleCheckboxChange = useCallback(async () => {
    playClickSound();
    setIsAnimating(true);
    setIsLoading(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    try {
      await handleOnChange();
    } finally {
      setIsLoading(false);
    }
  }, [handleOnChange, playClickSound]);

  const handleToggleSubtasks = useCallback(() => {
    setIsSubtasksExpanded((prev) => !prev);
  }, []);

  const handleAddSubtask = useCallback(() => {
    if (showAddSubtask) {
      setShowAddSubtask(false);
    } else {
      setShowAddSubtask(true);
    }
  }, [showAddSubtask]);

  const handleSubtaskAdded = useCallback(() => {
    setShowAddSubtask(false);
    setIsSubtasksExpanded(true);
  }, []);

  return (
    <div
      id={`task-${data._id}`}
      className={clsx(
        "group flex flex-col space-x-2 border-b-2 p-2 border-gray-100 animate-in fade-in hover:bg-muted/30 transition-all duration-300 rounded-sm",
        isAnimating &&
          (isCompleted ? "task-check-animation" : "task-uncheck-animation")
      )}
      data-testid={testId}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex gap-2 items-center justify-end w-full group-hover:bg-muted/30">
          <TaskCheckbox
            isCompleted={isCompleted}
            isLoading={isLoading}
            onCheckedChange={handleCheckboxChange}
            testId={testId ? `${testId}-checkbox` : undefined}
          />
          <DialogTrigger asChild>
            <div className="flex flex-col items-start w-full cursor-pointer">
              <div className="flex items-center gap-2 w-full flex-wrap">
                <TaskIcons
                  priority={priority}
                  priorityColor={priorityColor}
                  dueDate={dueDate}
                  dateStatus={dateStatus}
                  isCompleted={isCompleted}
                />

                <span
                  className={clsx(
                    "text-sm font-normal text-left flex-1 min-w-0",
                    isCompleted && "line-through text-foreground/30"
                  )}
                >
                  {taskName}
                </span>

                <TaskMetadata
                  formattedTime={formattedTime}
                  isTask={isTask}
                  subtaskCount={subtaskCount}
                  incompleteSubtasks={incompleteSubtasks}
                  project={project}
                  dueDate={dueDate}
                  isSubtasksExpanded={isSubtasksExpanded}
                  onToggleSubtasks={handleToggleSubtasks}
                  onAddSubtask={isTask ? handleAddSubtask : undefined}
                  isMobile={false}
                />
              </div>

              <TaskMetadata
                formattedTime={formattedTime}
                isTask={isTask}
                subtaskCount={subtaskCount}
                incompleteSubtasks={incompleteSubtasks}
                project={project}
                dueDate={dueDate}
                isSubtasksExpanded={isSubtasksExpanded}
                onToggleSubtasks={handleToggleSubtasks}
                onAddSubtask={isTask ? handleAddSubtask : undefined}
                isMobile={true}
              />

              {showDetails && (
                <div className="flex gap-2">
                  <div className="flex items-center justify-center gap-1">
                    <GitBranch className="w-3 h-3 text-foreground/70" />
                    <p className="text-xs text-foreground/70"></p>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    <p className="text-xs text-primary">
                      {dueDate ? moment(dueDate).format("LL") : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogTrigger>
        </div>
        {isSubTask(data) && parentTask ? (
          <AddTaskDialog data={parentTask} isOpen={isDialogOpen} />
        ) : !isSubTask(data) ? (
          <AddTaskDialog data={data} isOpen={isDialogOpen} />
        ) : null}
      </Dialog>

      {isTask && showAddSubtask && (
        <div className="ml-6 mt-1">
          <AddTaskInline
            setShowAddTask={(value) => {
              setShowAddSubtask(value);
              if (!value) {
                handleSubtaskAdded();
              }
            }}
            parentTask={isTask ? data : undefined}
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
