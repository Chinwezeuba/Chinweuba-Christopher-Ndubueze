import React, { useEffect, useState } from 'react';
import {
  Flame,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  Share2,
  ArrowRight,
  X,
  TrendingUp,
} from 'lucide-react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'flame';
}

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  isNewBest?: boolean;
  bestStreak?: number;
  userName?: string;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  isNewBest = false,
  bestStreak,
  userName = 'Learner',
}) => {
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Generate burst of celebration confetti pieces
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];
    const shapes: ('circle' | 'square' | 'flame')[] = ['circle', 'square', 'flame'];
    const items: ConfettiPiece[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across
      y: -10 - Math.random() * 20,
      size: Math.floor(Math.random() * 10) + 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.floor(Math.random() * 360),
      delay: Math.random() * 0.4,
      duration: 1.8 + Math.random() * 1.5,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    setParticles(items);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = `🔥 I just reached a ${streakCount}-day learning streak on Speak Dolphin!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getTierMessage = (streak: number) => {
    if (streak >= 30) return 'Incredible dedication! You are a fluent habit master.';
    if (streak >= 14) return 'Two solid weeks of unstoppable momentum!';
    if (streak >= 7) return 'One entire week of daily practice unlocked!';
    if (streak >= 3) return 'Great rhythm! Consistency creates fluency.';
    return 'Your daily habit is growing stronger every single day!';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-celebration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300"
    >
      {/* Floating confetti container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-celebration-fall"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.shape === 'flame' ? (
              <span style={{ fontSize: `${p.size + 4}px` }}>🔥</span>
            ) : (
              <div
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 'circle' ? '9999px' : '3px',
                  transform: `rotate(${p.rotation}deg)`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-2 border-amber-200 text-center overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Glow backdrop ring */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-orange-500/25 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close streak celebration"
        >
          <X size={18} />
        </button>

        {/* Big Animated Flame Emblem */}
        <div className="relative mx-auto my-3 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse opacity-80 blur-md" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 ring-4 ring-amber-200/80 transform hover:scale-105 transition-transform">
            <Flame size={44} className="fill-white drop-shadow-md animate-bounce" />
          </div>
          {/* Sparkles around flame */}
          <span className="absolute -top-1 -right-2 text-2xl animate-spin duration-1000">✨</span>
          <span className="absolute -bottom-1 -left-2 text-xl animate-ping">⚡</span>
        </div>

        {/* Heading & Streak Counter */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-700" />
            <span>Streak Extended!</span>
          </div>

          <h2
            id="streak-celebration-title"
            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight pt-2"
          >
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'}!
          </h2>

          <p className="text-sm font-semibold text-amber-800">
            {getTierMessage(streakCount)}
          </p>
        </div>

        {/* Highlight Stats Pill */}
        <div className="my-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Today's Practice:</span>
            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Secured ✓</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">All-time Personal Best:</span>
            <span className="font-extrabold text-slate-900">
              {bestStreak && bestStreak >= streakCount ? bestStreak : streakCount} Days
            </span>
          </div>

          {isNewBest && (
            <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center justify-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100/60 py-1 rounded-lg">
              <Award size={14} className="text-amber-700" />
              <span>New Personal Best Record Achieved!</span>
            </div>
          )}
        </div>

        {/* Habit encouragement message */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Keep coming back tomorrow to defend your flame. Consistency with zero-stress learning leads to true fluency!
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Share2 size={14} />
            <span>{copied ? 'Copied to Clipboard! ✓' : 'Share Streak'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Keep Learning</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
