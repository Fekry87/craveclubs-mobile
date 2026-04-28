# Mobile UI Polish Report

**Date:** 2026-03-23
**Stack:** React Native + Expo SDK 54, React Navigation v7

---

## 1. Double Headers Audit

### Result: NO ISSUES FOUND

All navigators follow a clean pattern:
- **Screens with custom headers** → `headerShown: false` at navigator level
- **Screens with navigator headers** → no custom header rendered
- **Nested navigators** → proper delegation (e.g. ProgressNavigator inside AppNavigator tab)

| Navigator | Screens | Header Pattern |
|-----------|---------|----------------|
| RootNavigator | All screens `headerShown: false` except NotificationCenter | Clean |
| AppNavigator (Swimmer tabs) | All tabs use navigator header + NotificationBell | Clean |
| CoachAppNavigator | Sessions/Calendar: `headerShown: false` (custom); Profile: navigator | Clean |
| CoachSessionsNavigator | List: `headerShown: false`; Detail/Live/Create/Attendance: navigator + BackButton | Clean |
| ManagerAppNavigator | Analytics/Coaches: `headerShown: false`; Profile: navigator | Clean |
| RegistrationNavigator | All `headerShown: false` (RegistrationLayout handles) | Clean |
| ProgressNavigator | Main: `headerShown: false`; Evaluations: navigator | Clean |

---

## 2. Shadow System

### Before
- Theme (`src/theme/index.ts`) defined 4 shadow levels: `sm`, `md`, `lg`, `card`
- All theme shadows included both iOS props AND Android `elevation`
- **3 navigators** had identical hardcoded `glowPill` shadow (DRY violation)
- **1 screen** (`PlanAndReportScreen`) had hardcoded shadow `shadowColor: '#000'`

### Fixes Applied
1. **Added `shadows.glow`** to `src/theme/index.ts` — centered diffusion glow for tab icons
2. **Replaced hardcoded glowPill** in `AppNavigator.tsx`, `CoachAppNavigator.tsx`, `ManagerAppNavigator.tsx` with `...shadows.glow`
3. **Replaced hardcoded shadow** in `PlanAndReportScreen.tsx` segment indicator with `...shadows.md`

### After
- All shadow usage goes through the theme system
- Card component correctly uses `shadows.card` (verified in `Card/styles.ts`)
- Button shadows use `buttonShadows.*` (verified in theme)

---

## 3. Responsive Design

### SafeAreaView: CORRECT
All screens with custom headers use `SafeAreaView` with `edges={['top']}`.
Auth screens (LoginScreen, ClubEntryScreen) use full-screen gradients — no safe area needed.

### Bottom Tab Bar Overlap: FIXED
**Before:** 3 files had hardcoded `paddingBottom: 34`
**After:** Replaced with `spacing.xl` (32px) from theme

| File | Before | After |
|------|--------|-------|
| `CoachSessionAttendanceScreen.tsx` | `paddingBottom: 34` | `spacing.xl` |
| `CoachSessionLiveScreen.tsx` | `paddingBottom: 34` | `spacing.xl` |
| `SessionSummaryPopup/styles.ts` | `paddingBottom: 34` | `spacing.xl` |

### Responsive Utilities
- Project uses `Dimensions.get('window')` for layout calculations (8 locations)
- `useSafeAreaInsets()` used for dynamic bottom padding on sticky footers
- No custom responsive scale utilities (not needed — app targets phones only)

---

## 4. Verification

- `npx tsc --noEmit` — **0 errors**
- No remaining hardcoded `paddingBottom: 34` in codebase
- No remaining hardcoded shadow values outside theme (except Card's dynamic `glowColor` prop — intentional)

---

## Files Modified

| File | Change |
|------|--------|
| `src/theme/index.ts` | Added `shadows.glow` definition |
| `src/navigation/AppNavigator.tsx` | `glowPill` → `...shadows.glow` |
| `src/navigation/CoachAppNavigator.tsx` | `glowPill` → `...shadows.glow` |
| `src/navigation/ManagerAppNavigator.tsx` | `glowPill` → `...shadows.glow` |
| `src/screens/TrainingPlan/PlanAndReportScreen.tsx` | Hardcoded shadow → `...shadows.md` |
| `src/screens/Coach/CoachSessionAttendanceScreen.tsx` | `paddingBottom: 34` → `spacing.xl` |
| `src/screens/Coach/CoachSessionLiveScreen.tsx` | `paddingBottom: 34` → `spacing.xl` |
| `src/components/features/sessions/SessionSummaryPopup/styles.ts` | `paddingBottom: 34` → `spacing.xl` |

---

## Definition of Done

- [x] No screen has a double header
- [x] Shadow system unified — all shadows use theme constants
- [x] All card components use `shadows.card` from shared utility
- [x] Hardcoded padding replaced with `spacing.*` values
- [x] SafeAreaView applied correctly to all screens
- [x] Bottom content not hidden behind tab bar
- [x] `npx tsc --noEmit` passes with 0 errors
