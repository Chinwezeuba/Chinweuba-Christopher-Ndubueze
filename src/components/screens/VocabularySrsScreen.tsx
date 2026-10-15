import React, { useState } from 'react';
import {
  BrainCircuit,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  RotateCw,
  Plus,
  Flame,
  Award,
  Layers,
} from 'lucide-react';
import { UserProfile, SrsItem } from '../../types';
import { getStoredSrsItems, saveSrsItems, calculateSm2, isItemDue, getMasteryStage } from '../../utils/srs';
import { AudioButton } from '../common/AudioButton';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { speakText } from '../../utils/speech';

interface VocabularySrsScreenProps {
  currentUser: UserProfile;
}

export const VocabularySrsScreen: React.FC<VocabularySrsScreenProps> = ({
  currentUser,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const [items, setItems] = useState<SrsItem[]>(() => getStoredSrsItems(currentUser.targetLanguage));
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<'card' | 'typing'>('card');
  const [typedInput, setTypedInput] = useState('');
  const [typedChecked, setTypedChecked] = useState(false);

  // Cards currently due today
  const dueItems = items.filter(isItemDue);
  const currentCard: SrsItem | undefined = dueItems[activeItemIndex];

  const handleGrade = (grade: number) => {
    if (!currentCard) return;

    const updated = calculateSm2(currentCard, grade);

    // Save back to master list
    const updatedList = items.map((item) => (item.id === currentCard.id ? updated : item));
    setItems(updatedList);
    saveSrsItems(updatedList);

    // Reset card flip & input
    setIsFlipped(false);
    setTypedInput('');
    setTypedChecked(false);

    // Move to next card if available
    if (activeItemIndex < dueItems.length - 1) {
      setActiveItemIndex((prev) => prev + 1);
    } else {
      setActiveItemIndex(0);
    }
  };

  const handleCheckTyped = () => {
    setTypedChecked(true);
    setIsFlipped(true);
  };

  // Stats calculation
  const masteredCount = items.filter((i) => getMasteryStage(i) === 'Mastered').length;
  const reviewingCount = items.filter((i) => getMasteryStage(i) === 'Reviewing').length;
  const learningCount = items.filter((i) => getMasteryStage(i) === 'Learning').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Spaced Repetition Workspace (SM-2)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Active recall scheduler calibrated to your personal memory decay curve
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setReviewMode('card');
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reviewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Flip Cards
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewMode('typing');
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reviewMode === 'typing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Active Typing Recall
            </button>
          </div>
        </div>

        {/* Retention Pipeline Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <div className="text-xs text-slate-400 font-medium">Stage 1: Learning</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{learningCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Initial encounters</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <div className="text-xs text-slate-400 font-medium">Stage 2: Reviewing</div>
            <div className="text-2xl font-bold text-teal-600 mt-1">{reviewingCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Expanding intervals</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <div className="text-xs text-slate-400 font-medium">Stage 3: Mastered</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{masteredCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Long-term memory</div>
          </div>
        </div>

        {/* Flashcard Active Review Area */}
        {currentCard ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg text-center space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-700">
                Card {activeItemIndex + 1} of {dueItems.length} due today
              </span>
              <span>
                Ease Factor: {currentCard.easeFactor} · Interval: {currentCard.intervalDays}d
              </span>
            </div>

            {/* Front of Card */}
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {currentCard.partOfSpeech}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                {currentCard.term}
              </div>
              {currentCard.phonetic && (
                <div className="text-xs font-mono text-slate-500 mt-1">[{currentCard.phonetic}]</div>
              )}

              <div className="mt-4 flex justify-center gap-2">
                <AudioButton text={currentCard.term} lang={currentLang.id} size="md" label="Pronounce" />
                <AudioButton text={currentCard.term} lang={currentLang.id} isSlow size="md" label="Slow" />
              </div>
            </div>

            {/* Active Typing Mode Input */}
            {reviewMode === 'typing' && !typedChecked && (
              <div className="max-w-md mx-auto space-y-3 pt-4">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Type translation or target word from memory..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-900 focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleCheckTyped}
                  disabled={!typedInput.trim()}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  Verify Active Recall
                </button>
              </div>
            )}

            {/* Back of Card (Hidden until flip) */}
            {(!isFlipped && reviewMode === 'card') ? (
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(true);
                    speakText(currentCard.exampleSentence || currentCard.term, currentLang.id);
                  }}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
                >
                  <RotateCw size={16} />
                  <span>Reveal Meaning & Usage</span>
                </button>
              </div>
            ) : isFlipped ? (
              <div className="pt-6 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Translation:</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{currentCard.translation}</div>
                </div>

                {currentCard.exampleSentence && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Context Example:</div>
                    <div className="text-sm font-semibold text-slate-900">"{currentCard.exampleSentence}"</div>
                    <div className="text-xs text-slate-500">{currentCard.exampleTranslation}</div>
                  </div>
                )}

                {currentCard.culturalNote && (
                  <div className="text-xs text-purple-900 bg-purple-50 p-3 rounded-xl border border-purple-200 text-left">
                    🌐 <strong>Cultural Nuance:</strong> {currentCard.culturalNote}
                  </div>
                )}

                {/* SM-2 Recall Grading Buttons */}
                <div className="pt-4">
                  <div className="text-xs font-bold text-slate-700 mb-2">How easily did you recall this?</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
                    <button
                      type="button"
                      onClick={() => handleGrade(0)}
                      className="p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 font-bold text-xs transition-colors"
                    >
                      <div>Blackout (0)</div>
                      <div className="text-[10px] font-normal text-red-700 mt-0.5">Repeat in 1 day</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGrade(3)}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors"
                    >
                      <div>Hesitated (3)</div>
                      <div className="text-[10px] font-normal text-amber-700 mt-0.5">Needed effort</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGrade(4)}
                      className="p-3 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs transition-colors"
                    >
                      <div>Good (4)</div>
                      <div className="text-[10px] font-normal text-teal-700 mt-0.5">Accurate recall</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGrade(5)}
                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors"
                    >
                      <div>Easy (5)</div>
                      <div className="text-[10px] font-normal text-emerald-700 mt-0.5">Effortless</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">All Due Reviews Completed!</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Your memory traces have been reinforced for today according to the SuperMemo SM-2 interval curves.
            </p>
          </div>
        )}

        {/* Master SRS Bank Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vocabulary Bank & Next Intervals</h3>
              <p className="text-xs text-slate-500">Tracked spaced items across your curriculum</p>
            </div>
            <span className="text-xs text-slate-400">{items.length} items registered</span>
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const stage = getMasteryStage(item);
              const due = isItemDue(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white text-xs"
                >
                  <div className="flex items-center gap-3">
                    <AudioButton text={item.term} lang={item.languageId} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900">{item.term}</div>
                      <div className="text-slate-500">{item.translation}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stage === 'Mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stage === 'Reviewing'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {stage}
                    </span>
                    <span className="text-slate-400">
                      {due ? 'Due today' : `Next in ${item.intervalDays}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
