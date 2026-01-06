import { useState, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import {
  TASK_SUGGESTIONS_SYSTEM_MESSAGE,
  SUBTASK_SUGGESTIONS_SYSTEM_MESSAGE,
  buildTaskSuggestionsUserMessage,
  buildSubtaskSuggestionsUserMessage,
} from "@/lib/constants/aiMessages";
import { callAI } from "@/lib/utils";

interface UseSuggestedTasksProps {
  projectId: Id<"projects">;
  taskName?: string;
  description?: string;
  parentId?: Id<"tasks">;
}

const DEFAULT_LABEL_ID = "k579xwsz7e2y73rxexkrg2f5j96tzt4f" as Id<"labels">;

export function useSuggestedTasks({
  projectId,
  taskName = "",
  description = "",
  parentId,
}: UseSuggestedTasksProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const project = useQuery(api.project.getProjectByProjectId, { projectId });
  const tasks = useQuery(api.tasks.getTasksByProjectId, { projectId });
  const existingSubTasks = useQuery(
    api.subTasks.getSubTasksByParentId,
    parentId ? { parentId } : "skip"
  );

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
          content: TASK_SUGGESTIONS_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: buildTaskSuggestionsUserMessage(projectName, tasks),
        },
      ];

      const items = await callAI(messages);

      if (items.length === 0) {
        toast({
          title: "No suggestions",
          description: "AI couldn't generate any task suggestions.",
        });
        return;
      }

      for (const item of items) {
        const { taskName: newTaskName, description: newDescription } = item;
        if (!newTaskName) continue;

        await createTask({
          taskName: newTaskName,
          description: newDescription || "",
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: DEFAULT_LABEL_ID,
        });
      }

      toast({
        title: "Success",
        description: `Created ${items.length} suggested tasks!`,
      });
    } catch (error) {
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
  }, [project, tasks, toast, createTask, projectId]);

  const handleMissingSubTasks = useCallback(async () => {
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
          content: SUBTASK_SUGGESTIONS_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: buildSubtaskSuggestionsUserMessage(
            taskName,
            description,
            existingSubTasksText
          ),
        },
      ];

      const items = await callAI(messages);

      if (items.length === 0) {
        toast({
          title: "No suggestions",
          description: "AI couldn't generate any sub-task suggestions.",
        });
        return;
      }

      for (const item of items) {
        const { taskName: newTaskName, description: newDescription } = item;
        if (!newTaskName) continue;

        await createSubTask({
          taskName: newTaskName,
          description: newDescription || "",
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: DEFAULT_LABEL_ID,
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
    parentId,
    project,
    existingSubTasks,
    taskName,
    description,
    toast,
    createSubTask,
    projectId,
  ]);

  return {
    isLoading,
    handleMissingTasks,
    handleMissingSubTasks,
    project,
  };
}
