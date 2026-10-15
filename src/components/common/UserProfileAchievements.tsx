import React, { useState } from 'react';
import {
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  Mic,
  MessageSquare,
  X,
  Zap,
  Info,
  Calendar,
  Target,
  Settings,
} from 'lucide-react';
import { UserProfile, AchievementBadge, BadgeCategory } from '../../types';
import {
  getUserAchievements,
  simulateMilestone,
  syncAchievementsWithMetrics,
} from '../../utils/achievements';
import { getStreakStatus } from '../../utils/streak';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { saveCurrentUser } from '../../utils/storage';
import {
  DAILY_GOAL_PRESETS,
  getDailyGoalProgress,
  updateDailyGoalTarget,
} from '../../utils/dailyGoal';
import { DailyGoalModal } from './DailyGoalModal';

interface UserProfileAchievementsProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onNavigate?: (screen: string) => void;
}

export const UserProfileAchievements: React.FC<UserProfileAchievementsProps> = ({
  user,
  onUpdateUser,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'in_progress'>('all');
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<AchievementBadge | null>(null);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showDailyGoalModal, setShowDailyGoalModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const streakInfo = getStreakStatus(user);
  const dailyProgress = getDailyGoalProgress(user);
  const badges = getUserAchievements(user);
  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === user.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);
  const totalRewardXpEarned = unlockedBadges.reduce((sum, b) => sum + b.rewardXp, 0);

  // Category counts
  const categoryCounts = {
    all: badges.length,
    streak: badges.filter((b) => b.category === 'streak').length,
    vocabulary: badges.filter((b) => b.category === 'vocabulary').length,
    mastery: badges.filter((b) => b.category === 'mastery').length,
    speaking: badges.filter((b) => b.category === 'speaking').length,
  };

  const filteredBadges = badges.filter((b) => {
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (filterMode === 'unlocked' && !b.unlocked) return false;
    if (filterMode === 'in_progress' && b.unlocked) return false;
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleSimulate = (type: '7_day_streak' | '100_words' | 'perfect_lesson') => {
    const { updatedUser, newlyUnlockedBadges } = simulateMilestone(user, type);
    saveCurrentUser(updatedUser);
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    if (newlyUnlockedBadges.length > 0) {
      const names = newlyUnlockedBadges.map((b) => `"${b.title}"`).join(', ');
      showToast(`🏆 Milestone Achieved! Awarded ${names} (+${newlyUnlockedBadges.reduce((s, b) => s + b.rewardXp, 0)} XP)`);
    } else {
      showToast(`Updated! Metric extended toward your next milestone.`);
    }
  };

  const handleSyncAll = () => {
    const synced = syncAchievementsWithMetrics(user);
    saveCurrentUser(synced);
    if (onUpdateUser) {
      onUpdateUser(synced);
    }
    showToast(`Badges successfully synced with current user profile!`);
  };

  const handleUpdateDailyGoal = (targetXp: number) => {
    const updated = updateDailyGoalTarget(user, targetXp);
    saveCurrentUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    showToast(`🎯 Daily Goal updated to ${targetXp} XP / day!`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 px-4 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <Sparkles size={18} className="text-amber-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Overview Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold ring-2 ring-white">
              {targetLang.flag}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                {user.ageGroup.replace(/_/g, ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                CEFR {user.currentCefr}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span>Learning <strong>{targetLang.name}</strong></span>
              <span>·</span>
              <span>Daily Goal: <strong>{user.dailyGoalXp || 100} XP/day</strong> (~{user.dailyGoalMinutes} min)</span>
              <span>·</span>
              <span>Total Mastery: <strong className="text-emerald-700">{user.totalXp} XP</strong></span>
            </p>

            {/* Core Metrics Quick Summary */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              {/* Daily Streak Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border transition-colors ${
                  streakInfo.isCompletedToday
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Flame
                  size={15}
                  className={streakInfo.isCompletedToday ? 'fill-amber-500 text-amber-600' : 'text-amber-600'}
                />
                <span>
                  {streakInfo.currentStreak} Day Streak{' '}
                  {streakInfo.isCompletedToday ? '(Secured Today)' : '(Active)'}
                </span>
              </div>

              {/* Words Learned Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <BrainCircuit size={15} className="text-emerald-600" />
                <span>{user.totalWordsLearned || 35} Words Mastered</span>
              </div>

              {/* Perfect Lessons Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                <Award size={15} className="text-teal-600" />
                <span>{user.perfectLessonsCount || 0} Perfect Lesson Scores</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Simulator Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Zap size={14} className="text-amber-500" />
            <span>{showSimulator ? 'Hide Test Simulator' : 'Test Milestone Unlocks'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Sparkles size={14} className="text-emerald-600" />
            <span>Re-evaluate Badges</span>
          </button>
        </div>
      </div>

      {/* Daily XP Goal Setting Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20">
              <Target size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Daily XP Goal Setting</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {user.dailyGoalXp || 100} XP Target
                </span>
                {dailyProgress.isCompleted && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    🎉 Goal Met Today!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your target learning pace. Complete lessons and activities to fill your daily progress ring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDailyGoalModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Settings size={13} className="text-slate-500" />
              <span>Customize XP</span>
            </button>
          </div>
        </div>

        {/* Goal Preset Quick-Select Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {DAILY_GOAL_PRESETS.map((preset) => {
            const isSelected = (user.dailyGoalXp || 100) === preset.targetXp;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleUpdateDailyGoal(preset.targetXp)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <span className="text-2xl mb-1">{preset.icon}</span>
                <span className="text-xs font-black text-slate-900">{preset.label}</span>
                <span className="text-xs font-black text-emerald-700 mt-0.5">
                  {preset.targetXp} XP
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{preset.estimatedMinutes}</span>
                {isSelected && (
                  <span className="mt-2 text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Active Goal ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Today's Goal Progress Summary Bar */}
        <div className="rounded-xl bg-white p-3 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="text-emerald-600 font-bold">Today's Progress:</span>
            <span>
              <strong>{dailyProgress.earnedToday}</strong> / {dailyProgress.targetXp} XP ({dailyProgress.percentage}%)
            </span>
          </div>
          <div className="w-full sm:w-64 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyProgress.isCompleted
                  ? 'bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${Math.min(100, dailyProgress.percentage)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 shrink-0">
            {dailyProgress.isCompleted
              ? 'Goal Complete!'
              : `${dailyProgress.remainingXp} XP needed today`}
          </span>
        </div>
      </div>

      {/* Collapsible Milestone Testing Simulator */}
      {showSimulator && (
        <div className="rounded-xl bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/40 p-4 border border-amber-200 text-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/80">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Zap size={15} className="text-amber-600" />
              <span>Interactive Milestones & Streak Simulator</span>
            </div>
            <span className="text-[11px] text-amber-800">
              Instantly test and verify achievement badges for 7-day streak, 100 words, and perfect scores
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSimulate('7_day_streak')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Flame size={14} className="fill-white" />
              <span>Simulate '7-Day Streak' (⚡)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('100_words')}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <BrainCircuit size={14} />
              <span>Simulate '100 Words Learned' (💎)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('perfect_lesson')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Award size={14} />
              <span>Simulate 'Perfect Lesson Score' (✨)</span>
            </button>
          </div>
        </div>
      )}

      {/* Milestone Badges Header & Progress Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Achievements & Badges</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                {unlockedBadges.length} / {badges.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Awarded for consecutive daily study, vocabulary growth, flawless accuracy, and communicative courage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">+{totalRewardXpEarned} XP</span>
              <span className="text-[10px] text-slate-400 block">Milestone Rewards</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'unlocked', 'in_progress'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filterMode === mode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'unlocked' ? 'Unlocked' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Badge Completion Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round((unlockedBadges.length / badges.length) * 100)}%` }}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Milestones ({categoryCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('streak')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              selectedCategory === 'streak'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame size={13} className={selectedCategory === 'streak' ? 'fill-white' : 'text-amber-500'} />
            <span>Streak ({categoryCounts.streak})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('vocabulary')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              selectedCategory === 'vocabulary'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit size={13} />
            <span>Vocabulary ({categoryCounts.vocabulary})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('mastery')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              selectedCategory === 'mastery'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award size={13} />
            <span>Mastery & Perfect Scores ({categoryCounts.mastery})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('speaking')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              selectedCategory === 'speaking'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mic size={13} />
            <span>Speaking & Roleplay ({categoryCounts.speaking})</span>
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {filteredBadges.map((badge) => {
            const isHighlight =
              badge.id === 'streak_7' ||
              badge.id === 'words_100' ||
              badge.id === 'perfect_lesson';

            const progressPct = Math.min(
              100,
              Math.round((badge.currentValue / badge.targetValue) * 100)
            );

            return (
              <div
                key={badge.id}
                onClick={() => setActiveBadgeDetail(badge)}
                className={`relative rounded-2xl border p-4.5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                  badge.unlocked
                    ? isHighlight
                      ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-300 ring-1 ring-amber-300/40'
                      : 'bg-white border-emerald-200/90 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row: Icon, Title, and Unlock status */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs transition-transform hover:scale-105 ${
                        badge.unlocked
                          ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white shadow-amber-500/20'
                          : 'bg-slate-200/80 text-slate-400 grayscale'
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/70 text-slate-600 border border-slate-300">
                          <Lock size={11} />
                          <span>In Progress</span>
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-amber-700">
                        +{badge.rewardXp} XP
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {isHighlight && (
                      <span className="text-[10px] uppercase tracking-wide font-extrabold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-md">
                        Core
                      </span>
                    )}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Bottom row: Progress bar & Counter */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-slate-500">
                      {badge.category === 'streak'
                        ? 'Days streak'
                        : badge.category === 'vocabulary'
                        ? 'Words active'
                        : badge.category === 'mastery'
                        ? 'Completed'
                        : 'Completed'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {badge.currentValue} / {badge.targetValue}
                      {badge.unlocked && ' ✓'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.unlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Dialog */}
      {activeBadgeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setActiveBadgeDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-md mb-4 ${
                  activeBadgeDetail.unlocked
                    ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {activeBadgeDetail.icon}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100 text-slate-700">
                <span>{activeBadgeDetail.category} milestone</span>
              </div>

              <h3 className="text-xl font-black text-slate-900">{activeBadgeDetail.title}</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-xs">{activeBadgeDetail.description}</p>

              {/* Progress Detail */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Requirement Target:</span>
                  <span className="font-bold text-slate-900">
                    {activeBadgeDetail.targetValue}{' '}
                    {activeBadgeDetail.category === 'streak'
                      ? 'consecutive days'
                      : activeBadgeDetail.category === 'vocabulary'
                      ? 'active words'
                      : 'completed'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Progress:</span>
                  <span className="font-bold text-slate-900">
                    {activeBadgeDetail.currentValue} / {activeBadgeDetail.targetValue} (
                    {Math.min(
                      100,
                      Math.round(
                        (activeBadgeDetail.currentValue / activeBadgeDetail.targetValue) * 100
                      )
                    )}
                    %)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Mastery Reward:</span>
                  <span className="font-extrabold text-amber-700">
                    +{activeBadgeDetail.rewardXp} XP
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-bold ${
                      activeBadgeDetail.unlocked ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {activeBadgeDetail.unlocked ? '✓ Unlocked' : '⏳ In Progress'}
                  </span>
                </div>
              </div>

              <div className="flex w-full gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveBadgeDetail(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                >
                  Close
                </button>
                {!activeBadgeDetail.unlocked && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBadgeDetail.id.startsWith('streak')) {
                        handleSimulate('7_day_streak');
                      } else if (activeBadgeDetail.id.startsWith('words')) {
                        handleSimulate('100_words');
                      } else {
                        handleSimulate('perfect_lesson');
                      }
                      setActiveBadgeDetail(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    Simulate Achievement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Goal Settings Modal */}
      <DailyGoalModal
        user={user}
        isOpen={showDailyGoalModal}
        onClose={() => setShowDailyGoalModal(false)}
        onSave={handleUpdateDailyGoal}
      />
    </div>
  );
};
