"use client";

import { FC, useCallback } from "react";
import { useState } from "react";
import { Loader } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface SuggestMissingTasksProps {
  projectId: Id<"projects">;
  isSubTask?: boolean;
  taskName?: string;
  description?: string;
  parentId?: Id<"tasks">;
}

export const SuggestMissingTasks: FC<SuggestMissingTasksProps> = ({
  projectId,
  isSubTask = false,
  taskName = "",
  description = "",
  parentId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const project = useQuery(api.project.getProjectByProjectId, { projectId });
  const tasks = useQuery(api.tasks.getTasksByProjectId, { projectId });

  const existingSubTasks = useQuery(
    api.subTasks.getSubTasksByParentId,
    parentId ? { parentId } : "skip"
  );

  // Mutacje do tworzenia tasków i sub-tasków
  const createTask = useAction(api.tasks.createTaskAndEmbeddings);
  const createSubTask = useAction(api.subTasks.createSubTaskAndEmbeddings);

  const handleMissingTasks = useCallback(async () => {
    if (!project || !tasks) {
      toast({
        title: "Error",
        description: "Loading project data...",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const projectName = project.name || "this project";

      const messages = [
        {
          role: "system",
          content:
            'You are a helpful project management assistant. Analyze the existing tasks and suggest 5 additional tasks that would be useful for completing the project. Return ONLY a valid JSON object with this exact structure: {"todos": [{"taskName": "...", "description": "..."}, ...]}. Do not include any text before or after the JSON.',
        },
        {
          role: "user",
          content: `Project: ${projectName}\n\nExisting tasks:\n${JSON.stringify(
            tasks.map((t) => ({
              taskName: t.taskName || t.text,
              description: t.description || "",
            })),
            null,
            2
          )}\n\nSuggest 5 new tasks that are missing and would help complete this project.`,
        },
      ];

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          useJsonFormat: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to call AI");
      }

      const data = await response.json();
      const messageContent = data.response;

      // Parsuj JSON - usuń markdown code blocks jeśli są
      let cleanedContent = messageContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(cleanedContent);
      const items = parsed?.todos ?? [];

      if (items.length === 0) {
        toast({
          title: "No suggestions",
          description: "AI couldn't generate any task suggestions.",
        });
        return;
      }

      // Utwórz taski
      for (const item of items) {
        const { taskName: newTaskName, description: newDescription } = item;
        if (!newTaskName) continue;

        await createTask({
          taskName: newTaskName,
          description: newDescription || "",
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: "k579xwsz7e2y73rxexkrg2f5j96tzt4f" as Id<"labels">,
        });
      }

      toast({
        title: "Success",
        description: `Created ${items.length} suggested tasks!`,
      });
    } catch {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to suggest tasks. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    JSON.stringify(project),
    JSON.stringify(tasks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    toast,
    createTask,
    projectId,
  ]);

  const handleMissingSubTasks = useCallback(async () => {
    console.log(parentId, project);
    if (!parentId || !project) {
      toast({
        title: "Error",
        description: "Missing parent task or project information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const existingSubTasksList = existingSubTasks || [];
      const existingSubTasksText =
        existingSubTasksList.length > 0
          ? existingSubTasksList
              .map(
                (st) =>
                  `- ${st.taskName}${st.description ? `: ${st.description}` : ""}`
              )
              .join("\n")
          : "No existing sub-tasks.";

      const messages = [
        {
          role: "system",
          content:
            'You are a helpful project management assistant. Analyze the parent task and existing sub-tasks, then suggest 2-3 additional sub-tasks that would help complete the parent task. Return ONLY a valid JSON object with this exact structure: {"todos": [{"taskName": "...", "description": "..."}, ...]}. Do not include any text before or after the JSON.',
        },
        {
          role: "user",
          content: `Parent task: "${taskName}"\nDescription: "${description || ""}"\n\nExisting sub-tasks:\n${existingSubTasksText}\n\nSuggest 2-3 new sub-tasks that are missing and would help complete this parent task. Avoid duplicating existing sub-tasks.`,
        },
      ];

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          useJsonFormat: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to call AI");
      }

      const data = await response.json();
      const messageContent = data.response;

      let cleanedContent = messageContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(cleanedContent);
      const items = parsed?.todos ?? [];

      if (items.length === 0) {
        toast({
          title: "No suggestions",
          description: "AI couldn't generate any sub-task suggestions.",
        });
        return;
      }

      // Utwórz sub-taski
      for (const item of items) {
        const { taskName: newTaskName, description: newDescription } = item;
        if (!newTaskName) continue;

        await createSubTask({
          taskName: newTaskName,
          description: newDescription || "",
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: "k579xwsz7e2y73rxexkrg2f5j96tzt4f" as Id<"labels">,
          parentId,
        });
      }

      toast({
        title: "Success",
        description: `Created ${items.length} suggested sub-tasks!`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to suggest sub-tasks. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    JSON.stringify(existingSubTasks),
    JSON.stringify(project),
    JSON.stringify(tasks),
    toast,
    createSubTask,
    projectId,
    parentId,
  ]);

  return project && (
    <Button
      variant={"outline"}
      disabled={isLoading}
      onClick={isSubTask ? handleMissingSubTasks : handleMissingTasks}
    >
      {isLoading ? (
        <div className="flex gap-2">
          Loading Tasks (AI)
          <Loader className="h-5 w-5 text-primary" />
        </div>
      ) : (
        "Suggest Missing Tasks (AI) 💖"
      )}
    </Button>
  );
};
