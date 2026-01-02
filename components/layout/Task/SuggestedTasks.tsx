"use client";

import { FC } from "react";
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
  
  // Pobierz dane projektu i tasków
  const project = useQuery(api.project.getProjectByProjectId, { projectId });
  const tasks = useQuery(api.tasks.getTasksByProjectId, { projectId });
  
  // Mutacje do tworzenia tasków
  const createTask = useAction(api.tasks.createTaskAndEmbeddings);

  const handleMissingTasks = async () => {
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
            "You are a helpful project management assistant. Analyze the existing tasks and suggest 5 additional tasks that would be useful for completing the project. Return ONLY a valid JSON object with this exact structure: {\"todos\": [{\"taskName\": \"...\", \"description\": \"...\"}, ...]}. Do not include any text before or after the JSON.",
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
      const AI_LABEL_ID = "k57exc6xrw3ar5e1nmab4vnbjs6v1m4p" as Id<"labels">;
      
      for (const item of items) {
        const { taskName: newTaskName, description: newDescription } = item;
        if (!newTaskName) continue;

        await createTask({
          taskName: newTaskName,
          description: newDescription || "",
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: AI_LABEL_ID,
        });
      }

      toast({
        title: "Success",
        description: `Created ${items.length} suggested tasks!`,
      });
    } catch (error) {
      console.error("Error in suggestMissingTasks", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to suggest tasks. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMissingSubTasks = async () => {
    if (!parentId || !project) return;

    setIsLoading(true);
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful project management assistant. Analyze the parent task and suggest 2-3 sub-tasks that would help complete it. Return ONLY a valid JSON object with this exact structure: {\"todos\": [{\"taskName\": \"...\", \"description\": \"...\"}, ...]}. Do not include any text before or after the JSON.",
        },
        {
          role: "user",
          content: `Parent task: "${taskName}"\nDescription: "${description || ""}"\n\nSuggest 2-3 sub-tasks that would help complete this task.`,
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

      // Parsuj JSON
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

      // Utwórz sub-taski (użyj createSubTask jeśli masz taką funkcję)
      // TODO: Dodaj funkcję do tworzenia sub-tasków
      toast({
        title: "Success",
        description: `Generated ${items.length} sub-task suggestions!`,
      });
    } catch (error) {
      console.error("Error in suggestMissingSubTasks", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to suggest sub-tasks. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
