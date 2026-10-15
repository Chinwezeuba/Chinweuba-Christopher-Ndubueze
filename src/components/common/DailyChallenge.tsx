import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Clock,
  Award,
  Sparkles,
  Flame,
  Volume2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Trophy,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  getTodayChallengeInfo,
  calculateBonusXp,
  recordDailyChallengeWin,
  isDailyChallengeCompletedToday,
  ChallengeQuestion,
} from '../../utils/dailyChallenge';
import { speakText } from '../../utils/speech';
import { getTimeRemainingInDay } from '../../utils/dailyGoal';
import { saveCurrentUser } from '../../utils/storage';

interface DailyChallengeProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onCelebrationTrigger?: (streak: number) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  user,
  onUpdateUser,
  onCelebrationTrigger,
}) => {
  const isCompletedToday = isDailyChallengeCompletedToday(user);
  const challengeInfo = getTodayChallengeInfo(user.targetLanguage, user.ageGroup);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'ended'>('intro');
  const [startCountdown, setStartCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(challengeInfo.durationSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [earnedBonusXp, setEarnedBonusXp] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [liveMidnightCountdown, setLiveMidnightCountdown] = useState(
    () => getTimeRemainingInDay().formatted
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep countdown to midnight updated
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMidnightCountdown(getTimeRemainingInDay().formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const openChallenge = () => {
    setGameState('intro');
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectAnswersCount(0);
    setTimeLeft(challengeInfo.durationSeconds);
    setCurrentIndex(0);
    setIsModalOpen(true);
  };

  const startCountdownBeforeGame = () => {
    setGameState('countdown');
    setStartCountdown(3);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setStartCountdown(count);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        beginPlaying();
      }
    }, 850);
  };

  const beginPlaying = () => {
    setGameState('playing');
    setTimeLeft(challengeInfo.durationSeconds);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);

    // Auto-pronounce first question if it has audio
    const q = challengeInfo.questions[0];
    if (q?.audioText) {
      speakText(q.audioText, user.targetLanguage);
    }

    // Start 45s timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinishGame(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered || gameState !== 'playing') return;

    const currentQ = challengeInfo.questions[currentIndex];
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const addedPoints = currentQ.points * combo;
      setScore((prev) => prev + addedPoints);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      setCombo(1); // Reset combo on error
    }

    // Advance to next question after short delay
    setTimeout(() => {
      if (currentIndex + 1 < challengeInfo.questions.length && timeLeft > 0) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(null);

        const nextQ = challengeInfo.questions[nextIndex];
        if (nextQ?.audioText) {
          speakText(nextQ.audioText, user.targetLanguage);
        }
      } else {
        // All questions completed!
        if (timerRef.current) clearInterval(timerRef.current);
        handleFinishGame(timeLeft);
      }
    }, 800);
  };

  const handleFinishGame = (finalTimeLeft: number) => {
    setGameState('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    const questionsCount = challengeInfo.questions.length;
    // Compute bonus XP
    const { totalBonusXp } = calculateBonusXp(
      score,
      correctAnswersCount,
      questionsCount,
      finalTimeLeft
    );
    setEarnedBonusXp(totalBonusXp);

    // Apply progress update to existing progress system
    const { updatedUser, streakIncremented, isNewHighScore } = recordDailyChallengeWin(
      user,
      score,
      totalBonusXp
    );
    setIsNewHigh(isNewHighScore);

    saveCurrentUser(updatedUser);
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    if (streakIncremented && onCelebrationTrigger) {
      onCelebrationTrigger(updatedUser.streakDays);
    }
  };

  const currentQ: ChallengeQuestion | undefined = challengeInfo.questions[currentIndex];

  return (
    <>
      {/* 1. HOME SCREEN DAILY CHALLENGE CARD */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
        {/* Glow ambient background elements */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-xs px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-200 border border-amber-200/20">
                <Zap size={14} className="fill-amber-300 text-amber-300 animate-pulse" />
                <span>Daily Challenge</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-100 bg-white/15 px-2.5 py-0.5 rounded-full">
                <Clock size={12} />
                <span>Closes in {liveMidnightCountdown}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                <Award size={12} />
                <span>+{challengeInfo.bonusXp} Bonus XP</span>
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{challengeInfo.title}</span>
              <span className="text-amber-200 text-lg">⚡</span>
            </h2>

            <p className="text-xs sm:text-sm text-amber-50 leading-relaxed font-medium">
              {challengeInfo.description}
            </p>

            {/* Stats pill & completion banner */}
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-amber-100">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-amber-200 fill-amber-200" />
                <span>Streaks Secured: <strong>{user.streakDays}d</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Trophy size={14} className="text-yellow-200" />
                <span>Personal Best: <strong>{user.dailyChallengeHighScore || 0} pts</strong></span>
              </div>
              {user.dailyChallengesWonCount ? (
                <>
                  <span>•</span>
                  <span>Won: <strong>{user.dailyChallengesWonCount} challenges</strong></span>
                </>
              ) : null}
            </div>
          </div>

          {/* Action Button & Completion Status */}
          <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto shrink-0">
            {isCompletedToday ? (
              <div className="flex flex-col items-center sm:items-end gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-900/60 backdrop-blur-xs px-4 py-2 border border-emerald-300/40 text-emerald-100 text-xs font-bold shadow-xs">
                  <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-950" />
                  <span>Today's Challenge Completed!</span>
                </div>
                <button
                  type="button"
                  onClick={openChallenge}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Replay for High Score</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openChallenge}
                className="group w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-950 font-black text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2.5"
              >
                <Play size={18} className="fill-slate-950 text-slate-950 transition-transform group-hover:scale-110" />
                <span>Play Daily Challenge</span>
              </button>
            )}
            <span className="text-[11px] text-amber-200/90 text-center sm:text-right font-medium">
              ⏱️ 45s blitz · 5 rapid rounds · Streak linked
            </span>
          </div>
        </div>
      </div>

      {/* 2. TIME-BOUND INTERACTIVE MINI-GAME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <Zap size={18} className="text-white fill-white" />
                </span>
                <div>
                  <h3 className="text-base font-black leading-tight">{challengeInfo.title}</h3>
                  <p className="text-[11px] font-semibold text-amber-100">
                    Earn up to +75 Bonus XP & Secure Today's Streak!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                  setIsModalOpen(false);
                }}
                className="rounded-full bg-black/10 p-1.5 text-white/80 hover:bg-black/20 hover:text-white transition-all"
                aria-label="Close daily challenge"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: State Machine */}

            {/* SCREEN A: INTRO / READY */}
            {gameState === 'intro' && (
              <div className="p-6 sm:p-8 text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 shadow-inner">
                  <Flame size={40} className="fill-amber-500 text-amber-500 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900">Are you ready to sprint?</h4>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Test your language reflexes! Answer 5 rapid-fire questions before the 45-second timer runs out. Chain consecutive correct answers for a <strong>3x combo multiplier</strong>.
                  </p>
                </div>

                {/* Challenge rules pills */}
                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-xs text-slate-500 block font-semibold">Time Limit</span>
                    <span className="text-base font-black text-slate-900">45 Seconds</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-xs text-slate-500 block font-semibold">Questions</span>
                    <span className="text-base font-black text-slate-900">5 Rounds</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-xs text-slate-500 block font-semibold">Reward</span>
                    <span className="text-base font-black text-emerald-600">+{challengeInfo.bonusXp} XP</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={startCountdownBeforeGame}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play size={22} className="fill-white" />
                    <span>Start Mini-Game!</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN B: 3-2-1 COUNTDOWN */}
            {gameState === 'countdown' && (
              <div className="p-12 text-center space-y-4">
                <div className="text-xs font-black uppercase tracking-widest text-amber-600">
                  Get Ready!
                </div>
                <div className="text-7xl font-black text-amber-500 animate-ping">
                  {startCountdown}
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Sprint starting now! Listen carefully...
                </p>
              </div>
            )}

            {/* SCREEN C: ACTIVE TIME-BOUND GAMEPLAY */}
            {gameState === 'playing' && currentQ && (
              <div className="p-6 sm:p-8 space-y-6">
                {/* HUD: Time, Score, Combo */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  {/* Timer */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-sm transition-all ${
                        timeLeft <= 10
                          ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                          : timeLeft <= 20
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {timeLeft}s
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Time Remaining
                      </span>
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(timeLeft / challengeInfo.durationSeconds) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Score & Combo */}
                  <div className="flex items-center gap-3">
                    {combo > 1 && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-orange-100 border border-orange-200 px-2.5 py-1 text-xs font-black text-orange-700 animate-pulse">
                        <Flame size={14} className="fill-orange-500 text-orange-500" />
                        <span>{combo}x Combo!</span>
                      </span>
                    )}

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Score</span>
                      <span className="text-lg font-black text-slate-900">{score} pts</span>
                    </div>
                  </div>
                </div>

                {/* Question progress dots */}
                <div className="flex items-center justify-center gap-2">
                  {challengeInfo.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-8 bg-amber-500'
                          : idx < currentIndex
                          ? 'w-2.5 bg-emerald-500'
                          : 'w-2.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Question Prompt Card */}
                <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} /> Round {currentIndex + 1} of {challengeInfo.questions.length}
                    </span>

                    {currentQ.audioText && (
                      <button
                        type="button"
                        onClick={() => speakText(currentQ.audioText!, user.targetLanguage)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-all active:scale-95"
                      >
                        <Volume2 size={14} />
                        <span>Replay Audio</span>
                      </button>
                    )}
                  </div>

                  <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {currentQ.prompt}
                  </p>

                  {currentQ.audioText && (
                    <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shrink-0">
                        🔊
                      </div>
                      <span className="text-base font-bold text-emerald-950 font-serif">
                        "{currentQ.audioText}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    let btnStyle = 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40 text-slate-800';

                    if (isAnswered) {
                      if (option === currentQ.correctAnswer) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-300';
                      } else {
                        btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(option)}
                        className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex items-center justify-between group active:scale-98 ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswered && option === currentQ.correctAnswer && (
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isSelected && option !== currentQ.correctAnswer && (
                          <XCircle size={18} className="text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on answer */}
                {isAnswered && (
                  <div
                    className={`rounded-xl p-3 text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                      isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    <span>{isCorrect ? '✨ Great job!' : '💡 Note:'} {currentQ.explanation}</span>
                  </div>
                )}
              </div>
            )}

            {/* SCREEN D: RESULTS / CELEBRATION */}
            {gameState === 'ended' && (
              <div className="p-6 sm:p-8 text-center space-y-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl">
                  <Trophy size={48} className="animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                    Challenge Complete!
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {correctAnswersCount >= 4 ? 'Phenomenal Reflexes! 🚀' : 'Challenge Accomplished! 🎉'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    You scored <strong>{score} points</strong> and correctly solved {correctAnswersCount} of {challengeInfo.questions.length} phrases!
                  </p>
                </div>

                {/* XP Reward card */}
                <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-800">Bonus XP Awarded</span>
                    <span className="text-2xl font-black text-emerald-700">+{earnedBonusXp} XP</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 text-left border-t border-emerald-100 pt-3">
                    <div className="flex justify-between">
                      <span>• Correct answers score:</span>
                      <span className="font-bold text-slate-900">{correctAnswersCount * 8} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Speed bonus ({timeLeft}s left):</span>
                      <span className="font-bold text-slate-900">+{Math.floor(timeLeft / 2)} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Max Combo streak ({maxCombo}x):</span>
                      <span className="font-bold text-emerald-700">+{maxCombo >= 3 ? '15' : '10'} XP</span>
                    </div>
                  </div>
                </div>

                {/* Streak and High Score Feedback */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                      <Flame size={20} className="fill-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Daily Streak</span>
                      <span className="text-sm font-black text-amber-950 block">Secured for Today!</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">High Score</span>
                      <span className="text-sm font-black text-slate-900 block">
                        {isNewHigh ? '🏆 New Best!' : `${user.dailyChallengeHighScore || score} pts`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Return to Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCountdownBeforeGame}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <RotateCcw size={16} />
                    <span>Play Again</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
