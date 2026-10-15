import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  TrendingUp,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { DAILY_GOAL_PRESETS, DailyGoalPreset } from '../../utils/dailyGoal';

interface DailyGoalModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetXp: number) => void;
}

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const currentTarget = user.dailyGoalXp || 100;
  const [selectedXp, setSelectedXp] = useState<number>(currentTarget);
  const [isCustom, setIsCustom] = useState<boolean>(
    !DAILY_GOAL_PRESETS.some((p) => p.targetXp === currentTarget)
  );
  const [customValue, setCustomValue] = useState<number>(currentTarget);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: DailyGoalPreset) => {
    setSelectedXp(preset.targetXp);
    setIsCustom(false);
  };

  const handleCustomChange = (val: number) => {
    const clamped = Math.max(10, Math.min(500, val));
    setCustomValue(clamped);
    setSelectedXp(clamped);
    setIsCustom(true);
  };

  const handleSave = () => {
    onSave(selectedXp);
    onClose();
  };

  const estimatedMinutes = Math.max(5, Math.min(60, Math.round(selectedXp / 6)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-goal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Target size={22} />
            </div>
            <div>
              <h3 id="daily-goal-modal-title" className="text-xl font-black text-slate-900">
                Daily XP Goal Setting
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how much experience (XP) you want to earn each day
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close daily goal modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Goal Summary */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-emerald-50/40 p-4 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-lg">
              🎯
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900">Selected Target</div>
              <div className="text-xl font-black text-emerald-950">
                {selectedXp} XP <span className="text-xs font-normal text-emerald-800">/ day</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 justify-end">
              <Clock size={13} />
              <span>~{estimatedMinutes} min/day</span>
            </div>
            <span className="text-[10px] text-emerald-700/80">Est. practice time</span>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Select a Habit Pace
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {DAILY_GOAL_PRESETS.map((preset) => {
              const isSelected = !isCustom && selectedXp === preset.targetXp;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{preset.label}</span>
                        {preset.id === 'regular' && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{preset.sublabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        {preset.targetXp} XP
                      </span>
                      <span className="text-[10px] text-slate-400">{preset.estimatedMinutes}</span>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Target XP Option */}
        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-900">Custom XP Amount</span>
            </div>
            <span className="text-xs font-black text-emerald-700">{customValue} XP</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={customValue}
              onChange={(e) => handleCustomChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleCustomChange(customValue - 10)}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleCustomChange(customValue + 10)}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Motivational Tip */}
        <div className="text-[11px] text-slate-500 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl flex items-start gap-2">
          <Flame size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Consistency Beats Intensity:</strong> Completing your daily XP target protects your habit rhythm and accelerates long-term retention via the Spaced Repetition engine.
          </span>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={15} />
            <span>Save Daily Goal ({selectedXp} XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
