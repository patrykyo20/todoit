"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTaskStore } from "@/stores/taskStore";
import { memo } from "react";

function TaskDataLoaderComponent() {
  const setTasksDataRef = useRef(useTaskStore.getState().setTasksData);
  const setProjectsRef = useRef(useTaskStore.getState().setProjects);
  const setLoadingRef = useRef(useTaskStore.getState().setLoading);
  const setErrorRef = useRef(useTaskStore.getState().setError);

  useEffect(() => {
    setTasksDataRef.current = useTaskStore.getState().setTasksData;
    setProjectsRef.current = useTaskStore.getState().setProjects;
    setLoadingRef.current = useTaskStore.getState().setLoading;
    setErrorRef.current = useTaskStore.getState().setError;
  }, []);

  const tasksData = useQuery(api.tasks.getAllTasksData);
  const projects = useQuery(api.project.getProjects);

  const prevTasksDataRef = useRef<typeof tasksData>(undefined);
  const prevProjectsRef = useRef<typeof projects>(undefined);
  const isInitialLoadRef = useRef(true);

  // Set loading to true when queries start or return undefined
  // Handle errors from queries
  useEffect(() => {
    if (tasksData === undefined || projects === undefined) {
      setLoadingRef.current(true);
      setErrorRef.current(false);
    }
  }, [tasksData, projects]);

  useEffect(() => {
    // Check for errors - Convex queries can throw errors
    try {
      if (isInitialLoadRef.current) {
        if (tasksData && projects) {
          isInitialLoadRef.current = false;
          prevTasksDataRef.current = tasksData;
          prevProjectsRef.current = projects;
          setTasksDataRef.current(tasksData);
          setProjectsRef.current(projects);
          setLoadingRef.current(false);
          setErrorRef.current(false);
        }
        return;
      }

      const tasksDataChanged =
        tasksData &&
        (!prevTasksDataRef.current ||
          JSON.stringify(tasksData) !== JSON.stringify(prevTasksDataRef.current));

      const projectsChanged =
        projects &&
        (!prevProjectsRef.current ||
          JSON.stringify(projects) !== JSON.stringify(prevProjectsRef.current));

      if (tasksDataChanged) {
        prevTasksDataRef.current = tasksData;
        setTasksDataRef.current(tasksData);
        setLoadingRef.current(false);
        setErrorRef.current(false);
      }

      if (projectsChanged) {
        prevProjectsRef.current = projects;
        setProjectsRef.current(projects);
        setErrorRef.current(false);
      }
    } catch {
      setErrorRef.current(true);
      setLoadingRef.current(false);
    }
  }, [tasksData, projects]);

  return null;
}

export const TaskDataLoader = memo(TaskDataLoaderComponent);
