# Go-Live Checklist — First Customer

Status as of 2026-09-11. "Done" = shipped in code. "You supply" = needs your
accounts/assets and can't be done from code.

## ✅ Done in code (this work)
- **Login is usable for real swimmers** — log in with **phone number** or email;
  the internal `swimmer_<phone>@club<N>.craveclubs.local` address is no longer
  something the swimmer must know.
- **Change password** screen (Profile → Password) + `POST /auth/change-password`.
- **Manager password reset** — `POST /club/swimmers/{id}/reset-password` returns
  fresh credentials for the manager to relay (recovery without SMS).
- **Forgot-password** link on login → points swimmer to their club (tap-to-call).
- **Real subscription dates** — `subscription_started_at/ends_at` on registrations,
  stamped at approval, backfilled; profile + reminders use them.
- Ahead-style redesign + rich swimmer Profile tab.
- Per-club branded builds automation (`npm run add-club <slug>`).

## 🔴 You must supply / configure (blockers for a real launch)
1. **EAS + push notifications** — run `eas login` (your Expo account), then a first
   `eas build --profile <club> --platform all`. The first build links the EAS
   project and produces the **projectId** that push notifications require. Without
   it, push tokens don't register.
2. **First real client data** — in the backend portal: create the club with its
   branding (name, logo, primary color). Then locally: add
   `assets/icons/<slug>/{icon,adaptive-icon,splash}.png`, run
   `npm run add-club <slug>`, build, submit.
3. **Remove `.env.local`** — if `SwimmingApp/.env.local` exists it points the app at
   `127.0.0.1:8000` (local testing). Delete it so the app uses production.

## 🟡 Configure for full functionality (app works without, but degraded)
4. **Real-time (Reverb)** — `EXPO_PUBLIC_REVERB_APP_KEY` is still `your-reverb-key`.
   Set the real Reverb key/host/port/scheme (matching the Railway Reverb service).
   Until then, live updates fall back to 30-second polling.
5. **Sentry** — `EXPO_PUBLIC_SENTRY_DSN` is empty. Paste your project DSN to get
   crash/error reports from customers.

## 🟢 Operational flow for the first customer
1. Swimmer self-registers in the app → **pending**.
2. Manager approves in the portal → account created; portal shows the swimmer's
   **login credentials** (phone-derived email + temp password).
3. Manager relays credentials to the swimmer (WhatsApp/verbally).
4. Swimmer logs in with **phone + temp password** → **changes password**.
5. If a swimmer is locked out → manager hits **Reset password**, relays the new one.

## 🔵 Recommended soon (not blockers)
- **Automated credential delivery** (SMS/email) — currently manual by the manager.
  Backend has an SMS job stub (`SendGuardianSMSJob`) but no provider wired.
- **Online payment** — currently cash only (`payment_method: 'cash'`).
- **Device smoke-test** of the new auth screens (phone login, change password) on a
  physical device before store submission.
