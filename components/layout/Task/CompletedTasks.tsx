import { CircleCheckBig } from "lucide-react";

export function CompletedTasks({ totalTasks = 0 }: { totalTasks: number }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm">
      <CircleCheckBig className="h-5 w-5 text-green-600 dark:text-green-500" />
      <span className="font-semibold text-green-700 dark:text-green-400">
        {totalTasks}
      </span>
      <span className="capitalize text-green-600 dark:text-green-400">
        completed tasks
      </span>
    </div>
  );
}
