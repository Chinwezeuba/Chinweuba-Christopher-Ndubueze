import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Baby,
  Smile,
  GraduationCap,
  Briefcase,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import { AgeGroup, UserProfile } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { saveCurrentUser } from '../../utils/storage';

interface OnboardingScreenProps {
  onComplete: (user: UserProfile, shouldTakePlacement: boolean) => void;
  onCancel: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult_18_plus');
  const [name, setName] = useState('New Learner');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [placementChoice, setPlacementChoice] = useState<'take_test' | 'beginner' | 'intermediate'>('take_test');
  const [learningGoal, setLearningGoal] = useState('Speaking with confidence and natural pronunciation');
  const [dailyMinutes, setDailyMinutes] = useState(15);

  const ageOptions: Array<{
    id: AgeGroup;
    title: string;
    badge: string;
    icon: typeof Baby;
    description: string;
  }> = [
    {
      id: 'child_3_5',
      title: 'Ages 3 to 5',
      badge: 'Young Explorer',
      icon: Baby,
      description: 'Pictures, spoken language, playful soundboards, zero typing required.',
    },
    {
      id: 'child_6_12',
      title: 'Ages 6 to 12',
      badge: 'Junior Adventurer',
      icon: Smile,
      description: 'Interactive stories, quest maps, sound puzzles, and companion badges.',
    },
    {
      id: 'teen_13_17',
      title: 'Ages 13 to 17',
      badge: 'Teen Practical',
      icon: GraduationCap,
      description: 'Social chats, music & gaming slang, school exchanges, and travel.',
    },
    {
      id: 'adult_18_plus',
      title: 'Ages 18 and Above',
      badge: 'Adult & Career',
      icon: Briefcase,
      description: 'Business meetings, travel dining, medical care, CEFR grammar depth.',
    },
  ];

  const goalOptions = [
    'Speaking with confidence and natural pronunciation',
    'Travel, dining, and effortless navigation abroad',
    'Job interviews, business communication, and career growth',
    'Understanding podcasts, music, movies, and literature',
    'Connecting with family heritage and local friends',
  ];

  const handleFinish = () => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Learner',
      email: `${name.toLowerCase().replace(/\s+/g, '')}@speakdolphin.app`,
      role: ageGroup === 'child_3_5' || ageGroup === 'child_6_12' ? 'learner' : 'learner',
      ageGroup,
      targetLanguage,
      nativeLanguage,
      currentCefr: placementChoice === 'beginner' ? 'A1' : placementChoice === 'intermediate' ? 'B1' : 'A1',
      learningGoal,
      dailyGoalMinutes: dailyMinutes,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      totalXp: 50,
      avatar:
        ageGroup === 'child_3_5'
          ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
          : ageGroup === 'child_6_12'
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      dailyTimeSpentTodayMinutes: 0,
      completedLessonIds: [],
      voiceEnabled: true,
      slowAudioPreference: ageGroup === 'child_3_5',
    };

    saveCurrentUser(newUser);
    onComplete(newUser, placementChoice === 'take_test');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Step {step} of 4
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {step === 1 && 'Who is learning today?'}
              {step === 2 && 'Choose your languages'}
              {step === 3 && 'Your starting point & goals'}
              {step === 4 && 'Daily commitment'}
            </h1>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`h-2 w-8 rounded-full transition-all ${
                  s === step ? 'bg-emerald-600' : s < step ? 'bg-emerald-200' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Age Group & Name */}
        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learner or Nickname
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo, Maya, Sarah"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Age Group (we adapt all lessons & visuals)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ageOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = ageGroup === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAgeGroup(opt.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{opt.title}</div>
                          <div className="text-[11px] text-emerald-700 font-semibold">{opt.badge}</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{opt.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Language Selection */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Which language would you like to master?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = targetLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setTargetLanguage(lang.id)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-3xl mb-1">{lang.flag}</span>
                      <span className="text-xs">{lang.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{lang.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your preferred native explanation language:
              </label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-emerald-600"
              >
                <option value="en">English (US / UK)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="zh">Mandarin (中文)</option>
                <option value="ja">Japanese (日本語)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Starting Point & Goals */}
        {step === 3 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Where should we begin?
              </label>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setPlacementChoice('take_test')}
                  className={`flex w-full items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    placementChoice === 'take_test'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white">
                    <Check size={12} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Adaptive Placement Assessment (Recommended)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Short 2-3 minute check across vocabulary, listening, and grammar to tailor your level accurately.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacementChoice('beginner')}
                  className={`flex w-full items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    placementChoice === 'beginner'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
                    {placementChoice === 'beginner' && <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Complete Beginner (Start from zero)</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      No test, no pressure. Begin directly with foundational greetings, core sounds, and gestures.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                What is your primary goal?
              </label>
              <div className="space-y-2">
                {goalOptions.map((goal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLearningGoal(goal)}
                    className={`flex w-full items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      learningGoal === goal
                        ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{goal}</span>
                    {learningGoal === goal && <Check size={14} className="text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Daily Commitment */}
        {step === 4 && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                How much realistic study time can you commit daily?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { min: 5, label: '5 min', desc: 'Micro learning' },
                  { min: 10, label: '10 min', desc: 'Brisk & steady' },
                  { min: 15, label: '15 min', desc: 'Recommended' },
                  { min: 30, label: '30 min', desc: 'Fast track' },
                ].map((item) => (
                  <button
                    key={item.min}
                    type="button"
                    onClick={() => setDailyMinutes(item.min)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      dailyMinutes === item.min
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={20} className={`mx-auto mb-1 ${dailyMinutes === item.min ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div className="text-base font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800">Your Speak Dolphin Learning Promise:</div>
              <div>• Personalized curriculum updated after every single practice session.</div>
              <div>• Intelligent spaced reviews right before memory traces fade.</div>
              <div>• Zero penalties or shaming if life gets busy and you miss a day.</div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-2"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <Sparkles size={16} />
              <span>{placementChoice === 'take_test' ? 'Begin Placement Test' : 'Start My Journey'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
