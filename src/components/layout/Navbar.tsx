import React, { useState } from 'react';
import {
  Compass,
  MessageSquare,
  Mic,
  BrainCircuit,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Sliders,
  Flame,
  Globe,
  Users,
  ChevronDown,
  Sparkles,
  CreditCard,
  Activity,
  FileDown,
} from 'lucide-react';
import { UserProfile, LanguageInfo, AppVariant } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { getAllUsers } from '../../utils/storage';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  currentUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onChangeTargetLanguage: (langId: string) => void;
  onOpenAccessibility: () => void;
  onOpenPipelines?: () => void;
  onOpenLeonardo?: () => void;
  aiStatusOnline?: boolean;
  appVariant?: AppVariant;
  onSelectVariant?: (variant: AppVariant) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onSwitchUser,
  onChangeTargetLanguage,
  onOpenAccessibility,
  onOpenPipelines,
  onOpenLeonardo,
  aiStatusOnline = true,
  appVariant = 'webapp',
  onSelectVariant,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const allUsers = getAllUsers();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'home', label: 'Lessons', icon: Compass },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'pronunciation', label: 'Speech Lab', icon: Mic },
    { id: 'srs', label: 'Vocabulary SRS', icon: BrainCircuit },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'progress', label: 'Progress & CEFR', icon: BarChart3 },
    { id: 'parent', label: 'Parent / Educator', icon: ShieldCheck },
    { id: 'subscription', label: 'Pricing & Pro', icon: CreditCard },
  ];

  const getAgeLabel = () => {
    switch (currentUser.ageGroup) {
      case 'child_3_5':
        return 'Young Explorer (3-5)';
      case 'child_6_12':
        return 'Junior Adventurer (6-12)';
      case 'teen_13_17':
        return 'Teen Practical (13-17)';
      case 'adult_18_plus':
        return 'Adult & Career (18+)';
    }
  };

  const userTier = currentUser.subscriptionTier || 'free';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      {/* Top Banner for active persona & quick switch */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-1 text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Learner Mode:</span>
            <span className="text-emerald-700 font-medium">{getAgeLabel()}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">CEFR: {currentUser.currentCefr}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">Goal: {currentUser.dailyGoalMinutes}m/day</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 3 Variants Selector Buttons */}
            {onSelectVariant && (
              <div className="hidden md:flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-md text-[11px]">
                <button
                  type="button"
                  onClick={() => onSelectVariant('website')}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    appVariant === 'website' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Marketing Website Portal view"
                >
                  🌐 Website
                </button>
                <button
                  type="button"
                  onClick={() => onSelectVariant('mobile')}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    appVariant === 'mobile' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Mobile App PWA touch-first view"
                >
                  📱 Mobile PWA
                </button>
                <button
                  type="button"
                  onClick={() => onSelectVariant('webapp')}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    appVariant === 'webapp' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Full Web App Studio workspace"
                >
                  💻 Web App
                </button>
              </div>
            )}

            {onOpenPipelines && (
              <>
                <button
                  type="button"
                  onClick={onOpenPipelines}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors font-medium"
                  title="View automated background data refresh pipelines and system telemetry"
                >
                  <Activity size={13} className="text-emerald-600 animate-pulse" />
                  <span>Self-Updating Pipelines</span>
                </button>
                <span aria-hidden="true" className="text-slate-300">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              Curriculum CMS
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="/speak-dolphin-prompts-compilation.pdf"
              download="speak-dolphin-prompts-compilation.pdf"
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200"
              title="Download merged PDF of all prompts used to build Speak Dolphin"
            >
              <FileDown size={13} />
              <span>Prompts PDF</span>
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <Sliders size={13} />
              <span>Accessibility</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                Speak<span className="text-emerald-600"> Dolphin</span> 🐬
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                Intelligent Language Learning
              </div>
            </div>
          </button>

          {/* Target Language Dropdown */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all shadow-2xs"
            >
              <span className="text-base">{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      onChangeTargetLanguage(lang.id);
                      setShowLangDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                      lang.id === currentLang.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Leonardo Assistant, Streaks, XP, Membership Tier, and Profile Switcher */}
        <div className="flex items-center gap-2">
          {/* Leonardo Assistant Quick Access */}
          {onOpenLeonardo && (
            <button
              type="button"
              onClick={onOpenLeonardo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-cyan-100/90 hover:from-emerald-200 hover:to-teal-200 border border-emerald-300 transition-all hover:scale-105 shadow-2xs"
              title="Open Leonardo AI Assistant (Cmd+L)"
            >
              <span className="text-sm">🐬</span>
              <span className="hidden sm:inline">Leonardo</span>
              <Sparkles size={12} className="text-emerald-700 animate-pulse" />
            </button>
          )}

          {/* Membership Tier Badge */}
          <button
            type="button"
            onClick={() => onNavigate('subscription')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-2xs transition-transform hover:scale-105 ${
              userTier === 'pro'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                : userTier === 'family'
                ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
            title="Manage Membership and Billing"
          >
            <CreditCard size={12} />
            <span className="uppercase tracking-wider">
              {userTier === 'pro' ? 'PRO' : userTier === 'family' ? 'FAMILY' : 'UPGRADE'}
            </span>
          </button>

          {/* Daily Streak */}
          <div
            title="Daily Learning Streak without harsh penalties"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs"
          >
            <Flame size={15} className="text-amber-600 fill-amber-500" />
            <span>{currentUser.streakDays}d</span>
          </div>

          {/* Total XP */}
          <div
            title="Total Mastery Points"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs"
          >
            <Sparkles size={14} className="text-teal-600" />
            <span>{currentUser.totalXp} XP</span>
          </div>

          {/* Profile Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowLangDropdown(false);
              }}
              className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
              aria-label="User profile and persona switch menu"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <ChevronDown size={14} className="text-slate-400 mr-1 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50">
                <div className="px-3 pb-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="mt-1 text-[10px] text-emerald-700 font-semibold">{getAgeLabel()}</div>
                </div>

                <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Learner Persona
                </div>

                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(user.id);
                      setShowUserDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                      user.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                    <div className="text-left flex-1 truncate">
                      <div className="truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {user.ageGroup.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </button>
                ))}

                <div className="mt-2 pt-2 border-t border-slate-100 px-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('subscription');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left py-1 text-xs text-slate-800 font-semibold hover:text-emerald-700 flex items-center gap-1.5"
                  >
                    <CreditCard size={14} className="text-emerald-600" />
                    <span>Membership & Billing</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserDropdown(false);
                      try {
                        const { loginWithGoogle, fetchUserProfileFromFirestore, saveUserProfileToFirestore } = await import('../../firebase/userService');
                        const fbUser = await loginWithGoogle();
                        if (fbUser) {
                          let profile = await fetchUserProfileFromFirestore(fbUser.uid);
                          if (!profile) {
                            profile = {
                              ...currentUser,
                              id: fbUser.uid,
                              name: fbUser.displayName || currentUser.name,
                              email: fbUser.email || currentUser.email,
                              avatar: fbUser.photoURL || currentUser.avatar,
                            };
                            await saveUserProfileToFirestore(profile);
                          }
                          onSwitchUser(profile.id);
                        }
                      } catch (err) {
                        console.error('Google sign-in error:', err);
                      }
                    }}
                    className="w-full text-left py-1 text-xs text-blue-700 font-semibold hover:text-blue-800 flex items-center gap-1.5"
                  >
                    <span>☁️</span>
                    <span>Sign in with Google / Sync Cloud</span>
                  </button>

                  <a
                    href="/speak-dolphin-prompts-compilation.pdf"
                    download="speak-dolphin-prompts-compilation.pdf"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full text-left py-1 text-xs text-emerald-800 font-semibold hover:text-emerald-900 flex items-center gap-1.5"
                  >
                    <FileDown size={14} className="text-emerald-700" />
                    <span>Download Prompts PDF</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('onboarding');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left py-1 text-xs text-emerald-700 font-semibold hover:text-emerald-800"
                  >
                    + Add New Learner / Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-between border-t border-slate-100 px-2 py-1.5 overflow-x-auto bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium whitespace-nowrap rounded-md ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
