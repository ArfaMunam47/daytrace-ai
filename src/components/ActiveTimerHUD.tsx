import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, AlertTriangle, PlusCircle, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/dateUtils';

export const ActiveTimerHUD: React.FC = () => {
  const {
    activeTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
    cancelTimer,
    addExtraTimeToTimer,
  } = useApp();

  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [showAccomplishmentModal, setShowAccomplishmentModal] = useState<boolean>(false);
  const [accomplishmentNote, setAccomplishmentNote] = useState<string>('');

  useEffect(() => {
    if (!activeTimer) {
      setElapsedSec(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const pausedMs = activeTimer.pausedAt
        ? activeTimer.totalPausedMs + (now - activeTimer.pausedAt)
        : activeTimer.totalPausedMs;
      const ms = Math.max(0, now - activeTimer.startedAt - pausedMs);
      setElapsedSec(Math.floor(ms / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [activeTimer]);

  if (!activeTimer) return null;

  const totalPlannedSec = activeTimer.plannedMinutes * 60;
  const isOvertime = elapsedSec > totalPlannedSec;
  const remainingSec = Math.max(0, totalPlannedSec - elapsedSec);
  const overageSec = Math.max(0, elapsedSec - totalPlannedSec);

  const formatHMS = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isDistraction = activeTimer.category === 'DISTRACTION' || activeTimer.isDistractionBoundary;
  const is5MinWarning = !isOvertime && remainingSec <= 300 && remainingSec > 0;
  const isLimitReached = isOvertime && isDistraction;

  const handleFinishClick = () => {
    setShowAccomplishmentModal(true);
  };

  const handleConfirmFinish = () => {
    finishTimer(accomplishmentNote.trim() || undefined);
    setShowAccomplishmentModal(false);
    setAccomplishmentNote('');
  };

  return (
    <>
      {/* Floating HUD Sticky at Top or Bottom */}
      <div className="fixed top-14 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto max-w-sm sm:w-full z-40 animate-in slide-in-from-top-4 duration-300">
        <div
          className={`p-4 rounded-3xl backdrop-blur-xl transition-all ${
            isLimitReached
              ? 'clay-card border-rose-500/50 bg-gradient-to-b from-[#2a1218] to-[#1a0c10] shadow-[0_16px_36px_rgba(225,29,72,0.35)] text-rose-100'
              : is5MinWarning
              ? 'clay-card border-amber-500/50 bg-gradient-to-b from-[#281c10] to-[#181008] shadow-[0_16px_36px_rgba(217,119,6,0.35)] text-amber-100'
              : isDistraction
              ? 'clay-card border-rose-500/30'
              : 'clay-card border-emerald-500/30'
          }`}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  activeTimer.status === 'paused'
                    ? 'bg-amber-400'
                    : isLimitReached
                    ? 'bg-rose-400 animate-ping'
                    : isDistraction
                    ? 'bg-rose-400 animate-pulse'
                    : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                }`}
              />
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  {isDistraction ? 'Distraction Boundary' : 'Focus Session'}
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {activeTimer.taskName}
                </span>
              </div>
            </div>

            <button
              onClick={cancelTimer}
              title="Cancel Session"
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Warning Messages */}
          {is5MinWarning && (
            <div className="mb-2.5 p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 flex items-center gap-2 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You have 5 minutes remaining on this session.</span>
            </div>
          )}

          {isLimitReached && (
            <div className="mb-2.5 p-2.5 bg-gradient-to-r from-rose-500/20 to-rose-700/10 border border-rose-500/40 rounded-2xl text-[11px] text-rose-200 space-y-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-1.5 font-bold text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Your planned {activeTimer.taskName} time is complete!</span>
              </div>
              <div className="text-[10px] text-rose-300/90 font-medium">
                Overage: +{formatMinutes(Math.ceil(overageSec / 60))} (All time is logged honestly)
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={handleFinishClick}
                  className="clay-btn-danger px-2.5 py-1 text-[10px] font-bold"
                >
                  End Session Now
                </button>
                <button
                  onClick={() => addExtraTimeToTimer(5)}
                  className="clay-btn-secondary px-2.5 py-1 text-[10px] font-medium"
                >
                  +5m
                </button>
                <button
                  onClick={() => addExtraTimeToTimer(10)}
                  className="clay-btn-secondary px-2.5 py-1 text-[10px] font-medium"
                >
                  +10m
                </button>
              </div>
            </div>
          )}

          {/* Time Displays */}
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div>
              <div className="text-2xl font-mono font-extrabold tracking-tight text-white">
                {formatHMS(elapsedSec)}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Planned: {formatMinutes(activeTimer.plannedMinutes)}
              </div>
            </div>

            <div className="text-right">
              {isOvertime ? (
                <div className="text-rose-400 font-mono text-sm font-bold">
                  +{formatHMS(overageSec)} over
                </div>
              ) : (
                <div className="text-emerald-400 font-mono text-sm font-bold">
                  {formatHMS(remainingSec)} left
                </div>
              )}
              <div className="text-[10px] text-zinc-400 capitalize font-medium">
                Status: {activeTimer.status}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="clay-inset w-full h-2 rounded-full p-0.5 overflow-hidden mb-3.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOvertime
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : isDistraction
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`}
              style={{
                width: `${Math.min(100, (elapsedSec / totalPlannedSec) * 100)}%`,
              }}
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {activeTimer.status === 'running' ? (
              <button
                onClick={pauseTimer}
                className="clay-btn-secondary flex-1 py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="clay-btn-primary flex-1 py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={() => addExtraTimeToTimer(10)}
              title="Add 10 minutes to planned time"
              className="clay-btn-secondary py-2 px-2.5 flex items-center gap-1 text-[11px] font-semibold min-h-[36px]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>+10m</span>
            </button>

            <button
              onClick={handleFinishClick}
              className="clay-btn-primary py-2 px-3.5 font-bold flex items-center gap-1.5 min-h-[36px]"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Finish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accomplishment Prompt Modal on Finish */}
      {showAccomplishmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Session Complete</h4>
                <p className="text-xs text-zinc-400">
                  {formatMinutes(Math.max(1, Math.round(elapsedSec / 60)))} logged on{' '}
                  <span className="text-emerald-300 font-semibold">{activeTimer.taskName}</span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-zinc-200 font-semibold text-xs mb-2">
                What did you accomplish during this session?
              </label>
              <textarea
                autoFocus
                rows={3}
                placeholder="e.g. Completed authentication UI, fixed header responsiveness..."
                value={accomplishmentNote}
                onChange={(e) => setAccomplishmentNote(e.target.value)}
                className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 text-xs">
              <button
                onClick={() => setShowAccomplishmentModal(false)}
                className="clay-btn-secondary px-3.5 py-2 text-xs"
              >
                Keep Running
              </button>
              <button
                onClick={handleConfirmFinish}
                className="clay-btn-primary px-4 py-2 font-bold text-xs"
              >
                Save & Record History
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
