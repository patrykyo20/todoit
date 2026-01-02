"use client";
import React, { useCallback, useMemo } from "react";
import { Task } from "./Task";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import { useTaskStore } from "@/stores/taskStore";

export type SortBy = "date" | "priority" | "name" | "project";
export type SortOrder = "asc" | "desc";

interface TasksProps {
  items: Array<Doc<"tasks">>;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export const Tasks = React.memo(
  function Tasks({
    items,
    sortBy = "date",
    sortOrder = "asc",
  }: TasksProps) {
    const { toast } = useToast();
    const { projects } = useTaskStore();

    const checkTask = useMutation(api.tasks.checkTask);
    const uncheckTask = useMutation(api.tasks.uncheckTask);

    console.count("Tasks");

    const handleOnChangeTodo = useCallback(
      async (task: Doc<"tasks">) => {
        if (task.isCompleted) {
          await uncheckTask({ taskId: task._id });
        } else {
          await checkTask({ taskId: task._id });
          toast({
            title: "✅ Task completed",
            description: "You're a rockstar",
            duration: 3000,
          });
        }
      },
      [checkTask, uncheckTask, toast]
    );

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          const dateA = a.dueDate || 0;
          const dateB = b.dueDate || 0;
          comparison = dateA - dateB;
          break;
        case "priority":
          const priorityA = a.priority || 0;
          const priorityB = b.priority || 0;
          comparison = priorityA - priorityB;
          break;
        case "name":
          const nameA = (a.taskName || "").toLowerCase();
          const nameB = (b.taskName || "").toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case "project":
          const projectA = projects.find((p) => p._id === a.projectId)?.name || "";
          const projectB = projects.find((p) => p._id === b.projectId)?.name || "";
          comparison = projectA.localeCompare(projectB);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return sorted;
  }, [items, sortBy, sortOrder, projects]);

  const taskElements = useMemo(() => {
    return sortedItems.map((task: Doc<"tasks">) => (
      <Task
        key={task._id}
        data={task}
        isCompleted={task.isCompleted}
        handleOnChange={() => handleOnChangeTodo(task)}
      />
    ));
  }, [sortedItems, handleOnChangeTodo]);

    return <>{taskElements}</>;
  },
  (prevProps, nextProps) => {
    // Custom comparison - porównaj items, sortBy i sortOrder
    if (
      prevProps.items.length !== nextProps.items.length ||
      prevProps.sortBy !== nextProps.sortBy ||
      prevProps.sortOrder !== nextProps.sortOrder
    ) {
      return false;
    }
    return prevProps.items.every(
      (prevTask, index) =>
        prevTask._id === nextProps.items[index]?._id &&
        prevTask.isCompleted === nextProps.items[index]?.isCompleted
    );
  }
);
