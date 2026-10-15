import { UserProfile, AgeGroup } from '../types';
import { getLocalDateString } from './dailyGoal';

export interface ChallengeQuestion {
  id: string;
  type: 'vocab_blitz' | 'listen_and_match' | 'fill_blank';
  prompt: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface DailyChallengeInfo {
  id: string;
  title: string;
  theme: string;
  description: string;
  durationSeconds: number;
  bonusXp: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: ChallengeQuestion[];
}

// Multilingual Challenge bank covering all 12 supported languages
const CHALLENGE_VOCAB_MAP: Record<string, ChallengeQuestion[]> = {
  es: [
    {
      id: 'es-1',
      type: 'vocab_blitz',
      prompt: 'What does "Por favor" mean in English?',
      audioText: 'Por favor',
      options: ['Please', 'Thank you', 'Goodbye', 'You are welcome'],
      correctAnswer: 'Please',
      explanation: '"Por favor" is the fundamental courtesy phrase for "Please" in Spanish.',
      points: 100,
    },
    {
      id: 'es-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select the meaning:',
      audioText: 'Quisiera un café',
      options: ['I would like a coffee', 'Where is the restaurant?', 'Do you have tea?', 'How much is this?'],
      correctAnswer: 'I would like a coffee',
      explanation: '"Quisiera" is the polite form of "I would like" commonly used in Spanish cafés.',
      points: 120,
    },
    {
      id: 'es-3',
      type: 'fill_blank',
      prompt: 'Complete the sentence: "Muchas _______ por tu ayuda."',
      audioText: 'Muchas gracias por tu ayuda.',
      options: ['gracias', 'noches', 'tardes', 'fiestas'],
      correctAnswer: 'gracias',
      explanation: '"Muchas gracias" means "Thank you very much".',
      points: 110,
    },
    {
      id: 'es-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "The bill / check"?',
      audioText: 'La cuenta',
      options: ['La cuenta', 'El agua', 'El menú', 'El plato'],
      correctAnswer: 'La cuenta',
      explanation: '"La cuenta, por favor" is used to request the bill.',
      points: 100,
    },
    {
      id: 'es-5',
      type: 'listen_and_match',
      prompt: 'Listen to the greeting:',
      audioText: '¡Buenos días!',
      options: ['Good morning!', 'Good night!', 'See you soon!', 'Excuse me!'],
      correctAnswer: 'Good morning!',
      explanation: '"Buenos días" is the standard morning greeting in Spanish.',
      points: 110,
    },
  ],
  fr: [
    {
      id: 'fr-1',
      type: 'vocab_blitz',
      prompt: 'What does "S\'il vous plaît" mean?',
      audioText: "S'il vous plaît",
      options: ['Please', 'Thank you', 'Good morning', 'Excuse me'],
      correctAnswer: 'Please',
      explanation: '"S\'il vous plaît" is the polite formal form for "Please" in French.',
      points: 100,
    },
    {
      id: 'fr-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select what was ordered:',
      audioText: 'Un croissant chaud',
      options: ['A warm croissant', 'A glass of red wine', 'A cup of black coffee', 'A bottle of water'],
      correctAnswer: 'A warm croissant',
      explanation: '"Un croissant chaud" translates to "a warm croissant".',
      points: 120,
    },
    {
      id: 'fr-3',
      type: 'fill_blank',
      prompt: 'Complete the greeting: "Bonjour, comment _______-vous ?"',
      audioText: 'Bonjour, comment allez-vous ?',
      options: ['allez', 'êtes', 'prenez', 'venez'],
      correctAnswer: 'allez',
      explanation: '"Comment allez-vous ?" uses the verb aller to ask how someone is doing.',
      points: 110,
    },
    {
      id: 'fr-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Thank you very much"?',
      audioText: 'Merci beaucoup',
      options: ['Merci beaucoup', 'Au revoir', 'De rien', 'À bientôt'],
      correctAnswer: 'Merci beaucoup',
      explanation: '"Merci beaucoup" expresses deep gratitude.',
      points: 100,
    },
    {
      id: 'fr-5',
      type: 'listen_and_match',
      prompt: 'Listen to the departure phrase:',
      audioText: 'Bonne journée !',
      options: ['Have a great day!', 'Have a good evening!', 'Welcome home!', 'Safe travels!'],
      correctAnswer: 'Have a great day!',
      explanation: '"Bonne journée" is used when parting during the daytime.',
      points: 110,
    },
  ],
  ja: [
    {
      id: 'ja-1',
      type: 'vocab_blitz',
      prompt: 'What does "Arigatou gozaimasu" mean?',
      audioText: 'ありがとうございます',
      options: ['Thank you very much', 'Good evening', 'Excuse me', 'Goodbye'],
      correctAnswer: 'Thank you very much',
      explanation: 'ありがとうございます (Arigatou gozaimasu) is the polite form of "Thank you".',
      points: 100,
    },
    {
      id: 'ja-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select the phrase:',
      audioText: 'お水をお願いします',
      options: ['Water, please', 'Coffee, please', 'The menu, please', 'The check, please'],
      correctAnswer: 'Water, please',
      explanation: 'お水をお願いします (Omizu o onegaishimasu) means "Water, please".',
      points: 120,
    },
    {
      id: 'ja-3',
      type: 'fill_blank',
      prompt: 'Complete the greeting: "Konnichiwa, o-genki _______ ka?"',
      audioText: 'こんにちは、お元気ですか？',
      options: ['desu', 'masu', 'arimasu', 'imasu'],
      correctAnswer: 'desu',
      explanation: 'お元気ですか (O-genki desu ka) is "How are you?".',
      points: 110,
    },
    {
      id: 'ja-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Excuse me / I\'m sorry"?',
      audioText: 'すみません',
      options: ['Sumimasen', 'Sayounara', 'Hajimemashite', 'Konbanwa'],
      correctAnswer: 'Sumimasen',
      explanation: 'すみません (Sumimasen) is used to call a waiter or say excuse me.',
      points: 100,
    },
    {
      id: 'ja-5',
      type: 'listen_and_match',
      prompt: 'Listen to the dining phrase:',
      audioText: 'いただきます',
      options: ['Gratitude before eating', 'Gratitude after eating', 'Cheers!', 'Delicious!'],
      correctAnswer: 'Gratitude before eating',
      explanation: 'いただきます (Itadakimasu) is said humbly before starting a meal.',
      points: 110,
    },
  ],
  de: [
    {
      id: 'de-1',
      type: 'vocab_blitz',
      prompt: 'What does "Bitte schön" mean?',
      audioText: 'Bitte schön',
      options: ['You are welcome / Please', 'Good night', 'Excuse me', 'Goodbye'],
      correctAnswer: 'You are welcome / Please',
      explanation: '"Bitte schön" is used when offering something or responding to Danke.',
      points: 100,
    },
    {
      id: 'de-2',
      type: 'listen_and_match',
      prompt: 'Listen and select what was ordered:',
      audioText: 'Ein Glas Wasser, bitte',
      options: ['A glass of water, please', 'A warm coffee, please', 'A piece of cake, please', 'The check, please'],
      correctAnswer: 'A glass of water, please',
      explanation: '"Ein Glas Wasser, bitte" requests a glass of water.',
      points: 120,
    },
    {
      id: 'de-3',
      type: 'fill_blank',
      prompt: 'Complete: "Vielen _______ für Ihre freundliche Hilfe!"',
      audioText: 'Vielen Dank für Ihre Hilfe!',
      options: ['Dank', 'Tag', 'Morgen', 'Abend'],
      correctAnswer: 'Dank',
      explanation: '"Vielen Dank" means "Many thanks".',
      points: 110,
    },
    {
      id: 'de-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Goodbye" in German?',
      audioText: 'Auf Wiedersehen',
      options: ['Auf Wiedersehen', 'Guten Morgen', 'Entschuldigung', 'Willkommen'],
      correctAnswer: 'Auf Wiedersehen',
      explanation: '"Auf Wiedersehen" is the formal way to say goodbye.',
      points: 100,
    },
    {
      id: 'de-5',
      type: 'listen_and_match',
      prompt: 'Listen to the phrase:',
      audioText: 'Guten Appetit!',
      options: ['Enjoy your meal!', 'Good morning!', 'Have a nice evening!', 'Cheers!'],
      correctAnswer: 'Enjoy your meal!',
      explanation: '"Guten Appetit!" is the German wishing for a good meal.',
      points: 110,
    },
  ],
  zh: [
    {
      id: 'zh-1',
      type: 'vocab_blitz',
      prompt: 'What does "Xièxie" (谢谢) mean?',
      audioText: '谢谢',
      options: ['Thank you', 'Hello', 'Goodbye', 'Please'],
      correctAnswer: 'Thank you',
      explanation: '谢谢 (Xièxie) is the universal term for Thank you.',
      points: 100,
    },
    {
      id: 'zh-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select the phrase:',
      audioText: '请给我一杯茶',
      options: ['Please give me a cup of tea', 'Please bring the menu', 'Where is the hotel?', 'Good afternoon'],
      correctAnswer: 'Please give me a cup of tea',
      explanation: '请给我一杯茶 (Qǐng gěi wǒ yī bēi chá) requests a cup of tea.',
      points: 120,
    },
    {
      id: 'zh-3',
      type: 'fill_blank',
      prompt: 'Complete: "Nǐ hǎo, _______ zěnme yàng?"',
      audioText: '你好，最近怎么样？',
      options: ['zuìjìn', 'míngtiān', 'jīntiān', 'zuótiān'],
      correctAnswer: 'zuìjìn',
      explanation: '最近 (zuìjìn) means "recently / lately".',
      points: 110,
    },
    {
      id: 'zh-4',
      type: 'vocab_blitz',
      prompt: 'Which phrase means "You are welcome"?',
      audioText: '不客气',
      options: ['Bù kèqi', 'Duìbuqǐ', 'Zàijiàn', 'Míngtiān jiàn'],
      correctAnswer: 'Bù kèqi',
      explanation: '不客气 (Bù kèqi) literally means "No need for politeness / You\'re welcome".',
      points: 100,
    },
    {
      id: 'zh-5',
      type: 'listen_and_match',
      prompt: 'Listen to the phrase:',
      audioText: '很高兴认识你',
      options: ['Pleased to meet you', 'How much does this cost?', 'I do not understand', 'Where is the subway?'],
      correctAnswer: 'Pleased to meet you',
      explanation: '很高兴认识你 (Hěn gāoxìng rènshi nǐ) means "Very glad to meet you".',
      points: 110,
    },
  ],
  pt: [
    {
      id: 'pt-1',
      type: 'vocab_blitz',
      prompt: 'What does "Por favor" mean in Portuguese?',
      audioText: 'Por favor',
      options: ['Please', 'Thank you', 'Goodbye', 'Good night'],
      correctAnswer: 'Please',
      explanation: '"Por favor" is please in Portuguese.',
      points: 100,
    },
    {
      id: 'pt-2',
      type: 'listen_and_match',
      prompt: 'Listen and select what is requested:',
      audioText: 'Um café expresso, por favor',
      options: ['An espresso coffee, please', 'A cold water bottle', 'The dinner bill', 'A slice of bread'],
      correctAnswer: 'An espresso coffee, please',
      explanation: '"Um café expresso, por favor" orders an espresso.',
      points: 120,
    },
    {
      id: 'pt-3',
      type: 'fill_blank',
      prompt: 'Complete: "Muito _______ pela sua atenção!"',
      audioText: 'Muito obrigado pela sua atenção!',
      options: ['obrigado', 'bom', 'cedo', 'tarde'],
      correctAnswer: 'obrigado',
      explanation: '"Muito obrigado" means thank you very much.',
      points: 110,
    },
    {
      id: 'pt-4',
      type: 'vocab_blitz',
      prompt: 'Which greeting means "Good afternoon"?',
      audioText: 'Boa tarde',
      options: ['Boa tarde', 'Bom dia', 'Boa noite', 'Até logo'],
      correctAnswer: 'Boa tarde',
      explanation: '"Boa tarde" is the standard afternoon greeting.',
      points: 100,
    },
    {
      id: 'pt-5',
      type: 'listen_and_match',
      prompt: 'Listen to the polite phrase:',
      audioText: 'Com licença',
      options: ['Excuse me', 'Good morning', 'Thank you', 'Goodbye'],
      correctAnswer: 'Excuse me',
      explanation: '"Com licença" is used to ask for permission or excuse yourself.',
      points: 110,
    },
  ],
  it: [
    {
      id: 'it-1',
      type: 'vocab_blitz',
      prompt: 'What does "Per favore" mean in Italian?',
      audioText: 'Per favore',
      options: ['Please', 'Thank you', 'Excuse me', 'Cheers'],
      correctAnswer: 'Please',
      explanation: '"Per favore" is please in Italian.',
      points: 100,
    },
    {
      id: 'it-2',
      type: 'listen_and_match',
      prompt: 'Listen and select what was ordered:',
      audioText: 'Un cappuccino caldo, grazie',
      options: ['A hot cappuccino, thank you', 'A glass of mineral water', 'A margherita pizza', 'A scoop of gelato'],
      correctAnswer: 'A hot cappuccino, thank you',
      explanation: '"Un cappuccino caldo" is a hot cappuccino.',
      points: 120,
    },
    {
      id: 'it-3',
      type: 'fill_blank',
      prompt: 'Complete: "Mille _______ per la cena deliziosa!"',
      audioText: 'Mille grazie per la cena!',
      options: ['grazie', 'giorni', 'prego', 'amici'],
      correctAnswer: 'grazie',
      explanation: '"Mille grazie" translates to "a thousand thanks".',
      points: 110,
    },
    {
      id: 'it-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "You are welcome" in Italian?',
      audioText: 'Prego',
      options: ['Prego', 'Scusa', 'Arrivederci', 'Piacere'],
      correctAnswer: 'Prego',
      explanation: '"Prego" is the standard response to "Grazie".',
      points: 100,
    },
    {
      id: 'it-5',
      type: 'listen_and_match',
      prompt: 'Listen to the departure phrase:',
      audioText: 'Arrivederci e buona giornata!',
      options: ['Goodbye and have a nice day!', 'Welcome and make yourself comfortable!', 'Good morning everyone!', 'Where is the station?'],
      correctAnswer: 'Goodbye and have a nice day!',
      explanation: '"Arrivederci" means goodbye in Italian.',
      points: 110,
    },
  ],
  ar: [
    {
      id: 'ar-1',
      type: 'vocab_blitz',
      prompt: 'What does "Shukran" (شكراً) mean?',
      audioText: 'شكراً',
      options: ['Thank you', 'Please', 'Peace be with you', 'Goodbye'],
      correctAnswer: 'Thank you',
      explanation: 'شكراً (Shukran) is the universal Arabic expression of gratitude.',
      points: 100,
    },
    {
      id: 'ar-2',
      type: 'listen_and_match',
      prompt: 'Listen and select the greeting:',
      audioText: 'أهلاً وسهلاً',
      options: ['Welcome!', 'Good evening!', 'See you tomorrow!', 'Excuse me!'],
      correctAnswer: 'Welcome!',
      explanation: 'أهلاً وسهلاً (Ahlan wa Sahlan) is the classic warm Arabic welcome.',
      points: 120,
    },
    {
      id: 'ar-3',
      type: 'fill_blank',
      prompt: 'Complete the greeting: "As-salamu _______"',
      audioText: 'السلام عليكم',
      options: ['alaykum', 'marhaban', 'shukran', 'sabah'],
      correctAnswer: 'alaykum',
      explanation: 'السلام عليكم (As-salamu alaykum) means "Peace be upon you".',
      points: 110,
    },
    {
      id: 'ar-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Please" in Arabic?',
      audioText: 'من فضلك',
      options: ['Min fadlik', 'Afwan', 'Sabah al-khayr', 'Ila al-liqa'],
      correctAnswer: 'Min fadlik',
      explanation: 'من فضلك (Min fadlik) means "If you please".',
      points: 100,
    },
    {
      id: 'ar-5',
      type: 'listen_and_match',
      prompt: 'Listen to the response:',
      audioText: 'عفواً',
      options: ['You are welcome / Pardon', 'Good night', 'Delicious meal', 'Safe voyage'],
      correctAnswer: 'You are welcome / Pardon',
      explanation: 'عفواً (Afwan) is both "You\'re welcome" and "Excuse me".',
      points: 110,
    },
  ],
  // AFRICAN LANGUAGES
  ig: [
    {
      id: 'ig-1',
      type: 'vocab_blitz',
      prompt: 'What does "Daalụ" mean in Igbo?',
      audioText: 'Daalụ',
      options: ['Thank you', 'Good morning', 'Come here', 'Welcome'],
      correctAnswer: 'Thank you',
      explanation: '"Daalụ" is the classic Igbo word for "Thank you" and well done.',
      points: 100,
    },
    {
      id: 'ig-2',
      type: 'listen_and_match',
      prompt: 'Listen to the Igbo greeting:',
      audioText: 'Nnọọ',
      options: ['Welcome', 'Goodbye', 'Good evening', 'See you later'],
      correctAnswer: 'Welcome',
      explanation: '"Nnọọ" is the warm Igbo greeting for "Welcome".',
      points: 120,
    },
    {
      id: 'ig-3',
      type: 'fill_blank',
      prompt: 'Complete: "Kedụ ka i _______ ?" (How are you?)',
      audioText: 'Kedụ ka i mere?',
      options: ['mere', 'chọrọ', 'ga-aga', 'biko'],
      correctAnswer: 'mere',
      explanation: '"Kedụ ka i mere?" is the standard greeting "How are you doing?".',
      points: 110,
    },
    {
      id: 'ig-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Please" in Igbo?',
      audioText: 'Biko',
      options: ['Biko', 'Ndo', 'Ka omesia', 'Eziokwu'],
      correctAnswer: 'Biko',
      explanation: '"Biko" is the essential Igbo word for "Please".',
      points: 100,
    },
    {
      id: 'ig-5',
      type: 'listen_and_match',
      prompt: 'Listen to the departure:',
      audioText: 'Ka ọ dị',
      options: ['Until next time / Goodbye', 'Good morning', 'Thank you very much', 'Come in!'],
      correctAnswer: 'Until next time / Goodbye',
      explanation: '"Ka ọ dị" means "Goodbye / Until then".',
      points: 110,
    },
  ],
  sw: [
    {
      id: 'sw-1',
      type: 'vocab_blitz',
      prompt: 'What does "Asante sana" mean in Swahili?',
      audioText: 'Asante sana',
      options: ['Thank you very much', 'Good evening', 'How are you?', 'Welcome home'],
      correctAnswer: 'Thank you very much',
      explanation: '"Asante sana" expresses sincere gratitude in Swahili.',
      points: 100,
    },
    {
      id: 'sw-2',
      type: 'listen_and_match',
      prompt: 'Listen and select the greeting:',
      audioText: 'Habari gani?',
      options: ['How are things? / How are you?', 'Goodbye!', 'Where are you going?', 'Have a nice day!'],
      correctAnswer: 'How are things? / How are you?',
      explanation: '"Habari gani?" literally means "What news? / How are you?".',
      points: 120,
    },
    {
      id: 'sw-3',
      type: 'fill_blank',
      prompt: 'Complete the response: "Habari za asubuhi? - _______!"',
      audioText: 'Habari za asubuhi? - Nzuri!',
      options: ['Nzuri', 'Tafadhali', 'Kwaheri', 'Pole'],
      correctAnswer: 'Nzuri',
      explanation: '"Nzuri" means "Good / Fine", the standard answer to Habari.',
      points: 110,
    },
    {
      id: 'sw-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Please" in Swahili?',
      audioText: 'Tafadhali',
      options: ['Tafadhali', 'Karibu', 'Pole pole', 'Ndiyo'],
      correctAnswer: 'Tafadhali',
      explanation: '"Tafadhali" is the courteous Swahili word for "Please".',
      points: 100,
    },
    {
      id: 'sw-5',
      type: 'listen_and_match',
      prompt: 'Listen to the welcoming phrase:',
      audioText: 'Karibu sana!',
      options: ['You are very welcome!', 'Have safe travels!', 'See you tomorrow!', 'Good luck!'],
      correctAnswer: 'You are very welcome!',
      explanation: '"Karibu sana" warmly welcomes a guest or responds to Asante.',
      points: 110,
    },
  ],
  ha: [
    {
      id: 'ha-1',
      type: 'vocab_blitz',
      prompt: 'What does "Na gode" mean in Hausa?',
      audioText: 'Na gode',
      options: ['Thank you', 'Good morning', 'Goodbye', 'Please'],
      correctAnswer: 'Thank you',
      explanation: '"Na gode" is "Thank you" in Hausa.',
      points: 100,
    },
    {
      id: 'ha-2',
      type: 'listen_and_match',
      prompt: 'Listen to the Hausa greeting:',
      audioText: 'Sannu da zuwa',
      options: ['Welcome upon arrival', 'Good night', 'Where is the market?', 'Safe voyage'],
      correctAnswer: 'Welcome upon arrival',
      explanation: '"Sannu da zuwa" greets someone arriving warmly.',
      points: 120,
    },
    {
      id: 'ha-3',
      type: 'fill_blank',
      prompt: 'Complete: "Ina kwana? - Lafiya _______."',
      audioText: 'Ina kwana? - Lafiya lau.',
      options: ['lau', 'bisa', 'yanzu', 'kuma'],
      correctAnswer: 'lau',
      explanation: '"Lafiya lau" means "In total good health / fine".',
      points: 110,
    },
    {
      id: 'ha-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Please" in Hausa?',
      audioText: 'Don Allah',
      options: ['Don Allah', 'Barka', 'Yauwa', 'Sai wata rana'],
      correctAnswer: 'Don Allah',
      explanation: '"Don Allah" is used politely to say "Please".',
      points: 100,
    },
    {
      id: 'ha-5',
      type: 'listen_and_match',
      prompt: 'Listen to the departure:',
      audioText: 'Sai anjima',
      options: ['See you later / Goodbye', 'Good morning!', 'Congratulations!', 'Excuse me!'],
      correctAnswer: 'See you later / Goodbye',
      explanation: '"Sai anjima" means "See you later".',
      points: 110,
    },
  ],
  ln: [
    {
      id: 'ln-1',
      type: 'vocab_blitz',
      prompt: 'What does "Matondi mingi" mean in Lingala?',
      audioText: 'Matondi mingi',
      options: ['Thank you very much', 'Good evening', 'Welcome home', 'See you soon'],
      correctAnswer: 'Thank you very much',
      explanation: '"Matondi mingi" expresses profound thanks in Lingala.',
      points: 100,
    },
    {
      id: 'ln-2',
      type: 'listen_and_match',
      prompt: 'Listen to the Lingala greeting:',
      audioText: 'Mbote na yo!',
      options: ['Hello to you!', 'Goodbye!', 'Where are you from?', 'Have a safe night!'],
      correctAnswer: 'Hello to you!',
      explanation: '"Mbote" is the universal Lingala greeting for hello.',
      points: 120,
    },
    {
      id: 'ln-3',
      type: 'fill_blank',
      prompt: 'Complete: "Sango nini? - Sango _______."',
      audioText: 'Sango nini? - Sango te.',
      options: ['te', 'mingi', 'malamu', 'ndeko'],
      correctAnswer: 'malamu',
      explanation: '"Sango malamu" means "Good news / All is well".',
      points: 110,
    },
    {
      id: 'ln-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Please" in Lingala?',
      audioText: 'Pardo / Nabondeli yo',
      options: ['Nabondeli yo', 'Kende malamu', 'Boyei bolamu', 'Tikala malamu'],
      correctAnswer: 'Nabondeli yo',
      explanation: '"Nabondeli yo" is the polite Lingala term for "I beseech you / Please".',
      points: 100,
    },
    {
      id: 'ln-5',
      type: 'listen_and_match',
      prompt: 'Listen to the departure greeting:',
      audioText: 'Kende malamu!',
      options: ['Go well! / Safe travels!', 'Stay well!', 'Good morning!', 'Welcome!'],
      correctAnswer: 'Go well! / Safe travels!',
      explanation: '"Kende malamu" is said to the person departing ("Go well").',
      points: 110,
    },
  ],
  id: [
    {
      id: 'id-1',
      type: 'vocab_blitz',
      prompt: 'What does "Terima kasih" mean in English?',
      audioText: 'Terima kasih',
      options: ['Thank you', 'Please', 'Good morning', 'Excuse me'],
      correctAnswer: 'Thank you',
      explanation: '"Terima kasih" is the universal Indonesian expression of gratitude.',
      points: 100,
    },
    {
      id: 'id-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select what is ordered:',
      audioText: 'Satu porsi nasi goreng spesial, tolong.',
      options: ['One special fried rice, please', 'Two cups of hot coffee', 'A cold bottle of water', 'A bowl of soup'],
      correctAnswer: 'One special fried rice, please',
      explanation: '"Nasi goreng" is Indonesia\'s famous fried rice.',
      points: 120,
    },
    {
      id: 'id-3',
      type: 'fill_blank',
      prompt: 'Complete the greeting: "Halo! Apa _______ hari ini?"',
      audioText: 'Halo! Apa kabar hari ini?',
      options: ['kabar', 'nama', 'siang', 'malam'],
      correctAnswer: 'kabar',
      explanation: '"Apa kabar" means "How are you?".',
      points: 110,
    },
    {
      id: 'id-4',
      type: 'vocab_blitz',
      prompt: 'Which phrase means "You are welcome" in Indonesian?',
      audioText: 'Sama-sama',
      options: ['Sama-sama', 'Selamat pagi', 'Sampai jumpa', 'Hati-hati'],
      correctAnswer: 'Sama-sama',
      explanation: '"Sama-sama" means "You are welcome / Likewise".',
      points: 100,
    },
    {
      id: 'id-5',
      type: 'listen_and_match',
      prompt: 'Listen to the inquiry:',
      audioText: 'Berapa harganya?',
      options: ['How much is the price?', 'Where is the hotel?', 'What time is it?', 'Are you ready?'],
      correctAnswer: 'How much is the price?',
      explanation: '"Berapa harganya?" asks for the cost or bill.',
      points: 110,
    },
  ],
  'pt-PT': [
    {
      id: 'pt-PT-1',
      type: 'vocab_blitz',
      prompt: 'In European Portuguese, what is "se faz favor"?',
      audioText: 'Se faz favor',
      options: ['Please', 'Thank you', 'Good morning', 'See you soon'],
      correctAnswer: 'Please',
      explanation: '"Se faz favor" is standard European Portuguese for "Please".',
      points: 100,
    },
    {
      id: 'pt-PT-2',
      type: 'listen_and_match',
      prompt: 'Listen and select the Lisbon coffee order:',
      audioText: 'Uma bica e um pastel de nata, se faz favor.',
      options: ['An espresso and a custard tart, please', 'A glass of red wine and bread', 'A hot tea with milk', 'A cold orange juice'],
      correctAnswer: 'An espresso and a custard tart, please',
      explanation: 'In Lisbon, a "bica" is an espresso and "pastel de nata" is the custard tart.',
      points: 120,
    },
    {
      id: 'pt-PT-3',
      type: 'fill_blank',
      prompt: 'Complete: "Dê-me a _______, se faz favor."',
      audioText: 'Dê-me a conta, se faz favor.',
      options: ['conta', 'mesa', 'noite', 'tarde'],
      correctAnswer: 'conta',
      explanation: '"A conta" means the bill/check.',
      points: 110,
    },
    {
      id: 'pt-PT-4',
      type: 'vocab_blitz',
      prompt: 'Which word means "Breakfast" in Portugal?',
      audioText: 'O pequeno-almoço',
      options: ['O pequeno-almoço', 'O café da manhã', 'O almoço', 'O lanche'],
      correctAnswer: 'O pequeno-almoço',
      explanation: '"O pequeno-almoço" is the European Portuguese term for breakfast.',
      points: 100,
    },
    {
      id: 'pt-PT-5',
      type: 'listen_and_match',
      prompt: 'Listen to the formal greeting:',
      audioText: 'Como está o senhor hoje?',
      options: ['How are you (sir) today?', 'Where are you going?', 'Have a nice evening!', 'Welcome to the hotel!'],
      correctAnswer: 'How are you (sir) today?',
      explanation: '"O senhor" is respectful formal address in Portugal.',
      points: 110,
    },
  ],
  hi: [
    {
      id: 'hi-1',
      type: 'vocab_blitz',
      prompt: 'What does "नमस्ते" (Namaste) mean in English?',
      audioText: 'नमस्ते (Namaste)',
      options: ['Hello / Greetings', 'Thank you', 'Goodbye', 'Please'],
      correctAnswer: 'Hello / Greetings',
      explanation: '"नमस्ते" (Namaste) is the universal respectful Indian greeting.',
      points: 100,
    },
    {
      id: 'hi-2',
      type: 'listen_and_match',
      prompt: 'Listen to the audio and select what is requested:',
      audioText: 'कृपया एक कप गर्म मसाला चाय दीजिए।',
      options: ['Please give one cup of hot spiced tea', 'Two glasses of cold milk', 'A bowl of lentils and rice', 'A bottle of water'],
      correctAnswer: 'Please give one cup of hot spiced tea',
      explanation: '"मसाला चाय" is spiced milk tea and "दीजिए" is the polite request for "please give".',
      points: 120,
    },
    {
      id: 'hi-3',
      type: 'fill_blank',
      prompt: 'Complete: "आपकी सहायता के लिए बहुत-बहुत _______।"',
      audioText: 'आपकी सहायता के लिए बहुत-बहुत धन्यवाद।',
      options: ['धन्यवाद', 'शुभकामनाएं', 'नमस्ते', 'स्वागत'],
      correctAnswer: 'धन्यवाद',
      explanation: '"धन्यवाद" (Dhanyavaad) means "Thank you".',
      points: 110,
    },
    {
      id: 'hi-4',
      type: 'vocab_blitz',
      prompt: 'Which Hindi phrase asks "How are you?" respectfully?',
      audioText: 'आप कैसे हैं?',
      options: ['आप कैसे हैं?', 'आपका नाम क्या है?', 'यह क्या है?', 'आप कहाँ हैं?'],
      correctAnswer: 'आप कैसे हैं?',
      explanation: '"आप कैसे हैं?" is the respectful formal inquiry "How are you?".',
      points: 100,
    },
    {
      id: 'hi-5',
      type: 'listen_and_match',
      prompt: 'Listen to the question:',
      audioText: 'यह कितने का है?',
      options: ['How much does this cost?', 'Where is the bus?', 'Who is speaking?', 'What time is it?'],
      correctAnswer: 'How much does this cost?',
      explanation: '"यह कितने का है?" is the standard marketplace price inquiry.',
      points: 110,
    },
  ],
};

// Young Explorer (Child 3-5) tailored fun rapid challenges
const YOUNG_KIDS_CHALLENGES: ChallengeQuestion[] = [
  {
    id: 'kid-1',
    type: 'listen_and_match',
    prompt: 'Pip wants to find the Doggy! Touch the dog:',
    audioText: 'El perro',
    options: ['🐶 Dog (Perro)', '🐱 Cat (Gato)', '🦁 Lion (León)', '🐦 Bird (Pájaro)'],
    correctAnswer: '🐶 Dog (Perro)',
    explanation: 'Woof! "El perro" is the happy doggy!',
    points: 100,
  },
  {
    id: 'kid-2',
    type: 'listen_and_match',
    prompt: 'Pip wants to taste a sweet fruit! Which one is the Apple?',
    audioText: 'La manzana',
    options: ['🍎 Apple (Manzana)', '🍌 Banana (Plátano)', '🍊 Orange (Naranja)', '🍓 Strawberry (Fresa)'],
    correctAnswer: '🍎 Apple (Manzana)',
    explanation: 'Yum! "La manzana" is the crunchy apple!',
    points: 100,
  },
  {
    id: 'kid-3',
    type: 'vocab_blitz',
    prompt: 'Find the bright Red color for Pip\'s balloon:',
    audioText: 'Rojo',
    options: ['🔴 Rojo (Red)', '🔵 Azul (Blue)', '🟢 Verde (Green)', '🟡 Amarillo (Yellow)'],
    correctAnswer: '🔴 Rojo (Red)',
    explanation: 'Awesome! "Rojo" is bright red!',
    points: 100,
  },
  {
    id: 'kid-4',
    type: 'listen_and_match',
    prompt: 'Listen! Who says Meow? Touch the kitty:',
    audioText: 'El gato',
    options: ['🐱 Cat (Gato)', '🐶 Dog (Perro)', '🐼 Panda (Pip)', '🐰 Bunny (Conejo)'],
    correctAnswer: '🐱 Cat (Gato)',
    explanation: 'Meow! "El gato" is Pip\'s kitten friend!',
    points: 100,
  },
];

/**
 * Returns today's active challenge tailored to language and age group.
 */
export function getTodayChallengeInfo(languageId: string, ageGroup: AgeGroup): DailyChallengeInfo {
  const isKid = ageGroup === 'child_3_5';
  const langKey = CHALLENGE_VOCAB_MAP[languageId] ? languageId : 'es';
  const questions = isKid ? YOUNG_KIDS_CHALLENGES : (CHALLENGE_VOCAB_MAP[langKey] || CHALLENGE_VOCAB_MAP.es);

  const titles: Record<string, string> = {
    es: 'Spanish Lightning Vocab Sprint',
    fr: 'French Speed Dialogue Blitz',
    ja: 'Japanese Reflex Kanji & Phrase Dash',
    de: 'German Precision Sprint',
    zh: 'Mandarin Quickfire Tones & Terms',
    pt: 'Portuguese Rapid Expression Rush',
    it: 'Italian Café & Courtesies Blitz',
    ar: 'Arabic Conversational Sprint',
    ig: 'Igbo Tone & Heritage Quickfire',
    sw: 'Swahili Habari Rapid Sprint',
    ha: 'Hausa Sannu Reflex Challenge',
    ln: 'Lingala Mbote Rhythm Challenge',
    id: 'Indonesian Kilat Vocab Sprint',
    'pt-PT': 'European Portuguese Lisboa Challenge',
    hi: 'Hindi Namaste Rapid Fire',
  };

  const title = isKid
    ? "Pip's 45-Second Animal & Color Dash! 🐼"
    : (titles[languageId] || 'Daily Language Reflex Sprint');

  return {
    id: `daily-challenge-${languageId}-${getLocalDateString()}`,
    title,
    theme: isKid ? 'Playful Sounds & Pictures' : 'Rapid Auditory & Vocab Retrieval',
    description: isKid
      ? 'Tap correct sounds, listen to Pip, and earn shiny stars before the friendly timer rings!'
      : 'Answer 5 high-frequency conversational phrases before the clock runs out to maximize your combo multiplier and unlock bonus XP!',
    durationSeconds: 45,
    bonusXp: 50,
    difficulty: isKid ? 'Beginner' : 'Intermediate',
    questions,
  };
}

/**
 * Evaluates game performance and calculates bonus XP.
 */
export function calculateBonusXp(
  score: number,
  correctCount: number,
  totalCount: number,
  secondsRemaining: number
): {
  baseXp: number;
  speedBonusXp: number;
  accuracyBonusXp: number;
  totalBonusXp: number;
} {
  const isPerfect = correctCount === totalCount && totalCount > 0;
  const baseXp = Math.min(40, correctCount * 8);
  const speedBonusXp = Math.min(20, Math.floor(secondsRemaining / 2));
  const accuracyBonusXp = isPerfect ? 15 : correctCount >= 4 ? 10 : 5;
  const totalBonusXp = Math.min(75, baseXp + speedBonusXp + accuracyBonusXp);

  return {
    baseXp,
    speedBonusXp,
    accuracyBonusXp,
    totalBonusXp,
  };
}

/**
 * Applies Daily Challenge reward to user profile, updating streak and progress.
 */
export function recordDailyChallengeWin(
  user: UserProfile,
  score: number,
  bonusXp: number
): {
  updatedUser: UserProfile;
  streakIncremented: boolean;
  isNewHighScore: boolean;
} {
  const todayStr = getLocalDateString();
  const prevHighScore = user.dailyChallengeHighScore || 0;
  const isNewHighScore = score > prevHighScore;
  const newHighScore = Math.max(prevHighScore, score);
  const prevChallengesWon = user.dailyChallengesWonCount || 0;

  // Streak update check
  const streakHistory = new Set(user.streakHistory || []);
  const wasAlreadySecuredToday = streakHistory.has(todayStr) || user.lastActiveDate === todayStr;
  streakHistory.add(todayStr);

  const prevStreak = user.streakDays || 0;
  const nextStreak = wasAlreadySecuredToday ? prevStreak : prevStreak + 1;
  const prevBestStreak = user.bestStreak || prevStreak;
  const nextBestStreak = Math.max(prevBestStreak, nextStreak);

  // Daily XP tracking
  const prevDailyXp = user.dailyXpDate === todayStr ? (user.dailyXpEarnedToday || 0) : 0;
  const newDailyXp = prevDailyXp + bonusXp;

  // Time spent update (+ 2 minutes for mini-game)
  const prevTimeToday = user.dailyTimeSpentTodayMinutes || 0;
  const newTimeToday = prevTimeToday + 2;

  const updatedUser: UserProfile = {
    ...user,
    totalXp: (user.totalXp || 0) + bonusXp,
    dailyXpEarnedToday: newDailyXp,
    dailyXpDate: todayStr,
    dailyTimeSpentTodayMinutes: newTimeToday,
    streakDays: nextStreak,
    bestStreak: nextBestStreak,
    lastActiveDate: todayStr,
    streakHistory: Array.from(streakHistory),
    dailyChallengeCompletedDate: todayStr,
    dailyChallengeHighScore: newHighScore,
    dailyChallengesWonCount: prevChallengesWon + 1,
  };

  return {
    updatedUser,
    streakIncremented: !wasAlreadySecuredToday,
    isNewHighScore,
  };
}

/**
 * Checks if the daily challenge has already been completed today.
 */
export function isDailyChallengeCompletedToday(user: UserProfile): boolean {
  const todayStr = getLocalDateString();
  return user.dailyChallengeCompletedDate === todayStr;
}
