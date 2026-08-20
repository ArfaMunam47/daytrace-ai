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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-modal w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quick Activity Log</h3>
              <p className="text-[11px] text-zinc-400">Record past activity seamlessly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-2">What happened? (Select or type)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {COMMON_ACTIVITIES.map((act) => {
                const isSelected = activityName === act.name;
                return (
                  <button
                    type="button"
                    key={act.name}
                    onClick={() => handleSelectPresetActivity(act)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'clay-nav-active font-bold text-emerald-300'
                        : 'clay-card-interactive text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{act.icon}</span>
                    <span className="truncate text-xs font-medium">{act.name}</span>
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
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
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
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center cursor-pointer ${
                    category === cat
                      ? cat === 'PRODUCTIVE'
                        ? 'clay-pill-emerald'
                        : cat === 'DISTRACTION'
                        ? 'clay-pill-rose'
                        : cat === 'RESPONSIBILITY'
                        ? 'clay-pill-purple'
                        : 'clay-pill-amber'
                      : 'clay-card-sm text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Chips */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Duration</label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_DURATIONS.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => {
                    setDuration(dur);
                    setCustomDuration('');
                  }}
                  className={`py-1.5 px-3 rounded-xl font-bold transition cursor-pointer text-xs ${
                    duration === dur && !customDuration
                      ? 'clay-btn-primary text-white'
                      : 'clay-btn-secondary text-zinc-300'
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
                className="clay-input w-28 px-3 py-1.5 text-white text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Goal / Project Link (Optional) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Goal (Optional)</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="clay-input w-full px-3 py-2 text-zinc-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="" className="bg-[#121620] text-zinc-300">None / Unassigned</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#121620] text-zinc-200">
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
                className="clay-input w-full px-3 py-2 text-zinc-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="" className="bg-[#121620] text-zinc-300">None / Standalone</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#121620] text-zinc-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Accomplishment / Notes (Optional)</label>
            <input
              type="text"
              placeholder="What did you get done or notice?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="clay-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Logged!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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
