# Jak dodać testerów do Google OAuth (szybkie rozwiązanie)

## Problem
Po dodaniu scope dla Google Calendar, aplikacja została automatycznie przeniesiona do trybu testowego i tylko zatwierdzeni testerzy mogą się logować.

## Rozwiązanie - Dodaj testerów

### Krok 1: Przejdź do Google Cloud Console
1. Otwórz: https://console.cloud.google.com/
2. Wybierz swój projekt

### Krok 2: Otwórz OAuth consent screen
1. W menu po lewej: **APIs & Services** → **OAuth consent screen**
2. Upewnij się, że jesteś w sekcji **"OAuth consent screen"**

### Krok 3: Dodaj test users
1. Przewiń w dół do sekcji **"Test users"**
2. Kliknij **"+ ADD USERS"** (lub **"Dodaj użytkowników"**)
3. Wpisz adresy e-mail użytkowników (po jednym na linię lub oddzielone przecinkami)
4. Kliknij **"ADD"** (lub **"Dodaj"**)

### Krok 4: Zapisz zmiany
- Zmiany są zapisywane automatycznie

### Krok 5: Poczekaj 1-2 minuty
- Zmiany mogą wymagać chwili na propagację

### Krok 6: Spróbuj zalogować się ponownie
- Dodani użytkownicy powinni móc się teraz logować

## Ważne uwagi

⚠️ **Limit testerów:**
- W trybie testowym możesz dodać maksymalnie 100 testerów
- Tylko dodani testerzy będą mogli się logować

⚠️ **Dla produkcji:**
- Jeśli chcesz, żeby aplikacja była dostępna publicznie, musisz przejść przez proces weryfikacji Google
- Weryfikacja może trwać kilka dni/tygodni
- Google może wymagać dodatkowych informacji (privacy policy, screencast, itp.)

## Alternatywne rozwiązanie (tymczasowe)

Jeśli nie potrzebujesz teraz funkcji Google Calendar, możesz tymczasowo usunąć scope:

W pliku `auth.ts` zmień:
```typescript
scope: "openid email profile https://www.googleapis.com/auth/calendar",
```

Na:
```typescript
scope: "openid email profile",
```

To przywróci działanie bez weryfikacji, ale wyłączy synchronizację z Google Calendar.
