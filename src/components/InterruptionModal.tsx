import React, { useState } from 'react';
import { X, ArrowLeft, AlertCircle, HeartHandshake, Check, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterruptionType } from '../types';

interface InterruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTERRUPTION_TYPES: { type: InterruptionType; label: string; subLabel: string; icon: string; defaultName: string }[] = [
  { type: 'family', label: 'Family & Loved Ones', subLabel: 'Care, assistance, parenting', icon: '👨‍👩‍👧', defaultName: 'Family care & support' },
  { type: 'household', label: 'Home & Chores', subLabel: 'Cleaning, deliveries, repairs', icon: '🧹', defaultName: 'Household chore / cleaning' },
  { type: 'visitor', label: 'Visitors & People', subLabel: 'Unexpected guests, neighbors', icon: '🚪', defaultName: 'Visitor / conversation' },
  { type: 'phone_call', label: 'Calls & Messages', subLabel: 'Important phone call, errand', icon: '📞', defaultName: 'Important phone call' },
  { type: 'meal', label: 'Meal & Cooking', subLabel: 'Preparing food, eating together', icon: '🍲', defaultName: 'Meal preparation' },
  { type: 'unexpected_work', label: 'Urgent Work Request', subLabel: 'Unplanned emergency priority', icon: '💼', defaultName: 'Urgent unplanned work' },
  { type: 'emergency', label: 'Health & Urgent Issue', subLabel: 'Medical or immediate need', icon: '🚑', defaultName: 'Emergency response' },
  { type: 'other', label: 'Other Real-Life Event', subLabel: 'Life happening in the moment', icon: '⏳', defaultName: 'Unplanned responsibility' },
];

const PRESET_MINUTES = [10, 15, 20, 25, 30, 45, 60, 90];

export const InterruptionModal: React.FC<InterruptionModalProps> = ({ isOpen, onClose }) => {
  const { quickLogInterruption } = useApp();

  const [selectedType, setSelectedType] = useState<InterruptionType>('family');
  const [activityName, setActivityName] = useState('Family care & support');
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
    <div
      id="interruption-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interruption-modal-title"
    >
      <div
        id="interruption-modal-card"
        className="clay-modal w-full max-w-lg my-auto relative flex flex-col max-h-[92vh] border-emerald-500/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_4px_16px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header with Back Button and Close Button */}
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
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 id="interruption-modal-title" className="font-bold text-white text-sm leading-tight">
                  Record Real-Life Interruption
                </h3>
                <p className="text-[10.5px] text-emerald-300/80 font-medium">Life happens — record it honestly without guilt</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs scrollbar-thin">
          {/* Philosophy Guidance Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-[#121a24] border border-emerald-500/30 rounded-2xl flex items-start gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11.5px] text-emerald-100 leading-relaxed font-medium">
              <span className="font-bold text-emerald-300">Never a failure:</span> Family care, home emergencies, and personal responsibilities are essential parts of real life. Recording them gives you truth without guilt.
            </div>
          </div>

          {/* Interruption Types Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-200 font-bold text-xs flex items-center gap-1.5">
                <span>1. What happened?</span>
                <span className="text-[10px] text-zinc-400 font-normal">(Choose closest match)</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTERRUPTION_TYPES.map((item) => {
                const isSelected = selectedType === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => handleSelectType(item)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400/60 shadow-[0_2px_8px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] text-white'
                        : 'bg-[#121620] border-white/5 hover:border-white/15 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs truncate ${isSelected ? 'font-bold text-emerald-300' : 'font-medium'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{item.subLabel}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Label */}
          <div>
            <label className="block text-zinc-200 font-bold text-xs mb-1.5">
              2. Activity Description
            </label>
            <input
              type="text"
              required
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g. Assisted family member, resolved kitchen leak..."
              className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-xs font-medium"
            />
          </div>

          {/* Time Consumed / Duration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-200 font-bold text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Time Consumed</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {customDuration ? `${customDuration} min` : duration >= 60 ? `${duration / 60} hour(s)` : `${duration} minutes`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_MINUTES.map((dur) => (
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

          {/* Optional Notes */}
          <div>
            <label className="block text-zinc-200 font-bold text-xs mb-1.5">
              4. Additional Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="What happened or what should you adjust next time?"
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
