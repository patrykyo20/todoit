import { Doc } from "@/convex/_generated/dataModel";
import { useTaskStore } from "@/stores/taskStore";
import { ProjectLink } from "./ProjectLink";

export const ProjectsList = () => {
  const { projects } = useTaskStore();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Projects</h1>
      </div>
      <div className="flex flex-col gap-1 py-4">
        {projects?.map((project: Doc<"projects">) => (
          <ProjectLink
            key={project._id}
            projectId={project._id}
            projectName={project.name}
          />
        ))}
      </div>
    </>
  );
};
