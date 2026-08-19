import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  MoveUp,
  MoveDown,
  Trash2,
  BrainCircuit,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, getTomorrowString, formatMinutes, formatReadableDate } from '../../utils/dateUtils';
import { PlannedTask, PriorityTier, ActivityCategory } from '../../types';

export const PlanTomorrowView: React.FC = () => {
  const {
    profile,
    plannedTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    goals,
    projects,
    authFetch,
  } = useApp();

  const tomorrowStr = getTomorrowString();
  const todayStr = getTodayString();

  const tomorrowTasks = plannedTasks
    .filter((t) => t.date === tomorrowStr)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const todayUnfinishedTasks = plannedTasks.filter(
    (t) => t.date === todayStr && !t.completed
  );

  // New task form state
  const [taskName, setTaskName] = useState('');
  const [priorityTier, setPriorityTier] = useState<PriorityTier>('MUST_DO');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [category, setCategory] = useState<ActivityCategory>('PRODUCTIVE');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // AI Plan Feasibility
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalPlannedMinutes = tomorrowTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 0),
    0
  );
  const totalPlannedHours = (totalPlannedMinutes / 60).toFixed(1);

  // Check feasibility automatically or on demand
  const checkPlanFeasibility = async () => {
    setIsAnalyzing(true);
    try {
      const res = await authFetch('/api/ai/plan-advisory', {
        method: 'POST',
        body: JSON.stringify({
          plannedTasks: tomorrowTasks,
          historicalAvgDailyHours: profile.dailyCapacityHours || 4.5,
          userProfile: profile,
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (e) {
      console.warn('AI advisory check failed', e);
      setAiAdvice('Unable to contact AI advisor. Keep tomorrow focused on your primary Must Do priorities with realistic buffers.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    addTask({
      date: tomorrowStr,
      name: taskName.trim(),
      priorityTier,
      estimatedMinutes,
      category,
      goalId: selectedGoalId || undefined,
      projectId: selectedProjectId || undefined,
      notes: notes.trim() || undefined,
    });

    setTaskName('');
    setNotes('');
  };

  const handleMoveTaskOrder = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tomorrowTasks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newTasks.length) return;

    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIdx];
    newTasks[targetIdx] = temp;

    // update orderIndex
    newTasks.forEach((t, i) => (t.orderIndex = i));
    reorderTasks(
      plannedTasks.map((t) => {
        const found = newTasks.find((nt) => nt.id === t.id);
        return found ? found : t;
      })
    );
  };

  const handleCarryForward = (task: PlannedTask) => {
    updateTask(task.id, {
      date: tomorrowStr,
      postponedCount: (task.postponedCount || 0) + 1,
    });
  };

  const mustDo = tomorrowTasks.filter((t) => t.priorityTier === 'MUST_DO');
  const shouldDo = tomorrowTasks.filter((t) => t.priorityTier === 'SHOULD_DO');
  const optional = tomorrowTasks.filter((t) => t.priorityTier === 'OPTIONAL');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Plan Tomorrow
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
              {formatReadableDate(tomorrowStr)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build a realistic time budget based on priorities — not a rigid 24-hour schedule.
          </p>
        </div>

        <button
          onClick={checkPlanFeasibility}
          disabled={isAnalyzing || tomorrowTasks.length === 0}
          className="self-start sm:self-auto px-3.5 py-2 sm:py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 min-h-[36px]"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{isAnalyzing ? 'Evaluating...' : 'Check Feasibility'}</span>
        </button>
      </div>

      {/* Planned Workload Assessment Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
          totalPlannedMinutes > 360
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-zinc-900 border-zinc-800 text-zinc-200'
        }`}
      >
        <div className="space-y-1 w-full">
          <div className="flex items-center gap-2">
            {totalPlannedMinutes > 360 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-semibold text-zinc-100">
              Planned: ~{totalPlannedHours}h of focused work (
              {formatMinutes(totalPlannedMinutes)}).
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {totalPlannedMinutes > 480
              ? `You have planned over 8 hours of deep work. Based on realistic cognitive stamina and daily household chores, this may be difficult to sustain. Consider demoting 1-2 items to Optional.`
              : totalPlannedMinutes > 360
              ? `A solid planned schedule. Ensure you have scheduled buffers for meals, family responsibilities, or unexpected interruptions.`
              : `A balanced, sustainable target that leaves healthy capacity for real life and unforeseen responsibilities.`}
          </p>

          {aiAdvice && (
            <div className="mt-2 pt-2 border-t border-zinc-800/80 text-xs text-emerald-300 italic flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI Advisor: {aiAdvice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Carried Forward Suggestions from Today */}
      {todayUnfinishedTasks.length > 0 && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Unfinished Tasks from Today
            </span>
            <span className="text-[11px] text-zinc-400">
              Carry forward intentionally without overloading tomorrow.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {todayUnfinishedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-lg flex items-center justify-between gap-2.5"
              >
                <div className="truncate min-w-0 flex-1">
                  <div className="text-xs font-medium text-zinc-200 truncate">{t.name}</div>
                  <div className="text-[10px] text-zinc-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span>⏱️ {formatMinutes(t.estimatedMinutes)}</span>
                    {t.postponedCount > 1 && (
                      <span className="text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded text-[10px]">
                        Postponed {t.postponedCount}x
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleCarryForward(t)}
                  className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0 cursor-pointer min-h-[32px]"
                >
                  <span className="hidden sm:inline">Move</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Task Form */}
      <form
        onSubmit={handleAddTask}
        className="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3.5 text-xs shadow-xs"
      >
        <h3 className="font-bold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Add Tomorrow&apos;s Priority
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-zinc-400 font-medium mb-1">Task / Activity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement authentication tests..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Priority Tier</label>
            <select
              value={priorityTier}
              onChange={(e) => setPriorityTier(e.target.value as PriorityTier)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            >
              <option value="MUST_DO">Must Do (Essential)</option>
              <option value="SHOULD_DO">Should Do (If time permits)</option>
              <option value="OPTIONAL">Optional (Bonus)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Estimated Duration</label>
            <select
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes (1 hour)</option>
              <option value={90}>90 minutes (1.5 hours)</option>
              <option value={120}>120 minutes (2 hours)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-zinc-400 font-medium mb-1">Goal (Optional)</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-2.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 min-h-[36px]"
            >
              <option value="">None / Standalone</option>
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

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Focus on edge cases..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task to Tomorrow</span>
          </button>
        </div>
      </form>

      {/* Tomorrow's Organized Priority Board */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
          Tomorrow&apos;s Plan Breakdown
        </h2>

        {/* MUST DO SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-300 px-1">
            <span>MUST DO — Non-negotiable core focus</span>
            <span className="text-[11px] text-zinc-400 font-normal">
              {mustDo.length} tasks (
              {formatMinutes(mustDo.reduce((acc, t) => acc + t.estimatedMinutes, 0))})
            </span>
          </div>
          {mustDo.length === 0 ? (
            <div className="p-3.5 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No Must Do tasks planned for tomorrow yet.
            </div>
          ) : (
            mustDo.map((task, idx) => (
              <TomorrowTaskRow
                key={task.id}
                task={task}
                index={idx}
                canMoveUp={idx > 0}
                canMoveDown={idx < mustDo.length - 1}
                onMoveUp={() => handleMoveTaskOrder(idx, 'up')}
                onMoveDown={() => handleMoveTaskOrder(idx, 'down')}
                onDelete={() => deleteTask(task.id)}
                onChangeTier={(tier) => updateTask(task.id, { priorityTier: tier })}
              />
            ))
          )}
        </div>

        {/* SHOULD DO SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300 px-1">
            <span>SHOULD DO — Valuable if capacity permits</span>
            <span className="text-[11px] text-zinc-400 font-normal">
              {shouldDo.length} tasks (
              {formatMinutes(shouldDo.reduce((acc, t) => acc + t.estimatedMinutes, 0))})
            </span>
          </div>
          {shouldDo.length === 0 ? (
            <div className="p-3.5 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No Should Do tasks.
            </div>
          ) : (
            shouldDo.map((task, idx) => (
              <TomorrowTaskRow
                key={task.id}
                task={task}
                index={idx}
                canMoveUp={idx > 0}
                canMoveDown={idx < shouldDo.length - 1}
                onMoveUp={() => handleMoveTaskOrder(idx, 'up')}
                onMoveDown={() => handleMoveTaskOrder(idx, 'down')}
                onDelete={() => deleteTask(task.id)}
                onChangeTier={(tier) => updateTask(task.id, { priorityTier: tier })}
              />
            ))
          )}
        </div>

        {/* OPTIONAL SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-300 px-1">
            <span>OPTIONAL — Bonus output</span>
            <span className="text-[11px] text-zinc-400 font-normal">
              {optional.length} tasks (
              {formatMinutes(optional.reduce((acc, t) => acc + t.estimatedMinutes, 0))})
            </span>
          </div>
          {optional.length === 0 ? (
            <div className="p-3.5 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No Optional tasks.
            </div>
          ) : (
            optional.map((task, idx) => (
              <TomorrowTaskRow
                key={task.id}
                task={task}
                index={idx}
                canMoveUp={idx > 0}
                canMoveDown={idx < optional.length - 1}
                onMoveUp={() => handleMoveTaskOrder(idx, 'up')}
                onMoveDown={() => handleMoveTaskOrder(idx, 'down')}
                onDelete={() => deleteTask(task.id)}
                onChangeTier={(tier) => updateTask(task.id, { priorityTier: tier })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TomorrowTaskRow: React.FC<{
  task: PlannedTask;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChangeTier: (tier: PriorityTier) => void;
}> = ({ task, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onDelete, onChangeTier }) => {
  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2.5 text-xs shadow-xs">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer rounded hover:bg-zinc-800 transition"
            title="Move Up"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer rounded hover:bg-zinc-800 transition"
            title="Move Down"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-medium text-zinc-100 truncate">{task.name}</div>
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

      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={task.priorityTier}
          onChange={(e) => onChangeTier(e.target.value as PriorityTier)}
          className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500 min-h-[30px]"
        >
          <option value="MUST_DO">Must Do</option>
          <option value="SHOULD_DO">Should Do</option>
          <option value="OPTIONAL">Optional</option>
        </select>

        <button
          onClick={onDelete}
          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
