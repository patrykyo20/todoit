# Technical Issues & Performance Problems

## 🚨 Critical Issues

### 1. **CreateTaskDialog - setState w useEffect**
**Plik:** `components/layout/Task/CreateTaskDialog.tsx`  
**Linie:** 39-40, 48-50

**Problem:**
```typescript
// ❌ BŁĄD - setState w useEffect może powodować cascading renders
useEffect(() => {
  if (!isOpen) {
    setShouldShowForm(false);  // Linter warning
    setIsLoading(false);        // Linter warning
    return;
  }
  // ...
}, [isOpen]);
```

**Rozwiązanie:**
- Użyć `setTimeout` dla wszystkich zmian stanu (już zaimplementowane)
- Lub użyć `useReducer` zamiast wielu `useState`
- Lub przenieść logikę do event handlera zamiast useEffect

**Status:** ⚠️ Częściowo naprawione (użyto setTimeout, ale nadal może być lepiej)

---

## ⚡ Performance Issues

### 1. **Brak memoization w komponentach kalendarza**
**Pliki:**
- `components/layout/Calendar/components/MonthView.tsx` - renderuje wszystkie dni miesiąca bez `React.memo`
- `components/layout/Calendar/components/WeekView.tsx` - renderuje 24 godziny × 7 dni = 168 elementów bez memoization
- `components/layout/Calendar/components/CalendarHeader.tsx` - re-renderuje się przy każdej zmianie `isLoadingEvents`

**Rozwiązanie:**
```typescript
// ✅ Dodać React.memo dla ciężkich komponentów
export const MonthView = React.memo(({ calendarDays, currentMonth, onDayClick }) => {
  // ...
});

// ✅ Memoizować callbacki
const handleDayClick = useCallback((date: Date) => {
  onDayClick(date);
}, [onDayClick]);
```

**Priorytet:** 🔴 Wysoki (kalendarz może być wolny przy dużej liczbie eventów)

---

### 2. **Brak virtualizacji w WeekView**
**Plik:** `components/layout/Calendar/components/WeekView.tsx`  
**Linie:** Cały komponent (szczególnie 58-269)

**Problem:**
- Renderuje wszystkie 24 godziny × 7 dni = 168 slotów jednocześnie
- Przy dużej liczbie eventów może być wolne
- Brak lazy loading dla eventów poza viewportem

**Rozwiązanie:**
- Użyć `react-window` lub `react-virtualized` do virtualizacji
- Renderować tylko widoczne sloty godzinowe
- Lazy load eventów przy scrollowaniu

**Priorytet:** 🟡 Średni (problem pojawi się przy dużej liczbie eventów)

---

### 3. **Nadmierne re-rendery w TitleView**
**Plik:** `components/layout/Task/TitleView.tsx`  
**Linie:** 20-58

**Problem:**
- `TitleView` re-renderuje się przy każdej zmianie sortowania
- `AddTaskButton` i `TaskSort` nie są memoizowane
- Callback `onSortChange` może powodować re-rendery w parent

**Rozwiązanie:**
```typescript
// ✅ Memoizować komponenty
const AddTaskButton = React.memo(({ onClick, title }) => { /* ... */ });
const TaskSort = React.memo(({ sortBy, sortOrder, onSortChange }) => { /* ... */ });

// ✅ Memoizować callbacki w parent
const handleSortChange = useCallback((newSortBy, newSortOrder) => {
  setSortBy(newSortBy);
  setSortOrder(newSortOrder);
}, []);
```

**Priorytet:** 🟡 Średni

---

### 4. **Brak debouncing w operacjach kalendarza**
**Plik:** `components/layout/Calendar/hooks/useCalendarEvents.ts`  
**Linie:** 30-60 (funkcja refreshEvents)

**Problem:**
- `refreshEvents` może być wywoływane zbyt często
- Brak debouncing przy szybkich zmianach widoku
- Każda zmiana `currentMonth`/`currentWeek` triggeruje nowe zapytanie

**Rozwiązanie:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedRefresh = useDebouncedCallback(
  (timeMin, timeMax) => refreshEvents(timeMin, timeMax),
  300 // 300ms delay
);
```

**Priorytet:** 🟡 Średni

---

### 5. **Heavy computations w useCalendarData**
**Plik:** `components/layout/Calendar/hooks/useCalendarData.ts`  
**Linie:** 15-132 (szczególnie useMemo dla calendarDays i weekDays)

**Problem:**
- `useMemo` dla `calendarDays` i `weekDays` wykonuje się przy każdej zmianie
- Mergowanie tasków i eventów może być kosztowne przy dużej liczbie danych
- Brak paginacji lub limitowania wyników

**Rozwiązanie:**
- Dodać paginację dla eventów
- Limitować liczbę wyświetlanych eventów na dzień
- Użyć `useMemo` z bardziej precyzyjnymi dependencies

**Priorytet:** 🟡 Średni

---

## 🔍 Linter Issues

### 1. **CreateTaskDialog - setState w useEffect**
**Lokalizacja:** `components/layout/Task/CreateTaskDialog.tsx:39-40`

**Błąd:**
```
Error: Calling setState synchronously within an effect can trigger cascading renders
```

**Status:** ⚠️ Częściowo naprawione (użyto setTimeout)

---

### 2. **Aktualne błędy lintera**

**Znalezione błędy:**

1. **Plik:** `components/layout/Sidebar/SearchForm.tsx`  
   **Linia:** 18  
   **Błąd:** `Unexpected any. Specify a different type.`  
   **Kod:**
   ```typescript
   const onSubmit = async ({ searchText }: any) => {
   ```
   **Rozwiązanie:** Zastąpić `any` konkretnym typem, np. `{ searchText: string }`

2. **Plik:** `app/loggedin/search/[searchQuery]/page.tsx`  
   **Linia:** 18  
   **Błąd:** `Unused '@ts-expect-error' directive.`  
   **Kod:**
   ```typescript
   // @ts-expect-error - searchTasks action exists but may not be in generated types yet
   const vectorSearch = useAction(api.search.searchTasks);
   ```
   **Rozwiązanie:** Usunąć nieużywany `@ts-expect-error` lub naprawić błąd TypeScript

3. **Plik:** `components/ui/Calendar.tsx`  
   **Linia:** 64  
   **Błąd:** `The class !font-sans can be written as font-sans!`  
   **Rozwiązanie:** Zmienić `!font-sans` na `font-sans!` (Tailwind CSS warning)

4. **Plik:** `app/globals.css`  
   **Linie:** 3, 59  
   **Błąd:** 
   ```
   Unknown at rule @theme
   Unknown at rule @variant
   ```
   **Rozwiązanie:** To są prawidłowe dyrektywy Tailwind CSS v4, można zignorować lub skonfigurować linter CSS

**Rozwiązanie:**
```bash
# Uruchomić linter
npm run lint

# Auto-fix
npm run lint -- --fix
```

---

### 3. **Brak type safety w niektórych miejscach**
**Lokalizacja:** Różne pliki

**Problemy:**
- Użycie `any` w niektórych miejscach
- Brak strict null checks
- Optional chaining może być nadużywane

**Rozwiązanie:**
- Włączyć `strict: true` w `tsconfig.json`
- Dodać bardziej precyzyjne typy
- Użyć type guards zamiast optional chaining wszędzie

---

## 🏗️ Architecture Issues

### 1. **Duplikacja logiki sortowania**
**Pliki:**
- `app/loggedin/today/page.tsx` - linie 15-24
- `app/loggedin/upcoming/page.tsx` - linie 15-47
- `app/loggedin/projects/[projectId]/page.tsx` - sprawdzić gdzie jest sortowanie

**Problem:**
- Każdy widok ma własną implementację sortowania
- Duplikacja kodu dla `sortBy`, `sortOrder`, `handleSortChange`

**Rozwiązanie:**
```typescript
// ✅ Utworzyć hook useTaskSort
export function useTaskSort(defaultSortBy: SortBy = "date") {
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  const handleSortChange = useCallback((newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);
  
  return { sortBy, sortOrder, handleSortChange };
}
```

**Priorytet:** 🟢 Niski (refaktoryzacja)

---

### 2. **Brak error boundaries**
**Pliki:** Wszystkie strony w `app/loggedin/`
- `app/loggedin/today/page.tsx`
- `app/loggedin/upcoming/page.tsx`
- `app/loggedin/calendar/page.tsx`
- `app/loggedin/projects/[projectId]/page.tsx`
- `app/loggedin/search/[searchQuery]/page.tsx`

**Problem:**
- Brak error boundaries dla komponentów
- Błędy mogą crashować całą aplikację
- Brak fallback UI dla błędów

**Rozwiązanie:**
```typescript
// ✅ Dodać ErrorBoundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <CalendarPage />
</ErrorBoundary>
```

**Priorytet:** 🟡 Średni

---

### 3. **Brak loading states w niektórych miejscach**
**Pliki do sprawdzenia:**
- `app/loggedin/upcoming/page.tsx` - może potrzebować lepszego loading state
- `app/loggedin/projects/[projectId]/page.tsx` - sprawdzić loading states
- `components/layout/Calendar/components/` - niektóre komponenty mogą potrzebować skeleton screens

**Problemy:**
- Niektóre komponenty nie mają loading states
- Brak skeleton screens dla wszystkich widoków
- Użytkownik nie wie, że coś się ładuje

**Rozwiązanie:**
- Dodać `Skeleton` komponenty wszędzie gdzie potrzeba
- Użyć Suspense boundaries
- Dodać loading indicators

**Priorytet:** 🟢 Niski (UX improvement)

---

## 📦 Bundle Size Issues

### 1. **Duże biblioteki**
**Plik:** `package.json`  
**Użycie moment.js w:**
- `app/loggedin/calendar/page.tsx` - linie 8, 67, 73, 133, 152
- `components/layout/Calendar/hooks/useCalendarNavigation.ts` - linia 2
- `components/layout/Calendar/hooks/useCalendarData.ts` - użycie moment
- `components/layout/Calendar/components/` - sprawdzić wszystkie pliki
- `app/loggedin/today/page.tsx` - linia 4
- `app/loggedin/upcoming/page.tsx` - linia 4

**Problemy:**
- `moment.js` - duża biblioteka (70KB+)
- Może być zastąpiona przez `date-fns` (tree-shakeable) lub `dayjs` (2KB)
- `react-beautiful-dnd` - duża biblioteka dla drag & drop

**Rozwiązanie:**
```typescript
// ❌ moment.js
import moment from "moment";

// ✅ date-fns (tree-shakeable)
import { format, startOfWeek, endOfWeek } from "date-fns";
```

**Priorytet:** 🟡 Średni

---

### 2. **Brak code splitting**
**Pliki:** Wszystkie strony w `app/loggedin/`
- `app/loggedin/calendar/page.tsx`
- `app/loggedin/today/page.tsx`
- `app/loggedin/upcoming/page.tsx`
- `app/loggedin/projects/[projectId]/page.tsx`
- `app/loggedin/search/[searchQuery]/page.tsx`

**Problem:**
- Wszystkie strony ładują się w jednym bundle
- Brak lazy loading dla ciężkich komponentów
- Kalendarz ładuje się nawet gdy nie jest używany

**Rozwiązanie:**
```typescript
// ✅ Lazy load komponentów
const CalendarPage = lazy(() => import('./calendar/page'));
const StatisticsPage = lazy(() => import('./statistics/page'));

// ✅ W Suspense
<Suspense fallback={<Skeleton />}>
  <CalendarPage />
</Suspense>
```

**Priorytet:** 🟡 Średni

---

## 🔐 Security Issues

### 1. **API keys w kodzie**
**Lokalizacja:** Sprawdzić wszystkie pliki

**Problem:**
- Sprawdzić czy nie ma hardcoded API keys
- Upewnić się, że wszystkie keys są w `.env`

**Rozwiązanie:**
- Użyć environment variables
- Dodać do `.gitignore`
- Użyć secrets management

**Priorytet:** 🔴 Wysoki (jeśli występuje)

---

## 🧪 Testing Issues

### 1. **Brak testów**
**Lokalizacja:** Cały projekt

**Problem:**
- Brak unit tests
- Brak integration tests
- Brak E2E tests

**Rozwiązanie:**
- Dodać Vitest dla unit tests
- Dodać React Testing Library dla komponentów
- Dodać Playwright dla E2E

**Priorytet:** 🟢 Niski (ale ważny dla długoterminowego utrzymania)

---

## 📝 Code Quality Issues

### 1. **Inconsistent naming**
**Pliki do sprawdzenia:**
- `components/layout/Task/` - sprawdzić czy wszystkie komponenty używają `FC`
- `components/layout/Calendar/` - sprawdzić consistency
- `app/loggedin/` - sprawdzić naming conventions

**Problemy:**
- Mieszane konwencje nazewnictwa
- Niektóre komponenty używają `FC`, inne nie
- Inconsistent file naming

**Rozwiązanie:**
- Ustalić konwencje nazewnictwa
- Użyć ESLint rules dla consistency
- Dodać pre-commit hooks

---

### 2. **Brak dokumentacji**
**Pliki wymagające dokumentacji:**
- `components/layout/Calendar/hooks/` - wszystkie hooki
- `components/layout/Task/` - złożone komponenty
- `convex/` - funkcje Convex
- `app/loggedin/` - strony

**Problem:**
- Brak JSDoc comments
- Brak README dla złożonych komponentów
- Brak dokumentacji API

**Rozwiązanie:**
- Dodać JSDoc do wszystkich funkcji
- Utworzyć README dla każdego modułu
- Użyć TypeDoc dla automatycznej dokumentacji

---

## 🎯 Recommended Actions (Priority Order)

### High Priority 🔴
1. ✅ Naprawić setState w useEffect (CreateTaskDialog)
2. ⚠️ Dodać memoization do komponentów kalendarza
3. ⚠️ Sprawdzić security (API keys)

### Medium Priority 🟡
4. ⚠️ Dodać virtualizację do WeekView
5. ⚠️ Dodać debouncing do operacji kalendarza
6. ⚠️ Zoptymalizować useCalendarData
7. ⚠️ Dodać error boundaries
8. ⚠️ Zastąpić moment.js przez date-fns/dayjs
9. ⚠️ Dodać code splitting

### Low Priority 🟢
10. ⚠️ Utworzyć hook useTaskSort
11. ⚠️ Dodać loading states wszędzie
12. ⚠️ Dodać testy
13. ⚠️ Poprawić code quality
14. ⚠️ Dodać dokumentację

---

## 📊 Performance Metrics to Track

### Current Issues:
- ⚠️ First Contentful Paint (FCP) - nie mierzone
- ⚠️ Largest Contentful Paint (LCP) - nie mierzone
- ⚠️ Time to Interactive (TTI) - nie mierzone
- ⚠️ Bundle size - nie mierzone

### Recommendations:
- Dodać Lighthouse CI
- Dodać Web Vitals tracking
- Monitorować bundle size w CI/CD
- Dodać performance budgets

---

## 🔧 Quick Wins

1. **Dodać React.memo do ciężkich komponentów** (5 min)
2. **Zastąpić moment.js przez dayjs** (30 min)
3. **Dodać useCallback do callbacków** (15 min)
4. **Uruchomić linter i naprawić błędy** (30 min)
5. **Dodać error boundaries** (1 godz)

---

## 📚 Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Size Analysis](https://bundlephobia.com/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)

---

**Ostatnia aktualizacja:** 2025-01-01
**Następny przegląd:** Co miesiąc lub po większych zmianach
