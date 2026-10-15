import { UserProfile } from '../types';

/**
 * Returns today's local date as 'YYYY-MM-DD'
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates calendar days difference between two 'YYYY-MM-DD' strings.
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates current streak status without mutating state.
 */
export function getStreakStatus(user: UserProfile): {
  currentStreak: number;
  bestStreak: number;
  isCompletedToday: boolean;
  isStreakAtRisk: boolean;
  statusMessage: string;
} {
  const today = getLocalDateString();
  const lastActive = user.lastActiveDate;
  const rawStreak = user.streakDays || 0;
  const bestStreak = Math.max(user.bestStreak || rawStreak, rawStreak);

  if (!lastActive) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      isCompletedToday: false,
      isStreakAtRisk: false,
      statusMessage: 'Start your streak today by completing your first lesson!',
    };
  }

  const diffDays = getDaysDifference(lastActive, today);

  if (diffDays === 0) {
    // Completed today
    return {
      currentStreak: rawStreak,
      bestStreak,
      isCompletedToday: true,
      isStreakAtRisk: false,
      statusMessage: `Streak secured for today! You're on a ${rawStreak}-day roll.`,
    };
  } else if (diffDays === 1) {
    // Completed yesterday, waiting for today
    return {
      currentStreak: rawStreak,
      bestStreak,
      isCompletedToday: false,
      isStreakAtRisk: true,
      statusMessage: `Complete a lesson today to extend your streak to ${rawStreak + 1} days!`,
    };
  } else {
    // Missed yesterday or earlier
    return {
      currentStreak: 0,
      bestStreak,
      isCompletedToday: false,
      isStreakAtRisk: false,
      statusMessage: 'Complete a lesson today to ignite a brand new streak!',
    };
  }
}

/**
 * Updates user profile streak when a lesson is successfully completed.
 */
export function updateStreakOnLessonComplete(user: UserProfile): {
  updatedUser: UserProfile;
  streakIncreased: boolean;
  isFirstToday: boolean;
  currentStreak: number;
} {
  const today = getLocalDateString();
  const lastActive = user.lastActiveDate;
  let newStreak = user.streakDays || 0;
  let streakIncreased = false;
  let isFirstToday = false;

  const existingHistory = new Set(user.streakHistory || []);
  if (user.lastActiveDate) {
    existingHistory.add(user.lastActiveDate);
  }

  if (lastActive === today) {
    // Already completed a lesson today; maintain current streak count
    existingHistory.add(today);
  } else {
    isFirstToday = true;
    const diffDays = getDaysDifference(lastActive, today);

    if (diffDays === 1) {
      // Consecutive day!
      newStreak += 1;
      streakIncreased = true;
    } else {
      // Streak lapsed or first time
      newStreak = 1;
      streakIncreased = true;
    }
    existingHistory.add(today);
  }

  const bestStreak = Math.max(user.bestStreak || newStreak, newStreak);

  const updatedUser: UserProfile = {
    ...user,
    streakDays: newStreak,
    lastActiveDate: today,
    bestStreak,
    streakHistory: Array.from(existingHistory),
  };

  return {
    updatedUser,
    streakIncreased,
    isFirstToday,
    currentStreak: newStreak,
  };
}

export interface DayStreakItem {
  dayName: string;
  shortDate: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
}

/**
 * Returns a 7-day calendar window (last 6 days + today, or Mon-Sun current week)
 */
export function getRecentStreakWeek(user: UserProfile): DayStreakItem[] {
  const today = new Date();
  const historySet = new Set(user.streakHistory || []);
  if (user.lastActiveDate) {
    historySet.add(user.lastActiveDate);
  }

  const days: DayStreakItem[] = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Last 7 days ending with today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = dayLabels[d.getDay()];
    const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;
    const isToday = i === 0;
    const isCompleted = historySet.has(dateStr);

    days.push({
      dayName,
      shortDate,
      dateStr,
      isCompleted,
      isToday,
    });
  }

  return days;
}

export interface CalculatedStreakInfo {
  currentStreak: number;
  bestStreak: number;
  isCompletedToday: boolean;
  isStreakAtRisk: boolean;
  consecutiveDays: number;
  totalDaysLearned: number;
  daysUntilReset: number;
  timeRemainingFormatted: string;
  nextMilestone: {
    targetDays: number;
    title: string;
    remainingDays: number;
    progressPercentage: number;
  };
  streakMessage: string;
}

export function getTimeRemainingInDay(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  formatted: string;
} {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours,
    minutes,
    seconds,
    totalMinutes: Math.floor(diffMs / 60000),
    formatted: `${hours}h ${minutes}m`,
  };
}

export function calculateUserStreak(user: UserProfile): CalculatedStreakInfo {
  const today = getLocalDateString();
  const lastActive = user.lastActiveDate;
  const rawStreak = user.streakDays || 0;
  const bestStreak = Math.max(user.bestStreak || rawStreak, rawStreak);
  const historySet = new Set(user.streakHistory || []);
  if (lastActive) historySet.add(lastActive);

  const totalDaysLearned = historySet.size;
  const timeRemaining = getTimeRemainingInDay();

  let isCompletedToday = false;
  let isStreakAtRisk = false;
  let currentStreak = rawStreak;
  let streakMessage = '';

  if (!lastActive) {
    currentStreak = 0;
    isCompletedToday = false;
    isStreakAtRisk = false;
    streakMessage = 'Start your streak today by completing your first lesson!';
  } else {
    const diffDays = getDaysDifference(lastActive, today);
    if (diffDays === 0) {
      isCompletedToday = true;
      isStreakAtRisk = false;
      currentStreak = Math.max(1, rawStreak);
      streakMessage = `Streak locked in for today! You're on a ${currentStreak}-day learning streak.`;
    } else if (diffDays === 1) {
      isCompletedToday = false;
      isStreakAtRisk = true;
      currentStreak = rawStreak;
      streakMessage = `Practice today to keep your streak alive! ${timeRemaining.formatted} left.`;
    } else {
      isCompletedToday = false;
      isStreakAtRisk = false;
      currentStreak = 0;
      streakMessage = 'Ignite a brand-new daily learning streak today!';
    }
  }

  // Calculate milestones
  const milestones = [
    { days: 3, title: '3-Day Spark' },
    { days: 7, title: '7-Day Habit Builder' },
    { days: 14, title: '14-Day Momentum' },
    { days: 30, title: '30-Day Master' },
    { days: 50, title: '50-Day Fluency Explorer' },
    { days: 100, title: '100-Day Legend' },
    { days: 365, title: '365-Day Polyglot' },
  ];

  const nextMilestoneDef = milestones.find((m) => m.days > currentStreak) || {
    days: currentStreak + 10,
    title: `${currentStreak + 10}-Day Milestone`,
  };

  const prevMilestoneDays = milestones.slice().reverse().find((m) => m.days <= currentStreak)?.days || 0;
  const span = Math.max(1, nextMilestoneDef.days - prevMilestoneDays);
  const currentInSpan = currentStreak - prevMilestoneDays;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((currentInSpan / span) * 100)));

  return {
    currentStreak,
    bestStreak,
    isCompletedToday,
    isStreakAtRisk,
    consecutiveDays: currentStreak,
    totalDaysLearned,
    daysUntilReset: 1,
    timeRemainingFormatted: timeRemaining.formatted,
    nextMilestone: {
      targetDays: nextMilestoneDef.days,
      title: nextMilestoneDef.title,
      remainingDays: Math.max(1, nextMilestoneDef.days - currentStreak),
      progressPercentage,
    },
    streakMessage,
  };
}
