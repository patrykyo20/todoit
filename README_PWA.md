# PWA Setup Instructions

Aplikacja została skonfigurowana jako Progressive Web App (PWA) zgodnie z dokumentacją Next.js.

## Zaimplementowane funkcje

✅ Web App Manifest (`app/manifest.ts`)
✅ Service Worker (`public/sw.js`)
✅ Push Notifications (Server Actions + Component)
✅ Security Headers (w `next.config.ts`)

## Do ukończenia konfiguracji

### 1. Ikony PWA

Utwórz ikony PNG w rozmiarach:
- `public/icon-192x192.png` (192x192 px)
- `public/icon-512x512.png` (512x512 px)

Możesz użyć narzędzi online:
- https://realfavicongenerator.net/
- Lub innych narzędzi do generowania ikon

### 2. VAPID Keys (dla Push Notifications)

Aby włączyć powiadomienia push, wygeneruj klucze VAPID:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Dodaj klucze do pliku `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Testowanie lokalnie

Dla testów lokalnych użyj HTTPS:

```bash
next dev --experimental-https
```

**Ważne:** Powiadomienia push wymagają HTTPS (lub localhost dla developmentu).

## Struktura plików PWA

- `app/manifest.ts` - Web App Manifest
- `public/sw.js` - Service Worker
- `app/actions.ts` - Server Actions dla push notifications
- `app/components/PushNotificationManager.tsx` - Komponent do zarządzania powiadomieniami
- `next.config.ts` - Security headers dla PWA

## Więcej informacji

Zobacz pełną dokumentację: https://nextjs.org/docs/app/guides/progressive-web-apps
