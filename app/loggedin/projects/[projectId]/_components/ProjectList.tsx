import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Id } from "@/convex/_generated/dataModel";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectBody } from "./ProjectBody";
import { SortBy, SortOrder } from "@/types";
import { ProjectBanner } from "./ProjectBanner";

interface ProjectListProps {
  projectId: Id<"projects">;
}

export const ProjectList: FC<ProjectListProps> = ({ projectId }) => {
  const { projects, setSelectedProject, setSelectedProjectId } = useTaskStore();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const project = useMemo(
    () => projects.find((p) => p._id === projectId),
    [projects, projectId]
  );

  useEffect(() => {
    if (project) {
      setSelectedProject(project);
      setSelectedProjectId(projectId);
    }
    return () => {
      setSelectedProject(null);
      setSelectedProjectId(null);
    };
  }, [project, projectId, setSelectedProject, setSelectedProjectId]);

  const handleSortByChange = useCallback(
    (newSortBy: SortBy, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    []
  );

  return (
    <>
      <ProjectHeader
        projectName={project?.name || ""}
        projectColor={project?.color || ""}
        projectId={projectId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSortChange={handleSortByChange}
      />

      <ProjectBanner project={project} />
      <ProjectBody
        sortBy={sortBy}
        sortOrder={sortOrder}
        projectId={projectId}
      />
    </>
  );
};
