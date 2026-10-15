import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { UserProfile, InteractiveStory, StoryScene } from '../../types';
import { INTERACTIVE_STORIES } from '../../data/stories';
import { AudioButton } from '../common/AudioButton';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { speakText } from '../../utils/speech';

interface StoriesScreenProps {
  currentUser: UserProfile;
}

export const StoriesScreen: React.FC<StoriesScreenProps> = ({
  currentUser,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === currentUser.targetLanguage) || SUPPORTED_LANGUAGES[0];

  // Match stories to target language or fallback
  const langStories = INTERACTIVE_STORIES.filter((s) => s.languageId === currentUser.targetLanguage);
  const storiesToUse = langStories.length > 0 ? langStories : INTERACTIVE_STORIES;

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const activeStory: InteractiveStory = storiesToUse[activeStoryIndex] || INTERACTIVE_STORIES[0];

  const [currentSceneId, setCurrentSceneId] = useState<string>(activeStory.startSceneId);
  const [selectedChoiceFeedback, setSelectedChoiceFeedback] = useState<string | null>(null);

  const currentScene: StoryScene | undefined = activeStory.scenes[currentSceneId];

  const handleSelectChoice = (nextId: string, feedback?: string) => {
    if (feedback) {
      setSelectedChoiceFeedback(feedback);
    }
    setCurrentSceneId(nextId);
  };

  const handleRestartStory = () => {
    setCurrentSceneId(activeStory.startSceneId);
    setSelectedChoiceFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Interactive Cultural Stories
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Branching real-world immersion with conversational decisions
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {storiesToUse.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setActiveStoryIndex(idx);
                  setCurrentSceneId(st.startSceneId);
                  setSelectedChoiceFeedback(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeStoryIndex === idx
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{st.thumbnail}</span>
                <span className="truncate max-w-[120px]">{st.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Story Interactive Canvas */}
        {currentScene ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  {currentScene.title}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-semibold">{currentScene.speaker}</span>
              </div>
              <button
                type="button"
                onClick={handleRestartStory}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>
            </div>

            {/* Character Dialogue Box */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    "{currentScene.dialogue}"
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{currentScene.translation}</div>
                </div>
                <AudioButton text={currentScene.dialogue} lang={activeStory.languageId} size="md" />
              </div>

              {currentScene.culturalNote && (
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-purple-900 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  🌐 <strong>Cultural Etiquette:</strong> {currentScene.culturalNote}
                </div>
              )}
            </div>

            {/* Immediate Choice Feedback */}
            {selectedChoiceFeedback && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{selectedChoiceFeedback}</span>
              </div>
            )}

            {/* Branching Choices */}
            {currentScene.choices.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  What will you say next?
                </div>
                {currentScene.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectChoice(choice.nextSceneId, choice.feedback)}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-900">
                        "{choice.targetPhrase}"
                      </div>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{choice.text}</div>
                  </button>
                ))}
              </div>
            ) : (
              /* Story Ending */
              <div className="text-center pt-6 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
                  <Award size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Story Adventure Completed!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  You successfully communicated through authentic cultural dialogue and made polite real-world choices.
                </p>
                <button
                  type="button"
                  onClick={handleRestartStory}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Experience Again with Alternate Choices</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
