# 🗺️ Component Flow Map - Todoist Application

## 📋 Struktura hierarchiczna komponentów

### 🌐 **POZIOM 1: Root Layout & Providers**
```
app/layout.tsx (RootLayout)
├── Toaster (components/layout/Toast/Toaster.tsx)
└── Providers (providers/providers.tsx)
    ├── ConvexClientProvider
    └── SessionProvider
```

---

### 🔐 **POZIOM 2: Logged In Layout**
```
app/loggedin/layout.tsx (LoggedInLayout)
├── Providers (providers/providers.tsx)
├── TaskDataLoader (components/functional/TaskDataLoader.tsx)
│   └── [Loads data from Convex → useTaskStore]
├── Sidebar (components/layout/Sidebar/Sidebar.tsx)
│   ├── UserProfile (components/layout/Sidebar/UserProfile.tsx)
│   ├── Navigation Items (primaryNavItems + projects)
│   └── AddProjectDialog (components/layout/Project/AddProjectDialog.tsx)
└── MobileNav (components/layout/Sidebar/MobileNav.tsx)
```

---

### 📄 **POZIOM 3: Strony (Pages)**

#### **3.1 Strona główna (/loggedin)**
```
app/loggedin/page.tsx
└── TaskList (components/layout/Task/TaskList.tsx)
    └── Tasks (components/layout/Task/Tasks.tsx)
        └── Task (components/layout/Task/Task.tsx) [dla każdego taska]
```

#### **3.2 Strona Today (/loggedin/today)**
```
app/loggedin/today/page.tsx
├── TitleView (components/layout/Task/TitleView.tsx)
│   └── TaskSort (components/layout/Task/TaskSort.tsx)
├── Tasks (components/layout/Task/Tasks.tsx) [Overdue]
│   └── Task (components/layout/Task/Task.tsx) [dla każdego taska]
└── Tasks (components/layout/Task/Tasks.tsx) [Today]
    └── Task (components/layout/Task/Task.tsx) [dla każdego taska]
```

#### **3.3 Strona Calendar (/loggedin/calendar)**
```
app/loggedin/calendar/page.tsx
├── ViewModeToggle (components/layout/Calendar/components/ViewModeToggle.tsx)
├── ConnectionStatus (components/layout/Calendar/components/ConnectionStatus.tsx)
├── ReAuthWarning (components/layout/Calendar/components/ReAuthWarning.tsx)
├── AddEventDialog (components/layout/Calendar/AddEventDialog.tsx)
├── CalendarHeader (components/layout/Calendar/components/CalendarHeader.tsx)
├── MonthView (components/layout/Calendar/components/MonthView.tsx) [jeśli viewMode === "month"]
│   ├── DayHeaders (wewnętrzny komponent)
│   └── CalendarDay (wewnętrzny komponent) [dla każdego dnia]
│       └── Task/Event items
└── WeekView (components/layout/Calendar/components/WeekView/WeekView.tsx) [jeśli viewMode === "week"]
    ├── DayHeaders (components/layout/Calendar/components/WeekView/DayHeaders.tsx)
    ├── TimeColumn (components/layout/Calendar/components/WeekView/TimeColumn.tsx)
    └── DayColumn (components/layout/Calendar/components/WeekView/DayColumn.tsx) [dla każdego dnia]
        └── EventItem (components/layout/Calendar/components/WeekView/EventItem.tsx) [dla każdego eventu]
```

#### **3.4 Strona Projects (/loggedin/projects)**
```
app/loggedin/projects/page.tsx
└── Link (Next.js) → /loggedin/projects/[projectId]
```

#### **3.5 Strona Project Detail (/loggedin/projects/[projectId])**
```
app/loggedin/projects/[projectId]/page.tsx
└── Tasks (components/layout/Task/Tasks.tsx)
    └── Task (components/layout/Task/Task.tsx) [dla każdego taska]
```

---

### 🧩 **POZIOM 4: Komponenty Task**

#### **4.1 Task Component (główny)**
```
Task (components/layout/Task/Task.tsx)
├── TaskCheckbox (components/layout/Task/components/TaskCheckbox.tsx)
├── TaskIcons (components/layout/Task/components/TaskIcons.tsx)
├── TaskMetadata (components/layout/Task/components/TaskMetadata.tsx)
├── AddTaskDialog (components/layout/Task/AddTaskDialog.tsx) [jeśli task]
│   └── [Zobacz sekcję 4.2]
├── SubtaskDialog (components/layout/Task/SubtaskDialog/SubtaskDialog.tsx) [jeśli subtask]
├── AddTaskInline (components/layout/Task/AddTaskInline.tsx) [jeśli showAddSubtask]
│   └── TaskDateRangeField (components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx)
└── SubtaskList (components/layout/Task/components/SubtaskList.tsx) [jeśli subtasks expanded]
    └── Task (components/layout/Task/Task.tsx) [rekurencyjnie dla każdego subtaska]
```

#### **4.2 AddTaskDialog (dialog edycji taska)**
```
AddTaskDialog (components/layout/Task/AddTaskDialog.tsx)
├── TaskHeader (components/layout/Task/AddTaskDialog/components/TaskHeader.tsx)
│   └── RichTextEditor [description z Tiptap TaskList extension]
├── TaskSubtasksSection (components/layout/Task/AddTaskDialog/components/TaskSubtasksSection.tsx)
│   ├── SubtaskList (components/layout/Task/components/SubtaskList.tsx)
│   └── AddTaskInline (components/layout/Task/AddTaskInline.tsx)
├── TaskDetailsSection (components/layout/Task/AddTaskDialog/components/TaskDetailsSection.tsx)
│   ├── TaskDetailField (components/layout/Task/AddTaskDialog/components/TaskDetailField.tsx) [Project, Priority]
│   └── TaskDateRangeField (components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx) [dates, times]
└── TaskActionButtons (components/layout/Task/AddTaskDialog/components/TaskActionButtons.tsx) [Save, Delete, Add to Calendar]
```

---

### 🪝 **POZIOM 5: Hooks & Stores**

#### **Hooks:**
```
hooks/
├── useAuth.ts
├── useKeyboardShortcuts.ts
└── useToast.tsx
    └── Toast (components/layout/Toast/Toast.tsx)

components/layout/Task/hooks/
├── useSubTasks.ts
├── useTaskCalculations.ts
├── useTaskColors.ts
└── useTaskSound.ts

components/layout/Task/AddTaskDialog/hooks/
└── useTaskDialog.ts

components/layout/Calendar/hooks/
├── useCalendarData.ts
├── useCalendarEvents.ts
├── useCalendarNavigation.ts
└── useCalendarSync.ts
```

#### **Stores (Zustand):**
```
stores/
├── taskStore.ts
│   └── State: tasksData, projects, isLoading, openDialogId, etc.
└── eventStore.ts
    └── State: isOpen, selectedDate, selectedStartTime, selectedEndTime
```

---

### 🔄 **POZIOM 6: Data Flow**

```
Convex Backend (convex/)
├── tasks.ts
│   ├── getAllTasksData (query)
│   ├── getTaskById (query)
│   ├── createTask (mutation)
│   ├── updateTask (mutation)
│   ├── checkTask (mutation)
│   └── uncheckTask (mutation)
├── project.ts
│   └── getProjects (query)
├── googleCalendar.ts
│   ├── createCalendarEvent (action)
│   ├── updateCalendarEvent (action)
│   ├── deleteCalendarEvent (action)
│   ├── getCalendarEvents (action)
│   └── isCalendarConnected (query)
└── subTasks.ts
    ├── getSubtasks (query)
    ├── createSubtask (mutation)
    └── checkSubtask (mutation)

Data Flow (strzałki pokazują kierunek przepływu danych):

┌─────────────────┐
│ Convex Backend  │
│ (Database)      │
└────────┬────────┘
         │
         │ [1] useQuery
         │
         ▼
┌─────────────────┐
│ TaskDataLoader  │
└────────┬────────┘
         │
         │ [2] setTasksData()
         │
         ▼
┌─────────────────┐
│ useTaskStore    │
│ (Zustand)       │
└────────┬────────┘
         │
         │ [3] Read data
         │
         ▼
┌─────────────────┐
│ Components      │
│ (Task, Tasks)    │
└─────────────────┘
         │
         │ [4] User Actions
         │
         ▼
┌─────────────────┐
│ useMutation     │
│ useAction       │
└────────┬────────┘
         │
         │ [5] Update
         │
         ▼
┌─────────────────┐
│ Convex Backend  │
│ (updates DB)    │
└────────┬────────┘
         │
         │ [6] Reactivity
         │
         ▼
┌─────────────────┐
│ useTaskStore    │
│ (auto-updates)  │
└─────────────────┘

Calendar-specific flow:
┌─────────────────────────────┐
│ Calendar Page               │
└────────┬────────────────────┘
         │
         ├─[A]→ useQuery(isCalendarConnected)
         │
         └─[B]→ useAction(getCalendarEvents)
                 │
                 ▼
         ┌─────────────────────┐
         │ Google Calendar API  │
         └─────────────────────┘
```

---

## 📊 **Diagram Flow - Przykładowe Scenariusze**

### **Scenariusz 1: Otwarcie i edycja taska**
```
┌─────────────┐
│ User Action │
│ (click Task)│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Task.tsx        │
│ (opens dialog)  │
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ AddTaskDialog.tsx    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ useTaskDialog hook   │
│ (loads from store)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User edits & saves   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ useMutation          │
│ (api.tasks.update)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Convex Backend       │
│ (updates database)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ useTaskStore         │
│ (auto-updates)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Task.tsx re-renders  │
│ (with new data)      │
└──────────────────────┘
```

### **Scenariusz 2: Dodanie taska do kalendarza**
```
┌──────────────────────────┐
│ User clicks              │
│ "Add to Calendar"        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ AddTaskDialog            │
│ handleAddToCalendar()    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useAction                 │
│ (createCalendarEvent)     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Convex Backend            │
│ (creates Google event)    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Updates task with         │
│ googleCalendarEventId     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useTaskStore updates      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ MonthView/WeekView        │
│ (shows task in calendar)  │
└──────────────────────────┘
```

### **Scenariusz 3: Tworzenie eventu z kalendarza**
```
┌──────────────────────────┐
│ User clicks calendar     │
│ day/hour                 │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ DayColumn.tsx            │
│ handleCellClick()        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useEventStore            │
│ openDialog(date, time)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ AddEventDialog.tsx       │
│ (opens with date/time)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ User fills form &        │
│ clicks "Create Event"    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useAction                 │
│ (createEventAndTask)      │
└──────┬───────────────────┘
       │
       ├──────────────────────┐
       │                       │
       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ Creates Google    │  │ Creates task in  │
│ Calendar event    │  │ Convex           │
└────────┬──────────┘  └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ useTaskStore      │
         │ updates          │
         └────────┬──────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Calendar & Task  │
         │ List show new    │
         │ task/event       │
         └──────────────────┘
```

---

## 🎯 **Kluczowe zależności**

### **State Management:**
- **Zustand Stores**: `useTaskStore`, `useEventStore`
- **Convex Reactivity**: Auto-updates przez `useQuery` i `useMutation`
- **Local State**: `useState` w komponentach

### **Styling:**
- **Tailwind CSS**: Wszystkie komponenty
- **cn() utility**: Merge className strings
- **Responsive**: Mobile-first approach

### **Form Handling:**
- **react-hook-form**: Wszystkie formularze
- **zod**: Validation (jeśli używane)

### **Date/Time:**
- **moment.js**: Formatowanie dat
- **date-fns**: Formatowanie w niektórych miejscach
- **react-day-picker**: Calendar component

### **Rich Text:**
- **Tiptap**: RichTextEditor
- **Extensions**: TaskList, TaskItem, Bold, Italic, etc.

---

## 📝 **Notatki do Miro**

1. **Kolorowanie poziomów:**
   - Poziom 1-2: Niebieski (Layout/Providers)
   - Poziom 3: Zielony (Pages)
   - Poziom 4: Pomarańczowy (Feature Components)
   - Poziom 5: Fioletowy (Hooks/Stores)
   - Poziom 6: Żółty (Data/Backend)

2. **Strumienie danych - WAŻNE dla uniknięcia nakładania się strzałek:**
   
   **Główny flow (pionowy, od góry do dołu):**
   - Convex Backend (góra)
   - ↓ strzałka w dół
   - TaskDataLoader
   - ↓ strzałka w dół
   - useTaskStore
   - ↓ strzałka w dół
   - Components
   
   **User Actions flow (poziomy, z lewej do prawej):**
   - Components (lewo)
   - → strzałka w prawo
   - useMutation/useAction
   - → strzałka w prawo
   - Convex Backend (prawo)
   
   **Reactivity flow (strzałka zwrotna, z prawej do lewej):**
   - Convex Backend (prawo)
   - ← strzałka w lewo (przerywana)
   - useTaskStore (lewo)
   
   **Calendar flow (osobna ścieżka, poniżej głównego flow):**
   - Calendar Page
   - ↓ strzałka w dół (lewa ścieżka)
   - useQuery(isCalendarConnected)
   - ↓ strzałka w dół (prawa ścieżka)
   - useAction(getCalendarEvents)
   - → strzałka w prawo
   - Google Calendar API

3. **Grupowanie:**
   - Grupuj komponenty według funkcjonalności (Task, Calendar, Sidebar)
   - Użyj osobnych sekcji dla każdego flow, żeby strzałki się nie nakładały
   - Umieść główny flow w centrum, Calendar flow po prawej stronie

4. **Legenda:**
   - 🔵 = Layout/Provider
   - 🟢 = Page
   - 🟠 = Feature Component
   - 🟣 = Hook/Store
   - 🟡 = Data/Backend
   - → = Przepływ danych (stała strzałka)
   - ← = Reactivity/auto-update (przerywana strzałka)
   - ↓ = Hierarchia komponentów (strzałka w dół)