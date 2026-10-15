import React, { useState, useEffect } from 'react';
import {
  Compass,
  MessageSquare,
  Mic,
  BrainCircuit,
  BookOpen,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Building,
  Volume2,
  Sparkles,
  Command,
  Flame,
  Globe,
  Sliders,
  Smartphone,
  CheckCircle2,
  Layers,
  Activity,
} from 'lucide-react';
import { UserProfile, LessonUnit, AccessibilitySettings } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { CURRICULUM_LESSONS } from '../../data/curriculum';
import { AudioButton } from '../common/AudioButton';
import { speakText } from '../../utils/speech';
import { OFFICIAL_BANK_ACCOUNT_DETAILS } from '../../server/billingService';

interface WebAppVariantViewProps {
  currentUser: UserProfile;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onSwitchUser: (userId: string) => void;
  onChangeTargetLanguage: (langId: string) => void;
  onOpenAccessibility: () => void;
  onOpenPipelines: () => void;
  onSwitchToWebsite: () => void;
  onSwitchToMobileApp: () => void;
  children: React.ReactNode;
}

export const WebAppVariantView: React.FC<WebAppVariantViewProps> = ({
  currentUser,
  currentScreen,
  onNavigate,
  onSwitchUser,
  onChangeTargetLanguage,
  onOpenAccessibility,
  onOpenPipelines,
  onSwitchToWebsite,
  onSwitchToMobileApp,
  children,
}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const lessonsForLang = CURRICULUM_LESSONS.filter(
    (l) => l.languageId === currentUser.targetLanguage
  );
  const activeLesson = lessonsForLang[0] || CURRICULUM_LESSONS[0];

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        // Play sample greeting audio
        speakText(currentLang.sampleGreeting, currentLang.id);
      } else if (e.key === '?' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLang]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Studio Variant Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
            Web App Studio
          </span>
          <span className="text-slate-400 font-medium hidden md:inline">
            Split-Pane Workspace · Physical Keyboard Controls · Dual Child & Adult Tracks
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            title="View keyboard shortcuts"
          >
            <Command size={12} />
            <span className="text-[11px]">Shortcuts (Press ?)</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onSwitchToWebsite}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-[11px] underline"
          >
            <Globe size={12} />
            <span>Website Portal</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onSwitchToMobileApp}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[11px]"
          >
            <Smartphone size={12} />
            <span>Mobile App View</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col">
        {/* Child Screen Content */}
        {children}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Command size={18} className="text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Desktop Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-700 font-medium">Replay Current Phrase Audio</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 shadow-2xs">
                  Space
                </kbd>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-700 font-medium">Select Choice 1, 2, 3, or 4</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 shadow-2xs">
                  1 · 2 · 3 · 4
                </kbd>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-700 font-medium">Submit / Continue to Next Step</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 shadow-2xs">
                  Enter
                </kbd>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-700 font-medium">Toggle Shortcuts Help</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 shadow-2xs">
                  ?
                </kbd>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
