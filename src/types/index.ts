export type AgeGroup = 'child_3_5' | 'child_6_12' | 'teen_13_17' | 'adult_18_plus';

export type AppVariant = 'website' | 'mobile' | 'webapp';

export type UserRole = 'learner' | 'parent' | 'educator' | 'admin';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type CorrectionMode = 'friendly' | 'structured' | 'intensive' | 'confidence';

export interface LanguageInfo {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  bcp47: string; // e.g. 'es-ES', 'fr-FR', 'ja-JP'
  scriptDirection: 'ltr' | 'rtl';
  family: string;
  uniqueFeatures: string[];
  sampleGreeting: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ageGroup: AgeGroup;
  targetLanguage: string;
  nativeLanguage: string;
  currentCefr: CefrLevel;
  learningGoal: string;
  dailyGoalMinutes: number;
  dailyGoalXp?: number; // Target daily XP goal (e.g. 50, 100, 150, 200)
  dailyXpEarnedToday?: number; // XP points earned today towards dailyGoalXp
  dailyGoalLessons?: number; // Target daily lessons completed goal (e.g. 1, 2, 3 lessons/day)
  dailyLessonsCompletedToday?: number; // Number of lessons completed today towards daily streak
  dailyXpDate?: string; // Date string (YYYY-MM-DD) tracking when dailyXpEarnedToday was updated
  dailyChallengeCompletedDate?: string; // Date string (YYYY-MM-DD) when daily challenge was completed
  dailyChallengeHighScore?: number; // User's highest score in the daily challenge mini-game
  dailyChallengesWonCount?: number; // Total daily challenges completed
  streakDays: number;
  lastActiveDate: string;
  bestStreak?: number;
  streakHistory?: string[];
  unlockedBadgeIds?: string[];
  perfectLessonsCount?: number;
  totalWordsLearned?: number;
  roleplayConversationsCount?: number;
  voiceRecordingsCount?: number;
  totalXp: number;
  avatar: string;
  parentLinked?: boolean;
  parentEmail?: string;
  dailyTimeSpentTodayMinutes: number;
  completedLessonIds: string[];
  voiceEnabled: boolean;
  slowAudioPreference: boolean;
  subscriptionTier?: 'free' | 'pro' | 'family';
  subscription?: SubscriptionDetails;
}

export type BadgeCategory = 'streak' | 'vocabulary' | 'mastery' | 'speaking' | 'exploration';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  currentValue: number;
  targetValue: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardXp: number;
}

export interface SrsItem {
  id: string;
  languageId: string;
  term: string;
  translation: string;
  phonetic?: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  audioText: string;
  culturalNote?: string;
  // SM-2 fields
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string; // ISO date
  lastReviewedDate?: string;
  history: Array<{
    date: string;
    grade: number; // 0-5
    durationMs: number;
  }>;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'listen_and_pick'
  | 'sentence_builder'
  | 'speaking_shadow'
  | 'type_translation'
  | 'minimal_pair'
  | 'dialogue_turn';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  contextText?: string;
  audioPrompt?: string;
  targetWord?: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  culturalInsight?: string;
  hint?: string;
  ageAdaptedPrompt?: Partial<Record<AgeGroup, string>>;
}

export interface LessonUnit {
  id: string;
  title: string;
  level: CefrLevel;
  languageId: string;
  ageSuitability: AgeGroup[];
  topic: string;
  category: 'daily_life' | 'food_travel' | 'work_business' | 'social_friendship' | 'health_emergency' | 'kids_basics';
  description: string;
  estimatedMinutes: number;
  warmupTerms: string[];
  newInputVocab: Array<{
    term: string;
    translation: string;
    phonetic: string;
    context: string;
    collocation?: string;
  }>;
  grammarFocus: {
    ruleTitle: string;
    ruleExplanation: string;
    examples: Array<{ target: string; native: string }>;
  };
  exercises: Exercise[];
  realLifeChallenge: {
    scenario: string;
    prompt: string;
    suggestedResponses: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor' | 'system';
  content: string;
  translation?: string;
  correction?: string | null;
  vocabularyTip?: string;
  suggestedFollowUps?: string[];
  culturalNote?: string;
  timestamp: string;
  audioUrl?: string;
}

export interface StoryChoice {
  text: string;
  targetPhrase: string;
  nextSceneId: string;
  feedback?: string;
}

export interface StoryScene {
  id: string;
  title: string;
  dialogue: string;
  speaker: string;
  translation: string;
  culturalNote?: string;
  audioPrompt?: string;
  choices: StoryChoice[];
}

export interface InteractiveStory {
  id: string;
  title: string;
  languageId: string;
  level: CefrLevel;
  ageGroup: AgeGroup[];
  description: string;
  thumbnail: string;
  scenes: Record<string, StoryScene>;
  startSceneId: string;
}

export interface MinimalPair {
  id: string;
  languageId: string;
  wordA: string;
  meaningA: string;
  wordB: string;
  meaningB: string;
  distinctionKey: string; // e.g. "Single 'r' vs Rolled 'rr'", "Oral /u/ vs Nasal /y/"
  soundHint: string;
}

export interface SkillEstimate {
  vocabularyScore: number; // 0-100
  listeningScore: number;
  grammarScore: number;
  speakingScore: number;
  readingScore: number;
  writingScore: number;
  confidenceRating: number; // 1-5
  lastUpdated: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  reducedMotion: boolean;
  soundEffects: boolean;
  autoPlayAudio: boolean;
  speechRate: number; // 0.7 to 1.2
}

export interface ConversationFeedbackCorrection {
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;
}

export interface ConversationFeedbackGrammar {
  score: number; // 0-100
  rating: string; // e.g. "Excellent", "Strong Foundation", "Needs Focus"
  summary: string;
  strengths: string[];
  corrections: ConversationFeedbackCorrection[];
}

export interface ConversationFeedbackWordUsage {
  word: string;
  translation: string;
  context: string;
}

export interface ConversationFeedbackUpgrade {
  used: string;
  suggested: string;
  nuance: string;
}

export interface ConversationFeedbackVocabulary {
  score: number; // 0-100
  rating: string; // e.g. "Rich & Natural", "Appropriate", "Emerging"
  summary: string;
  strongUsage: ConversationFeedbackWordUsage[];
  suggestedUpgrades: ConversationFeedbackUpgrade[];
}

export interface ConversationFeedbackFluency {
  score: number; // 0-100
  rating: string; // e.g. "Natural & Fluid", "Conversational", "Developing Flow"
  summary: string;
  turnTakingPace: string;
  coherenceScore: number; // 0-100
  strengths: string[];
  tipsForFlow: string[];
}

export interface ConversationSessionSummary {
  overallScore: number;
  overallAssessment: string;
  cefrDemonstrated: CefrLevel;
  totalUserTurns: number;
  grammar: ConversationFeedbackGrammar;
  vocabulary: ConversationFeedbackVocabulary;
  fluency: ConversationFeedbackFluency;
  actionItems: string[];
  encouragement: string;
  xpEarned: number;
  isAiGenerated: boolean;
}

// --- Subscription & Payment Types ---
export type SubscriptionTier = 'free' | 'pro' | 'family';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface SubscriptionPaymentMethod {
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface BankAccountDetails {
  currency: string;
  accountType: 'CHECKING' | 'SAVINGS';
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  bankAddress: string;
  beneficiaryAddress: string;
}

export interface SubscriptionDetails {
  subscriptionId: string;
  customerId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  price: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  paymentMethod?: SubscriptionPaymentMethod;
  familyMembers?: string[];
  planName: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'failed' | 'void';
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  planName: string;
  paymentMethodLast4?: string;
  receiptUrl?: string;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  annualSavingsPercentage: number;
  features: string[];
  limitations?: string[];
  entitlements: {
    maxDailyTutorTurns: number; // -1 for unlimited
    maxDailySrsCards: number; // -1 for unlimited
    languagesAllowed: number; // -1 for all
    voiceLabAccess: boolean;
    familyProfilesCount: number;
    parentSupervision: boolean;
    priorityAiLatency: boolean;
    offlineMode: boolean;
    streakFreezeShields: number;
  };
}

export interface BillingSessionResponse {
  sessionId: string;
  url?: string;
  clientSecret?: string;
  subscription?: SubscriptionDetails;
  invoice?: BillingInvoice;
  success: boolean;
  message?: string;
}

// --- Data Pipelines, Monitoring & Verification Types ---
export interface PipelineJobInfo {
  id: string;
  name: string;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string;
  status: 'healthy' | 'running' | 'idle' | 'error';
  lastRunDurationMs: number;
  itemsProcessed: number;
  errorCount: number;
  lastErrorMessage?: string;
  sourceAttribution: string;
  isVerifiedSource: boolean;
}

export interface PipelineStatusResponse {
  timestamp: string;
  uptimeSeconds: number;
  jobs: PipelineJobInfo[];
  cacheStats: {
    entries: number;
    hitCount: number;
    missCount: number;
    hitRatio: number;
  };
  healthy: boolean;
}

export interface DailyInsight {
  languageId: string;
  date: string;
  wordOfTheDay: {
    term: string;
    phonetic: string;
    partOfSpeech: string;
    translation: string;
    exampleTarget: string;
    exampleNative: string;
    etymology: string;
  };
  culturalFact: {
    title: string;
    body: string;
    region: string;
  };
  idiomSpotlight: {
    idiom: string;
    literal: string;
    meaning: string;
    usageNote: string;
  };
  sourceAttribution: {
    organization: string;
    authority: string;
    referenceUrl?: string;
    isVerifiedFact: boolean;
  };
  fetchedAt: string;
  expiresAt: string;
}

export interface SystemTelemetry {
  status: 'healthy' | 'degraded' | 'error';
  uptimeSeconds: number;
  nodeVersion: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  aiProviderStatus: {
    geminiOnline: boolean;
    latencyMs: number;
    modelInUse: string;
  };
  billingGatewayStatus: {
    sandboxActive: boolean;
    webhookListenerHealthy: boolean;
    activeSubscriptionsCount: number;
  };
  dataPipelinesActive: number;
  timestamp: string;
}

export * from './leonardo';
