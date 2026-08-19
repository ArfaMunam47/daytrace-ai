import React, { useState } from 'react';
import {
  Play,
  CheckCircle,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Timer,
  BarChart2,
  Calendar,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, formatMinutes, formatReadableDate } from '../../utils/dateUtils';
import { PlannedTask, PriorityTier, ActivityCategory } from '../../types';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Good day{displayName}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] font-medium text-zinc-300 border border-zinc-700">
              {formatReadableDate(todayStr)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Plan less. Do more. Know where your time went.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={() => setShowPhilosophyModal(true)}
            className="px-3 py-2 sm:py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
            title="How DayTrace Works & Philosophy"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">How It Works</span>
          </button>

          <button
            onClick={() => setShowReflectionModal(true)}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{existingReflection ? 'Edit Reflection' : 'Evening Reflection'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('plan-tomorrow')}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Plan Tomorrow</span>
          </button>
        </div>
      </div>

      {/* Today's High-Level Execution & Time Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Execution Rate Card - Compliant with Rule 4: Never 0% failure when 0 planned tasks */}
        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Execution Rate
            </span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            {todayStats.totalTasksCount > 0 ? (
              <>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono">{todayStats.executionRate}%</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                  {todayStats.completedCount} of {todayStats.totalTasksCount} completed
                </div>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-semibold text-zinc-400">No planned tasks</div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Ready to schedule focus blocks
                </div>
              </>
            )}
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${todayStats.totalTasksCount > 0 ? Math.min(100, todayStats.executionRate) : 0}%` }}
            />
          </div>
        </div>

        {/* Focus Time Card */}
        <div className="p-3.5 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Focus Time</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">
            {formatMinutes(todayStats.focusMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">
            Target: {formatMinutes(todayStats.plannedFocusMinutes)}
          </div>
        </div>

        {/* Responsibilities Card */}
        <div className="p-3.5 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Responsibilities</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-400">
            {formatMinutes(todayStats.responsibilityMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">Family & chores</div>
        </div>

        {/* Distraction Card */}
        <div className="p-3.5 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Distraction</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400">
            {formatMinutes(todayStats.distractionMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">Social & media</div>
        </div>

        {/* Rest & Personal Card */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-3.5 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Rest / Recovery</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">
            {formatMinutes(todayStats.restMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">Breaks & meals</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Priorities on Left, Habits & Real-Life Balance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Priorities (Must Do / Should Do / Optional) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Today&apos;s Priorities
            </h2>
            <span className="text-xs text-zinc-400">
              {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} Done
            </span>
          </div>

          {/* Responsive Quick Add Bar for Today */}
          <form
            onSubmit={handleQuickAddTask}
            className="p-2.5 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
          >
            <input
              type="text"
              placeholder="Add priority task (e.g. Finish React Auth UI)..."
              value={quickTaskName}
              onChange={(e) => setQuickTaskName(e.target.value)}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs min-h-[36px]"
            />
            <div className="flex items-center gap-2">
              <select
                value={quickTaskTier}
                onChange={(e) => setQuickTaskTier(e.target.value as PriorityTier)}
                className="flex-1 sm:flex-none px-2.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500 text-xs min-h-[36px]"
              >
                <option value="MUST_DO">Must Do</option>
                <option value="SHOULD_DO">Should Do</option>
                <option value="OPTIONAL">Optional</option>
              </select>
              <select
                value={quickTaskMin}
                onChange={(e) => setQuickTaskMin(Number(e.target.value))}
                className="px-2.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500 text-xs min-h-[36px]"
              >
                <option value={15}>15m</option>
                <option value={30}>30m</option>
                <option value={45}>45m</option>
                <option value={60}>60m</option>
                <option value={90}>90m</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer flex items-center justify-center gap-1 font-medium min-h-[36px]"
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
              <div className="flex items-center justify-between text-xs font-semibold text-rose-300 px-1">
                <span>MUST DO — Crucial for Today</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {mustDoTasks.length} {mustDoTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {mustDoTasks.length === 0 ? (
                <div className="p-3.5 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
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
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300 px-1">
                <span>SHOULD DO — If Time Allows</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {shouldDoTasks.length} {shouldDoTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {shouldDoTasks.length === 0 ? (
                <div className="p-3.5 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
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
              <div className="flex items-center justify-between text-xs font-semibold text-blue-300 px-1">
                <span>OPTIONAL — Bonus Output</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {optionalTasks.length} {optionalTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              {optionalTasks.length === 0 ? (
                <div className="p-3.5 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
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
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenQuickLog}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-left transition border border-zinc-700 flex flex-col justify-between cursor-pointer min-h-[56px]"
              >
                <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Log Activity</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate">Dev, study, meals</span>
              </button>

              <button
                onClick={onOpenInterruption}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-left transition border border-zinc-700 flex flex-col justify-between cursor-pointer min-h-[56px]"
              >
                <div className="text-purple-400 font-semibold mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Interruption</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate">Family & chores</span>
              </button>
            </div>
          </div>

          {/* Habits & Consistency Tracker */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                Habits & Consistency
              </h3>
              <button
                onClick={() => onNavigateTab('habits')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
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
                    className="p-2 bg-zinc-800/60 border border-zinc-700/50 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <button
                        onClick={() => toggleHabitDate(habit.id, todayStr)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer shrink-0 ${
                          isCheckedToday
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-600 text-transparent hover:border-emerald-500'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <div className="truncate min-w-0">
                        <div
                          className={`font-medium truncate ${
                            isCheckedToday ? 'text-zinc-400 line-through' : 'text-zinc-200'
                          }`}
                        >
                          {habit.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
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
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  Today&apos;s Reflection ({existingReflection.rating}/5)
                </span>
                <button
                  onClick={() => setShowReflectionModal(true)}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-zinc-300 italic text-[11px] bg-zinc-800/60 p-2 rounded-lg border border-zinc-700/40">
                &ldquo;{existingReflection.accomplished}&rdquo;
              </p>
              {existingReflection.improveTomorrow && (
                <div className="text-[10px] text-zinc-400">
                  <span className="text-zinc-300 font-medium">Tomorrow&apos;s adjustment:</span>{' '}
                  {existingReflection.improveTomorrow}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daily Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-zinc-100 text-sm">
                  Daily Reflection — {formatReadableDate(todayStr)}
                </h3>
              </div>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3.5">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  1. What did I accomplish today?
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Finished core authentication UI, solved 2 algorithm challenges..."
                  value={reflAccomplished}
                  onChange={(e) => setReflAccomplished(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  2. What interrupted me? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family doctor appointment, unexpected delivery..."
                  value={reflInterrupted}
                  onChange={(e) => setReflInterrupted(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  3. What distracted me? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LinkedIn scrolling after lunch..."
                  value={reflDistracted}
                  onChange={(e) => setReflDistracted(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  4. What should I improve tomorrow?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Start first focus block before opening social feeds..."
                  value={reflImprove}
                  onChange={(e) => setReflImprove(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  5. How do you feel about today&apos;s progress? (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      type="button"
                      key={score}
                      onClick={() => setReflRating(score)}
                      className={`flex-1 py-1.5 rounded-lg border font-medium text-xs transition ${
                        reflRating === score
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {score} {score === 1 ? '🙁' : score === 3 ? '😐' : score === 5 ? '🌟' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm cursor-pointer"
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

// Reusable Task Item Row
const TaskRowItem: React.FC<{
  task: PlannedTask;
  onToggle: () => void;
  onStartTimer: () => void;
  onCarryForward: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onStartTimer, onCarryForward, onDelete }) => {
  return (
    <div
      className={`p-3 bg-zinc-900 border rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-all ${
        task.completed
          ? 'border-zinc-800/60 opacity-60 bg-zinc-900/40'
          : 'border-zinc-800 hover:border-zinc-700 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer shrink-0 ${
            task.completed
              ? 'bg-emerald-600 text-white'
              : 'border border-zinc-600 text-transparent hover:border-emerald-500'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <CheckCircle className="w-4 h-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={`text-xs font-medium truncate ${
              task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
            }`}
          >
            {task.name}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
            <span className="shrink-0">⏱️ {formatMinutes(task.estimatedMinutes)}</span>
            {task.postponedCount > 0 && (
              <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                Postponed {task.postponedCount}x
              </span>
            )}
            {task.notes && <span className="truncate text-zinc-500 max-w-[150px] sm:max-w-xs">• {task.notes}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!task.completed && (
          <button
            onClick={onStartTimer}
            title="Start focus timer for this task"
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 font-medium min-h-[32px]"
          >
            <Play className="w-3 h-3 fill-current shrink-0" />
            <span className="hidden sm:inline">Focus</span>
          </button>
        )}

        <button
          onClick={onCarryForward}
          title="Carry forward to tomorrow"
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition text-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDelete}
          title="Delete task"
          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition text-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
