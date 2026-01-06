"use client";
import { FC, useCallback } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { DialogContent } from "@/components/ui";
import { useKeyboardShortcuts } from "@/hooks";
import { useTaskDialog } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";
import { TaskDetailsSection } from "./TaskDetailsSection";
import { TaskSubtasksSection } from "./TaskSubtasksSection";
import { TaskHeader } from "./TaskHeader";
import { TaskActionButtons } from "./TaskActionButtons";

interface AddTaskDialogProps {
  data: Doc<"tasks">;
  isOpen: boolean;
}

export const AddTaskDialog: FC<AddTaskDialogProps> = ({ data, isOpen }) => {
  const {
    taskName,
    setTaskName,
    description,
    onDescriptionChange,
    projectId,
    setProjectId,
    priority,
    setPriority,
    dueDate,
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
    projects,
    incompleteSubtasksByProject,
    completedSubtasksByProject,
    isCalendarConnected,
    handleSave,
    handleDeleteTodo,
    handleAddToCalendar,
    handleGenerateDescription,
    checkSubTaskMutation,
    uncheckSubTaskMutation,
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

  const handleDelete = useCallback(() => {
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleDeleteTodo(syntheticEvent);
  }, [handleDeleteTodo]);

  useKeyboardShortcuts({
    isEnabled: isOpen,
    isSaving,
    isDeleting,
    onSave: handleSave,
    onDelete: handleDelete,
  });

  return (
    <DialogContent
      className="w-full xl:max-w-[1200px] overflow-auto max-h-[90vh] flex flex-col md:flex-row p-0! gap-0"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
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
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          frequency={frequency}
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
          onStartDateChange={(date) => {
            setStartDate(date);
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
          }}
          onStartTimeChange={(time) => {
            setStartTime(time);
          }}
          onEndTimeChange={(time) => {
            setEndTime(time);
          }}
          onFrequencyChange={(freq) => {
            setFrequency(freq);
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
