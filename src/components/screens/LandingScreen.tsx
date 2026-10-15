import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Mic,
  BrainCircuit,
  MessageSquare,
  Shield,
  BookOpen,
  Globe2,
  Baby,
  Smile,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { AudioButton } from '../common/AudioButton';

interface LandingScreenProps {
  onStartOnboarding: () => void;
  onSelectExistingProfile: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartOnboarding,
  onSelectExistingProfile,
}) => {
  const [selectedAgeTab, setSelectedAgeTab] = useState<'kids' | 'juniors' | 'teens' | 'adults'>('adults');
  const [previewLanguage, setPreviewLanguage] = useState(SUPPORTED_LANGUAGES[0]);

  const ageData = {
    kids: {
      title: 'Ages 3 to 5: Playful Discovery',
      badge: 'Young Explorer',
      icon: Baby,
      description: 'Acquire sounds, animals, and rhythm through picture immersion, voice games, and songs. No reading or typing barriers required.',
      features: [
        'Illustrated soundboards & tap-and-listen interactions',
        'Friendly animal guides with playful celebration sounds',
        'Zero text input required; 100% voice & touch mechanics',
        'Protected child-safe environment with COPPA compliant parental controls',
      ],
      samplePhrase: '¡Mira el perrito! 🐶',
      sampleTranslation: 'Look at the little dog!',
    },
    juniors: {
      title: 'Ages 6 to 12: Adventure Quests',
      badge: 'Junior Adventurer',
      icon: Smile,
      description: 'Interactive stories, comic-style missions, and bite-sized challenges that build vocabulary and grammar without dry drills.',
      features: [
        'Comic-strip dialogue adventures with branching endings',
        'Sentence puzzle building and audio-detective listening',
        'Positive reward milestones without shaming or rankings',
        'Age-appropriate everyday school, pet, and family themes',
      ],
      samplePhrase: '¡Vamos a explorar la isla mágica! 🏝️',
      sampleTranslation: "Let's explore the magic island!",
    },
    teens: {
      title: 'Ages 13 to 17: Social & Practical',
      badge: 'Teen Practical',
      icon: GraduationCap,
      description: 'Master practical communication for music, gaming, social media, school exchanges, and traveling with friends.',
      features: [
        'Real-world messaging simulations and authentic slang notes',
        'Interactive speech shadowing with live pronunciation feedback',
        'Travel survival challenges: airport transit, street markets, festivals',
        'Smart spaced repetition to prepare for language certifications',
      ],
      samplePhrase: '¿Tienes tiempo para tomar un helado después de clase?',
      sampleTranslation: 'Do you have time to grab an ice cream after class?',
    },
    adults: {
      title: 'Ages 18 & Beyond: Fluency & Career',
      badge: 'Adult & Professional',
      icon: Briefcase,
      description: 'Comprehensible immersion, CEFR-aligned progression (A1 to C2), nuanced business negotiation, and intelligent AI conversation tutoring.',
      features: [
        'Real-life communication tasks: job interviews, clinic visits, dining etiquette',
        'SuperMemo SM-2 spaced repetition engine for long-term retention',
        'Live AI roleplay tutor with customizable correction styles',
        'Listening laboratory with slow 0.75x audio and minimal-pair discrimination',
      ],
      samplePhrase: 'Quisiera reservar una mesa para dos personas en la terraza, por favor.',
      sampleTranslation: 'I would like to reserve a table for two on the terrace, please.',
    },
  };

  const activeAge = ageData[selectedAgeTab];
  const AgeIcon = activeAge.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-emerald-50/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-6">
              <Sparkles size={14} />
              <span>Adaptive Multilingual Learning for Children & Adults</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Learn to speak naturally, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                not just memorize words.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Speak Dolphin adapts continuously to your age, native language, goals, and mistakes.
              Powered by comprehensible immersion, active spaced recall, and real-time AI conversation roleplays.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onStartOnboarding}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Start Personalized Learning</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onSelectExistingProfile}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all"
              >
                Explore Sample Learner Profiles
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Adaptive CEFR A1–C2 Framework
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                SuperMemo SM-2 Spaced Repetition
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Speech Intelligibility Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={16} className="text-emerald-600" />
                COPPA Child-Safe Design
              </span>
            </div>
          </div>

          {/* Interactive Live Audio Showcase Card */}
          <div className="mt-12 max-w-2xl mx-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">{previewLanguage.flag}</span>
                <span className="text-sm font-bold text-slate-800">{previewLanguage.name} Experience</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>{previewLanguage.family} family</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{previewLanguage.sampleGreeting}</div>
                  <div className="text-xs text-slate-500 mt-1">Hello! How are you doing?</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <AudioButton text={previewLanguage.sampleGreeting} lang={previewLanguage.id} size="sm" label="Normal" />
                  <AudioButton text={previewLanguage.sampleGreeting} lang={previewLanguage.id} isSlow size="sm" label="Slow" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70">
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Language-Specific Intelligence:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {previewLanguage.uniqueFeatures.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Switch language preview:</span>
              <div className="flex gap-1 overflow-x-auto">
                {SUPPORTED_LANGUAGES.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setPreviewLanguage(l)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                      previewLanguage.id === l.id
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l.flag} {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Adapted Learning Architecture Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              One Size Does Not Fit All
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              A 4-year-old child and a 35-year-old engineer learn completely differently.
              Speak Dolphin adapts lesson mechanics, vocabulary, feedback style, and UI.
            </p>

            {/* Segmented age tabs */}
            <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(
                [
                  { id: 'kids', label: 'Ages 3-5 (Kids)' },
                  { id: 'juniors', label: 'Ages 6-12 (Junior)' },
                  { id: 'teens', label: 'Ages 13-17 (Teens)' },
                  { id: 'adults', label: 'Ages 18+ (Adults)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedAgeTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    selectedAgeTab === tab.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <AgeIcon size={32} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                    {activeAge.badge}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">Curriculum Approach</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeAge.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeAge.description}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeAge.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Sample phrase player */}
                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Sample Age-Adapted Expression:</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">"{activeAge.samplePhrase}"</div>
                    <div className="text-xs text-slate-500">{activeAge.sampleTranslation}</div>
                  </div>
                  <AudioButton text={activeAge.samplePhrase} lang="es" size="md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Pillars of the Speak Dolphin Teaching Engine */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Grounded in Cognitive Science & Linguistics
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Combining established second-language acquisition principles instead of superficial gamified gimmicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
                <Globe2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Comprehensible Immersion</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Teach primarily in the target language at a level you can understand. We use your native language as a gentle bridge, then gradually fade scaffolding as independence grows.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Active Recall & SM-2 SRS</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                SuperMemo algorithm schedules items right when memory traces begin to fade. We test active recall and sentence construction, not merely passive recognition of multiple-choice bubbles.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real Communication Tasks</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Turn every lesson into a practical life challenge: ordering food, navigating train transfers, attending meetings, talking to a doctor, or making lifelong friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Speak Dolphin Multilingual Learning Platform · COPPA, LGPD & WCAG 2.2 AA Compliant
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onStartOnboarding} className="hover:text-emerald-700 font-semibold">
              Get Started
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={onSelectExistingProfile} className="hover:text-emerald-700">
              Demo Profiles
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
