# 📊 Analiza Jakości Kodu - Code Quality Analysis

## 📏 Pliki z 200+ liniami

### 🔴 Krytyczne (>500 linii)

1. **`convex/googleCalendar.ts`** - **934 linie**
   - Problem: Ogromny plik z wieloma funkcjami i duplikacją kodu
   - Zawiera: 10+ funkcji (createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEvents, deleteAllCalendarEvents, itp.)
   - Duplikacja: Logika tworzenia/aktualizacji eventów jest powielona
   - Brak separacji odpowiedzialności

2. **`convex/tasks.ts`** - **540 linii**
   - Problem: Wszystkie query/mutation w jednym pliku
   - Zawiera: 15+ funkcji (get, getCompletedTasksByProjectId, getTasksByProjectId, createTask, updateTask, itp.)
   - Brak modularności

### 🟡 Duże (300-500 linii)

3. **`components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`** - **422 linie**
   - Problem: Hook zbyt długi, wiele odpowiedzialności
   - Zawiera: State management, API calls, handlers, business logic
   - Brak separacji concerns

4. **`components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx`** - **407 linii**
   - Problem: Komponent z dużą ilością logiki i JSX
   - Zawiera: Date handling, time validation, UI rendering
   - Można podzielić na mniejsze komponenty

5. **`components/ui/RichTextEditor.tsx`** - **400 linii**
   - Problem: Komponent z wieloma odpowiedzialnościami
   - Zawiera: Editor setup, image upload, toolbar, event handlers
   - Brak separacji logiki

6. **`components/layout/Calendar/components/ReAuthWarning.tsx`** - **311 linii**
   - Problem: Długi komponent z dużą ilością JSX i logiki
   - Zawiera: Multiple UI states, error handling, authentication logic
   - Można podzielić na mniejsze komponenty

---

## 🏗️ Pliki z brzydką strukturą

### 1. **`convex/googleCalendar.ts`** (934 linie)
**Problemy:**
- ❌ Wszystkie funkcje Google Calendar API w jednym pliku
- ❌ Duplikacja kodu (createCalendarEvent i updateCalendarEvent mają podobną logikę)
- ❌ Brak separacji concerns (token management, event operations, account management)
- ❌ Długie funkcje (deleteAllCalendarEvents ma 127 linii)
- ❌ Brak helper functions dla wspólnej logiki

**Rekomendacje:**
```
convex/googleCalendar/
├── token.ts          # Token management (getAccessToken, refreshAccessToken)
├── events.ts         # Event operations (create, update, delete, get)
├── accounts.ts       # Account management (updateAccountScope, getAccountInfo)
└── utils.ts          # Helper functions (refreshGoogleToken, getGoogleAccessTokenFromQuery)
```

### 2. **`components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`** (422 linie)
**Problemy:**
- ❌ Hook zbyt długi i złożony
- ❌ Mieszanie state management, API calls, i business logic
- ❌ Długie funkcje (handleGenerateDescription ma 88 linii)
- ❌ Brak separacji concerns

**Rekomendacje:**
```
hooks/
├── useTaskDialog.ts           # Main hook (orchestrator)
├── useTaskState.ts            # State management
├── useTaskMutations.ts        # API mutations
├── useTaskCalendar.ts         # Calendar integration
└── useTaskDescription.ts      # AI description generation
```

### 3. **`components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx`** (407 linii)
**Problemy:**
- ❌ Komponent z dużą ilością logiki i JSX
- ❌ Mieszanie date/time validation z UI rendering
- ❌ Długie funkcje handlers
- ❌ Brak separacji concerns

**Rekomendacje:**
```
components/
├── TaskDateRangeField.tsx     # Main component (orchestrator)
├── DatePickerField.tsx        # Date selection component
├── TimePickerField.tsx        # Time selection component
├── FrequencySelector.tsx      # Frequency selection
└── hooks/
    └── useDateRangeValidation.ts  # Validation logic
```

### 4. **`components/ui/RichTextEditor.tsx`** (400 linii)
**Problemy:**
- ❌ Komponent z wieloma odpowiedzialnościami
- ❌ Editor setup, image upload, toolbar w jednym miejscu
- ❌ Długie funkcje (uploadImage, handlePaste)
- ❌ Brak separacji concerns

**Rekomendacje:**
```
components/ui/RichTextEditor/
├── RichTextEditor.tsx         # Main component
├── Toolbar.tsx                # Toolbar component
├── ImageUpload.tsx            # Image upload logic
└── hooks/
    ├── useRichTextEditor.ts   # Editor setup
    └── useImageUpload.ts      # Image upload logic
```

### 5. **`components/layout/Calendar/components/ReAuthWarning.tsx`** (311 linii)
**Problemy:**
- ❌ Długi komponent z dużą ilością JSX
- ❌ Multiple UI states w jednym komponencie
- ❌ Mieszanie authentication logic z UI
- ❌ Brak separacji concerns

**Rekomendacje:**
```
components/layout/Calendar/components/
├── ReAuthWarning.tsx          # Main component
├── ReAuthWarningContent.tsx  # Warning content
├── CleanCalendarButton.tsx   # Clean calendar button
└── DebugInfo.tsx             # Debug information display
```

### 6. **`convex/tasks.ts`** (540 linii)
**Problemy:**
- ❌ Wszystkie query/mutation w jednym pliku
- ❌ Brak modularności
- ❌ Trudne w utrzymaniu

**Rekomendacje:**
```
convex/tasks/
├── queries.ts         # All queries (get, getTaskById, getAllTasksData)
├── mutations.ts       # All mutations (createTask, updateTask, deleteTask)
└── actions.ts         # All actions (createTaskAndEmbeddings)
```

---

## 🧹 Pliki niezgodne z Clean Code

### 1. **Duplikacja kodu**

#### `convex/googleCalendar.ts`
- ❌ `createCalendarEvent` i `updateCalendarEvent` mają duplikowaną logikę tworzenia event object
- ❌ Token refresh logic jest powielony w wielu miejscach
- ❌ Error handling jest duplikowany

**Rozwiązanie:**
```typescript
// utils.ts
export function buildCalendarEvent(task: Doc<"tasks">) {
  // Shared logic for creating event object
}

export async function getOrRefreshToken(ctx: ActionCtx) {
  // Shared token refresh logic
}
```

#### `components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`
- ❌ Date/time validation logic jest powielony
- ❌ Toast notifications mają podobną strukturę

**Rozwiązanie:**
```typescript
// utils/taskValidation.ts
export function validateDateRange(startDate, endDate) {
  // Shared validation logic
}

// hooks/useToastNotifications.ts
export function useTaskToast() {
  // Shared toast logic
}
```

### 2. **Długie funkcje (>50 linii)**

#### `convex/googleCalendar.ts`
- ❌ `deleteAllCalendarEvents` - 127 linii
- ❌ `createCalendarEvent` - 116 linii
- ❌ `updateCalendarEvent` - 116 linii

#### `components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`
- ❌ `handleGenerateDescription` - 88 linii
- ❌ `handleAddToCalendar` - 75 linii

#### `components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx`
- ❌ `handleStartTimeChange` - 25 linii (OK, ale można lepiej)
- ❌ `handleEndTimeChange` - 18 linii (OK)

### 3. **Brak separacji odpowiedzialności (Single Responsibility Principle)**

#### `components/ui/RichTextEditor.tsx`
- ❌ Editor setup
- ❌ Image upload
- ❌ Toolbar rendering
- ❌ Event handlers
- ❌ All in one component

#### `components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`
- ❌ State management
- ❌ API calls
- ❌ Business logic
- ❌ Calendar integration
- ❌ AI description generation

### 4. **Magic numbers i hardcoded values**

#### `components/layout/Calendar/hooks/useCalendarEvents.ts`
- ❌ `DEBOUNCE_DELAY = 300` - powinno być w config
- ❌ Timeout values hardcoded

#### `components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx`
- ❌ `hours + 1` - magic number dla default end time
- ❌ Width values hardcoded (`w-[140px]`)

### 5. **Brak error boundaries**

- ❌ Brak error boundaries dla komponentów kalendarza
- ❌ Brak error boundaries dla task dialogs
- ❌ Brak global error boundary

### 6. **Brak TypeScript strict mode**

- ❌ Niektóre funkcje używają `any` lub `unknown`
- ❌ Brak proper type guards
- ❌ Optional chaining nadużywany zamiast proper types

### 7. **Inconsistent naming**

- ❌ Mieszane konwencje: `handleSave` vs `onSave` vs `saveTask`
- ❌ Niektóre funkcje używają `handle`, inne nie
- ❌ Inconsistent file naming (camelCase vs PascalCase)

### 8. **Brak dokumentacji**

- ❌ Brak JSDoc comments dla złożonych funkcji
- ❌ Brak README dla złożonych modułów
- ❌ Brak inline comments dla complex logic

### 9. **Brak testów**

- ❌ Brak unit tests
- ❌ Brak integration tests
- ❌ Brak E2E tests

### 10. **Performance issues**

- ❌ Brak memoization w niektórych komponentach
- ❌ Brak useCallback dla event handlers
- ❌ Brak useMemo dla expensive calculations
- ❌ Brak code splitting dla dużych komponentów

---

## 📋 Podsumowanie - Priorytety refaktoryzacji

### 🔴 Wysoki priorytet (natychmiast)

1. **`convex/googleCalendar.ts`** - Podzielić na moduły
2. **`components/layout/Task/AddTaskDialog/hooks/useTaskDialog.ts`** - Rozdzielić na mniejsze hooki
3. **`convex/tasks.ts`** - Podzielić na queries/mutations/actions

### 🟡 Średni priorytet (wkrótce)

4. **`components/layout/Task/AddTaskDialog/components/TaskDateRangeField.tsx`** - Podzielić na mniejsze komponenty
5. **`components/ui/RichTextEditor.tsx`** - Rozdzielić odpowiedzialności
6. **`components/layout/Calendar/components/ReAuthWarning.tsx`** - Podzielić na mniejsze komponenty

### 🟢 Niski priorytet (w przyszłości)

7. Dodać error boundaries
8. Dodać testy
9. Poprawić dokumentację
10. Zoptymalizować performance

---

## 📊 Statystyki

- **Plików z 200+ liniami:** 6
- **Plików z 500+ liniami:** 2
- **Plików wymagających refaktoryzacji:** 6
- **Głównych problemów:** 10 kategorii

---

**Ostatnia aktualizacja:** 2025-01-01  
**Następny przegląd:** Po refaktoryzacji głównych plików
