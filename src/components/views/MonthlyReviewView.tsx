import React, { useState } from 'react';
import {
  CalendarDays,
  Download,
  BrainCircuit,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  ShieldAlert,
  Flame,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateMonthlyReportPDF } from '../../utils/pdfExport';

export const MonthlyReviewView: React.FC = () => {
  const { profile, monthlyReviews, generateMonthlyReview } = useApp();

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentMonth = monthlyReviews[selectedMonthIdx] || monthlyReviews[0];

  const handleRunMonthlyAI = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyReview(currentMonth?.monthStr);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentMonth) {
      generateMonthlyReportPDF(currentMonth, profile);
    }
  };

  if (!currentMonth) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No monthly review data available yet.
      </div>
    );
  }

  const aiReport = currentMonth.aiMentorReport;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Monthly Growth & Retrospective
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-400 text-xs font-medium">
              {currentMonth.monthStr}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Long-range perspective to see your compounding trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {monthlyReviews.length > 1 && (
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
            >
              {monthlyReviews.map((m, idx) => (
                <option key={m.id} value={idx}>
                  Month: {m.monthStr}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleRunMonthlyAI}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
            <span>{isGenerating ? 'Synthesizing...' : 'Run Monthly AI'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* High Level Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Total Focus Hours
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {currentMonth.totalFocusHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Productive deep work
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Responsibilities
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
            {currentMonth.responsibilityHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Family, home & life
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Distraction Time
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {currentMonth.distractionHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Logged non-core media
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Habit Consistency
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {currentMonth.habitConsistencyAvg}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Monthly average adherence
          </div>
        </div>
      </div>

      {/* Monthly AI Mentor Evaluation Box */}
      {aiReport && (
        <div className="p-6 bg-zinc-900 border border-blue-500/40 rounded-2xl space-y-5 text-xs shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Monthly AI Synthesis</h3>
                <p className="text-[11px] text-zinc-400">Macro-level habit and focus trajectory</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">Trajectory Score:</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full font-bold text-sm">
                {aiReport.score} / 100
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-zinc-200 leading-relaxed italic">
            &ldquo;{aiReport.summary}&rdquo;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4" />
                <span>Monthly Wins & Milestones</span>
              </div>
              <ul className="space-y-1.5 text-zinc-200">
                {aiReport.wins.map((win, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                <span>Patterns to Watch</span>
              </div>
              <ul className="space-y-1.5 text-zinc-200">
                {aiReport.problems.map((prob, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2">
            <div className="font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Next Month&apos;s Focus Directions</span>
            </div>
            <ul className="space-y-1.5 text-zinc-200">
              {aiReport.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold font-mono">{i + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Week Comparisons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Highest Output Week</span>
          </div>
          <div className="text-sm font-semibold text-zinc-100">{currentMonth.bestWeek}</div>
          <p className="text-zinc-400">
            Highest concentration of uninterrupted deep work blocks and best habit consistency.
          </p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Challenged / Ramp-Up Week</span>
          </div>
          <div className="text-sm font-semibold text-zinc-100">{currentMonth.weakestWeek}</div>
          <p className="text-zinc-400">
            High family obligations and schedule transitions. Handled with honest logging.
          </p>
        </div>
      </div>
    </div>
  );
};
