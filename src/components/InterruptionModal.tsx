import React, { useState } from 'react';
import { X, AlertCircle, HeartHandshake, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterruptionType } from '../types';

interface InterruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTERRUPTION_TYPES: { type: InterruptionType; label: string; icon: string; defaultName: string }[] = [
  { type: 'family', label: 'Family Responsibility', icon: '👨‍👩‍👦', defaultName: 'Family support / care' },
  { type: 'household', label: 'Household & Chores', icon: '🧹', defaultName: 'Household chore / cleaning' },
  { type: 'visitor', label: 'Unexpected Visitor', icon: '🚪', defaultName: 'Visitor / conversation' },
  { type: 'phone_call', label: 'Important Phone Call', icon: '📞', defaultName: 'Phone call / errand' },
  { type: 'meal', label: 'Meal Prep / Cooking', icon: '🍲', defaultName: 'Meal preparation' },
  { type: 'unexpected_work', label: 'Work Emergency / Task', icon: '💼', defaultName: 'Urgent unplanned work' },
  { type: 'emergency', label: 'Urgent / Health Issue', icon: '🚑', defaultName: 'Emergency response' },
  { type: 'other', label: 'Other Real-Life Event', icon: '⏳', defaultName: 'Unplanned responsibility' },
];

const PRESET_MINUTES = [10, 15, 20, 25, 30, 45, 60, 90];

export const InterruptionModal: React.FC<InterruptionModalProps> = ({ isOpen, onClose }) => {
  const { quickLogInterruption } = useApp();

  const [selectedType, setSelectedType] = useState<InterruptionType>('family');
  const [activityName, setActivityName] = useState('Family support / care');
  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSelectType = (item: typeof INTERRUPTION_TYPES[0]) => {
    setSelectedType(item.type);
    setActivityName(item.defaultName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDuration = customDuration ? parseInt(customDuration, 10) : duration;
    if (isNaN(finalDuration) || finalDuration <= 0) return;

    quickLogInterruption(
      selectedType,
      activityName.trim() || 'Real-life responsibility',
      finalDuration,
      notes.trim() || undefined
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      setNotes('');
      setCustomDuration('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-modal w-full max-w-lg border-purple-500/30 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/5 bg-gradient-to-r from-purple-950/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 border border-white/30 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Record Real-Life Interruption</h3>
              <p className="text-[11px] text-zinc-400">Honest logging without shame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Philosophy Card Banner */}
        <div className="px-6 pt-5">
          <div className="p-3.5 bg-gradient-to-r from-purple-950/50 to-[#1e172a] border border-purple-500/30 rounded-2xl flex items-start gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-purple-200 leading-relaxed">
              <span className="font-bold text-purple-300">Not a failure.</span> Life, family, and home responsibilities are essential parts of living. Recording them helps you know where your hours went without unrealistic guilt.
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Interruption Types */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-2">Interruption Type</label>
            <div className="grid grid-cols-2 gap-2">
              {INTERRUPTION_TYPES.map((item) => {
                const isSelected = selectedType === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => handleSelectType(item)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'clay-pill-purple font-bold'
                        : 'clay-card-interactive text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Activity Label</label>
            <input
              type="text"
              required
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs font-medium"
            />
          </div>

          {/* Duration Chips */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Time Consumed</label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_MINUTES.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => {
                    setDuration(dur);
                    setCustomDuration('');
                  }}
                  className={`py-1.5 px-3 rounded-xl font-bold transition cursor-pointer text-xs ${
                    duration === dur && !customDuration
                      ? 'clay-btn-purple text-white'
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

          {/* Notes */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Context / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cleaned kitchen & handled grocery delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs"
            />
          </div>

          {/* Footer */}
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
              className="clay-btn-purple px-5 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Recorded!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Record Responsibility</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
