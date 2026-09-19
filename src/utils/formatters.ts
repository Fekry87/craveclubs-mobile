import i18n from '../i18n';

/**
 * Locale-aware date parts. We format dates by hand (rather than
 * `toLocaleDateString`) so the output is identical on iOS and Android/Hermes,
 * and so Arabic uses Arabic month/weekday names with **Western numerals** —
 * matching the numerals the rest of the app already shows (XP, times, ratings).
 * Dates are day-first in Arabic (the natural reading order).
 */
const isArabic = (): boolean => (i18n.language || 'en').startsWith('ar');

const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WEEKDAYS_LONG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_INITIALS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_INITIALS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

/** Localized short month name for a 0-indexed month. */
export const monthShort = (monthIndex: number): string =>
  (isArabic() ? MONTHS_AR : MONTHS_SHORT_EN)[monthIndex] ?? '';

/** Localized "September 2026" / "سبتمبر 2026" (0-indexed month). */
export const monthYearLabel = (year: number, monthIndex: number): string =>
  `${(isArabic() ? MONTHS_AR : MONTHS_LONG_EN)[monthIndex] ?? ''} ${year}`;

/** Localized full weekday name for a `getDay()` index (0 = Sunday). */
export const weekdayLong = (dayOfWeek: number): string =>
  (isArabic() ? WEEKDAYS_AR : WEEKDAYS_LONG_EN)[dayOfWeek] ?? '';

/** Single-letter weekday for compact charts (0 = Sunday). */
export const weekdayInitial = (dayOfWeek: number): string =>
  (isArabic() ? DAY_INITIALS_AR : DAY_INITIALS_EN)[dayOfWeek] ?? '';

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  const dow = d.getDay();
  if (isArabic()) return `${WEEKDAYS_AR[dow]}، ${day} ${MONTHS_AR[m]} ${y}`;
  return `${WEEKDAYS_SHORT_EN[dow]}, ${MONTHS_SHORT_EN[m]} ${day}, ${y}`;
};

export const formatShortDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const m = d.getMonth();
  return isArabic() ? `${day} ${MONTHS_AR[m]}` : `${MONTHS_SHORT_EN[m]} ${day}`;
};

/** "Sep 24, 2026" / "24 سبتمبر 2026" — dates where the year matters (DOB, plan end, member since) */
export const formatMediumDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  return isArabic() ? `${day} ${MONTHS_AR[m]} ${y}` : `${MONTHS_SHORT_EN[m]} ${day}, ${y}`;
};

/** "24 Sep 2026" / "24 سبتمبر 2026" — day-first, for evaluation/notification rows. */
export const formatDayMonthYear = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  return isArabic() ? `${day} ${MONTHS_AR[m]} ${y}` : `${day} ${MONTHS_SHORT_EN[m]} ${y}`;
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const pm = hour >= 12;
  const meridiem = isArabic() ? (pm ? 'م' : 'ص') : pm ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${meridiem}`;
};

export const formatTimeRange = (start: string, end: string): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

/**
 * "Sun, Tue, Thu · 5:00 PM - 6:30 PM" for a group; the days alone, the times
 * alone, or '' when the club set neither.
 */
export const groupSchedule = (group: {
  days_of_week_labels: string[];
  start_time: string | null;
  end_time: string | null;
}): string => {
  const days = group.days_of_week_labels.join(', ');
  const times =
    group.start_time && group.end_time ? formatTimeRange(group.start_time, group.end_time) : '';
  return [days, times].filter(Boolean).join(' · ');
};

/** "2h", "1h 30m", "45m" (Arabic: "2س", "1س 30د", "45د") — session lengths. */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes == null || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ar = isArabic();
  const hUnit = ar ? 'س' : 'h';
  const mUnit = ar ? 'د' : 'm';
  if (h === 0) return `${m}${mUnit}`;
  return m === 0 ? `${h}${hUnit}` : `${h}${hUnit} ${m}${mUnit}`;
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return '0%';
  return `${Math.round(value)}%`;
};

export const formatRating = (value: number | null | undefined): string => {
  if (value == null) return '0.0';
  return value.toFixed(1);
};

/**
 * Difference in whole calendar days between `dateStr` and today (negative =
 * past). Language-independent — use it instead of comparing the localized
 * output of getRelativeDate against 'Today'/'Yesterday'/'Tomorrow'.
 */
export const relativeDayDiff = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date();
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dateOnly.getTime() - nowOnly.getTime()) / (1000 * 60 * 60 * 24));
};

export const getRelativeDate = (dateStr: string): string => {
  const diffDays = relativeDayDiff(dateStr);

  if (diffDays === 0) return i18n.t('relative.today', { ns: 'common' });
  if (diffDays === 1) return i18n.t('relative.tomorrow', { ns: 'common' });
  if (diffDays === -1) return i18n.t('relative.yesterday', { ns: 'common' });

  // Show actual date: "25 Feb 2026" / "25 فبراير 2026"
  return formatDayMonthYear(dateStr);
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Currency for the whole app. The market is Saudi Arabia, so prices are SAR.
 * Two screens used to hardcode "EGP", which is simply the wrong country.
 */
export const CURRENCY = 'SAR';

export const formatMoney = (value: number | string | null | undefined): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (amount === null || amount === undefined || Number.isNaN(amount)) return `0 ${CURRENCY}`;

  return `${amount.toLocaleString()} ${CURRENCY}`;
};

/**
 * The price a member actually pays for a plan.
 *
 * `price` is the list price and `discount_percent` is a real reduction on it. The server
 * sends `final_price` already computed — never re-derive it here, or this screen drifts
 * from the portal and from what the member is billed. The fallback only covers an older
 * API that predates the field.
 */
export const planPrice = (plan: {
  price: string | number;
  discount_percent?: number;
  final_price?: number | null;
}): number => {
  if (plan.final_price !== null && plan.final_price !== undefined) return Number(plan.final_price);

  const list = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;

  return (list || 0) * (1 - (plan.discount_percent || 0) / 100);
};

/** The device's local calendar date as YYYY-MM-DD (not UTC). */
export const localDateString = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * A swim time in seconds as it is read on a pool deck: "32.45s" under a
 * minute, "1:35.30" from a minute up. The API sends the seconds as a string.
 */
export const formatSwimTime = (seconds: number | string): string => {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return '—';
  // Whole hundredths first, so 119.999 reads 2:00.00 and never 1:60.00.
  const centis = Math.round(total * 100);
  if (centis < 6000) return `${(centis / 100).toFixed(2)}s`;
  const minutes = Math.floor(centis / 6000);
  return `${minutes}:${((centis - minutes * 6000) / 100).toFixed(2).padStart(5, '0')}`;
};

/** "50m" from the API's "50.00"; falls back to the option's own name. */
export const formatDistance = (
  distance: { name: string; numeric_value: string | null } | null,
): string => {
  if (!distance) return '—';
  const meters = Number(distance.numeric_value);
  return distance.numeric_value !== null && Number.isFinite(meters)
    ? `${meters}m`
    : distance.name;
};
