"use client";

import { useEffect, useRef, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTaskStore } from "@/stores/taskStore";
import { memo } from "react";

function TaskDataLoaderComponent() {
  const { setTasksData, setProjects, setLoading, setError } = useTaskStore();
  
  const tasksData = useQuery(api.tasks.getAllTasksData);
  const projects = useQuery(api.project.getProjects);

  // Use refs to track previous values for comparison
  const prevTasksDataRef = useRef<typeof tasksData>(undefined);
  const prevProjectsRef = useRef<typeof projects>(undefined);
  const isInitialLoadRef = useRef(true);

  // Memoize loading state to avoid unnecessary updates
  const isLoading = useMemo(() => {
    return tasksData === undefined || projects === undefined;
  }, [tasksData, projects]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      setError(false);
    }
  }, [isLoading, setLoading, setError]);

  // Update store only when data actually changes (Convex returns new references only on changes)
  useEffect(() => {
    // Initial load
    if (isInitialLoadRef.current) {
      if (tasksData && projects) {
        isInitialLoadRef.current = false;
        prevTasksDataRef.current = tasksData;
        prevProjectsRef.current = projects;
        setTasksData(tasksData);
        setProjects(projects);
        setLoading(false);
        setError(false);
      }
      return;
    }

    // Use reference comparison instead of JSON.stringify
    // Convex returns new references only when data actually changes
    const tasksDataChanged = tasksData && tasksData !== prevTasksDataRef.current;
    const projectsChanged = projects && projects !== prevProjectsRef.current;

    if (tasksDataChanged) {
      prevTasksDataRef.current = tasksData;
      setTasksData(tasksData);
      setLoading(false);
      setError(false);
    }

    if (projectsChanged) {
      prevProjectsRef.current = projects;
      setProjects(projects);
      setError(false);
    }
  }, [tasksData, projects, setTasksData, setProjects, setLoading, setError]);

  return null;
}

export const TaskDataLoader = memo(TaskDataLoaderComponent);