# Account Deletion with 30-Day Recovery — Mobile Report

**Date:** 2026-03-24
**Stack:** React Native + Expo SDK 54, TypeScript strict mode

---

## Summary

Added account deletion with 30-day recovery period. Users can delete their account from Profile, and reactivate it by logging in within 30 days.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/common/Icon/index.tsx` | Added `delete-bin-6-line` glyph (0xEC26) |
| `src/types/api.types.ts` | Added `DeleteAccountResponseType`, `ReactivateAccountResponseType`, `DeletionStatusResponseType` |
| `src/api/endpoints.ts` | Added `ACCOUNT.DELETE`, `ACCOUNT.REACTIVATE`, `ACCOUNT.DELETION_STATUS` |
| `src/api/services/auth.service.ts` | Added `deleteAccount()`, `reactivateAccount()`, `getDeletionStatus()` |
| `src/store/auth.store.ts` | Added `isDeletingAccount` state, `deleteAccount()` + `reactivateAccount()` methods |
| `src/screens/Profile/ProfileScreen.tsx` | Added delete icon in header + DeleteAccountSheet |
| `src/screens/Auth/LoginScreen.tsx` | Added pre-login deletion status check + reactivation UI |

## Files Created

| File | Purpose |
|------|---------|
| `src/components/features/profile/DeleteAccountSheet/index.tsx` | Bottom sheet with warning + Delete/Keep buttons |
| `src/components/features/profile/DeleteAccountSheet/styles.ts` | Styles using theme tokens |

---

## Flows

### Deletion Flow
1. Profile → tap trash icon (delete-bin-6-line) in header
2. DeleteAccountSheet slides up with warning text
3. User taps "Delete Account" (red 3D button)
4. `auth.store.deleteAccount()` → POST `/account/delete` → full logout cleanup
5. RootNavigator detects `isAuthenticated=false` → shows LoginScreen

### Reactivation Flow
1. LoginScreen → user enters email + password → taps "Let's Go!"
2. `handleLogin` calls `authService.getDeletionStatus(email)` before login
3. If `pending_deletion` → shows orange reactivation banner with days remaining
4. User taps "Restore My Account"
5. `auth.store.reactivateAccount()` → POST `/account/reactivate` → stores token + user
6. `isAuthenticated=true` → app navigates to home

### Edge Cases
- Network failure during status check → falls through to normal login
- `permanently_deleted` status → shows error: "This account has been permanently deleted"
- 0 days remaining → shows "scheduled for deletion today"

---

## Verification

- [x] `npx tsc --noEmit` — 0 errors
- [x] API types match backend endpoints
- [x] DeleteAccountSheet follows existing modal pattern (SubscriptionExpiryModal)
- [x] Uses theme tokens throughout (no hardcoded colors)
- [x] Uses `<Icon>` component (no emoji)
- [x] Auth store cleanup matches logout() pattern (all stores reset)

---

## Definition of Done

- [x] `requestAccountDeletion` + `reactivateAccount` + `checkDeletionStatus` added to API
- [x] `DeleteAccountSheet` component created with warning UI
- [x] Delete icon in profile header opens the sheet
- [x] Sheet has title, description, Delete button (red), Keep button
- [x] After deletion → user is logged out and tokens cleared
- [x] Login screen checks deletion status before normal login
- [x] Reactivation gate appears with days remaining count
- [x] Reactivate button restores account and logs user in
- [x] `npx tsc --noEmit` passes with 0 errors
