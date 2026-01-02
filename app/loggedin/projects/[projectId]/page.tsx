"use client";
import {
  CompletedTasks,
  DeleteProject,
  SuggestMissingTasks,
  AddTaskWrapper,
  Tasks,
} from "@/components/layout";
import { TaskSkeleton } from "@/components/layout/Task/TaskSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useTaskStore } from "@/stores/taskStore";
import { useMemo, useEffect, useState } from "react";
import { TaskSort } from "@/components/layout/Task/TaskSort";
import { SortBy, SortOrder } from "@/components/layout/Task/Tasks";
import { Calendar, Info, Palette } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ProjectIdPage() {
  const { projectId } = useParams<{ projectId: Id<"projects"> }>();
  const {
    tasksData,
    projects,
    isLoading,
    setSelectedProject,
    setSelectedProjectId,
  } = useTaskStore();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const project = useMemo(
    () => projects.find((p) => p._id === projectId),
    [projects, projectId]
  );

  // Zapisz wybrany projekt w store
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
      setSelectedProjectId(projectId);
    }
    // Cleanup - wyczyść wybrany projekt po odmontowaniu
    return () => {
      setSelectedProject(null);
      setSelectedProjectId(null);
    };
  }, [project, projectId, setSelectedProject, setSelectedProjectId]);

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

  const projectName = project?.name || "";

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "planning":
        return "bg-gray-500";
      case "in_progress":
        return "bg-blue-500";
      case "on_hold":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "in_progress":
        return "In Progress";
      case "on_hold":
        return "On Hold";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Planning";
    }
  };

  if (isLoading || !tasksData) {
    return (
      <>
        <div className="flex items-center justify-between flex-wrap gap-2 lg:gap-0 mb-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6 lg:gap-12 items-center">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <TaskSkeleton count={5} />
          <div className="pb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          <TaskSkeleton count={3} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2 lg:gap-0 mb-4">
        <div className="flex items-center gap-3">
          {project?.color && (
            <div
              className="w-4 h-4 rounded-full border-2 border-border"
              style={{ backgroundColor: project.color }}
            />
          )}
          <h1 className="text-lg font-semibold md:text-2xl">
            {projectName || "Project"}
          </h1>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <TaskSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          <SuggestMissingTasks projectId={projectId} />
          <DeleteProject projectId={projectId} />
        </div>
      </div>

      {/* Project Info */}
      {(project?.status ||
        project?.startDate ||
        project?.endDate ||
        project?.description ||
        project?.color) && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Project Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.status && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusColor(project.status)
                    )}
                  />
                  <span className="text-sm font-medium">
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>
            )}

            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Start:</span>
                <span className="text-sm">
                  {format(new Date(project.startDate), "PPP")}
                </span>
              </div>
            )}

            {project.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">End:</span>
                <span className="text-sm">
                  {format(new Date(project.endDate), "PPP")}
                </span>
              </div>
            )}

            {project.color && (
              <div className="flex items-center gap-2">
                <Palette className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm font-mono">{project.color}</span>
                </div>
              </div>
            )}
          </div>

          {project.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}
        </div>
      )}

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
    </>
  );
}
