import { useCallback, useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { useTaskStore } from "@/stores/taskStore";

interface UseTaskDialogStateProps {
  data: Doc<"tasks"> | Doc<"subTasks">;
}

export function useTaskDialogState({ data }: UseTaskDialogStateProps) {
  const {
    openDialogId,
    setOpenDialogId,
    openSubtaskDialogId,
    setOpenSubtaskDialogId,
  } = useTaskStore();

  const isTask = !("parentId" in data);

  const isDialogOpen = useMemo(
    () =>
      isTask
        ? openDialogId === data._id
        : openSubtaskDialogId === data._id,
    [isTask, openDialogId, openSubtaskDialogId, data._id]
  );

  const handleDialogChange = useCallback(
    (open: boolean) => {
      console.log(`Dialog ${isTask ? "task" : "subtask"} ${data._id}: ${open}`);

      if (isTask) {
        setOpenDialogId(open ? data._id : null);
      } else {
        setOpenSubtaskDialogId(open ? data._id : null);
      }
    },
    [isTask, data._id, setOpenDialogId, setOpenSubtaskDialogId]
  );

  return {
    isDialogOpen,
    handleDialogChange,
    isTask,
  };
}
