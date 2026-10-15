import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  MessageSquare,
  Mic,
  Settings,
  Plus,
  Zap,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  getDailyGoalProgress,
  recordTodayPractice,
  updateDailyGoalMinutes,
  updateDailyGoalLessons,
  updateDailyGoalTarget,
} from '../../utils/dailyGoal';
import {
  calculateUserStreak,
  getRecentStreakWeek,
  getTimeRemainingInDay,
} from '../../utils/streak';
import { saveCurrentUser } from '../../utils/storage';
import { DailyGoalModal } from './DailyGoalModal';

interface DailyGoalTrackerProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onStartLesson?: () => void;
  onNavigate?: (screen: string) => void;
  onExtendStreak?: (newStreak: number) => void;
  size?: number;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  user,
  onUpdateUser,
  onStartLesson,
  onNavigate,
  onExtendStreak,
  size = 148,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [liveTimeRemaining, setLiveTimeRemaining] = useState(getTimeRemainingInDay());
  const [activeMetricTab, setActiveMetricTab] = useState<'time' | 'lessons' | 'xp'>('time');

  // Live timer tick every minute to keep countdown accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimeRemaining(getTimeRemainingInDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const progress = getDailyGoalProgress(user);
  const streakInfo = calculateUserStreak(user);
  const weeklyStreak = getRecentStreakWeek(user);

  const {
    targetMinutes,
    spentMinutes,
    remainingMinutes,
    timePercentage,
    isTimeGoalCompleted,
    targetLessons,
    completedLessonsToday,
    remainingLessons,
    lessonsPercentage,
    isLessonsGoalCompleted,
    targetXp,
    earnedToday,
    remainingXp,
    percentage: xpPercentage,
    isCompleted: isXpCompleted,
  } = progress;

  // SVG Ring Geometry
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const currentDisplayPercentage =
    activeMetricTab === 'time'
      ? timePercentage
      : activeMetricTab === 'lessons'
      ? lessonsPercentage
      : xpPercentage;

  const strokeDashoffset = circumference - (Math.min(100, currentDisplayPercentage) / 100) * circumference;

  const isCurrentMetricCompleted =
    activeMetricTab === 'time'
      ? isTimeGoalCompleted
      : activeMetricTab === 'lessons'
      ? isLessonsGoalCompleted
      : isXpCompleted;

  // Handle quick practice time logging
  const handleLogPracticeMinutes = (minutes: number, xp?: number, lessons?: number) => {
    const { updatedUser, justCompletedGoal, streakSecured } = recordTodayPractice(
      user,
      minutes,
      xp,
      lessons
    );
    saveCurrentUser(updatedUser);
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    if ((justCompletedGoal || streakSecured) && onExtendStreak) {
      onExtendStreak(updatedUser.streakDays);
    }
    setShowLogMenu(false);
  };

  const handleQuickGoalMinutesChange = (newMinutes: number) => {
    const updated = updateDailyGoalMinutes(user, newMinutes);
    saveCurrentUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  const handleQuickGoalLessonsChange = (newLessons: number) => {
    const updated = updateDailyGoalLessons(user, newLessons);
    saveCurrentUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  const isTodayGoalMetOverall = isTimeGoalCompleted || isLessonsGoalCompleted || isXpCompleted;

  return (
    <>
      <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs overflow-hidden transition-all">
        {/* Glow accent on goal completion */}
        {isTimeGoalCompleted && (
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        )}

        {/* 1. Header with Title, Mode Switcher & Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Target size={16} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Daily Goal & Streak Tracker
              </h2>
              {isCurrentMetricCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={13} />
                  Target Met
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">
                  {currentDisplayPercentage}% completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>
                Target:{' '}
                <strong className="text-slate-800">
                  {activeMetricTab === 'time'
                    ? `${targetMinutes} mins/day`
                    : activeMetricTab === 'lessons'
                    ? `${targetLessons} lessons/day`
                    : `${targetXp} XP/day`}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Reset in <strong className="text-slate-700">{liveTimeRemaining.formatted}</strong></span>
            </div>
          </div>

          {/* Interactive Metric Toggle & Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Metric Tab Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveMetricTab('time')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeMetricTab === 'time'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Time ({spentMinutes}/{targetMinutes}m)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetricTab('lessons')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeMetricTab === 'lessons'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lessons ({completedLessonsToday}/{targetLessons})
              </button>
              <button
                type="button"
                onClick={() => setActiveMetricTab('xp')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeMetricTab === 'xp'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                XP ({earnedToday}/{targetXp})
              </button>
            </div>

            {/* Adjust Goal Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Adjust your daily learning goal target"
              aria-label="Adjust daily learning target"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* 2. Main Tracker Body: Visual Ring + Remaining Time Banner + Streak Insights */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Visual Progress Ring */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
            <div className="relative flex items-center justify-center shrink-0">
              <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                  <linearGradient id="timeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="timeRingSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>

                {/* Background Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Progress Arc */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={isCurrentMetricCompleted ? 'url(#timeRingSuccess)' : 'url(#timeRingGradient)'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Ring Metric Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                {activeMetricTab === 'time' && (
                  <>
                    {isTimeGoalCompleted ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1">
                        ✓
                      </div>
                    ) : (
                      <Clock size={16} className="text-emerald-600 mb-0.5" />
                    )}
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {spentMinutes}m
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-1">
                      of {targetMinutes}m goal
                    </span>
                  </>
                )}

                {activeMetricTab === 'lessons' && (
                  <>
                    {isLessonsGoalCompleted ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1">
                        ✓
                      </div>
                    ) : (
                      <BookOpen size={16} className="text-teal-600 mb-0.5" />
                    )}
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {completedLessonsToday}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-1">
                      of {targetLessons} {targetLessons === 1 ? 'lesson' : 'lessons'}
                    </span>
                  </>
                )}

                {activeMetricTab === 'xp' && (
                  <>
                    {isXpCompleted ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1">
                        ✓
                      </div>
                    ) : (
                      <Sparkles size={16} className="text-amber-500 mb-0.5" />
                    )}
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {earnedToday}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-1">
                      of {targetXp} XP
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Target Presets Pills */}
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 font-medium mr-1">Target:</span>
              {activeMetricTab === 'time' &&
                [10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleQuickGoalMinutesChange(mins)}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      targetMinutes === mins
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}

              {activeMetricTab === 'lessons' &&
                [1, 2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleQuickGoalLessonsChange(cnt)}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      targetLessons === cnt
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cnt} {cnt === 1 ? 'lesson' : 'lessons'}
                  </button>
                ))}

              {activeMetricTab === 'xp' &&
                [30, 50, 100, 150].map((xp) => (
                  <button
                    key={xp}
                    type="button"
                    onClick={() => {
                      const updated = updateDailyGoalTarget(user, xp);
                      saveCurrentUser(updated);
                      if (onUpdateUser) onUpdateUser(updated);
                    }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      targetXp === xp
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {xp} XP
                  </button>
                ))}
            </div>
          </div>

          {/* Middle & Right Columns: Remaining Time & Streak Calculation */}
          <div className="lg:col-span-8 space-y-4">
            {/* Remaining Highlight Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isCurrentMetricCompleted
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200/90 text-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isCurrentMetricCompleted ? (
                      <span className="text-emerald-700 font-bold text-sm sm:text-base flex items-center gap-1.5">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        Today's Language Goal Achieved!
                      </span>
                    ) : (
                      <span className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                        {activeMetricTab === 'lessons' ? (
                          <BookOpen size={18} className="text-emerald-600" />
                        ) : (
                          <Clock size={18} className="text-emerald-600" />
                        )}
                        <strong>
                          {activeMetricTab === 'lessons'
                            ? `${remainingLessons} lesson${remainingLessons === 1 ? '' : 's'} remaining`
                            : activeMetricTab === 'xp'
                            ? `${remainingXp} XP remaining`
                            : `${remainingMinutes} minutes remaining`}
                        </strong>{' '}
                        to hit today's target
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isCurrentMetricCompleted ? (
                      <span>
                        Outstanding commitment! You've reached your daily {activeMetricTab} milestone.
                        Your streak is secured for today!
                      </span>
                    ) : (
                      <span>
                        {activeMetricTab === 'lessons'
                          ? `You have finished ${completedLessonsToday} of ${targetLessons} lessons. Complete ${remainingLessons} more to maintain your streak!`
                          : activeMetricTab === 'xp'
                          ? `You have earned ${earnedToday} of ${targetXp} XP today. Keep going!`
                          : `You have completed ${spentMinutes} of ${targetMinutes} minutes today. A quick lesson or AI conversation will seal today's streak!`}
                      </span>
                    )}
                  </p>
                </div>

                {/* Progress Bar & Quick Action */}
                <div className="shrink-0 flex items-center gap-2">
                  {onStartLesson && (
                    <button
                      type="button"
                      onClick={onStartLesson}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Play size={13} className="fill-white" />
                      <span>{isCurrentMetricCompleted ? 'Practice More' : 'Continue Lesson'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Daily Progress</span>
                  <span>
                    {activeMetricTab === 'lessons'
                      ? `${completedLessonsToday} / ${targetLessons} lessons (${lessonsPercentage}%)`
                      : activeMetricTab === 'xp'
                      ? `${earnedToday} / ${targetXp} XP (${xpPercentage}%)`
                      : `${spentMinutes} / ${targetMinutes} min (${timePercentage}%)`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCurrentMetricCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, currentDisplayPercentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak Calculation & 7-Day Consistency Row */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
                    <Flame size={18} className="fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        {streakInfo.currentStreak} Day Streak
                      </span>
                      {streakInfo.isCompletedToday ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Secured Today
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          At Risk · Practice to Extend
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Personal Best: <strong className="text-slate-800">{streakInfo.bestStreak} days</strong></span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Total Active: <strong className="text-slate-800">{streakInfo.totalDaysLearned} days</strong></span>
                    </div>
                  </div>
                </div>

                {/* Next Milestone Tag */}
                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-500 font-medium">Next Milestone: </span>
                  <strong className="text-slate-900">{streakInfo.nextMilestone.title}</strong>
                  <div className="text-[11px] text-amber-700 font-semibold">
                    {streakInfo.nextMilestone.remainingDays} day{streakInfo.nextMilestone.remainingDays === 1 ? '' : 's'} away
                  </div>
                </div>
              </div>

              {/* 7-Day Visual Mini Calendar Strip */}
              <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1">
                {weeklyStreak.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all ${
                      day.isToday
                        ? 'bg-amber-50/80 border border-amber-300'
                        : 'bg-slate-50/80 border border-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {day.dayName}
                    </span>
                    <div className="my-1 flex h-6 w-6 items-center justify-center">
                      {day.isCompleted ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-2xs">
                          <Flame size={12} className="fill-white" />
                        </div>
                      ) : day.isToday ? (
                        <div className="h-5 w-5 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] text-amber-700 font-black">
                          •
                        </div>
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{day.shortDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice Shortcuts & Time Logger */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Quick Practice:</span>
                {onNavigate && (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('tutor')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare size={13} className="text-emerald-600" />
                      <span>5m AI Tutor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('pronunciation')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Mic size={13} className="text-teal-600" />
                      <span>3m Speech Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('srs')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Zap size={13} className="text-indigo-600" />
                      <span>2m Flashcards</span>
                    </button>
                  </>
                )}
              </div>

              {/* Log Practice / Offline Time Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLogMenu(!showLogMenu)}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Log offline practice or conversational time"
                >
                  <Plus size={13} className="text-slate-500" />
                  <span>Log Practice Time</span>
                </button>

                {showLogMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-white border border-slate-200 p-2 shadow-lg z-20 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Log Today's Practice
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLogPracticeMinutes(15, 60, 1)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={12} className="text-emerald-700" />
                        <span>+1 Lesson Completed</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">+60 XP</span>
                    </button>
                    {[
                      { mins: 5, label: '+5 minutes', xp: 30 },
                      { mins: 10, label: '+10 minutes', xp: 60 },
                      { mins: 15, label: '+15 minutes', xp: 100 },
                    ].map((item) => (
                      <button
                        key={item.mins}
                        type="button"
                        onClick={() => handleLogPracticeMinutes(item.mins, item.xp)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-bold">+{item.xp} XP</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Adjustment Modal */}
      <DailyGoalModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(newXp) => {
          const updated = updateDailyGoalTarget(user, newXp);
          saveCurrentUser(updated);
          if (onUpdateUser) {
            onUpdateUser(updated);
          }
        }}
      />
    </>
  );
};
