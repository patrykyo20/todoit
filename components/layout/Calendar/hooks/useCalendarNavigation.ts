import { useState, useRef, useEffect } from "react";
import moment from "moment";

export function useCalendarNavigation() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekCalendarRef = useRef<HTMLDivElement>(null);

  // Scroll to 8:00 when week view loads
  useEffect(() => {
    if (viewMode === "week" && weekCalendarRef.current) {
      const scrollTo8AM = () => {
        if (weekCalendarRef.current) {
          weekCalendarRef.current.scrollTop = 8 * 64; // 512px
        }
      };
      setTimeout(scrollTo8AM, 100);
    }
  }, [viewMode, currentWeek]);

  // Scroll to hour 8 when week view is opened
  useEffect(() => {
    if (viewMode === "week" && weekCalendarRef.current) {
      weekCalendarRef.current.scrollTop = 512;
    }
  }, [viewMode]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => {
      const newDate = moment(prev);
      if (direction === "prev") {
        return newDate.subtract(1, "week").toDate();
      } else {
        return newDate.add(1, "week").toDate();
      }
    });
  };

  return {
    viewMode,
    setViewMode,
    currentMonth,
    currentWeek,
    weekCalendarRef,
    navigateMonth,
    navigateWeek,
  };
}
