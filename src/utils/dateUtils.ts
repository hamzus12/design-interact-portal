
import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Format a date as a relative time (e.g., "5 minutes ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Format a date using a specified format
 */
export const formatDate = (
  dateString: string,
  formatString: string = 'PPP'
): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for display in a form input
 */
export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format a timestamp (Unix or ISO) as a relative time
 */
export const formatTimeAgo = (timestamp: string | number): string => {
  try {
    let date: Date;
    
    if (typeof timestamp === 'string') {
      // Try to parse as ISO date string
      date = parseISO(timestamp);
    } else {
      // Assume Unix timestamp (milliseconds)
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs === 1) return '1 Hr Ago';
    if (diffHrs < 24) return `${diffHrs} Hrs Ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 30) return `${diffDays} Days Ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 Month Ago';
    return `${diffMonths} Months Ago`;
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Unknown time';
  }
};
