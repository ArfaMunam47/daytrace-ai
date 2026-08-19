import React, { useState } from 'react';
import { X, Clock, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_ACTIVITIES: { name: string; category: ActivityCategory; icon: string }[] = [
  { name: 'Development & Coding', category: 'PRODUCTIVE', icon: '💻' },
  { name: 'Study & Reading', category: 'PRODUCTIVE', icon: '📚' },
  { name: 'System Design / CS', category: 'PRODUCTIVE', icon: '📐' },
  { name: 'Content & Scripting', category: 'PERSONAL', icon: '🎥' },
  { name: 'LinkedIn & Networking', category: 'DISTRACTION', icon: '🌐' },
  { name: 'YouTube / Videos', category: 'DISTRACTION', icon: '▶️' },
  { name: 'Gaming / Discord', category: 'ENTERTAINMENT', icon: '🎮' },
  { name: 'Family Responsibility', category: 'RESPONSIBILITY', icon: '👨‍👩‍👧' },
  { name: 'Household Chores', category: 'RESPONSIBILITY', icon: '🧹' },
  { name: 'Meal & Hydration', category: 'REST', icon: '🥗' },
  { name: 'Walk / Physical Workout', category: 'RESPONSIBILITY', icon: '🏃' },
  { name: 'Rest / Power Nap', category: 'REST', icon: '☕' },
];

const PRESET_DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose }) => {
  const { quickLogActivity, goals, projects } = useApp();

  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('PRODUCTIVE');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSelectPresetActivity = (act: { name: string; category: ActivityCategory }) => {
    setActivityName(act.name);
    setCategory(act.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDuration = customDuration ? parseInt(customDuration, 10) : duration;
    if (!activityName.trim() || isNaN(finalDuration) || finalDuration <= 0) return;

    quickLogActivity(
      activityName.trim(),
      category,
      finalDuration,
      notes.trim() || undefined,
      selectedGoalId || undefined,
      selectedProjectId || undefined
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      // Reset form
      setActivityName('');
      setNotes('');
      setCustomDuration('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">Quick Activity Log</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-zinc-400 font-medium mb-2">What happened? (Select or type)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {COMMON_ACTIVITIES.map((act) => {
                const isSelected = activityName === act.name;
                return (
                  <button
                    type="button"
                    key={act.name}
                    onClick={() => handleSelectPresetActivity(act)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-left transition border ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-medium'
                        : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{act.icon}</span>
                    <span className="truncate">{act.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Name Input */}
          <div>
            <input
              type="text"
              required
              placeholder="e.g. Building Next.js authentication flow..."
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {(
                [
                  'PRODUCTIVE',
                  'RESPONSIBILITY',
                  'PERSONAL',
                  'ENTERTAINMENT',
                  'DISTRACTION',
                  'REST',
                ] as ActivityCategory[]
              ).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition border text-center ${
                    category === cat
                      ? cat === 'PRODUCTIVE'
                        ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                        : cat === 'DISTRACTION'
                        ? 'bg-rose-900/60 border-rose-500 text-rose-300'
                        : cat === 'RESPONSIBILITY'
                        ? 'bg-purple-900/60 border-purple-500 text-purple-300'
                        : 'bg-blue-900/60 border-blue-500 text-blue-300'
                      : 'bg-zinc-800 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Chips */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Duration</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_DURATIONS.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => {
                    setDuration(dur);
                    setCustomDuration('');
                  }}
                  className={`py-1 px-2.5 rounded-lg font-medium transition border ${
                    duration === dur && !customDuration
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                  }`}
                >
                  {dur >= 60 ? `${dur / 60}h` : `${dur}m`}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="720"
                placeholder="Custom (m)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Goal / Project Link (Optional) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Goal (Optional)</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
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
                className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
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

          {/* Notes Input */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1">Accomplishment / Notes (Optional)</label>
            <input
              type="text"
              placeholder="What did you get done or notice?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Logged!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
