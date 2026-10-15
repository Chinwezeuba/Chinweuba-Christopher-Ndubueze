import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Baby,
  Smile,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { UserProfile, AgeGroup } from '../../types';
import { DEFAULT_PROFILES, saveCurrentUser } from '../../utils/storage';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'recovery'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('adult_18_plus');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleQuickLogin = (profile: UserProfile) => {
    saveCurrentUser(profile);
    onLoginSuccess(profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'recovery') {
      setRecoverySent(true);
      return;
    }

    if (authMode === 'signin') {
      const match = DEFAULT_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) || DEFAULT_PROFILES[0];
      saveCurrentUser(match);
      onLoginSuccess(match);
    } else {
      // Sign up
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || 'New Learner',
        email: email.trim() || 'learner@speakdolphin.app',
        role: 'learner',
        ageGroup: selectedAge,
        targetLanguage: 'es',
        nativeLanguage: 'en',
        currentCefr: 'A1',
        learningGoal: 'Master everyday conversational confidence and culture',
        dailyGoalMinutes: 15,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        totalXp: 50,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dailyTimeSpentTodayMinutes: 0,
        completedLessonIds: [],
        voiceEnabled: true,
        slowAudioPreference: false,
      };
      saveCurrentUser(newUser);
      onLoginSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Fluent<span className="text-emerald-600">Path</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent multilingual language learning for every age
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setRecoverySent(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setRecoverySent(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Sign-in with Firebase Auth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              try {
                const { loginWithGoogle, fetchUserProfileFromFirestore, saveUserProfileToFirestore } = await import('../../firebase/userService');
                const firebaseUser = await loginWithGoogle();
                if (firebaseUser) {
                  let existing = await fetchUserProfileFromFirestore(firebaseUser.uid);
                  if (!existing) {
                    existing = {
                      id: firebaseUser.uid,
                      name: firebaseUser.displayName || 'Google Learner',
                      email: firebaseUser.email || '',
                      role: 'learner',
                      ageGroup: 'adult_18_plus',
                      targetLanguage: 'es',
                      nativeLanguage: 'en',
                      currentCefr: 'A1',
                      learningGoal: 'Master everyday conversational confidence and culture',
                      dailyGoalMinutes: 15,
                      streakDays: 1,
                      bestStreak: 1,
                      lastActiveDate: new Date().toISOString().slice(0, 10),
                      totalXp: 50,
                      avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      dailyTimeSpentTodayMinutes: 0,
                      completedLessonIds: [],
                      voiceEnabled: true,
                      slowAudioPreference: false,
                    };
                    await saveUserProfileToFirestore(existing);
                  }
                  saveCurrentUser(existing);
                  onLoginSuccess(existing);
                }
              } catch (err) {
                console.error('Google sign-in error:', err);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Or Demo Personas</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
        </div>

        {/* One-Tap Quick Persona Logins */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            One-Tap Quick Demo Personas:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_PROFILES.map((prof) => (
              <button
                key={prof.id}
                type="button"
                onClick={() => handleQuickLogin(prof)}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-left text-xs transition-all shadow-2xs"
              >
                <img src={prof.avatar} alt={prof.name} className="h-6 w-6 rounded-full object-cover" />
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate">{prof.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {prof.ageGroup.replace(/_/g, ' ')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          {authMode !== 'recovery' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('recovery')}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learner Age Bracket
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value as AgeGroup)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-emerald-600"
              >
                <option value="adult_18_plus">Adult (18+) - Career & Travel</option>
                <option value="teen_13_17">Teen (13-17) - Social & Practical</option>
                <option value="child_6_12">Child (6-12) - Quests & Stories</option>
                <option value="child_3_5">Young Child (3-5) - Sounds & Play</option>
              </select>
            </div>
          )}

          {recoverySent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              A password reset link has been dispatched to your email address.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Recovery Link'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
