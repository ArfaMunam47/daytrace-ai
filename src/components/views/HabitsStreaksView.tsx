import React, { useState } from 'react';
import {
  Flame,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, getPastDaysList } from '../../utils/dateUtils';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Habits & Consistency Tracking
            </h1>
            <span className="clay-pill-amber px-2.5 py-0.5 text-xs font-bold">
              Consistency &gt; Perfection
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Build sustainable momentum. Missing a single day never ruins your long-term progress.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
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
              className="p-5 sm:p-6 clay-card space-y-4 text-xs"
            >
              {/* Top Row: Habit Name, Streak, Actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm text-white">{habit.name}</h3>
                    <div className="clay-pill-amber flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold">
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{habit.streakCount} day streak</span>
                    </div>
                  </div>
                  {habit.description && (
                    <p className="text-zinc-400 text-xs mt-1 font-medium">{habit.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400 font-mono">
                      {consistencyPercent}%
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">14-Day Consistency</div>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="clay-btn-secondary p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 14-Day Visual Check-in Grid */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                  <span>Last 14 Days Check-In:</span>
                  <span className="text-zinc-400 text-[10px] font-medium">
                    Completed {checkedInPast14} of last 14 days • Best streak: {habit.bestStreak}d
                  </span>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
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
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
                          isChecked
                            ? 'clay-btn-primary text-white font-extrabold shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
                            : isToday
                            ? 'clay-card-interactive border-amber-500/60 text-white font-bold'
                            : 'clay-card-sm text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold opacity-75">
                          {dayLabel}
                        </span>
                        <span className="text-xs font-mono">{dateNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row Fast Check Today */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Target: {habit.frequencyPerWeek} days / week
                </span>
                <button
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isCompletedToday
                      ? 'clay-btn-secondary text-zinc-300'
                      : 'clay-btn-primary'
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-extrabold text-white text-sm">Add New Daily Habit</h3>
            <form onSubmit={handleAddHabit} className="space-y-3.5">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages, Code algorithms, Morning walk..."
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 15 minutes of uninterrupted deep reading..."
                  value={habitDesc}
                  onChange={(e) => setHabitDesc(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Target Days Per Week</label>
                <select
                  value={habitTarget}
                  onChange={(e) => setHabitTarget(Number(e.target.value))}
                  className="clay-input w-full px-3.5 py-2.5 text-zinc-200 text-xs focus:outline-none min-h-[38px] cursor-pointer"
                >
                  <option value={7} className="bg-[#141822] text-zinc-200">Daily (7 days / week)</option>
                  <option value={6} className="bg-[#141822] text-zinc-200">6 days / week</option>
                  <option value={5} className="bg-[#141822] text-zinc-200">Weekdays (5 days / week)</option>
                  <option value={4} className="bg-[#141822] text-zinc-200">4 days / week</option>
                  <option value={3} className="bg-[#141822] text-zinc-200">3 days / week</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-5 py-2 font-bold text-xs"
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
