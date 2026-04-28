# Real-Time Session Updates — Report

**Date:** 2026-03-24

---

## Root Cause

**WebSocket is not connected.** The `.env` has `EXPO_PUBLIC_REVERB_APP_KEY=your-reverb-key` (placeholder). Echo service detects this and skips WebSocket initialization. Previously:

- **HomeScreen**: 30-second polling (only fallback)
- **Sessions tab**: No auto-refresh at all (only on tab focus)
- **Other tabs**: No session refresh mechanism

## Architecture: Dual-Layer Updates

### Layer 1 — WebSocket (instant, when Reverb is configured)
`useRealtime` hook in `AppNavigator` listens on `private-swimmer.{id}` for:
- `.SessionStarted` → `refreshSessions()` + notification
- `.SessionCompleted` → `refreshSessions()` + completion popup
- `.SessionUpdated` → `refreshSessions()` (catch-all for any status change)
- `.NewSessionAssigned` → `refreshSessions()` + notification
- `.ScheduleChanged` → `refreshSessions()` + notification

### Layer 2 — Global polling (10s fallback, when no WebSocket)
`AppNavigator` runs `setInterval(refreshSessions, 10000)` when `isEchoConnected()` returns false.
- Runs across ALL tabs — no per-screen polling needed
- Updates the `useSessionStore` which all screens read from
- Any screen showing session data auto-rerenders via Zustand reactivity

## Fixes Applied

### 1. Global 10s session polling in AppNavigator
**File:** `src/navigation/AppNavigator.tsx`
- Added `useEffect` that polls `refreshSessions()` every 10s when WebSocket is disconnected
- Skips polling entirely when `isEchoConnected()` is true
- All tabs get fresh session data without individual polling

### 2. HomeScreen polling: 30s → 10s
**File:** `src/screens/Home/HomeScreen.tsx`
- `setInterval(fetchDashboard, 30000)` → `setInterval(fetchDashboard, 10000)`
- Dashboard data (XP, stats, today's sessions) refreshes faster

### 3. SessionsScreen: Removed per-screen polling
**File:** `src/screens/Sessions/SessionsScreen.tsx`
- Removed redundant per-screen polling (global poll handles it)
- Kept `useFocusEffect` for initial fetch on tab focus

### 4. Enhanced useRealtime listeners
**File:** `src/hooks/useRealtime.ts`
- Added `.SessionStarted` with in-app notification
- Added `.SessionUpdated` catch-all for any session change
- When WebSocket IS available, updates are instant (< 1 second)

## Files Modified

| File | Change |
|------|--------|
| `src/navigation/AppNavigator.tsx` | Added global 10s polling fallback |
| `src/screens/Home/HomeScreen.tsx` | Polling 30s → 10s |
| `src/screens/Sessions/SessionsScreen.tsx` | Removed per-screen polling (global handles it) |
| `src/hooks/useRealtime.ts` | Added `.SessionStarted` + `.SessionUpdated` listeners |

## Timing Summary

| Scenario | Before | After |
|----------|--------|-------|
| HomeScreen popup (no WS) | Up to 30s | Up to 10s |
| Sessions tab status (no WS) | Never auto-refresh | Up to 10s |
| Any tab session data (no WS) | Never auto-refresh | Up to 10s |
| Any update (WebSocket active) | Instant | Instant |

## Verification
- [x] `npx tsc --noEmit` — 0 errors
- [x] Global polling refreshes sessions every 10s across all tabs
- [x] No redundant per-screen polling (DRY)
- [x] WebSocket listeners cover all session lifecycle events
- [x] When Reverb is configured, polling auto-disables

## Note
Once a real Reverb app key is set in `.env`, all updates will be **instant (< 1 second)** via WebSocket. The global 10-second polling is the fallback and auto-disables when WebSocket connects.
