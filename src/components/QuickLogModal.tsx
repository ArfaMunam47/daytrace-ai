import React, { useState } from 'react';
import { X, ArrowLeft, Clock, Check, Sparkles, Target, FolderKanban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_ACTIVITIES: { name: string; category: ActivityCategory; icon: string; desc: string }[] = [
  { name: 'Development & Coding', category: 'PRODUCTIVE', icon: '💻', desc: 'Deep work & engineering' },
  { name: 'Study & Reading', category: 'PRODUCTIVE', icon: '📚', desc: 'Learning & skill growth' },
  { name: 'System Design / Planning', category: 'PRODUCTIVE', icon: '📐', desc: 'Architecture & roadmapping' },
  { name: 'Content & Writing', category: 'PERSONAL', icon: '🎥', desc: 'Creative output & blogging' },
  { name: 'Networking & Outreach', category: 'PERSONAL', icon: '🌐', desc: 'Connecting with people' },
  { name: 'Video / Social Media', category: 'DISTRACTION', icon: '▶️', desc: 'Passive entertainment' },
  { name: 'Gaming / Discord', category: 'ENTERTAINMENT', icon: '🎮', desc: 'Leisure & recreation' },
  { name: 'Family Responsibility', category: 'RESPONSIBILITY', icon: '👨‍👩‍👧', desc: 'Caring for loved ones' },
  { name: 'Household Chores', category: 'RESPONSIBILITY', icon: '🧹', desc: 'Home maintenance' },
  { name: 'Meal & Nutrition', category: 'REST', icon: '🥗', desc: 'Eating & cooking' },
  { name: 'Physical Workout / Walk', category: 'RESPONSIBILITY', icon: '🏃', desc: 'Health & exercise' },
  { name: 'Rest / Power Nap', category: 'REST', icon: '☕', desc: 'Recovery & recharging' },
];

const PRESET_DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];

const CATEGORY_DETAILS: { id: ActivityCategory; label: string; badgeClass: string; desc: string }[] = [
  { id: 'PRODUCTIVE', label: 'Productive', badgeClass: 'clay-pill-emerald', desc: 'Focused study, work, coding' },
  { id: 'RESPONSIBILITY', label: 'Responsibility', badgeClass: 'clay-pill-teal', desc: 'Family, chores, health' },
  { id: 'PERSONAL', label: 'Personal', badgeClass: 'clay-pill-amber', desc: 'Self-care, writing, admin' },
  { id: 'REST', label: 'Rest', badgeClass: 'clay-pill', desc: 'Sleep, meals, breaks' },
  { id: 'DISTRACTION', label: 'Distraction', badgeClass: 'clay-pill-rose', desc: 'Social feeds, passive browsing' },
  { id: 'ENTERTAINMENT', label: 'Fun / Play', badgeClass: 'clay-pill-amber', desc: 'Intentional gaming, movies' },
];

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
    <div
      id="quicklog-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quicklog-modal-title"
    >
      <div
        id="quicklog-modal-card"
        className="clay-modal w-full max-w-lg my-auto relative flex flex-col max-h-[92vh] border-emerald-500/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_4px_16px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header with Back Button & Close */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/5 bg-gradient-to-r from-emerald-950/70 via-[#121924] to-[#0f131a] flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer min-h-[36px]"
              title="Go back to previous screen"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-white/10 mx-0.5" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 id="quicklog-modal-title" className="font-bold text-white text-sm leading-tight">
                  Quick Activity Log
                </h3>
                <p className="text-[10.5px] text-emerald-300/80 font-medium">Record what actually happened today</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close dialog"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body with Visible Refined Scrollbar */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs scrollbar-thin">
          {/* Preset Buttons Grid */}
          <div>
            <label className="block text-zinc-200 font-bold text-xs mb-2">
              1. Choose a quick activity (or enter your own below):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {COMMON_ACTIVITIES.map((act) => {
                const isSelected = activityName === act.name;
                return (
                  <button
                    type="button"
                    key={act.name}
                    onClick={() => handleSelectPresetActivity(act)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400/60 shadow-[0_2px_8px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] text-white'
                        : 'bg-[#121620] border-white/5 hover:border-white/15 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base shrink-0">{act.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs truncate ${isSelected ? 'font-bold text-emerald-300' : 'font-medium'}`}>
                        {act.name}
                      </div>
                      <div className="text-[9.5px] text-zinc-400 truncate">{act.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Name Input */}
          <div>
            <label className="block text-zinc-200 font-bold text-xs mb-1.5">
              2. Activity Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Building feature, studying React, meal with family..."
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-zinc-200 font-bold text-xs mb-1.5">
              3. Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORY_DETAILS.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-left transition cursor-pointer border flex flex-col justify-between ${
                      isSelected
                        ? `${cat.badgeClass} border-transparent font-bold text-white shadow-sm`
                        : 'bg-[#121620] border-white/5 hover:border-white/15 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{cat.label}</div>
                    <div className="text-[9.5px] opacity-75 truncate mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-200 font-bold text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Duration</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {customDuration ? `${customDuration} min` : duration >= 60 ? `${duration / 60} hour(s)` : `${duration} minutes`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_DURATIONS.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => {
                    setDuration(dur);
                    setCustomDuration('');
                  }}
                  className={`py-1.5 px-2.5 rounded-xl font-bold transition cursor-pointer text-xs min-h-[32px] ${
                    duration === dur && !customDuration
                      ? 'clay-btn-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]'
                      : 'clay-btn-secondary text-zinc-300 hover:text-white'
                  }`}
                >
                  {dur >= 60 ? `${dur / 60}h` : `${dur}m`}
                </button>
              ))}
              <div className="relative flex items-center ml-auto">
                <input
                  type="number"
                  min="1"
                  max="720"
                  placeholder="Custom min"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="clay-input w-28 px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none placeholder-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Goal & Project Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-zinc-300 font-bold text-xs mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connect Goal (Optional)</span>
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="clay-input w-full px-3 py-2 text-zinc-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="" className="bg-[#121620] text-zinc-300">None / General</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#121620] text-zinc-200">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-300 font-bold text-xs mb-1 flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
                <span>Connect Project (Optional)</span>
              </label>
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
            <label className="block text-zinc-200 font-bold text-xs mb-1.5">
              5. Accomplishments / Reflection (Optional)
            </label>
            <input
              type="text"
              placeholder="What did you get done or notice about your focus?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs"
            />
          </div>

          {/* Sticky Bottom Actions inside form */}
          <div className="pt-3 pb-1 flex items-center justify-between border-t border-white/5 sticky bottom-0 bg-[#121620]/95 backdrop-blur-sm -mx-4 -mb-4 px-4 sm:-mx-6 sm:-mb-6 sm:px-6 py-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white min-h-[38px] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel / Back</span>
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="clay-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50 min-h-[38px] shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved to DayTrace!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100" />
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
