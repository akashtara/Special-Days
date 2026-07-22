import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { intervalToDuration, formatDuration, isBefore } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateTimeElapsed(startDate: Date) {
  const now = new Date();
  if (isBefore(now, startDate)) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFuture: true
    };
  }

  const duration = intervalToDuration({
    start: startDate,
    end: now,
  });

  return {
    years: duration.years || 0,
    months: duration.months || 0,
    days: duration.days || 0,
    hours: duration.hours || 0,
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0,
    isFuture: false
  };
}

export function calculateTimeDifference(targetDate: Date) {
  const now = new Date();
  const isPast = isBefore(targetDate, now);
  
  const duration = intervalToDuration({
    start: isPast ? targetDate : now,
    end: isPast ? now : targetDate,
  });

  return {
    ...duration,
    isPast
  };
}
