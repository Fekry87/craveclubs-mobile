# PHASE Report — Fully Automated Per-Club Branded Mobile Apps

**Date**: 2026-07-11
**Goal**: adding a new club requires ONE command (`npm run add-club <slug>`), each club ships as an independent store app with its own name, icon, colors, and bundle ID.

---

## What was done

### 1. Hardcoded brand colors eliminated (Step 2)

| File | Before | After |
|---|---|---|
| `src/theme/colors.ts` | `applyBrandingColors()` only updated primary/secondary + dark/dim | Also re-derives brand gradients and notifies listeners (button shadows) via a small `onBrandingApplied()` registry (avoids a circular import with `theme/index.ts`) |
| `src/theme/gradients.ts` | `as const` readonly tuples with hardcoded hexes | Mutable typed pairs + `applyBrandingToGradients()` re-derives `splash`/`avatar`/`bar` from primary/swimmer/secondary. Medal + streak gradients intentionally untouched |
| `src/theme/index.ts` | `buttonShadows.primary/.swimmer` hardcoded `#1899D6`/`#46A302` | Synced to `colors.primaryDark`/`colors.swimmerDark` on every branding apply. `danger` stays semantic |
| `src/navigation/AppNavigator.tsx` | `TAB_ICON_CONFIG`/`TAB_COLORS` module-level consts with hex literals | `getTabIconConfig()`/`getTabColors()` resolved at render time from the mutable `colors` object |
| `src/navigation/CoachAppNavigator.tsx` | same | same |
| `src/navigation/ManagerAppNavigator.tsx` | same | same |
| `src/services/pushNotifications.ts` | Android channel `lightColor: '#1CB0F6'` | `colors.primary` |

**Intentionally NOT changed** (verified, not missed):
- `LoginScreen.tsx:158` gradient — LoginScreen is platform-branded (CraveClubs) by design; club branding applies only after login.
- `SeaCharacter/index.tsx` gradients — character artwork palettes, not brand colors.
- `config/club.ts`, `branding.service.ts`, `branding.store.ts` fallback `#1CB0F6` values — platform defaults used before branding resolves.
- Semantic/neutral colors (error, warning, success, grays, fun accents).

### 2. Bundle ID mechanism fixed (found during audit)

**Problem**: the 3 existing eas.json profiles declared `ios.bundleIdentifier` / `android.applicationId` inside build profiles — EAS does not support those fields there (bundle IDs come from app config only). Those values were dead config; actual builds would have used `app.config.js`'s fallback (`com.craveclubs.{slug}`), silently diverging from the declared IDs.

**Fix**: bundle ID now flows through `env.APP_BUNDLE_ID` in each profile → consumed by `app.config.js` (`ios.bundleIdentifier` + `android.package`). The declared IDs (`com.futureacademy.swim`, `com.sharkscairo.swim`, `com.dolphinsalex.swim`) were preserved. Invalid `ios`/`android` blocks removed from eas.json.

**Uniqueness verified**: all 3 IDs unique; `add-club.js` re-verifies on every run and exits non-zero on collision.

### 3. Automation script (Steps 3–4)

- `scripts/add-club.js` — `npm run add-club <slug>`:
  - validates slug format
  - fetches `GET {API}/api/v1/branding/{slug}` (handles Laravel `{data:{...}}` wrapper, `#`-less colors)
  - warns on missing icon assets (build falls back to default set)
  - writes/updates the eas.json profile (name, colors, API URL, `APP_BUNDLE_ID`)
  - **never changes an existing profile's bundle ID** (store identity is permanent)
  - verifies bundle-ID uniqueness across all profiles
- `package.json`: added `"add-club"` script.
- Deviations from the phase spec (deliberate):
  - API default is `https://api.craveclubs.com` (repo convention), not `.co`; override via `CRAVECLUBS_API_URL`.
  - `EXPO_PUBLIC_API_URL` written WITHOUT `/api/v1` suffix (the app's client appends `/api/...` itself — the spec's draft would have produced a double path).
  - New-club bundle IDs default to `com.craveclubs.{slug}` (matches `app.config.js` fallback convention), not `co.craveclubs.*`.

### 4. Docs (Step 6)

`docs/adding-a-new-club.md` — full onboarding flow, icon asset specs, bundle-ID rules, runtime branding explanation, staging override.

### 5. Verification (Step 7)

- `npx tsc --noEmit` → **0 errors**
- Live test: `CRAVECLUBS_API_URL=https://web-production-c3c32.up.railway.app node scripts/add-club.js future-academy` → fetched real branding (Future Academy, `#0ea5e9`), found all assets, preserved `com.futureacademy.swim`, uniqueness passed.

---

## ⚠️ Findings requiring follow-up

1. **`api.craveclubs.com` is DEAD (DNS does not resolve).** The live backend is `https://web-production-c3c32.up.railway.app`. All 3 eas.json profiles were updated to the Railway URL so builds work today. When the custom domain goes live, update the profiles (re-run `add-club` for each slug with the new `CRAVECLUBS_API_URL`) and change the default in `scripts/add-club.js` + fallbacks in `src/config/club.ts` / `branding.service.ts`.
2. **No EAS project ID** in app config (`extra.eas.projectId` absent) — suggests no EAS build has ever completed. First `eas build` will link the project. Push notifications (`getExpoPushTokenAsync({projectId})`) also depend on this.
3. **Tab-bar branding refresh timing**: navigator colors are resolved at render time; if branding arrives after the tab bar mounts, colors update on the next re-render (navigation state change). Acceptable for now; a reactive `useTheme()` subscription in navigators would make it instant.
4. Backend branding response includes `secondary_color` (e.g. `06b6d4` for future-academy) — the runtime store already consumes it; eas.json does not bake it (runtime-only), which is fine.

## Definition of Done

- [x] `applyBrandingColors()` covers button shadows + gradients + accent usages
- [x] `scripts/add-club.js` created and tested against live backend
- [x] `npm run add-club <slug>` shortcut added
- [x] Existing 3 club profiles have unique bundle IDs (now actually effective via `APP_BUNDLE_ID`)
- [x] `docs/adding-a-new-club.md` written
- [x] `npx tsc --noEmit` — 0 errors
- [x] Pushed to `origin/main`
