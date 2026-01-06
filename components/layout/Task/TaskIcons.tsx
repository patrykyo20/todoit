import { FC } from "react";
import clsx from "clsx";
import { Calendar, Flag, AlertCircle, Clock } from "lucide-react";

interface TaskIconsProps {
  priority?: number;
  priorityColor?: string | null;
  dueDate?: number;
  dateStatus?: "overdue" | "today" | "tomorrow" | "upcoming" | null;
  isCompleted: boolean;
  className?: string;
}

export const TaskIcons: FC<TaskIconsProps> = ({
  priority,
  priorityColor,
  dueDate,
  dateStatus,
  isCompleted,
  className,
}) => {
  return (
    <>
      {priority && priorityColor && (
        <Flag
          className={clsx(
            "w-3.5 h-3.5 shrink-0",
            priorityColor,
            isCompleted && "opacity-50",
            className
          )}
          fill="currentColor"
        />
      )}

      {dueDate && dateStatus && (
        <div className="shrink-0">
          {dateStatus === "overdue" && (
            <AlertCircle
              className={clsx(
                "w-3.5 h-3.5 text-red-500",
                isCompleted && "opacity-50",
                className
              )}
            />
          )}
          {dateStatus === "today" && (
            <Clock
              className={clsx(
                "w-3.5 h-3.5 text-blue-500",
                isCompleted && "opacity-50",
                className
              )}
            />
          )}
          {dateStatus === "tomorrow" && (
            <Calendar
              className={clsx(
                "w-3.5 h-3.5 text-orange-500",
                isCompleted && "opacity-50",
                className
              )}
            />
          )}
          {dateStatus === "upcoming" && (
            <Calendar
              className={clsx(
                "w-3.5 h-3.5 text-gray-500",
                isCompleted && "opacity-50",
                className
              )}
            />
          )}
        </div>
      )}
    </>
  );
};
