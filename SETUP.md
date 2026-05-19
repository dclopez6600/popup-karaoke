# PopUp Karaoke App v2.0 — Setup Guide

## What Was Built

A fully redesigned React Native (Expo) app with 6 screens, a live update engine, and a premium dark neon UI.

---

## Project Structure

```
PopUp Karaoke App/
├── App.tsx                       ← Entry point
├── app.json                      ← Expo config (bundle ID, icons, permissions)
├── package.json                  ← Dependencies
├── babel.config.js               ← Build config
├── tsconfig.json                 ← TypeScript config
└── src/
    ├── theme/index.ts            ← Design system (colors, spacing, typography)
    ├── services/api.ts           ← API layer + mock data
    ├── hooks/useLiveData.ts      ← Live update engine (polling + WebSocket)
    ├── navigation/index.tsx      ← Bottom tab navigator
    └── screens/
        ├── HomeScreen.tsx        ← Dashboard: live status, rotation, events
        ├── NowPlayingScreen.tsx  ← Live song, progress, singer rotation
        ├── EventsScreen.tsx      ← Calendar, event detail modal
        ├── SongCatalogScreen.tsx ← Search, filter, favorites
        ├── ReviewsScreen.tsx     ← Ratings, reviews, write review
        └── SocialScreen.tsx     ← Community feed, check-ins, achievements
```

---

## Run the App

### 1. Install dependencies

```bash
cd "PopUp Karaoke App"
npm install
```

### 2. Start Expo

```bash
npx expo start
```

- Press **`i`** for iOS simulator
- Press **`a`** for Android emulator
- Scan QR code with **Expo Go** app on your phone

---

## Live Updates — How It Works

The app uses a **two-layer live update system** in `src/hooks/useLiveData.ts`:

### Layer 1: Polling (always active)
- Fetches fresh data from the website every **15 seconds** when the app is open
- Slows to **60 seconds** when the app is backgrounded (saves battery)
- Immediately refreshes when user brings the app back to foreground

### Layer 2: WebSocket (instant push)
- Opens a persistent WebSocket to `wss://your-backend.com/ws`
- Receives instant push updates for: now playing changes, event updates, new reviews, social posts, catalog changes
- Auto-reconnects if connection drops

### What updates live:
| Feature | Update method | Interval |
|---|---|---|
| Now Playing | WebSocket + polling | Instant / 10s |
| Singer Rotation | WebSocket + polling | Instant / 15s |
| Events / Calendar | Polling | 15s |
| Song Catalog | WebSocket signal + re-fetch | Instant |
| Reviews | WebSocket + polling | Instant / 15s |
| Social Feed | WebSocket + polling | Instant / 15s |

---

## Connecting Your Real Backend

Currently the app runs on **mock data** (no backend needed). To go live:

### Option A — REST API (simplest)

Add these endpoints to your Replit/backend:

```
GET  /api/health          → { status: "ok" }
GET  /api/live            → LiveStatus object
GET  /api/events          → Event[]
GET  /api/now-playing     → NowPlaying | null
GET  /api/songs?q=&genre= → Song[]
GET  /api/reviews         → Review[]
GET  /api/social/feed     → SocialPost[]
```

Then in `src/services/api.ts`, set:
```typescript
private useMock: boolean = false;
```

### Option B — WebSocket (real-time push)

Your server broadcasts JSON messages to connected clients:

```json
{ "type": "now_playing_update", "data": { ...NowPlaying } }
{ "type": "event_update", "data": { ...Event } }
{ "type": "new_review", "data": { ...Review } }
{ "type": "social_post", "data": { ...SocialPost } }
{ "type": "catalog_update" }
{ "type": "live_status", "data": { ...LiveStatus } }
```

### Option C — Firebase / Supabase (easiest real-time)

Replace the polling/WS in `useLiveData.ts` with Firestore listeners or Supabase realtime subscriptions — the data model stays the same.

---

## Building for App Stores

### iOS (App Store)
```bash
npx expo build:ios
# or with EAS Build:
npx eas build --platform ios
```

### Android (Google Play)
```bash
npx expo build:android
# or with EAS Build:
npx eas build --platform android
```

You'll need:
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android
- `eas.json` config for EAS Build (recommended)

---

## Design System

All colors and spacing are in `src/theme/index.ts`. Key values:

| Token | Value | Used for |
|---|---|---|
| `Colors.bg` | `#0D0D14` | App background |
| `Colors.primary` | `#7B2FFF` | Buttons, active states |
| `Colors.accent` | `#FF2D8B` | Highlights, likes, live |
| `Colors.cyan` | `#00E5FF` | Achievements, accents |
| `Colors.gold` | `#FFD700` | Stars, ratings |

---

## Next Steps

1. **Replace mock data** with real API calls (see Connecting above)
2. **Add authentication** (sign in with Apple / Google)
3. **Push notifications** via Expo Notifications (already in `app.json`)
4. **Host management screen** for event hosts to manage their night
5. **Submit to App Store / Play Store** via EAS Build
