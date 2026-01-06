import { useQuery, useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface UseSubTasksProps {
  taskId?: string;
}

export const useSubTasks = ({ taskId }: UseSubTasksProps) => {
  const allSubtasks =
    useQuery(
      api.subTasks.getSubTasksByParentId,
      taskId ? { parentId: taskId as Id<"tasks"> } : "skip"
    ) ?? [];

  const subtaskCount = allSubtasks.length;
  const incompleteSubtasks = allSubtasks.filter((st) => !st.isCompleted).length;
  const incompleteSubtasksList = allSubtasks.filter((st) => !st.isCompleted);
  const completedSubtasksList = allSubtasks.filter((st) => st.isCompleted);

  const checkSubTask = useMutation(api.subTasks.checkSubTask);
  const uncheckSubTask = useMutation(api.subTasks.uncheckSubTask);

  const handleSubTaskCheck = useCallback(
    async (subTaskId: string) => {
      await checkSubTask({ taskId: subTaskId as Doc<"subTasks">["_id"] });
    },
    [checkSubTask]
  );

  const handleSubTaskUncheck = useCallback(
    async (subTaskId: string) => {
      await uncheckSubTask({ taskId: subTaskId as Doc<"subTasks">["_id"] });
    },
    [uncheckSubTask]
  );

  return {
    subtaskCount,
    incompleteSubtasks,
    incompleteSubtasksList,
    completedSubtasksList,
    handleSubTaskCheck,
    handleSubTaskUncheck,
  };
};
