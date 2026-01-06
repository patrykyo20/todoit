"use client";
import { FC, useState, useEffect } from "react";
import { Calendar, CalendarIcon, Clock, Repeat } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar as CalendarComponent } from "@/components/ui/Calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface TaskDateRangeFieldProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  frequency: string | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onFrequencyChange: (frequency: string | undefined) => void;
  onSave: () => void;
}

export const TaskDateRangeField: FC<TaskDateRangeFieldProps> = ({
  startDate,
  endDate,
  startTime,
  endTime,
  frequency,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onFrequencyChange,
  onSave,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    !!(startDate || startTime || frequency)
  );

  const hasStartInfo = !!(startDate || startTime);

  // Helper function to compare times
  const compareTimes = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    const total1 = h1 * 60 + m1;
    const total2 = h2 * 60 + m2;
    return total1 - total2;
  };

  // Helper function to check if dates are the same day
  const isSameDay = (
    date1: Date | undefined,
    date2: Date | undefined
  ): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Auto-correct endDate if it's before startDate
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      const correctedEndDate = new Date(startDate);
      onEndDateChange(correctedEndDate);
    }
  }, [startDate, endDate, onEndDateChange]);

  // Auto-correct endTime if it's before startTime (when dates are the same)
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      isSameDay(startDate, endDate) &&
      startTime &&
      endTime &&
      compareTimes(endTime, startTime) <= 0
    ) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const endTimeDate = new Date();
      endTimeDate.setHours(hours + 1, minutes, 0, 0);
      const endTimeStr = format(endTimeDate, "HH:mm");
      onEndTimeChange(endTimeStr);
    }
  }, [startDate, endDate, startTime, endTime, onEndTimeChange]);

  const handleStartDateChange = (date: Date | undefined) => {
    onStartDateChange(date);
    if (date) {
      setIsExpanded(true);
      if (!endDate) {
        onEndDateChange(date);
      } else if (endDate < date) {
        onEndDateChange(date);
      }
      // Don't auto-set time - let user choose if they want time
      onSave();
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && startDate && date < startDate) {
      onEndDateChange(startDate);
    } else {
      onEndDateChange(date);
    }
    if (date) onSave();
  };

  const handleStartTimeChange = (time: string) => {
    onStartTimeChange(time);
    setIsExpanded(true);
    if (time) {
      if (!endTime) {
        const [hours, minutes] = time.split(":").map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(hours + 1, minutes, 0, 0);
        const endTimeStr = format(endTimeDate, "HH:mm");
        onEndTimeChange(endTimeStr);
      } else if (
        startDate &&
        endDate &&
        isSameDay(startDate, endDate) &&
        compareTimes(endTime, time) <= 0
      ) {
        const [hours, minutes] = time.split(":").map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(hours + 1, minutes, 0, 0);
        const endTimeStr = format(endTimeDate, "HH:mm");
        onEndTimeChange(endTimeStr);
      }
    }
    onSave();
  };

  const handleEndTimeChange = (time: string) => {
    if (
      time &&
      startDate &&
      endDate &&
      isSameDay(startDate, endDate) &&
      startTime &&
      compareTimes(time, startTime) <= 0
    ) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const endTimeDate = new Date();
      endTimeDate.setHours(hours + 1, minutes, 0, 0);
      const endTimeStr = format(endTimeDate, "HH:mm");
      onEndTimeChange(endTimeStr);
    } else {
      onEndTimeChange(time);
    }
    onSave();
  };

  const handleFrequencyChange = (value: string) => {
    onFrequencyChange(value === "none" ? undefined : value);
    onSave();
  };

  const frequencyOptions = [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div className="group relative w-full space-y-3">
      {/* Simple Due Date View (when collapsed) */}
      {!isExpanded && (
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
                    !startDate && "text-muted-foreground italic"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {startDate
                      ? `${format(startDate, "PPP")}${startTime ? ` at ${startTime}` : ""}`
                      : "Pick a date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                    />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Start Date & Time */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
              <Calendar className="w-4 h-4 text-primary capitalize" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Start</p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex-1 justify-start text-left font-semibold text-sm flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors",
                        !startDate && "text-muted-foreground italic"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {startDate
                          ? `${format(startDate, "PPP")}${startTime ? ` ${startTime}` : ""}`
                          : "Date"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="pl-10 pr-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm font-semibold w-[140px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
              <Calendar className="w-4 h-4 text-primary capitalize" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">End</p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex-1 justify-start text-left font-semibold text-sm flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors",
                        !endDate && "text-muted-foreground italic"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {endDate
                          ? `${format(endDate, "PPP")}${endTime ? ` ${endTime}` : ""}`
                          : "Date"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => {
                        // Only disable dates before startDate (allow same date)
                        if (!startDate) return false;

                        // Compare dates without time
                        const startYear = startDate.getFullYear();
                        const startMonth = startDate.getMonth();
                        const startDay = startDate.getDate();

                        const checkYear = date.getFullYear();
                        const checkMonth = date.getMonth();
                        const checkDay = date.getDate();

                        // Disable only if check date is before start date
                        if (checkYear < startYear) return true;
                        if (checkYear === startYear && checkMonth < startMonth)
                          return true;
                        if (
                          checkYear === startYear &&
                          checkMonth === startMonth &&
                          checkDay < startDay
                        )
                          return true;

                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    min={
                      startDate &&
                      endDate &&
                      isSameDay(startDate, endDate) &&
                      startTime
                        ? startTime
                        : undefined
                    }
                    className="pl-10 pr-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm font-semibold w-[140px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {hasStartInfo && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 w-full">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Repeat className="w-4 h-4 text-primary capitalize" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Repeat
                </p>
                <Select
                  value={frequency || "none"}
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Does not repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Collapse button */}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Hide options
          </button>
        </div>
      )}

      {/* Expand button (when collapsed but has data) */}
      {!isExpanded && hasStartInfo && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Show more options
        </button>
      )}
    </div>
  );
};
