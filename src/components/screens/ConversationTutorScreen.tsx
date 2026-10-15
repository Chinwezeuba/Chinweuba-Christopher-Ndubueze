import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Settings2,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Globe2,
  Award,
  Zap,
  CreditCard,
} from 'lucide-react';
import { UserProfile, ChatMessage, CorrectionMode, ConversationSessionSummary } from '../../types';
import { AudioButton } from '../common/AudioButton';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { ConversationSummaryModal } from '../common/ConversationSummaryModal';
import { getStoredChatMessages, saveChatMessages, saveCurrentUser } from '../../utils/storage';
import { recordTodayXp } from '../../utils/dailyGoal';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { speakText } from '../../utils/speech';

interface ConversationTutorScreenProps {
  currentUser: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onNavigate?: (screen: string) => void;
}

export const ConversationTutorScreen: React.FC<ConversationTutorScreenProps> = ({
  currentUser,
  onUpdateUser,
  onNavigate,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const scenarios = [
    { id: 'restaurant', name: 'Ordering at a Restaurant', icon: '🍽️', promptStarter: 'Welcome! Are you ready to order?' },
    { id: 'airport', name: 'Airport & Customs Check', icon: '✈️', promptStarter: 'May I see your passport and boarding pass?' },
    { id: 'interview', name: 'Job Interview & Career', icon: '💼', promptStarter: 'Tell me about yourself and your background.' },
    { id: 'doctor', name: 'Medical Clinic & Symptoms', icon: '🩺', promptStarter: 'Hello, how can I help you feel better today?' },
    { id: 'market', name: 'Local Market & Bargaining', icon: '🛍️', promptStarter: 'Fresh fruit today! Looking for anything special?' },
    { id: 'friend', name: 'Casual Banter & Friendship', icon: '☕', promptStarter: 'Hey! What have you been up to recently?' },
  ];

  const [activeScenario, setActiveScenario] = useState(scenarios[0].id);
  const [correctionMode, setCorrectionMode] = useState<CorrectionMode>('friendly');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);

  // AI Session Summary states
  const [summary, setSummary] = useState<ConversationSessionSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessages = messages.filter((m) => m.role === 'user');
  const userTurnsCount = userMessages.length;

  // Load chat messages for the current scenario
  useEffect(() => {
    const stored = getStoredChatMessages(activeScenario);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      // Initialize with friendly AI opening
      const starter = getStarterMessage(activeScenario, currentLang.name);
      setMessages([starter]);
      saveChatMessages(activeScenario, [starter]);
    }
  }, [activeScenario, currentLang.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getStarterMessage = (scenarioId: string, langName: string): ChatMessage => {
    // Multilingual starter templates
    const langOpenings: Record<string, Record<string, { target: string; trans: string; tip: string; followUps: string[] }>> = {
      Indonesian: {
        restaurant: {
          target: 'Halo! Selamat datang di restoran kami. Mau pesan meja untuk berapa orang?',
          trans: 'Hello! Welcome to our restaurant. A table for how many people would you like?',
          tip: 'Use polite phrases like "Permisi" (Excuse me) when calling a server.',
          followUps: ['Meja untuk dua orang, silakan.', 'Bisa lihat buku menu?', 'Apakah ada nasi goreng?'],
        },
        airport: {
          target: 'Selamat siang. Boleh saya lihat paspor dan boarding pass Anda? Mau bepergian ke mana?',
          trans: 'Good afternoon. May I see your passport and boarding pass? Where are you traveling to?',
          tip: 'State your destination clearly, e.g. "Saya mau ke Bali".',
          followUps: ['Ini paspor dan tiket saya.', 'Di mana gerbang keberangkatan?', 'Berapa kilo jatah bagasi?'],
        },
        market: {
          target: 'Selamat pagi! Buah-buahan segar baru datang dari kebun. Mau cari apa hari ini?',
          trans: 'Good morning! Fresh fruits just arrived from the garden. What are you looking for today?',
          tip: 'Ask "Berapa harganya?" (How much is it?) to inquire about price.',
          followUps: ['Berapa harga satu kilo mangga?', 'Bisa kurang sedikit harganya?', 'Saya mau beli dua kilo.'],
        },
        interview: {
          target: 'Selamat pagi. Senang bertemu dengan Anda. Bisa ceritakan sedikit tentang pengalaman kerja Anda?',
          trans: 'Good morning. Nice to meet you. Could you share a little about your work experience?',
          tip: 'Use respectful formal register "Anda" in professional meetings.',
          followUps: ['Saya memiliki pengalaman dalam bidang teknologi.', 'Saya senang bekerja dalam tim.', 'Terima kasih atas kesempatannya.'],
        },
        doctor: {
          target: 'Halo, silakan duduk. Apa keluhan Anda dan sejak kapan merasa tidak enak badan?',
          trans: 'Hello, please sit down. What are your symptoms and since when have you felt unwell?',
          tip: 'Express discomfort with "Saya merasa sakit di..." (I feel pain in...).',
          followUps: ['Kepala saya pusing sejak kemarin.', 'Tenggorokan saya agak sakit.', 'Apakah ada obat pereda demam?'],
        },
        friend: {
          target: 'Hai! Senang banget bisa ketemu kamu lagi! Gimana kabarmu minggu ini?',
          trans: 'Hey! So happy to meet you again! How was your week?',
          tip: 'Informal chats in Indonesia frequently use friendly contractions like "gimana".',
          followUps: ['Kabarku baik banget!', 'Lagi sibuk santai aja nih.', 'Yuk kita ngopi bareng!'],
        },
      },
      'European Portuguese': {
        restaurant: {
          target: 'Olá! Seja muito bem-vindo ao nosso restaurante. Tem reserva ou prefere uma mesa para uma pessoa?',
          trans: 'Hello! Welcome to our restaurant. Do you have a reservation or prefer a table for one?',
          tip: 'In Portugal, "se faz favor" is standard for polite requests.',
          followUps: ['Uma mesa para dois, se faz favor.', 'Pode trazer a ementa?', 'Uma bica e um pastel de nata, por favor.'],
        },
        airport: {
          target: 'Bom dia. O passaporte e o cartão de embarque, com certeza. Para onde viaja hoje?',
          trans: 'Good morning. Passport and boarding pass, certainly. Where are you traveling today?',
          tip: 'Note that boarding pass in Portugal is "cartão de embarque".',
          followUps: ['Aqui tem o meu passaporte.', 'Onde fica a porta de embarque?', 'Posso levar esta mala de mão?'],
        },
        market: {
          target: 'Bom dia! Temos laranjas do Algarve fresquíssimas e peixe do dia. Em que posso ser útil?',
          trans: 'Good morning! We have super fresh Algarve oranges and catch of the day. How can I help?',
          tip: 'Ask "Quanto custa o quilo?" (How much per kilo?) at Portuguese markets.',
          followUps: ['Quanto custa o quilo destas laranjas?', 'Queria meio quilo, se faz favor.', 'Tem peixe fresco de hoje?'],
        },
        interview: {
          target: 'Bom dia. É um gosto conhecê-lo. Fale-me sucintamente sobre o seu percurso profissional.',
          trans: 'Good morning. It is a pleasure to meet you. Tell me briefly about your career path.',
          tip: 'Use formal address "o senhor / a senhora" or direct 3rd person conjugation.',
          followUps: ['Trabalhei em projetos internacionais.', 'Gosto muito de colaborar em equipa.', 'Muito obrigado pela oportunidade.'],
        },
        doctor: {
          target: 'Olá, diga-me. Que sintomas tem sentido e desde quando não se sente bem?',
          trans: 'Hello, tell me. What symptoms have you been feeling and since when do you not feel well?',
          tip: 'Use "Dói-me..." (It hurts me) followed by the body part.',
          followUps: ['Dói-me a garganta desde ontem.', 'Tenho tido um pouco de febre.', 'Preciso de tomar algum medicamento?'],
        },
        friend: {
          target: 'Olá pá! Que bom ver-te! Como correram as coisas durante esta semana?',
          trans: 'Hey friend! Great to see you! How did things go this week?',
          tip: '"Ver-te" uses characteristic Portuguese enclitic hyphenated pronoun.',
          followUps: ['Correu tudo ótimo!', 'Vamos tomar um café?', 'Há quanto tempo não nos víamos!'],
        },
      },
      Hindi: {
        restaurant: {
          target: 'नमस्ते! हमारे भोजनालय में आपका स्वागत है। क्या आपने टेबल आरक्षित की है?',
          trans: 'Namaste! Welcome to our restaurant. Have you reserved a table?',
          tip: 'Use the polite honorific "आप" (Aap) and respectful imperative "दीजिए" (Please give).',
          followUps: ['दो लोगों के लिए टेबल चाहिए।', 'कृपया मेनू कार्ड दिखाइए।', 'यहाँ की क्या ख़ासियत है?'],
        },
        airport: {
          target: 'शुभ प्रभात। कृपया अपना पासपोर्ट और बोर्डिंग पास दिखाइए। आप कहाँ जा रहे हैं?',
          trans: 'Good morning. Please show your passport and boarding pass. Where are you heading?',
          tip: 'Devanagari respectful verbs commonly end in "-इए" (-iye).',
          followUps: ['यह मेरा पासपोर्ट है।', 'विमान प्रस्थान द्वार कहाँ है?', 'क्या उड़ान समय पर है?'],
        },
        market: {
          target: 'नमस्ते जी! आज ताज़े फल और सब्ज़ियाँ आई हैं। आपको क्या चाहिए?',
          trans: 'Namaste! Fresh fruits and vegetables arrived today. What would you like?',
          tip: 'Ask "यह कितने का है?" (How much does this cost?) in markets.',
          followUps: ['यह आम कितने के हैं?', 'थोड़ा कम कर सकते हैं क्या?', 'कृपया एक किलो तौल दीजिए।'],
        },
        interview: {
          target: 'नमस्कार। आपसे मिलकर खुशी हुई। कृपया अपने कार्य अनुभव के बारे में संक्षेप में बताइए।',
          trans: 'Greetings. Nice to meet you. Please share briefly about your work experience.',
          tip: 'Formal business register uses "नमस्कार" (Namaskaar) and "अनुभव" (Anubhav).',
          followUps: ['मुझे इस क्षेत्र में कई वर्षों का अनुभव है।', 'मैं टीम के साथ अच्छा काम करता हूँ।', 'इस अवसर के लिए धन्यवाद।'],
        },
        doctor: {
          target: 'नमस्ते, बैठिए। आपको क्या तकलीफ़ है और आप कब से अस्वस्थ महसूस कर रहे हैं?',
          trans: 'Namaste, please have a seat. What discomfort do you have and since when?',
          tip: 'Use "मुझे सिरदर्द है" (I have a headache) or "बुख़ार है" (I have fever).',
          followUps: ['मुझे कल से बहुत तेज सिरदर्द है।', 'गले में हल्की ख़राश है।', 'क्या मुझे कोई दवा लेनी चाहिए?'],
        },
        friend: {
          target: 'अरे दोस्त! तुमसे मिलकर बहुत अच्छा लगा! तुम्हारा हफ़्ता कैसा रहा?',
          trans: 'Hey friend! So great to meet you! How has your week been?',
          tip: 'Informal chats with peers naturally use "तुम" (Tum) or friendly "अरे".',
          followUps: ['सब कुछ बहुत बढ़िया चल रहा है!', 'चलो साथ में चाय पीते हैं!', 'तुम बताओ, क्या नया है?'],
        },
      },
    };

    const defaultSpanishOpenings: Record<string, { target: string; trans: string; tip: string; followUps: string[] }> = {
      restaurant: {
        target: `¡Hola! Bienvenido a nuestro restaurante. ¿Tiene una reserva o desea una mesa para una persona?`,
        trans: `Hello! Welcome to our restaurant. Do you have a reservation or would you like a table for one?`,
        tip: `Greeting the host with "¡Hola!" or "Buenas tardes" sets a welcoming tone.`,
        followUps: ['Una mesa para dos, por favor.', 'No tengo reserva, ¿tienen sitio libre?', '¿Tienen la carta en inglés o español?'],
      },
      airport: {
        target: `Buenos días. Pasaporte y tarjeta de embarque, por favor. ¿Cuál es el motivo de su viaje?`,
        trans: `Good morning. Passport and boarding pass, please. What is the reason for your travel?`,
        tip: `Keep answers concise (e.g. "Turismo" or "Negocios").`,
        followUps: ['Aquí tiene mi pasaporte.', '¿Dónde está la puerta de embarque?', '¿A qué hora sale el vuelo?'],
      },
      interview: {
        target: `Buenos días. Es un placer conocerle. Cuénteme brevemente sobre su experiencia profesional.`,
        trans: `Good morning. It is a pleasure to meet you. Tell me briefly about your professional experience.`,
        tip: `Use polite formal register "usted" during professional interviews.`,
        followUps: ['He trabajado durante varios años en tecnología.', 'Me encanta trabajar en equipo.', 'Muchas gracias por la oportunidad.'],
      },
      doctor: {
        target: `Hola, dígame. ¿Qué síntomas tiene y desde cuándo se siente mal?`,
        trans: `Hello, tell me. What symptoms do you have and since when have you been feeling unwell?`,
        tip: `Use "Me duele..." (It hurts me) followed by the body part.`,
        followUps: ['Me duele la cabeza desde ayer.', 'Tengo dolor de garganta.', '¿Necesito tomar alguna medicina?'],
      },
      market: {
        target: `¡Buenas! Hoy tenemos fruta de temporada fresquísima. ¿En qué le puedo ayudar?`,
        trans: `Hello! Today we have super fresh seasonal fruit. How can I help you?`,
        tip: `Markets love when you ask "¿A cómo está el kilo?" (How much per kilo?).`,
        followUps: ['¿A cómo está el kilo de naranjas?', 'Deme un kilo, por favor.', '¿Está dulce la fruta?'],
      },
      friend: {
        target: `¡Hola! ¡Qué alegría verte! ¿Qué tal tu semana?`,
        trans: `Hey! So great to see you! How has your week been?`,
        tip: `Friendly conversation uses informal "tú" naturally.`,
        followUps: ['¡Todo muy bien por suerte!', '¿Nos tomamos un café?', '¡Qué ganas tenía de verte!'],
      },
    };

    const langSet = langOpenings[langName] || defaultSpanishOpenings;
    const entry = langSet[scenarioId] || langSet['restaurant'] || defaultSpanishOpenings['restaurant'];

    return {
      id: `msg-${Date.now()}`,
      role: 'tutor',
      content: entry.target,
      translation: entry.trans,
      vocabularyTip: entry.tip,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: entry.followUps,
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsVoiceInputOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          scenario: activeScenario,
          targetLanguage: currentLang.name,
          nativeLanguage: currentUser.nativeLanguage,
          learnerLevel: currentUser.currentCefr,
          ageGroup: currentUser.ageGroup,
          correctionMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          content: data.replyText,
          translation: data.translation,
          correction: data.correction,
          vocabularyTip: data.vocabularyTip,
          suggestedFollowUps: data.suggestedFollowUps,
          culturalNote: data.culturalNote,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const finalMessages = [...updatedMessages, tutorMsg];
        setMessages(finalMessages);
        saveChatMessages(activeScenario, finalMessages);

        // Auto play audio if enabled
        speakText(data.replyText, currentLang.id);
      } else {
        throw new Error('Server returned error');
      }
    } catch {
      const fallbackReply: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: `¡Entendido! Muy bien dicho. ¿Desea algo más en este momento?`,
        translation: `Understood! Very well said. Would you like anything else at this moment?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [`Sí, por favor.`, `No, nada más, gracias.`],
      };
      const finalMessages = [...updatedMessages, fallbackReply];
      setMessages(finalMessages);
      saveChatMessages(activeScenario, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const starter = getStarterMessage(activeScenario, currentLang.name);
    setMessages([starter]);
    saveChatMessages(activeScenario, [starter]);
    setSummary(null);
    setFeedbackAlert(null);
  };

  const handleEndSessionAndSummarize = async () => {
    if (userTurnsCount === 0) {
      setFeedbackAlert(
        'Please send at least 1 message to the tutor before ending the session to receive your personalized AI feedback on grammar, vocabulary, and fluency!'
      );
      setTimeout(() => setFeedbackAlert(null), 5000);
      return;
    }

    setIsGeneratingSummary(true);
    setFeedbackAlert(null);

    try {
      const response = await fetch('/api/tutor-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          scenario: activeScenario,
          targetLanguage: currentLang.name,
          nativeLanguage: currentUser.nativeLanguage,
          learnerLevel: currentUser.currentCefr,
          ageGroup: currentUser.ageGroup,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data: ConversationSessionSummary = await response.json();
      setSummary(data);
      setIsSummaryModalOpen(true);
    } catch (err) {
      console.error('Error fetching tutor summary:', err);
      setFeedbackAlert('Unable to generate AI summary at this moment. Please try again.');
      setTimeout(() => setFeedbackAlert(null), 4000);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleClaimXp = (xp: number) => {
    const { updatedUser } = recordTodayXp(currentUser, xp);
    const finalUser: UserProfile = {
      ...updatedUser,
      roleplayConversationsCount: (updatedUser.roleplayConversationsCount || 0) + 1,
    };
    saveCurrentUser(finalUser);
    if (onUpdateUser) {
      onUpdateUser(finalUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="mx-auto max-w-5xl h-[88vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900">
                    AI Conversation Tutor ({currentLang.name})
                  </h1>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Live Roleplay
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Target CEFR {currentUser.currentCefr} · {currentUser.ageGroup.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Mode & Translation Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Correction Style Selector */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                {(['friendly', 'structured', 'intensive', 'confidence'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCorrectionMode(mode)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                      correctionMode === mode
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Translation Toggle */}
              <button
                type="button"
                onClick={() => setShowTranslations(!showTranslations)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  showTranslations
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {showTranslations ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{showTranslations ? 'Hide Translation' : 'Show Translation'}</span>
              </button>

              {/* End Session & AI Feedback button */}
              <button
                type="button"
                onClick={handleEndSessionAndSummarize}
                disabled={isGeneratingSummary || isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98 disabled:opacity-50 ${
                  userTurnsCount > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="End conversation session and receive AI feedback on grammar, vocabulary, and fluency"
              >
                <Sparkles size={14} className={userTurnsCount > 0 ? 'text-amber-300 animate-pulse' : 'text-emerald-600'} />
                <span>{isGeneratingSummary ? 'Analyzing AI...' : 'End & AI Summary'}</span>
                {userTurnsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    {userTurnsCount} {userTurnsCount === 1 ? 'turn' : 'turns'}
                  </span>
                )}
              </button>

              {summary && !isSummaryModalOpen && (
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  title="View latest AI session summary"
                >
                  <Award size={14} className="text-emerald-700" />
                  <span>View Summary ({summary.overallScore}%)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearHistory}
                title="Restart conversation"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Scenario Selector Chips */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setActiveScenario(sc.id);
                  setSummary(null);
                  setFeedbackAlert(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeScenario === sc.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{sc.icon}</span>
                <span>{sc.name}</span>
              </button>
            ))}
          </div>

          {/* Tier Entitlements Status Bar */}
          <div className="mt-2.5 flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-slate-100/80 text-[11px] text-slate-600">
            {currentUser.subscriptionTier === 'pro' || currentUser.subscriptionTier === 'family' ? (
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Sparkles size={13} className="text-emerald-600" />
                <span>Speak Dolphin Pro: Unlimited AI Conversation Dialogues Active</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span>
                  Free Explorer Plan: <strong className="text-slate-900">{userTurnsCount} of 5 daily turns</strong> used in this session.
                </span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('subscription')}
                    className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <CreditCard size={11} />
                    <span>Upgrade for Unlimited</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Alert Notice */}
          {feedbackAlert && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>{feedbackAlert}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackAlert(null)}
                className="text-amber-700 hover:text-amber-900 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Conversational Milestone Prompt when user has chatted */}
          {userTurnsCount >= 2 && !summary && (
            <div className="mx-auto max-w-xl p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-2 animate-fade-in">
              <div className="flex items-center gap-2.5 text-left">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={17} className="text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Conversational Milestone ({userTurnsCount} turns recorded)
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Ready for Gemini AI analysis on grammar, vocabulary, and fluency?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEndSessionAndSummarize}
                disabled={isGeneratingSummary}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs whitespace-nowrap transition-all active:scale-98 shrink-0 flex items-center gap-1.5"
              >
                <Award size={14} className="text-amber-300" />
                <span>{isGeneratingSummary ? 'Analyzing...' : 'End & Review Feedback'}</span>
              </button>
            </div>
          )}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xl rounded-2xl p-4 shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{msg.content}</p>
                    {!isUser && (
                      <AudioButton text={msg.content} lang={currentLang.id} size="sm" />
                    )}
                  </div>

                  {/* Native translation toggle */}
                  {(showTranslations || isUser) && msg.translation && (
                    <div
                      className={`mt-2 pt-2 text-xs border-t ${
                        isUser
                          ? 'border-emerald-500/60 text-emerald-100'
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      {msg.translation}
                    </div>
                  )}

                  {/* Grammar Correction Note */}
                  {msg.correction && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                        <AlertCircle size={13} />
                        <span>Gentle Coaching:</span>
                      </div>
                      <p>{msg.correction}</p>
                    </div>
                  )}

                  {/* Vocabulary Tip */}
                  {msg.vocabularyTip && (
                    <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                      💡 <strong>Tip:</strong> {msg.vocabularyTip}
                    </div>
                  )}

                  {/* Cultural Note */}
                  {msg.culturalNote && (
                    <div className="mt-1.5 text-[11px] text-purple-800 bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                      🌐 <strong>Etiquette:</strong> {msg.culturalNote}
                    </div>
                  )}

                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Suggested follow-up quick reply chips */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-xl">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 transition-colors shadow-2xs text-left"
                      >
                        💬 {chip}
                      </button>
                    ))}

                    {userTurnsCount >= 1 && (
                      <button
                        type="button"
                        onClick={handleEndSessionAndSummarize}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 transition-colors shadow-2xs text-left flex items-center gap-1"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>🏁 End session & review AI feedback</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-50 rounded-xl max-w-xs">
              <RefreshCw size={14} className="animate-spin text-emerald-600" />
              <span>Tutor is formulating response in {currentLang.name}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Mic Modal */}
        <div className="border-t border-slate-200 p-4 bg-white">
          {isVoiceInputOpen && (
            <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Voice Speech Input</span>
                <button
                  type="button"
                  onClick={() => setIsVoiceInputOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Close
                </button>
              </div>
              <VoiceRecorder
                lang={currentLang.id}
                onTranscriptReady={(transcript) => {
                  handleSendMessage(transcript);
                }}
              />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setIsVoiceInputOpen(!isVoiceInputOpen)}
              className={`p-2.5 rounded-xl border transition-colors shadow-2xs ${
                isVoiceInputOpen
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              aria-label="Toggle speech input"
            >
              <Mic size={18} className="text-emerald-600" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Respond in ${currentLang.name}... (e.g., Quisiera pedir...)`}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Loading overlay while Gemini AI evaluates session */}
      {isGeneratingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-w-sm w-full text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md animate-bounce">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Evaluating Session with AI
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Analyzing your {userTurnsCount} conversational {userTurnsCount === 1 ? 'turn' : 'turns'} in {currentLang.name} across grammar, vocabulary, and fluency...
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse w-4/5" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal with Grammar, Vocabulary, and Fluency Feedback */}
      <ConversationSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={summary}
        scenarioName={scenarios.find((s) => s.id === activeScenario)?.name || 'Roleplay'}
        scenarioIcon={scenarios.find((s) => s.id === activeScenario)?.icon || '💬'}
        targetLanguageName={currentLang.name}
        targetLanguageId={currentLang.id}
        messages={messages}
        onClaimXp={handleClaimXp}
        onRestartScenario={handleClearHistory}
      />
    </div>
  );
};
