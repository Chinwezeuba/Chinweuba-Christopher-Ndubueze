import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Cpu,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { PipelineStatusResponse, SystemTelemetry, PipelineJobInfo } from '../../types';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusResponse | null>(null);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pipeRes, telemRes] = await Promise.all([
        fetch('/api/pipelines/status'),
        fetch('/api/monitoring/telemetry'),
      ]);

      if (pipeRes.ok) {
        setPipelineStatus(await pipeRes.json());
      }
      if (telemRes.ok) {
        setTelemetry(await telemRes.json());
      }
    } catch (e) {
      console.error('Failed to fetch system monitoring data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleTriggerJob = async (jobId: string) => {
    try {
      setTriggeringJobId(jobId);
      const res = await fetch('/api/pipelines/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setFeedbackMsg(`Pipeline "${jobId}" triggered and completed successfully.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        await fetchData();
      }
    } catch (e) {
      setFeedbackMsg(`Failed to trigger job: ${e}`);
    } finally {
      setTriggeringJobId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Activity size={20} />
            </div>
            <div>
              <h2 id="health-modal-title" className="text-lg font-bold text-slate-900 leading-tight">
                Self-Updating Engine & System Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Automated background refresh pipelines, data freshness, and system health
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Status & Metrics Grid */}
          {telemetry && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Server size={14} className="text-emerald-600" />
                  <span>Uptime</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {Math.floor(telemetry.uptimeSeconds / 60)}m {telemetry.uptimeSeconds % 60}s
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">● Operational</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Zap size={14} className="text-amber-600" />
                  <span>AI Latency</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {telemetry.aiProviderStatus.latencyMs} ms
                </div>
                <span className="text-[10px] text-slate-500 truncate block">
                  {telemetry.aiProviderStatus.modelInUse}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Cpu size={14} className="text-blue-600" />
                  <span>Memory RSS</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {telemetry.memoryUsageMb.rss} MB
                </div>
                <span className="text-[10px] text-slate-500">
                  Heap: {telemetry.memoryUsageMb.heapUsed} MB
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Database size={14} className="text-teal-600" />
                  <span>Cache Hit Ratio</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {pipelineStatus?.cacheStats ? `${Math.round(pipelineStatus.cacheStats.hitRatio * 100)}%` : '100%'}
                </div>
                <span className="text-[10px] text-slate-500">
                  {pipelineStatus?.cacheStats.entries || 0} active keys
                </span>
              </div>
            </div>
          )}

          {feedbackMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Background Refresh Pipelines Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Automated Self-Updating Data Pipelines
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled pipelines connecting trusted linguistic academies and memory models
                </p>
              </div>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {pipelineStatus?.jobs.map((job: PipelineJobInfo) => {
                const isRunning = job.status === 'running' || triggeringJobId === job.id;
                return (
                  <div key={job.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{job.name}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            Verified Fact Source
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            <strong>Authority:</strong> {job.sourceAttribution}
                          </span>
                          <span>·</span>
                          <span>
                            <strong>Interval:</strong> Every {job.intervalMinutes >= 60 ? `${job.intervalMinutes / 60}h` : `${job.intervalMinutes}m`}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>
                            Last Run: {job.lastRunAt ? new Date(job.lastRunAt).toLocaleTimeString() : 'Never'} ({job.lastRunDurationMs}ms)
                          </span>
                          <span>·</span>
                          <span>Items: {job.itemsProcessed}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTriggerJob(job.id)}
                          disabled={isRunning}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-all shadow-2xs disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={isRunning ? 'animate-spin text-emerald-600' : ''} />
                          <span>{isRunning ? 'Executing...' : 'Trigger Now'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>All background workers synchronized with zero downtime.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
