import { Label } from "@/components/ui/Label";
import { FC } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Hash } from "lucide-react";
import Link from "next/link";

interface ProjectLinkProps {
  projectId: Id<"projects">;
  projectName: string;
}

export const ProjectLink: FC<ProjectLinkProps> = ({
  projectId,
  projectName,
}) => (
  <Link key={projectId} href={`/loggedin/projects/${projectId}`}>
    <div className="flex items-center space-x-2 border-b-2 p-2 border-gray-100">
      <Hash className="text-primary w-5" />
      <Label
        htmlFor="projects"
        className="text-base font-normal hover:cursor-pointer"
      >
        {projectName}
      </Label>
    </div>
  </Link>
);
