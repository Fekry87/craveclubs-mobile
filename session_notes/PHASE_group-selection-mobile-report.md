# PHASE report — Group selection step (mobile registration)

Date: 2026-09-17

## Outcome
Done, verified end to end on the iOS simulator against the local API, and shipped in two PRs (backend + portal: Fekry87/craveclub#46; app: Fekry87/craveclubs-mobile#23).

## Deviation from the spec: the backend "companion phase" did not exist
`main` had no `group_type`, `capacity`, schedule or public groups route — `groups` held only name, description, coach and sport. The step cannot work without them, so this phase built the backend too:

- Migration `2024_01_01_000077`: `groups.group_type` (string, default `daily` — existing groups are typed daily, a club can change it), `capacity` (nullable = no limit), `days_of_week` (json, 0 = Sunday), `start_time`, `end_time`; `registrations.group_id` (nullable FK, null on delete).
- `GET /groups?coach_id=<coach_profiles id>` under the club-header registration group (same 60/min throttle as `/coaches`). **Not** `/clubs/{slug}/groups` and **not** grouped by type: the app's other registration calls use the `X-Club-Slug` header, and the tabs are derived client-side by `trainingTypesIn()`, so a grouped payload would only be flattened again. Filtering is server-side; an unknown coach returns an empty list rather than everyone's groups. Each row: `id, name, description, group_type, coach_name, days_of_week, days_of_week_labels, start_time, end_time, capacity, remaining_spots, is_full`. Spots count members **and pending registrations**, otherwise a full group keeps taking applicants the manager can only reject.
- Submission: `group_id` nullable (older builds), must belong to the chosen coach (422 `errors.group_id`), and under `lockForUpdate` on the group must still have a spot — 422 `errors.group_id[0] = "This group has just filled up. Please choose another group."` The `catch (\Exception)` around the transaction now rethrows `ValidationException` so that message reaches the app.
- Approval puts the swimmer in `registration.group_id`, falling back to the coach's first group when null.
- Portal Groups page: type select, day pills, start/end time, capacity (empty = no limit); Type and Spots columns. Locale keys in `groups.*` (en + ar).
- Tests: `tests/Feature/Api/RegistrationGroupsTest.php` (7 tests). Full suite: 366 passed.

## Mobile (as specified, with these choices)
- `registration.service.ts`: `Group` type and `getGroups(coachId)`; `RegistrationPayload.group_id?`.
- Store: `groupId/groupName/groupType/groupSchedule`, `setGroup`, `clearGroup`; `setCoach` with a different coach clears the group (groups belong to a coach).
- `TrainingTypeTabs` (new, `components/features/registration/`): the tab bar lifted out of `PlanPicker`, which now uses it — one implementation for plans and groups instead of a copy.
- `GroupOption` in `TrainingOptions`: schedule subtitle via `groupSchedule()` (formatters), "N spots left" / "Full" row, Full badge; a full group is drawn but its press is a no-op.
- `Step7b_GroupSelection`: tabs open on the plan's training type; **refetches on every focus** (this is where the review sends the swimmer after the 422, and where a coach change lands); drops a selection that is no longer offered; validation "Please select a group".
- Navigation: `Step7b_GroupSelection` between coach and review; `RegistrationLayout` `TOTAL_STEPS = 9` (group step shown as 8, review as 9); Step 7 → 7b; review's back → 8.
- Review: a Group card with type + schedule and Edit (back to the step); Training sheet: after a coach change it goes straight to the group step; submit guard requires a group; payload sends `group_id`; `SECTION_OF_FIELD.group_id = 'group'`, so the 422 alert offers **"Choose another group"**; success screen lists the group.
- `npx tsc --noEmit`: clean.

## Verified on the simulator (local API, demo club)
1. Step 8 of 9 "Choose a group" with Daily / 2 days a week / Private tabs, opened on Daily (the plan's type), schedule + "2 spots left".
2. "2 days a week" tab: the full group shows the Full badge and a red "Full" row; tapping it does not select; Continue shows "Please select a group".
3. Review: Group card "Academy Elite — Daily training · Sun, Mon, Tue, Wed, Thu · 5:00 PM - 6:30 PM".
4. Race: filled the group in the DB, then Submit → "Couldn't submit — This group has just filled up. Please choose another group." with **Choose another group** → back on the group step, refetched, the group now Full and deselected.
5. Picked the private group → Continue → Submit → "Registration sent" with a Group row; the registration row in the DB carries `group_id`.

## Notes for the next phase
- Existing groups are typed `daily` by default; clubs should set the real type, days, times and capacity in Groups.
- The simulator's text input is delivered late; tap → wait → type → wait, or taps land in the wrong field.
- The scratch copy for verification lives outside the app folder (the phone's Metro runs from the real folder).
