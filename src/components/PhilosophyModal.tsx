import React from 'react';
import {
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Target,
  FileSpreadsheet,
  BrainCircuit,
  Flame,
  X,
} from 'lucide-react';

interface PhilosophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhilosophyModal: React.FC<PhilosophyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="philosophy-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="philosophy-modal-card"
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 text-xs text-zinc-300 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              D
            </div>
            <div>
              <h2 className="font-bold text-zinc-100 text-base tracking-tight">
                How DayTrace Works & Core Philosophy
              </h2>
              <p className="text-[11px] text-zinc-400">
                Your personal planning and reflection companion — built for real life, not perfect schedules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Philosophy */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
          <div className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Core Philosophy</span>
          </div>
          <blockquote className="text-zinc-100 font-semibold text-sm italic border-l-2 border-emerald-500 pl-3">
            &ldquo;DayTrace isn&apos;t built around perfect days. It&apos;s built around real ones.&rdquo;
          </blockquote>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            Plans change. Interruptions happen. Some days are productive, and some aren&apos;t. DayTrace helps you understand what actually happened so you can make a better plan next time.
          </p>
        </div>

        {/* The 4-Step Cycle */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">
            The 4-Step DayTrace Workflow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-zinc-850 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Calendar className="w-4 h-4" />
                <span>1. PLAN</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Choose the important things you want to accomplish today.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-850 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>2. TRACK</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Record what you actually do — including completed tasks, postponed work, focus time, distractions, and unexpected interruptions.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-850 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <BarChart3 className="w-4 h-4" />
                <span>3. REVIEW</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                At the end of the day and week, see what you planned, what you actually accomplished, and where your time went.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-850 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>4. IMPROVE</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Use your real history and honest insights to create a more realistic plan for the next day and week.
              </p>
            </div>
          </div>
        </div>

        {/* Major Features Grid */}
        <div className="space-y-2.5">
          <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">
            Major Features
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Planning</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Plan priorities without forcing your entire life into a rigid 24-hour schedule.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Activity & Focus Tracking</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Record meaningful work, focus sessions, distractions, interruptions, and other activities.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Goals & Streaks</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Track long-term goals and consistency over time.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Daily Review</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Understand what went well, what didn&apos;t, and what you should change tomorrow.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                <span>Weekly Review</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                See your progress, patterns, strengths, and weaknesses across the week.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Downloadable Reports</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Download your weekly progress and activity history for future reference.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-lg sm:col-span-2">
              <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-rose-400" />
                <span>Honest AI Guidance</span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                AI insights must be based on the user&apos;s actual recorded data. DayTrace should not blindly praise the user or invent productivity statistics.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
