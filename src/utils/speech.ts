// Web Speech API and Gemini TTS client utility

export interface SpeakOptions {
  slow?: boolean;
  rate?: number;
  pitch?: number;
  preferGeminiTts?: boolean;
}

// BCP47 language code resolution
export function getLanguageCode(langIdOrName: string): string {
  const map: Record<string, string> = {
    es: 'es-ES',
    Spanish: 'es-ES',
    fr: 'fr-FR',
    French: 'fr-FR',
    ja: 'ja-JP',
    Japanese: 'ja-JP',
    de: 'de-DE',
    German: 'de-DE',
    zh: 'zh-CN',
    Mandarin: 'zh-CN',
    pt: 'pt-BR',
    Portuguese: 'pt-BR',
    it: 'it-IT',
    Italian: 'it-IT',
    ar: 'ar-SA',
    Arabic: 'ar-SA',
    ig: 'ig-NG',
    Igbo: 'ig-NG',
    sw: 'sw-KE',
    Swahili: 'sw-KE',
    ha: 'ha-NG',
    Hausa: 'ha-NG',
    ln: 'ln-CD',
    Lingala: 'ln-CD',
    id: 'id-ID',
    Indonesian: 'id-ID',
    'pt-PT': 'pt-PT',
    'European Portuguese': 'pt-PT',
    hi: 'hi-IN',
    Hindi: 'hi-IN',
    en: 'en-US',
    English: 'en-US',
  };
  return map[langIdOrName] || 'en-US';
}

/**
 * Plays audio using server-side Gemini TTS if available,
 * or native browser SpeechSynthesis as instant reliable fallback.
 */
export async function speakText(
  text: string,
  lang: string = 'es',
  options: SpeakOptions = {}
): Promise<void> {
  const langCode = getLanguageCode(lang);
  const isSlow = options.slow || false;
  const targetRate = options.rate || (isSlow ? 0.75 : 1.0);

  // Try server-side Gemini TTS if requested and not on slow mode
  if (options.preferGeminiTts && !isSlow) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audioData && !data.fallbackToBrowserSpeech) {
          const audio = new Audio(data.audioData);
          await audio.play();
          return;
        }
      }
    } catch {
      // Fallback silently to browser speech synthesis
    }
  }

  // Native Web Speech Synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = targetRate;
      utterance.pitch = options.pitch || 1.0;

      // Select voice matching language if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.startsWith(langCode.slice(0, 2))
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
}

/**
 * Speech Recognition interface for browsers supporting webkitSpeechRecognition or SpeechRecognition
 */
export interface SpeechRecognitionResultPayload {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

// Minimal type shim for Web Speech API recognition
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

export function createSpeechRecognizer(
  lang: string,
  onResult: (result: SpeechRecognitionResultPayload) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
): { start: () => void; stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };

  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  try {
    const recognizer = new SpeechRecognitionClass();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = getLanguageCode(lang);

    recognizer.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: Array<{
          0: { transcript: string; confidence: number };
          isFinal: boolean;
        }>;
      };

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const item = e.results[i];
        if (item && item[0]) {
          onResult({
            transcript: item[0].transcript,
            confidence: item[0].confidence || 0.85,
            isFinal: item.isFinal,
          });
        }
      }
    };

    recognizer.onerror = (event: unknown) => {
      const e = event as { error?: string };
      if (onError) onError(e.error || 'Recognition error');
    };

    recognizer.onend = () => {
      if (onEnd) onEnd();
    };

    return {
      start: () => {
        try {
          recognizer.start();
        } catch {
          // May throw if already active
        }
      },
      stop: () => {
        try {
          recognizer.stop();
        } catch {
          // Ignore
        }
      },
    };
  } catch (err) {
    if (onError) onError(String(err));
    return null;
  }
}

/**
 * Phonetic & word similarity comparison
 */
export function calculateTextMatch(
  spoken: string,
  target: string
): {
  score: number;
  matchedWords: string[];
  missingWords: string[];
} {
  const cleanSpoken = spoken.toLowerCase().replace(/[.,!?;:¿¡]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[.,!?;:¿¡]/g, '').trim();

  const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);
  const targetTokens = cleanTarget.split(/\s+/).filter(Boolean);

  if (targetTokens.length === 0) return { score: 100, matchedWords: [], missingWords: [] };

  const matchedWords: string[] = [];
  const missingWords: string[] = [];

  for (const word of targetTokens) {
    if (spokenTokens.includes(word)) {
      matchedWords.push(word);
    } else {
      missingWords.push(word);
    }
  }

  const score = Math.min(100, Math.round((matchedWords.length / targetTokens.length) * 100));

  return {
    score,
    matchedWords,
    missingWords,
  };
}
