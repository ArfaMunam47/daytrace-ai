import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Shield,
  HelpCircle,
  Play,
  BrainCircuit,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  playTimerStartChime,
  playWarningChime,
  playSessionCompleteChime,
  playTaskCompleteChime,
} from '../../utils/sound';
import { PhilosophyModal } from '../PhilosophyModal';

interface SettingsViewProps {
  onGoBack?: () => void;
  previousTabLabel?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onGoBack, previousTabLabel = 'Dashboard' }) => {
  const {
    profile,
    updateProfile,
    soundEnabled,
    setSoundEnabled,
    resetToSampleData,
    clearAllUserData,
    exportBackupJSON,
    importBackupJSON,
    authFetch,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [occupation, setOccupation] = useState(profile.occupation);
  const [capacityHours, setCapacityHours] = useState(profile.dailyCapacityHours);
  const [goalsSummary, setGoalsSummary] = useState(profile.mainGoalsSummary);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);

  // AI Telemetry State
  const [telemetry, setTelemetry] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const fetchTelemetry = async () => {
    setTelemetryLoading(true);
    try {
      const res = await authFetch('/api/ai/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.warn('Failed to load AI telemetry', e);
    } finally {
      setTelemetryLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name || 'User',
      occupation: occupation.trim() || 'Professional / Builder',
      dailyCapacityHours: Number(capacityHours) || 4.5,
      mainGoalsSummary: goalsSummary.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Invalid JSON backup file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 text-xs">
      {/* Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-3">
        <div className="flex items-center gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              type="button"
              className="clay-btn-secondary px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer min-h-[38px] shrink-0"
              title={`Return to ${previousTabLabel}`}
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                Settings & Preferences
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Configure your profile, realistic work capacity, sound feedback, and data backups.
            </p>
          </div>
        </div>

        {onGoBack && (
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline-block">
            From: {previousTabLabel}
          </span>
        )}
      </div>

      {/* User Profile Form */}
      <div className="p-5 sm:p-6 clay-card space-y-4">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          Personal Profile & Workload Capacity
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs min-h-[38px]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Occupation / Role</label>
              <input
                type="text"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs min-h-[38px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Target Daily Deep Work Capacity (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                required
                value={capacityHours}
                onChange={(e) => setCapacityHours(Number(e.target.value))}
                className="clay-input w-full px-3.5 py-2.5 text-white focus:outline-none text-xs min-h-[38px]"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block font-medium">
                Realistic average: 3.5h – 5h of uninterrupted high-cognitive focus per day.
              </span>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Primary Ambition / Focus Area</label>
              <input
                type="text"
                value={goalsSummary}
                onChange={(e) => setGoalsSummary(e.target.value)}
                className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs min-h-[38px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {savedSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                Profile updated!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="clay-btn-primary px-5 py-2.5 font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Audio Chimes Preferences */}
      <div className="p-5 sm:p-6 clay-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Harmonic Audio Feedback
            </h2>
            <p className="text-zinc-400 text-xs mt-0.5 font-medium">
              Built with Web Audio API synthesizers for mindful session cues without external assets.
            </p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              soundEnabled
                ? 'clay-btn-primary'
                : 'clay-btn-secondary text-zinc-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chimes Active' : 'Muted'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={playTimerStartChime}
            className="p-2.5 clay-card-sm text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer font-medium hover:text-white transition"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>Test Start Chime</span>
          </button>
          <button
            onClick={playWarningChime}
            className="p-2.5 clay-card-sm text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer font-medium hover:text-white transition"
          >
            <Play className="w-3 h-3 text-amber-400 fill-current" />
            <span>Test 5m Warning</span>
          </button>
          <button
            onClick={playSessionCompleteChime}
            className="p-2.5 clay-card-sm text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer font-medium hover:text-white transition"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>Test Session End</span>
          </button>
          <button
            onClick={playTaskCompleteChime}
            className="p-2.5 clay-card-sm text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer font-medium hover:text-white transition"
          >
            <Play className="w-3 h-3 text-blue-400 fill-current" />
            <span>Test Task Done</span>
          </button>
        </div>
      </div>

      {/* AI Router & Quota Resilience Telemetry */}
      <div className="p-5 sm:p-6 clay-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm uppercase tracking-wider">
              AI Quota Resilience & Model Router
            </h2>
          </div>
          <button
            onClick={fetchTelemetry}
            disabled={telemetryLoading}
            className="clay-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${telemetryLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed font-medium">
          DayTrace utilizes a production multi-model failover chain with rate-limit cooldowns, structured JSON schema repair, and in-flight request deduplication to ensure uninterrupted AI mentoring.
        </p>

        {telemetry && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 clay-card-sm">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">API Key Configured</div>
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{telemetry.hasKey ? 'Active & Protected' : 'Not Set (Deterministic fallback)'}</span>
                </div>
              </div>

              <div className="p-3.5 clay-card-sm">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Primary Model</div>
                <div className="text-xs font-mono text-zinc-200 mt-1 font-bold truncate">
                  {telemetry.models?.[0]?.name || 'Gemini 3.7 Flash'}
                </div>
              </div>

              <div className="p-3.5 clay-card-sm">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Failover Chain</div>
                <div className="text-xs text-zinc-300 mt-1 font-bold">
                  {telemetry.models?.length || 3} Models + Local Engine
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-zinc-300">Model Pipeline & Cooldown Status:</div>
              <div className="space-y-2">
                {telemetry.models?.map((m: any, idx: number) => (
                  <div
                    key={m.id}
                    className="p-3 clay-card-sm flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full clay-inset text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-2 font-medium">({m.id})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {m.successCount} OK · {m.errorCount} Err
                      </span>
                      {m.isCoolingDown ? (
                        <span className="clay-pill-amber px-2.5 py-0.5 text-[10px] flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Cooldown ({m.cooldownRemainingSeconds}s)</span>
                        </span>
                      ) : (
                        <span className="clay-pill-emerald px-2.5 py-0.5 text-[10px] flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Backup, Export & Reset */}
      <div className="p-5 sm:p-6 clay-card space-y-4">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Data Ownership & Backups
        </h2>

        <p className="text-zinc-400 text-xs leading-relaxed font-medium">
          Your productivity logs, focus records, goals, and reflections belong entirely to you. You can export or restore a full JSON backup at any time.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl clay-card-sm border-emerald-500/40 text-emerald-300 font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={exportBackupJSON}
            className="clay-btn-secondary px-4 py-2.5 font-bold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON Backup</span>
          </button>

          <label className="clay-btn-secondary px-4 py-2.5 font-bold flex items-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Restore JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all goals, tasks, and logs back to default sample dataset?')) {
                resetToSampleData();
              }
            }}
            className="clay-btn-secondary px-4 py-2.5 font-bold flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Sample Data</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all tasks, goals, logs, and reviews?')) {
                clearAllUserData();
              }
            }}
            className="clay-btn-danger px-4 py-2.5 font-bold flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Data</span>
          </button>
        </div>
      </div>

      {/* How DayTrace Works & Philosophy Guide */}
      <div className="p-5 sm:p-6 clay-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm uppercase tracking-wider">
              How DayTrace Works & Philosophy
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowPhilosophyModal(true)}
            className="clay-btn-secondary px-3.5 py-1.5 text-emerald-400 font-bold text-xs flex items-center gap-1.5"
          >
            <span>View Full Guide</span>
          </button>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed font-medium">
          &ldquo;DayTrace isn&apos;t built around perfect days. It&apos;s built around real ones.&rdquo; Revisit the 4-step operating cycle (Plan &rarr; Track &rarr; Review &rarr; Improve) and user trust standards.
        </p>

        {profile.welcomeDismissed && (
          <button
            type="button"
            onClick={() => updateProfile({ welcomeDismissed: false })}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer font-medium"
          >
            Show welcome banner on Dashboard again
          </button>
        )}
      </div>

      {/* Bottom Back Button */}
      {onGoBack && (
        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={onGoBack}
            className="clay-btn-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Return to {previousTabLabel}</span>
          </button>
        </div>
      )}

      {/* Philosophy Modal */}
      <PhilosophyModal
        isOpen={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
      />
    </div>
  );
};
