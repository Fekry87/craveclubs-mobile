import type { Coach, Group } from '../api/services/registration.service';

/*
 * The plan's training type decides which groups, and therefore which coaches,
 * a swimmer can register into. A group is "open" when it is that type, has a
 * coach, and still has a spot (no capacity = always open).
 */

export const isOpenGroup = (group: Group): boolean =>
  !group.is_full && group.coach_user_id != null;

/** The open groups of one training type. */
export const openGroupsOfType = (groups: Group[], type: string | null | undefined): Group[] =>
  type ? groups.filter((g) => g.group_type === type && isOpenGroup(g)) : [];

/** Training types that have at least one open group. */
export const typesWithOpenGroups = (groups: Group[]): Set<string> =>
  new Set(groups.filter(isOpenGroup).map((g) => g.group_type));

/**
 * Whether this coach has an open group of the type. A coaches list without
 * `user_id` (an older backend) can't be matched, so nobody is hidden then —
 * the group step still shows the truth.
 */
export const coachHasOpenGroup = (
  groups: Group[],
  type: string | null | undefined,
  coach: Pick<Coach, 'user_id'>,
): boolean =>
  coach.user_id == null ||
  openGroupsOfType(groups, type).some((g) => g.coach_user_id === coach.user_id);

/** The coaches who have an open group of the type, in the list's order. */
export const coachesWithOpenGroups = (coaches: Coach[], groups: Group[], type: string | null | undefined): Coach[] =>
  coaches.filter((c) => coachHasOpenGroup(groups, type, c));
