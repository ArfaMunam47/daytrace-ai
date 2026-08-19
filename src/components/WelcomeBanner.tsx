import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowRight,
  X,
  HeartHandshake,
  Target,
  FileSpreadsheet,
  BrainCircuit,
  Flame,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WelcomeBannerProps {
  onPlanMyDay: () => void;
  onDismiss: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onPlanMyDay, onDismiss }) => {
  const { profile, user } = useApp();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Extract real registered name without ever showing placeholders
  const rawName =
    profile.firstName ||
    user?.firstName ||
    (profile.name && profile.name.trim() !== 'User' ? profile.name : '') ||
    '';

  const userName = rawName.trim().split(' ')[0];

  const titleText = userName
    ? `Welcome to DayTrace, ${userName} 👋`
    : 'Welcome to DayTrace 👋';

  return (
    <div
      id="daytrace-welcome-banner"
      className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl text-xs text-zinc-300 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {/* Top right dismiss button */}
      <button
        id="dismiss-welcome-banner"
        type="button"
        onClick={onDismiss}
        title="Dismiss welcome banner"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header & Main Message */}
      <div className="pr-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New to DayTrace</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
          {titleText}
        </h1>

        <p className="text-sm sm:text-base font-medium text-emerald-300/90 leading-snug">
          DayTrace is your personal planning and reflection companion — built for real life, not perfect schedules.
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
          Plan what matters, track what actually happens, and review your progress over time. DayTrace helps you understand where your time goes, handle unexpected interruptions, and make more realistic plans for tomorrow and the week ahead.
        </p>
      </div>

      {/* 4-Step DayTrace Workflow */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          How DayTrace Works (The 4-Step Cycle)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-zinc-850/80 border border-zinc-800/90 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>1. PLAN</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">
                Choose the important things you want to accomplish today.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-850/80 border border-zinc-800/90 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>2. TRACK</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">
                Record what you actually do — including completed tasks, postponed work, focus time, distractions, and unexpected interruptions.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-850/80 border border-zinc-800/90 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>3. REVIEW</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">
                At the end of the day and week, see what you planned, what you actually accomplished, and where your time went.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-850/80 border border-zinc-800/90 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>4. IMPROVE</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">
                Use your real history and honest insights to create a more realistic plan for the next day and week.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Major Features Grid (Expandable / Scannable) */}
      <div className="p-4 bg-zinc-850/50 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Key DayTrace Capabilities</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <span>{showAllFeatures ? 'Hide Details' : 'View All Features'}</span>
            {showAllFeatures ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 ${showAllFeatures ? '' : 'max-h-36 sm:max-h-none overflow-hidden'}`}>
          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Daily Planning</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              Plan priorities without forcing your entire life into a rigid 24-hour schedule.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Activity & Focus Tracking</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              Record meaningful work, focus sessions, distractions, interruptions, and other activities.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Goals & Streaks</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              Track long-term goals and consistency over time.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Daily Review</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              Understand what went well, what didn&apos;t, and what you should change tomorrow.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Weekly Review</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              See your progress, patterns, strengths, and weaknesses across the week.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Downloadable Reports</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              Download your weekly progress and activity history for future reference.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg md:col-span-2 lg:col-span-3">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Honest AI Guidance</span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight">
              AI insights must be based on the user&apos;s actual recorded data. DayTrace should not blindly praise the user or invent productivity statistics.
            </p>
          </div>
        </div>
      </div>

      {/* Core Philosophy Statement */}
      <div className="p-4 bg-emerald-950/25 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Core Philosophy</span>
        </div>
        <blockquote className="text-zinc-100 font-semibold text-xs sm:text-sm italic border-l-2 border-emerald-500 pl-3">
          &ldquo;DayTrace isn&apos;t built around perfect days. It&apos;s built around real ones.&rdquo;
        </blockquote>
        <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed">
          Plans change. Interruptions happen. Some days are productive, and some aren&apos;t. DayTrace helps you understand what actually happened so you can make a better plan next time.
        </p>
      </div>

      {/* Footer & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/90">
        <p className="text-[11px] text-zinc-400">
          Revisit this guide anytime in <span className="text-zinc-300 font-medium">Settings &rarr; How DayTrace Works</span>.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            id="explore-daytrace-button"
            type="button"
            onClick={onDismiss}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition cursor-pointer text-xs min-h-[38px] text-center"
          >
            Explore DayTrace
          </button>

          <button
            id="plan-my-day-button"
            type="button"
            onClick={() => {
              onDismiss();
              onPlanMyDay();
            }}
            className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-xs min-h-[38px]"
          >
            <span>Plan My Day</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
