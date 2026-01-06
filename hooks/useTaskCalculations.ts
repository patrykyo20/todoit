import { useMemo, useCallback } from "react";
import moment from "moment";
import { Doc } from "@/convex/_generated/dataModel";

type DateStatus = "overdue" | "today" | "tomorrow" | "upcoming" | null;

interface UseTaskCalculationsProps {
  dueDate?: number;
  isTask: boolean;
  creationTime: number;
}

export const useTaskCalculations = ({
  dueDate,
  isTask,
  creationTime,
}: UseTaskCalculationsProps) => {
  const dateStatus = useMemo<DateStatus>(() => {
    if (!dueDate) return null;
    const now = moment();
    const due = moment(dueDate);
    const diffDays = due.diff(now, "days");

    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    return "upcoming";
  }, [dueDate]);

  const calculateTimeSpent = useMemo(() => {
    if (!isTask) return null;
    if (!creationTime) return null;

    const now = new Date().getTime();
    const diffMs = now - creationTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return null;
    return diffDays;
  }, [isTask, creationTime]);

  const formatTimeSpent = useCallback((days?: number | null) => {
    if (!days || days === 0) return null;
    if (days === 1) {
      return "1 day";
    }
    return `${days} days`;
  }, []);

  const formattedTime = formatTimeSpent(calculateTimeSpent);

  return {
    dateStatus,
    formattedTime,
  };
};
