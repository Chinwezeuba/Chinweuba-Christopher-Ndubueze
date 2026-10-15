import { UserProfile, SrsItem, AccessibilitySettings, ChatMessage, CefrLevel } from '../types';
import { INITIAL_SRS_CARDS } from './srs';

const STORAGE_KEYS = {
  CURRENT_USER: 'speakdolphin_current_user',
  ALL_USERS: 'speakdolphin_all_users',
  SRS_ITEMS: 'speakdolphin_srs_items',
  CHAT_MESSAGES: 'speakdolphin_chat_messages',
  ACCESSIBILITY: 'speakdolphin_accessibility',
  PARENT_PIN: 'speakdolphin_parent_pin',
};

// Helper to generate past streak dates
const getPastDates = (daysCount: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-adult-1',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'learner',
    ageGroup: 'adult_18_plus',
    targetLanguage: 'es',
    nativeLanguage: 'en',
    currentCefr: 'A2',
    learningGoal: 'Speak confidently for international travel and cultural connection',
    dailyGoalMinutes: 15,
    dailyGoalXp: 100,
    dailyXpEarnedToday: 60,
    dailyXpDate: new Date().toISOString().slice(0, 10),
    streakDays: 6,
    bestStreak: 14,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    streakHistory: getPastDates(6),
    unlockedBadgeIds: ['streak_3', 'first_lesson', 'words_10'],
    perfectLessonsCount: 1,
    totalWordsLearned: 35,
    roleplayConversationsCount: 2,
    voiceRecordingsCount: 3,
    totalXp: 840,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dailyTimeSpentTodayMinutes: 8,
    completedLessonIds: ['lesson-es-a1-1'],
    voiceEnabled: true,
    slowAudioPreference: false,
    subscriptionTier: 'pro',
    subscription: {
      subscriptionId: 'sub_elena_pro_1029',
      customerId: 'cus_elena_9841',
      tier: 'pro',
      status: 'active',
      interval: 'month',
      price: 12.99,
      currency: 'usd',
      currentPeriodStart: new Date(Date.now() - 14 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 16 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      planName: 'Speak Dolphin Pro Learner',
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2028,
      },
    },
  },
  {
    id: 'user-child-1',
    name: 'Leo (Age 4)',
    email: 'parent.leo@example.com',
    role: 'learner',
    ageGroup: 'child_3_5',
    targetLanguage: 'es',
    nativeLanguage: 'en',
    currentCefr: 'A1',
    learningGoal: 'Learn sounds, animals and songs playfully',
    dailyGoalMinutes: 10,
    dailyGoalXp: 50,
    dailyXpEarnedToday: 30,
    dailyXpDate: new Date().toISOString().slice(0, 10),
    streakDays: 3,
    bestStreak: 7,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    streakHistory: getPastDates(3),
    unlockedBadgeIds: ['streak_3', 'first_lesson'],
    perfectLessonsCount: 1,
    totalWordsLearned: 14,
    roleplayConversationsCount: 0,
    voiceRecordingsCount: 5,
    totalXp: 320,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    parentLinked: true,
    parentEmail: 'parent.leo@example.com',
    dailyTimeSpentTodayMinutes: 5,
    completedLessonIds: ['lesson-kids-animals-1'],
    voiceEnabled: true,
    slowAudioPreference: true,
    subscriptionTier: 'family',
    subscription: {
      subscriptionId: 'sub_family_sarah_8819',
      customerId: 'cus_family_sarah_4120',
      tier: 'family',
      status: 'active',
      interval: 'year',
      price: 199.0,
      currency: 'usd',
      currentPeriodStart: new Date(Date.now() - 60 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 305 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      planName: 'Speak Dolphin Family & Educator',
      familyMembers: ['user-child-1', 'user-parent-1'],
      paymentMethod: {
        brand: 'Mastercard',
        last4: '5555',
        expiryMonth: 10,
        expiryYear: 2029,
      },
    },
  },
  {
    id: 'user-teen-1',
    name: 'Maya Zhang',
    email: 'maya.teen@example.com',
    role: 'learner',
    ageGroup: 'teen_13_17',
    targetLanguage: 'ja',
    nativeLanguage: 'en',
    currentCefr: 'A1',
    learningGoal: 'Anime, music, social chats and high school exchange',
    dailyGoalMinutes: 15,
    dailyGoalXp: 150,
    dailyXpEarnedToday: 150,
    dailyXpDate: new Date().toISOString().slice(0, 10),
    streakDays: 12,
    bestStreak: 21,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    streakHistory: getPastDates(12),
    unlockedBadgeIds: ['streak_3', 'streak_7', 'first_lesson', 'perfect_lesson', 'words_10'],
    perfectLessonsCount: 2,
    totalWordsLearned: 60,
    roleplayConversationsCount: 4,
    voiceRecordingsCount: 8,
    totalXp: 1420,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    dailyTimeSpentTodayMinutes: 12,
    completedLessonIds: ['lesson-ja-a1-1'],
    voiceEnabled: true,
    slowAudioPreference: false,
    subscriptionTier: 'free',
  },
  {
    id: 'user-parent-1',
    name: 'Sarah Chen (Parent & Educator)',
    email: 'sarah.parent@example.com',
    role: 'parent',
    ageGroup: 'adult_18_plus',
    targetLanguage: 'es',
    nativeLanguage: 'en',
    currentCefr: 'B1',
    learningGoal: 'Supervise children and practice bilingual home conversation',
    dailyGoalMinutes: 20,
    dailyGoalXp: 100,
    dailyXpEarnedToday: 80,
    dailyXpDate: new Date().toISOString().slice(0, 10),
    streakDays: 15,
    bestStreak: 30,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    streakHistory: getPastDates(15),
    unlockedBadgeIds: [
      'streak_3',
      'streak_7',
      'streak_14',
      'first_lesson',
      'perfect_lesson',
      'three_perfect_lessons',
      'words_10',
      'words_50',
      'first_roleplay',
      'voice_shadow_master',
    ],
    perfectLessonsCount: 4,
    totalWordsLearned: 110,
    roleplayConversationsCount: 8,
    voiceRecordingsCount: 15,
    totalXp: 2100,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    dailyTimeSpentTodayMinutes: 15,
    completedLessonIds: ['lesson-es-a1-1', 'lesson-es-a1-2'],
    voiceEnabled: true,
    slowAudioPreference: false,
    subscriptionTier: 'family',
    subscription: {
      subscriptionId: 'sub_family_sarah_8819',
      customerId: 'cus_family_sarah_4120',
      tier: 'family',
      status: 'active',
      interval: 'year',
      price: 199.0,
      currency: 'usd',
      currentPeriodStart: new Date(Date.now() - 60 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 305 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      planName: 'Speak Dolphin Family & Educator',
      familyMembers: ['user-child-1', 'user-parent-1'],
      paymentMethod: {
        brand: 'Mastercard',
        last4: '5555',
        expiryMonth: 10,
        expiryYear: 2029,
      },
    },
  },
];

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  highContrast: false,
  dyslexiaFont: false,
  fontSize: 'normal',
  reducedMotion: false,
  soundEffects: true,
  autoPlayAudio: true,
  speechRate: 1.0,
};

export function getStoredCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILES[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('fluentpath_current_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        dailyGoalXp: parsed.dailyGoalXp || 100,
        dailyXpEarnedToday: typeof parsed.dailyXpEarnedToday === 'number' ? parsed.dailyXpEarnedToday : 60,
        dailyXpDate: parsed.dailyXpDate || new Date().toISOString().slice(0, 10),
        subscriptionTier: parsed.subscriptionTier || 'free',
        subscription: parsed.subscription || undefined,
      };
    }
  } catch (e) {
    console.error('Failed to read user from storage', e);
  }
  return DEFAULT_PROFILES[0];
}

export function saveCurrentUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also sync in all users
    const all = getAllUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      all[idx] = user;
    } else {
      all.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export function getAllUsers(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS) || localStorage.getItem('fluentpath_all_users');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read all users', e);
  }
  return DEFAULT_PROFILES;
}

export function switchUserProfile(userId: string): UserProfile {
  const all = getAllUsers();
  const found = all.find((u) => u.id === userId) || all[0];
  saveCurrentUser(found);
  return found;
}

export function getStoredSrsItems(languageId?: string): SrsItem[] {
  if (typeof window === 'undefined') return INITIAL_SRS_CARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SRS_ITEMS) || localStorage.getItem('fluentpath_srs_items');
    if (raw) {
      const items: SrsItem[] = JSON.parse(raw);
      if (languageId) {
        return items.filter((i) => i.languageId === languageId);
      }
      return items;
    }
  } catch (e) {
    console.error('Failed to read SRS items', e);
  }
  // Initialize with initial cards
  saveSrsItems(INITIAL_SRS_CARDS);
  if (languageId) {
    return INITIAL_SRS_CARDS.filter((i) => i.languageId === languageId);
  }
  return INITIAL_SRS_CARDS;
}

export function saveSrsItems(items: SrsItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SRS_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save SRS items', e);
  }
}

export function getStoredAccessibility(): AccessibilitySettings {
  if (typeof window === 'undefined') return DEFAULT_ACCESSIBILITY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read accessibility', e);
  }
  return DEFAULT_ACCESSIBILITY;
}

export function saveAccessibility(settings: AccessibilitySettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save accessibility', e);
  }
}

export function getStoredChatMessages(scenario: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${scenario}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read chat messages', e);
  }
  return [];
}

export function saveChatMessages(scenario: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${scenario}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat messages', e);
  }
}

// --- Billing & Subscription Storage Helpers ---
const BILLING_STORAGE_KEYS = {
  INVOICES: 'speakdolphin_billing_invoices',
};

export function getStoredInvoices(userId: string): import('../types').BillingInvoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${BILLING_STORAGE_KEYS.INVOICES}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read invoices from storage', e);
  }
  return [
    {
      id: `inv_init_${userId.slice(0, 8)}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-00109`,
      subscriptionId: `sub_init_${userId.slice(0, 8)}`,
      userId,
      amount: 12.99,
      currency: 'usd',
      status: 'paid',
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      planName: 'Speak Dolphin Pro Learner',
      paymentMethodLast4: '4242',
      receiptUrl: '#',
    },
  ];
}

export function saveStoredInvoice(invoice: import('../types').BillingInvoice): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredInvoices(invoice.userId);
    const updated = [invoice, ...existing.filter((inv) => inv.id !== invoice.id)];
    localStorage.setItem(`${BILLING_STORAGE_KEYS.INVOICES}_${invoice.userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save invoice', e);
  }
}

export function updateUserSubscription(userId: string, subscription: import('../types').SubscriptionDetails): UserProfile {
  const all = getAllUsers();
  const idx = all.findIndex((u) => u.id === userId);
  const current = idx >= 0 ? all[idx] : getStoredCurrentUser();

  const updated: UserProfile = {
    ...current,
    subscriptionTier: subscription.tier,
    subscription,
  };

  saveCurrentUser(updated);
  return updated;
}

