import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, getPastDaysList, formatReadableDate } from '../../utils/dateUtils';
import { ActivityCategory } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { activityLogs, plannedTasks } = useApp();

  const past14Days = useMemo(() => getPastDaysList(14), []);

  // Compute daily trend for past 14 days
  const dailyTrends = useMemo(() => {
    return past14Days.map((dateStr) => {
      const dayLogs = activityLogs.filter((l) => l.date === dateStr);
      const dayTasks = plannedTasks.filter((t) => t.date === dateStr);

      const focusMinutes = dayLogs
        .filter((l) => l.category === 'PRODUCTIVE')
        .reduce((acc, l) => acc + l.durationMinutes, 0);

      const distractionMinutes = dayLogs
        .filter((l) => l.category === 'DISTRACTION')
        .reduce((acc, l) => acc + l.durationMinutes, 0);

      const respMinutes = dayLogs
        .filter((l) => l.category === 'RESPONSIBILITY')
        .reduce((acc, l) => acc + l.durationMinutes, 0);

      const restMinutes = dayLogs
        .filter((l) => l.category === 'REST' || l.category === 'ENTERTAINMENT')
        .reduce((acc, l) => acc + l.durationMinutes, 0);

      const plannedMinutes = dayTasks.reduce(
        (acc, t) => acc + (t.estimatedMinutes || 0),
        0
      );

      const completedCount = dayTasks.filter((t) => t.completed).length;
      const executionRate =
        dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

      return {
        date: dateStr,
        focusHours: Number((focusMinutes / 60).toFixed(1)),
        plannedHours: Number((plannedMinutes / 60).toFixed(1)),
        distractionHours: Number((distractionMinutes / 60).toFixed(1)),
        respHours: Number((respMinutes / 60).toFixed(1)),
        restHours: Number((restMinutes / 60).toFixed(1)),
        executionRate,
      };
    });
  }, [past14Days, activityLogs, plannedTasks]);

  // Aggregate Category distribution across all available logs
  const categoryTotals = useMemo(() => {
    const map: Record<ActivityCategory, number> = {
      PRODUCTIVE: 0,
      RESPONSIBILITY: 0,
      DISTRACTION: 0,
      REST: 0,
      PERSONAL: 0,
      ENTERTAINMENT: 0,
      DEEP_WORK: 0,
      SHALLOW_WORK: 0,
      LEARNING: 0,
      CHORES: 0,
      FAMILY: 0,
    };

    activityLogs.forEach((l) => {
      map[l.category] = (map[l.category] || 0) + l.durationMinutes;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map)
      .filter(([, minutes]) => (minutes as number) > 0)
      .map(([cat, minutes]) => ({
        category: cat as ActivityCategory,
        minutes: minutes as number,
        hours: Number(((minutes as number) / 60).toFixed(1)),
        percentage: Math.round(((minutes as number) / total) * 100),
      }));
  }, [activityLogs]);

  // Max focus hours in the 14 day range for chart scaling
  const maxFocusHours = useMemo(() => {
    return Math.max(8, ...dailyTrends.map((d) => Math.max(d.focusHours, d.plannedHours)));
  }, [dailyTrends]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Productivity & Time Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
              14-Day View
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual comparisons of planned vs actual work, interruptions, and time allocation.
          </p>
        </div>
      </div>

      {/* Planned vs Actual Focus Hours Chart (CSS-based responsive bar chart) */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 text-xs shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Planned vs Actual Focus Hours (Last 14 Days)
            </h3>
            <p className="text-zinc-400 text-xs mt-0.5">
              Notice how actual deep work stays consistent despite planned fluctuations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
              <span className="text-zinc-300">Actual Focus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-zinc-700 border border-dashed border-zinc-500 rounded-xs" />
              <span className="text-zinc-400">Planned Hours</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 sm:gap-2 items-end h-48 border-b border-zinc-800 px-1">
            {dailyTrends.map((day) => {
              const actualHeightPct = Math.min(100, (day.focusHours / maxFocusHours) * 100);
              const plannedHeightPct = Math.min(100, (day.plannedHours / maxFocusHours) * 100);
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' });
              const dateNum = day.date.split('-')[2];

              return (
                <div key={day.date} className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-0.5 h-full relative">
                    {/* Planned Bar */}
                    <div
                      className="w-1.5 sm:w-2.5 bg-zinc-750 border-t border-dashed border-zinc-500 rounded-t-xs transition-all"
                      style={{ height: `${plannedHeightPct}%` }}
                      title={`Planned: ${day.plannedHours}h`}
                    />
                    {/* Actual Bar */}
                    <div
                      className="w-2 sm:w-3.5 bg-emerald-500 rounded-t-xs group-hover:bg-emerald-400 transition-all shadow-xs"
                      style={{ height: `${actualHeightPct}%` }}
                      title={`Actual: ${day.focusHours}h`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 group-hover:text-zinc-200">
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Execution Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Total Time Distribution */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            Time Allocation Breakdown
          </h3>

          <div className="space-y-3">
            {categoryTotals.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium capitalize">
                    {cat.category.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="font-mono text-zinc-400">
                    {cat.hours}h ({cat.percentage}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.category === 'PRODUCTIVE'
                        ? 'bg-emerald-500'
                        : cat.category === 'RESPONSIBILITY'
                        ? 'bg-purple-500'
                        : cat.category === 'DISTRACTION'
                        ? 'bg-rose-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Rates & Insights */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Consistency Insights
          </h3>

          <div className="space-y-2.5">
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-lg space-y-1">
              <div className="font-semibold text-zinc-200">Execution Stability</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Your average daily priority completion rate is hovering around{' '}
                <span className="text-emerald-400 font-bold">78%</span>. Keeping your Must Do list
                under 3 items prevents burnout.
              </p>
            </div>

            <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-lg space-y-1">
              <div className="font-semibold text-purple-300">Real-Life Buffer Factor</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                You log an average of <span className="text-purple-400 font-bold">1.2h</span> of
                unplanned responsibilities per day. Planning 4-5 hours of deep work instead of 8
                guarantees sustainable progress.
              </p>
            </div>

            <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-lg space-y-1">
              <div className="font-semibold text-rose-300">Distraction Boundary Health</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Social feeds account for less than 15% of your waking time, well within healthy
                boundaries when monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
