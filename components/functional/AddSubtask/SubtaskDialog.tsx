"use client";
import { FC, useCallback } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { DialogContent } from "@/components/ui";
import { useSubtaskDialog } from "@/hooks";
import { TaskHeader, TaskActionButtons, TaskDetailField } from "@/components/functional/AddTask";
import { Flag } from "lucide-react";
import { priorityOptions } from "@/lib";

interface SubtaskDialogProps {
  data: Doc<"subTasks">;
  isOpen: boolean;
}

export const SubtaskDialog: FC<SubtaskDialogProps> = ({ data, isOpen }) => {
  const {
    taskName,
    description,
    setTaskName,
    onDescriptionChange,
    priority,
    setPriority,
    handleGenerateDescription,
    isSaving,
    isDeleting,
    isGeneratingDescription,
    handleSave,
    handleDeleteTodo,
  } = useSubtaskDialog({ data, isOpen });

  const handlePriorityChange = useCallback(
    (value: string) => {
      setPriority(parseInt(value));
      handleSave();
    },
    [setPriority, handleSave]
  );

  const handlePriorityClear = useCallback(() => {
    setPriority(undefined);
    handleSave();
  }, [setPriority, handleSave]);

  return (
    <DialogContent
      className="w-full xl:max-w-[1200px] overflow-auto max-h-[90vh] flex flex-col md:flex-row p-0 gap-0"
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
      </div>

      <TaskDetailField
        icon={<Flag className="w-4 h-4 text-primary capitalize" />}
        label="Priority"
        value={priority?.toString()}
        placeholder="Select priority"
        options={priorityOptions}
        onValueChange={handlePriorityChange}
        onClear={handlePriorityClear}
      />

      <div className="shrink-0 bg-background border-t border-border sticky bottom-0">
        <TaskActionButtons
          isSaving={isSaving}
          isDeleting={isDeleting}
          onSave={handleSave}
          onDelete={handleDeleteTodo}
        />
      </div>
    </DialogContent>
  );
};
