"use client";
import { FC, ReactNode } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface TaskDetailFieldProps {
  icon: ReactNode;
  label: string;
  value: string | Id<"projects"> | Id<"labels"> | undefined;
  placeholder: string;
  options: Array<{ id: string; name: string }>;
  onValueChange: (value: string) => void;
  onClear: () => void;
}

export const TaskDetailField: FC<TaskDetailFieldProps> = ({
  icon,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  onClear,
}) => {
  return (
    <div className="group relative w-full">
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <Select value={value || undefined} onValueChange={onValueChange}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label={`Clear ${label.toLowerCase()}`}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
