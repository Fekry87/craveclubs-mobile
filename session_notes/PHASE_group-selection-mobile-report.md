# PHASE report — Group selection step (mobile registration)

Date: 2026-09-17

## Outcome
Done, verified end to end on the iOS simulator against the local API, and shipped as Fekry87/craveclubs-mobile#23 on top of backend Fekry87/craveclub#45 (other session) + #47 (this one).

## Backend: built twice, once kept
When this phase started, `main` had no `group_type`, capacity, schedule or public groups route, so this session built them (craveclub#46). While that branch was open, the real companion phase landed on `main` from another session as **craveclub#45** ("group type, capacity, weekly schedule + coach conflict prevention"). #46 was closed unmerged and the app adapted to #45's shapes:

- `GET /clubs/{slug}/groups` (public, 20/min throttle shared with club-lookup) → `{ data: { daily: [...], two_days: [...] } }`, or `{}` with no groups; only groups with `days_of_week` set. Rows: `id, name, group_type, coach_name, coach_user_id, days_of_week, days_of_week_labels, start_time ("17:00"), end_time, capacity, remaining_spots, is_full`. **No coach filter** and no `?coach_id=`.
- `remaining_spots` counts current members only; a pending registration does not hold a seat.
- Submission: `group_id` nullable; a full group answers 422 `errors.group_id[0] = "This group is full. Please choose another group."`. Approval re-checks under a row lock (`GroupFullException` → 422 to the portal) and places the swimmer in the chosen group, else the coach's group.
- One small addition of mine survived as **craveclub#47**: `GET /coaches` rows now carry `user_id`, so the app can match groups by `coach_user_id` instead of by name (two coaches can share a name).

## Mobile (as specified, with these choices)
- `registration.service.ts`: `Group` type and `getGroups(clubSlug, coach)` — fetches `/clubs/{slug}/groups`, flattens the type-keyed object, keeps rows whose `coach_user_id` is the coach's `user_id` (name fallback); `Coach.user_id?`; `RegistrationPayload.group_id?`.
- Store: `groupId/groupName/groupType/groupSchedule` + `coachUserId`, `setGroup`, `clearGroup`; `setCoach` with a different coach clears the group (groups belong to a coach).
- `TrainingTypeTabs` (new, `components/features/registration/`): the tab bar lifted out of `PlanPicker`, which now uses it — one implementation for plans and groups instead of a copy.
- `GroupOption` in `TrainingOptions`: schedule subtitle via `groupSchedule()` (formatters), "N spots left" / "Full" row, Full badge; a full group is drawn but its press is a no-op.
- `Step7b_GroupSelection`: tabs open on the plan's training type; **refetches on every focus** (this is where the review sends the swimmer after the 422, and where a coach change lands); drops a selection that is no longer offered; validation "Please select a group".
- Navigation: `Step7b_GroupSelection` between coach and review; `RegistrationLayout` `TOTAL_STEPS = 9` (group step shown as 8, review as 9); Step 7 → 7b; review's back → 8.
- Review: a Group card with type + schedule and Edit (back to the step); Training sheet: after a coach change it goes straight to the group step; submit guard requires a group; payload sends `group_id`; `SECTION_OF_FIELD.group_id = 'group'`, so the 422 alert offers **"Choose another group"**; success screen lists the group.
- `npx tsc --noEmit`: clean.

## Verified on the simulator (local API, demo club)
0. Re-run against the real backend (#45 + #47) after the adaptation: same five checks passed; Coach Sara's scheduled daily group was **not** listed under Coach Ahmed, proving the client-side coach filter; the 422 message is #45's ("This group is full…").
1. Step 8 of 9 "Choose a group" with Daily / 2 days a week / Private tabs, opened on Daily (the plan's type), schedule + "2 spots left".
2. "2 days a week" tab: the full group shows the Full badge and a red "Full" row; tapping it does not select; Continue shows "Please select a group".
3. Review: Group card "Academy Elite — Daily training · Sun, Mon, Tue, Wed, Thu · 5:00 PM - 6:30 PM".
4. Race: filled the group in the DB, then Submit → "Couldn't submit — This group has just filled up. Please choose another group." with **Choose another group** → back on the group step, refetched, the group now Full and deselected.
5. Picked the private group → Continue → Submit → "Registration sent" with a Group row; the registration row in the DB carries `group_id`.

## Notes for the next phase
- Existing groups are typed `daily` by default; clubs should set the real type, days, times and capacity in Groups.
- The simulator's text input is delivered late; tap → wait → type → wait, or taps land in the wrong field.
- The scratch copy for verification lives outside the app folder (the phone's Metro runs from the real folder).
