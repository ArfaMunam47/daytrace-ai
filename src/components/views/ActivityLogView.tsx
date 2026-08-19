import React, { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  Download,
  Trash2,
  AlertCircle,
  Plus,
  Calendar,
  Sparkles,
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
  onOpenInterruption,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Activity History & Timeline
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
              {filteredLogs.length} Records
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            An accurate, non-judgmental record of where every hour went.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
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
              className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
          <span className="text-zinc-500 text-[11px] font-medium mr-1 flex items-center gap-1">
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                categoryFilter === cat.id
                  ? 'bg-zinc-700 text-white border-zinc-600'
                  : 'bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Productive</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{formatMinutes(dayStats.focus)}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Responsibilities</div>
          <div className="text-xl font-bold text-purple-400 mt-0.5">{formatMinutes(dayStats.resp)}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Distraction</div>
          <div className="text-xl font-bold text-rose-400 mt-0.5">{formatMinutes(dayStats.distract)}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Rest / Meals</div>
          <div className="text-xl font-bold text-blue-400 mt-0.5">{formatMinutes(dayStats.rest)}</div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs space-y-2">
            <div>No activity logs found for this date and filter.</div>
            <button
              onClick={onOpenQuickLog}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition"
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
                className="p-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between gap-3 text-xs transition shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      log.category === 'PRODUCTIVE'
                        ? 'bg-emerald-400'
                        : log.category === 'DISTRACTION'
                        ? 'bg-rose-400'
                        : log.category === 'RESPONSIBILITY'
                        ? 'bg-purple-400'
                        : 'bg-blue-400'
                    }`}
                  />

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100">{log.activityName}</span>
                      {log.isInterruption && (
                        <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] rounded font-medium border border-purple-500/40">
                          {log.interruptionType?.replace('_', ' ') || 'Interruption'}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          log.category === 'PRODUCTIVE'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : log.category === 'DISTRACTION'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : log.category === 'RESPONSIBILITY'
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {log.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      {goal && <span className="text-emerald-400">🎯 {goal.name}</span>}
                      {project && <span className="text-blue-400">📁 {project.name}</span>}
                      {log.notes && <span className="italic text-zinc-400 truncate">&ldquo;{log.notes}&rdquo;</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-zinc-200 text-sm">
                    {formatMinutes(log.durationMinutes)}
                  </span>
                  <button
                    onClick={() => deleteActivityLog(log.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition cursor-pointer"
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
