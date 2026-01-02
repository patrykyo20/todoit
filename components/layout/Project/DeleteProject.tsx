"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { EllipsisIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { Id } from "@/convex/_generated/dataModel";
import { GET_STARTED_PROJECT_ID } from "@/utils";

export function DeleteProject({ projectId }: { projectId: Id<"projects"> }) {
  const form = useForm({ defaultValues: { name: "" } });
  const { toast } = useToast();
  const router = useRouter();

  const deleteProject = useAction(api.project.deleteProjectAndItsTasks);

  const onSubmit = async () => {
    if (projectId === GET_STARTED_PROJECT_ID) {
      toast({
        title: "🤗 Just a reminder",
        description: "System projects are protected from deletion.",
        duration: 3000,
      });
    } else {
      const deleteTaskId = await deleteProject({ projectId });

      if (deleteTaskId !== undefined) {
        toast({
          title: "🗑️ Successfully created a project",
          duration: 3000,
        });
        router.push(`/loggedin/projects`);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors">
        <EllipsisIcon className="w-5 h-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="w-40 lg:w-56">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <button type="submit" className="flex gap-2 cursor-pointer hover:bg-destructive/10 rounded-md px-2 py-1.5 transition-colors w-full">
              <Trash2 className="w-5 h-5 rotate-45 text-foreground/40 hover:text-destructive transition-colors" /> Delete
              Project
            </button>
          </form>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
