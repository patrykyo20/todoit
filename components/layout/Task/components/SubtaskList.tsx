import { FC } from "react";
import clsx from "clsx";
import { Doc } from "@/convex/_generated/dataModel";
import { Task } from "../Task";

interface SubtaskListProps {
  parentId: string;
  incompleteSubtasks: Doc<"subTasks">[];
  completedSubtasks: Doc<"subTasks">[];
  onSubTaskCheck: (subTaskId: string) => void;
  onSubTaskUncheck: (subTaskId: string) => void;
  className?: string;
}

export const SubtaskList: FC<SubtaskListProps> = ({
  parentId,
  incompleteSubtasks,
  completedSubtasks,
  onSubTaskCheck,
  onSubTaskUncheck,
  className,
}) => {
  return (
    <div className={clsx("ml-6 mt-1 space-y-0 border-l-2 border-border/30 pl-4", className)}>
      {incompleteSubtasks.map((subtask) => (
        <Task
          key={`nested-subtask-incomplete-${parentId}-${subtask._id}`}
          data={subtask}
          isCompleted={subtask.isCompleted}
          handleOnChange={() => onSubTaskCheck(subtask._id)}
        />
      ))}
      {completedSubtasks.length > 0 && (
        <>
          {completedSubtasks.map((subtask) => (
            <Task
              key={`nested-subtask-completed-${parentId}-${subtask._id}`}
              data={subtask}
              isCompleted={subtask.isCompleted}
              handleOnChange={() => onSubTaskUncheck(subtask._id)}
            />
          ))}
        </>
      )}
    </div>
  );
};
