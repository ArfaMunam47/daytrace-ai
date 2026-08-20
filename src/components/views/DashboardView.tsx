import React, { useState } from 'react';
import {
  Play,
  CheckCircle,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  BarChart2,
  Calendar,
  Flame,
  Star,
  X,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, formatMinutes, formatReadableDate } from '../../utils/dateUtils';
import { PlannedTask, PriorityTier } from '../../types';
import { WelcomeBanner } from '../WelcomeBanner';
import { PhilosophyModal } from '../PhilosophyModal';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenQuickLog: () => void;
  onOpenInterruption: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickLog,
  onOpenInterruption,
}) => {
  const {
    user,
    profile,
    updateProfile,
    plannedTasks,
    addTask,
    toggleTaskCompletion,
    carryTaskToTomorrow,
    deleteTask,
    startTimer,
    todayStats,
    habits,
    toggleHabitDate,
    reflections,
    saveReflection,
  } = useApp();

  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);

  const todayStr = getTodayString();
  const todayTasks = plannedTasks
    .filter((t) => t.date === todayStr)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const mustDoTasks = todayTasks.filter((t) => t.priorityTier === 'MUST_DO');
  const shouldDoTasks = todayTasks.filter((t) => t.priorityTier === 'SHOULD_DO');
  const optionalTasks = todayTasks.filter((t) => t.priorityTier === 'OPTIONAL');

  // Quick task input
  const [quickTaskName, setQuickTaskName] = useState('');
  const [quickTaskTier, setQuickTaskTier] = useState<PriorityTier>('MUST_DO');
  const [quickTaskMin, setQuickTaskMin] = useState<number>(45);

  // Reflection modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const existingReflection = reflections.find((r) => r.date === todayStr);
  const [reflAccomplished, setReflAccomplished] = useState(existingReflection?.accomplished || '');
  const [reflInterrupted, setReflInterrupted] = useState(existingReflection?.interrupted || '');
  const [reflDistracted, setReflDistracted] = useState(existingReflection?.distracted || '');
  const [reflImprove, setReflImprove] = useState(existingReflection?.improveTomorrow || '');
  const [reflRating, setReflRating] = useState<number>(existingReflection?.rating || 4);

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskName.trim()) return;

    addTask({
      date: todayStr,
      name: quickTaskName.trim(),
      priorityTier: quickTaskTier,
      estimatedMinutes: quickTaskMin,
      category: 'PRODUCTIVE',
    });

    setQuickTaskName('');
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveReflection({
      date: todayStr,
      accomplished: reflAccomplished.trim() || 'Logged daily focus milestones.',
      interrupted: reflInterrupted.trim() || undefined,
      distracted: reflDistracted.trim() || undefined,
      improveTomorrow: reflImprove.trim() || 'Maintain consistent session starts.',
      rating: reflRating,
      createdAt: new Date().toISOString(),
    });
    setShowReflectionModal(false);
  };

  const handleStartTaskTimer = (task: PlannedTask) => {
    startTimer({
      taskId: task.id,
      taskName: task.name,
      goalId: task.goalId,
      projectId: task.projectId,
      category: task.category,
      plannedMinutes: task.estimatedMinutes || 45,
    });
  };

  const rawName = profile.firstName || user?.firstName || (profile.name && profile.name.trim() !== 'User' ? profile.name : '') || (user?.email ? user.email.split('@')[0] : '');
  const displayName = rawName ? `, ${rawName}` : '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Personalized Dismissible Welcome Banner for First-Time Users */}
      {!profile.welcomeDismissed && (
        <WelcomeBanner
          onPlanMyDay={() => onNavigateTab('plan-tomorrow')}
          onDismiss={() => updateProfile({ welcomeDismissed: true })}
        />
      )}

      {/* Welcome & Philosophy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Good day{displayName}
            </h1>
            <span className="clay-pill px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
              {formatReadableDate(todayStr)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Plan less. Do more. Know where your time went.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={() => setShowPhilosophyModal(true)}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
            title="How DayTrace Works & Philosophy"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">How It Works</span>
          </button>

          <button
            onClick={() => setShowReflectionModal(true)}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{existingReflection ? 'Edit Reflection' : 'Evening Reflection'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('plan-tomorrow')}
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Plan Tomorrow</span>
          </button>
        </div>
      </div>

      {/* Today's High-Level Execution & Time Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Execution Rate Card */}
        <div className="col-span-2 sm:col-span-1 p-4 clay-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Execution Rate
            </span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2.5">
            {todayStats.totalTasksCount > 0 ? (
              <>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{todayStats.executionRate}%</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 truncate font-medium">
                  {todayStats.completedCount} of {todayStats.totalTasksCount} completed
                </div>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-bold text-zinc-400">No planned tasks</div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate font-medium">
                  Ready to schedule focus blocks
                </div>
              </>
            )}
          </div>
          <div className="w-full clay-inset h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              style={{ width: `${todayStats.totalTasksCount > 0 ? Math.min(100, todayStats.executionRate) : 0}%` }}
            />
          </div>
        </div>

        {/* Focus Time Card */}
        <div className="p-4 clay-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Focus Time</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
            {formatMinutes(todayStats.focusMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate font-medium">
            Target: {formatMinutes(todayStats.plannedFocusMinutes)}
          </div>
        </div>

        {/* Responsibilities Card */}
        <div className="p-4 clay-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Responsibilities</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-400">
            {formatMinutes(todayStats.responsibilityMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate font-medium">Family & chores</div>
        </div>

        {/* Distraction Card */}
        <div className="p-4 clay-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Distraction</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-400">
            {formatMinutes(todayStats.distractionMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate font-medium">Social & media</div>
        </div>

        {/* Rest & Personal Card */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-4 clay-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rest / Recovery</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-400">
            {formatMinutes(todayStats.restMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate font-medium">Breaks & meals</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Priorities on Left, Habits & Real-Life Balance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Priorities (Must Do / Should Do / Optional) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              Today&apos;s Priorities
            </h2>
            <span className="clay-pill px-2.5 py-0.5 text-xs text-zinc-300 font-semibold">
              {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} Done
            </span>
          </div>

          {/* Responsive Quick Add Bar for Today */}
          <form
            onSubmit={handleQuickAddTask}
            className="p-3 clay-card flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
          >
            <input
              type="text"
              placeholder="Add priority task (e.g. Finish React Auth UI)..."
              value={quickTaskName}
              onChange={(e) => setQuickTaskName(e.target.value)}
              className="clay-input flex-1 px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none text-xs font-medium min-h-[38px]"
            />
            <div className="flex items-center gap-2">
              <select
                value={quickTaskTier}
                onChange={(e) => setQuickTaskTier(e.target.value as PriorityTier)}
                className="clay-input flex-1 sm:flex-none px-3 py-2 text-zinc-200 focus:outline-none text-xs font-medium min-h-[38px] cursor-pointer"
              >
                <option value="MUST_DO" className="bg-[#141822] text-zinc-200">Must Do</option>
                <option value="SHOULD_DO" className="bg-[#141822] text-zinc-200">Should Do</option>
                <option value="OPTIONAL" className="bg-[#141822] text-zinc-200">Optional</option>
              </select>
              <select
                value={quickTaskMin}
                onChange={(e) => setQuickTaskMin(Number(e.target.value))}
                className="clay-input px-3 py-2 text-zinc-200 focus:outline-none text-xs font-medium min-h-[38px] cursor-pointer"
              >
                <option value={15} className="bg-[#141822] text-zinc-200">15m</option>
                <option value={30} className="bg-[#141822] text-zinc-200">30m</option>
                <option value={45} className="bg-[#141822] text-zinc-200">45m</option>
                <option value={60} className="bg-[#141822] text-zinc-200">60m</option>
                <option value={90} className="bg-[#141822] text-zinc-200">90m</option>
              </select>
              <button
                type="submit"
                className="clay-btn-primary px-4 py-2 font-bold flex items-center justify-center gap-1.5 min-h-[38px]"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:hidden text-xs">Add</span>
              </button>
            </div>
          </form>

          {/* Task Tiers List */}
          <div className="space-y-4">
            {/* MUST DO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300 px-1">
                <span>MUST DO — Crucial for Today</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {mustDoTasks.length} {mustDoTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {mustDoTasks.length === 0 ? (
                <div className="p-4 clay-card-sm text-center text-xs text-zinc-500 font-medium border-dashed">
                  No Must Do tasks planned for today. Add one above or plan tomorrow.
                </div>
              ) : (
                mustDoTasks.map((task) => (
                  <TaskRowItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskCompletion(task.id)}
                    onStartTimer={() => handleStartTaskTimer(task)}
                    onCarryForward={() => carryTaskToTomorrow(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>

            {/* SHOULD DO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 px-1">
                <span>SHOULD DO — If Time Allows</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {shouldDoTasks.length} {shouldDoTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {shouldDoTasks.length === 0 ? (
                <div className="p-4 clay-card-sm text-center text-xs text-zinc-500 font-medium border-dashed">
                  No Should Do tasks for today.
                </div>
              ) : (
                shouldDoTasks.map((task) => (
                  <TaskRowItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskCompletion(task.id)}
                    onStartTimer={() => handleStartTaskTimer(task)}
                    onCarryForward={() => carryTaskToTomorrow(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>

            {/* OPTIONAL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300 px-1">
                <span>OPTIONAL — Bonus Output</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {optionalTasks.length} {optionalTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {optionalTasks.length === 0 ? (
                <div className="p-4 clay-card-sm text-center text-xs text-zinc-500 font-medium border-dashed">
                  No Optional tasks for today.
                </div>
              ) : (
                optionalTasks.map((task) => (
                  <TaskRowItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskCompletion(task.id)}
                    onStartTimer={() => handleStartTaskTimer(task)}
                    onCarryForward={() => carryTaskToTomorrow(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Consistency Habits, Distraction Limits & Quick Actions */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="p-4.5 clay-card space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={onOpenQuickLog}
                className="p-3 clay-card-interactive text-left flex flex-col justify-between cursor-pointer min-h-[64px]"
              >
                <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="truncate">Log Activity</span>
                </div>
                <span className="text-[11px] text-zinc-400 truncate font-medium">Dev, study, meals</span>
              </button>

              <button
                onClick={onOpenInterruption}
                className="p-3 clay-card-interactive text-left flex flex-col justify-between cursor-pointer min-h-[64px]"
              >
                <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">Interruption</span>
                </div>
                <span className="text-[11px] text-zinc-400 truncate font-medium">Family & chores</span>
              </button>
            </div>
          </div>

          {/* Habits & Consistency Tracker */}
          <div className="p-4.5 clay-card space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                Habits & Consistency
              </h3>
              <button
                onClick={() => onNavigateTab('habits')}
                className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {habits.slice(0, 4).map((habit) => {
                const isCheckedToday = habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit.id}
                    className="p-2.5 clay-card-sm flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <button
                        onClick={() => toggleHabitDate(habit.id, todayStr)}
                        className={`w-6 h-6 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                          isCheckedToday
                            ? 'clay-btn-primary'
                            : 'clay-inset text-transparent hover:border-emerald-500'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <div className="truncate min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            isCheckedToday ? 'text-zinc-500 line-through' : 'text-zinc-200'
                          }`}
                        >
                          {habit.name}
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold truncate mt-0.5">
                          🔥 {habit.streakCount} streak
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Reflection Preview */}
          {existingReflection && (
            <div className="p-4.5 clay-card space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  Today&apos;s Reflection ({existingReflection.rating}/5)
                </span>
                <button
                  onClick={() => setShowReflectionModal(true)}
                  className="text-[11px] text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <p className="text-zinc-300 italic text-[11px] clay-inset p-2.5 rounded-xl font-medium">
                &ldquo;{existingReflection.accomplished}&rdquo;
              </p>
              {existingReflection.improveTomorrow && (
                <div className="text-[11px] text-zinc-400">
                  <span className="text-white font-bold">Tomorrow&apos;s adjustment:</span>{' '}
                  {existingReflection.improveTomorrow}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daily Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-lg p-6 space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  Daily Reflection — {formatReadableDate(todayStr)}
                </h3>
              </div>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3.5">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">
                  1. What did I accomplish today?
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Finished core authentication UI, solved 2 algorithm challenges..."
                  value={reflAccomplished}
                  onChange={(e) => setReflAccomplished(e.target.value)}
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-semibold mb-1">
                  2. What interrupted me? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family doctor appointment, unexpected delivery..."
                  value={reflInterrupted}
                  onChange={(e) => setReflInterrupted(e.target.value)}
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-semibold mb-1">
                  3. What distracted me? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LinkedIn scrolling after lunch..."
                  value={reflDistracted}
                  onChange={(e) => setReflDistracted(e.target.value)}
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-semibold mb-1">
                  4. What should I improve tomorrow?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Start first focus block before opening social feeds..."
                  value={reflImprove}
                  onChange={(e) => setReflImprove(e.target.value)}
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-semibold mb-1.5">
                  5. How do you feel about today&apos;s progress? (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      type="button"
                      key={score}
                      onClick={() => setReflRating(score)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                        reflRating === score
                          ? 'clay-pill-amber'
                          : 'clay-btn-secondary text-zinc-400 hover:text-white'
                      }`}
                    >
                      {score} {score === 1 ? '🙁' : score === 3 ? '😐' : score === 5 ? '🌟' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-5 py-2 font-bold text-xs cursor-pointer"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Philosophy & Workflow Guide Modal */}
      <PhilosophyModal
        isOpen={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
      />
    </div>
  );
};

// Reusable Task Item Row with Claymorphism
const TaskRowItem: React.FC<{
  task: PlannedTask;
  onToggle: () => void;
  onStartTimer: () => void;
  onCarryForward: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onStartTimer, onCarryForward, onDelete }) => {
  return (
    <div
      className={`p-3.5 clay-card-sm flex items-center justify-between gap-2.5 sm:gap-3 transition-all ${
        task.completed
          ? 'opacity-60 bg-[#0f121a]'
          : 'hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
            task.completed
              ? 'clay-btn-primary text-white'
              : 'clay-inset text-transparent hover:border-emerald-500'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <CheckCircle className="w-4 h-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={`text-xs font-semibold truncate ${
              task.completed ? 'text-zinc-500 line-through' : 'text-white'
            }`}
          >
            {task.name}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 mt-1 font-medium">
            <span className="shrink-0">⏱️ {formatMinutes(task.estimatedMinutes)}</span>
            {task.postponedCount > 0 && (
              <span className="text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full font-bold shrink-0">
                Postponed {task.postponedCount}x
              </span>
            )}
            {task.notes && <span className="truncate text-zinc-400 max-w-[150px] sm:max-w-xs">• {task.notes}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!task.completed && (
          <button
            onClick={onStartTimer}
            title="Start focus timer for this task"
            className="p-1.5 sm:px-3 sm:py-1.5 clay-btn-primary text-xs flex items-center gap-1.5 font-bold min-h-[32px]"
          >
            <Play className="w-3 h-3 fill-current shrink-0" />
            <span className="hidden sm:inline">Focus</span>
          </button>
        )}

        <button
          onClick={onCarryForward}
          title="Carry forward to tomorrow"
          className="clay-btn-secondary p-1.5 rounded-xl transition text-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDelete}
          title="Delete task"
          className="clay-btn-secondary p-1.5 rounded-xl transition text-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center text-zinc-400 hover:text-rose-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
