import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported, calculateTextMatch, speakText } from '../../utils/speech';

interface VoiceRecorderProps {
  targetPhrase?: string;
  lang?: string;
  onTranscriptReady?: (transcript: string) => void;
  onEvaluationComplete?: (result: {
    intelligibilityScore: number;
    accuracyScore: number;
    feedback: string;
    phoneticTips: string[];
  }) => void;
  className?: string;
  allowManualInputFallback?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  targetPhrase = '',
  lang = 'es',
  onTranscriptReady,
  onEvaluationComplete,
  className = '',
  allowManualInputFallback = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    intelligibilityScore: number;
    accuracyScore: number;
    feedback: string;
    phoneticTips: string[];
  } | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const recognizerRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    setRecordingError(null);
    setEvaluation(null);
    setTranscript('');

    if (!isSupported) {
      setRecordingError('Microphone speech recognition is not supported in this browser. You can type your spoken sentence below!');
      return;
    }

    const recognizer = createSpeechRecognizer(
      lang,
      (payload) => {
        setTranscript(payload.transcript);
        if (payload.isFinal) {
          setIsRecording(false);
          handleEvaluate(payload.transcript);
        }
      },
      (err) => {
        console.warn('Speech recognition warning:', err);
        setIsRecording(false);
        setRecordingError('Could not capture audio clearly. Please try again or type below.');
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
    if (transcript) {
      handleEvaluate(transcript);
    }
  };

  const handleEvaluate = async (textToEval: string) => {
    if (!textToEval) return;
    if (onTranscriptReady) onTranscriptReady(textToEval);

    setIsEvaluating(true);
    try {
      if (targetPhrase) {
        const response = await fetch('/api/speech-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spokenText: textToEval,
            targetText: targetPhrase,
            targetLanguage: lang,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluation(data);
          if (onEvaluationComplete) onEvaluationComplete(data);
        } else {
          // Local fallback
          const match = calculateTextMatch(textToEval, targetPhrase);
          const fallbackData = {
            intelligibilityScore: match.score,
            accuracyScore: match.score,
            feedback: match.score >= 75 ? 'Clear and intelligible delivery!' : 'Keep practicing the target vowels and cadence.',
            phoneticTips: ['Focus on pure vowel sounds', 'Ensure steady breathing pace'],
          };
          setEvaluation(fallbackData);
          if (onEvaluationComplete) onEvaluationComplete(fallbackData);
        }
      }
    } catch {
      const match = calculateTextMatch(textToEval, targetPhrase);
      const fallbackData = {
        intelligibilityScore: match.score,
        accuracyScore: match.score,
        feedback: 'Good practice attempt! Keep working on rhythm.',
        phoneticTips: ['Clear diction on accented syllables'],
      };
      setEvaluation(fallbackData);
      if (onEvaluationComplete) onEvaluationComplete(fallbackData);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      setTranscript(manualText.trim());
      handleEvaluate(manualText.trim());
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all shadow-md focus-visible:outline-2 focus-visible:outline-emerald-600 ${
              isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            {isRecording && (
              <span className="absolute -inset-1.5 rounded-full border-2 border-red-400 animate-ping opacity-75" />
            )}
          </button>

          <div>
            <div className="text-sm font-semibold text-slate-800">
              {isRecording ? 'Listening... Speak clearly now' : 'Voice Practice'}
            </div>
            <div className="text-xs text-slate-500">
              {isRecording
                ? 'Click mic again when finished speaking'
                : isSupported
                ? 'Tap mic to record your pronunciation'
                : 'Speech mic unavailable; use text below'}
            </div>
          </div>
        </div>

        {/* Live waveform simulation */}
        {isRecording && (
          <div className="flex items-center gap-1 h-8 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
            {[40, 75, 55, 90, 60, 30, 80, 50].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-500 rounded-full animate-bounce"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        )}

        {targetPhrase && (
          <button
            type="button"
            onClick={() => speakText(targetPhrase, lang, { slow: true })}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-md border border-slate-200 hover:border-emerald-200 bg-slate-50 transition-colors"
          >
            <Volume2 size={14} className="text-emerald-600" />
            <span>Hear Model (Slow)</span>
          </button>
        )}
      </div>

      {recordingError && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{recordingError}</span>
        </div>
      )}

      {/* Captured transcript */}
      {transcript && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Captured Speech:</div>
          <div className="text-sm text-slate-800 font-medium mt-0.5">"{transcript}"</div>
        </div>
      )}

      {/* Evaluation Results */}
      {isEvaluating ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
          <RefreshCw size={14} className="animate-spin text-emerald-600" />
          <span>Analyzing pronunciation intelligibility and acoustic clarity...</span>
        </div>
      ) : evaluation ? (
        <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Intelligibility: {evaluation.intelligibilityScore}%</span>
            </div>
            <span className="text-[11px] text-emerald-700">Accuracy: {evaluation.accuracyScore}%</span>
          </div>
          <p className="text-xs text-emerald-950 mt-1.5 leading-relaxed">{evaluation.feedback}</p>
          {evaluation.phoneticTips && evaluation.phoneticTips.length > 0 && (
            <div className="mt-2 text-[11px] text-emerald-800 space-y-0.5">
              <span className="font-semibold">Coaching Tip: </span>
              {evaluation.phoneticTips.map((tip, idx) => (
                <span key={idx} className="block">· {tip}</span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Manual text alternative if mic unsupported or user chooses */}
      {allowManualInputFallback && !isRecording && (
        <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Or type sentence to test accuracy..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
          />
          <button
            type="submit"
            className="text-xs px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
          >
            Check
          </button>
        </form>
      )}
    </div>
  );
};
