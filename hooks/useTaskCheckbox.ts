import { useState, useCallback } from "react";

interface UseTaskCheckboxProps {
  isCompleted: boolean;
  handleOnChange: () => void | Promise<void>;
}

export function useTaskCheckbox({
  isCompleted,
  handleOnChange,
}: UseTaskCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = useCallback(async () => {
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
  }, [handleOnChange]);

  return {
    isAnimating,
    isLoading,
    handleCheckboxChange,
  };
}
