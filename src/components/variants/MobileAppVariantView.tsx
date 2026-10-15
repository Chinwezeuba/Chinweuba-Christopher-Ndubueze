import React, { useState } from 'react';
import {
  Compass,
  MessageSquare,
  BrainCircuit,
  BarChart3,
  User,
  Flame,
  Sparkles,
  Download,
  Volume2,
  ChevronRight,
  Shield,
  CreditCard,
  Building,
  Check,
  RotateCw,
  Sliders,
  Smartphone,
  Laptop,
  Globe,
} from 'lucide-react';
import { UserProfile, LessonUnit, SrsItem } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { CURRICULUM_LESSONS } from '../../data/curriculum';
import { DailyGoalProgressRing } from '../common/DailyGoalProgressRing';
import { DailyChallenge } from '../common/DailyChallenge';
import { AudioButton } from '../common/AudioButton';
import { OFFICIAL_BANK_ACCOUNT_DETAILS } from '../../server/billingService';

interface MobileAppVariantViewProps {
  currentUser: UserProfile;
  onUpdateCurrentUser: (user: UserProfile) => void;
  onStartLesson: (lesson: LessonUnit) => void;
  onNavigateToScreen: (screen: string) => void;
  onSwitchToWebApp: () => void;
  onSwitchToWebsite: () => void;
  onOpenAccessibility: () => void;
}

export const MobileAppVariantView: React.FC<MobileAppVariantViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onStartLesson,
  onNavigateToScreen,
  onSwitchToWebApp,
  onSwitchToWebsite,
  onOpenAccessibility,
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'tutor' | 'flashcards' | 'progress' | 'profile'>('path');
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const lessonsForLang = CURRICULUM_LESSONS.filter(
    (l) => l.languageId === currentUser.targetLanguage
  );

  const activeLesson = lessonsForLang[0] || CURRICULUM_LESSONS[0];

  const handleVibrate = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (_) {}
    }
  };

  const handleInstallPwa = () => {
    handleVibrate();
    setPwaInstalled(true);
    setShowPwaBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pb-20">
      {/* Platform Switcher Banner (Mobile Top) */}
      <div className="w-full bg-slate-900 text-white text-[11px] py-1.5 px-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Mobile App Variant
          </span>
          <span className="text-slate-300 hidden sm:inline">PWA Touch Ergonomics</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToWebsite}
            className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] underline"
          >
            <Globe size={11} />
            <span>Website</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onSwitchToWebApp}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
          >
            <Laptop size={11} />
            <span>Web App</span>
          </button>
        </div>
      </div>

      {/* Smartphone Viewport Container (Native mobile width on large screens, 100% on phones) */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl border-x border-slate-200">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐬</span>
            <div>
              <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                Speak Dolphin
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <span>{currentLang.flag}</span>
                <span>{currentLang.name}</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">{currentUser.currentCefr}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>{currentUser.streakDays}d</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
              <Sparkles size={13} className="text-teal-600" />
              <span>{currentUser.totalXp} XP</span>
            </div>

            <button
              onClick={onOpenAccessibility}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Accessibility options"
              aria-label="Accessibility options"
            >
              <Sliders size={14} />
            </button>
          </div>
        </header>

        {/* PWA Install Banner */}
        {showPwaBanner && !pwaInstalled && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Download size={14} className="text-emerald-700" />
              <span className="text-emerald-950 font-medium">Install Speak Dolphin as native app</span>
            </div>
            <button
              onClick={handleInstallPwa}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-md text-[11px] shadow-2xs"
            >
              Install
            </button>
          </div>
        )}

        {/* Tab 1: Path (Daily Goal & Lessons) */}
        {activeTab === 'path' && (
          <main className="p-4 space-y-4 flex-1">
            {/* Visual Daily Goal Progress Ring */}
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Today's Language Target
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {Math.max(0, currentUser.dailyGoalMinutes - (currentUser.dailyTimeSpentTodayMinutes || 0))}m left
                </span>
              </div>
              <div className="flex items-center justify-center py-2">
                <DailyGoalProgressRing
                  user={currentUser}
                  onUpdateUser={(updated) => {
                    handleVibrate();
                    onUpdateCurrentUser(updated);
                  }}
                  onStartLesson={() => onStartLesson(activeLesson)}
                />
              </div>
            </div>

            {/* Next Lesson Card */}
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Active Mission · {activeLesson.level}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">
                    {activeLesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {activeLesson.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">⏱️ ~{activeLesson.estimatedMinutes} mins</span>
                <button
                  onClick={() => {
                    handleVibrate();
                    onStartLesson(activeLesson);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  <span>Start Lesson</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Time-Bound Daily Challenge Mini-Game */}
            <DailyChallenge
              user={currentUser}
              onUpdateUser={(updated) => {
                handleVibrate();
                onUpdateCurrentUser(updated);
              }}
            />

            {/* Quick Practice Triggers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleVibrate();
                  setActiveTab('tutor');
                }}
                className="p-3.5 bg-white border border-slate-200 rounded-xl text-left hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
              >
                <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <MessageSquare size={16} />
                </div>
                <div className="font-bold text-xs text-slate-900">AI Conversation</div>
                <div className="text-[10px] text-slate-500">Live recast tutor</div>
              </button>

              <button
                onClick={() => {
                  handleVibrate();
                  setActiveTab('flashcards');
                }}
                className="p-3.5 bg-white border border-slate-200 rounded-xl text-left hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
                  <BrainCircuit size={16} />
                </div>
                <div className="font-bold text-xs text-slate-900">SRS Flashcards</div>
                <div className="text-[10px] text-slate-500">Smart memory review</div>
              </button>
            </div>
          </main>
        )}

        {/* Tab 2: AI Tutor in Mobile View */}
        {activeTab === 'tutor' && (
          <main className="p-4 space-y-4 flex-1 flex flex-col">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-950">AI Conversation Tutor</div>
                <div className="text-[11px] text-emerald-700">
                  Practicing in {currentLang.name} with natural recasting
                </div>
              </div>
              <button
                onClick={() => onNavigateToScreen('tutor')}
                className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                Full Screen
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-800">
                  <span className="font-bold text-emerald-800">Tutor:</span> ¡Hola! ¿Cómo te encuentras hoy? ¿Listo para practicar?
                  <div className="text-[10px] text-slate-500 mt-1">Hello! How are you today? Ready to practice?</div>
                </div>

                <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs ml-auto max-w-[85%]">
                  <div>Hola, me siento muy bien. Quiero practicar pedir comida.</div>
                </div>

                <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-800">
                  <span className="font-bold text-emerald-800">Tutor:</span> ¡Excelente! Imagina que estás en un restaurante en Madrid. ¿Qué pedirías de primer plato?
                  <div className="text-[10px] text-slate-500 mt-1">Excellent! Imagine you are in a Madrid restaurant. What would you order first?</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleVibrate();
                    onNavigateToScreen('tutor');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} />
                  <span>Open Interactive Tutor Conversation</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Tab 3: Flashcards / SRS Mobile Swipeable */}
        {activeTab === 'flashcards' && (
          <main className="p-4 space-y-4 flex-1 flex flex-col items-center justify-center">
            <div className="w-full text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Touch-First Memory Deck
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Tap card to reveal translation & audio
              </h3>
            </div>

            {/* Interactive Flashcard */}
            <div
              onClick={() => {
                handleVibrate();
                setFlippedCardId(flippedCardId === 'card-1' ? null : 'card-1');
              }}
              className="w-full aspect-[4/3] bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-md flex flex-col justify-between items-center text-center cursor-pointer transition-all active:scale-98"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {flippedCardId === 'card-1' ? 'Translation & Phonetics' : 'Target Phrase'}
              </div>

              <div className="my-auto">
                {flippedCardId === 'card-1' ? (
                  <div>
                    <div className="text-xl font-extrabold text-slate-900">
                      I would like / I want politely
                    </div>
                    <div className="text-xs text-slate-500 mt-1">kee-SYEH-rah</div>
                    <div className="text-xs text-emerald-700 font-medium mt-2">
                      Collocation: "Quisiera un café solo, por favor."
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-black text-slate-900">Quisiera</div>
                    <div className="text-xs text-slate-500 mt-1">Tap to flip</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RotateCw size={12} />
                <span>Tap card to flip</span>
              </div>
            </div>

            {/* SRS Feedback Buttons */}
            <div className="w-full grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handleVibrate();
                  setFlippedCardId(null);
                }}
                className="py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100"
              >
                Hard (1d)
              </button>
              <button
                onClick={() => {
                  handleVibrate();
                  setFlippedCardId(null);
                }}
                className="py-2.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-100"
              >
                Good (3d)
              </button>
              <button
                onClick={() => {
                  handleVibrate();
                  setFlippedCardId(null);
                }}
                className="py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100"
              >
                Easy (6d)
              </button>
            </div>
          </main>
        )}

        {/* Tab 4: Progress & CEFR */}
        {activeTab === 'progress' && (
          <main className="p-4 space-y-4 flex-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Demonstrated Proficiency
              </span>
              <div className="flex items-center justify-between mt-2">
                <div className="text-2xl font-black text-slate-900">{currentUser.currentCefr}</div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Formative CEFR Benchmark
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '45%' }} />
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                45% towards {currentUser.currentCefr === 'A1' ? 'A2' : 'B1'} Fluency Milestone
              </div>
            </div>

            {/* Streak Shield Status */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                <Flame size={16} className="text-amber-600 fill-amber-500" />
                <span>Streak Momentum Safeguard</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                {currentUser.streakDays}-day streak active. Speak Dolphin shields your progress if a busy day arises.
              </p>
            </div>

            <button
              onClick={() => onNavigateToScreen('progress')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs"
            >
              View Full CEFR Analytics Deck
            </button>
          </main>
        )}

        {/* Tab 5: Profile & Membership */}
        {activeTab === 'profile' && (
          <main className="p-4 space-y-4 flex-1 text-xs">
            {/* User Profile Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-12 w-12 rounded-full object-cover border border-slate-200"
              />
              <div className="flex-1 truncate">
                <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                <div className="text-emerald-700 font-semibold text-[10px] mt-0.5 capitalize">
                  {currentUser.role} · {currentUser.ageGroup.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Membership Tier & Lead Bank Direct Integration */}
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Membership Tier</span>
                <span className="font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  {currentUser.subscriptionTier || 'FREE'}
                </span>
              </div>

              <div className="border-t border-slate-200/80 pt-2 text-[11px] text-slate-600">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Building size={14} className="text-emerald-700" />
                  <span>Lead Bank Direct Checking Rails Active</span>
                </div>
                <div>Routing: {OFFICIAL_BANK_ACCOUNT_DETAILS.routingNumber}</div>
                <div>Account: {OFFICIAL_BANK_ACCOUNT_DETAILS.accountNumber}</div>
                <div>Beneficiary: {OFFICIAL_BANK_ACCOUNT_DETAILS.beneficiaryName}</div>
                <div>Support: {OFFICIAL_BANK_ACCOUNT_DETAILS.beneficiaryEmail}</div>
              </div>

              <button
                onClick={() => onNavigateToScreen('subscription')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xs text-xs"
              >
                Manage Membership & Invoices
              </button>
            </div>
          </main>
        )}

        {/* Ergonomic Bottom Navigation Bar (<15% Viewport Cap, Touch Targets >= 44x44px) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 py-1 px-2 flex items-center justify-around z-40 shadow-lg">
          <button
            onClick={() => {
              handleVibrate();
              setActiveTab('path');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition-all ${
              activeTab === 'path' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <Compass size={18} />
            <span>Path</span>
          </button>

          <button
            onClick={() => {
              handleVibrate();
              setActiveTab('tutor');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition-all ${
              activeTab === 'tutor' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <MessageSquare size={18} />
            <span>Tutor</span>
          </button>

          <button
            onClick={() => {
              handleVibrate();
              setActiveTab('flashcards');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition-all ${
              activeTab === 'flashcards' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <BrainCircuit size={18} />
            <span>Cards</span>
          </button>

          <button
            onClick={() => {
              handleVibrate();
              setActiveTab('progress');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition-all ${
              activeTab === 'progress' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <BarChart3 size={18} />
            <span>Progress</span>
          </button>

          <button
            onClick={() => {
              handleVibrate();
              setActiveTab('profile');
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
            }`}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
