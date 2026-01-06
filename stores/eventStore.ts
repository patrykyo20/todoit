import { create } from "zustand";

interface EventStore {
  isOpen: boolean;
  selectedDate: Date | undefined;
  selectedStartTime: Date | undefined;
  selectedEndTime: Date | undefined;
  openDialog: (date?: Date, startTime?: Date, endTime?: Date) => void;
  closeDialog: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  isOpen: false,
  selectedDate: undefined,
  selectedStartTime: undefined,
  selectedEndTime: undefined,
  openDialog: (date, startTime, endTime) =>
    set({
      isOpen: true,
      selectedDate: date,
      selectedStartTime: startTime,
      selectedEndTime: endTime,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      selectedDate: undefined,
      selectedStartTime: undefined,
      selectedEndTime: undefined,
    }),
}));
