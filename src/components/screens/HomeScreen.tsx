import React, { useState } from 'react';
import {
  Compass,
  Play,
  BrainCircuit,
  MessageSquare,
  Mic,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Smile,
  Baby,
  GraduationCap,
  Volume2,
  Award,
} from 'lucide-react';
import { UserProfile, LessonUnit, SrsItem } from '../../types';
import { CURRICULUM_LESSONS } from '../../data/curriculum';
import { getStoredSrsItems, isItemDue } from '../../utils/srs';
import { AudioButton } from '../common/AudioButton';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { speakText } from '../../utils/speech';
import { getStreakStatus, getRecentStreakWeek } from '../../utils/streak';
import { UserProfileAchievements } from '../common/UserProfileAchievements';
import { CompetitiveLeaderboard } from '../common/CompetitiveLeaderboard';
import { DailyGoalProgressRing } from '../common/DailyGoalProgressRing';
import { DailyGoalTracker } from '../common/DailyGoalTracker';
import { DailyChallenge } from '../common/DailyChallenge';
import { StreakCelebrationModal } from '../common/StreakCelebrationModal';
import { DailyInsightCard } from '../common/DailyInsightCard';
import { getUserAchievements } from '../../utils/achievements';
import { saveCurrentUser } from '../../utils/storage';
import { LeonardoContextChip } from '../leonardo/LeonardoContextChip';
import { CreditCard } from 'lucide-react';

interface HomeScreenProps {
  currentUser: UserProfile;
  onStartLesson: (lesson: LessonUnit) => void;
  onNavigate: (screen: string) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenPipelines?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onStartLesson,
  onNavigate,
  onUpdateUser,
  onOpenPipelines,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  // Filter lessons relevant to target language and age group
  const availableLessons = CURRICULUM_LESSONS.filter(
    (l) => l.languageId === currentUser.targetLanguage && l.ageSuitability.includes(currentUser.ageGroup)
  );

  // If no language-specific lessons for current age, show language lessons
  const displayLessons = availableLessons.length > 0
    ? availableLessons
    : CURRICULUM_LESSONS.filter((l) => l.languageId === currentUser.targetLanguage);

  const activeLesson = displayLessons[0] || CURRICULUM_LESSONS[0];

  const srsItems = getStoredSrsItems(currentUser.targetLanguage);
  const dueItems = srsItems.filter(isItemDue);

  const streakStatus = getStreakStatus(currentUser);
  const weeklyStreak = getRecentStreakWeek(currentUser);

  // Streak celebration states
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationStreak, setCelebrationStreak] = useState<number>(currentUser.streakDays || 1);
  const [isNewBestStreak, setIsNewBestStreak] = useState<boolean>(false);

  // Trigger streak extension with celebration animation
  const handleTriggerExtendStreak = () => {
    const today = new Date().toISOString().slice(0, 10);
    const prevStreak = currentUser.streakDays || 0;
    const nextStreak = prevStreak + 1;
    const prevBest = currentUser.bestStreak || prevStreak;
    const newBest = Math.max(prevBest, nextStreak);
    const isNewRecord = nextStreak > prevBest;

    const historySet = new Set(currentUser.streakHistory || []);
    historySet.add(today);

    const updated: UserProfile = {
      ...currentUser,
      streakDays: nextStreak,
      bestStreak: newBest,
      lastActiveDate: today,
      streakHistory: Array.from(historySet),
    };

    saveCurrentUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setCelebrationStreak(nextStreak);
    setIsNewBestStreak(isNewRecord);
    setShowCelebration(true);
  };

  // Young Kids Soundboard data (Animals, Colors, Food)
  const [kidsSoundboardCategory, setKidsSoundboardCategory] = useState<'animals' | 'colors' | 'fruits'>('animals');
  const kidsItems = {
    animals: [
      { name: 'El perro 🐶', translation: 'The dog', soundText: 'El perro' },
      { name: 'El gato 🐱', translation: 'The cat', soundText: 'El gato' },
      { name: 'El león 🦁', translation: 'The lion', soundText: 'El león' },
      { name: 'El pájaro 🐦', translation: 'The bird', soundText: 'El pájaro' },
    ],
    colors: [
      { name: 'Rojo 🔴', translation: 'Red', soundText: 'Rojo' },
      { name: 'Azul 🔵', translation: 'Blue', soundText: 'Azul' },
      { name: 'Verde 🟢', translation: 'Green', soundText: 'Verde' },
      { name: 'Amarillo 🟡', translation: 'Yellow', soundText: 'Amarillo' },
    ],
    fruits: [
      { name: 'La manzana 🍎', translation: 'The apple', soundText: 'La manzana' },
      { name: 'El plátano 🍌', translation: 'The banana', soundText: 'El plátano' },
      { name: 'La naranja 🍊', translation: 'The orange', soundText: 'La naranja' },
      { name: 'La fresa 🍓', translation: 'The strawberry', soundText: 'La fresa' },
    ],
  };

  const handleOpenLeonardoWithPrompt = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('open-leonardo', { detail: { prompt } }));
  };

  // 1. YOUNG EXPLORER (Ages 3-5) INTERFACE
  if (currentUser.ageGroup === 'child_3_5') {
    return (
      <div className="min-h-screen bg-amber-50/40 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Friendly Greeting Header */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 sm:p-8 text-white shadow-lg flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Baby size={16} />
                <span>Pip's Play Land</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">¡Hola, {currentUser.name}!</h1>
              <p className="text-sm sm:text-base font-medium opacity-90 mt-1">
                Touch pictures, listen to sounds, and say words with Pip!
              </p>
            </div>
            <div className="text-5xl sm:text-7xl animate-bounce">🐼</div>
          </div>

          {/* Young Kids Pip's Star & Flame Streak Bar */}
          <div className="rounded-3xl bg-white p-5 shadow-md border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs text-2xl">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">
                    {streakStatus.currentStreak} Days of Fun!
                  </span>
                  {streakStatus.isCompletedToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Star Earned Today!
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-amber-800 mt-0.5">
                  {streakStatus.isCompletedToday
                    ? "🌟 Great job! You and Pip got today's play star!"
                    : "Play a game today to earn your shiny daily star!"}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleTriggerExtendStreak}
                    className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 transition-all"
                  >
                    <span>⭐ Extend Play Streak!</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Daily stars */}
            <div className="flex items-center gap-1.5 bg-amber-50/70 p-2 rounded-2xl border border-amber-100">
              {weeklyStreak.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center min-w-[38px] transition-all ${
                    day.isCompleted
                      ? 'bg-amber-400 text-white shadow-2xs scale-105'
                      : day.isToday
                      ? 'bg-white border-2 border-dashed border-amber-300 text-amber-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase">{day.dayName}</span>
                  <span className="text-base my-0.5">{day.isCompleted ? '⭐' : day.isToday ? '⏳' : '⚪'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Daily Goal & Streak Progress Tracker */}
          <DailyGoalTracker
            user={currentUser}
            onUpdateUser={onUpdateUser}
            onStartLesson={() => onStartLesson(activeLesson)}
            onNavigate={onNavigate}
            onExtendStreak={(newStreak) => {
              setCelebrationStreak(newStreak);
              setIsNewBestStreak(newStreak > (currentUser.bestStreak || 0));
              setShowCelebration(true);
            }}
          />

          {/* Time-Bound Daily Challenge Mini-Game */}
          <DailyChallenge
            user={currentUser}
            onUpdateUser={onUpdateUser}
            onCelebrationTrigger={(streak) => {
              setCelebrationStreak(streak);
              setIsNewBestStreak(streak > (currentUser.bestStreak || 0));
              setShowCelebration(true);
            }}
          />

          {/* Leonardo Explorer Companion */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-300/80 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">🐬</span>
              <div>
                <p className="text-xs font-black text-emerald-950">Leonardo is Ready to Play!</p>
                <p className="text-[11px] text-emerald-800">Ask Pip's dolphin buddy to tell animal stories or practice sounds.</p>
              </div>
            </div>
            <LeonardoContextChip
              label="Talk with Leonardo"
              contextPrompt={`Hi Leonardo! I am practicing ${currentLang?.name || 'languages'} today. Can you teach me a fun animal word?`}
              onClick={handleOpenLeonardoWithPrompt}
            />
          </div>

          {/* Big Tap to Play Daily Activity Card */}
          <div className="rounded-3xl bg-white p-6 shadow-md border-2 border-amber-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Today's Story Game</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">{activeLesson.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{activeLesson.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartLesson(activeLesson)}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
              >
                <Play size={24} className="fill-white" />
                <span>Play Lesson!</span>
              </button>
            </div>
          </div>

          {/* Interactive Soundboard for Young Kids */}
          <div className="rounded-3xl bg-white p-6 shadow-md border-2 border-emerald-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Touch & Listen Soundboard</h3>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['animals', 'colors', 'fruits'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setKidsSoundboardCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      kidsSoundboardCategory === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {kidsItems[kidsSoundboardCategory].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => speakText(item.soundText, currentUser.targetLanguage, { slow: true })}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-95 text-center group"
                >
                  <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.name.slice(-2)}</span>
                  <span className="text-sm font-bold text-slate-900">{item.name.slice(0, -2)}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{item.translation}</span>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Volume2 size={13} />
                    <span>Hear Sound</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pip's Daily Star & XP Goal Progress Ring */}
          <DailyGoalProgressRing
            user={currentUser}
            onUpdateUser={onUpdateUser}
            onStartLesson={() => onStartLesson(activeLesson)}
            size={130}
          />

          {/* Pip's Star Badges & Stickers Board */}
          <div className="rounded-3xl bg-white p-6 shadow-md border-2 border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⭐</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Pip's Star Badges & Stickers</h3>
                  <p className="text-xs text-amber-800">Earn stars for playing every day, listening, and saying words!</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 self-start sm:self-center">
                {currentUser.streakDays >= 7 ? '⭐ 7-Day Star Master' : `${currentUser.streakDays}/7 Days to Giant Star`}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                currentUser.streakDays >= 3
                  ? 'border-amber-300 bg-amber-50/80'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}>
                <div className="text-3xl mb-1">🔥</div>
                <div className="text-xs font-black text-slate-900">3-Day Play Streak</div>
                <div className="text-[10px] text-amber-800 mt-0.5">
                  {currentUser.streakDays >= 3 ? '✓ Star Unlocked!' : `${currentUser.streakDays}/3 days`}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                currentUser.streakDays >= 7
                  ? 'border-amber-300 bg-amber-50/80'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}>
                <div className="text-3xl mb-1">⚡</div>
                <div className="text-xs font-black text-slate-900">7-Day Star Streak</div>
                <div className="text-[10px] text-amber-800 mt-0.5">
                  {currentUser.streakDays >= 7 ? '✓ Star Unlocked!' : `${currentUser.streakDays}/7 days`}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                (currentUser.perfectLessonsCount || 0) >= 1
                  ? 'border-emerald-300 bg-emerald-50/80'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}>
                <div className="text-3xl mb-1">✨</div>
                <div className="text-xs font-black text-slate-900">Perfect Play Star</div>
                <div className="text-[10px] text-emerald-800 mt-0.5">
                  {(currentUser.perfectLessonsCount || 0) >= 1 ? '✓ Star Unlocked!' : '0/1 games'}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                (currentUser.totalWordsLearned || 0) >= 10
                  ? 'border-teal-300 bg-teal-50/80'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}>
                <div className="text-3xl mb-1">🌱</div>
                <div className="text-xs font-black text-slate-900">Word Explorer</div>
                <div className="text-[10px] text-teal-800 mt-0.5">
                  {(currentUser.totalWordsLearned || 0) >= 10 ? '✓ Star Unlocked!' : `${currentUser.totalWordsLearned || 0}/10 words`}
                </div>
              </div>
            </div>
          </div>

          {/* Friendly Explorer League & Leaderboard */}
          <CompetitiveLeaderboard
            currentUser={currentUser}
            onStartLesson={() => onStartLesson(activeLesson)}
            onNavigate={onNavigate}
          />

          {/* Celebratory Streak Extension Modal */}
          <StreakCelebrationModal
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
            streakCount={celebrationStreak}
            isNewBest={isNewBestStreak}
            bestStreak={currentUser.bestStreak}
            userName={currentUser.name}
          />
        </div>
      </div>
    );
  }

  // 2. JUNIOR / TEEN / ADULT INTERFACE
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Hero & Daily Goal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{currentLang.flag} Learning {currentLang.name}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-bold">Estimated CEFR {currentUser.currentCefr}</span>
                <span aria-hidden="true">·</span>
                <span>Goal: {currentUser.dailyGoalMinutes} min/day</span>
                <span aria-hidden="true">·</span>
                <span className={`inline-flex items-center gap-1 font-bold ${streakStatus.isCompletedToday ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <Flame size={14} className={streakStatus.isCompletedToday ? 'text-amber-600 fill-amber-500' : 'text-amber-600'} />
                  <span>{streakStatus.currentStreak}d Streak {streakStatus.isCompletedToday ? '(Secured)' : '(Active)'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                Welcome back, {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {currentUser.learningGoal}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-leonardo'));
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all hover:scale-102 active:scale-98"
                title="Open Leonardo 1,000-Agent AI Assistant"
              >
                <span className="text-sm">🐬</span>
                <span>Ask Leonardo AI</span>
                <Sparkles size={14} className="text-cyan-200 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tutor')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
              >
                <MessageSquare size={16} className="text-emerald-600" />
                <span>AI Tutor Roleplay</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('pronunciation')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
              >
                <Mic size={16} className="text-emerald-600" />
                <span>Speech Lab</span>
              </button>
            </div>
          </div>

          {/* Leonardo Coordinated Intelligence Banner */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/70 to-cyan-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                🐬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Leonardo AI Companion</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white uppercase tracking-wider">
                    10 Divisions · 1,000 Agents
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Need an explanation, pronunciation comparison, or custom learning plan for {currentLang.name}?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-leonardo'));
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-400 text-emerald-800 font-bold text-xs shadow-2xs hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} className="text-emerald-600" />
                <span>Open Assistant</span>
              </button>
            </div>
          </div>

          {/* Visual Daily Goal & Streak Progress Tracker */}
          <div className="mt-6">
            <DailyGoalTracker
              user={currentUser}
              onUpdateUser={onUpdateUser}
              onStartLesson={() => onStartLesson(activeLesson)}
              onNavigate={onNavigate}
              onExtendStreak={(newStreak) => {
                setCelebrationStreak(newStreak);
                setIsNewBestStreak(newStreak > (currentUser.bestStreak || 0));
                setShowCelebration(true);
              }}
            />
          </div>

          {/* Time-Bound Interactive Daily Challenge Mini-Game */}
          <div className="mt-6">
            <DailyChallenge
              user={currentUser}
              onUpdateUser={onUpdateUser}
              onCelebrationTrigger={(streak) => {
                setCelebrationStreak(streak);
                setIsNewBestStreak(streak > (currentUser.bestStreak || 0));
                setShowCelebration(true);
              }}
            />
          </div>

          {/* Leonardo 1,000-Agent Coordinated Intelligence Hub */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 p-5 text-white shadow-md border border-emerald-800/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐬</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
                    Leonardo · 1,000-Agent Intelligence Hub
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">10 Specialized Teams</span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Your central interactive intelligence for {currentLang?.name || 'language'} learning. Ask for CEFR grammar breakdowns, minimal pair acoustic analysis, simulated roleplays, or personalized study plans.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenLeonardoWithPrompt()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles size={14} />
                <span>Open Leonardo</span>
              </button>
            </div>

            {/* Quick Context Prompt Chips */}
            <div className="mt-4 pt-3 border-t border-emerald-900/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-emerald-300/80 font-medium">Quick Consult:</span>
              <LeonardoContextChip
                label={`Explain ${currentLang?.name || 'Target'} Grammar`}
                contextPrompt={`Can you break down the essential grammar rules for ${currentLang?.name || 'my target language'} at CEFR ${currentUser.currentCefr} level with clear examples?`}
                onClick={handleOpenLeonardoWithPrompt}
                className="bg-white/10 text-emerald-200 border-emerald-500/30 hover:bg-white/20"
              />
              <LeonardoContextChip
                label="Phonetic Coaching"
                contextPrompt={`What are the hardest sounds or minimal pairs in ${currentLang?.name || 'my target language'} for a ${currentUser.nativeLanguage || 'English'} speaker?`}
                onClick={handleOpenLeonardoWithPrompt}
                className="bg-white/10 text-emerald-200 border-emerald-500/30 hover:bg-white/20"
              />
              <LeonardoContextChip
                label="Personalized Study Plan"
                contextPrompt={`Based on my current level ${currentUser.currentCefr} and daily streak of ${currentUser.streakDays || 1} days, recommend my optimized study schedule.`}
                onClick={handleOpenLeonardoWithPrompt}
                className="bg-white/10 text-emerald-200 border-emerald-500/30 hover:bg-white/20"
              />
              <LeonardoContextChip
                label="Lead Bank & App Support"
                contextPrompt="How does the Lead Bank checking transfer work, and how can I verify my subscription?"
                onClick={handleOpenLeonardoWithPrompt}
                className="bg-white/10 text-emerald-200 border-emerald-500/30 hover:bg-white/20"
              />
            </div>
          </div>

          {/* Today's Recommended 15-Minute Session Card */}
          <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-900 to-teal-900 p-6 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Recommended Today
                  </span>
                  <span className="text-xs text-emerald-200/60">·</span>
                  <span className="text-xs text-emerald-200 flex items-center gap-1">
                    <Clock size={13} /> {activeLesson.estimatedMinutes} minutes
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">{activeLesson.title}</h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  {activeLesson.description}
                </p>

                {/* Plain-Language Recommendation Rationale */}
                <div className="pt-2 text-xs text-emerald-200/90 flex items-start gap-2 bg-white/10 p-2.5 rounded-lg">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-300" />
                  <span>
                    <strong>Why this lesson today:</strong> Based on your recent practice, focusing on practical café requests and formal courtesy softens speech and boosts spontaneous conversational confidence.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onStartLesson(activeLesson)}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 group text-sm"
              >
                <Play size={18} className="fill-slate-950" />
                <span>Start Daily Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Free Tier Upgrade Banner (Only shown if on Free plan) */}
        {(currentUser.subscriptionTier === 'free' || !currentUser.subscriptionTier) && (
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Special Explorer Offer · Save 35%</span>
              </div>
              <h3 className="text-lg font-extrabold">Accelerate Fluency with Speak Dolphin Pro</h3>
              <p className="text-xs text-emerald-100 max-w-xl">
                Unlock unlimited AI conversation tutor dialogues, phoneme-level speech acoustic feedback, all 10 languages, and monthly streak freeze shields.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('subscription')}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-emerald-950 font-bold rounded-xl text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
            >
              <CreditCard size={15} />
              <span>View Plans & Upgrade</span>
            </button>
          </div>
        )}

        {/* Verified Daily Linguistic Digest & Word of the Day */}
        <DailyInsightCard
          languageId={currentUser.targetLanguage}
          onOpenPipelines={onOpenPipelines}
        />

        {/* 3 Pillars Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spaced Repetition Due Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <BrainCircuit size={20} />
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {dueItems.length} Due Today
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Spaced Repetition (SRS)</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                SuperMemo SM-2 algorithm queues vocabulary right when memory retention is at optimal retrieval threshold.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('srs')}
              className="mt-6 flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Review {dueItems.length} vocabulary cards</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive Stories Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <BookOpen size={20} />
                </div>
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  Branching Stories
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-World Roleplays</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Step into branching cultural situations: tapas bars in Seville, missed luggage at Charles de Gaulle, and local train navigation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('stories')}
              className="mt-6 flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Explore Interactive Stories</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Pronunciation & Listening Lab Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Mic size={20} />
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  Acoustic Lab
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Speech & Listening Lab</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Train your ear with slow 0.75x audio, minimal-pair distinctions ("pero" vs "perro"), and microphone waveform shadowing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pronunciation')}
              className="mt-6 flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Practice Pronunciation</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Learner Profile & Milestone Achievements Showcase */}
        <UserProfileAchievements
          user={currentUser}
          onUpdateUser={onUpdateUser}
          onNavigate={onNavigate}
        />

        {/* Competitive Leaderboard Showcase */}
        <CompetitiveLeaderboard
          currentUser={currentUser}
          onStartLesson={() => onStartLesson(activeLesson)}
          onNavigate={onNavigate}
        />

        {/* Available Curriculum Units List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Curriculum Units</h3>
              <p className="text-xs text-slate-500">Structured practical language milestones</p>
            </div>
            <span className="text-xs text-slate-400">{displayLessons.length} units available</span>
          </div>

          <div className="space-y-3">
            {displayLessons.map((lesson) => {
              const isCompleted = currentUser.completedLessonIds.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lesson.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{lesson.title}</span>
                        {isCompleted && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{lesson.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>{lesson.estimatedMinutes} min</span>
                        <span>·</span>
                        <span>{lesson.exercises.length} interactive exercises</span>
                        <span>·</span>
                        <span>Grammar: {lesson.grammarFocus.ruleTitle}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartLesson(lesson)}
                    className="self-start sm:self-center px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Celebratory Streak Extension Modal */}
      <StreakCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        streakCount={celebrationStreak}
        isNewBest={isNewBestStreak}
        bestStreak={currentUser.bestStreak}
        userName={currentUser.name}
      />
    </div>
  );
};
