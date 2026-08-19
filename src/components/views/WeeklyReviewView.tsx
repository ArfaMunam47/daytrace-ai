import React, { useState } from 'react';
import {
  CalendarRange,
  Download,
  BrainCircuit,
  Sparkles,
  Award,
  AlertTriangle,
  TrendingUp,
  Flame,
  Clock,
  ShieldAlert,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, formatReadableDate, getWeekBoundaries } from '../../utils/dateUtils';
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
      <div className="p-8 text-center text-zinc-400">
        No weekly review data available yet.
      </div>
    );
  }

  const aiReport = currentReview.aiMentorReport;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Weekly Performance & AI Mentor Review
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
              {formatReadableDate(currentReview.weekStart)} – {formatReadableDate(currentReview.weekEnd)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
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
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              {weeklyReviews.map((w, idx) => (
                <option key={w.id} value={idx}>
                  Week of {w.weekStart}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerateReview}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRegenerating ? 'Analyzing...' : 'Run AI Mentor'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* High-Level Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Total Focus Time
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {formatMinutes(currentReview.totalFocusMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Planned: {formatMinutes(currentReview.plannedFocusMinutes)}
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Execution Rate
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1 font-mono">
            {currentReview.executionPercentage}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {currentReview.completedTasksCount} done, {currentReview.unfinishedTasksCount} deferred
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Distraction Logged
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {formatMinutes(currentReview.distractionMinutes)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Social, gaming & feeds
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Habit Consistency
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {currentReview.habitConsistencyPercent}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Weekly routine adherence
          </div>
        </div>
      </div>

      {/* Honest AI Mentor Report Box */}
      {aiReport && (
        <div className="p-6 bg-zinc-900 border border-emerald-500/40 rounded-2xl space-y-5 text-xs shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Honest AI Mentor Report</h3>
                <p className="text-[11px] text-zinc-400">Direct, non-generic weekly diagnosis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">Performance Score:</span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-sm">
                {aiReport.score} / 100
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-zinc-200 leading-relaxed italic">
            &ldquo;{aiReport.summary}&rdquo;
          </div>

          {/* Wins and Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wins */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4" />
                <span>What Went Well (Wins)</span>
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

            {/* Problems */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Leaks & Overages</span>
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

          {/* Reality Check */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4" />
              <span>Honest Reality Check</span>
            </div>
            <p className="text-zinc-200 leading-relaxed">{aiReport.realityCheck}</p>
          </div>

          {/* Next Week Recommendations */}
          <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2">
            <div className="font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Concrete Recommendations for Next Week</span>
            </div>
            <ul className="space-y-1.5 text-zinc-200">
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
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
          <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            Top Time Investments
          </h3>
          <div className="space-y-2">
            {currentReview.topActivities.map((act) => (
              <div
                key={act.name}
                className="p-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-zinc-200">{act.name}</div>
                  <div className="text-[10px] text-zinc-400">{act.category}</div>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {formatMinutes(act.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distractions & Overages */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
          <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Distractions & Boundaries
          </h3>
          <div className="space-y-2">
            {currentReview.biggestDistractions.map((dist) => (
              <div
                key={dist.name}
                className="p-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-zinc-200">{dist.name}</div>
                  <div className="text-[10px] text-zinc-400">
                    Limit: {dist.limitMinutes}m/wk
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-rose-400">
                    {formatMinutes(dist.minutes)}
                  </div>
                  {dist.overageMinutes > 0 && (
                    <div className="text-[10px] text-rose-300 font-semibold">
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
