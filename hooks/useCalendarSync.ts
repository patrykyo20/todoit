import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import { Id } from "@/convex/_generated/dataModel";

export function useCalendarSync() {
  const { toast } = useToast();
  const createEvent = useAction(api.googleCalendar.createCalendarEvent);
  const updateEvent = useAction(api.googleCalendar.updateCalendarEvent);
  const deleteEvent = useAction(api.googleCalendar.deleteCalendarEvent);

  const syncTask = async (taskId: string, hasEvent: boolean) => {
    try {
      if (hasEvent) {
        await updateEvent({ taskId: taskId as Id<"tasks"> });
        toast({
          title: "✅ Calendar event updated",
          description: "Task has been synced with Google Calendar",
          duration: 2000,
        });
      } else {
        await createEvent({ taskId: taskId as Id<"tasks"> });
        toast({
          title: "✅ Calendar event created",
          description: "Task has been added to Google Calendar",
          duration: 2000,
        });
      }
    } catch {
      toast({
        title: "❌ Error",
        description:
          "Failed to sync with Google Calendar. Make sure you're connected.",
        duration: 3000,
      });
    }
  };

  const unsyncTask = async (taskId: string) => {
    try {
      await deleteEvent({ taskId: taskId as Id<"tasks"> });
      toast({
        title: "✅ Calendar event removed",
        description: "Task has been removed from Google Calendar",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to remove from Google Calendar",
        duration: 3000,
      });
    }
  };

  return {
    syncTask,
    unsyncTask,
  };
}
