import { create } from "zustand";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface TasksData {
  incomplete: Array<Doc<"tasks">>;
  completed: Array<Doc<"tasks">>;
  total: number;
  today: Array<Doc<"tasks">>;
  overdue: Array<Doc<"tasks">>;
  groupedByDate: Record<string, Array<Doc<"tasks">>>;
}

interface TaskStore {
  tasksData: TasksData | null;
  projects: Array<Doc<"projects">>;
  selectedProject: Doc<"projects"> | null;
  selectedProjectId: Id<"projects"> | null;
  isLoading: boolean;
  isError: boolean;
  openDialogId: string | null;
  openSubtaskDialogId: string | null; // Nowy state dla subtasków
  setTasksData: (data: TasksData) => void;
  setProjects: (projects: Array<Doc<"projects">>) => void;
  setSelectedProject: (project: Doc<"projects"> | null) => void;
  setSelectedProjectId: (projectId: Id<"projects"> | null) => void;
  setOpenDialogId: (id: string | null) => void;
  setOpenSubtaskDialogId: (id: string | null) => void; // Nowa akcja dla subtasków
  setLoading: (loading: boolean) => void;
  setError: (isError: boolean) => void;
  refreshTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasksData: null,
  projects: [],
  selectedProject: null,
  selectedProjectId: null,
  isLoading: true,
  isError: false,
  openDialogId: null,
  openSubtaskDialogId: null,
  setTasksData: (data) => set({ tasksData: data, isError: false }),
  setProjects: (projects) => set({ projects, isError: false }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (isError) => set({ isError }),
  setOpenDialogId: (id) => {
    console.log("setOpenDialogId (task) called with:", id);
    set({ openDialogId: id });
    console.log(
      "setOpenDialogId after set, current state:",
      get().openDialogId
    );
  },
  setOpenSubtaskDialogId: (id) => {
    console.log("setOpenSubtaskDialogId called with:", id);
    set({ openSubtaskDialogId: id });
    console.log(
      "setOpenSubtaskDialogId after set, current state:",
      get().openSubtaskDialogId
    );
  },
  refreshTasks: () => {},
}));
