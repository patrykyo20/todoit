"use client";
import { Button } from "@/components/ui/Button";
import { RefreshCw, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  title: string;
  isLoadingEvents: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onRefresh: () => void;
  onCreateEvent: () => void;
  showCreateButton?: boolean;
}

interface NavButtonProps {
  onClick: () => void;
  ariaLabel: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const NavButton = memo(({ onClick, ariaLabel, icon, disabled }: NavButtonProps) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={ariaLabel}
    disabled={disabled}
  >
    {icon}
  </button>
));
NavButton.displayName = "NavButton";

interface TitleSectionProps {
  title: string;
  isLoadingEvents: boolean;
}

const TitleSection = memo(({ title, isLoadingEvents }: TitleSectionProps) => (
  <div className="flex items-center gap-2">
    <h2 className="text-xl font-semibold">{title}</h2>
    {isLoadingEvents && (
      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
    )}
  </div>
));
TitleSection.displayName = "TitleSection";

// Create event button component
interface CreateEventButtonProps {
  onCreateEvent: () => void;
}

const CreateEventButton = memo(({ onCreateEvent }: CreateEventButtonProps) => (
  <Button onClick={onCreateEvent} className="flex items-center gap-2">
    <Plus className="w-4 h-4" />
    Create Event
  </Button>
));
CreateEventButton.displayName = "CreateEventButton";

export const CalendarHeader = memo(
  ({
    title,
    isLoadingEvents,
    onPrevious,
    onNext,
    onRefresh,
    onCreateEvent,
    showCreateButton = true,
  }: CalendarHeaderProps) => {
    return (
      <div className="flex items-center justify-between">
        {showCreateButton && (
          <div className="flex items-center gap-2">
            <CreateEventButton onCreateEvent={onCreateEvent} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <NavButton
            onClick={onPrevious}
            ariaLabel="Previous"
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          <TitleSection title={title} isLoadingEvents={isLoadingEvents} />
          <div className="flex items-center gap-2">
            <NavButton
              onClick={onRefresh}
              ariaLabel="Refresh calendar events"
              icon={
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isLoadingEvents && "animate-spin"
                  )}
                />
              }
              disabled={isLoadingEvents}
            />
            <NavButton
              onClick={onNext}
              ariaLabel="Next"
              icon={<ChevronRight className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
      prevProps.title === nextProps.title &&
      prevProps.isLoadingEvents === nextProps.isLoadingEvents &&
      prevProps.showCreateButton === nextProps.showCreateButton
    );
  }
);
CalendarHeader.displayName = "CalendarHeader";
