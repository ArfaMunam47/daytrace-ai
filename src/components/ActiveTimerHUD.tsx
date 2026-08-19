import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, AlertTriangle, Clock, PlusCircle, CheckCircle2, X } from 'lucide-react';
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
          className={`p-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-colors ${
            isLimitReached
              ? 'bg-rose-950/95 border-rose-500/70 text-rose-100'
              : is5MinWarning
              ? 'bg-amber-950/95 border-amber-500/70 text-amber-100'
              : isDistraction
              ? 'bg-zinc-900/95 border-rose-500/40 text-zinc-100'
              : 'bg-zinc-900/95 border-emerald-500/40 text-zinc-100'
          }`}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  activeTimer.status === 'paused'
                    ? 'bg-amber-400'
                    : isLimitReached
                    ? 'bg-rose-400 animate-ping'
                    : isDistraction
                    ? 'bg-rose-400 animate-pulse'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  {isDistraction ? 'Distraction Boundary' : 'Focus Session'}
                </span>
                <span className="text-xs font-semibold text-zinc-100 truncate block">
                  {activeTimer.taskName}
                </span>
              </div>
            </div>

            <button
              onClick={cancelTimer}
              title="Cancel Session"
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Warning Messages */}
          {is5MinWarning && (
            <div className="mb-2 p-1.5 bg-amber-500/20 border border-amber-500/40 rounded text-[11px] text-amber-200 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>You have 5 minutes remaining on this session.</span>
            </div>
          )}

          {isLimitReached && (
            <div className="mb-2 p-2 bg-rose-500/20 border border-rose-500/50 rounded text-[11px] text-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Your planned {activeTimer.taskName} time is complete!</span>
              </div>
              <div className="text-[10px] text-rose-300/80">
                Overage: +{formatMinutes(Math.ceil(overageSec / 60))} (All time is logged honestly)
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={handleFinishClick}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                >
                  End Session Now
                </button>
                <button
                  onClick={() => addExtraTimeToTimer(5)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-[10px] cursor-pointer"
                >
                  +5m
                </button>
                <button
                  onClick={() => addExtraTimeToTimer(10)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-[10px] cursor-pointer"
                >
                  +10m
                </button>
              </div>
            </div>
          )}

          {/* Time Displays */}
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div>
              <div className="text-2xl font-mono font-bold tracking-tight text-zinc-100">
                {formatHMS(elapsedSec)}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Planned: {formatMinutes(activeTimer.plannedMinutes)}
              </div>
            </div>

            <div className="text-right">
              {isOvertime ? (
                <div className="text-rose-400 font-mono text-sm font-semibold">
                  +{formatHMS(overageSec)} over
                </div>
              ) : (
                <div className="text-emerald-400 font-mono text-sm font-semibold">
                  {formatHMS(remainingSec)} left
                </div>
              )}
              <div className="text-[10px] text-zinc-400 capitalize">
                Status: {activeTimer.status}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                isOvertime
                  ? 'bg-rose-500'
                  : isDistraction
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (elapsedSec / totalPlannedSec) * 100)}%`,
              }}
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between gap-1.5 text-xs">
            {activeTimer.status === 'running' ? (
              <button
                onClick={pauseTimer}
                className="flex-1 py-1.5 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={() => addExtraTimeToTimer(10)}
              title="Add 10 minutes to planned time"
              className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition border border-zinc-700 flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>+10m</span>
            </button>

            <button
              onClick={handleFinishClick}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Finish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accomplishment Prompt Modal on Finish */}
      {showAccomplishmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 text-sm">Session Complete</h4>
                <p className="text-[11px] text-zinc-400">
                  {formatMinutes(Math.max(1, Math.round(elapsedSec / 60)))} logged on{' '}
                  <span className="text-zinc-200 font-medium">{activeTimer.taskName}</span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium text-xs mb-1.5">
                What did you accomplish during this session?
              </label>
              <textarea
                autoFocus
                rows={3}
                placeholder="e.g. Completed authentication UI, fixed header responsiveness..."
                value={accomplishmentNote}
                onChange={(e) => setAccomplishmentNote(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAccomplishmentModal(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                Keep Session Running
              </button>
              <button
                onClick={handleConfirmFinish}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm cursor-pointer"
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
