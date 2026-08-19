import React, { useState } from 'react';
import {
  GitCommit,
  Sparkles,
  Award,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimelineMonth } from '../../types';

export const GrowthTimelineView: React.FC = () => {
  const { timelineMonths } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Development', 'Learning', 'Content', 'Habits'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Growth & Achievement Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-medium">
              Multi-Month Compounding
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Proof of your continuous effort over months and years.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-zinc-800 text-purple-400 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-800">
        {timelineMonths.map((month) => {
          const filteredHighlights = month.highlights.filter((h) => {
            if (categoryFilter === 'ALL') return true;
            return h.category.toLowerCase() === categoryFilter.toLowerCase();
          });

          if (categoryFilter !== 'ALL' && filteredHighlights.length === 0) {
            return null;
          }

          return (
            <div key={month.month} className="relative pl-10 space-y-3">
              {/* Timeline Dot Marker */}
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-purple-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>

              {/* Month Card */}
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 text-xs shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <div>
                    <h3 className="font-bold text-base text-zinc-100">{month.month}</h3>
                    <div className="text-zinc-400 text-xs mt-0.5">
                      Theme: <span className="text-zinc-200 font-medium">{month.theme}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-semibold">
                      {month.totalFocusHours}h Focus
                    </span>
                    <span>{month.goalsReached} Goals Reached</span>
                    <span>{month.projectsCompleted} Projects Shipped</span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2">
                  <div className="font-semibold text-zinc-300 text-xs uppercase tracking-wider text-[10px]">
                    Key Accomplishments
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-200">{hl.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                            {hl.category}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {hl.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
