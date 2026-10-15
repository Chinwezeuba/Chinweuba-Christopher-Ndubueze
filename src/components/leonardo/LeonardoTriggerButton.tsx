import React, { useEffect } from 'react';
import { Sparkles, Bot, MessageSquare } from 'lucide-react';

interface LeonardoTriggerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export const LeonardoTriggerButton: React.FC<LeonardoTriggerButtonProps> = ({
  isOpen,
  onToggle,
  unreadCount = 0,
}) => {
  // Global keyboard shortcut: Cmd+K or Ctrl+K or Cmd+L or Ctrl+L to toggle Leonardo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'l' || e.key === 'k')) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return (
    <div className="fixed bottom-5 right-5 z-40 group">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open Leonardo AI Assistant"
        className={`relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 ${
          isOpen
            ? 'bg-slate-900 text-white ring-2 ring-emerald-400'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:shadow-emerald-500/30 hover:scale-105'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-inner">
            🐬
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
          </span>
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-sm tracking-tight">Leonardo</span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-white/25 text-white tracking-wider">
              1,000 Agents
            </span>
          </div>
          <span className="text-[11px] text-emerald-100 font-medium leading-tight">
            {isOpen ? 'Close Assistant' : 'Ask AI Companion'}
          </span>
        </div>

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Tooltip on desktop hover */}
      <div className="hidden lg:group-hover:block absolute bottom-full right-0 mb-2 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-2xl border border-slate-700/80 pointer-events-none transition-opacity">
        <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
          <Sparkles size={13} className="text-emerald-400" />
          <span>Leonardo AI Learning Assistant</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Coordinated multi-agent intelligence across 15 languages, speech coaching, and instant app support.
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
          <span>Toggle shortcut:</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">⌘ + L</kbd>
        </div>
      </div>
    </div>
  );
};
