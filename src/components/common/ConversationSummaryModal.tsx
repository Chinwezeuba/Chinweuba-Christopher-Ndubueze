import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Award,
  BookOpen,
  MessageSquare,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Volume2,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  ThumbsUp,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { ConversationSessionSummary, ChatMessage, UserProfile } from '../../types';
import { speakText } from '../../utils/speech';

interface ConversationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ConversationSessionSummary | null;
  scenarioName: string;
  scenarioIcon: string;
  targetLanguageName: string;
  targetLanguageId: string;
  messages: ChatMessage[];
  onClaimXp?: (xp: number) => void;
  onRestartScenario?: () => void;
}

export const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  scenarioName,
  scenarioIcon,
  targetLanguageName,
  targetLanguageId,
  messages,
  onClaimXp,
  onRestartScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grammar' | 'vocabulary' | 'fluency'>('overview');
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  if (!isOpen || !summary) return null;

  const handleCopySummary = () => {
    const text = `🐬 Speak Dolphin AI Conversation Tutor Summary (${targetLanguageName} - ${scenarioName})
Overall Score: ${summary.overallScore}/100 (Level: ${summary.cefrDemonstrated})
Grammar: ${summary.grammar.score}/100 (${summary.grammar.rating})
Vocabulary: ${summary.vocabulary.score}/100 (${summary.vocabulary.rating})
Fluency: ${summary.fluency.score}/100 (${summary.fluency.rating})

Summary: ${summary.overallAssessment}

Next Steps:
${summary.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = () => {
    if (!xpClaimed && onClaimXp) {
      onClaimXp(summary.xpEarned);
      setXpClaimed(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 88) return 'bg-emerald-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-summary-title"
    >
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close summary modal"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" />
              {summary.isAiGenerated ? 'Gemini AI Performance Review' : 'Session Evaluation'}
            </span>
            <span className="text-xs font-medium text-emerald-100">
              {targetLanguageName} · CEFR {summary.cefrDemonstrated}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="tutor-summary-title" className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                <span>{scenarioIcon}</span>
                <span>Session Summary: {scenarioName}</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                {summary.overallAssessment}
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center sm:flex-col items-end sm:items-center bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shrink-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200 sm:mb-0.5 mr-2 sm:mr-0">
                Overall Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{summary.overallScore}</span>
                <span className="text-xs text-emerald-200 font-semibold">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar Scores Quick Bar */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/80 p-3 sm:p-4 gap-2 sm:gap-4 text-center">
          {/* Grammar */}
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left ${
              activeTab === 'grammar'
                ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <span>✍️</span> Grammar
              </span>
              <span className="text-emerald-700 font-black">{summary.grammar.score}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full ${getProgressBarColor(summary.grammar.score)}`}
                style={{ width: `${summary.grammar.score}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block truncate">
              {summary.grammar.rating}
            </span>
          </button>

          {/* Vocabulary */}
          <button
            type="button"
            onClick={() => setActiveTab('vocabulary')}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left ${
              activeTab === 'vocabulary'
                ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <span>📚</span> Vocabulary
              </span>
              <span className="text-blue-700 font-black">{summary.vocabulary.score}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full ${getProgressBarColor(summary.vocabulary.score)}`}
                style={{ width: `${summary.vocabulary.score}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block truncate">
              {summary.vocabulary.rating}
            </span>
          </button>

          {/* Fluency */}
          <button
            type="button"
            onClick={() => setActiveTab('fluency')}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left ${
              activeTab === 'fluency'
                ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <span>🗣️</span> Fluency
              </span>
              <span className="text-purple-700 font-black">{summary.fluency.score}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full ${getProgressBarColor(summary.fluency.score)}`}
                style={{ width: `${summary.fluency.score}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block truncate">
              {summary.fluency.rating}
            </span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-1 border-b border-slate-100 overflow-x-auto bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🌟 All-in-One Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'grammar'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ✍️ Grammar Feedback ({summary.grammar.corrections?.length || 0} corrections)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vocabulary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'vocabulary'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📚 Vocabulary ({summary.vocabulary.suggestedUpgrades?.length || 0} upgrades)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fluency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'fluency'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🗣️ Fluency & Flow
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Encouragement Card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                    Coach's Takeaway
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                    "{summary.encouragement}"
                  </p>
                </div>
              </div>

              {/* 3 Pillars Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Grammar highlight */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>✍️</span> Grammar
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {summary.grammar.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3">
                    {summary.grammar.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('grammar')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>View {summary.grammar.corrections?.length || 0} corrections</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {/* Vocabulary highlight */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>📚</span> Vocabulary
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {summary.vocabulary.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3">
                    {summary.vocabulary.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vocabulary')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View {summary.vocabulary.suggestedUpgrades?.length || 0} upgrades</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {/* Fluency highlight */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🗣️</span> Fluency
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {summary.fluency.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3">
                    {summary.fluency.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fluency')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <span>View pacing & flow tips</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Actionable Next Steps */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-emerald-600" />
                  <span>Action Items for Your Next Session</span>
                </h4>
                <ul className="space-y-2">
                  {summary.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="flex h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: GRAMMAR BREAKDOWN */}
          {activeTab === 'grammar' && (
            <div className="space-y-6">
              {/* Summary overview */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>✍️</span> Grammar Assessment ({summary.grammar.rating})
                  </h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    {summary.grammar.score} / 100
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  {summary.grammar.summary}
                </p>
              </div>

              {/* Grammatical Strengths */}
              {summary.grammar.strengths && summary.grammar.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Grammatical Strengths Demonstrated</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summary.grammar.strengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs text-xs text-slate-700"
                      >
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Corrections & Before/After */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-amber-600" />
                  <span>Specific Corrections & Explanations</span>
                </h4>

                {summary.grammar.corrections && summary.grammar.corrections.length > 0 ? (
                  <div className="space-y-3">
                    {summary.grammar.corrections.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                      >
                        {corr.rule && (
                          <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            Rule: {corr.rule}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Original phrase */}
                          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                              Your utterance
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-rose-950 line-through">
                              "{corr.original}"
                            </p>
                          </div>

                          {/* Corrected phrase */}
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                Recommended correction
                              </span>
                              <button
                                type="button"
                                onClick={() => speakText(corr.corrected, targetLanguageId)}
                                className="text-emerald-700 hover:text-emerald-900 transition-colors"
                                title="Listen to correction"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-emerald-950">
                              "{corr.corrected}"
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          💡 <strong>Why:</strong> {corr.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
                    🎉 Excellent grammar precision throughout! No significant grammatical errors were detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VOCABULARY USAGE */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              {/* Summary overview */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <span>📚</span> Vocabulary Usage ({summary.vocabulary.rating})
                  </h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-600 text-white">
                    {summary.vocabulary.score} / 100
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                  {summary.vocabulary.summary}
                </p>
              </div>

              {/* Strong Words Used */}
              {summary.vocabulary.strongUsage && summary.vocabulary.strongUsage.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ThumbsUp size={15} className="text-blue-600" />
                    <span>Effective Words Deployed by Learner</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {summary.vocabulary.strongUsage.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {w.word}
                            </span>
                            <button
                              type="button"
                              onClick={() => speakText(w.word, targetLanguageId)}
                              className="text-slate-400 hover:text-slate-700"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-500">{w.translation}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{w.context}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                          Used well
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Upgrades */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Vocabulary Upgrades: Sound More Like a Native</span>
                </h4>

                {summary.vocabulary.suggestedUpgrades && summary.vocabulary.suggestedUpgrades.length > 0 ? (
                  <div className="space-y-3">
                    {summary.vocabulary.suggestedUpgrades.map((upg, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 line-through">
                              {upg.used}
                            </span>
                            <ArrowRight size={14} className="text-slate-400" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                {upg.suggested}
                              </span>
                              <button
                                type="button"
                                onClick={() => speakText(upg.suggested, targetLanguageId)}
                                className="text-emerald-600 hover:text-emerald-800"
                                title="Listen"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Upgrade #{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Nuance:</strong> {upg.nuance}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center text-xs text-blue-800">
                    Solid lexical repertoire demonstrated throughout this scenario.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FLUENCY & FLOW */}
          {activeTab === 'fluency' && (
            <div className="space-y-6">
              {/* Summary overview */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                    <span>🗣️</span> Fluency & Interactive Dynamics ({summary.fluency.rating})
                  </h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-600 text-white">
                    {summary.fluency.score} / 100
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-900 leading-relaxed">
                  {summary.fluency.summary}
                </p>
              </div>

              {/* Fluency Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Turn Cadence
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {summary.fluency.turnTakingPace || 'Responsive'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Discourse Coherence
                  </span>
                  <span className="text-sm font-bold text-purple-700">
                    {summary.fluency.coherenceScore || 85}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Learner Turns
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {summary.totalUserTurns} exchanges
                  </span>
                </div>
              </div>

              {/* Flow Strengths */}
              {summary.fluency.strengths && summary.fluency.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-purple-600" />
                    <span>Fluency Strengths Observed</span>
                  </h4>
                  <div className="space-y-2">
                    {summary.fluency.strengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                      >
                        <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Tips for Flow */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Zap size={15} className="text-amber-500" />
                  <span>Pro-Tips for Natural Conversational Velocity</span>
                </h4>
                <div className="space-y-2.5">
                  {summary.fluency.tipsForFlow.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80 text-xs sm:text-sm text-purple-950 flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 rounded-full bg-purple-200 text-purple-800 font-bold text-[11px] items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transcript Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={15} className="text-slate-500" />
                <span>Review Full Session Transcript ({messages.length} messages)</span>
              </span>
              {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTranscript && (
              <div className="p-4 space-y-3 max-h-60 overflow-y-auto bg-slate-50/40 border-t border-slate-200">
                {messages.map((m, i) => (
                  <div
                    key={m.id || i}
                    className={`flex flex-col text-xs ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-2.5 rounded-xl ${
                        m.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="font-medium">{m.content}</p>
                      {m.translation && (
                        <p
                          className={`mt-1 text-[11px] pt-1 border-t ${
                            m.role === 'user' ? 'border-emerald-500 text-emerald-100' : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          {m.translation}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                      {m.role === 'user' ? 'You' : 'AI Tutor'} · {m.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            {onRestartScenario && (
              <button
                type="button"
                onClick={() => {
                  onRestartScenario();
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <RefreshCw size={14} />
                <span>Practice Again</span>
              </button>
            )}
          </div>

          {/* XP Claim or Done */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onClaimXp && !xpClaimed ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98"
              >
                <Zap size={16} className="text-amber-300" />
                <span>Claim +{summary.xpEarned} XP & Save</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {xpClaimed && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>+{summary.xpEarned} XP Claimed!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
