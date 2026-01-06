import { FC } from "react";
import clsx from "clsx";
import { DialogTrigger } from "@/components/ui";
import { Doc } from "@/convex/_generated/dataModel";
import { TaskIcons } from "./TaskIcons";
import { TaskMetadata } from "./TaskMetadata";

interface TaskContentProps {
  data: Doc<"tasks"> | Doc<"subTasks">;
  taskName: string;
  isCompleted: boolean;
  priority?: number;
  priorityColor: string | null;
  dueDate?: number;
  dateStatus: "overdue" | "today" | "tomorrow" | "upcoming" | null;
  formattedTime?: string | null;
  isTask: boolean;
  subtaskCount: number;
  incompleteSubtasks: number;
  project: Doc<"projects"> | null | undefined;
  isSubtasksExpanded: boolean;
  onToggleSubtasks: () => void;
  onAddSubtask?: () => void;
  showDetails?: boolean;
}

function isSubTask(
  data: Doc<"tasks"> | Doc<"subTasks">
): data is Doc<"subTasks"> {
  return "parentId" in data;
}

export const TaskContent: FC<TaskContentProps> = ({
  data,
  taskName,
  isCompleted,
  priority,
  priorityColor,
  dueDate,
  dateStatus,
  formattedTime,
  isTask,
  subtaskCount,
  incompleteSubtasks,
  project,
  isSubtasksExpanded,
  onToggleSubtasks,
  onAddSubtask,
  showDetails,
}) => {
  return (
    <DialogTrigger asChild>
      <div
        className="flex flex-col items-start w-full cursor-pointer"
        onClick={(e) => {
          if (isSubTask(data)) {
            e.stopPropagation();
          }
        }}
      >
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
            onToggleSubtasks={onToggleSubtasks}
            onAddSubtask={onAddSubtask}
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
          onToggleSubtasks={onToggleSubtasks}
          onAddSubtask={onAddSubtask}
          isMobile={true}
        />
        {showDetails && (
          <div className="flex gap-2 mt-1">
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs text-foreground/70"></span>
            </div>
            {dueDate && (
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-primary">
                  {new Date(dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogTrigger>
  );
};
