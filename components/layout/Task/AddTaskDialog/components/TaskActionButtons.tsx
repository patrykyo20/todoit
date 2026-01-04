"use client";
import { FC } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface TaskActionButtonsProps {
  isSaving: boolean;
  isDeleting: boolean;
  isAddingToCalendar: boolean;
  isCalendarConnected: boolean;
  hasCalendarEvent: boolean;
  hasDueDate: boolean;
  onSave: () => void;
  onDelete: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddToCalendar: () => void;
}

export const TaskActionButtons: FC<TaskActionButtonsProps> = ({
  isSaving,
  isDeleting,
  isAddingToCalendar,
  isCalendarConnected,
  hasCalendarEvent,
  hasDueDate,
  onSave,
  onDelete,
  onAddToCalendar,
}) => {
  return (
    <div className="px-6 py-4 border-t border-border bg-background space-y-2">
      <button
        onClick={onSave}
        disabled={isSaving}
        type="submit"
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
      {isCalendarConnected && !hasCalendarEvent && (
        <button
          onClick={onAddToCalendar}
          disabled={isAddingToCalendar || !hasDueDate}
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
      <form onSubmit={onDelete}>
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
  );
};
