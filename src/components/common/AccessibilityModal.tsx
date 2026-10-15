import React from 'react';
import { X, Eye, Type, Volume2, Sparkles, Check } from 'lucide-react';
import { AccessibilitySettings } from '../../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: AccessibilitySettings) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Eye size={20} />
            </div>
            <div>
              <h2 id="accessibility-modal-title" className="text-lg font-bold text-slate-900">
                Accessibility & Learning Preferences
              </h2>
              <p className="text-xs text-slate-500">WCAG 2.2 AA compliant accommodations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300">
            <div>
              <div className="text-sm font-semibold text-slate-800">High Contrast Mode</div>
              <div className="text-xs text-slate-500">Enhance borders and background contrast for clearer reading</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.highContrast}
              onClick={() => onUpdateSettings({ ...settings, highContrast: !settings.highContrast })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.highContrast ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dyslexia Friendly Font */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300">
            <div>
              <div className="text-sm font-semibold text-slate-800">Dyslexia-Friendly Typography</div>
              <div className="text-xs text-slate-500">Use weighted bottoms and wider character spacing</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.dyslexiaFont}
              onClick={() => onUpdateSettings({ ...settings, dyslexiaFont: !settings.dyslexiaFont })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dyslexiaFont ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dyslexiaFont ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Font Size Scaling */}
          <div className="p-3 rounded-xl border border-slate-200">
            <div className="text-sm font-semibold text-slate-800 mb-1">Text Size Scaling</div>
            <div className="text-xs text-slate-500 mb-3">Scale text across lessons and conversations</div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    settings.fontSize === size
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {size === 'normal' ? 'Standard (100%)' : size === 'large' ? 'Large (115%)' : 'Extra (130%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300">
            <div>
              <div className="text-sm font-semibold text-slate-800">Reduced Motion</div>
              <div className="text-xs text-slate-500">Disable bouncing cards, celebratory particles, and sliding transitions</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.reducedMotion}
              onClick={() => onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.reducedMotion ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Speech Rate */}
          <div className="p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">Speech Audio Speed</span>
              <span className="text-xs font-bold text-emerald-700">{settings.speechRate.toFixed(2)}x</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">Adjust standard lesson voice speed</p>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={settings.speechRate}
              aria-label="Speech Audio Speed Slider"
              onChange={(e) => onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.70x (Slow Enunciation)</span>
              <span>1.0x (Natural)</span>
              <span>1.20x (Fast Native)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
