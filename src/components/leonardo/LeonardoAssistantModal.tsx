import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  X,
  Trash2,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Zap,
  CreditCard,
  Layers,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Globe,
  Settings2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Compass,
} from 'lucide-react';
import {
  UserProfile,
  LeonardoMessage,
  LeonardoAgentTeam,
  LeonardoAction,
  LeonardoChatResponse,
} from '../../types';
import { LEONARDO_TEAMS } from '../../server/leonardoService';
import {
  getStoredLeonardoHistory,
  saveLeonardoHistory,
  clearLeonardoHistory,
  createInitialLeonardoGreeting,
  getLeonardoConsent,
  setLeonardoConsent,
} from '../../utils/leonardoStorage';
import { speakText, isSpeechRecognitionSupported, createSpeechRecognizer } from '../../utils/speech';

interface LeonardoAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentScreen?: string;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigate?: (screen: string) => void;
  onActionTrigger?: (action: LeonardoAction) => void;
  onAddXp?: (amount: number) => void;
}

export const LeonardoAssistantModal: React.FC<LeonardoAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentScreen,
  initialPrompt,
  onClearInitialPrompt,
  onNavigate,
  onActionTrigger,
  onAddXp,
}) => {
  const [messages, setMessages] = useState<LeonardoMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<LeonardoAgentTeam | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<{ start: () => void; stop: () => void } | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [activeQuizState, setActiveQuizState] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [consentGranted, setConsentGranted] = useState(getLeonardoConsent());
  const [escalationNotice, setEscalationNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history on mount or target language change
  useEffect(() => {
    const history = getStoredLeonardoHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const initial = createInitialLeonardoGreeting(currentUser, currentUser.targetLanguage);
      setMessages([initial]);
      saveLeonardoHistory([initial]);
    }
  }, [currentUser.id, currentUser.targetLanguage]);

  // Scroll to bottom on messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Auto focus input and consume initial prefill prompt when opened
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setInputText(initialPrompt);
        if (onClearInitialPrompt) onClearInitialPrompt();
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, initialPrompt, onClearInitialPrompt]);

  // Setup speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    const recognizer = createSpeechRecognizer(
      currentUser.targetLanguage,
      (result) => {
        if (result.transcript) {
          setInputText(result.transcript);
        }
      },
      (error) => {
        console.warn('Speech recognition warning:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setSpeechRecognizer(recognizer);
  }, [currentUser.targetLanguage]);

  const toggleVoiceInput = () => {
    if (!speechRecognizer) return;
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognizer.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice start error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    if (isListening && speechRecognizer) {
      speechRecognizer.stop();
      setIsListening(false);
    }

    const userMessage: LeonardoMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiGenerated: false,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    saveLeonardoHistory(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/leonardo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          context: {
            userId: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            ageGroup: currentUser.ageGroup,
            targetLanguage: currentUser.targetLanguage,
            nativeLanguage: currentUser.nativeLanguage,
            currentCefr: currentUser.currentCefr,
            currentScreen: currentScreen || 'home',
            streakDays: currentUser.streakDays,
            totalXp: currentUser.totalXp,
            subscriptionTier: currentUser.subscriptionTier || 'free',
            srsDueCount: 4,
          },
          requestedTeam: selectedTeam,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: LeonardoChatResponse = await response.json();
      const updatedWithReply = [...newHistory, data.message];
      setMessages(updatedWithReply);
      saveLeonardoHistory(updatedWithReply);

      if (data.orchestrator.quotaRemaining !== undefined) {
        setQuotaRemaining(data.orchestrator.quotaRemaining);
      }

      if (data.message.escalationRequired) {
        setEscalationNotice('A technical support supervisor has been notified. You can also reach unconomics@gmail.com directly.');
      }
    } catch (err) {
      console.warn('Leonardo request failed, creating offline client recovery message:', err);
      const fallbackReply: LeonardoMessage = {
        id: `leo-err-${Date.now()}`,
        role: 'assistant',
        content: `I noticed a network hiccup, but my built-in offline linguistic rules remain fully functional! I am here to help you practice **${currentUser.targetLanguage}** (${currentUser.currentCefr}) anytime.`,
        team: 'qa_safety_supervisor',
        teamName: 'Safety & Quality Supervisor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Review my daily goal', 'Practice ordering in a restaurant', 'Test my vocabulary'],
        isAiGenerated: false,
      };
      const recovered = [...newHistory, fallbackReply];
      setMessages(recovered);
      saveLeonardoHistory(recovered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: LeonardoAction) => {
    if (onActionTrigger) {
      onActionTrigger(action);
    }
    if (action.type === 'navigate' && action.payload?.screen && onNavigate) {
      onNavigate(action.payload.screen as string);
      onClose();
    } else if (action.type === 'start_challenge' && onNavigate) {
      onNavigate('home');
      onClose();
    } else if (action.type === 'review_srs' && onNavigate) {
      onNavigate('srs');
      onClose();
    } else if (action.type === 'escalate_human') {
      window.open('mailto:unconomics@gmail.com?subject=Speak Dolphin Support Request - ' + currentUser.name, '_blank');
    }
  };

  const handleQuizSelection = (messageId: string, option: string, correctAnswer: string) => {
    const isCorrect = option === correctAnswer;
    setActiveQuizState((prev) => ({
      ...prev,
      [messageId]: { selected: option, isCorrect },
    }));

    if (isCorrect && onAddXp) {
      onAddXp(15);
    }
  };

  const handleClearHistory = () => {
    clearLeonardoHistory();
    const initial = createInitialLeonardoGreeting(currentUser, currentUser.targetLanguage);
    setMessages([initial]);
  };

  const handleConsentToggle = (checked: boolean) => {
    setConsentGranted(checked);
    setLeonardoConsent(checked);
  };

  const handlePlayAudio = (text: string) => {
    speakText(text, currentUser.targetLanguage, { slow: currentUser.slowAudioPreference });
  };

  if (!isOpen) return null;

  const currentTeamMeta = LEONARDO_TEAMS.find((t) => t.id === selectedTeam);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative w-full sm:max-w-2xl sm:h-[88vh] h-[92vh] max-h-[850px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md">
              <span className="text-xl">🐬</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Leonardo</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  1,000 Agents
                </span>
                {currentUser.subscriptionTier === 'free' && (
                  <span className="hidden sm:inline-block text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                    Free Tier {quotaRemaining !== null ? `(${quotaRemaining} left)` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span>Active:</span>
                <span className="font-semibold text-emerald-400">
                  {selectedTeam === 'auto' ? 'Auto-Orchestrator' : currentTeamMeta?.name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Assistant Settings"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Assistant Preferences"
            >
              <Settings2 size={17} />
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              aria-label="Clear chat history"
              className="p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Assistant"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Settings Drawer (Collapsible) */}
        {showSettings && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs text-slate-700 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between font-semibold text-slate-900 mb-2">
              <span>Leonardo Preferences & Data Privacy</span>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Persist conversation history across sessions:</span>
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => handleConsentToggle(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <p className="text-[11px] text-slate-500">
                When enabled, your chat turns are saved locally in your browser to maintain learning continuity.
              </p>
            </div>
          </div>
        )}

        {/* Division Quick Selector Tabs */}
        <div className="bg-slate-100/80 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 pr-1 shrink-0">
            Division:
          </span>

          <button
            type="button"
            onClick={() => setSelectedTeam('auto')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'auto'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            🌟 Auto
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('instruction_curriculum')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'instruction_curriculum'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            🎓 Tutor
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('speech_pronunciation')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'speech_pronunciation'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            🎙️ Speech Coach
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('conversation_roleplay')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'conversation_roleplay'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            💬 Roleplay
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('grammar_vocab_translation')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'grammar_vocab_translation'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            📖 Grammar
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('personalization_strategist')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'personalization_strategist'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            🧭 Study Plan
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeam('troubleshooting_support')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedTeam === 'troubleshooting_support'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            🛠️ App Guide
          </button>
        </div>

        {/* Escalation alert banner */}
        {escalationNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-amber-700 shrink-0" />
              <span>{escalationNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setEscalationNotice(null)}
              className="text-amber-700 hover:text-amber-900 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const quizState = activeQuizState[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1 pl-1">
                    <span className="text-emerald-700 font-bold">Leonardo</span>
                    <span>·</span>
                    <span className="text-slate-600">{msg.teamName || 'Intelligent Specialist'}</span>
                    {msg.isAiGenerated && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                        <Sparkles size={10} /> AI Active
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`relative rounded-2xl p-4 max-w-[92%] sm:max-w-[85%] shadow-xs leading-relaxed text-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Content message with simple paragraph breaks */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {/* Audio pronounce button */}
                  {msg.audioText && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium italic truncate max-w-[200px]">
                        "{msg.audioText}"
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(msg.audioText!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                      >
                        <Volume2 size={13} />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}

                  {/* Highlight callout chips */}
                  {(msg.vocabularyTip || msg.grammarNote || msg.culturalNote || msg.pronunciationHint) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      {msg.vocabularyTip && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900">
                          <span className="font-bold">💡 Vocab Tip: </span>
                          <span>{msg.vocabularyTip}</span>
                        </div>
                      )}

                      {msg.grammarNote && (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-900">
                          <span className="font-bold">📘 Grammar Note: </span>
                          <span>{msg.grammarNote}</span>
                        </div>
                      )}

                      {msg.culturalNote && (
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-900">
                          <span className="font-bold">🌍 Culture & Pragmatics: </span>
                          <span>{msg.culturalNote}</span>
                        </div>
                      )}

                      {msg.pronunciationHint && (
                        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-900">
                          <span className="font-bold">🗣️ Acoustic Hint: </span>
                          <span>{msg.pronunciationHint}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Quiz Widget */}
                  {msg.interactiveQuiz && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs space-y-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Zap size={14} className="text-amber-500" />
                        <span>Quick Check: {msg.interactiveQuiz.question}</span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.interactiveQuiz.options.map((option, idx) => {
                          const isSelected = quizState?.selected === option;
                          const isCorrect = option === msg.interactiveQuiz?.correctAnswer;
                          const hasAnswered = Boolean(quizState);

                          let btnStyle = 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800';
                          if (hasAnswered) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 line-through';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleQuizSelection(msg.id, option, msg.interactiveQuiz!.correctAnswer)}
                              className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{option}</span>
                              {hasAnswered && isCorrect && <CheckCircle size={14} className="text-emerald-600" />}
                              {hasAnswered && isSelected && !isCorrect && <AlertCircle size={14} className="text-rose-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizState && (
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 text-[11px] leading-relaxed border border-emerald-200">
                          <span className="font-bold">{quizState.isCorrect ? '✅ Correct! (+15 XP)' : 'ℹ️ Explanation: '}</span>
                          {msg.interactiveQuiz.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action execution buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all hover:scale-102 active:scale-98"
                        >
                          {act.icon === 'Zap' && <Zap size={13} className="text-amber-400" />}
                          {act.icon === 'Mic' && <Mic size={13} className="text-teal-400" />}
                          {act.icon === 'CreditCard' && <CreditCard size={13} className="text-emerald-400" />}
                          {act.icon === 'Layers' && <Layers size={13} className="text-cyan-400" />}
                          {act.icon === 'RefreshCw' && <RefreshCw size={13} className="text-teal-400" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] mt-2 ${isUser ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1 pl-1">
                <span className="text-emerald-700 font-bold">Leonardo</span>
                <span>·</span>
                <span className="animate-pulse">Consulting specialized agents...</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Orchestrating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Follow-Up Chips */}
        {messages.length > 0 && messages[messages.length - 1].suggestedFollowUps && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
            {messages[messages.length - 1].suggestedFollowUps?.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 border border-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            {isSpeechRecognitionSupported() && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                aria-label={isListening ? 'Stop listening' : 'Start speech input'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Speak your question'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : `Ask Leonardo anything about ${currentUser.targetLanguage} or Speak Dolphin...`
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send message to Leonardo"
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-xs font-bold transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>
              Target: <strong className="text-slate-600">{currentUser.targetLanguage}</strong> ({currentUser.currentCefr})
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-500" /> Powered by 1,000-Agent Orchestrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
