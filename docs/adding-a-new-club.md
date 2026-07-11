# Adding a New Club — Mobile App

Each club gets an independent app on the App Store & Google Play with its own
name, icon, primary color, and bundle ID. Adding a club is one command plus
icon assets.

## Steps

1. **Backend first**: ensure the club exists in the platform with branding set
   (name, `primary_color`, logo). Verify: `GET https://api.craveclubs.com/api/v1/branding/{slug}`

2. **Add icon assets** under `assets/icons/{slug}/`:
   - `icon.png` — 1024×1024, no transparency (iOS app icon)
   - `adaptive-icon.png` — 1024×1024 foreground (Android adaptive icon)
   - `splash.png` — 1284×2778 (splash screen image)

   If missing, builds fall back to the default `assets/icons/craveclubs/` set
   (the script warns but does not fail).

3. **Scaffold the build profile**:
   ```bash
   npm run add-club {slug}
   ```
   This fetches branding from the backend, writes the `{slug}` profile into
   `eas.json` (app name, colors, API URL, bundle ID), and verifies bundle-ID
   uniqueness across all profiles.

4. **Build**:
   ```bash
   eas build --profile {slug} --platform all
   ```
   Or build every club at once: `npm run build:branded`

5. **Submit**:
   ```bash
   eas submit --profile {slug} --platform all
   ```

6. **First release only**: create the App Store Connect / Google Play Console
   listing for the new bundle ID (one-time per club).

## How bundle IDs work

- The bundle ID lives in the profile's `env.APP_BUNDLE_ID` in `eas.json`.
  `app.config.js` reads it and sets `ios.bundleIdentifier` / `android.package`.
  (EAS build profiles cannot set bundle IDs directly — only app config can.)
- New clubs default to `com.craveclubs.{slugwithoutdashes}`.
- **Never change the bundle ID of a club that has already shipped** — store
  identity is permanent. `add-club.js` preserves an existing profile's
  `APP_BUNDLE_ID` when re-run.

## How branding colors work at runtime

Build-time env vars seed the initial colors; at runtime `branding.store.ts`
fetches `/api/v1/branding/{slug}` and calls `applyBrandingColors()`, which
mutates the global `colors` object and re-derives:

- `primaryDark` / `primaryDim`, `secondaryDark` / `secondaryDim`
- brand gradients (`splash`, `avatar`, `bar` in `theme/gradients.ts`)
- 3D button shadows (`buttonShadows.primary` / `.swimmer` in `theme/index.ts`)

Neutral and semantic colors (grays, error/warning/success, fun accents) are
intentionally not branded.

## Custom API environment

Point the script at a different backend (e.g. staging):

```bash
CRAVECLUBS_API_URL=https://staging.craveclubs.com npm run add-club {slug}
```
