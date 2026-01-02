# Rozwiązanie błędu redirect_uri_mismatch

## Problem
Błąd występuje, ponieważ brakuje zmiennej `AUTH_URL` w `.env.local`, co powoduje, że NextAuth nie wie, jaki jest base URL aplikacji.

## Rozwiązanie - KROK PO KROKU:

### Krok 1: ✅ Dodałem AUTH_URL do .env.local
Zmienna została automatycznie dodana:
```env
AUTH_URL=http://localhost:3000
```

### Krok 2: Skonfiguruj Google Cloud Console

**MUSISZ TO ZROBIĆ TERAZ:**

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Kliknij na swoje **OAuth 2.0 Client ID** (ten, który ma Client ID zaczynający się od `953869799598-...`)
3. W sekcji **"Authorized redirect URIs"** sprawdź, czy jest tam:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

4. **Jeśli NIE MA** - dodaj dokładnie ten adres:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   
   ⚠️ **WAŻNE:**
   - Musi być dokładnie `http://localhost:3000/api/auth/callback/google`
   - Z `http` (nie `https`)
   - Bez ukośnika na końcu
   - Z portem `3000` (jeśli używasz innego portu, użyj tego samego co w AUTH_URL)

5. Kliknij **"SAVE"** (Zapisz)

### Krok 3: Uruchom ponownie serwer

Po dodaniu redirect URI w Google Cloud Console:
```bash
npm run dev
```

### Krok 4: Spróbuj zalogować się ponownie

Błąd powinien zniknąć.

## Jeśli nadal nie działa:

1. **Sprawdź port** - jeśli używasz innego portu niż 3000, zmień `AUTH_URL` w `.env.local` na odpowiedni port
2. **Poczekaj kilka minut** - zmiany w Google Cloud Console mogą wymagać czasu na propagację
3. **Sprawdź czy nie ma literówek** w redirect URI w Google Cloud Console

## Dla produkcji:

Gdy będziesz deployować aplikację, dodaj również:
```env
AUTH_URL=https://twoja-domena.com
```

I w Google Cloud Console dodaj:
```
https://twoja-domena.com/api/auth/callback/google
```
