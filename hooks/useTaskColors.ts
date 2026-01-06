import { useCallback } from "react";

export const useTaskColors = () => {
  const getPriorityColor = useCallback((priority?: number) => {
    if (!priority) return null;
    switch (priority) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-gray-500";
      default:
        return null;
    }
  }, []);

  return {
    getPriorityColor,
  };
};
