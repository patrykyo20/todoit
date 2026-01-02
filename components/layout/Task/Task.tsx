"use client";

import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";
import { Checkbox } from "@/components/ui";
import { Dialog, DialogTrigger } from "@/components/ui";
import { Calendar, GitBranch, Flag, Hash, Clock, AlertCircle } from "lucide-react";
import moment from "moment";
import { AddTaskDialog } from "./AddTaskDialog";
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTaskStore } from "@/stores/taskStore";

function isSubTask(
  data: Doc<"tasks"> | Doc<"subTasks">
): data is Doc<"subTasks"> {
  return "parentId" in data;
}

export function Task({
  data,
  isCompleted,
  handleOnChange,
  showDetails = false,
}: {
  data: Doc<"tasks"> | Doc<"subTasks">;
  isCompleted: boolean;
  handleOnChange: () => void;
  showDetails?: boolean;
}) {
  const taskName = "taskName" in data ? data.taskName : "";
  const dueDate = "dueDate" in data ? data.dueDate : undefined;
  const priority = "priority" in data ? data.priority : undefined;
  const labelId = "labelId" in data ? data.labelId : undefined;
  const projectId = "projectId" in data ? data.projectId : undefined;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { projects } = useTaskStore();
  const isTask = !("parentId" in data);
  const taskId = isTask ? data._id : undefined;
  
  // Get label data
  const label = useQuery(
    api.label.getLabelByLabelId,
    labelId ? { labelId } : "skip"
  );
  
  // Get subtask count
  const allSubtasks = useQuery(
    api.subTasks.getSubTasksByParentId,
    taskId ? { parentId: taskId } : "skip"
  ) ?? [];
  
  const subtaskCount = allSubtasks.length;
  const incompleteSubtasks = allSubtasks.filter((st) => !st.isCompleted).length;
  
  // Get project name
  const project = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p._id === projectId);
  }, [projects, projectId]);
  
  // Generate label color from name
  const getLabelColor = useCallback((labelName?: string) => {
    if (!labelName) return "bg-gray-400";
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    let hash = 0;
    for (let i = 0; i < labelName.length; i++) {
      hash = labelName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);
  
  // Determine date status
  const getDateStatus = useMemo(() => {
    if (!dueDate) return null;
    const now = moment();
    const due = moment(dueDate);
    const diffDays = due.diff(now, "days");
    
    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    return "upcoming";
  }, [dueDate]);

  // Get priority color based on priority level
  const getPriorityColor = (priority?: number) => {
    if (!priority) return null;
    switch (priority) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-gray-500";
      default:
        return null;
    }
  };

  const priorityColor = getPriorityColor(priority);

  const calculateTimeSpent = useMemo(() => {
    if (!isTask) return null;
    const creationTime = data._creationTime;
    if (!creationTime) return null;
    
    const now = Date.now();
    const diffMs = now - creationTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return null;
    return diffDays;
  }, [isTask, data._creationTime]);

  const formatTimeSpent = useCallback((days?: number | null) => {
    if (!days || days === 0) return null;
    if (days === 1) {
      return "1 day";
    }
    return `${days} days`;
  }, []);

  const formattedTime = formatTimeSpent(calculateTimeSpent);

  const playClickSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      
      if (!isCompleted) {
        // Success sound - pleasant ascending chord (when checking)
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
        const duration = 0.15;
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = "sine";
          
          const startTime = audioContext.currentTime + index * 0.02;
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        });
      } else {
        // Uncheck sound - lower, neutral tone (when unchecking)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 350;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.12
        );
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
      }
    } catch {
      console.debug("Audio not available");
    }
  }, [isCompleted]);

  const handleCheckboxChange = useCallback(async () => {
    // Odtwórz dźwięk od razu
    playClickSound();

    // Uruchom animację od razu
    setIsAnimating(true);
    setIsLoading(true);

    // Resetuj animację po zakończeniu
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    try {
      // Wywołaj handleOnChange (który zrobi request)
      await handleOnChange();
    } finally {
      // Resetuj loading po zakończeniu requestu
      setIsLoading(false);
    }
  }, [handleOnChange, playClickSound]);

  return (
    <div
      id={`task-${data._id}`}
      className={clsx(
        "group flex items-center space-x-2 border-b-2 p-2 border-gray-100 animate-in fade-in hover:bg-muted/30 transition-all duration-300 rounded-sm",
        isAnimating &&
          (isCompleted ? "task-check-animation" : "task-uncheck-animation")
      )}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex gap-2 items-center justify-end w-full group-hover:bg-muted/30">
          <div className="flex gap-2 w-full">
            <Checkbox
              id="todo"
              className={clsx(
                "w-5 h-5 rounded-xl cursor-pointer hover:border-primary/50 hover:scale-110 transition-all",
                isCompleted &&
                  "data-[state=checked]:bg-gray-300 border-gray-300",
                isLoading && "opacity-70"
              )}
              checked={isCompleted}
              onCheckedChange={handleCheckboxChange}
              disabled={isLoading}
            />
            <DialogTrigger asChild>
              <div className="flex flex-col items-start w-full cursor-pointer">
                <div className="flex items-center gap-2 w-full flex-wrap">
                  {/* Priority Flag */}
                  {priority && priorityColor && (
                    <Flag
                      className={clsx(
                        "w-3.5 h-3.5 shrink-0",
                        priorityColor,
                        isCompleted && "opacity-50"
                      )}
                      fill="currentColor"
                    />
                  )}
                  
                  {/* Date Icon */}
                  {dueDate && getDateStatus && (
                    <div className="shrink-0">
                      {getDateStatus === "overdue" && (
                        <AlertCircle className={clsx(
                          "w-3.5 h-3.5 text-red-500",
                          isCompleted && "opacity-50"
                        )} />
                      )}
                      {getDateStatus === "today" && (
                        <Clock className={clsx(
                          "w-3.5 h-3.5 text-blue-500",
                          isCompleted && "opacity-50"
                        )} />
                      )}
                      {getDateStatus === "tomorrow" && (
                        <Calendar className={clsx(
                          "w-3.5 h-3.5 text-orange-500",
                          isCompleted && "opacity-50"
                        )} />
                      )}
                      {getDateStatus === "upcoming" && (
                        <Calendar className={clsx(
                          "w-3.5 h-3.5 text-gray-500",
                          isCompleted && "opacity-50"
                        )} />
                      )}
                    </div>
                  )}
                  
                  {/* Label Indicator */}
                  {label && (
                    <div
                      className={clsx(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        getLabelColor(label.name),
                        isCompleted && "opacity-50"
                      )}
                      title={label.name}
                    />
                  )}
                  
                  {/* Task Name */}
                  <button
                    className={clsx(
                      "text-sm font-normal text-left cursor-pointer hover:text-primary transition-colors flex-1 min-w-0",
                      isCompleted && "line-through text-foreground/30"
                    )}
                  >
                    {taskName}
                  </button>
                  
                  {/* Desktop: Additional Info */}
                  <div className="hidden md:flex items-center gap-3 ml-auto shrink-0">
                    {/* Time Spent */}
                    {formattedTime && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formattedTime}</span>
                      </div>
                    )}
                    
                    {/* Sub-task Count */}
                    {isTask && subtaskCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span>
                          {incompleteSubtasks}/{subtaskCount}
                        </span>
                      </div>
                    )}
                    
                    {/* Project */}
                    {project && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{project.name}</span>
                      </div>
                    )}
                    
                    {/* Date */}
                    {dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{moment(dueDate).format("MMM D")}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile: Additional Info */}
                <div className="md:hidden flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {formattedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formattedTime}</span>
                    </div>
                  )}
                  {isTask && subtaskCount > 0 && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      <span>{incompleteSubtasks}/{subtaskCount}</span>
                    </div>
                  )}
                  {project && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span>{project.name}</span>
                    </div>
                  )}
                  {dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{moment(dueDate).format("MMM D")}</span>
                    </div>
                  )}
                </div>
                
                {showDetails && (
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1">
                      <GitBranch className="w-3 h-3 text-foreground/70" />
                      <p className="text-xs text-foreground/70"></p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      <p className="text-xs text-primary">
                        {moment(dueDate).format("LL")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogTrigger>
          </div>
          {!isSubTask(data) && (
            <AddTaskDialog data={data} isOpen={isDialogOpen} />
          )}
        </div>
      </Dialog>
    </div>
  );
}
