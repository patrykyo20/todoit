# TODO - Calendar Feature Development

## 🎯 High Priority Features

### 1. Interaktywny Kalendarz
- [ ] **Drag & Drop eventów**
  - Przesuwanie eventów między dniami (month view)
  - Przesuwanie eventów między godzinami (week view)
  - Zmiana czasu trwania przez rozciąganie (resize)
  - Wizualne feedback podczas przeciągania
  - Aktualizacja w Google Calendar po przeciągnięciu

- [ ] **Kliknięcie na event**
  - Otwieranie dialogu edycji eventu
  - Szybka edycja (inline editing) dla prostych zmian
  - Możliwość usunięcia eventu z kalendarza

- [ ] **Multi-select eventów**
  - Zaznaczanie wielu eventów (Ctrl/Cmd + click)
  - Masowe operacje (usuwanie, przenoszenie)

### 2. Responsywny UI na Mobile
- [ ] **Mobile Month View**
  - Optymalizacja layoutu dla małych ekranów
  - Swipe gestures do nawigacji między miesiącami
  - Touch-friendly event cards
  - Collapsible event lists w dniach

- [ ] **Mobile Week View**
  - Horizontal scroll dla dni tygodnia
  - Vertical scroll dla godzin
  - Touch gestures do zmiany tygodnia
  - Sticky headers podczas scrollowania

- [ ] **Mobile Navigation**
  - Bottom sheet dla szybkich akcji
  - Floating action button (FAB) dla tworzenia eventów
  - Hamburger menu dla opcji kalendarza

### 3. Rekurencyjne Zdarzenia (Recurring Events)
- [ ] **Typy powtórzeń**
  - Codziennie (daily)
  - Co tydzień (weekly) - z wyborem dni tygodnia
  - Co miesiąc (monthly) - dzień miesiąca lub dzień tygodnia
  - Co rok (yearly)
  - Niestandardowe (custom) - np. co 2 tygodnie, co 3 miesiące

- [ ] **Zarządzanie powtórzeniami**
  - Edycja pojedynczego wystąpienia (this occurrence only)
  - Edycja wszystkich przyszłych wystąpień (this and following)
  - Edycja całej serii (all occurrences)
  - Usuwanie pojedynczego wystąpienia
  - Usuwanie całej serii

- [ ] **Wizualizacja w kalendarzu**
  - Oznaczenie rekurencyjnych eventów (ikona powtórzenia)
  - Wyświetlanie wszystkich wystąpień w widoku miesiąca/tygodnia
  - Wykrywanie konfliktów czasowych

- [ ] **Backend & Google Calendar Sync**
  - Schema dla recurring events w Convex
  - Synchronizacja z Google Calendar (RRULE)
  - Obsługa wyjątków (exceptions) w serii

## 📊 Statystyki i Raporty

### 4. Statystyki Tygodniowe
- [ ] **Dashboard tygodniowy**
  - Liczba zakończonych tasków
  - Czas spędzony na taskach (time tracking)
  - Rozkład tasków według projektów
  - Rozkład tasków według priorytetów
  - Wykresy: bar chart, pie chart, line chart

- [ ] **Trendy**
  - Porównanie z poprzednimi tygodniami
  - Wskaźniki produktywności
  - Najbardziej produktywne dni tygodnia

### 5. Statystyki Miesięczne
- [ ] **Dashboard miesięczny**
  - Podsumowanie całego miesiąca
  - Kalendarz heatmap (intensywność pracy)
  - Top 5 projektów
  - Top 5 labeli
  - Średni czas na task

- [ ] **Raporty**
  - Eksport do PDF
  - Eksport do CSV
  - Wizualizacja danych (charts)

### 6. Statystyki Roczne
- [ ] **Dashboard roczny**
  - Podsumowanie całego roku
  - Miesięczne trendy
  - Cele roczne i postępy
  - Najlepsze miesiące/tygodnie

### 7. Statystyki Sprintowe (Future)
- [ ] **Sprint Planning**
  - Definiowanie sprintów (2 tygodnie, 1 miesiąc)
  - Przypisywanie tasków do sprintów
  - Velocity tracking
  - Burndown charts

- [ ] **Sprint Analytics**
  - Completion rate
  - Task distribution
  - Team performance metrics

## 🔧 Technical Improvements & Refactoring

### Struktura Plików i Komponentów

#### ✅ Obecna struktura (dobra):
```
components/layout/Calendar/
├── AddEventDialog.tsx
├── index.ts
├── hooks/
│   ├── useCalendarEvents.ts
│   ├── useCalendarNavigation.ts
│   ├── useCalendarData.ts
│   ├── useCalendarSync.ts
│   └── useEventDialog.ts
└── components/
    ├── ViewModeToggle.tsx
    ├── ConnectionStatus.tsx
    ├── CalendarHeader.tsx
    ├── MonthView.tsx
    ├── WeekView.tsx
    └── ReAuthWarning.tsx
```

#### 💡 Sugestie ulepszeń:

1. **Wydzielenie logiki eventów do osobnego modułu**
   ```
   components/layout/Calendar/
   ├── events/
   │   ├── EventCard.tsx          # Pojedynczy event
   │   ├── EventList.tsx          # Lista eventów
   │   ├── EventDragHandle.tsx    # Handle do przeciągania
   │   └── hooks/
   │       ├── useEventDrag.ts    # Logika drag & drop
   │       └── useEventResize.ts  # Logika resize
   ```

2. **Wydzielenie widoków do osobnych folderów**
   ```
   components/layout/Calendar/
   ├── views/
   │   ├── MonthView/
   │   │   ├── index.tsx
   │   │   ├── MonthGrid.tsx
   │   │   ├── MonthDay.tsx
   │   │   └── hooks/
   │   │       └── useMonthView.ts
   │   └── WeekView/
   │       ├── index.tsx
   │       ├── WeekGrid.tsx
   │       ├── WeekDay.tsx
   │       ├── TimeSlot.tsx
   │       └── hooks/
   │           └── useWeekView.ts
   ```

3. **Utworzenie modułu statystyk**
   ```
   components/layout/Calendar/
   ├── statistics/
   │   ├── WeeklyStats.tsx
   │   ├── MonthlyStats.tsx
   │   ├── YearlyStats.tsx
   │   ├── charts/
   │   │   ├── BarChart.tsx
   │   │   ├── PieChart.tsx
   │   │   └── LineChart.tsx
   │   └── hooks/
   │       ├── useWeeklyStats.ts
   │       ├── useMonthlyStats.ts
   │       └── useYearlyStats.ts
   ```

4. **Utworzenie modułu recurring events**
   ```
   components/layout/Calendar/
   ├── recurring/
   │   ├── RecurringEventDialog.tsx
   │   ├── RecurrencePattern.tsx
   │   ├── RecurrenceRuleBuilder.tsx
   │   └── hooks/
   │       ├── useRecurrenceRule.ts
   │       └── useRecurringEvents.ts
   ```

### Refaktoryzacja Kodu

#### 1. **Wydzielenie logiki biznesowej z komponentów**
- [ ] Przenieść wszystkie obliczenia do hooków
- [ ] Utworzyć `useCalendarState.ts` dla zarządzania stanem
- [ ] Wydzielić utility functions do `utils/calendarUtils.ts`

#### 2. **Optymalizacja wydajności**
- [ ] Implementacja `React.memo` dla ciężkich komponentów
- [ ] Virtualization dla długich list eventów
- [ ] Lazy loading dla statystyk
- [ ] Debouncing dla operacji drag & drop
- [ ] Memoization dla obliczeń dat

#### 3. **Type Safety**
- [ ] Utworzyć `types/calendar.ts` z wszystkimi typami
- [ ] Użyć discriminated unions dla różnych typów eventów
- [ ] Dodać runtime validation (zod) dla danych z API

#### 4. **Error Handling**
- [ ] Utworzyć `CalendarErrorBoundary.tsx`
- [ ] Dodać retry logic dla failed API calls
- [ ] Lepsze komunikaty błędów dla użytkownika

#### 5. **Testing**
- [ ] Unit tests dla hooków (Vitest)
- [ ] Integration tests dla komponentów (React Testing Library)
- [ ] E2E tests dla głównych flow (Playwright)

### Backend Improvements

#### 1. **Convex Schema**
- [ ] Dodać `recurringEvents` table
- [ ] Dodać `eventExceptions` table (dla edycji pojedynczych wystąpień)
- [ ] Dodać `calendarStatistics` table (cache dla statystyk)
- [ ] Dodać indeksy dla szybkich zapytań

#### 2. **Convex Functions**
- [ ] Utworzyć `convex/calendar/recurring.ts` dla logiki powtórzeń
- [ ] Utworzyć `convex/calendar/statistics.ts` dla obliczeń statystyk
- [ ] Utworzyć `convex/calendar/dragDrop.ts` dla operacji drag & drop
- [ ] Dodać caching dla często używanych zapytań

#### 3. **Google Calendar Integration**
- [ ] Lepsze error handling dla API calls
- [ ] Batch operations dla wielu eventów
- [ ] Webhook support dla real-time updates
- [ ] Rate limiting handling

### UI/UX Improvements

#### 1. **Accessibility**
- [ ] ARIA labels dla wszystkich interaktywnych elementów
- [ ] Keyboard navigation (Tab, Arrow keys)
- [ ] Screen reader support
- [ ] Focus management

#### 2. **Animations**
- [ ] Smooth transitions między widokami
- [ ] Drag & drop animations
- [ ] Loading states z skeleton screens
- [ ] Micro-interactions dla lepszego UX

#### 3. **Theming**
- [ ] Dark mode support (jeśli jeszcze nie ma)
- [ ] Customizable calendar colors
- [ ] User preferences dla wyświetlania

### Performance Optimizations

#### 1. **Code Splitting**
- [ ] Lazy load statystyki
- [ ] Lazy load recurring events dialog
- [ ] Dynamic imports dla ciężkich komponentów

#### 2. **Data Fetching**
- [ ] Implementacja React Query / SWR dla lepszego cache'owania
- [ ] Optimistic updates dla operacji drag & drop
- [ ] Pagination dla długich list eventów

#### 3. **Rendering**
- [ ] Virtual scrolling dla week view
- [ ] Windowed rendering dla month view
- [ ] Memoization dla expensive calculations

## 📝 Additional Notes

### Priorytetyzacja
1. **Phase 1** (MVP): Interaktywny kalendarz + Mobile UI
2. **Phase 2**: Rekurencyjne zdarzenia
3. **Phase 3**: Statystyki (tygodniowe, miesięczne, roczne)
4. **Phase 4**: Sprintowe statystyki + Advanced features

### Dependencies do rozważenia
- `react-beautiful-dnd` lub `@dnd-kit/core` - drag & drop
- `recharts` lub `chart.js` - wykresy statystyk
- `rrule` - parsing i generowanie recurring rules
- `date-fns` lub `dayjs` - lepsze zarządzanie datami (zamiast moment.js)
- `react-window` lub `react-virtualized` - virtualization

### Code Quality
- [ ] ESLint rules dla calendar components
- [ ] Prettier configuration
- [ ] Pre-commit hooks (Husky)
- [ ] CI/CD pipeline dla automatycznych testów
