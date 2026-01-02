import { useState, useEffect, useRef, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import moment from "moment";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  isAllDay: boolean;
};

const DEBOUNCE_DELAY = 300; // 300ms debounce delay

export function useCalendarEvents(
  isConnected: boolean,
  viewMode: "month" | "week",
  currentMonth: Date,
  currentWeek: Date
) {
  const { toast } = useToast();
  const getCalendarEvents = useAction(api.googleCalendar.getCalendarEvents);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  // Refs for cleanup and debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const toastRef = useRef(toast);

  // Keep toast ref updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!isConnected || (viewMode !== "month" && viewMode !== "week")) {
      setCalendarEvents([]);
      setIsLoadingEvents(false);
      return;
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      setIsLoadingEvents(true);

      let startDate: Date, endDate: Date;
      if (viewMode === "week") {
        startDate = moment(currentWeek).startOf("week").toDate();
        endDate = moment(currentWeek).endOf("week").toDate();
      } else {
        startDate = moment(currentMonth).startOf("month").toDate();
        endDate = moment(currentMonth).endOf("month").toDate();
      }

      getCalendarEvents({
        timeMin: startDate.getTime(),
        timeMax: endDate.getTime(),
      })
        .then((events) => {
          if (!isMountedRef.current) return;
          
          setCalendarEvents(events);
          if (events.length === 0) {
            toastRef.current({
              title: "ℹ️ No events found",
              description: "No calendar events found for this period.",
              duration: 3000,
            });
          }
        })
        .catch((error: { message?: string }) => {
          if (!isMountedRef.current) return;
          
          console.error("Error loading calendar events:", error);
          const errorMessage =
            error.message ||
            "Failed to load calendar events. Please check your connection.";

          // Check if re-authentication is needed
          if (
            errorMessage.includes("REAUTH_NEEDED") ||
            errorMessage.includes("No refresh token")
          ) {
            toastRef.current({
              title: "⚠️ Re-authentication required",
              description:
                "Your Google Calendar access has expired. Please sign out and sign in again to refresh your calendar permissions.",
              duration: 8000,
            });
          } else {
            toastRef.current({
              title: "❌ Error loading events",
              description: errorMessage,
              duration: 5000,
            });
          }
          setCalendarEvents([]);
        })
        .finally(() => {
          if (isMountedRef.current) {
            setIsLoadingEvents(false);
          }
        });
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    isConnected,
    currentMonth,
    currentWeek,
    viewMode,
    getCalendarEvents,
  ]);

  const refreshEvents = useCallback(
    async (timeMin: number, timeMax: number) => {
      setIsLoadingEvents(true);
      try {
        const events = await getCalendarEvents({ timeMin, timeMax });
        if (!isMountedRef.current) return events;
        
        setCalendarEvents(events);
        toastRef.current({
          title: "✅ Refreshed",
          description: `Loaded ${events.length} calendar events`,
          duration: 2000,
        });
        return events;
      } catch (error: { message?: string } | unknown) {
        if (!isMountedRef.current) throw error;
        
        const errorMessage =
          (error as { message?: string })?.message ||
          "Failed to refresh calendar events";
        toastRef.current({
          title: "❌ Error",
          description: errorMessage,
          duration: 5000,
        });
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsLoadingEvents(false);
        }
      }
    },
    [getCalendarEvents]
  );

  return {
    calendarEvents,
    isLoadingEvents,
    refreshEvents,
  };
}
