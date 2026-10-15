import React from 'react';
import { Globe, Smartphone, Monitor, Check } from 'lucide-react';

export type AppVariant = 'website' | 'mobile' | 'webapp';

interface VariantSwitcherProps {
  currentVariant: AppVariant;
  onVariantChange: (variant: AppVariant) => void;
  mobileFrameMode?: boolean;
  onToggleMobileFrame?: () => void;
}

export const VariantSwitcher: React.FC<VariantSwitcherProps> = ({
  currentVariant,
  onVariantChange,
  mobileFrameMode = true,
  onToggleMobileFrame,
}) => {
  return (
    <aside
      aria-label="App Variant Selector"
      className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: App Logo & Current Mode Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="text-base">🐬</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-tight">Speak Dolphin</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-medium">3-in-1 Platform Variants</span>
          </div>
        </div>

        {/* Center: Variant Buttons */}
        <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => onVariantChange('website')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentVariant === 'website'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Marketing, curriculum showcase, pricing, and self-guided trial"
          >
            <Globe size={14} />
            <span>1. Website</span>
          </button>

          <button
            type="button"
            onClick={() => onVariantChange('mobile')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentVariant === 'mobile'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="iOS & Android mobile native ergonomics with bottom bar and phone frame"
          >
            <Smartphone size={14} />
            <span>2. Mobile App</span>
          </button>

          <button
            type="button"
            onClick={() => onVariantChange('webapp')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentVariant === 'webapp'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Full desktop studio, persistent sidebar, PWA installation, and deep learning analytics"
          >
            <Monitor size={14} />
            <span>3. Web App</span>
          </button>
        </div>

        {/* Right: Auxiliary Controls */}
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          {currentVariant === 'mobile' && onToggleMobileFrame && (
            <button
              type="button"
              onClick={onToggleMobileFrame}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>{mobileFrameMode ? 'Device Frame Mode' : 'Responsive Full View'}</span>
            </button>
          )}

          <span className="hidden md:inline text-slate-400">
            {currentVariant === 'website' && 'Public Website & Landing'}
            {currentVariant === 'mobile' && 'Native Mobile Phone UI (iOS/Android)'}
            {currentVariant === 'webapp' && 'Desktop SaaS & PWA Learning Studio'}
          </span>
        </div>
      </div>
    </aside>
  );
};
