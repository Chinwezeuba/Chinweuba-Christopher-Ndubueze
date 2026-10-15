import React, { useState } from 'react';
import {
  Sliders,
  Database,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  Globe,
  FileDown,
} from 'lucide-react';
import { CURRICULUM_LESSONS } from '../../data/curriculum';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { UserProfile } from '../../types';

interface AdminScreenProps {
  currentUser: UserProfile;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'prompt_harness' | 'languages'>('curriculum');
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  // Test prompt harness state
  const [testPrompt, setTestPrompt] = useState('How do I order vegetarian paella in Valencia politely?');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestTutor = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testPrompt }],
          scenario: 'restaurant',
          targetLanguage: 'Spanish',
          nativeLanguage: 'English',
          learnerLevel: 'A2',
          ageGroup: 'adult_18_plus',
          correctionMode: 'friendly',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResponse(JSON.stringify(data, null, 2));
      } else {
        setTestResponse('Error connecting to tutor endpoint.');
      }
    } catch (e) {
      setTestResponse(String(e));
    } finally {
      setIsTesting(false);
    }
  };

  const filteredLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === selectedLanguage);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Curriculum CMS & Administration Harness
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-based content management, linguistic verification & prompt testing
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'curriculum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Curriculum Units
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prompt_harness')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'prompt_harness' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              AI Prompt Harness
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('languages')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'languages' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Linguistic Rules
            </button>
          </div>

          <a
            href="/speak-dolphin-prompts-compilation.pdf"
            download="speak-dolphin-prompts-compilation.pdf"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
            title="Download merged PDF of all prompts used to build Speak Dolphin"
          >
            <FileDown size={14} />
            <span>Export Prompts PDF</span>
          </a>
        </div>

        {/* TAB 1: CURRICULUM UNITS */}
        {activeTab === 'curriculum' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Published Curriculum Units</h2>
                <p className="text-xs text-slate-500">Structured lessons with grammar rules and exercise sequences</p>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                          {lesson.level}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{lesson.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{lesson.description}</p>
                    </div>

                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {lesson.exercises.length} Exercises
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap gap-4">
                    <span>
                      <strong>Grammar:</strong> {lesson.grammarFocus.ruleTitle}
                    </span>
                    <span>
                      <strong>Vocabulary:</strong> {lesson.newInputVocab.length} items
                    </span>
                    <span>
                      <strong>Age Suitability:</strong> {lesson.ageSuitability.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI PROMPT HARNESS */}
        {activeTab === 'prompt_harness' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Tutor Prompt Test Harness</h2>
              <p className="text-xs text-slate-500">
                Execute test prompts against the server-side Gemini tutor adapter and examine JSON schema responses.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Test Input Prompt:</label>
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-emerald-600"
              />
              <button
                type="button"
                onClick={handleTestTutor}
                disabled={isTesting}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Terminal size={14} />}
                <span>Execute Prompt</span>
              </button>
            </div>

            {testResponse && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96">
                <pre>{testResponse}</pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINGUISTIC RULES INSPECTOR */}
        {activeTab === 'languages' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Language Intelligence Architecture</h2>
              <p className="text-xs text-slate-500">Configured linguistic quirks, phonology, and grammar invariants</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div key={lang.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{lang.name}</div>
                      <div className="text-xs text-slate-400">{lang.family} family · {lang.bcp47}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                    {lang.uniqueFeatures.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
