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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-purple-500/40 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">Record Real-Life Interruption</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Philosophy Card Banner */}
        <div className="px-5 pt-4">
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-purple-200 leading-relaxed">
              <span className="font-semibold text-purple-300">Not a failure.</span> Life, family, and home responsibilities are essential parts of living. Recording them helps you know where your hours went without unrealistic guilt.
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Interruption Types */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Interruption Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {INTERRUPTION_TYPES.map((item) => {
                const isSelected = selectedType === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => handleSelectType(item)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition border ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/70 text-purple-200 font-medium'
                        : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1">Activity Label</label>
            <input
              type="text"
              required
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          {/* Duration Chips */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Time Consumed</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_MINUTES.map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => {
                    setDuration(dur);
                    setCustomDuration('');
                  }}
                  className={`py-1 px-2.5 rounded-lg font-medium transition border ${
                    duration === dur && !customDuration
                      ? 'bg-purple-600 border-purple-500 text-white'
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
                className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1">Context / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cleaned kitchen & handled grocery delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          {/* Footer */}
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Recorded!</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
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
