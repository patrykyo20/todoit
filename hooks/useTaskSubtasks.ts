import { useState, useCallback } from "react";

interface UseTaskSubtasksProps {
  isTask: boolean;
}

export function useTaskSubtasks({ isTask }: UseTaskSubtasksProps) {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const handleToggleSubtasks = useCallback(() => {
    setIsSubtasksExpanded((prev) => !prev);
  }, []);

  const handleAddSubtask = useCallback(() => {
    setShowAddSubtask((prev) => !prev);
  }, []);

  const handleSubtaskAdded = useCallback(() => {
    setShowAddSubtask(false);
    setIsSubtasksExpanded(true);
  }, []);

  if (!isTask) {
    return {
      isSubtasksExpanded: false,
      showAddSubtask: false,
      handleToggleSubtasks: () => {},
      handleAddSubtask: () => {},
      handleSubtaskAdded: () => {},
    };
  }

  return {
    isSubtasksExpanded,
    showAddSubtask,
    handleToggleSubtasks,
    handleAddSubtask,
    handleSubtaskAdded,
  };
}
