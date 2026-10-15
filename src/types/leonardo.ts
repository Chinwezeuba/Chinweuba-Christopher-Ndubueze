import { AgeGroup, CefrLevel, SubscriptionTier, UserRole } from './index';

export type LeonardoAgentTeam =
  | 'instruction_curriculum'
  | 'grammar_vocab_translation'
  | 'speech_pronunciation'
  | 'conversation_roleplay'
  | 'personalization_strategist'
  | 'assessment_analytics'
  | 'cultural_context'
  | 'accessibility_inclusion'
  | 'troubleshooting_support'
  | 'qa_safety_supervisor';

export interface LeonardoAgentMetadata {
  id: LeonardoAgentTeam;
  name: string;
  codename: string;
  description: string;
  icon: string;
  agentCountRepresentation: number;
}

export type LeonardoActionType =
  | 'navigate'
  | 'start_lesson'
  | 'review_srs'
  | 'start_challenge'
  | 'switch_language'
  | 'run_self_correct'
  | 'adjust_speech_rate'
  | 'escalate_human';

export interface LeonardoAction {
  id: string;
  type: LeonardoActionType;
  label: string;
  payload?: Record<string, unknown>;
  icon?: string;
  executed?: boolean;
}

export interface LeonardoInteractiveQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userSelection?: string;
  isCorrect?: boolean;
}

export interface LeonardoMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  team?: LeonardoAgentTeam;
  teamName?: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  suggestedActions?: LeonardoAction[];
  interactiveQuiz?: LeonardoInteractiveQuiz;
  vocabularyTip?: string;
  grammarNote?: string;
  culturalNote?: string;
  pronunciationHint?: string;
  audioText?: string;
  isAiGenerated: boolean;
  escalationRequired?: boolean;
  confidenceScore?: number;
}

export interface LeonardoUserContext {
  userId?: string;
  name?: string;
  role?: UserRole;
  ageGroup: AgeGroup;
  targetLanguage: string;
  nativeLanguage: string;
  currentCefr: CefrLevel;
  currentScreen?: string;
  activeLessonId?: string;
  streakDays?: number;
  totalXp?: number;
  dailyGoalMinutes?: number;
  dailyTimeSpentTodayMinutes?: number;
  subscriptionTier: SubscriptionTier;
  srsDueCount?: number;
  recentMistakes?: string[];
}

export interface LeonardoChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context: LeonardoUserContext;
  requestedTeam?: LeonardoAgentTeam | 'auto';
  stream?: boolean;
}

export interface LeonardoChatResponse {
  message: LeonardoMessage;
  orchestrator: {
    routedTeam: LeonardoAgentTeam;
    routedTeamName: string;
    specialistAgentsConsulted: number;
    latencyMs: number;
    guardrailPassed: boolean;
    quotaRemaining?: number;
    quotaTotal?: number;
  };
}

export interface LeonardoQuotaStatus {
  tier: SubscriptionTier;
  dailyQueriesUsed: number;
  dailyQueriesLimit: number;
  unlimited: boolean;
  resetAt: string;
}
