import React, { useState, useMemo } from 'react';
import {
  Filter,
  Download,
  Trash2,
  Plus,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, formatReadableDate, getTodayString } from '../../utils/dateUtils';
import { ActivityCategory } from '../../types';
import { exportActivityLogsCSV } from '../../utils/csvExport';

interface ActivityLogViewProps {
  onOpenQuickLog: () => void;
  onOpenInterruption: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  onOpenQuickLog,
}) => {
  const { activityLogs, deleteActivityLog, goals, projects, plannedTasks } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique available dates from logs
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(activityLogs.map((l) => l.date)));
    if (!dates.includes(getTodayString())) {
      dates.push(getTodayString());
    }
    return dates.sort().reverse();
  }, [activityLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (selectedDate && log.date !== selectedDate) return false;
      if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
      if (
        searchQuery &&
        !log.activityName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [activityLogs, selectedDate, categoryFilter, searchQuery]);

  // Summary metrics for the selected day
  const dayStats = useMemo(() => {
    const dayLogs = activityLogs.filter((l) => l.date === selectedDate);
    const focus = dayLogs
      .filter((l) => l.category === 'PRODUCTIVE')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const distract = dayLogs
      .filter((l) => l.category === 'DISTRACTION')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const resp = dayLogs
      .filter((l) => l.category === 'RESPONSIBILITY')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const rest = dayLogs
      .filter((l) => l.category === 'REST' || l.category === 'ENTERTAINMENT')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    return { focus, distract, resp, rest, total: focus + distract + resp + rest };
  }, [activityLogs, selectedDate]);

  const handleExportCSV = () => {
    exportActivityLogsCSV(activityLogs, goals, projects, plannedTasks);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Activity History & Timeline
            </h1>
            <span className="clay-pill px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {filteredLogs.length} Records
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            An accurate, non-judgmental record of where every hour went.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <div className="p-4.5 clay-card space-y-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="clay-input px-3.5 py-2 text-white text-xs focus:outline-none font-semibold cursor-pointer"
            >
              {availableDates.map((d) => (
                <option key={d} value={d} className="bg-[#141822] text-zinc-200">
                  {formatReadableDate(d)} {d === getTodayString() ? '(Today)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search activities or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-zinc-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Activities' },
            { id: 'PRODUCTIVE', label: 'Productive' },
            { id: 'RESPONSIBILITY', label: 'Responsibilities' },
            { id: 'DISTRACTION', label: 'Distraction' },
            { id: 'REST', label: 'Rest & Meals' },
            { id: 'PERSONAL', label: 'Personal' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'clay-nav-active'
                  : 'clay-card-interactive text-zinc-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="clay-card p-4 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Productive</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatMinutes(dayStats.focus)}</div>
        </div>
        <div className="clay-card p-4 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Responsibilities</div>
          <div className="text-xl font-extrabold text-purple-400 mt-1">{formatMinutes(dayStats.resp)}</div>
        </div>
        <div className="clay-card p-4 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Distraction</div>
          <div className="text-xl font-extrabold text-rose-400 mt-1">{formatMinutes(dayStats.distract)}</div>
        </div>
        <div className="clay-card p-4 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Rest / Meals</div>
          <div className="text-xl font-extrabold text-blue-400 mt-1">{formatMinutes(dayStats.rest)}</div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 clay-card text-center text-zinc-400 text-xs space-y-3 border-dashed font-medium">
            <div>No activity logs found for this date and filter.</div>
            <button
              onClick={onOpenQuickLog}
              className="clay-btn-secondary px-4 py-2 text-xs font-semibold"
            >
              Add First Activity Log
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const goal = goals.find((g) => g.id === log.goalId);
            const project = projects.find((p) => p.id === log.projectId);

            return (
              <div
                key={log.id}
                className="p-3.5 clay-card-sm flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
                      log.category === 'PRODUCTIVE'
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : log.category === 'DISTRACTION'
                        ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]'
                        : log.category === 'RESPONSIBILITY'
                        ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                        : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                    }`}
                  />

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.activityName}</span>
                      {log.isInterruption && (
                        <span className="clay-pill-purple px-2 py-0.5 text-[10px] font-bold">
                          {log.interruptionType?.replace('_', ' ') || 'Interruption'}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          log.category === 'PRODUCTIVE'
                            ? 'clay-pill-emerald'
                            : log.category === 'DISTRACTION'
                            ? 'clay-pill-rose'
                            : log.category === 'RESPONSIBILITY'
                            ? 'clay-pill-purple'
                            : 'clay-pill text-zinc-300'
                        }`}
                      >
                        {log.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1 font-medium">
                      {goal && <span className="text-emerald-400">🎯 {goal.name}</span>}
                      {project && <span className="text-blue-400">📁 {project.name}</span>}
                      {log.notes && <span className="italic text-zinc-400 truncate">&ldquo;{log.notes}&rdquo;</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-white text-sm">
                    {formatMinutes(log.durationMinutes)}
                  </span>
                  <button
                    onClick={() => deleteActivityLog(log.id)}
                    className="clay-btn-secondary p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
