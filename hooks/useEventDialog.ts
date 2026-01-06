import { useState } from "react";

export function useEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStartTime, setSelectedStartTime] = useState<Date | undefined>();
  const [selectedEndTime, setSelectedEndTime] = useState<Date | undefined>();

  const openDialog = (date?: Date, startTime?: Date, endTime?: Date) => {
    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedDate(undefined);
    setSelectedStartTime(undefined);
    setSelectedEndTime(undefined);
  };

  return {
    isOpen,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    openDialog,
    closeDialog,
  };
}
