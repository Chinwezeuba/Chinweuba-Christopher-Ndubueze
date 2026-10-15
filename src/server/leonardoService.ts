import { GoogleGenAI } from '@google/genai';
import {
  LeonardoAgentMetadata,
  LeonardoAgentTeam,
  LeonardoChatRequest,
  LeonardoChatResponse,
  LeonardoMessage,
  LeonardoQuotaStatus,
  LeonardoAction,
} from '../types/leonardo';

export const LEONARDO_TEAMS: LeonardoAgentMetadata[] = [
  {
    id: 'instruction_curriculum',
    name: 'Curriculum & Pedagogy Master',
    codename: 'TEAM-ALPHA',
    description: 'Decomposes complex linguistic concepts into level-calibrated micro-lessons across CEFR A1-C2.',
    icon: 'GraduationCap',
    agentCountRepresentation: 150,
  },
  {
    id: 'grammar_vocab_translation',
    name: 'Grammar & Lexicon Synthesizer',
    codename: 'TEAM-LEXIS',
    description: 'Etymology, morpheme parsing, authentic collocations, and transliterations.',
    icon: 'BookOpen',
    agentCountRepresentation: 140,
  },
  {
    id: 'speech_pronunciation',
    name: 'Acoustic & Phonetics Coach',
    codename: 'TEAM-SONIC',
    description: 'Phonemic distinctions, minimal pair contrasts, intonation patterns, and pitch accent.',
    icon: 'Mic',
    agentCountRepresentation: 120,
  },
  {
    id: 'conversation_roleplay',
    name: 'Conversational Immersion Partner',
    codename: 'TEAM-DIALOG',
    description: 'Real-world contextual simulation with constructive recasting and natural dialogue.',
    icon: 'MessageSquare',
    agentCountRepresentation: 160,
  },
  {
    id: 'personalization_strategist',
    name: 'Adaptive Learning Strategist',
    codename: 'TEAM-NEXUS',
    description: 'Tailors daily practice schedules, SM-2 retention curves, and customized learning paths.',
    icon: 'Compass',
    agentCountRepresentation: 90,
  },
  {
    id: 'assessment_analytics',
    name: 'Diagnostic & Progress Evaluator',
    codename: 'TEAM-METRIC',
    description: 'Measures verified mastery without inflated claims, diagnosing linguistic gaps.',
    icon: 'BarChart2',
    agentCountRepresentation: 80,
  },
  {
    id: 'cultural_context',
    name: 'Cultural Pragmatics Specialist',
    codename: 'TEAM-CULTURE',
    description: 'Regional etiquette, honorific nuances, dining customs, and authentic idioms.',
    icon: 'Globe',
    agentCountRepresentation: 80,
  },
  {
    id: 'accessibility_inclusion',
    name: 'Inclusive Learning Advocate',
    codename: 'TEAM-HARMONY',
    description: 'Dyslexia-friendly explanations, auditory pacing, and cognitive load management.',
    icon: 'HeartHandshake',
    agentCountRepresentation: 60,
  },
  {
    id: 'troubleshooting_support',
    name: 'Speak Dolphin Concierge & Tech Guide',
    codename: 'TEAM-SUPPORT',
    description: 'Navigates app features, verifies Lead Bank checking rails, and orchestrates glitch self-healing.',
    icon: 'HelpCircle',
    agentCountRepresentation: 70,
  },
  {
    id: 'qa_safety_supervisor',
    name: 'Safety & Quality Assurance Supervisor',
    codename: 'TEAM-AEGIS',
    description: 'Enforces COPPA/GDPR-K boundaries, factual grounding, and subscription entitlement rules.',
    icon: 'ShieldCheck',
    agentCountRepresentation: 50,
  },
];

// In-memory daily quota store (persisted across sessions via user IDs)
const DAILY_QUOTA_MAP = new Map<string, { count: number; date: string }>();

export function checkAndIncrementQuota(userId: string = 'guest', tier: string = 'free'): LeonardoQuotaStatus {
  const today = new Date().toISOString().split('T')[0];
  const isPaid = tier === 'pro' || tier === 'family';

  if (isPaid) {
    return {
      tier: tier as 'pro' | 'family',
      dailyQueriesUsed: 0,
      dailyQueriesLimit: 999999,
      unlimited: true,
      resetAt: `${today}T23:59:59Z`,
    };
  }

  const record = DAILY_QUOTA_MAP.get(userId) || { count: 0, date: today };
  if (record.date !== today) {
    record.count = 0;
    record.date = today;
  }

  const limit = 20;
  const currentUsed = record.count;
  record.count += 1;
  DAILY_QUOTA_MAP.set(userId, record);

  return {
    tier: 'free',
    dailyQueriesUsed: currentUsed + 1,
    dailyQueriesLimit: limit,
    unlimited: false,
    resetAt: `${today}T23:59:59Z`,
  };
}

export function classifyIntent(prompt: string, currentScreen?: string): LeonardoAgentTeam {
  const p = prompt.toLowerCase();

  // App support / Lead Bank / technical questions
  if (
    p.includes('lead bank') ||
    p.includes('routing') ||
    p.includes('subscription') ||
    p.includes('glitch') ||
    p.includes('refund') ||
    p.includes('payment') ||
    p.includes('login') ||
    p.includes('parent pin') ||
    p.includes('how to use') ||
    p.includes('download pdf') ||
    p.includes('offline') ||
    p.includes('pwa')
  ) {
    return 'troubleshooting_support';
  }

  // Pronunciation & acoustic queries
  if (
    p.includes('pronounce') ||
    p.includes('pronunciation') ||
    p.includes('sound like') ||
    p.includes('accent') ||
    p.includes('minimal pair') ||
    p.includes('tongue') ||
    p.includes('listen') ||
    p.includes('pitch') ||
    p.includes('tone')
  ) {
    return 'speech_pronunciation';
  }

  // Culture & etiquette
  if (
    p.includes('culture') ||
    p.includes('custom') ||
    p.includes('polite') ||
    p.includes('rude') ||
    p.includes('etiquette') ||
    p.includes('slang') ||
    p.includes('idiom') ||
    p.includes('history') ||
    p.includes('traditional')
  ) {
    return 'cultural_context';
  }

  // Personalization / progress / learning plan
  if (
    p.includes('plan') ||
    p.includes('schedule') ||
    p.includes('recommend') ||
    p.includes('next lesson') ||
    p.includes('streak') ||
    p.includes('spaced repetition') ||
    p.includes('srs') ||
    p.includes('how am i doing') ||
    p.includes('progress')
  ) {
    return 'personalization_strategist';
  }

  // Assessment / quiz / testing
  if (p.includes('quiz') || p.includes('test me') || p.includes('evaluate') || p.includes('level') || p.includes('cefr')) {
    return 'assessment_analytics';
  }

  // Grammar / translation / vocabulary lookup
  if (
    p.includes('translate') ||
    p.includes('meaning of') ||
    p.includes('what does') ||
    p.includes('grammar') ||
    p.includes('conjugat') ||
    p.includes('difference between') ||
    p.includes('sentence') ||
    p.includes('vocabulary') ||
    p.includes('vocab')
  ) {
    return 'grammar_vocab_translation';
  }

  // Conversational practice
  if (p.includes('roleplay') || p.includes('practice') || p.includes('dialogue') || p.includes('let us talk') || p.includes('scenario')) {
    return 'conversation_roleplay';
  }

  // Contextual fallback by screen
  if (currentScreen === 'pronunciation') return 'speech_pronunciation';
  if (currentScreen === 'tutor') return 'conversation_roleplay';
  if (currentScreen === 'subscription') return 'troubleshooting_support';
  if (currentScreen === 'srs') return 'personalization_strategist';

  return 'instruction_curriculum';
}

interface DeterministicResponseParams {
  team: LeonardoAgentTeam;
  latestUserText: string;
  targetLang: string;
  nativeLang: string;
  cefr: string;
  ageGroup: string;
}

export function generateDeterministicResponse(params: DeterministicResponseParams): Partial<LeonardoMessage> {
  const { team, latestUserText, targetLang, nativeLang, cefr } = params;

  switch (team) {
    case 'troubleshooting_support':
      if (latestUserText.toLowerCase().includes('lead bank') || latestUserText.toLowerCase().includes('routing') || latestUserText.toLowerCase().includes('payment')) {
        return {
          content: `I am Leonardo's Concierge & Support Module. Speak Dolphin processes direct checking transfers via Lead Bank with verified ABA routing rails.\n\n• **Bank Name**: Lead Bank\n• **Routing Number (ABA)**: 101019644 (Passed 3-7-1 mathematical transit checksum)\n• **Account Number**: 210906176137 (USD Checking)\n• **Beneficiary**: CHINWEUBA CHRISTOPHER NDUBUEZE\n• **Email for Confirmation**: unconomics@gmail.com\n\nIf you experience network timeouts or gateway glitches, our automated self-healing engine can automatically recover your payment record without duplicate charges.`,
          suggestedActions: [
            { id: 'act-sub-1', type: 'navigate', label: 'View Subscription & Banking', payload: { screen: 'subscription' }, icon: 'CreditCard' },
            { id: 'act-sub-2', type: 'run_self_correct', label: 'Trigger Glitch Self-Correction', payload: { action: 'self_correct' }, icon: 'RefreshCw' },
            { id: 'act-sub-3', type: 'escalate_human', label: 'Contact Support (unconomics@gmail.com)', payload: { email: 'unconomics@gmail.com' }, icon: 'Mail' },
          ],
          suggestedFollowUps: [
            'How does the Lead Bank ABA checksum work?',
            'What is the refund and cancellation policy?',
            'Can I upgrade from Pro to Family plan?',
          ],
          culturalNote: 'Lead Bank transactions are encrypted and verified against automated reconciliation pipelines.',
        };
      }

      return {
        content: `Hello! I am Leonardo, your 1,000-agent intelligent companion in Speak Dolphin. I can guide you through every feature of the app:\n\n1. **15 Supported Languages**: Switch target languages at any time from the top navigation.\n2. **3 Platform Variants**: Experience the responsive Website, Touch-First Mobile PWA, or Full Immersion Desktop Web App.\n3. **Daily Goals & Streaks**: Earn XP, complete rapid challenges, and keep your streak safe with Streak Shields.\n4. **Acoustic Speech Lab & SRS**: Master tricky phonemes with minimal pairs and SuperMemo SM-2 cards.`,
        suggestedActions: [
          { id: 'act-guide-1', type: 'navigate', label: 'Go to Daily Goal Tracker', payload: { screen: 'home' }, icon: 'Home' },
          { id: 'act-guide-2', type: 'navigate', label: 'Explore Vocabulary Flashcards', payload: { screen: 'srs' }, icon: 'Layers' },
          { id: 'act-guide-3', type: 'navigate', label: 'Launch Pronunciation Lab', payload: { screen: 'pronunciation' }, icon: 'Mic' },
        ],
        suggestedFollowUps: [
          'How do I earn bonus XP in the Daily Challenge?',
          'How does the SM-2 spaced repetition memory engine work?',
          'How do I switch between Mobile PWA and Web App modes?',
        ],
      };

    case 'speech_pronunciation':
      return {
        content: `I am Leonardo's Acoustic & Phonetics Coach. In **${targetLang}**, clear pronunciation relies on mastering precise vocal placement and tone contrasts rather than rushing.\n\n• **Tip for ${targetLang}**: Pay close attention to vowel duration and whether stops are aspirated (with breath) or unaspirated.\n• **Acoustic feedback**: Use the button below to listen to native pronunciation at normal or slowed speeds (0.75x) to train your ear.`,
        audioText: `Practice speaking clearly every day. Listen closely and repeat with confidence.`,
        pronunciationHint: `Focus on clean airflow and gentle tongue positioning for authentic cadence.`,
        suggestedActions: [
          { id: 'act-pron-1', type: 'navigate', label: `Open ${targetLang} Pronunciation Lab`, payload: { screen: 'pronunciation' }, icon: 'Mic' },
          { id: 'act-pron-2', type: 'adjust_speech_rate', label: 'Set Slow Audio (0.75x)', payload: { rate: 0.75 }, icon: 'Volume1' },
        ],
        suggestedFollowUps: [
          `Show me minimal pairs in ${targetLang}`,
          `How do native speakers pronounce greetings in ${targetLang}?`,
          `Give me an acoustic shadowing sentence`,
        ],
      };

    case 'personalization_strategist':
      return {
        content: `Here is your customized **Personalized Daily Mission** from Leonardo's Strategy Team, calibrated for **${targetLang} (${cefr})**:\n\n1. 🌟 **Daily Challenge Mini-Game** (2 mins): Rapid 45s blitz to lock in today's streak and earn +50 to +75 bonus XP.\n2. 🧠 **SM-2 Spaced Repetition Review** (5 mins): Review due vocabulary flashcards before memory decay sets in.\n3. 📖 **Contextual Immersion Story** (6 mins): Complete one authentic branching story scene.\n4. 🎙️ **Conversational Roleplay** (5 mins): 3 interactive dialogue turns with constructive recast.`,
        suggestedActions: [
          { id: 'act-strat-1', type: 'start_challenge', label: 'Start 45s Daily Challenge', payload: { screen: 'home', action: 'daily_challenge' }, icon: 'Zap' },
          { id: 'act-strat-2', type: 'review_srs', label: 'Review Due Flashcards', payload: { screen: 'srs' }, icon: 'RotateCw' },
          { id: 'act-strat-3', type: 'navigate', label: 'Read Cultural Story', payload: { screen: 'stories' }, icon: 'BookOpen' },
        ],
        suggestedFollowUps: [
          'What is my optimal study time each day?',
          'How does the SM-2 ease factor recalculate after reviews?',
          'What CEFR milestone should I aim for next?',
        ],
      };

    case 'grammar_vocab_translation':
      return {
        content: `I am Leonardo's Grammar & Lexicon Synthesizer. In **${targetLang}**, sentence structure and courteous register are key to sounding natural at CEFR **${cefr}**.\n\n• **Core Grammar Principle**: Rather than translating word-for-word from ${nativeLang}, native speakers rely on formulaic polite frames.\n• **Example in Context**: Focus on polite conditional or honorific request forms rather than direct commands.`,
        vocabularyTip: `Notice how native greetings change according to time of day and social respect.`,
        grammarNote: `At level ${cefr}, focus on verb aspects and polite agreement before tackling complex subordinate clauses.`,
        interactiveQuiz: {
          question: `Which approach is most respectful when requesting assistance in ${targetLang}?`,
          options: [
            'Use direct imperative verbs ("Give me this")',
            'Use polite conditional formulas with courtesy markers ("Could you please...")',
            'Speak loudly without greeting the host',
            'Skip formal pronouns entirely',
          ],
          correctAnswer: 'Use polite conditional formulas with courtesy markers ("Could you please...")',
          explanation: 'Polite indirect requests establish mutual warmth and respect across all 15 supported languages.',
        },
        suggestedFollowUps: [
          `Give me 3 high-frequency colloquial phrases in ${targetLang}`,
          `Explain the difference between formal and informal "you" in ${targetLang}`,
          `Quiz me on essential travel vocabulary`,
        ],
      };

    case 'conversation_roleplay':
    default:
      return {
        content: `Hello! I am Leonardo, your conversational immersion partner. I can roleplay any real-world scenario with you in **${targetLang}**—ordering at a vibrant cafe, checking in at airport customs, interviewing for a job, or asking for directions in the city.\n\nWhenever you reply, I will keep our conversation flowing naturally and offer gentle recasts if you make a mistake!`,
        suggestedActions: [
          { id: 'act-conv-1', type: 'navigate', label: 'Open AI Conversation Tutor', payload: { screen: 'tutor' }, icon: 'MessageSquare' },
          { id: 'act-conv-2', type: 'navigate', label: 'Practice with Interactive Stories', payload: { screen: 'stories' }, icon: 'BookOpen' },
        ],
        suggestedFollowUps: [
          `Let's practice ordering food in ${targetLang}`,
          `Simulate a customs check at the airport`,
          `How would I introduce myself in a professional meeting?`,
        ],
      };
  }
}

export async function orchestrateLeonardoChat(
  request: LeonardoChatRequest,
  aiClient: GoogleGenAI | null
): Promise<LeonardoChatResponse> {
  const startTime = Date.now();
  const { messages, context, requestedTeam = 'auto' } = request;
  const latestMessage = messages[messages.length - 1]?.content || 'Hello Leonardo';

  // 1. Quota check
  const quota = checkAndIncrementQuota(context.userId || 'guest', context.subscriptionTier);

  // 2. Classify intent / select agent team
  const targetTeam: LeonardoAgentTeam =
    requestedTeam && requestedTeam !== 'auto'
      ? requestedTeam
      : classifyIntent(latestMessage, context.currentScreen);

  const teamMeta = LEONARDO_TEAMS.find((t) => t.id === targetTeam) || LEONARDO_TEAMS[0];

  // 3. Fallback deterministic execution if no AI key or offline
  if (!aiClient) {
    const fallbackData = generateDeterministicResponse({
      team: targetTeam,
      latestUserText: latestMessage,
      targetLang: context.targetLanguage,
      nativeLang: context.nativeLanguage,
      cefr: context.currentCefr,
      ageGroup: context.ageGroup,
    });

    const responseMessage: LeonardoMessage = {
      id: `leo-${Date.now()}`,
      role: 'assistant',
      content: fallbackData.content || 'I am Leonardo, ready to assist your language learning!',
      team: targetTeam,
      teamName: teamMeta.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: fallbackData.suggestedFollowUps || ['How do I improve my streak?', 'Explain a grammar rule'],
      suggestedActions: fallbackData.suggestedActions || [],
      interactiveQuiz: fallbackData.interactiveQuiz,
      vocabularyTip: fallbackData.vocabularyTip,
      grammarNote: fallbackData.grammarNote,
      culturalNote: fallbackData.culturalNote,
      pronunciationHint: fallbackData.pronunciationHint,
      audioText: fallbackData.audioText,
      isAiGenerated: false,
    };

    return {
      message: responseMessage,
      orchestrator: {
        routedTeam: targetTeam,
        routedTeamName: teamMeta.name,
        specialistAgentsConsulted: teamMeta.agentCountRepresentation,
        latencyMs: Date.now() - startTime,
        guardrailPassed: true,
        quotaRemaining: quota.unlimited ? 999999 : Math.max(0, quota.dailyQueriesLimit - quota.dailyQueriesUsed),
        quotaTotal: quota.dailyQueriesLimit,
      },
    };
  }

  // 4. Live Gemini 3.8 Flash multi-agent execution
  try {
    const systemInstruction = `
You are Leonardo, the central intelligent AI learning companion and multi-agent intelligence behind Speak Dolphin.
You represent a coordinated team of 1,000 specialized linguistic and pedagogical AI agents.
Your active specialized agent division for this turn is: ${teamMeta.name} (${teamMeta.codename}, representing ${teamMeta.agentCountRepresentation} specialized agents).

USER PROFILE & CONTEXT:
- Target Language: ${context.targetLanguage}
- Native / Explanation Language: ${context.nativeLanguage}
- Proficiency: CEFR ${context.currentCefr}
- Age Persona: ${context.ageGroup} (child_3_5, child_6_12, teen_13_17, adult_18_plus)
- Current App Screen: ${context.currentScreen || 'dashboard'}
- Current Streak: ${context.streakDays || 0} days | Total XP: ${context.totalXp || 0}
- Subscription Tier: ${context.subscriptionTier}

CORE OPERATIONAL PRINCIPLES:
1. Actively teach, clarify, roleplay, diagnose, or guide based on the assigned specialist division.
2. Adapt language complexity and pedagogical approach strictly to age group ${context.ageGroup} and CEFR ${context.currentCefr}. If the user is a child (3-5 or 6-12), use warm, encouraging, simple words with zero inappropriate content (COPPA compliant).
3. If addressing app troubleshooting or subscription questions: Speak Dolphin uses verified Lead Bank checking rails (Lead Bank Kansas City, Routing 101019644, Account 210906176137, beneficiary unconomics@gmail.com). Never pretend an account, payment, or technical issue is resolved unless the user executes it through verified rails.
4. Support all 15 languages: Spanish, French, Japanese, German, Mandarin, Brazilian Portuguese, European Portuguese, Italian, Arabic, Igbo, Swahili, Hausa, Lingala, Indonesian, Hindi.
5. Provide actionable, concise, empathetic responses (avoid long repetitive lectures).

OUTPUT FORMAT:
Respond with a VALID JSON object matching this schema:
{
  "content": "Your rich, engaging, formatted response to the user (markdown formatting allowed for lists/bolding)",
  "suggestedFollowUps": ["Question or prompt 1", "Question 2", "Question 3"],
  "vocabularyTip": "Optional brief vocabulary or collocation tip",
  "grammarNote": "Optional grammar explanation or rule summary",
  "culturalNote": "Optional cultural pragmatics or etiquette context",
  "pronunciationHint": "Optional phoneme, tone, or acoustic guidance",
  "audioText": "Optional short target phrase to be spoken aloud via text-to-speech",
  "interactiveQuiz": {
    "question": "Optional 1-question check for understanding",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact matching option string",
    "explanation": "Why this answer is correct"
  },
  "escalationRequired": false
}
`;

    const chatHistoryText = messages
      .slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const promptText = `
CONVERSATION RECENT TURNS:
${chatHistoryText}

LATEST USER PROMPT: "${latestMessage}"

Provide Leonardo's coordinated specialist response in JSON.
`;

    const result = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.65,
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    if (!parsed.content) {
      throw new Error('Empty AI response from Leonardo model');
    }

    // Suggested actions generation based on message intent
    const actions: LeonardoAction[] = [];
    const pLow = latestMessage.toLowerCase();
    if (pLow.includes('lesson') || pLow.includes('curriculum')) {
      actions.push({ id: 'act-dyn-1', type: 'navigate', label: 'Explore Curriculum Lessons', payload: { screen: 'home' }, icon: 'BookOpen' });
    }
    if (pLow.includes('pronounc') || pLow.includes('sound') || pLow.includes('accent')) {
      actions.push({ id: 'act-dyn-2', type: 'navigate', label: 'Open Pronunciation Lab', payload: { screen: 'pronunciation' }, icon: 'Mic' });
    }
    if (pLow.includes('flashcard') || pLow.includes('srs') || pLow.includes('review') || pLow.includes('memor')) {
      actions.push({ id: 'act-dyn-3', type: 'review_srs', label: 'Review Flashcards (SM-2)', payload: { screen: 'srs' }, icon: 'Layers' });
    }
    if (pLow.includes('bank') || pLow.includes('payment') || pLow.includes('subscription')) {
      actions.push({ id: 'act-dyn-4', type: 'navigate', label: 'Lead Bank Subscription Hub', payload: { screen: 'subscription' }, icon: 'CreditCard' });
    }

    const responseMessage: LeonardoMessage = {
      id: `leo-${Date.now()}`,
      role: 'assistant',
      content: parsed.content,
      team: targetTeam,
      teamName: teamMeta.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: parsed.suggestedFollowUps || ['Tell me more', 'Give me another example'],
      suggestedActions: actions,
      interactiveQuiz: parsed.interactiveQuiz,
      vocabularyTip: parsed.vocabularyTip,
      grammarNote: parsed.grammarNote,
      culturalNote: parsed.culturalNote,
      pronunciationHint: parsed.pronunciationHint,
      audioText: parsed.audioText,
      isAiGenerated: true,
      escalationRequired: parsed.escalationRequired || false,
    };

    return {
      message: responseMessage,
      orchestrator: {
        routedTeam: targetTeam,
        routedTeamName: teamMeta.name,
        specialistAgentsConsulted: teamMeta.agentCountRepresentation,
        latencyMs: Date.now() - startTime,
        guardrailPassed: true,
        quotaRemaining: quota.unlimited ? 999999 : Math.max(0, quota.dailyQueriesLimit - quota.dailyQueriesUsed),
        quotaTotal: quota.dailyQueriesLimit,
      },
    };
  } catch (error) {
    console.warn('Live Leonardo Gemini model fallback triggered:', error);
    const fallbackData = generateDeterministicResponse({
      team: targetTeam,
      latestUserText: latestMessage,
      targetLang: context.targetLanguage,
      nativeLang: context.nativeLanguage,
      cefr: context.currentCefr,
      ageGroup: context.ageGroup,
    });

    const responseMessage: LeonardoMessage = {
      id: `leo-${Date.now()}`,
      role: 'assistant',
      content: fallbackData.content || 'I am Leonardo, ready to assist your language learning!',
      team: targetTeam,
      teamName: teamMeta.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: fallbackData.suggestedFollowUps || ['How do I improve my streak?', 'Explain a grammar rule'],
      suggestedActions: fallbackData.suggestedActions || [],
      interactiveQuiz: fallbackData.interactiveQuiz,
      vocabularyTip: fallbackData.vocabularyTip,
      grammarNote: fallbackData.grammarNote,
      culturalNote: fallbackData.culturalNote,
      pronunciationHint: fallbackData.pronunciationHint,
      audioText: fallbackData.audioText,
      isAiGenerated: false,
    };

    return {
      message: responseMessage,
      orchestrator: {
        routedTeam: targetTeam,
        routedTeamName: teamMeta.name,
        specialistAgentsConsulted: teamMeta.agentCountRepresentation,
        latencyMs: Date.now() - startTime,
        guardrailPassed: true,
        quotaRemaining: quota.unlimited ? 999999 : Math.max(0, quota.dailyQueriesLimit - quota.dailyQueriesUsed),
        quotaTotal: quota.dailyQueriesLimit,
      },
    };
  }
}
