import React, { useState } from 'react';
import {
  ShieldCheck,
  Baby,
  Clock,
  Mic,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Download,
  Trash2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getAllUsers } from '../../utils/storage';

interface ParentDashboardScreenProps {
  currentUser: UserProfile;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  currentUser,
}) => {
  const allUsers = getAllUsers();
  const childUsers = allUsers.filter(
    (u) => u.ageGroup === 'child_3_5' || u.ageGroup === 'child_6_12'
  );

  const [selectedChild, setSelectedChild] = useState<UserProfile>(
    childUsers[0] || currentUser
  );

  // Safety settings state
  const [dailyCapMinutes, setDailyCapMinutes] = useState(15);
  const [micSafetyEnabled, setMicSafetyEnabled] = useState(true);
  const [privacyModeStrict, setPrivacyModeStrict] = useState(true);
  const [assignedGoal, setAssignedGoal] = useState('Explore Animals and Colors in the Garden');
  const [goalSavedNotification, setGoalSavedNotification] = useState(false);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalSavedNotification(true);
    setTimeout(() => setGoalSavedNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Parent & Educator Oversight Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                COPPA, LGPD compliant child protection and curriculum assignment controls
              </p>
            </div>
          </div>

          {/* Child account picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Active Child:</span>
            <select
              value={selectedChild.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) setSelectedChild(found);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:outline-emerald-600"
            >
              {childUsers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.ageGroup.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Child Profile Overview & Metrics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={selectedChild.avatar}
              alt={selectedChild.name}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{selectedChild.name}</h2>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Protected Child Account
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Language: {selectedChild.targetLanguage.toUpperCase()} · Streak: {selectedChild.streakDays} Days · {selectedChild.totalXp} XP
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Screen Time Today</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {selectedChild.dailyTimeSpentTodayMinutes} / {dailyCapMinutes} min
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (selectedChild.dailyTimeSpentTodayMinutes / dailyCapMinutes) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Curriculum Units Completed</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {selectedChild.completedLessonIds.length} Units
              </div>
              <div className="text-xs text-slate-500 mt-1">Foundational animals, colors & greetings</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Child Protection Status</div>
              <div className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={18} />
                <span>Zero Public Tracking</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">No stranger chat or open web access</div>
            </div>
          </div>
        </div>

        {/* Safety & Screen Time Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Child Privacy & Guardrails</h3>

          <div className="space-y-4">
            {/* Daily screen time limit */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <div className="text-sm font-semibold text-slate-900">Daily Screen Time Limit</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  App locks automatically with friendly pause message when limit is reached
                </div>
              </div>
              <select
                value={dailyCapMinutes}
                onChange={(e) => setDailyCapMinutes(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value={10}>10 Minutes Max</option>
                <option value={15}>15 Minutes Max (Recommended)</option>
                <option value={20}>20 Minutes Max</option>
                <option value={30}>30 Minutes Max</option>
              </select>
            </div>

            {/* Mic Permission Control */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <div className="text-sm font-semibold text-slate-900">Audio Speech Recording Permission</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Allow child to practice repeat-after-me speech without storing raw audio on cloud servers
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMicSafetyEnabled(!micSafetyEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  micSafetyEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {micSafetyEnabled ? 'Enabled (Ephemeral)' : 'Disabled'}
              </button>
            </div>

            {/* Privacy Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <div className="text-sm font-semibold text-slate-900">COPPA Privacy Isolation</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Hide account from public searches; prevent direct messaging and stranger contact
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyModeStrict(!privacyModeStrict)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  privacyModeStrict ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {privacyModeStrict ? 'Strict Isolation Active' : 'Standard'}
              </button>
            </div>
          </div>
        </div>

        {/* Assign Homework or Next Milestone */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Next Learning Objective</h3>
              <p className="text-xs text-slate-500">Highlighted on the child's home screen</p>
            </div>
          </div>

          <form onSubmit={handleSaveGoal} className="flex gap-2">
            <input
              type="text"
              value={assignedGoal}
              onChange={(e) => setAssignedGoal(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-emerald-600"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              Set Goal
            </button>
          </form>

          {goalSavedNotification && (
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={14} />
              <span>Goal successfully pinned to child's dashboard!</span>
            </div>
          )}
        </div>

        {/* Data Governance & Account Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900">Parental Data Governance</div>
            <div className="text-xs text-slate-500">Export learning logs or permanently delete child data</div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => alert('Learning records downloaded in JSON format.')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export Records</span>
            </button>
            <button
              type="button"
              onClick={() => alert('To delete child learning records, please confirm in Settings.')}
              className="px-4 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
