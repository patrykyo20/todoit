"use client";

import { FC, useEffect, useRef, useReducer, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { Loader2 } from "lucide-react";
import { AddTaskInline } from "@/components/functional/AddTask";
import { Id } from "@/convex/_generated/dataModel";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: Id<"projects">;
}

type DialogState = {
  shouldShowForm: boolean;
  isLoading: boolean;
};

type DialogAction =
  | { type: "OPEN"; showLoader: boolean }
  | { type: "CLOSE" }
  | { type: "SHOW_FORM" }
  | { type: "HIDE_FORM" };

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "OPEN":
      return {
        shouldShowForm: false,
        isLoading: action.showLoader,
      };
    case "CLOSE":
      return {
        shouldShowForm: false,
        isLoading: false,
      };
    case "SHOW_FORM":
      return {
        shouldShowForm: true,
        isLoading: false,
      };
    case "HIDE_FORM":
      return {
        shouldShowForm: false,
        isLoading: state.isLoading,
      };
    default:
      return state;
  }
}

export const CreateTaskDialog: FC<CreateTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  projectId,
}) => {
  const [state, dispatch] = useReducer(dialogReducer, {
    shouldShowForm: false,
    isLoading: false,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isOpen) {
      dispatch({ type: "CLOSE" });
      return;
    }

    dispatch({ type: "OPEN", showLoader: true });

    timerRef.current = setTimeout(() => {
      dispatch({ type: "SHOW_FORM" });
      timerRef.current = null;
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleTaskCreated = useCallback(() => {
    dispatch({ type: "HIDE_FORM" });
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  }, [dispatch, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        {state.isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[240px]" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          state.shouldShowForm && (
            <AddTaskInline
              setShowAddTask={(value) => {
                if (typeof value === "function") {
                  const newValue = value(state.shouldShowForm);
                  if (!newValue) {
                    handleTaskCreated();
                  }
                } else if (!value) {
                  handleTaskCreated();
                }
              }}
              projectId={projectId}
              enableKeyboardShortcuts={isOpen && state.shouldShowForm}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
