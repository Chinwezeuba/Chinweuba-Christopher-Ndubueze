import { SrsItem } from '../types';
export { getStoredSrsItems, saveSrsItems } from './storage';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm implementation.
 * Calculates next review interval, repetitions, and updated ease factor based on learner's grade (0-5).
 */
export function calculateSm2(
  item: SrsItem,
  grade: number, // 0 to 5
  durationMs: number = 2000
): SrsItem {
  const boundedGrade = Math.max(0, Math.min(5, Math.round(grade)));
  let { repetitions, easeFactor, intervalDays } = item;

  if (boundedGrade >= 3) {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    // Failure to recall
    repetitions = 0;
    intervalDays = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - boundedGrade) * (0.08 + (5 - boundedGrade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const now = new Date();
  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const newHistory = [
    ...(item.history || []),
    {
      date: now.toISOString(),
      grade: boundedGrade,
      durationMs,
    },
  ];

  return {
    ...item,
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    lastReviewedDate: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    history: newHistory,
  };
}

/**
 * Checks if an SRS item is currently due for review.
 */
export function isItemDue(item: SrsItem): boolean {
  if (!item.nextReviewDate) return true;
  const reviewTime = new Date(item.nextReviewDate).getTime();
  const now = Date.now();
  return reviewTime <= now;
}

/**
 * Categorizes learner's mastery level based on repetitions and ease factor.
 */
export function getMasteryStage(item: SrsItem): 'Learning' | 'Reviewing' | 'Mastered' {
  if (item.repetitions >= 5 && item.intervalDays >= 21) {
    return 'Mastered';
  }
  if (item.repetitions >= 1) {
    return 'Reviewing';
  }
  return 'Learning';
}

/**
 * Default starter SRS cards for each supported language.
 */
export const INITIAL_SRS_CARDS: SrsItem[] = [
  // Spanish
  {
    id: 'srs-es-1',
    languageId: 'es',
    term: 'agradecer',
    translation: 'to thank / to be grateful for',
    phonetic: 'ah-grah-deh-SEHR',
    partOfSpeech: 'verb',
    exampleSentence: 'Quiero agradecerte por toda tu paciencia y ayuda.',
    exampleTranslation: 'I want to thank you for all your patience and help.',
    audioText: 'Quiero agradecerte por toda tu paciencia y ayuda.',
    culturalNote: 'Expressing gratitude with warmth is central to social courtesy throughout Hispanic cultures.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
  {
    id: 'srs-es-2',
    languageId: 'es',
    term: 'la costumbre',
    translation: 'habit / custom / tradition',
    phonetic: 'lah kohs-TOOM-breh',
    partOfSpeech: 'noun (fem)',
    exampleSentence: 'Es una costumbre cenar tarde en España con amigos.',
    exampleTranslation: 'It is a custom to have dinner late in Spain with friends.',
    audioText: 'Es una costumbre cenar tarde en España con amigos.',
    culturalNote: 'Dinners in Spain frequently begin between 9:00 PM and 10:30 PM.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
  {
    id: 'srs-es-3',
    languageId: 'es',
    term: 'desafortunadamente',
    translation: 'unfortunately',
    phonetic: 'deh-sah-for-too-nah-dah-MEN-teh',
    partOfSpeech: 'adverb',
    exampleSentence: 'Desafortunadamente no quedan billetes para el tren.',
    exampleTranslation: 'Unfortunately there are no train tickets left.',
    audioText: 'Desafortunadamente no quedan billetes para el tren.',
    culturalNote: 'Notice how adverbs ending in -mente retain the stress on the penultimate syllable.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
  {
    id: 'srs-es-4',
    languageId: 'es',
    term: 'la sobremesa',
    translation: 'time spent lingering at the table talking after a meal',
    phonetic: 'lah soh-breh-MEH-sah',
    partOfSpeech: 'cultural noun',
    exampleSentence: 'Nos quedamos dos horas de sobremesa contando anécdotas.',
    exampleTranslation: 'We stayed two hours chatting at the table sharing stories.',
    audioText: 'Nos quedamos dos horas de sobremesa contando anécdotas.',
    culturalNote: 'Sobremesa is an untranslatable cultural gem representing connection after dining.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },

  // French
  {
    id: 'srs-fr-1',
    languageId: 'fr',
    term: 'enchanté(e)',
    translation: 'delighted to meet you',
    phonetic: 'ahn-shahn-TAY',
    partOfSpeech: 'adjective / greeting',
    exampleSentence: 'Enchanté de faire votre connaissance, Monsieur Laurent.',
    exampleTranslation: 'Delighted to make your acquaintance, Mr. Laurent.',
    audioText: 'Enchanté de faire votre connaissance, Monsieur Laurent.',
    culturalNote: 'Always accompanied by a firm handshake or polite nod in formal French greetings.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
  {
    id: 'srs-fr-2',
    languageId: 'fr',
    term: 'le coup de foudre',
    translation: 'love at first sight (lit. bolt of lightning)',
    phonetic: 'luh koo duh FOOD-ruh',
    partOfSpeech: 'idiom / noun',
    exampleSentence: 'Quand ils se sont rencontrés à Paris, ce fut le coup de foudre.',
    exampleTranslation: 'When they met in Paris, it was love at first sight.',
    audioText: 'Quand ils se sont rencontrés à Paris, ce fut le coup de foudre.',
    culturalNote: 'Poetic expression used affectionately for both romance and falling in love with a place.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },

  // Japanese
  {
    id: 'srs-ja-1',
    languageId: 'ja',
    term: 'よろしくお願いします (Yoroshiku onegaishimasu)',
    translation: 'Please treat me favorably / Looking forward to working with you',
    phonetic: 'yoh-roh-shee-koo oh-neh-gah-ee-shee-moss',
    partOfSpeech: 'essential honorific phrase',
    exampleSentence: 'これからよろしくお願いします。',
    exampleTranslation: 'I look forward to working with you from now on.',
    audioText: 'これからよろしくお願いします。',
    culturalNote: 'Fundamental Japanese phrase sealing new relationships, projects, or meetings.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
  {
    id: 'srs-ja-2',
    languageId: 'ja',
    term: '木漏れ日 (Komorebi)',
    translation: 'sunlight filtering through tree leaves',
    phonetic: 'koh-moh-reh-bee',
    partOfSpeech: 'aesthetic noun',
    exampleSentence: '森の中で美しい木漏れ日を見ました。',
    exampleTranslation: 'I saw beautiful sunlight filtering through the trees in the forest.',
    audioText: '森の中で美しい木漏れ日を見ました。',
    culturalNote: 'Reflects Japanese appreciation for transient natural beauty and wabi-sabi.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },

  // German
  {
    id: 'srs-de-1',
    languageId: 'de',
    term: 'die Gemütlichkeit',
    translation: 'coziness, warmth, friendliness, and peace of mind',
    phonetic: 'dee geh-MEET-likh-kite',
    partOfSpeech: 'noun (fem)',
    exampleSentence: 'Die Berghütte strahlte eine wunderbare Gemütlichkeit aus.',
    exampleTranslation: 'The mountain cabin radiated a wonderful coziness.',
    audioText: 'Die Berghütte strahlte eine wunderbare Gemütlichkeit aus.',
    culturalNote: 'A deep sense of comfort, hospitality, and unhurried belonging.',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },

  // Mandarin
  {
    id: 'srs-zh-1',
    languageId: 'zh',
    term: '客气 (kè qi)',
    translation: 'polite / courteous / modest',
    phonetic: 'kè-chee',
    partOfSpeech: 'adjective',
    exampleSentence: '不用客气，这是我应该做的。',
    exampleTranslation: 'No need to be polite (You are welcome), it is what I should do.',
    audioText: '不用客气，这是我应该做的。',
    culturalNote: '“别客气” (bié kèqi) is the standard graceful response to “谢谢” (thank you).',
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    history: [],
  },
];
