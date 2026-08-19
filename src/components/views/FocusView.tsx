import React, { useState } from 'react';
import {
  Timer,
  Play,
  ShieldAlert,
  Plus,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, getTodayString } from '../../utils/dateUtils';
import { ActivityCategory } from '../../types';

const FOCUS_PRESETS = [
  { label: 'Sprint', minutes: 15, desc: 'Quick kickstarter session' },
  { label: 'Pomodoro', minutes: 25, desc: 'Classic focused interval' },
  { label: 'Deep Flow', minutes: 45, desc: 'Ideal for coding & writing' },
  { label: 'Core Block', minutes: 60, desc: 'Deep uninterrupted work' },
  { label: 'Marathon', minutes: 90, desc: 'High-leverage milestone' },
];

export const FocusView: React.FC = () => {
  const {
    plannedTasks,
    goals,
    projects,
    startTimer,
    activeTimer,
    distractionLimits,
    addDistractionLimit,
    deleteDistractionLimit,
    getDistractionUsageToday,
  } = useApp();

  const todayStr = getTodayString();
  const todayTasks = plannedTasks.filter((t) => t.date === todayStr && !t.completed);

  // Custom session form
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [sessionName, setSessionName] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [category, setCategory] = useState<ActivityCategory>('PRODUCTIVE');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Add new distraction limit form
  const [newLimitName, setNewLimitName] = useState('');
  const [newLimitMinutes, setNewLimitMinutes] = useState(20);
  const [newLimitCategory, setNewLimitCategory] = useState<ActivityCategory>('DISTRACTION');
  const [showAddLimitModal, setShowAddLimitModal] = useState(false);

  const handleTaskSelectionChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (!taskId) {
      setSessionName('');
      return;
    }
    const task = todayTasks.find((t) => t.id === taskId);
    if (task) {
      setSessionName(task.name);
      setSelectedDuration(task.estimatedMinutes || 45);
      setCategory(task.category);
      if (task.goalId) setSelectedGoalId(task.goalId);
      if (task.projectId) setSelectedProjectId(task.projectId);
    }
  };

  const handleStartFocus = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMinutes = customDuration ? parseInt(customDuration, 10) : selectedDuration;
    if (isNaN(finalMinutes) || finalMinutes <= 0) return;

    startTimer({
      taskId: selectedTaskId || undefined,
      taskName: sessionName.trim() || 'Deep Focus Session',
      goalId: selectedGoalId || undefined,
      projectId: selectedProjectId || undefined,
      category,
      plannedMinutes: finalMinutes,
    });
  };

  const handleStartDistractionSession = (limit: typeof distractionLimits[0]) => {
    const usedToday = getDistractionUsageToday(limit.activityName);
    const remaining = Math.max(5, limit.dailyLimitMinutes - usedToday);

    startTimer({
      taskName: limit.activityName,
      category: limit.category,
      plannedMinutes: remaining > 0 ? remaining : 15,
      isDistractionBoundary: true,
      distractionLimitId: limit.id,
    });
  };

  const handleAddLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimitName.trim()) return;

    addDistractionLimit({
      activityName: newLimitName.trim(),
      dailyLimitMinutes: newLimitMinutes,
      category: newLimitCategory,
      isActive: true,
    });

    setNewLimitName('');
    setShowAddLimitModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Focus & Distraction Boundaries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
              Active Accountability
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Eliminate friction before starting. Set intentional time boundaries for high-distraction apps.
          </p>
        </div>
      </div>

      {/* Grid: Focus Launcher on Left, Distraction Limits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Focus Launcher (7 cols on lg, full width on mobile/tablet) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
                Launch Focus Session
              </h2>
              {activeTimer && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Timer active
                </span>
              )}
            </div>

            <form onSubmit={handleStartFocus} className="space-y-4">
              {/* Select from Today's Priorities */}
              {todayTasks.length > 0 && (
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">
                    Select from Today&apos;s Priorities (Optional)
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => handleTaskSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs min-h-[36px]"
                  >
                    <option value="">-- Custom or Standalone Focus Session --</option>
                    {todayTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.priorityTier.replace('_', ' ')}] {t.name} ({formatMinutes(t.estimatedMinutes)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Session Name */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Session Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build backend API endpoints..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs min-h-[36px]"
                />
              </div>

              {/* Preset Duration Cards */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Focus Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FOCUS_PRESETS.map((preset) => {
                    const isSelected = selectedDuration === preset.minutes && !customDuration;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => {
                          setSelectedDuration(preset.minutes);
                          setCustomDuration('');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition cursor-pointer min-h-[58px] ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-medium'
                            : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="font-semibold text-xs">{preset.label}</div>
                        <div className="text-[10px] text-zinc-400">{preset.minutes} minutes</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5 truncate">{preset.desc}</div>
                      </button>
                    );
                  })}
                  <div className="p-2 bg-zinc-800/40 border border-zinc-700/50 rounded-lg flex flex-col justify-center min-h-[58px]">
                    <span className="text-[10px] text-zinc-400 mb-1">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      placeholder="Min"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Goal & Project Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Goal (Optional)</label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 min-h-[36px]"
                  >
                    <option value="">None / Unassigned</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Project (Optional)</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 min-h-[36px]"
                  >
                    <option value="">None / Standalone</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Start */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs min-h-[40px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    Start Focus Session (
                    {customDuration ? `${customDuration}m` : `${selectedDuration}m`})
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Distraction Boundaries & Limits (5 cols on lg, full width on mobile/tablet) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                Distraction Boundaries
              </h2>
              <button
                onClick={() => setShowAddLimitModal(true)}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg border border-zinc-700 transition cursor-pointer flex items-center gap-1 text-[11px] min-h-[32px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Limit</span>
              </button>
            </div>

            <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-lg text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                DayTrace acts as an honest mirror. You can start a monitored session with a timer. When the limit is reached, you get an explicit reality alert instead of aggressive blocks.
              </span>
            </div>

            {/* List of Distraction Limits */}
            <div className="space-y-3">
              {distractionLimits.map((limit) => {
                const usedMinutes = getDistractionUsageToday(limit.activityName);
                const percentUsed = Math.min(
                  100,
                  Math.round((usedMinutes / limit.dailyLimitMinutes) * 100)
                );
                const isExceeded = usedMinutes > limit.dailyLimitMinutes;
                const remainingMinutes = Math.max(0, limit.dailyLimitMinutes - usedMinutes);

                return (
                  <div
                    key={limit.id}
                    className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-zinc-200 flex flex-wrap items-center gap-1.5">
                        <span>{limit.activityName}</span>
                        {isExceeded && (
                          <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 text-[10px] rounded font-medium border border-rose-500/40">
                            +{usedMinutes - limit.dailyLimitMinutes}m over
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteDistractionLimit(limit.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete limit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Gauge */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                        <span>Used: {usedMinutes}m</span>
                        <span>Daily Limit: {limit.dailyLimitMinutes}m</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isExceeded
                              ? 'bg-rose-500'
                              : percentUsed > 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-zinc-400">
                        {remainingMinutes > 0 ? `${remainingMinutes}m remaining today` : 'Daily limit reached'}
                      </span>
                      <button
                        onClick={() => handleStartDistractionSession(limit)}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 min-h-[30px]"
                      >
                        <Play className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Start Monitored Session</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Limit Modal */}
      {showAddLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-semibold text-zinc-100 text-sm">Add Distraction Boundary</h3>

            <form onSubmit={handleAddLimitSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reddit, Twitter/X, Instagram, Gaming..."
                  value={newLimitName}
                  onChange={(e) => setNewLimitName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-rose-500 min-h-[36px]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">
                  Daily Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={newLimitMinutes}
                  onChange={(e) => setNewLimitMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-rose-500 min-h-[36px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddLimitModal(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 rounded min-h-[32px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium cursor-pointer min-h-[32px]"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
