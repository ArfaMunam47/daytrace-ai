import React, { useState } from 'react';
import {
  Flame,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, getPastDaysList, formatReadableDate } from '../../utils/dateUtils';
import { Habit } from '../../types';

export const HabitsStreaksView: React.FC = () => {
  const { habits, addHabit, toggleHabitDate, deleteHabit } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitTarget, setHabitTarget] = useState<number>(7);

  const past14Days = getPastDaysList(14);
  const todayStr = getTodayString();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    addHabit({
      name: habitName.trim(),
      description: habitDesc.trim() || undefined,
      frequencyPerWeek: habitTarget,
    });

    setHabitName('');
    setHabitDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Habits & Consistency Tracking
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/40">
              Consistency &gt; Perfection
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build sustainable momentum. Missing a single day never ruins your long-term progress.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habit Cards */}
      <div className="space-y-4">
        {habits.map((habit) => {
          // Calculate consistency over last 14 days
          const checkedInPast14 = habit.completedDates.filter((d) =>
            past14Days.includes(d)
          ).length;
          const consistencyPercent = Math.round((checkedInPast14 / 14) * 100);
          const isCompletedToday = habit.completedDates.includes(todayStr);

          return (
            <div
              key={habit.id}
              className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 text-xs shadow-xs"
            >
              {/* Top Row: Habit Name, Streak, Actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-sm text-zinc-100">{habit.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      <span>{habit.streakCount} day streak</span>
                    </div>
                  </div>
                  {habit.description && (
                    <p className="text-zinc-400 text-xs mt-1">{habit.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {consistencyPercent}%
                    </div>
                    <div className="text-[10px] text-zinc-400">14-Day Consistency</div>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-zinc-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 14-Day Visual Check-in Grid */}
              <div>
                <div className="text-[11px] font-medium text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Last 14 Days Check-In:</span>
                  <span className="text-zinc-500 text-[10px]">
                    Completed {checkedInPast14} of last 14 days • Best streak: {habit.bestStreak}d
                  </span>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                  {past14Days.map((dateStr) => {
                    const isChecked = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === todayStr;
                    const dayLabel = new Date(dateStr).toLocaleDateString('en-US', {
                      weekday: 'narrow',
                    });
                    const dateNum = dateStr.split('-')[2];

                    return (
                      <button
                        key={dateStr}
                        onClick={() => toggleHabitDate(habit.id, dateStr)}
                        title={`${dateStr}: ${isChecked ? 'Completed' : 'Missed'} (Click to toggle)`}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center transition cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                            : isToday
                            ? 'bg-zinc-800 border-amber-500/60 text-zinc-200'
                            : 'bg-zinc-800/40 border-zinc-750 text-zinc-500 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-semibold opacity-70">
                          {dayLabel}
                        </span>
                        <span className="text-xs">{dateNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row Fast Check Today */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  Target: {habit.frequencyPerWeek} days / week
                </span>
                <button
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isCompletedToday
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isCompletedToday ? 'Done Today (Click to undo)' : 'Check In Today'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-semibold text-zinc-100 text-sm">Add New Daily Habit</h3>
            <form onSubmit={handleAddHabit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages, Code algorithms, Morning walk..."
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 15 minutes of uninterrupted deep reading..."
                  value={habitDesc}
                  onChange={(e) => setHabitDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Days Per Week</label>
                <select
                  value={habitTarget}
                  onChange={(e) => setHabitTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value={7}>Daily (7 days / week)</option>
                  <option value={6}>6 days / week</option>
                  <option value={5}>Weekdays (5 days / week)</option>
                  <option value={4}>4 days / week</option>
                  <option value={3}>3 days / week</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
