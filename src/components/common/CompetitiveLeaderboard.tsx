import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus,
  Sparkles,
  Crown,
  Medal,
  Users,
  Clock,
  ArrowRight,
  Shield,
  Star,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { DEFAULT_PROFILES } from '../../utils/storage';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  targetLanguage: string;
  ageGroup: string;
  totalXp: number;
  streakDays: number;
  currentCefr: string;
  rankDelta?: number; // positive = climbed, negative = dropped, 0 = same
  league: 'Diamond' | 'Ruby' | 'Emerald' | 'Sapphire';
  isCurrentUser?: boolean;
}

// Competitive peer community roster
const COMMUNITY_LEADERS: Omit<LeaderboardUser, 'isCurrentUser'>[] = [
  {
    id: 'peer-mateo',
    name: 'Mateo Silva',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'es',
    ageGroup: 'adult_18_plus',
    totalXp: 1940,
    streakDays: 19,
    currentCefr: 'B2',
    rankDelta: 2,
    league: 'Diamond',
  },
  {
    id: 'peer-sarah',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'de',
    ageGroup: 'adult_18_plus',
    totalXp: 1680,
    streakDays: 15,
    currentCefr: 'B1',
    rankDelta: 1,
    league: 'Diamond',
  },
  {
    id: 'peer-kenji',
    name: 'Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'ja',
    ageGroup: 'adult_18_plus',
    totalXp: 1450,
    streakDays: 14,
    currentCefr: 'B1',
    rankDelta: -1,
    league: 'Ruby',
  },
  {
    id: 'peer-maya',
    name: 'Maya Zhang',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'fr',
    ageGroup: 'teen_13_17',
    totalXp: 1320,
    streakDays: 12,
    currentCefr: 'A2',
    rankDelta: 3,
    league: 'Ruby',
  },
  {
    id: 'peer-amara',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'fr',
    ageGroup: 'adult_18_plus',
    totalXp: 1180,
    streakDays: 10,
    currentCefr: 'A2',
    rankDelta: 0,
    league: 'Emerald',
  },
  {
    id: 'peer-lucas',
    name: 'Lucas Dubois',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'it',
    ageGroup: 'adult_18_plus',
    totalXp: 960,
    streakDays: 8,
    currentCefr: 'A2',
    rankDelta: -1,
    league: 'Emerald',
  },
  {
    id: 'peer-sofia',
    name: 'Sofia Rossi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'de',
    ageGroup: 'adult_18_plus',
    totalXp: 780,
    streakDays: 7,
    currentCefr: 'A1',
    rankDelta: 1,
    league: 'Sapphire',
  },
  {
    id: 'peer-oliver',
    name: 'Oliver Hansen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    targetLanguage: 'es',
    ageGroup: 'teen_13_17',
    totalXp: 640,
    streakDays: 5,
    currentCefr: 'A1',
    rankDelta: -2,
    league: 'Sapphire',
  },
];

interface CompetitiveLeaderboardProps {
  currentUser: UserProfile;
  onStartLesson?: () => void;
  onNavigate?: (screen: string) => void;
}

export const CompetitiveLeaderboard: React.FC<CompetitiveLeaderboardProps> = ({
  currentUser,
  onStartLesson,
  onNavigate,
}) => {
  const [rankingMetric, setRankingMetric] = useState<'xp' | 'streak' | 'power'>('xp');
  const [filterScope, setFilterScope] = useState<'all' | 'target_lang'>('all');
  const [timeframe, setTimeframe] = useState<'weekly' | 'all_time'>('weekly');

  // Merge current user with peer leaders
  const rankedUsers = useMemo(() => {
    // Current user representation
    const currentUserItem: LeaderboardUser = {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      avatar: currentUser.avatar,
      targetLanguage: currentUser.targetLanguage,
      ageGroup: currentUser.ageGroup,
      totalXp: currentUser.totalXp,
      streakDays: currentUser.streakDays || 0,
      currentCefr: currentUser.currentCefr,
      rankDelta: 1,
      league:
        currentUser.totalXp >= 1500
          ? 'Diamond'
          : currentUser.totalXp >= 1000
          ? 'Ruby'
          : currentUser.totalXp >= 600
          ? 'Emerald'
          : 'Sapphire',
      isCurrentUser: true,
    };

    // Filter out if user already in peer list by ID
    const peerList = COMMUNITY_LEADERS.filter((p) => p.id !== currentUser.id);
    let list: LeaderboardUser[] = [currentUserItem, ...peerList];

    // Filter by target language if active
    if (filterScope === 'target_lang') {
      list = list.filter((u) => u.targetLanguage === currentUser.targetLanguage || u.isCurrentUser);
    }

    // Sort based on ranking metric
    return list.sort((a, b) => {
      if (rankingMetric === 'xp') {
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
        return b.streakDays - a.streakDays;
      } else if (rankingMetric === 'streak') {
        if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
        return b.totalXp - a.totalXp;
      } else {
        // Power Score: Total XP + (Streak * 50)
        const scoreA = a.totalXp + a.streakDays * 50;
        const scoreB = b.totalXp + b.streakDays * 50;
        return scoreB - scoreA;
      }
    });
  }, [currentUser, rankingMetric, filterScope]);

  // Find user's current rank
  const currentUserIndex = rankedUsers.findIndex((u) => u.isCurrentUser);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : 1;
  const userAhead = currentUserIndex > 0 ? rankedUsers[currentUserIndex - 1] : null;

  const pointsToClimb = useMemo(() => {
    if (!userAhead) return 0;
    if (rankingMetric === 'xp') {
      return Math.max(1, userAhead.totalXp - currentUser.totalXp + 10);
    } else if (rankingMetric === 'streak') {
      return Math.max(1, userAhead.streakDays - (currentUser.streakDays || 0) + 1);
    } else {
      const scoreAhead = userAhead.totalXp + userAhead.streakDays * 50;
      const scoreUser = currentUser.totalXp + (currentUser.streakDays || 0) * 50;
      return Math.max(10, scoreAhead - scoreUser + 20);
    }
  }, [userAhead, currentUser, rankingMetric]);

  const top3 = rankedUsers.slice(0, 3);
  const remainingRanks = rankedUsers.slice(3);

  // League style config
  const getLeagueBadge = (league: LeaderboardUser['league']) => {
    switch (league) {
      case 'Diamond':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dot: 'bg-cyan-500',
        };
      case 'Ruby':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'Emerald':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Sapphire':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header & Competitive Division Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Competitive Leaderboard
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-800 border border-cyan-300">
                  ⚡ Diamond League
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranks learners by cumulative mastery XP and consecutive daily streak habit
              </p>
            </div>
          </div>
        </div>

        {/* Metric Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRankingMetric('xp')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                rankingMetric === 'xp'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={14} className={rankingMetric === 'xp' ? 'text-amber-500' : ''} />
              <span>Total XP</span>
            </button>

            <button
              type="button"
              onClick={() => setRankingMetric('streak')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                rankingMetric === 'streak'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame size={14} className={rankingMetric === 'streak' ? 'text-orange-500' : ''} />
              <span>Streak</span>
            </button>

            <button
              type="button"
              onClick={() => setRankingMetric('power')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                rankingMetric === 'power'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={14} className={rankingMetric === 'power' ? 'text-cyan-500' : ''} />
              <span>Power Score</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFilterScope(filterScope === 'all' ? 'target_lang' : 'all')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              filterScope === 'target_lang'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterScope === 'target_lang'
              ? `🎯 ${currentUser.targetLanguage.toUpperCase()} Only`
              : '🌐 All Languages'}
          </button>
        </div>
      </div>

      {/* Visual Podium - Top 3 Learners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-4">
        {/* 2nd Place */}
        {top3[1] && (
          <div
            className={`order-2 sm:order-1 relative rounded-2xl p-5 border text-center flex flex-col items-center justify-between transition-all ${
              top3[1].isCurrentUser
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-800 text-xs font-black shadow-xs">
              2
            </div>
            <div className="relative mb-2">
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-slate-200 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 text-sm">🥈</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 truncate max-w-[140px]">
              {top3[1].name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{top3[1].currentCefr}</span>
              <span>·</span>
              <span className="font-bold text-slate-800">{top3[1].totalXp} XP</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/70 text-amber-900 border border-amber-200">
              <Flame size={12} className="fill-amber-500 text-amber-600" />
              <span>{top3[1].streakDays}d streak</span>
            </div>
          </div>
        )}

        {/* 1st Place - Champion Podium */}
        {top3[0] && (
          <div
            className={`order-1 sm:order-2 relative rounded-2xl p-6 border text-center flex flex-col items-center justify-between shadow-sm -mt-2 transition-all ${
              top3[0].isCurrentUser
                ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/60 border-amber-300 ring-2 ring-amber-400'
                : 'bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 border-amber-200'
            }`}
          >
            <div className="absolute -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/30">
              <Crown size={15} />
            </div>
            <div className="relative mb-2 mt-2">
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-amber-300 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 text-base">👑</span>
            </div>
            <h4 className="font-black text-base text-slate-900 truncate max-w-[160px]">
              {top3[0].name}
            </h4>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {top3[0].currentCefr}
              </span>
              <span className="font-black text-amber-700 text-sm">{top3[0].totalXp} XP</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-xs">
              <Flame size={13} className="fill-white" />
              <span>{top3[0].streakDays} Days Champion Streak</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div
            className={`order-3 relative rounded-2xl p-5 border text-center flex flex-col items-center justify-between transition-all ${
              top3[2].isCurrentUser
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-900 text-xs font-black shadow-xs">
              3
            </div>
            <div className="relative mb-2">
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-amber-700/20 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 text-sm">🥉</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 truncate max-w-[140px]">
              {top3[2].name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{top3[2].currentCefr}</span>
              <span>·</span>
              <span className="font-bold text-slate-800">{top3[2].totalXp} XP</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/70 text-amber-900 border border-amber-200">
              <Flame size={12} className="fill-amber-500 text-amber-600" />
              <span>{top3[2].streakDays}d streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Current User Standing Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs font-black text-xl text-white border border-white/20 shadow-inner">
            #{currentUserRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base">Your Standing</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                {currentUserRank <= 3 ? '🏆 Podium Finisher' : 'Top 10 Contender'}
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              {currentUserRank === 1 ? (
                <span>👑 You are currently in #1 Place! Keep your daily streak to hold the title.</span>
              ) : (
                <span>
                  Only <strong>{pointsToClimb} {rankingMetric === 'streak' ? 'streak days' : 'XP'}</strong> needed to climb past {userAhead?.name || 'the next contender'}!
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">{currentUser.totalXp} XP</span>
            <span className="text-[10px] text-emerald-200">{currentUser.streakDays} Consecutive Days</span>
          </div>

          {onStartLesson && (
            <button
              type="button"
              onClick={onStartLesson}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-sm flex items-center gap-1.5 transition-all shrink-0"
            >
              <span>Practice to Climb</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Ranks 4 to 10 Table */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
          <div className="flex items-center gap-6">
            <span className="w-6 text-center">Rank</span>
            <span>Learner</span>
          </div>
          <div className="flex items-center gap-8 pr-2">
            <span className="hidden sm:inline">Habit Streak</span>
            <span>Mastery Score</span>
          </div>
        </div>

        {remainingRanks.map((user, idx) => {
          const rank = idx + 4;
          const leagueStyle = getLeagueBadge(user.league);
          const lang = SUPPORTED_LANGUAGES.find((l) => l.id === user.targetLanguage);

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                user.isCurrentUser
                  ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Left Column: Rank + Learner Details */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-6 text-center font-black text-sm text-slate-400">
                  #{rank}
                </div>

                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  {user.isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-black ring-1 ring-white">
                      ★
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        user.isCurrentUser ? 'text-emerald-950 font-black' : 'text-slate-900'
                      }`}
                    >
                      {user.name}
                    </span>
                    <span className="text-xs shrink-0" title={lang?.name}>
                      {lang?.flag || '🌐'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${leagueStyle.bg}`}
                    >
                      {user.league}
                    </span>
                    <span className="text-[11px] text-slate-400">CEFR {user.currentCefr}</span>

                    {/* Rank delta indicator */}
                    {user.rankDelta && user.rankDelta > 0 ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                        <ChevronUp size={12} /> {user.rankDelta}
                      </span>
                    ) : user.rankDelta && user.rankDelta < 0 ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-rose-500">
                        <ChevronDown size={12} /> {Math.abs(user.rankDelta)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-slate-400">
                        <Minus size={10} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Streak & XP Metrics */}
              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                {/* Streak Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  <Flame size={13} className="fill-amber-500 text-amber-600" />
                  <span>{user.streakDays}d streak</span>
                </div>

                {/* Score Column */}
                <div className="text-right min-w-[70px]">
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    {rankingMetric === 'streak'
                      ? `${user.streakDays} Days`
                      : rankingMetric === 'power'
                      ? `${user.totalXp + user.streakDays * 50} pts`
                      : `${user.totalXp} XP`}
                  </div>
                  <div className="text-[10px] text-slate-400 block sm:hidden">
                    {user.streakDays}d streak
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Rules & Fair Play Footnote */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-600" />
          <span>Top 3 advance to the Obsidian League on Sunday reset (11:59 PM UTC).</span>
        </div>
        <span>Scores dynamically sync from verified lesson completions and daily streaks.</span>
      </div>
    </div>
  );
};
