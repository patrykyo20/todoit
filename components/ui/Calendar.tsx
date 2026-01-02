"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date | undefined>(
    props.defaultMonth || new Date()
  );

  return (
    <div className="space-y-4">
      {/* Custom Header */}
      <div className="flex justify-center items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            if (month) {
              const newMonth = new Date(month);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setMonth(newMonth);
            }
          }}
          className="h-8 w-8 bg-transparent hover:bg-indigo-100 rounded-full transition-colors duration-200 flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-lg font-semibold text-gray-700">
          {month?.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            if (month) {
              const newMonth = new Date(month);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setMonth(newMonth);
            }
          }}
          className="h-8 w-8 bg-transparent hover:bg-indigo-100 rounded-full transition-colors duration-200 flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        month={month}
        onMonthChange={setMonth}
        className={cn("font-sans!", className)}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden",
          caption_label: "hidden",
          nav: "hidden",
          nav_button:
            "h-8 w-8 bg-transparent hover:bg-indigo-100 rounded-full transition-colors duration-200 flex items-center justify-center",
          nav_button_previous: "",
          nav_button_next: "",
          table: "w-full border-collapse",
          head_row: "hidden",
          head_cell: "text-gray-500 rounded-md w-10 font-medium text-sm",
          row: "flex w-full",
          cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex-1 flex items-center justify-center",
          day: "h-10 w-10 p-0 font-normal text-center cursor-pointer hover:bg-indigo-100 rounded-full transition-all duration-200 hover:scale-110",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 font-semibold",
          day_today:
            "bg-accent text-accent-foreground font-semibold border-2 border-primary",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) => {
            const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
            return <Icon className="h-4 w-4" />;
          },
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
