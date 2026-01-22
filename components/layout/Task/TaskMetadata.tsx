import { FC } from "react";
import clsx from "clsx";
import {
  Calendar,
  GitBranch,
  Hash,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import moment from "moment";
import { Doc } from "@/convex/_generated/dataModel";

interface TaskMetadataProps {
  formattedTime?: string | null;
  isTask: boolean;
  subtaskCount: number;
  incompleteSubtasks: number;
  project?: Doc<"projects"> | null;
  dueDate?: number;
  isSubtasksExpanded: boolean;
  onToggleSubtasks: () => void;
  onAddSubtask?: () => void;
  isMobile?: boolean;
  className?: string;
}

export const TaskMetadata: FC<TaskMetadataProps> = ({
  formattedTime,
  isTask,
  subtaskCount,
  incompleteSubtasks,
  project,
  dueDate,
  isSubtasksExpanded,
  onToggleSubtasks,
  onAddSubtask,
  isMobile = false,
  className,
}) => {
  const containerClass = isMobile
    ? "md:hidden flex flex-end  items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground flex-wrap"
    : "hidden md:flex items-center gap-3 ml-auto shrink-0";

  return (
    <div className={clsx(containerClass, className)}>
      {formattedTime && !isMobile && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="w-3 h-3" />
          <span>{formattedTime}</span>
        </div>
      )}

      {isTask && subtaskCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">
            {incompleteSubtasks}/{subtaskCount}
          </span>
        </div>
      )}

      {project && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Hash className="w-3 h-3 shrink-0" />
          <span
            className={clsx(
              isMobile
                ? "hidden xs:inline truncate max-w-[60px] sm:max-w-[80px]"
                : "truncate max-w-[100px]"
            )}
            title={project.name}
          >
            {project.name}
          </span>
        </div>
      )}

      {dueDate && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">
            {moment(dueDate).format(isMobile ? "MMM D" : "MMM D")}
          </span>
        </div>
      )}

      {isTask && (
        <>
          {onAddSubtask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSubtask();
              }}
              className="shrink-0 p-0.5 hover:bg-muted/50 rounded transition-colors"
              aria-label="Add subtask"
            >
              <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition duration-200" />
            </button>
          )}
          {subtaskCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSubtasks();
              }}
              className="shrink-0 p-0.5 hover:bg-muted/50 rounded transition-colors"
              aria-label={
                isSubtasksExpanded ? "Collapse subtasks" : "Expand subtasks"
              }
            >
              {isSubtasksExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};
