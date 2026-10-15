import { UserProfile, AchievementBadge, BadgeCategory } from '../types';
import { getStoredSrsItems } from './storage';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  targetValue: number;
  rewardXp: number;
  getValue: (user: UserProfile) => number;
}

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  // Streak Milestones
  {
    id: 'streak_3',
    title: 'Three is a Habit',
    description: 'Maintain a 3-day consecutive learning streak.',
    category: 'streak',
    icon: '🔥',
    targetValue: 3,
    rewardXp: 50,
    getValue: (user) => Math.max(user.streakDays || 0, user.bestStreak || 0),
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Reach a full 7-day consecutive streak of active learning.',
    category: 'streak',
    icon: '⚡',
    targetValue: 7,
    rewardXp: 150,
    getValue: (user) => Math.max(user.streakDays || 0, user.bestStreak || 0),
  },
  {
    id: 'streak_14',
    title: 'Fortnight of Fluency',
    description: 'Keep your flame alive for 14 uninterrupted days.',
    category: 'streak',
    icon: '🌟',
    targetValue: 14,
    rewardXp: 300,
    getValue: (user) => Math.max(user.streakDays || 0, user.bestStreak || 0),
  },
  {
    id: 'streak_30',
    title: 'Monthly Dedication',
    description: 'Complete lessons for 30 consecutive days.',
    category: 'streak',
    icon: '👑',
    targetValue: 30,
    rewardXp: 750,
    getValue: (user) => Math.max(user.streakDays || 0, user.bestStreak || 0),
  },

  // Vocabulary Milestones
  {
    id: 'words_10',
    title: 'Word Builder',
    description: 'Add at least 10 active vocabulary items to your spaced repetition bank.',
    category: 'vocabulary',
    icon: '🌱',
    targetValue: 10,
    rewardXp: 50,
    getValue: (user) => {
      const srsCount = getStoredSrsItems(user.targetLanguage).length;
      return Math.max(user.totalWordsLearned || 0, srsCount);
    },
  },
  {
    id: 'words_50',
    title: 'Conversational Core',
    description: 'Expand your vocabulary bank to 50 active expressions.',
    category: 'vocabulary',
    icon: '📚',
    targetValue: 50,
    rewardXp: 200,
    getValue: (user) => {
      const srsCount = getStoredSrsItems().length;
      return Math.max(user.totalWordsLearned || 0, srsCount);
    },
  },
  {
    id: 'words_100',
    title: '100 Words Learned',
    description: 'Master 100 words and phrases in your target language.',
    category: 'vocabulary',
    icon: '💎',
    targetValue: 100,
    rewardXp: 500,
    getValue: (user) => {
      const srsCount = getStoredSrsItems().length;
      return Math.max(user.totalWordsLearned || 0, srsCount);
    },
  },

  // Lesson & Score Mastery Milestones
  {
    id: 'first_lesson',
    title: 'First Step Forward',
    description: 'Complete your very first interactive curriculum lesson.',
    category: 'mastery',
    icon: '🎯',
    targetValue: 1,
    rewardXp: 50,
    getValue: (user) => (user.completedLessonIds || []).length,
  },
  {
    id: 'perfect_lesson',
    title: 'Perfect Lesson Score',
    description: 'Complete a full lesson with a 100% flawless score on first attempt.',
    category: 'mastery',
    icon: '✨',
    targetValue: 1,
    rewardXp: 150,
    getValue: (user) => user.perfectLessonsCount || 0,
  },
  {
    id: 'three_perfect_lessons',
    title: 'Triple Perfection',
    description: 'Achieve 3 perfect lesson scores across any curriculum units.',
    category: 'mastery',
    icon: '🏆',
    targetValue: 3,
    rewardXp: 350,
    getValue: (user) => user.perfectLessonsCount || 0,
  },

  // Speaking & Interactive Milestones
  {
    id: 'first_roleplay',
    title: 'Conversationalist',
    description: 'Complete a real-world roleplay dialogue with the AI Tutor.',
    category: 'speaking',
    icon: '💬',
    targetValue: 1,
    rewardXp: 100,
    getValue: (user) => user.roleplayConversationsCount || 0,
  },
  {
    id: 'voice_shadow_master',
    title: 'Acoustic Shadowing',
    description: 'Record speech and evaluate pronunciation in the Speech Lab.',
    category: 'speaking',
    icon: '🎙️',
    targetValue: 1,
    rewardXp: 100,
    getValue: (user) => user.voiceRecordingsCount || 0,
  },

  // Daily Challenge Milestones
  {
    id: 'first_daily_challenge',
    title: 'Daily Challenger',
    description: 'Conquer your first time-bound Daily Challenge reflex sprint.',
    category: 'mastery',
    icon: '⚡',
    targetValue: 1,
    rewardXp: 100,
    getValue: (user) => user.dailyChallengesWonCount || (user.dailyChallengeCompletedDate ? 1 : 0),
  },
  {
    id: 'speed_reflex_champion',
    title: 'Reflex Champion',
    description: 'Score 400+ points in a single Daily Challenge sprint.',
    category: 'mastery',
    icon: '🏆',
    targetValue: 400,
    rewardXp: 200,
    getValue: (user) => user.dailyChallengeHighScore || 0,
  },
];

/**
 * Returns all achievement badges evaluated against the user's current metrics.
 */
export function getUserAchievements(user: UserProfile): AchievementBadge[] {
  const unlockedSet = new Set(user.unlockedBadgeIds || []);

  return ACHIEVEMENTS_CATALOG.map((def) => {
    const rawVal = def.getValue(user);
    const currentValue = Math.min(def.targetValue, rawVal);
    const isUnlocked = unlockedSet.has(def.id) || rawVal >= def.targetValue;

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      icon: def.icon,
      currentValue,
      targetValue: def.targetValue,
      unlocked: isUnlocked,
      rewardXp: def.rewardXp,
    };
  });
}

/**
 * Checks for newly unlocked achievements and returns updated UserProfile
 */
export function evaluateAndAwardAchievements(
  user: UserProfile,
  extraMetrics?: {
    isPerfectLesson?: boolean;
    incrementRoleplay?: boolean;
    incrementVoiceRecording?: boolean;
    wordsCountOverride?: number;
  }
): {
  updatedUser: UserProfile;
  newlyUnlockedBadges: AchievementBadge[];
} {
  const currentUnlocked = new Set(user.unlockedBadgeIds || []);
  let perfectLessonsCount = user.perfectLessonsCount || 0;
  let roleplayConversationsCount = user.roleplayConversationsCount || 0;
  let voiceRecordingsCount = user.voiceRecordingsCount || 0;
  let totalWordsLearned = user.totalWordsLearned || 0;

  if (extraMetrics?.isPerfectLesson) {
    perfectLessonsCount += 1;
  }
  if (extraMetrics?.incrementRoleplay) {
    roleplayConversationsCount += 1;
  }
  if (extraMetrics?.incrementVoiceRecording) {
    voiceRecordingsCount += 1;
  }
  if (extraMetrics?.wordsCountOverride) {
    totalWordsLearned = Math.max(totalWordsLearned, extraMetrics.wordsCountOverride);
  } else {
    const srsCount = getStoredSrsItems().length;
    totalWordsLearned = Math.max(totalWordsLearned, srsCount);
  }

  const intermediateUser: UserProfile = {
    ...user,
    perfectLessonsCount,
    roleplayConversationsCount,
    voiceRecordingsCount,
    totalWordsLearned,
  };

  const newlyUnlockedBadges: AchievementBadge[] = [];
  let addedXp = 0;

  for (const def of ACHIEVEMENTS_CATALOG) {
    const alreadyUnlocked = currentUnlocked.has(def.id);
    const val = def.getValue(intermediateUser);

    if (!alreadyUnlocked && val >= def.targetValue) {
      currentUnlocked.add(def.id);
      addedXp += def.rewardXp;
      newlyUnlockedBadges.push({
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        currentValue: def.targetValue,
        targetValue: def.targetValue,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        rewardXp: def.rewardXp,
      });
    }
  }

  const updatedUser: UserProfile = {
    ...intermediateUser,
    totalXp: intermediateUser.totalXp + addedXp,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  return {
    updatedUser,
    newlyUnlockedBadges,
  };
}

/**
 * Reconciles and awards any badges whose numerical criteria are satisfied
 * but might not yet be recorded in user's unlockedBadgeIds.
 */
export function syncAchievementsWithMetrics(user: UserProfile): UserProfile {
  const { updatedUser } = evaluateAndAwardAchievements(user);
  return updatedUser;
}

/**
 * Convenience helper to simulate/demonstrate milestone achievement unlocks:
 * - '7_day_streak': boosts streak to at least 7 days
 * - '100_words': sets total words learned to at least 100
 * - 'perfect_lesson': increments perfect lesson score count
 */
export function simulateMilestone(
  user: UserProfile,
  type: '7_day_streak' | '100_words' | 'perfect_lesson'
): {
  updatedUser: UserProfile;
  newlyUnlockedBadges: AchievementBadge[];
} {
  if (type === '7_day_streak') {
    const updatedStreak = Math.max((user.streakDays || 0) + 1, 7);
    const updatedUserWithStreak: UserProfile = {
      ...user,
      streakDays: updatedStreak,
      bestStreak: Math.max(user.bestStreak || 0, updatedStreak),
    };
    return evaluateAndAwardAchievements(updatedUserWithStreak);
  } else if (type === '100_words') {
    const updatedWords = Math.max((user.totalWordsLearned || 0) + 25, 100);
    return evaluateAndAwardAchievements(user, {
      wordsCountOverride: updatedWords,
    });
  } else {
    return evaluateAndAwardAchievements(user, {
      isPerfectLesson: true,
    });
  }
}
