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
  CreditCard,
  Building,
  Check,
  ChevronRight,
  Smartphone,
  Laptop,
  FileDown,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { AudioButton } from '../common/AudioButton';
import { OFFICIAL_BANK_ACCOUNT_DETAILS, PRICING_PLANS } from '../../server/billingService';

interface WebsiteVariantViewProps {
  onLaunchWebApp: () => void;
  onLaunchMobileApp: () => void;
  onSelectLanguage: (langId: string) => void;
  onOpenPricing: () => void;
}

export const WebsiteVariantView: React.FC<WebsiteVariantViewProps> = ({
  onLaunchWebApp,
  onLaunchMobileApp,
  onSelectLanguage,
  onOpenPricing,
}) => {
  const [selectedAgeTab, setSelectedAgeTab] = useState<'kids' | 'juniors' | 'teens' | 'adults'>('adults');
  const [activeCatalogLang, setActiveCatalogLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [showWireDetails, setShowWireDetails] = useState(false);

  const ageData = {
    kids: {
      title: 'Ages 3 to 5: Playful Phonics Discovery',
      badge: 'Young Explorer',
      icon: Baby,
      description: 'Acquire sounds, animals, and rhythm through picture immersion, voice games, and musical cues. Zero reading or typing barriers.',
      features: [
        'Illustrated soundboards with tap-to-listen voice feedback',
        'Playful animal mascots celebrating correct pronunciation',
        'COPPA-compliant safe haven with all external links disabled',
        'Multi-sensory color and sound associations',
      ],
      samplePhrase: '¡Mira el perrito! 🐶',
      sampleTranslation: 'Look at the little dog!',
    },
    juniors: {
      title: 'Ages 6 to 12: Quest & Story Immersion',
      badge: 'Junior Adventurer',
      icon: Smile,
      description: 'Branching interactive comic stories and audio puzzles that naturally instill grammar without repetitive grammar drills.',
      features: [
        'Interactive dialogue adventures with choice-driven outcomes',
        'Word-assembly sentence builders with acoustic feedback',
        'Daily Streak Shields preventing demotivating progress loss',
        'Curated cultural etiquette stories from around the globe',
      ],
      samplePhrase: '¡Vamos a explorar la isla mágica! 🏝️',
      sampleTranslation: "Let's explore the magic island!",
    },
    teens: {
      title: 'Ages 13 to 17: Social & Travel Confidence',
      badge: 'Teen Practical',
      icon: GraduationCap,
      description: 'Master practical communication for music, sports, study exchanges, online friendships, and international travel.',
      features: [
        'Authentic slang nuances and conversational messaging simulations',
        'Speech acoustic lab with minimal-pair pitch discrimination',
        'Travel survival units: transit, markets, ordering street food',
        'Spaced repetition preparation for AP/IB language certifications',
      ],
      samplePhrase: '¿Tienes tiempo para tomar un helado después de clase?',
      sampleTranslation: 'Do you have time to grab an ice cream after class?',
    },
    adults: {
      title: 'Ages 18 & Beyond: Professional & CEFR Immersion',
      badge: 'Adult & Career',
      icon: Briefcase,
      description: 'Systematic CEFR progression (A1 to C2) powered by conversational AI recasting, SuperMemo SM-2 memory intervals, and real-world business scenarios.',
      features: [
        'Empathetic AI tutor delivering natural recasting rather than red-pen corrections',
        'Scientific SuperMemo SM-2 memory optimization with Leitner review schedules',
        'Full business negotiation, dining courtesies, and clinic roleplays',
        'Precision phoneme-level speech shadowing and slow 0.75x audio playback',
      ],
      samplePhrase: 'Quisiera reservar una mesa para dos personas en la terraza, por favor.',
      sampleTranslation: 'I would like to reserve a table for two on the terrace, please.',
    },
  };

  const activeAge = ageData[selectedAgeTab];
  const AgeIcon = activeAge.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Platform Showcase Bar */}
      <section className="bg-emerald-900 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
              Website Variant
            </span>
            <span>Welcome to Speak Dolphin’s official portal & interactive language catalog</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchMobileApp}
              className="flex items-center gap-1.5 text-emerald-200 hover:text-white transition-colors underline font-medium"
            >
              <Smartphone size={13} />
              <span>Preview Mobile App (PWA)</span>
            </button>
            <span className="text-emerald-700">|</span>
            <button
              onClick={onLaunchWebApp}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-2.5 py-1 rounded transition-colors"
            >
              <Laptop size={13} />
              <span>Open Full Web App Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-emerald-50/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-5 shadow-2xs">
              <Sparkles size={14} className="text-emerald-600 animate-spin" />
              <span>{SUPPORTED_LANGUAGES.length} Global Languages · Leonardo AI Assistant · 3 Native Platform Experiences</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Speak with Freedom. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Connect with the World.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Speak Dolphin pairs human-centered linguistics with Leonardo—our coordinated 1,000-agent intelligent AI learning companion,
              scientific SuperMemo SM-2 spaced repetition, and culturally rich stories across European, Asian, and African languages.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onLaunchWebApp}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <span>Launch Web App Immersion Studio</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onLaunchMobileApp}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-2xs transition-all"
              >
                <Smartphone size={16} className="text-emerald-600" />
                <span>Switch to Mobile PWA Experience</span>
              </button>

              <a
                href="/speak-dolphin-prompts-compilation.pdf"
                download="speak-dolphin-prompts-compilation.pdf"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-sm shadow-2xs transition-all"
                title="Download merged PDF of all prompts used to build Speak Dolphin"
              >
                <FileDown size={16} className="text-emerald-700" />
                <span>Download Prompts PDF</span>
              </a>
            </div>

            {/* Language Quick Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200/70">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Supported Across {SUPPORTED_LANGUAGES.length} World Languages
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setActiveCatalogLang(lang);
                      onSelectLanguage(lang.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeCatalogLang.id === lang.id
                        ? 'bg-emerald-600 text-white shadow-xs font-bold scale-105'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Language Showcase & Audio Sampler */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Linguistic Showcase
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Explore Our {SUPPORTED_LANGUAGES.length} Supported Languages
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Listen to native greetings and discover unique tonal, grammatical, and cultural attributes.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Language Selector List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setActiveCatalogLang(lang);
                      onSelectLanguage(lang.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      activeCatalogLang.id === lang.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="font-bold text-sm leading-tight">{lang.name}</div>
                        <div className={`text-xs ${activeCatalogLang.id === lang.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      activeCatalogLang.id === lang.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lang.family.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Detail Panel */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{activeCatalogLang.flag}</span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{activeCatalogLang.name}</h3>
                        <div className="text-xs text-slate-500 font-medium">
                          {activeCatalogLang.nativeName} · Family: {activeCatalogLang.family}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                      BCP-47: {activeCatalogLang.bcp47}
                    </span>
                  </div>

                  {/* Sample Greeting & Audio Player */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 mb-5">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                      Native Greeting & Audio Sample
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-slate-900">
                        "{activeCatalogLang.sampleGreeting}"
                      </div>
                      <AudioButton
                        text={activeCatalogLang.sampleGreeting}
                        lang={activeCatalogLang.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Unique Linguistic Features */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Key Linguistic Distinctions
                    </h4>
                    <ul className="space-y-2">
                      {activeCatalogLang.uniqueFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Includes starter curriculum, minimal pronunciation pairs, and interactive cultural stories.
                  </span>
                  <button
                    onClick={() => {
                      onSelectLanguage(activeCatalogLang.id);
                      onLaunchWebApp();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all"
                  >
                    <span>Practice {activeCatalogLang.name}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Differentiated Pedagogy Tabs */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Pedagogical Framework
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Engineered for Every Stage of Life
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Language acquisition principles differ profoundly by age. Speak Dolphin tailors interface complexity,
              feedback styles, and content themes to each learner.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
              {(['kids', 'juniors', 'teens', 'adults'] as const).map((tab) => {
                const TabIcon = ageData[tab].icon;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedAgeTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedAgeTab === tab
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TabIcon size={14} />
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <AgeIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeAge.title}</h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeAge.badge}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">{activeAge.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {activeAge.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                  Age-Calibrated Sample Phrase
                </div>
                <div className="text-sm font-semibold text-slate-900">"{activeAge.samplePhrase}"</div>
                <div className="text-xs text-slate-500">{activeAge.sampleTranslation}</div>
              </div>
              <AudioButton
                text={activeAge.samplePhrase}
                lang="es"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shadow-2xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing & Lead Bank Direct Checking Rails */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Membership & Investment
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Transparent, High-Value Subscriptions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Accessible learning with credit card, automated ACH debit, and direct bank wire integration to Lead Bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Explorer Free</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">$0</div>
                <div className="text-xs text-slate-500 mt-1">Forever free for casual learners</div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>1 target language</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>5 daily AI tutor turns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Basic SRS flashcards (20/day)</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onLaunchWebApp}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
              >
                Start Free Exploration
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-emerald-50/60 to-white border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow-2xs">
                Most Popular
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Speak Dolphin Pro</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  $12.99 <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Or $99/year (Save 36%)</div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 font-bold" />
                    <span>All 15 languages unlocked & Leonardo AI Agent Team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 font-bold" />
                    <span>Unlimited AI conversational dialogues</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 font-bold" />
                    <span>Full Speech Lab with acoustic feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 font-bold" />
                    <span>2 Monthly Streak Shields included</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors shadow-2xs"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Family Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Family & Educator</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  $24.99 <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Up to 5 learner profiles</div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Everything in Pro for 5 accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Parent Dashboard with PIN lock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Educator curriculum assignments</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
              >
                Choose Family Plan
              </button>
            </div>
          </div>

          {/* Official Bank Account Rails Verification Banner */}
          <div className="mt-10 max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Building size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Official Lead Bank Checking & Wire Integration Active
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Beneficiary: {OFFICIAL_BANK_ACCOUNT_DETAILS.beneficiaryName} · Routing: {OFFICIAL_BANK_ACCOUNT_DETAILS.routingNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWireDetails(!showWireDetails)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                {showWireDetails ? 'Hide Bank Details' : 'View Wire / ACH Details'}
              </button>
            </div>

            {showWireDetails && (
              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border">
                <div>
                  <span className="font-semibold text-slate-500">Bank Name:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.bankName}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Account Type:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.accountType}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Routing Number:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.routingNumber}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Account Number:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.accountNumber}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Bank Address:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.bankAddress}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Beneficiary Email:</span> {OFFICIAL_BANK_ACCOUNT_DETAILS.beneficiaryEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐬</span>
            <span className="text-lg font-bold text-white tracking-tight">Speak Dolphin</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <button onClick={onLaunchWebApp} className="hover:text-white transition-colors">
              Web App Studio
            </button>
            <button onClick={onLaunchMobileApp} className="hover:text-white transition-colors">
              Mobile App PWA
            </button>
            <button onClick={onOpenPricing} className="hover:text-white transition-colors">
              Pricing & Bank Wire
            </button>
            <a
              href="/speak-dolphin-prompts-compilation.pdf"
              download="speak-dolphin-prompts-compilation.pdf"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
            >
              <FileDown size={13} />
              <span>Download Prompts PDF</span>
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>© {new Date().getFullYear()} Speak Dolphin. Intelligent Language Learning Ecosystem.</div>
          <div>Verified Lead Bank Checking Integration · Support: unconomics@gmail.com</div>
        </div>
      </footer>
    </div>
  );
};
