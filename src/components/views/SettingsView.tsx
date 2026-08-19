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
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  playTimerStartChime,
  playWarningChime,
  playSessionCompleteChime,
  playTaskCompleteChime,
} from '../../utils/sound';
import { PhilosophyModal } from '../PhilosophyModal';

export const SettingsView: React.FC = () => {
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
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure your profile, realistic work capacity, sound feedback, and data backups.
          </p>
        </div>
      </div>

      {/* User Profile Form */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 shadow-xs">
        <h2 className="font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          Personal Profile & Workload Capacity
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Occupation / Role</label>
              <input
                type="text"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">
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
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500 text-xs"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Realistic average: 3.5h – 5h of uninterrupted high-cognitive focus per day.
              </span>
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Primary Ambition / Focus Area</label>
              <input
                type="text"
                value={goalsSummary}
                onChange={(e) => setGoalsSummary(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            {savedSuccess && (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Profile updated!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Audio Chimes Preferences */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Harmonic Audio Feedback
            </h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              Built with Web Audio API synthesizers for mindful session cues without external assets.
            </p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg font-medium transition border flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chimes Active' : 'Muted'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={playTimerStartChime}
            className="p-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 border border-zinc-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>Test Start Chime</span>
          </button>
          <button
            onClick={playWarningChime}
            className="p-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 border border-zinc-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-amber-400 fill-current" />
            <span>Test 5m Warning</span>
          </button>
          <button
            onClick={playSessionCompleteChime}
            className="p-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 border border-zinc-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>Test Session End</span>
          </button>
          <button
            onClick={playTaskCompleteChime}
            className="p-2 bg-zinc-800/60 hover:bg-zinc-850 text-zinc-300 border border-zinc-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-blue-400 fill-current" />
            <span>Test Task Done</span>
          </button>
        </div>
      </div>

      {/* AI Router & Quota Resilience Telemetry */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-zinc-100 text-sm uppercase tracking-wider">
              AI Quota Resilience & Model Router
            </h2>
          </div>
          <button
            onClick={fetchTelemetry}
            disabled={telemetryLoading}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${telemetryLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed">
          DayTrace utilizes a production multi-model failover chain with rate-limit cooldowns, structured JSON schema repair, and in-flight request deduplication to ensure uninterrupted AI mentoring.
        </p>

        {telemetry && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-lg">
                <div className="text-[10px] text-zinc-400 font-semibold uppercase">API Key Configured</div>
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{telemetry.hasKey ? 'Active & Protected' : 'Not Set (Deterministic fallback)'}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-lg">
                <div className="text-[10px] text-zinc-400 font-semibold uppercase">Primary Model</div>
                <div className="text-xs font-mono text-zinc-200 mt-1 truncate">
                  {telemetry.models?.[0]?.name || 'Gemini 3.7 Flash'}
                </div>
              </div>

              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-lg">
                <div className="text-[10px] text-zinc-400 font-semibold uppercase">Failover Chain</div>
                <div className="text-xs text-zinc-300 mt-1">
                  {telemetry.models?.length || 3} Models + Local Engine
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-zinc-300">Model Pipeline & Cooldown Status:</div>
              <div className="space-y-1.5">
                {telemetry.models?.map((m: any, idx: number) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-zinc-850 border border-zinc-700/80 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-zinc-200">{m.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono ml-2">({m.id})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400">
                        {m.successCount} OK · {m.errorCount} Err
                      </span>
                      {m.isCoolingDown ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Cooldown ({m.cooldownRemainingSeconds}s)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] flex items-center gap-1 font-medium">
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
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 shadow-xs">
        <h2 className="font-bold text-zinc-100 text-sm uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Data Ownership & Backups
        </h2>

        <p className="text-zinc-400 text-xs leading-relaxed">
          Your productivity logs, focus records, goals, and reflections belong entirely to you. You can export or restore a full JSON backup at any time.
        </p>

        {importStatus && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg font-medium">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={exportBackupJSON}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON Backup</span>
          </button>

          <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer">
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
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer ml-auto"
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
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-lg font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Data</span>
          </button>
        </div>
      </div>

      {/* How DayTrace Works & Philosophy Guide */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-zinc-100 text-sm uppercase tracking-wider">
              How DayTrace Works & Philosophy
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowPhilosophyModal(true)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-emerald-400 border border-zinc-700 rounded-lg font-medium transition cursor-pointer text-xs flex items-center gap-1.5"
          >
            <span>View Full Guide</span>
          </button>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed">
          &ldquo;DayTrace isn&apos;t built around perfect days. It&apos;s built around real ones.&rdquo; Revisit the 4-step operating cycle (Plan &rarr; Track &rarr; Review &rarr; Improve) and user trust standards.
        </p>

        {profile.welcomeDismissed && (
          <button
            type="button"
            onClick={() => updateProfile({ welcomeDismissed: false })}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
          >
            Show welcome banner on Dashboard again
          </button>
        )}
      </div>

      {/* Philosophy Modal */}
      <PhilosophyModal
        isOpen={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
      />
    </div>
  );
};
