import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Volume2,
  Brain,
  Sparkles,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, CefrLevel } from '../../types';
import { speakText } from '../../utils/speech';
import { saveCurrentUser } from '../../utils/storage';

interface PlacementScreenProps {
  currentUser: UserProfile;
  onPlacementComplete: (updatedUser: UserProfile) => void;
  onSkipToBeginner: () => void;
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({
  currentUser,
  onPlacementComplete,
  onSkipToBeginner,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: string; isCorrect: boolean; answer: string }>>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    estimatedLevel: CefrLevel;
    levelLabel: string;
    skillScores: {
      vocabulary: number;
      listening: number;
      grammar: number;
      speakingReadiness: number;
    };
    rationale: string;
    recommendedFocusAreas: string[];
  } | null>(null);

  // Multilingual placement questions tailored to target language
  const placementQuestionsByLang: Record<
    string,
    Array<{
      id: string;
      category: 'vocabulary' | 'listening' | 'grammar' | 'production';
      prompt: string;
      audioText?: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>
  > = {
    es: [
      {
        id: 'q-es-1',
        category: 'vocabulary',
        prompt: 'Select the most accurate translation for: "Quisiera pedir la cuenta, por favor."',
        options: [
          'I want to reserve a hotel room, please.',
          'I would like to ask for the bill, please.',
          'Where is the nearest train station, please?',
          'Could you bring more water, please?',
        ],
        correctAnswer: 'I would like to ask for the bill, please.',
        explanation: '"Quisiera" is polite conditional "I would like", and "la cuenta" is the bill.',
      },
      {
        id: 'q-es-2',
        category: 'listening',
        prompt: 'Listen to the announcement and answer: What time does the train depart?',
        audioText: 'Atención señores pasajeros: El tren con destino a Sevilla sale a las cinco y media de la tarde.',
        options: ['4:15 PM', '5:00 PM', '5:30 PM', '6:30 PM'],
        correctAnswer: '5:30 PM',
        explanation: '"Las cinco y media" corresponds to 5:30 PM.',
      },
      {
        id: 'q-es-3',
        category: 'grammar',
        prompt: 'Complete the sentence: "Cuando nosotros ________ en Barcelona, visitamos la Sagrada Familia."',
        options: ['estuvimos', 'estábamos', 'fuimos', 'estamos'],
        correctAnswer: 'estuvimos',
        explanation: '"Estuvimos" is the preterite of estar indicating a completed past stay.',
      },
      {
        id: 'q-es-4',
        category: 'production',
        prompt: 'Which phrase is the natural, courteous way to order in a café?',
        options: [
          'Dame un café ahora mismo.',
          'Un café con leche, por favor.',
          'Yo debo tomar café.',
          'Tener café para mí.',
        ],
        correctAnswer: 'Un café con leche, por favor.',
        explanation: 'Brief polite formulation with "por favor" is standard across the Spanish-speaking world.',
      },
    ],
    fr: [
      {
        id: 'q-fr-1',
        category: 'vocabulary',
        prompt: 'Que signifie "Je voudrais une carafe d’eau, s’il vous plaît" ?',
        options: [
          'I want a cup of hot tea.',
          'I would like a pitcher of tap water, please.',
          'Where is the restroom?',
          'Could I see the wine list?',
        ],
        correctAnswer: 'I would like a pitcher of tap water, please.',
        explanation: '"Une carafe d’eau" is standard French for a complimentary pitcher of water.',
      },
      {
        id: 'q-fr-2',
        category: 'listening',
        prompt: 'Écoutez : quel moyen de transport est mentionné ?',
        audioText: 'Prenez la ligne quatre du métro en direction de Montparnasse.',
        options: ['Le bus', 'Le train à grande vitesse', 'Le métro', 'Le taxi'],
        correctAnswer: 'Le métro',
        explanation: '"La ligne quatre du métro" refers to metro subway line 4.',
      },
    ],
  };

  const questions = placementQuestionsByLang[currentUser.targetLanguage] || placementQuestionsByLang['es'];
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (opt: string) => {
    setSelectedAnswer(opt);
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newAnswers = [...answers, { questionId: currentQ.id, isCorrect, answer: selectedAnswer }];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Evaluate results
      setIsEvaluating(true);
      try {
        const response = await fetch('/api/placement-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: newAnswers,
            targetLanguage: currentUser.targetLanguage,
            ageGroup: currentUser.ageGroup,
            learningGoal: currentUser.learningGoal,
          }),
        });

        if (response.ok) {
          const evalData = await response.json();
          setEvaluationResult(evalData);
        } else {
          // Fallback evaluation
          calculateFallbackEvaluation(newAnswers);
        }
      } catch {
        calculateFallbackEvaluation(newAnswers);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const calculateFallbackEvaluation = (ansList: Array<{ isCorrect: boolean }>) => {
    const correctCount = ansList.filter((a) => a.isCorrect).length;
    const ratio = correctCount / ansList.length;

    let cefr: CefrLevel = 'A1';
    let label = 'Beginner Foundations';
    if (ratio >= 0.75) {
      cefr = 'B1';
      label = 'Intermediate Communicator';
    } else if (ratio >= 0.5) {
      cefr = 'A2';
      label = 'Elementary Practical';
    }

    setEvaluationResult({
      estimatedLevel: cefr,
      levelLabel: label,
      skillScores: {
        vocabulary: Math.round(ratio * 80 + 20),
        listening: Math.round(ratio * 70 + 25),
        grammar: Math.round(ratio * 75 + 20),
        speakingReadiness: Math.round(ratio * 65 + 30),
      },
      rationale: `You demonstrated strong core recognition of everyday expressions with excellent potential for rapid conversational expansion.`,
      recommendedFocusAreas: [
        `Everyday conversational courtesies & requests`,
        `Listening comprehension in realistic environments`,
        `Sentence construction for spontaneous dialogue`,
      ],
    });
  };

  const handleFinishAndStart = () => {
    if (!evaluationResult) return;
    const updated: UserProfile = {
      ...currentUser,
      currentCefr: evaluationResult.estimatedLevel,
      totalXp: currentUser.totalXp + 100,
    };
    saveCurrentUser(updated);
    onPlacementComplete(updated);
  };

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <Loader2 size={36} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Analyzing Your Skills</h2>
          <p className="text-xs text-slate-500 mt-2">
            Evaluating vocabulary depth, listening comprehension, and grammar readiness to generate your personal path...
          </p>
        </div>
      </div>
    );
  }

  if (evaluationResult) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles size={14} />
              <span>Assessment Complete</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Your Recommended Starting Level: {evaluationResult.estimatedLevel}
            </h1>
            <p className="text-sm font-semibold text-emerald-700 mt-1">{evaluationResult.levelLabel}</p>
          </div>

          {/* Sub-skill score meters */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Vocabulary', score: evaluationResult.skillScores.vocabulary },
              { label: 'Listening', score: evaluationResult.skillScores.listening },
              { label: 'Grammar', score: evaluationResult.skillScores.grammar },
              { label: 'Speaking', score: evaluationResult.skillScores.speakingReadiness },
            ].map((skill, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">{skill.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{skill.score}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
            <div className="font-bold text-emerald-900 mb-1">Pedagogical Rationale:</div>
            {evaluationResult.rationale}
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Recommended Focus Areas:
            </div>
            <div className="space-y-2">
              {evaluationResult.recommendedFocusAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleFinishAndStart}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md"
            >
              <span>Go to Personalized Lessons</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="text-xs text-slate-500 capitalize">Category: {currentQ.category}</div>
          </div>
          <button
            type="button"
            onClick={onSkipToBeginner}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Skip to A1 Beginner
          </button>
        </div>

        {/* Question body */}
        <div className="mt-6">
          <h2 className="text-base font-bold text-slate-900 leading-snug">{currentQ.prompt}</h2>

          {/* Audio player if listening question */}
          {currentQ.audioText && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Click to hear the audio prompt:</span>
              <button
                type="button"
                onClick={() => speakText(currentQ.audioText!, currentUser.targetLanguage)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-2xs hover:bg-emerald-700"
              >
                <Volume2 size={16} />
                <span>Play Audio</span>
              </button>
            </div>
          )}

          {/* Options */}
          <div className="mt-6 space-y-2.5">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
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
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-opacity"
          >
            <span>{currentQuestionIndex + 1 === questions.length ? 'Evaluate Skills' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
