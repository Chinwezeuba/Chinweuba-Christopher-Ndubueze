import { LeonardoMessage, UserProfile } from '../types';

const LEONARDO_STORAGE_KEY = 'speakdolphin_leonardo_history';
const LEONARDO_CONSENT_KEY = 'speakdolphin_leonardo_consent';

export function getLeonardoConsent(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(LEONARDO_CONSENT_KEY);
  return val !== 'false'; // Default to true
}

export function setLeonardoConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEONARDO_CONSENT_KEY, consent ? 'true' : 'false');
  if (!consent) {
    clearLeonardoHistory();
  }
}

export function getStoredLeonardoHistory(): LeonardoMessage[] {
  if (typeof window === 'undefined' || !getLeonardoConsent()) return [];
  try {
    const raw = localStorage.getItem(LEONARDO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLeonardoHistory(messages: LeonardoMessage[]): void {
  if (typeof window === 'undefined' || !getLeonardoConsent()) return;
  try {
    // Keep most recent 50 messages to preserve memory
    const trimmed = messages.slice(-50);
    localStorage.setItem(LEONARDO_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent ignore on storage quota
  }
}

export function clearLeonardoHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEONARDO_STORAGE_KEY);
}

export function createInitialLeonardoGreeting(user: UserProfile, targetLanguageName: string): LeonardoMessage {
  const isKid = user.ageGroup === 'child_3_5' || user.ageGroup === 'child_6_12';

  const welcomeContent = isKid
    ? `Hi ${user.name || 'friend'}! 🐬 I'm **Leonardo**, your friendly Dolphin learning buddy! I'm here to play fun games, say magic words in **${targetLanguageName}**, and help you collect shiny stars! What would you like to explore today?`
    : `Hello ${user.name || 'there'}! I am **Leonardo**, your coordinated intelligent AI learning companion in Speak Dolphin, representing a collaborative team of 1,000 specialized linguistic, speech, and strategy agents.\n\nI am currently calibrated for your target language: **${targetLanguageName} (${user.currentCefr})**.\n\nHow can our specialized agent divisions assist you today?`;

  return {
    id: `leo-init-${Date.now()}`,
    role: 'assistant',
    content: welcomeContent,
    team: 'instruction_curriculum',
    teamName: 'Curriculum & Pedagogy Master',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedFollowUps: isKid
      ? ['Play animal sound game! 🦁', 'Teach me 3 fun words!', 'Tell a cute story 📖']
      : [
          `Build my personalized daily study plan for ${targetLanguageName}`,
          `Explain tricky grammar rules in ${targetLanguageName}`,
          `Roleplay a travel scenario in ${targetLanguageName}`,
          `How do Lead Bank checking transfers work?`,
        ],
    suggestedActions: [
      { id: 'act-init-1', type: 'start_challenge', label: 'Launch 45s Daily Challenge', payload: { action: 'daily_challenge' }, icon: 'Zap' },
      { id: 'act-init-2', type: 'navigate', label: `Open ${targetLanguageName} Speech Lab`, payload: { screen: 'pronunciation' }, icon: 'Mic' },
    ],
    isAiGenerated: false,
  };
}
