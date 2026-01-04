"use client";
import { FC, useCallback } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { DialogContent } from "@/components/ui";
import { useTaskDialog } from "./AddTaskDialog/hooks/useTaskDialog";
import { TaskHeader } from "./AddTaskDialog/components/TaskHeader";
import { TaskSubtasksSection } from "./AddTaskDialog/components/TaskSubtasksSection";
import { TaskDetailsSection } from "./AddTaskDialog/components/TaskDetailsSection";
import { TaskActionButtons } from "./AddTaskDialog/components/TaskActionButtons";
import { useKeyboardShortcuts } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";

interface AddTaskDialogProps {
  data: Doc<"tasks">;
  isOpen: boolean;
}

export const AddTaskDialog: FC<AddTaskDialogProps> = ({ data, isOpen }) => {
  const {
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
    // Task data
    taskData,
  } = useTaskDialog({ data, isOpen });

  const handleCheckSubTask = useCallback(
    (subTaskId: Id<"subTasks">) => {
      checkSubTaskMutation({ taskId: subTaskId });
    },
    [checkSubTaskMutation]
  );

  const handleUncheckSubTask = useCallback(
    (subTaskId: Id<"subTasks">) => {
      uncheckSubTaskMutation({ taskId: subTaskId });
    },
    [uncheckSubTaskMutation]
  );

  // Handle delete with synthetic event for keyboard shortcuts
  const handleDelete = useCallback(() => {
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleDeleteTodo(syntheticEvent);
  }, [handleDeleteTodo]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    isEnabled: isOpen,
    isSaving,
    isDeleting,
    onSave: handleSave,
    onDelete: handleDelete,
  });

  return (
    <DialogContent className="w-full xl:max-w-[1200px] overflow-auto max-h-[90vh] flex flex-col md:flex-row p-0! gap-0">
      {/* Left side - Task content and subtasks */}
      <div className="flex-1 flex flex-col min-h-0">
        <TaskHeader
          taskName={taskName}
          description={description}
          onTaskNameChange={setTaskName}
          onDescriptionChange={onDescriptionChange}
          onGenerateDescription={handleGenerateDescription}
          isGeneratingDescription={isGeneratingDescription}
        />

        <TaskSubtasksSection
          incompleteSubtasks={incompleteSubtasksByProject}
          completedSubtasks={completedSubtasksByProject}
          parentTask={taskData}
          projectId={projectId}
          taskName={taskName}
          description={description}
          onCheckSubTask={handleCheckSubTask}
          onUncheckSubTask={handleUncheckSubTask}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <TaskDetailsSection
          projects={projects}
          projectId={projectId}
          priority={priority}
          dueDate={dueDate}
          onProjectChange={(value) => {
            setProjectId(value);
            handleSave();
          }}
          onProjectClear={() => {
            setProjectId(undefined);
            handleSave();
          }}
          onPriorityChange={(value) => {
            setPriority(value);
            handleSave();
          }}
          onPriorityClear={() => {
            setPriority(undefined);
            handleSave();
          }}
          onDueDateChange={(date) => {
            setDueDate(date);
          }}
          onSave={handleSave}
        />
      </div>

      <div className="shrink-0 bg-background border-t border-border sticky bottom-0">
        <TaskActionButtons
          isSaving={isSaving}
          isDeleting={isDeleting}
          isAddingToCalendar={isAddingToCalendar}
          isCalendarConnected={isCalendarConnected}
          hasCalendarEvent={!!taskData.googleCalendarEventId}
          hasDueDate={!!dueDate}
          onSave={handleSave}
          onDelete={handleDeleteTodo}
          onAddToCalendar={handleAddToCalendar}
        />
      </div>
    </DialogContent>
  );
};
