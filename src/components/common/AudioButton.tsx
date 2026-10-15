import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface AudioButtonProps {
  text: string;
  lang?: string;
  isSlow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  lang = 'es',
  isSlow = false,
  size = 'md',
  className = '',
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakText(text, lang, { slow: isSlow, preferGeminiTts: true });
    } catch (err) {
      console.warn('Audio playback error', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isPlaying}
      aria-label={`Listen to "${text}"${isSlow ? ' slowly' : ''}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-75 ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <Loader2 size={iconSizes[size]} className="animate-spin text-emerald-600" />
      ) : (
        <Volume2 size={iconSizes[size]} className={isSlow ? 'text-amber-600' : 'text-emerald-600'} />
      )}
      {label && <span>{label}</span>}
      {isSlow && <span className="text-[10px] text-amber-700 font-semibold tracking-wider uppercase">0.75x</span>}
    </button>
  );
};
