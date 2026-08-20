import React, { useState } from 'react';
import {
  BrainCircuit,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldAlert,
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
      <div className="p-8 text-center text-zinc-400 font-medium">
        No monthly review data available yet.
      </div>
    );
  }

  const aiReport = currentMonth.aiMentorReport;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Monthly Growth & Retrospective
            </h1>
            <span className="clay-pill-blue px-2.5 py-0.5 text-xs font-bold">
              {currentMonth.monthStr}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Long-range perspective to see your compounding trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {monthlyReviews.length > 1 && (
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="clay-input px-3 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
            >
              {monthlyReviews.map((m, idx) => (
                <option key={m.id} value={idx} className="bg-[#141822] text-zinc-200">
                  Month: {m.monthStr}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleRunMonthlyAI}
            disabled={isGenerating}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            <span>{isGenerating ? 'Synthesizing...' : 'Run Monthly AI'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* High Level Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Total Focus Hours
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {currentMonth.totalFocusHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Productive deep work
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Responsibilities
          </div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">
            {currentMonth.responsibilityHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Family, home & life
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Distraction Time
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
            {currentMonth.distractionHours}h
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Logged non-core media
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Habit Consistency
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
            {currentMonth.habitConsistencyAvg}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Monthly average adherence
          </div>
        </div>
      </div>

      {/* Monthly AI Mentor Evaluation Box */}
      {aiReport && (
        <div className="p-6 sm:p-7 clay-card-elevated border-blue-500/30 space-y-5 text-xs shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Monthly AI Synthesis</h3>
                <p className="text-[11px] text-zinc-400 font-medium">Macro-level habit and focus trajectory</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-medium">Trajectory Score:</span>
              <span className="clay-pill-blue px-3 py-1 font-extrabold text-sm">
                {aiReport.score} / 100
              </span>
            </div>
          </div>

          <div className="p-4 clay-card-sm text-zinc-200 leading-relaxed italic font-medium">
            &ldquo;{aiReport.summary}&rdquo;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#121b18] border border-emerald-500/30 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Monthly Wins & Milestones</span>
              </div>
              <ul className="space-y-2 text-zinc-200 font-medium">
                {aiReport.wins.map((win, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-[#1e1418] border border-rose-500/30 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Patterns to Watch</span>
              </div>
              <ul className="space-y-2 text-zinc-200 font-medium">
                {aiReport.problems.map((prob, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4.5 clay-card-sm space-y-2.5">
            <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Next Month&apos;s Focus Directions</span>
            </div>
            <ul className="space-y-2 text-zinc-200 font-medium">
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
        <div className="p-5 sm:p-6 clay-card space-y-2">
          <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Highest Output Week</span>
          </div>
          <div className="text-sm font-bold text-white">{currentMonth.bestWeek}</div>
          <p className="text-zinc-400 font-medium">
            Highest concentration of uninterrupted deep work blocks and best habit consistency.
          </p>
        </div>

        <div className="p-5 sm:p-6 clay-card space-y-2">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Challenged / Ramp-Up Week</span>
          </div>
          <div className="text-sm font-bold text-white">{currentMonth.weakestWeek}</div>
          <p className="text-zinc-400 font-medium">
            High family obligations and schedule transitions. Handled with honest logging.
          </p>
        </div>
      </div>
    </div>
  );
};
