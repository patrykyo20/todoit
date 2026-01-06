"use client";
import { FC } from "react";
import { Calendar, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar as CalendarComponent } from "@/components/ui/Calendar";

interface TaskDueDateFieldProps {
  dueDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onSave: () => void;
}

export const TaskDueDateField: FC<TaskDueDateFieldProps> = ({
  dueDate,
  onDateChange,
  onSave,
}) => {
  return (
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
                  onDateChange(date || undefined);
                  if (date) onSave();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
