"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useTaskStore } from "@/stores/taskStore";
import { ProjectSkeleton, ProjectError, ProjectList } from "./_components";

export default function ProjectIdPage() {
  const { projectId } = useParams<{ projectId: Id<"projects"> }>();
  const { tasksData, isLoading, isError } = useTaskStore();

  if (isLoading || !tasksData) {
    return <ProjectSkeleton />;
  }

  if (isError) {
    return <ProjectError />;
  }

  return <ProjectList projectId={projectId} />;
}
