import React, { useState } from 'react';
import {
  Timer,
  Play,
  ShieldAlert,
  Plus,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Focus & Distraction Boundaries
            </h1>
            <span className="clay-pill px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              Active Accountability
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Eliminate friction before starting. Set intentional time boundaries for high-distraction apps.
          </p>
        </div>
      </div>

      {/* Grid: Focus Launcher on Left, Distraction Limits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Focus Launcher (7 cols on lg, full width on mobile/tablet) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 clay-card space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
                Launch Focus Session
              </h2>
              {activeTimer && (
                <span className="clay-pill clay-pill-emerald px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Timer active
                </span>
              )}
            </div>

            <form onSubmit={handleStartFocus} className="space-y-4">
              {/* Select from Today's Priorities */}
              {todayTasks.length > 0 && (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">
                    Select from Today&apos;s Priorities (Optional)
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => handleTaskSelectionChange(e.target.value)}
                    className="clay-input w-full px-3.5 py-2.5 text-zinc-200 focus:outline-none text-xs min-h-[38px] cursor-pointer"
                  >
                    <option value="" className="bg-[#141822] text-zinc-300">-- Custom or Standalone Focus Session --</option>
                    {todayTasks.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#141822] text-zinc-200">
                        [{t.priorityTier.replace('_', ' ')}] {t.name} ({formatMinutes(t.estimatedMinutes)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Session Name */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Session Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build backend API endpoints..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs min-h-[38px]"
                />
              </div>

              {/* Preset Duration Cards */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-2">Focus Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                        className={`p-3 rounded-2xl text-left transition cursor-pointer min-h-[64px] flex flex-col justify-between ${
                          isSelected
                            ? 'clay-nav-active'
                            : 'clay-card-interactive text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs text-white">{preset.label}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">{preset.minutes} minutes</div>
                        <div className="text-[10px] text-zinc-400 truncate mt-0.5">{preset.desc}</div>
                      </button>
                    );
                  })}
                  <div className="clay-card-sm p-2.5 flex flex-col justify-center min-h-[64px]">
                    <span className="text-[10px] text-zinc-400 font-semibold mb-1">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      placeholder="Min"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="clay-input w-full px-2 py-1 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Goal & Project Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Goal (Optional)</label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="clay-input w-full px-3 py-2 text-zinc-200 text-xs focus:outline-none min-h-[36px] cursor-pointer"
                  >
                    <option value="" className="bg-[#141822] text-zinc-300">None / Unassigned</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#141822] text-zinc-200">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Project (Optional)</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="clay-input w-full px-3 py-2 text-zinc-200 text-xs focus:outline-none min-h-[36px] cursor-pointer"
                  >
                    <option value="" className="bg-[#141822] text-zinc-300">None / Standalone</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#141822] text-zinc-200">
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
                  className="clay-btn-primary w-full py-3 font-bold flex items-center justify-center gap-2 text-xs min-h-[42px]"
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
          <div className="p-5 sm:p-6 clay-card space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                Distraction Boundaries
              </h2>
              <button
                onClick={() => setShowAddLimitModal(true)}
                className="clay-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 min-h-[32px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Limit</span>
              </button>
            </div>

            <div className="p-3 bg-[#11151e] border border-white/5 rounded-2xl text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2.5 font-medium">
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
                    className="p-3.5 clay-card-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white flex flex-wrap items-center gap-2">
                        <span>{limit.activityName}</span>
                        {isExceeded && (
                          <span className="clay-pill-rose px-2 py-0.5 text-[10px] font-bold">
                            +{usedMinutes - limit.dailyLimitMinutes}m over
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteDistractionLimit(limit.id)}
                        className="clay-btn-secondary p-1 rounded-lg text-zinc-400 hover:text-rose-400 transition"
                        title="Delete limit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Gauge */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono font-medium">
                        <span>Used: {usedMinutes}m</span>
                        <span>Daily Limit: {limit.dailyLimitMinutes}m</span>
                      </div>
                      <div className="w-full clay-inset h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExceeded
                              ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                              : percentUsed > 75
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                              : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {remainingMinutes > 0 ? `${remainingMinutes}m remaining today` : 'Daily limit reached'}
                      </span>
                      <button
                        onClick={() => handleStartDistractionSession(limit)}
                        className="clay-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[32px] text-rose-300"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-extrabold text-white text-sm">Add Distraction Boundary</h3>

            <form onSubmit={handleAddLimitSubmit} className="space-y-3.5">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reddit, Twitter/X, Instagram, Gaming..."
                  value={newLimitName}
                  onChange={(e) => setNewLimitName(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Daily Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={newLimitMinutes}
                  onChange={(e) => setNewLimitMinutes(Number(e.target.value))}
                  className="clay-input w-full px-3.5 py-2.5 text-white text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddLimitModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-5 py-2 font-bold text-xs"
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
