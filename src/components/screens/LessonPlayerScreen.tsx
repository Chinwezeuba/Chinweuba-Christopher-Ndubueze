import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Volume2,
  Clock,
  BookOpen,
  Award,
  RefreshCw,
  Lightbulb,
  Flame,
} from 'lucide-react';
import { LessonUnit, UserProfile, Exercise, SrsItem, AchievementBadge } from '../../types';
import { AudioButton } from '../common/AudioButton';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { speakText } from '../../utils/speech';
import { getStoredSrsItems, saveSrsItems } from '../../utils/srs';
import { saveCurrentUser } from '../../utils/storage';
import { updateStreakOnLessonComplete, getLocalDateString } from '../../utils/streak';
import { evaluateAndAwardAchievements } from '../../utils/achievements';

interface LessonPlayerScreenProps {
  lesson: LessonUnit;
  currentUser: UserProfile;
  onComplete: (updatedUser?: UserProfile) => void;
  onExit: () => void;
}

export const LessonPlayerScreen: React.FC<LessonPlayerScreenProps> = ({
  lesson,
  currentUser,
  onComplete,
  onExit,
}) => {
  // Stages:
  // 0: Warm-up
  // 1: New Input (Vocabulary & Context)
  // 2: Grammar Insight
  // 3: Interactive Practice (Loop through exercises)
  // 4: Real-Life Challenge
  // 5: Lesson Completion & Review Scheduling
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [builtSentenceWords, setBuiltSentenceWords] = useState<string[]>([]);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [speechRecordedText, setSpeechRecordedText] = useState<string>('');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<AchievementBadge[]>([]);
  const [wasPerfectLesson, setWasPerfectLesson] = useState<boolean>(false);
  const [finishedUser, setFinishedUser] = useState<UserProfile>(currentUser);
  const [streakResult, setStreakResult] = useState<{
    currentStreak: number;
    streakIncreased: boolean;
    isFirstToday: boolean;
  }>({
    currentStreak: currentUser.streakDays || 0,
    streakIncreased: false,
    isFirstToday: false,
  });

  const currentExercise: Exercise | undefined = lesson.exercises[exerciseIndex];

  const handleSelectOption = (opt: string) => {
    if (hasCheckedAnswer) return;
    setSelectedAnswer(opt);
  };

  const handleToggleWordInSentence = (word: string) => {
    if (hasCheckedAnswer) return;
    setBuiltSentenceWords((prev) => [...prev, word]);
  };

  const handleRemoveWordFromSentence = (index: number) => {
    if (hasCheckedAnswer) return;
    setBuiltSentenceWords((prev) => prev.filter((_, i) => i !== index));
  };

  const checkExercise = () => {
    if (!currentExercise) return;

    let correct = false;
    if (currentExercise.type === 'sentence_builder') {
      const sentence = builtSentenceWords.join(' ').trim();
      correct = sentence === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'speaking_shadow') {
      // If user spoke or typed, evaluate similarity
      correct = speechRecordedText.length > 0;
    } else {
      correct = selectedAnswer === currentExercise.correctAnswer;
    }

    if (!correct) {
      setMistakesCount((prev) => prev + 1);
    }

    setIsAnswerCorrect(correct);
    setHasCheckedAnswer(true);
  };

  const handleNextExercise = () => {
    setHasCheckedAnswer(false);
    setSelectedAnswer(null);
    setBuiltSentenceWords([]);
    setShowHint(false);
    setSpeechRecordedText('');

    if (exerciseIndex + 1 < lesson.exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      // Transition to Real-Life Challenge
      setCurrentStage(4);
    }
  };

  const handleFinishLesson = () => {
    // 1. Calculate and update daily streak
    const { updatedUser: userWithStreak, streakIncreased, isFirstToday, currentStreak } =
      updateStreakOnLessonComplete(currentUser);

    // 2. Schedule vocabulary items into Spaced Repetition (SRS)
    const existingSrs = getStoredSrsItems(currentUser.targetLanguage);
    const newCards: SrsItem[] = lesson.newInputVocab.map((vocab, i) => ({
      id: `srs-${lesson.id}-${i}-${Date.now()}`,
      languageId: currentUser.targetLanguage,
      term: vocab.term,
      translation: vocab.translation,
      phonetic: vocab.phonetic,
      partOfSpeech: 'phrase',
      exampleSentence: vocab.collocation || vocab.context,
      exampleTranslation: vocab.translation,
      audioText: vocab.term,
      intervalDays: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      history: [],
    }));

    // Merge without duplicating terms
    const merged = [...existingSrs];
    for (const card of newCards) {
      if (!merged.some((c) => c.term.toLowerCase() === card.term.toLowerCase())) {
        merged.push(card);
      }
    }
    saveSrsItems(merged);

    // 3. Update user completed lessons & XP
    const completedSet = new Set(userWithStreak.completedLessonIds || []);
    completedSet.add(lesson.id);

    const isPerfect = mistakesCount === 0;
    setWasPerfectLesson(isPerfect);

    const todayStr = getLocalDateString();
    const prevEarnedToday = userWithStreak.dailyXpDate === todayStr ? (userWithStreak.dailyXpEarnedToday || 0) : 0;
    const prevLessonsToday = userWithStreak.dailyXpDate === todayStr ? (userWithStreak.dailyLessonsCompletedToday || 0) : 0;

    const baseUpdatedUser: UserProfile = {
      ...userWithStreak,
      completedLessonIds: Array.from(completedSet),
      totalWordsLearned: Math.max(userWithStreak.totalWordsLearned || 0, merged.length),
      totalXp: userWithStreak.totalXp + 60,
      dailyXpEarnedToday: prevEarnedToday + 60,
      dailyLessonsCompletedToday: prevLessonsToday + 1,
      dailyXpDate: todayStr,
      dailyTimeSpentTodayMinutes: userWithStreak.dailyTimeSpentTodayMinutes + lesson.estimatedMinutes,
    };

    // 4. Evaluate and award milestone badges (e.g. perfect_lesson, 7-day streak, 100 words, etc.)
    const { updatedUser: fullyUpdatedUser, newlyUnlockedBadges: earnedBadges } =
      evaluateAndAwardAchievements(baseUpdatedUser, {
        isPerfectLesson: isPerfect,
        wordsCountOverride: baseUpdatedUser.totalWordsLearned,
      });

    saveCurrentUser(fullyUpdatedUser);
    setFinishedUser(fullyUpdatedUser);
    setNewlyUnlockedBadges(earnedBadges);
    setStreakResult({ currentStreak, streakIncreased, isFirstToday });

    // 5. Move to completion view
    setCurrentStage(5);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col justify-between">
      <div className="mx-auto max-w-3xl w-full">
        {/* Lesson Header Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            <span>Exit Lesson</span>
          </button>

          {/* Stepper bar */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`h-2 w-6 rounded-full transition-all ${
                  s === currentStage
                    ? 'bg-emerald-600 w-8'
                    : s < currentStage
                    ? 'bg-emerald-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-700">
              {lesson.level} · {lesson.topic}
            </div>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-leonardo'));
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition-all shadow-2xs hover:scale-105"
              title="Ask Leonardo AI for help with this lesson"
            >
              <span className="text-sm">🐬</span>
              <span>Ask Leonardo</span>
            </button>
          </div>
        </div>

        {/* STAGE 0: WARM-UP */}
        {currentStage === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Stage 1 of 5: Active Warm-Up</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Recall Core Foundations</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Before introducing new expressions, let's briefly activate previously established vocabulary in your mind.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {lesson.warmupTerms.map((term, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-base font-bold text-slate-900">{term}</div>
                    <div className="text-xs text-slate-400">Core phrase</div>
                  </div>
                  <AudioButton text={term} lang={lesson.languageId} size="sm" />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStage(1)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <span>Continue to New Input</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 1: NEW INPUT (VOCABULARY & CONTEXT) */}
        {currentStage === 1 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              <BookOpen size={14} />
              <span>Stage 2 of 5: Comprehensible Input</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">New Language in Context</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Listen to the pronunciation, observe the phonetic cues, and note how these phrases are naturally used.
            </p>

            <div className="mt-6 space-y-4">
              {lesson.newInputVocab.map((vocab, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-900">{vocab.term}</span>
                      <span className="text-xs text-emerald-700 font-mono bg-emerald-100/60 px-2 py-0.5 rounded">
                        [{vocab.phonetic}]
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{vocab.translation}</div>
                    <div className="text-xs text-slate-500 mt-1">{vocab.context}</div>
                    {vocab.collocation && (
                      <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Collocation: </span>
                        "{vocab.collocation}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <AudioButton text={vocab.term} lang={lesson.languageId} size="sm" label="Normal" />
                    <AudioButton text={vocab.term} lang={lesson.languageId} isSlow size="sm" label="Slow" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStage(0)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStage(2)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <span>Grammar Insight</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: GRAMMAR INSIGHT */}
        {currentStage === 2 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
              <Lightbulb size={14} />
              <span>Stage 3 of 5: Structural Insight</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{lesson.grammarFocus.ruleTitle}</h2>
            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
              {lesson.grammarFocus.ruleExplanation}
            </div>

            <div className="mt-6">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Real Context Examples:
              </div>
              <div className="space-y-2.5">
                {lesson.grammarFocus.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{ex.target}</div>
                      <div className="text-xs text-slate-500">{ex.native}</div>
                    </div>
                    <AudioButton text={ex.target} lang={lesson.languageId} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStage(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStage(3);
                  setExerciseIndex(0);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <span>Begin Guided Practice</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: INTERACTIVE GUIDED PRACTICE */}
        {currentStage === 3 && currentExercise && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Exercise {exerciseIndex + 1} of {lesson.exercises.length}
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 transition-colors"
              >
                <HelpCircle size={14} />
                <span>{showHint ? 'Hide Hint' : 'Need Hint?'}</span>
              </button>
            </div>

            {showHint && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                💡 <strong>Hint:</strong> {currentExercise.explanation}
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-base font-bold text-slate-900">{currentExercise.prompt}</h2>

              {/* Audio prompt if listen_and_pick */}
              {currentExercise.audioPrompt && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Listen to the speaker:</span>
                  <div className="flex gap-2">
                    <AudioButton text={currentExercise.audioPrompt} lang={lesson.languageId} size="sm" label="Play Audio" />
                    <AudioButton text={currentExercise.audioPrompt} lang={lesson.languageId} isSlow size="sm" label="Slow" />
                  </div>
                </div>
              )}

              {/* Multiple Choice & Listen and Pick Options */}
              {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'listen_and_pick') && currentExercise.options && (
                <div className="mt-6 space-y-2.5">
                  {currentExercise.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      disabled={hasCheckedAnswer}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                        selectedAnswer === opt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Sentence Builder */}
              {currentExercise.type === 'sentence_builder' && currentExercise.options && (
                <div className="mt-6 space-y-6">
                  {/* Built sentence slot */}
                  <div className="min-h-14 p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-wrap items-center gap-2">
                    {builtSentenceWords.length === 0 ? (
                      <span className="text-xs text-slate-400">Click words below in correct order...</span>
                    ) : (
                      builtSentenceWords.map((word, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleRemoveWordFromSentence(i)}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs hover:border-red-400"
                        >
                          {word} ×
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word bank buttons */}
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.options.map((w, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleWordInSentence(w)}
                        disabled={hasCheckedAnswer}
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-xs active:scale-95 transition-all"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Speaking Shadow Practice */}
              {currentExercise.type === 'speaking_shadow' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Target Expression:</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{currentExercise.targetWord}</div>
                  </div>
                  <VoiceRecorder
                    targetPhrase={currentExercise.targetWord}
                    lang={lesson.languageId}
                    onTranscriptReady={(t) => setSpeechRecordedText(t)}
                  />
                </div>
              )}
            </div>

            {/* Checked Feedback Banner */}
            {hasCheckedAnswer && (
              <div
                className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed ${
                  isAnswerCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isAnswerCorrect ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Excellent! That's correct.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-amber-600" />
                      <span>Constructive Recast:</span>
                    </>
                  )}
                </div>
                <p>{currentExercise.explanation}</p>
                {currentExercise.culturalInsight && (
                  <p className="mt-1.5 font-medium text-emerald-800">
                    Cultural Note: {currentExercise.culturalInsight}
                  </p>
                )}
              </div>
            )}

            {/* Exercise Footer Controls */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              {!hasCheckedAnswer ? (
                <button
                  type="button"
                  onClick={checkExercise}
                  disabled={
                    currentExercise.type === 'sentence_builder'
                      ? builtSentenceWords.length === 0
                      : currentExercise.type === 'speaking_shadow'
                      ? false
                      : !selectedAnswer
                  }
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextExercise}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 4: REAL-LIFE CHALLENGE */}
        {currentStage === 4 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Award size={14} />
              <span>Stage 4 of 5: Practical Life Simulation</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Put It Into Practice</h2>
            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm text-purple-950 leading-relaxed">
              <div className="font-bold text-purple-900 mb-1">Scenario:</div>
              {lesson.realLifeChallenge.scenario}
            </div>

            <div className="mt-6">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Challenge Prompt:
              </div>
              <p className="text-sm font-semibold text-slate-900">{lesson.realLifeChallenge.prompt}</p>

              <div className="mt-4 space-y-2">
                <div className="text-xs text-slate-500 font-medium">Authentic response options:</div>
                {lesson.realLifeChallenge.suggestedResponses.map((resp, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">"{resp}"</span>
                    <AudioButton text={resp} lang={lesson.languageId} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleFinishLesson}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>Complete Lesson & Schedule Reviews</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: LESSON SUMMARY & REVIEW SCHEDULING */}
        {currentStage === 5 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
              <Award size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Lesson Successfully Completed!</h2>
            {/* Streak Milestone Celebration Banner */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-300 flex items-center justify-center gap-3 text-left max-w-md mx-auto">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Flame size={24} className="fill-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <span>
                    {streakResult.streakIncreased
                      ? `Streak Extended to ${streakResult.currentStreak} Days!`
                      : `Daily Streak Kept Alive! (${streakResult.currentStreak} Days)`}
                  </span>
                  <span>🔥</span>
                </div>
                <div className="text-xs text-amber-900 mt-0.5">
                  {streakResult.isFirstToday
                    ? 'Lesson completed for today! Your streak is preserved.'
                    : 'Consistency reinforced! Today was already secured.'}
                </div>
              </div>
            </div>

            {/* Perfect Lesson Celebration Banner */}
            {wasPerfectLesson && (
              <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-emerald-500/10 border border-emerald-300 flex items-center justify-center gap-3 text-left max-w-md mx-auto animate-in fade-in">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs text-xl">
                  ✨
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-950">
                    Perfect Lesson Score! 100% Accuracy
                  </div>
                  <div className="text-xs text-emerald-800 mt-0.5">
                    Zero errors on every exercise! Exceptional focus and mastery.
                  </div>
                </div>
              </div>
            )}

            {/* Newly Unlocked Badges Celebration */}
            {newlyUnlockedBadges.length > 0 && (
              <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/15 to-purple-500/10 border border-purple-300 text-center max-w-md mx-auto animate-in fade-in">
                <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                  🏆 New Milestone Badge Unlocked!
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {newlyUnlockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-purple-200 shadow-2xs text-left"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{badge.title}</div>
                        <div className="text-[10px] text-purple-700 font-semibold">
                          +{badge.rewardXp} XP Awarded
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 inline-flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <div className="font-bold text-emerald-700 text-lg">+60 XP</div>
                <div className="text-slate-400">Mastery Earned</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="font-bold text-slate-800 text-lg">+{lesson.newInputVocab.length} Cards</div>
                <div className="text-slate-400">Added to SM-2 SRS</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="font-bold text-amber-700 text-lg">100%</div>
                <div className="text-slate-400">Task Completion</div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => onComplete(finishedUser)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
