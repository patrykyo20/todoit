import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import { useTaskStore } from "@/stores/taskStore";

interface UseSubtaskDialogProps {
  data: Doc<"subTasks">;
  isOpen: boolean;
}

export function useSubtaskDialog({ data, isOpen }: UseSubtaskDialogProps) {
  const {
    taskName: initialTaskName,
    description: initialDescription,
    projectId: initialProjectId,
    priority: initialPriority,
    dueDate: initialDueDate,
    _id,
  } = data;

  const { projects } = useTaskStore();
  const { toast } = useToast();

  // State
  const [taskName, setTaskName] = useState(initialTaskName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
    initialProjectId
  );
  const [priority, setPriority] = useState<number | undefined>(initialPriority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialDueDate ? new Date(initialDueDate) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  // Mutations
  const deleteSubTaskMutation = useMutation(api.subTasks.deleteSubTask);
  const updateSubTaskMutation = useMutation(api.subTasks.updateSubTask);

  // Handlers
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateSubTaskMutation({
        taskId: _id,
        taskName: taskName || undefined,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate ? dueDate.getTime() : undefined,
        projectId: projectId || undefined,
      });
      toast({
        title: "✅ Subtask updated",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
      toast({
        title: "❌ Error updating subtask",
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    taskName,
    description,
    priority,
    dueDate,
    projectId,
    updateSubTaskMutation,
    toast,
    _id,
  ]);

  const handleDeleteTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const deletedId = await deleteSubTaskMutation({ taskId: _id });
      if (deletedId !== undefined) {
        toast({
          title: "🗑️ Successfully deleted",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast({
        title: "❌ Error deleting subtask",
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!taskName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const project = projects.find((p) => p._id === projectId);
      const existingDescription = description.trim();

      const messages = [
        {
          role: "system",
          content: `You are an expert project management assistant specializing in creating comprehensive, actionable task descriptions. Your goal is to generate a detailed, professional task description that:

1. Clearly explains WHAT needs to be done
2. Provides context on WHY it's important
3. Outlines HOW to approach the task (if applicable)
4. Includes any relevant details, requirements, or constraints
5. Is written in clear, professional language
6. Is structured and easy to read

The description should be:
- Comprehensive but concise (3-5 sentences, or structured as bullet points if appropriate)
- Actionable and specific
- Professional yet approachable
- Contextually relevant to the task name and project

Return ONLY the description text. Do not include any meta-commentary, JSON formatting, or markdown code blocks. Just return the pure description text.`,
        },
        {
          role: "user",
          content: `Task Name: "${taskName.trim()}"
${project ? `Project: "${project.name}"` : ""}
${
  existingDescription
    ? `Existing Description (to improve/expand upon):\n"${existingDescription}"\n\nPlease create an enhanced, comprehensive description that builds upon or replaces the existing one.`
    : "No existing description. Please create a comprehensive description from scratch."
}

Generate a detailed, professional task description that provides clear context, explains the purpose, and outlines what needs to be accomplished.`,
        },
      ];

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          useJsonFormat: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const responseData = await response.json();
      const generatedDescription = responseData.response.trim();

      if (generatedDescription) {
        setDescription(generatedDescription);
        toast({
          title: "Success",
          description: "Description generated!",
        });
      }
    } catch (error) {
      console.error("Error generating description:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate description. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  }, [taskName, projects, description, projectId, toast]);

  return {
    // State
    taskName,
    setTaskName,
    description,
    onDescriptionChange,
    projectId,
    setProjectId,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    isSaving,
    isGeneratingDescription,
    isDeleting,
    // Data
    projects,
    // Handlers
    handleSave,
    handleDeleteTodo,
    handleGenerateDescription,
    // Task data
    subtaskData: data,
  };
}
