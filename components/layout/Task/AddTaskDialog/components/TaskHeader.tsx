"use client";
import { FC, memo } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, Sparkles } from "lucide-react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface TaskHeaderProps {
  taskName: string;
  description: string;
  onTaskNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGenerateDescription: () => void;
  isGeneratingDescription: boolean;
}

export const TaskHeader: FC<TaskHeaderProps> = memo(
  ({
    taskName,
    description,
    onTaskNameChange,
    onDescriptionChange,
    onGenerateDescription,
    isGeneratingDescription,
  }) => {
    return (
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <Input
          value={taskName}
          onChange={(e) => onTaskNameChange(e.target.value)}
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
              onClick={onGenerateDescription}
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
            value={description}
            onChange={onDescriptionChange}
            placeholder="Add description..."
          />
        </div>
      </DialogHeader>
    );
  }
);

TaskHeader.displayName = "TaskHeader";
