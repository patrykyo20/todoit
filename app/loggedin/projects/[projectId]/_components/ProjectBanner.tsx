"use client";

import { FC } from "react";
import { Info, Calendar, Palette } from "lucide-react";
import { format } from "date-fns";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface ProjectBannerProps {
  project: Doc<"projects"> | undefined;
}

export const ProjectBanner: FC<ProjectBannerProps> = ({ project }) => {
  if (
    !project?.status &&
    !project?.startDate &&
    !project?.endDate &&
    !project?.description &&
    !project?.color
  ) {
    return null;
  }

  return (
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
  );
};
