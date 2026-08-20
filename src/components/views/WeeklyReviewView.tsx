import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldAlert,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, formatReadableDate } from '../../utils/dateUtils';
import { generateWeeklyReportPDF } from '../../utils/pdfExport';
import { exportWeeklyReviewCSV } from '../../utils/csvExport';

export const WeeklyReviewView: React.FC = () => {
  const { profile, weeklyReviews, generateWeeklyReview } = useApp();

  const [selectedReviewIdx, setSelectedReviewIdx] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentReview = weeklyReviews[selectedReviewIdx] || weeklyReviews[0];

  const handleGenerateReview = async () => {
    setIsRegenerating(true);
    try {
      await generateWeeklyReview(currentReview?.weekStart);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentReview) {
      generateWeeklyReportPDF(currentReview, profile);
    }
  };

  const handleExportCSV = () => {
    if (currentReview) {
      exportWeeklyReviewCSV(currentReview);
    }
  };

  if (!currentReview) {
    return (
      <div className="p-8 text-center text-zinc-400 font-medium">
        No weekly review data available yet.
      </div>
    );
  }

  const aiReport = currentReview.aiMentorReport;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Weekly Performance & AI Mentor Review
            </h1>
            <span className="clay-pill clay-pill-emerald px-2.5 py-0.5 text-xs font-bold">
              {formatReadableDate(currentReview.weekStart)} – {formatReadableDate(currentReview.weekEnd)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Compare planned vs actual work. Receive honest, actionable coaching.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector */}
          {weeklyReviews.length > 1 && (
            <select
              value={selectedReviewIdx}
              onChange={(e) => setSelectedReviewIdx(Number(e.target.value))}
              className="clay-input px-3 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
            >
              {weeklyReviews.map((w, idx) => (
                <option key={w.id} value={idx} className="bg-[#141822] text-zinc-200">
                  Week of {w.weekStart}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerateReview}
            disabled={isRegenerating}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>{isRegenerating ? 'Analyzing...' : 'Run AI Mentor'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="clay-btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* High-Level Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Total Focus Time
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatMinutes(currentReview.totalFocusMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Planned: {formatMinutes(currentReview.plannedFocusMinutes)}
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Execution Rate
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {currentReview.executionPercentage}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            {currentReview.completedTasksCount} done, {currentReview.unfinishedTasksCount} deferred
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Distraction Logged
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
            {formatMinutes(currentReview.distractionMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Social, gaming & feeds
          </div>
        </div>

        <div className="p-4.5 clay-card flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Habit Consistency
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
            {currentReview.habitConsistencyPercent}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-medium">
            Weekly routine adherence
          </div>
        </div>
      </div>

      {/* Honest AI Mentor Report Box */}
      {aiReport && (
        <div className="p-6 sm:p-7 clay-card-elevated border-emerald-500/30 space-y-5 text-xs shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Honest AI Mentor Report</h3>
                <p className="text-[11px] text-zinc-400 font-medium">Direct, non-generic weekly diagnosis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-medium">Performance Score:</span>
              <span className="clay-pill-emerald px-3 py-1 font-extrabold text-sm">
                {aiReport.score} / 100
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 clay-card-sm text-zinc-200 leading-relaxed italic font-medium">
            &ldquo;{aiReport.summary}&rdquo;
          </div>

          {/* Wins and Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wins */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#121b18] border border-emerald-500/30 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>What Went Well (Wins)</span>
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

            {/* Problems */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-[#1e1418] border border-rose-500/30 space-y-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Identified Leaks & Overages</span>
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

          {/* Reality Check */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-950/30 to-[#1c1712] border border-amber-500/30 space-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Honest Reality Check</span>
            </div>
            <p className="text-zinc-200 leading-relaxed font-medium">{aiReport.realityCheck}</p>
          </div>

          {/* Next Week Recommendations */}
          <div className="p-4.5 clay-card-sm space-y-2.5">
            <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Concrete Recommendations for Next Week</span>
            </div>
            <ul className="space-y-2 text-zinc-200 font-medium">
              {aiReport.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">{i + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Activity Breakdown & Distraction Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Top Activities */}
        <div className="p-5 sm:p-6 clay-card space-y-3.5">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Top Time Investments
          </h3>
          <div className="space-y-2.5">
            {currentReview.topActivities.map((act) => (
              <div
                key={act.name}
                className="p-3 clay-card-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{act.name}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">{act.category}</div>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {formatMinutes(act.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distractions & Overages */}
        <div className="p-5 sm:p-6 clay-card space-y-3.5">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Distractions & Boundaries
          </h3>
          <div className="space-y-2.5">
            {currentReview.biggestDistractions.map((dist) => (
              <div
                key={dist.name}
                className="p-3 clay-card-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{dist.name}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">
                    Limit: {dist.limitMinutes}m/wk
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-rose-400">
                    {formatMinutes(dist.minutes)}
                  </div>
                  {dist.overageMinutes > 0 && (
                    <div className="text-[10px] text-rose-300 font-bold">
                      +{formatMinutes(dist.overageMinutes)} over
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
