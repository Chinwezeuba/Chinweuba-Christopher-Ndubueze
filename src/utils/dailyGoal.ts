import { UserProfile } from '../types';
import { getLocalDateString, getTimeRemainingInDay } from './streak';

export { getLocalDateString, getTimeRemainingInDay };

export interface DailyGoalPreset {
  id: string;
  targetXp: number;
  label: string;
  sublabel: string;
  icon: string;
  estimatedMinutes: string;
  recommendedFor: string;
}

export const DAILY_GOAL_PRESETS: DailyGoalPreset[] = [
  {
    id: 'casual',
    targetXp: 30,
    label: 'Casual',
    sublabel: '1 lesson or quick review',
    icon: '🌱',
    estimatedMinutes: '5-10 min/day',
    recommendedFor: 'Light brush-up on busy days',
  },
  {
    id: 'steady',
    targetXp: 50,
    label: 'Steady',
    sublabel: '1-2 lessons + vocab SRS',
    icon: '⚡',
    estimatedMinutes: '10-15 min/day',
    recommendedFor: 'Building a consistent foundation',
  },
  {
    id: 'regular',
    targetXp: 100,
    label: 'Regular',
    sublabel: '2-3 lessons + AI roleplay',
    icon: '🎯',
    estimatedMinutes: '15-20 min/day',
    recommendedFor: 'Recommended for steady fluency growth',
  },
  {
    id: 'dedicated',
    targetXp: 150,
    label: 'Dedicated',
    sublabel: '3-4 lessons + speech shadowing',
    icon: '🔥',
    estimatedMinutes: '25-30 min/day',
    recommendedFor: 'Fast-track preparation for travel or work',
  },
  {
    id: 'champion',
    targetXp: 200,
    label: 'Champion',
    sublabel: 'Comprehensive immersion',
    icon: '👑',
    estimatedMinutes: '35-45 min/day',
    recommendedFor: 'Intensive CEFR advancement',
  },
];

export interface DailyGoalProgress {
  targetXp: number;
  earnedToday: number;
  percentage: number;
  remainingXp: number;
  isCompleted: boolean;
  overachievementXp: number;
  isToday: boolean;
  // Time-based target metrics
  targetMinutes: number;
  spentMinutes: number;
  remainingMinutes: number;
  timePercentage: number;
  isTimeGoalCompleted: boolean;
  timeRemainingFormatted: string;
  // Lesson-based target metrics
  targetLessons: number;
  completedLessonsToday: number;
  remainingLessons: number;
  lessonsPercentage: number;
  isLessonsGoalCompleted: boolean;
}

/**
 * Returns current daily goal progress (XP, time spent, and lessons completed), handling rollover gracefully.
 */
export function getDailyGoalProgress(user: UserProfile): DailyGoalProgress {
  const today = getLocalDateString();
  const targetXp = Math.max(10, user.dailyGoalXp || 100);
  const targetMinutes = Math.max(5, user.dailyGoalMinutes || 15);
  const targetLessons = Math.max(1, user.dailyGoalLessons || 2);

  // If user earned XP/lessons on a previous date, reset to 0 for today
  const isDateToday = user.dailyXpDate === today;
  const earnedToday = isDateToday ? Math.max(0, user.dailyXpEarnedToday || 0) : 0;
  const spentMinutes = Math.max(0, user.dailyTimeSpentTodayMinutes || 0);
  const completedLessonsToday = isDateToday ? Math.max(0, user.dailyLessonsCompletedToday || 0) : 0;

  const percentage = Math.min(100, Math.round((earnedToday / targetXp) * 100));
  const remainingXp = Math.max(0, targetXp - earnedToday);
  const isCompleted = earnedToday >= targetXp;
  const overachievementXp = isCompleted ? earnedToday - targetXp : 0;

  const timePercentage = Math.min(100, Math.round((spentMinutes / targetMinutes) * 100));
  const remainingMinutes = Math.max(0, targetMinutes - spentMinutes);
  const isTimeGoalCompleted = spentMinutes >= targetMinutes;

  const lessonsPercentage = Math.min(100, Math.round((completedLessonsToday / targetLessons) * 100));
  const remainingLessons = Math.max(0, targetLessons - completedLessonsToday);
  const isLessonsGoalCompleted = completedLessonsToday >= targetLessons;

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hoursRemaining = Math.floor(diffMs / 3600000);
  const minsRemaining = Math.floor((diffMs % 3600000) / 60000);
  const timeRemainingFormatted = `${hoursRemaining}h ${minsRemaining}m`;

  return {
    targetXp,
    earnedToday,
    percentage,
    remainingXp,
    isCompleted,
    overachievementXp,
    isToday: isDateToday,
    targetMinutes,
    spentMinutes,
    remainingMinutes,
    timePercentage,
    isTimeGoalCompleted,
    timeRemainingFormatted,
    targetLessons,
    completedLessonsToday,
    remainingLessons,
    lessonsPercentage,
    isLessonsGoalCompleted,
  };
}

/**
 * Updates user profile with a new Daily XP Goal target.
 */
export function updateDailyGoalTarget(user: UserProfile, newTargetXp: number): UserProfile {
  const safeTarget = Math.max(10, Math.min(1000, Math.round(newTargetXp)));
  const today = getLocalDateString();
  
  // Keep daily minutes roughly aligned (~1 min per 5-7 XP)
  const estimatedMins = Math.max(5, Math.min(120, Math.round(safeTarget / 6)));

  return {
    ...user,
    dailyGoalXp: safeTarget,
    dailyGoalMinutes: user.dailyGoalMinutes || estimatedMins,
    dailyXpDate: user.dailyXpDate || today,
    dailyXpEarnedToday: user.dailyXpDate === today ? (user.dailyXpEarnedToday || 0) : 0,
  };
}

/**
 * Updates user profile daily target minutes.
 */
export function updateDailyGoalMinutes(user: UserProfile, targetMinutes: number): UserProfile {
  const safeMinutes = Math.max(5, Math.min(180, Math.round(targetMinutes)));
  return {
    ...user,
    dailyGoalMinutes: safeMinutes,
  };
}

/**
 * Updates user profile daily target lessons completed.
 */
export function updateDailyGoalLessons(user: UserProfile, targetLessons: number): UserProfile {
  const safeLessons = Math.max(1, Math.min(20, Math.round(targetLessons)));
  return {
    ...user,
    dailyGoalLessons: safeLessons,
  };
}

/**
 * Records practice time (minutes), XP, and completed lessons towards today's goal, extending streaks if goal met.
 */
export function recordTodayPractice(
  user: UserProfile,
  minutesToAdd: number,
  xpToAdd?: number,
  lessonsToAdd?: number
): {
  updatedUser: UserProfile;
  justCompletedGoal: boolean;
  progress: DailyGoalProgress;
  streakSecured: boolean;
} {
  const today = getLocalDateString();
  const safeMinutes = Math.max(0, Math.round(minutesToAdd));
  const calculatedXp = typeof xpToAdd === 'number' ? xpToAdd : Math.max(10, safeMinutes * 6);
  const safeLessons = Math.max(0, Math.round(lessonsToAdd || 0));

  const prevSpent = user.dailyTimeSpentTodayMinutes || 0;
  const newSpent = prevSpent + safeMinutes;
  const targetMinutes = user.dailyGoalMinutes || 15;
  const wasTimeGoalMet = prevSpent >= targetMinutes;
  const isTimeGoalMet = newSpent >= targetMinutes;

  const previousEarnedXp = user.dailyXpDate === today ? (user.dailyXpEarnedToday || 0) : 0;
  const newEarnedXp = previousEarnedXp + calculatedXp;
  const targetXp = user.dailyGoalXp || 100;
  const wasXpGoalMet = previousEarnedXp >= targetXp;
  const isXpGoalMet = newEarnedXp >= targetXp;

  const previousLessons = user.dailyXpDate === today ? (user.dailyLessonsCompletedToday || 0) : 0;
  const newLessons = previousLessons + safeLessons;
  const targetLessons = user.dailyGoalLessons || 2;
  const wasLessonsGoalMet = previousLessons >= targetLessons;
  const isLessonsGoalMet = newLessons >= targetLessons;

  const justCompletedGoal =
    (!wasTimeGoalMet && isTimeGoalMet) ||
    (!wasXpGoalMet && isXpGoalMet) ||
    (!wasLessonsGoalMet && isLessonsGoalMet);

  // Update streak if today wasn't recorded yet
  const historySet = new Set(user.streakHistory || []);
  historySet.add(today);

  let newStreak = user.streakDays || 0;
  let streakSecured = false;

  if (user.lastActiveDate !== today) {
    newStreak += 1;
    streakSecured = true;
  }

  const bestStreak = Math.max(user.bestStreak || newStreak, newStreak);

  const updatedUser: UserProfile = {
    ...user,
    dailyTimeSpentTodayMinutes: newSpent,
    dailyXpEarnedToday: newEarnedXp,
    dailyLessonsCompletedToday: newLessons,
    dailyXpDate: today,
    totalXp: user.totalXp + calculatedXp,
    lastActiveDate: today,
    streakDays: newStreak,
    bestStreak,
    streakHistory: Array.from(historySet),
  };

  const progress = getDailyGoalProgress(updatedUser);

  return {
    updatedUser,
    justCompletedGoal,
    progress,
    streakSecured,
  };
}

/**
 * Adds XP earned today towards the user's daily goal and total XP.
 */
export function recordTodayXp(
  user: UserProfile,
  addedXp: number
): {
  updatedUser: UserProfile;
  justCompletedGoal: boolean;
  progress: DailyGoalProgress;
} {
  const today = getLocalDateString();
  const targetXp = Math.max(10, user.dailyGoalXp || 100);

  const previousEarned = user.dailyXpDate === today ? (user.dailyXpEarnedToday || 0) : 0;
  const newEarnedToday = previousEarned + Math.max(0, addedXp);
  const wasAlreadyCompleted = previousEarned >= targetXp;
  const isNowCompleted = newEarnedToday >= targetXp;
  const justCompletedGoal = !wasAlreadyCompleted && isNowCompleted;

  const updatedUser: UserProfile = {
    ...user,
    totalXp: user.totalXp + Math.max(0, addedXp),
    dailyGoalXp: targetXp,
    dailyXpEarnedToday: newEarnedToday,
    dailyXpDate: today,
  };

  const progress = getDailyGoalProgress(updatedUser);

  return {
    updatedUser,
    justCompletedGoal,
    progress,
  };
}
