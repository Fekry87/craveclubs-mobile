export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/** "May 11, 2014" — for dates where the year matters (DOB, plan end, member since) */
export const formatMediumDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
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

/** "2h", "1h 30m", "45m" — session lengths. */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes == null || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return '0%';
  return `${Math.round(value)}%`;
};

export const formatRating = (value: number | null | undefined): string => {
  if (value == null) return '0.0';
  return value.toFixed(1);
};

export const getRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();

  // Compare by calendar day (not time)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = dateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  // Show actual date: "25 Feb 2026"
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
