import { FC } from "react";
import clsx from "clsx";
import { Checkbox } from "@/components/ui";

interface TaskCheckboxProps {
  isCompleted: boolean;
  isLoading: boolean;
  onCheckedChange: () => void;
  testId?: string;
}

export const TaskCheckbox: FC<TaskCheckboxProps> = ({
  isCompleted,
  isLoading,
  onCheckedChange,
  testId,
}) => {
  return (
    <Checkbox
      id="todo"
      className={clsx(
        "w-5 h-5 rounded-xl cursor-pointer hover:border-primary/50 hover:scale-110 transition-all",
        isCompleted && "data-[state=checked]:bg-gray-300 border-gray-300",
        isLoading && "opacity-70"
      )}
      checked={isCompleted}
      onCheckedChange={onCheckedChange}
      disabled={isLoading}
      data-testid={testId}
    />
  );
};
