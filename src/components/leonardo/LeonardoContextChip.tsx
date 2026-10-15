import React from 'react';
import { Sparkles } from 'lucide-react';

interface LeonardoContextChipProps {
  label?: string;
  contextPrompt?: string;
  onClick: (prefillPrompt?: string) => void;
  className?: string;
}

export const LeonardoContextChip: React.FC<LeonardoContextChipProps> = ({
  label = 'Ask Leonardo',
  contextPrompt,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(contextPrompt)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-300/60 hover:border-emerald-400 text-emerald-800 text-xs font-semibold hover:bg-emerald-50/80 transition-all hover:scale-102 active:scale-98 shadow-2xs ${className}`}
      title="Open Leonardo AI Assistant with context"
    >
      <span className="text-sm">🐬</span>
      <span>{label}</span>
      <Sparkles size={11} className="text-emerald-600 animate-pulse" />
    </button>
  );
};
