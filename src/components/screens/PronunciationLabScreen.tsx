import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Headphones,
  Award,
} from 'lucide-react';
import { UserProfile, MinimalPair } from '../../types';
import { MINIMAL_PAIRS, SUPPORTED_LANGUAGES } from '../../data/languages';
import { AudioButton } from '../common/AudioButton';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { speakText } from '../../utils/speech';

interface PronunciationLabScreenProps {
  currentUser: UserProfile;
}

export const PronunciationLabScreen: React.FC<PronunciationLabScreenProps> = ({
  currentUser,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const [activeTab, setActiveTab] = useState<'minimal_pairs' | 'shadowing' | 'dictation'>('minimal_pairs');

  // Filter minimal pairs for current language, fallback to Spanish
  const langPairs = MINIMAL_PAIRS.filter((p) => p.languageId === currentUser.targetLanguage);
  const pairsToUse = langPairs.length > 0 ? langPairs : MINIMAL_PAIRS.filter((p) => p.languageId === 'es');

  // Minimal pair game state
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [testedWordChoice, setTestedWordChoice] = useState<'A' | 'B'>('A');
  const [userGuess, setUserGuess] = useState<'A' | 'B' | null>(null);
  const [hasCheckedGuess, setHasCheckedGuess] = useState(false);

  const currentPair: MinimalPair = pairsToUse[selectedPairIndex];

  const handlePlayMysteryWord = () => {
    const wordToPlay = testedWordChoice === 'A' ? currentPair.wordA : currentPair.wordB;
    speakText(wordToPlay, currentPair.languageId, { slow: false });
  };

  const handleGuess = (choice: 'A' | 'B') => {
    setUserGuess(choice);
    setHasCheckedGuess(true);
  };

  const handleNextPair = () => {
    setUserGuess(null);
    setHasCheckedGuess(false);
    // Alternate or randomize target
    const nextTarget: 'A' | 'B' = Math.random() > 0.5 ? 'A' : 'B';
    setTestedWordChoice(nextTarget);
    setSelectedPairIndex((prev) => (prev + 1) % pairsToUse.length);
  };

  // Shadowing sentences
  const shadowingSentences = [
    {
      phrase: 'Disculpe, ¿dónde está la parada de metro?',
      translation: 'Excuse me, where is the metro stop?',
      focusTip: 'Keep vowels clipped without sliding; rise slightly on "¿dónde está...?"',
    },
    {
      phrase: 'Quisiera un café con leche templado, por favor.',
      translation: 'I would like a lukewarm coffee with milk, please.',
      focusTip: 'Stress the penultimate syllable of "quisiera" smoothly.',
    },
    {
      phrase: 'Es un placer enorme conocerle en persona.',
      translation: 'It is a huge pleasure to meet you in person.',
      focusTip: 'Enunciate the tap "r" lightly on "placer" and "conocerle".',
    },
  ];

  const [shadowingIndex, setShadowingIndex] = useState(0);
  const currentShadow = shadowingSentences[shadowingIndex];

  // Dictation exercise state
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState(false);
  const dictationTarget = 'Mañana salimos temprano para el aeropuerto.';

  const handleCheckDictation = () => {
    setDictationChecked(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <Headphones size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Listening & Pronunciation Laboratory
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Scientific acoustic discrimination & voice intelligibility training
              </p>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('minimal_pairs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'minimal_pairs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minimal Pairs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shadowing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'shadowing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sentence Shadowing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dictation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dictation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dictation Challenge
            </button>
          </div>
        </div>

        {/* TAB 1: MINIMAL PAIRS DISCRIMINATION */}
        {activeTab === 'minimal_pairs' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Acoustic Discrimination
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Distinguish Tricky Sound Contrasts
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Native speakers rely on subtle distinctions. Listen closely to the audio clip and decide which word was enunciated.
              </p>
            </div>

            {/* Phonetic Distinction Card */}
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950">
              <div className="font-bold text-teal-900 mb-1">Target Distinction:</div>
              <div className="text-sm font-semibold text-slate-800">{currentPair.distinctionKey}</div>
              <p className="mt-1 text-slate-600">{currentPair.soundHint}</p>
            </div>

            {/* Listen button */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-xs text-slate-500 font-medium">Click to hear the mystery word:</div>
              <button
                type="button"
                onClick={handlePlayMysteryWord}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md inline-flex items-center gap-2"
              >
                <Volume2 size={18} />
                <span>Play Sound Clip</span>
              </button>
            </div>

            {/* Word choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleGuess('A')}
                disabled={hasCheckedGuess}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  userGuess === 'A'
                    ? hasCheckedGuess
                      ? testedWordChoice === 'A'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600'
                        : 'border-amber-600 bg-amber-50 text-amber-950'
                      : 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl font-black text-slate-900">{currentPair.wordA}</div>
                <div className="text-xs text-slate-500 mt-1">{currentPair.meaningA}</div>
              </button>

              <button
                type="button"
                onClick={() => handleGuess('B')}
                disabled={hasCheckedGuess}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  userGuess === 'B'
                    ? hasCheckedGuess
                      ? testedWordChoice === 'B'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600'
                        : 'border-amber-600 bg-amber-50 text-amber-950'
                      : 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl font-black text-slate-900">{currentPair.wordB}</div>
                <div className="text-xs text-slate-500 mt-1">{currentPair.meaningB}</div>
              </button>
            </div>

            {/* Result banner */}
            {hasCheckedGuess && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  userGuess === testedWordChoice
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {userGuess === testedWordChoice ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Great ear! Correct distinction.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-amber-600" />
                      <span>
                        The spoken word was "{testedWordChoice === 'A' ? currentPair.wordA : currentPair.wordB}".
                      </span>
                    </>
                  )}
                </div>
                <p>{currentPair.soundHint}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextPair}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Next Contrast
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SENTENCE SHADOWING & VOICE RECORDER */}
        {activeTab === 'shadowing' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Sentence Shadowing
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Repeat and Match Acoustic Rhythm
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Listen to the model phrase at normal and slow speed, then speak it back into the microphone. We analyze intelligibility and cadence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-bold text-slate-900">"{currentShadow.phrase}"</div>
                  <div className="text-xs text-slate-500 mt-1">{currentShadow.translation}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AudioButton text={currentShadow.phrase} lang={currentLang.id} size="md" label="1.0x" />
                  <AudioButton text={currentShadow.phrase} lang={currentLang.id} isSlow size="md" label="0.75x" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Acoustic Focus: </span>
                {currentShadow.focusTip}
              </div>
            </div>

            {/* Live voice recorder for this shadowing phrase */}
            <VoiceRecorder
              targetPhrase={currentShadow.phrase}
              lang={currentLang.id}
            />

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShadowingIndex((prev) => (prev - 1 + shadowingSentences.length) % shadowingSentences.length)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Previous Sentence
              </button>
              <button
                type="button"
                onClick={() => setShadowingIndex((prev) => (prev + 1) % shadowingSentences.length)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Next Sentence
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DICTATION CHALLENGE */}
        {activeTab === 'dictation' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Auditory Dictation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Write What You Hear
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Test your ear on word boundaries, liaison connections, and spelling agreement. Listen to the sentence and type it accurately.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-xs text-slate-500 font-medium">Click to listen (play as many times as you need):</div>
              <div className="flex justify-center gap-2">
                <AudioButton text={dictationTarget} lang={currentLang.id} size="md" label="Play Full Speed" />
                <AudioButton text={dictationTarget} lang={currentLang.id} isSlow size="md" label="Play Slow" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Type the sentence exactly as spoken:
              </label>
              <input
                type="text"
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                placeholder="Type here..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-emerald-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCheckDictation}
                disabled={!dictationInput.trim()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Check Dictation
              </button>
            </div>

            {dictationChecked && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Target Model Sentence:</div>
                <div className="text-sm font-semibold text-emerald-800">"{dictationTarget}"</div>
                <div className="text-slate-500">Translation: "Tomorrow we leave early for the airport."</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
