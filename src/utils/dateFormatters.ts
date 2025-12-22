import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to "MMM d, yyyy" (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format date with time to "MMM d, yyyy h:mm a" (e.g., "Jan 15, 2024 2:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

/**
 * Format date relative to now (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
