"use client";

import { useTaskStore } from "@/stores/taskStore";
import { ProjectsSkeleton, ProjectsError, ProjectsList } from "./_components";

export default function Projects() {
  const { isLoading, isError } = useTaskStore();

  if (isLoading) return <ProjectsSkeleton />;

  if (isError) return <ProjectsError />;

  return <ProjectsList />;
}
