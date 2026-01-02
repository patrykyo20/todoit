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
  setTasksData: (data: TasksData) => void;
  setProjects: (projects: Array<Doc<"projects">>) => void;
  setSelectedProject: (project: Doc<"projects"> | null) => void;
  setSelectedProjectId: (projectId: Id<"projects"> | null) => void;
  setLoading: (loading: boolean) => void;
  refreshTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasksData: null,
  projects: [],
  selectedProject: null,
  selectedProjectId: null,
  isLoading: true,
  setTasksData: (data) => set({ tasksData: data }),
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
  setLoading: (loading) => set({ isLoading: loading }),
  refreshTasks: () => {
    // Ta funkcja będzie wywoływana przez TaskDataLoader po mutacjach
    // Store sam się zaktualizuje przez useEffect w TaskDataLoader
  },
}));
