"use client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import {
  Calendar,
  ChevronDown,
  Flag,
  Hash,
  Tag,
  Trash2,
  Loader2,
  CalendarIcon,
  X,
  Sparkles,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FC, useMemo, useState } from "react";
import { Task } from "./Task";
import { AddTaskWrapper } from "./AddTaskButton";
import { useToast } from "@/hooks/useToast";
import { SuggestMissingTasks } from "./SuggestedTasks";
import { useTaskStore } from "@/stores/taskStore";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar as CalendarComponent } from "@/components/ui/Calendar";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";

interface AddTaskDialogProps {
  data: Doc<"tasks">;
  isOpen: boolean;
}

export const AddTaskDialog: FC<AddTaskDialogProps> = ({ data, isOpen }) => {
  const {
    taskName: initialTaskName,
    description: initialDescription,
    projectId: initialProjectId,
    labelId: initialLabelId,
    priority: initialPriority,
    dueDate: initialDueDate,
    _id,
  } = data;
  const { projects } = useTaskStore();

  // Editable state
  const [taskName, setTaskName] = useState(initialTaskName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
    initialProjectId
  );
  const [labelId, setLabelId] = useState<Id<"labels"> | undefined>(
    initialLabelId
  );
  const [priority, setPriority] = useState<number | undefined>(initialPriority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialDueDate ? new Date(initialDueDate) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const labelsQuery = useQuery(api.label.getLabels, isOpen ? {} : "skip");

  const labels = useMemo(() => labelsQuery ?? [], [labelsQuery]);

  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const createCalendarEvent = useAction(api.googleCalendar.createCalendarEvent);
  const isCalendarConnected = useQuery(api.googleCalendar.isCalendarConnected) ?? false;

  const incompleteSubtasksByProject =
    useQuery(
      api.subTasks.incompleteSubTasks,
      isOpen ? { parentId: _id } : "skip"
    ) ?? [];

  const completedSubtasksByProject =
    useQuery(
      api.subTasks.completedSubTasks,
      isOpen ? { parentId: _id } : "skip"
    ) ?? [];

  const checkSubTaskMutation = useMutation(api.subTasks.checkSubTask);
  const uncheckSubTaskMutation = useMutation(api.subTasks.uncheckSubTask);

  const deleteATaskMutation = useMutation(api.tasks.deleteTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTaskMutation({
        taskId: _id,
        taskName: taskName || undefined,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate ? dueDate.getTime() : undefined,
        projectId: projectId || undefined,
        labelId: labelId || undefined,
      });
      toast({
        title: "✅ Task updated",
        duration: 3000,
      });
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
  };

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

    const startTime = dueDate ? dueDate.getTime() : new Date().getTime();
    const endTime = dueDate ? dueDate.getTime() + 3600000 : new Date().getTime() + 3600000;

    if (!startTime) {
      toast({
        title: "Error",
        description: "Please set a due date first",
        variant: "destructive",
      });
      return;
    }

    // Update task with startDate and endDate if not set
    if (!data.startDate || !data.endDate) {
      await updateTaskMutation({
        taskId: _id,
        startDate: startTime,
        endDate: endTime,
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
      const errorMessage = error instanceof Error ? error.message : "Failed to add to calendar";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleGenerateDescription = async () => {
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
${existingDescription ? `Existing Description (to improve/expand upon):\n"${existingDescription}"\n\nPlease create an enhanced, comprehensive description that builds upon or replaces the existing one.` : "No existing description. Please create a comprehensive description from scratch."}

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

      const data = await response.json();
      const generatedDescription = data.response.trim();

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
  };

  return (
    <DialogContent className="w-full xl:max-w-[1200px] max-h-[90vh] overflow-y-auto flex flex-col md:flex-row p-0 gap-0">
      {/* Left side - Task content and subtasks */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="text-4xl md:text-xl lg:text-2xl font-semibold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
            placeholder="Task name"
            aria-label="Task name"
          />
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Description</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription || !taskName.trim()}
                className="flex items-center gap-2"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create description with AI
                  </>
                )}
              </Button>
            </div>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Add description..."
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Sub-tasks
              </h3>
            </div>
            {projectId && (
              <SuggestMissingTasks
                projectId={projectId}
                taskName={taskName || ""}
                description={description || ""}
                parentId={_id}
                isSubTask={true}
              />
            )}
          </div>

          <div className="space-y-1">
            {incompleteSubtasksByProject.map((task: Doc<"subTasks">) => (
              <Task
                key={task._id}
                data={task}
                isCompleted={task.isCompleted}
                handleOnChange={() =>
                  checkSubTaskMutation({ taskId: task._id })
                }
              />
            ))}

            <div className="py-2">
              <AddTaskWrapper parentTask={data} />
            </div>

            {completedSubtasksByProject.length > 0 && (
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Completed
                </p>
                {completedSubtasksByProject.map((task: Doc<"subTasks">) => (
                  <Task
                    key={task._id}
                    data={task}
                    isCompleted={task.isCompleted}
                    handleOnChange={() =>
                      uncheckSubTaskMutation({ taskId: task._id })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Task details */}
      <div className="w-full border-t  border-border bg-background flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-border shrink-0">
          <h3 className="font-semibold text-base text-foreground">Details</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-w-0">
          {/* Project */}
          <div className="group relative w-full">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Hash className="w-4 h-4 text-primary capitalize" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Project
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={projectId || undefined}
                    onValueChange={(value) => {
                      setProjectId(value as Id<"projects">);
                      handleSave();
                    }}
                  >
                    <SelectTrigger className="h-8 flex-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((proj: Doc<"projects">) => (
                        <SelectItem key={proj._id} value={proj._id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setProjectId(undefined);
                        handleSave();
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      aria-label="Clear project"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="group relative w-full">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Calendar className="w-4 h-4 text-primary capitalize" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Due date
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-semibold text-sm flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors",
                        !dueDate && "text-muted-foreground italic"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date || undefined);
                        if (date) handleSave();
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="group relative w-full">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Flag className="w-4 h-4 text-primary capitalize" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Priority
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={priority?.toString() || undefined}
                    onValueChange={(value) => {
                      setPriority(parseInt(value));
                      handleSave();
                    }}
                  >
                    <SelectTrigger className="h-8 flex-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          Priority {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {priority && (
                    <button
                      type="button"
                      onClick={() => {
                        setPriority(undefined);
                        handleSave();
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      aria-label="Clear priority"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="group relative w-full">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Tag className="w-4 h-4 text-primary capitalize" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Label
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={labelId || undefined}
                    onValueChange={(value) => {
                      setLabelId(value as Id<"labels">);
                      handleSave();
                    }}
                  >
                    <SelectTrigger className="h-8 flex-1">
                      <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent>
                      {labels.map((lbl: Doc<"labels">) => (
                        <SelectItem key={lbl._id} value={lbl._id}>
                          {lbl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {labelId && (
                    <button
                      type="button"
                      onClick={() => {
                        setLabelId(undefined);
                        handleSave();
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      aria-label="Clear label"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 space-y-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          {isCalendarConnected && !data.googleCalendarEventId && (
            <button
              onClick={handleAddToCalendar}
              disabled={isAddingToCalendar || !dueDate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-border bg-background hover:bg-muted rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isAddingToCalendar ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding to Calendar...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Google Calendar
                </>
              )}
            </button>
          )}
          <form onSubmit={(e) => handleDeleteTodo(e)}>
            <button
              type="submit"
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
};
