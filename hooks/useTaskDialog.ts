import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import { useTaskStore } from "@/stores/taskStore";
import { format } from "date-fns";

interface UseTaskDialogProps {
  data: Doc<"tasks">;
  isOpen: boolean;
}

export function useTaskDialog({ data, isOpen }: UseTaskDialogProps) {
  const {
    taskName: initialTaskName,
    description: initialDescription,
    projectId: initialProjectId,
    priority: initialPriority,
    dueDate: initialDueDate,
    startDate: initialStartDate,
    endDate: initialEndDate,
    frequency: initialFrequency,
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
  
  // Date range fields
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStartDate ? new Date(initialStartDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialEndDate ? new Date(initialEndDate) : undefined
  );
  const [startTime, setStartTime] = useState<string>(() => {
    if (initialStartDate) {
      return format(new Date(initialStartDate), "HH:mm");
    }
    return "";
  });
  const [endTime, setEndTime] = useState<string>(() => {
    if (initialEndDate) {
      return format(new Date(initialEndDate), "HH:mm");
    }
    return "";
  });
  const [frequency, setFrequency] = useState<string | undefined>(initialFrequency);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  const onDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  // Queries
  const isCalendarConnected =
    useQuery(api.googleCalendar.isCalendarConnected) ?? false;

  const incompleteSubtasksQuery =
    useQuery(
      api.subTasks.incompleteSubTasks,
      isOpen ? { parentId: _id } : "skip"
    ) ?? [];

  const completedSubtasksQuery =
    useQuery(
      api.subTasks.completedSubTasks,
      isOpen ? { parentId: _id } : "skip"
    ) ?? [];

  // Remove duplicates by ID to prevent React key conflicts
  const incompleteSubtasksByProject = useMemo(() => {
    return Array.from(
      new Map(incompleteSubtasksQuery.map((task) => [task._id, task])).values()
    );
  }, [incompleteSubtasksQuery]);

  const completedSubtasksByProject = useMemo(() => {
    return Array.from(
      new Map(completedSubtasksQuery.map((task) => [task._id, task])).values()
    );
  }, [completedSubtasksQuery]);

  // Mutations
  const checkSubTaskMutation = useMutation(api.subTasks.checkSubTask);
  const uncheckSubTaskMutation = useMutation(api.subTasks.uncheckSubTask);
  const deleteATaskMutation = useMutation(api.tasks.deleteTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  const createCalendarEvent = useAction(api.googleCalendar.createCalendarEvent);
  const updateCalendarEvent = useAction(api.googleCalendar.updateCalendarEvent);

  // Helper function to combine date and time into timestamp
  const combineDateAndTime = useCallback((date: Date | undefined, time: string): number | undefined => {
    if (!date || !time) return undefined;
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.getTime();
  }, []);

  // Handlers
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const startDateTimestamp = combineDateAndTime(startDate, startTime);
      const endDateTimestamp = combineDateAndTime(endDate, endTime);
      
      await updateTaskMutation({
        taskId: _id,
        taskName: taskName || undefined,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate ? dueDate.getTime() : undefined,
        startDate: startDateTimestamp || undefined,
        endDate: endDateTimestamp || undefined,
        frequency: frequency || undefined,
        projectId: projectId || undefined,
      });

      // If task is linked to Google Calendar, update the calendar event
      if (data.googleCalendarEventId) {
        try {
          await updateCalendarEvent({ taskId: _id });
          toast({
            title: "✅ Task and calendar event updated",
            duration: 3000,
          });
        } catch (calendarError) {
          console.error("Error updating calendar event:", calendarError);
          // Still show success for task update, but warn about calendar
          toast({
            title: "✅ Task updated",
            description: "Calendar event update failed. Please try syncing manually.",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "✅ Task updated",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "❌ Error updating task",
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
    startDate,
    endDate,
    startTime,
    endTime,
    frequency,
    projectId,
    updateTaskMutation,
    updateCalendarEvent,
    combineDateAndTime,
    toast,
    _id,
    data.googleCalendarEventId,
  ]);

  const handleDeleteTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const deletedId = await deleteATaskMutation({ taskId: _id });
      if (deletedId !== undefined) {
        toast({
          title: "🗑️ Successfully deleted",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "❌ Error deleting task",
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!taskName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name first",
        variant: "destructive",
      });
      return;
    }

    // Use startDate/endDate with time if available, otherwise use dueDate or current date
    let startTimeValue: number;
    let endTimeValue: number;

    if (startDate && endDate) {
      // If we have dates, combine with time if time is set, otherwise use date at midnight
      if (startTime && endTime) {
        startTimeValue = combineDateAndTime(startDate, startTime) || startDate.getTime();
        endTimeValue = combineDateAndTime(endDate, endTime) || endDate.getTime();
      } else {
        // No time set - use date at start and end of day
        const startDateCopy = new Date(startDate);
        startDateCopy.setHours(0, 0, 0, 0);
        startTimeValue = startDateCopy.getTime();
        
        const endDateCopy = new Date(endDate);
        endDateCopy.setHours(23, 59, 59, 999);
        endTimeValue = endDateCopy.getTime();
      }
    } else if (dueDate) {
      // Fallback to dueDate - use full day
      const startDateCopy = new Date(dueDate);
      startDateCopy.setHours(0, 0, 0, 0);
      startTimeValue = startDateCopy.getTime();
      
      const endDateCopy = new Date(dueDate);
      endDateCopy.setHours(23, 59, 59, 999);
      endTimeValue = endDateCopy.getTime();
    } else {
      toast({
        title: "Error",
        description: "Please set a start date or due date first",
        variant: "destructive",
      });
      return;
    }

    // Update task with startDate and endDate if not set
    if (!data.startDate || !data.endDate) {
      await updateTaskMutation({
        taskId: _id,
        startDate: startTimeValue,
        endDate: endTimeValue,
      });
    }

    setIsAddingToCalendar(true);
    try {
      await createCalendarEvent({ taskId: _id });
      toast({
        title: "Success",
        description: "Task added to Google Calendar!",
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to calendar";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCalendar(false);
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    frequency,
    setFrequency,
    isSaving,
    isGeneratingDescription,
    isDeleting,
    isAddingToCalendar,
    // Data
    projects,
    incompleteSubtasksByProject,
    completedSubtasksByProject,
    isCalendarConnected,
    // Handlers
    handleSave,
    handleDeleteTodo,
    handleAddToCalendar,
    handleGenerateDescription,
    // Mutations
    checkSubTaskMutation,
    uncheckSubTaskMutation,
    // Task ID
    taskId: _id,
    taskData: data,
  };
}
