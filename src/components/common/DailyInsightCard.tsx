import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  BookmarkPlus,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { DailyInsight } from '../../types';
import { speakText } from '../../utils/speech';
import { getStoredSrsItems, saveSrsItems } from '../../utils/srs';

interface DailyInsightCardProps {
  languageId: string;
  onOpenPipelines?: () => void;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({
  languageId,
  onOpenPipelines,
}) => {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedToSrs, setAddedToSrs] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchInsight = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      const res = await fetch(`/api/daily-insights/${languageId}`);
      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      }
    } catch (e) {
      console.warn('Failed to load daily insight:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [languageId]);

  if (loading || !insight) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded-sm mb-3"></div>
        <div className="h-6 w-3/4 bg-slate-200 rounded-sm mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  const handlePlayWord = () => {
    speakText(insight.wordOfTheDay.term, languageId, { slow: false });
  };

  const handleAddToSrs = () => {
    try {
      const existing = getStoredSrsItems(languageId);
      const alreadyInDeck = existing.some((i) => i.term.toLowerCase() === insight.wordOfTheDay.term.toLowerCase());
      if (!alreadyInDeck) {
        const newCard = {
          id: `srs_daily_${Date.now()}`,
          languageId,
          term: insight.wordOfTheDay.term,
          translation: insight.wordOfTheDay.translation,
          phonetic: insight.wordOfTheDay.phonetic,
          partOfSpeech: insight.wordOfTheDay.partOfSpeech,
          exampleSentence: insight.wordOfTheDay.exampleTarget,
          exampleTranslation: insight.wordOfTheDay.exampleNative,
          audioText: insight.wordOfTheDay.term,
          culturalNote: insight.culturalFact.body,
          intervalDays: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
          history: [],
        };
        saveSrsItems([newCard, ...existing]);
      }
      setAddedToSrs(true);
      setTimeout(() => setAddedToSrs(false), 3000);
    } catch (e) {
      console.error('Failed to add daily word to SRS', e);
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />

      {/* Header with Verification & Source Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Verified Daily Linguistic Digest
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-sm">
                Source: {insight.sourceAttribution.organization}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fetchInsight(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors shadow-2xs"
            title="Refresh verified language insight pipeline"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onOpenPipelines && (
            <button
              type="button"
              onClick={onOpenPipelines}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              Pipeline Status
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Word of the Day */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {insight.wordOfTheDay.term}
                </h3>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {insight.wordOfTheDay.phonetic}
                </span>
                <span className="text-xs italic text-slate-500">
                  ({insight.wordOfTheDay.partOfSpeech})
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                "{insight.wordOfTheDay.translation}"
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePlayWord}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
                title="Listen to native pronunciation"
                aria-label="Listen to pronunciation"
              >
                <Volume2 size={17} />
              </button>
              <button
                type="button"
                onClick={handleAddToSrs}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  addedToSrs
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="Add to Spaced Repetition memory deck"
              >
                {addedToSrs ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>In Deck</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={15} className="text-slate-600" />
                    <span className="hidden sm:inline">Save to SRS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example in context */}
          <div className="rounded-2xl bg-white/90 border border-emerald-100/80 p-3 text-xs space-y-1">
            <div className="font-medium text-slate-900">
              {insight.wordOfTheDay.exampleTarget}
            </div>
            <div className="text-slate-500">
              {insight.wordOfTheDay.exampleNative}
            </div>
          </div>

          {/* Etymology / Nuance */}
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 font-semibold">Linguistic Nuance: </strong>
            {insight.wordOfTheDay.etymology}
          </p>
        </div>

        {/* Right: Cultural Insight & Idiom */}
        <div className="lg:col-span-5 rounded-2xl bg-emerald-950/5 border border-emerald-100/60 p-4 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <BookOpen size={14} className="text-emerald-700" />
              <span>{insight.culturalFact.title}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {insight.culturalFact.body}
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-100/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Idiom Spotlight: <span className="font-semibold text-slate-900">{insight.idiomSpotlight.idiom}</span>
            </div>
            <div className="text-xs text-slate-700 mt-0.5">
              <span className="font-semibold">{insight.idiomSpotlight.meaning}</span>
              <span className="text-slate-500 text-[11px] block mt-0.5">{insight.idiomSpotlight.usageNote}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Freshness Badge Footer */}
      <div className="mt-4 pt-2.5 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Self-updating verified fact pipeline
        </span>
        <span>
          Refreshed: {new Date(insight.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
