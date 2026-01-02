"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, CheckCircle2, RefreshCw } from "lucide-react";
import moment from "moment";
import { Id } from "@/convex/_generated/dataModel";

interface ListViewProps {
  tasksWithDates: Array<Doc<"tasks">>;
  onSyncTask: (taskId: string, hasEvent: boolean) => void;
  onUnsyncTask: (taskId: string) => void;
}

export function ListView({
  tasksWithDates,
  onSyncTask,
  onUnsyncTask,
}: ListViewProps) {
  if (tasksWithDates.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          No tasks with dates found. Add start/end dates or due dates to tasks
          to sync them with Google Calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Tasks with dates that can be synced with Google Calendar:
      </p>
      <div className="space-y-2">
        {tasksWithDates.map((task) => {
          const hasEvent = !!task.googleCalendarEventId;
          return (
            <div
              key={task._id}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-sm">
                  {task.taskName || "Untitled Task"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {task.startDate && task.endDate ? (
                    <>
                      Start:{" "}
                      {moment(task.startDate).format("MMM D, YYYY [at] h:mm A")}{" "}
                      - End:{" "}
                      {moment(task.endDate).format("MMM D, YYYY [at] h:mm A")}
                    </>
                  ) : task.startDate ? (
                    <>
                      Start:{" "}
                      {moment(task.startDate).format("MMM D, YYYY [at] h:mm A")}
                    </>
                  ) : task.dueDate ? (
                    <>
                      Due: {moment(task.dueDate).format("MMM D, YYYY [at] h:mm A")}
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasEvent ? (
                  <>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Synced</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSyncTask(task._id, true)}
                      className="h-8"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Update
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnsyncTask(task._id)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      Unsync
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSyncTask(task._id, false)}
                    className="h-8"
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Sync to Calendar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
