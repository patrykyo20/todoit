# Instrukcja dodania Redirect URI w Google Cloud Console

## Problem
Aplikacja używa redirect URI: `http://localhost:3000/api/auth/callback/google`
Ten URI musi być dodany do Google Cloud Console.

## Krok po kroku:

### 1. Przejdź do Google Cloud Console
Otwórz: https://console.cloud.google.com/apis/credentials

### 2. Wybierz swój projekt
Upewnij się, że wybrany jest właściwy projekt (ten z Client ID: `953869799598-jelgf1u5ob8plb2tr2ucng9vqlq3qu5t`)

### 3. Znajdź swoje OAuth 2.0 Client ID
- W sekcji **"OAuth 2.0 Client IDs"** znajdź swój klient
- Kliknij na niego (lub ikonę ołówka, żeby edytować)

### 4. Dodaj Authorized redirect URI
- Przewiń w dół do sekcji **"Authorized redirect URIs"**
- Kliknij **"+ ADD URI"** (lub **"Dodaj URI"**)

### 5. Wklej dokładnie ten URI:
```
http://localhost:3000/api/auth/callback/google
```

⚠️ **WAŻNE:**
- Musi być dokładnie taki sam (bez spacji, bez dodatkowych znaków)
- Z `http://` (nie `https://`)
- Z `localhost:3000` (nie `127.0.0.1`)
- Bez ukośnika na końcu

### 6. Zapisz zmiany
- Kliknij **"SAVE"** (lub **"Zapisz"**)

### 7. Poczekaj 1-2 minuty
Zmiany w Google Cloud Console mogą wymagać chwili na propagację.

### 8. Uruchom ponownie serwer
```bash
npm run dev
```

### 9. Spróbuj zalogować się ponownie

## Wizualna instrukcja:

1. **APIs & Services** → **Credentials**
2. Kliknij na **OAuth 2.0 Client ID** (twój klient)
3. W sekcji **"Authorized redirect URIs"** kliknij **"+ ADD URI"**
4. Wklej: `http://localhost:3000/api/auth/callback/google`
5. **SAVE**

## Jeśli nadal nie działa:

1. **Sprawdź czy nie ma literówek** w redirect URI
2. **Upewnij się, że zapisałeś zmiany** (kliknąłeś SAVE)
3. **Poczekaj dłużej** (czasami Google potrzebuje więcej czasu)
4. **Sprawdź czy używasz tego samego Client ID** co w `.env.local`

## Dla produkcji (później):

Gdy będziesz deployować, dodaj również:
```
https://twoja-domena.com/api/auth/callback/google
```
