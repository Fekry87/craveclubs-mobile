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
