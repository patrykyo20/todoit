import { CompletedTasks, Tasks } from "@/components/layout";
import { AddTaskWrapper } from "@/components/functional";
import { Id } from "@/convex/_generated/dataModel";
import { FC, useMemo } from "react";
import { SortBy, SortOrder } from "@/types";
import { useTaskStore } from "@/stores/taskStore";

interface ProjectBodyProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  projectId: Id<"projects">;
}

export const ProjectBody: FC<ProjectBodyProps> = ({
  sortBy,
  sortOrder,
  projectId,
}) => {
  const { tasksData } = useTaskStore();

  const inCompletedTodosByProject = useMemo(
    () =>
      tasksData?.incomplete.filter((task) => task.projectId === projectId) ??
      [],
    [tasksData, projectId]
  );

  const completedTodosByProject = useMemo(
    () =>
      tasksData?.completed.filter((task) => task.projectId === projectId) ?? [],
    [tasksData, projectId]
  );

  const projectTodosTotal = useMemo(
    () =>
      tasksData?.completed.filter((task) => task.projectId === projectId)
        .length || 0,
    [tasksData, projectId]
  );

  return (
    <div className="flex flex-col gap-1 mt-4">
      <Tasks
        items={inCompletedTodosByProject}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      <div className="pb-6">
        <AddTaskWrapper projectId={projectId} />
      </div>

      <Tasks
        items={completedTodosByProject}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
      <CompletedTasks totalTasks={projectTodosTotal} />
    </div>
  );
};
