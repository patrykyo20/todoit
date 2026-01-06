import { Id } from "@/convex/_generated/dataModel";
import { FC } from "react";
import { SortBy, SortOrder } from "@/types";
import { TaskSort } from "@/components/layout/Task/TaskSort";
import { DeleteProject } from "@/components/layout";
import { SuggestedTasks } from "@/components/functional";

interface ProjectHeaderProps {
  projectName: string;
  projectColor: string;
  projectId: Id<"projects">;
  sortBy: SortBy;
  sortOrder: SortOrder;
  handleSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

export const ProjectHeader: FC<ProjectHeaderProps> = ({
  projectName,
  projectColor,
  projectId,
  sortBy,
  sortOrder,
  handleSortChange,
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 lg:gap-0 mb-4">
      <div className="flex items-center gap-3">
        {projectColor && (
          <div
            className="w-4 h-4 rounded-full border-2 border-border"
            style={{ backgroundColor: projectColor }}
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
        <SuggestedTasks projectId={projectId} />
        <DeleteProject projectId={projectId} />
      </div>
    </div>
  );
};
