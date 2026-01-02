# Konfiguracja OAuth - Rozwiązanie błędu redirect_uri_mismatch

## Problem
Błąd `400: redirect_uri_mismatch` występuje, gdy redirect URI w Google Cloud Console nie pasuje do tego używanego przez aplikację.

## Rozwiązanie

### 1. Sprawdź zmienne środowiskowe w `.env.local`

Dodaj następującą zmienną (jeśli jeszcze jej nie masz):

```env
AUTH_URL=http://localhost:3000
```

Dla produkcji:
```env
AUTH_URL=https://twoja-domena.com
```

### 2. Skonfiguruj Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Wybierz swój projekt
3. Przejdź do **APIs & Services** > **Credentials**
4. Kliknij na swoje **OAuth 2.0 Client ID**
5. W sekcji **Authorized redirect URIs** dodaj:

   Dla developmentu (localhost):
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   Dla produkcji:
   ```
   https://twoja-domena.com/api/auth/callback/google
   ```

6. **Zapisz zmiany**

### 3. Ważne uwagi

- ✅ Redirect URI musi być **dokładnie** taki sam (uwzględnia wielkość liter, porty, protokół http/https)
- ✅ Zmiany w Google Cloud Console mogą wymagać **kilku minut** na propagację
- ✅ Upewnij się, że używasz tego samego portu co w `.env.local` (domyślnie 3000)

### 4. Sprawdź czy działa

Po wprowadzeniu zmian:
1. Uruchom ponownie serwer deweloperski: `npm run dev`
2. Spróbuj zalogować się ponownie

## Struktura callback URL dla NextAuth v5

NextAuth v5 z App Router używa następującego formatu:
```
{BASE_URL}/api/auth/callback/{PROVIDER}
```

Gdzie:
- `BASE_URL` = wartość z `AUTH_URL` (lub automatycznie wykrywany)
- `PROVIDER` = `google` (dla Google OAuth)

Przykład:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://twoja-domena.com/api/auth/callback/google`
