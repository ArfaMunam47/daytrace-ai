import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const GrowthTimelineView: React.FC = () => {
  const { timelineMonths } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Development', 'Learning', 'Content', 'Habits'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Growth & Achievement Timeline
            </h1>
            <span className="clay-pill-purple px-2.5 py-0.5 text-xs font-bold">
              Multi-Month Compounding
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Proof of your continuous effort over months and years.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 clay-card-sm p-1.5 rounded-xl text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'clay-btn-secondary text-purple-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
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
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#121620] border-2 border-purple-500 shadow-[0_0_10px_rgba(192,132,252,0.6)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>

              {/* Month Card */}
              <div className="p-5 sm:p-6 clay-card space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-white">{month.month}</h3>
                    <div className="text-zinc-400 text-xs mt-0.5 font-medium">
                      Theme: <span className="text-zinc-200 font-bold">{month.theme}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-zinc-300 font-medium">
                    <span className="clay-pill-emerald px-2.5 py-0.5 font-bold">
                      {month.totalFocusHours}h Focus
                    </span>
                    <span className="clay-pill px-2.5 py-0.5">{month.goalsReached} Goals Reached</span>
                    <span className="clay-pill px-2.5 py-0.5">{month.projectsCompleted} Projects Shipped</span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5">
                  <div className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                    Key Accomplishments
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 clay-card-sm space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{hl.title}</span>
                          <span className="clay-pill-purple text-[10px] px-2 py-0.5 font-bold">
                            {hl.category}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed font-medium">
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
