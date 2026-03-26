import { EvaluationInterface, DailyRatingType } from '../types/models.types';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Format a Date as "YYYY-MM-DD" */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Normalize any date string to "YYYY-MM-DD".
 * Handles: "2026-02-23", "2026-02-23 06:00:00", ISO timestamps, etc.
 */
function normalizeDate(dateStr: string): string {
  // If already YYYY-MM-DD (10 chars), use directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Take the first 10 characters (YYYY-MM-DD portion)
  const prefix = dateStr.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(prefix)) return prefix;
  // Fallback: parse as Date
  const d = new Date(dateStr);
  return toDateString(d);
}

/** Get today as "YYYY-MM-DD" */
function todayString(): string {
  return toDateString(new Date());
}

/**
 * Build a DailyRatingType for every day in the given month,
 * mapping evaluations by session.date and created_at.
 */
export function buildDailyRatings(
  evaluations: EvaluationInterface[],
  year: number,
  month: number, // 0-indexed (JS Date convention)
): DailyRatingType[] {
  const today = todayString();

  // Group evaluations by date — try session.date first, then created_at
  const evalsByDate = new Map<string, number[]>();
  for (const ev of evaluations) {
    const dateKey = normalizeDate(ev.session?.date || ev.created_at);
    const existing = evalsByDate.get(dateKey);
    if (existing) {
      existing.push(ev.rating);
    } else {
      evalsByDate.set(dateKey, [ev.rating]);
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DailyRatingType[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = toDateString(d);
    const ratings = evalsByDate.get(dateStr);
    const avgRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

    days.push({
      date: dateStr,
      dayNumber: day,
      dayLabel: DAY_LABELS[d.getDay()],
      rating: avgRating,
      count: ratings ? ratings.length : 0,
      isToday: dateStr === today,
      isCurrentMonth: true,
    });
  }

  return days;
}

/**
 * Group daily ratings into Mon–Sun weeks.
 * Pads first/last week with days from adjacent months.
 */
export function groupIntoWeeks(
  dailyRatings: DailyRatingType[],
  year: number,
  month: number,
): DailyRatingType[][] {
  if (dailyRatings.length === 0) return [];

  const today = todayString();

  // Get day of week for the 1st of the month (0=Sun … 6=Sat)
  const firstDayDow = new Date(year, month, 1).getDay();
  // Convert to Mon-based: Mon=0, Tue=1, ..., Sun=6
  const monBasedFirst = firstDayDow === 0 ? 6 : firstDayDow - 1;

  // Build padding days before the 1st (from previous month)
  const padBefore: DailyRatingType[] = [];
  for (let i = monBasedFirst - 1; i >= 0; i--) {
    const d = new Date(year, month, -i); // goes into previous month
    padBefore.push({
      date: toDateString(d),
      dayNumber: d.getDate(),
      dayLabel: DAY_LABELS[d.getDay()],
      rating: null,
      count: 0,
      isToday: toDateString(d) === today,
      isCurrentMonth: false,
    });
  }

  // Build padding days after the last day (to fill final week to Sun)
  const lastDay = new Date(year, month + 1, 0);
  const lastDayDow = lastDay.getDay();
  const monBasedLast = lastDayDow === 0 ? 6 : lastDayDow - 1;
  const padAfterCount = monBasedLast === 6 ? 0 : 6 - monBasedLast;

  const padAfter: DailyRatingType[] = [];
  for (let i = 1; i <= padAfterCount; i++) {
    const d = new Date(year, month + 1, i);
    padAfter.push({
      date: toDateString(d),
      dayNumber: d.getDate(),
      dayLabel: DAY_LABELS[d.getDay()],
      rating: null,
      count: 0,
      isToday: toDateString(d) === today,
      isCurrentMonth: false,
    });
  }

  const allDays = [...padBefore, ...dailyRatings, ...padAfter];

  // Split into weeks of 7
  const weeks: DailyRatingType[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Find the week index that contains today,
 * or the last week if today is outside the target month.
 */
export function getInitialWeekIndex(weeks: DailyRatingType[][]): number {
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].some((d) => d.isToday)) return i;
  }
  // Default to last week
  return Math.max(weeks.length - 1, 0);
}

/**
 * Format month name from year/month.
 */
export function formatMonthYear(year: number, month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[month]} ${year}`;
}
