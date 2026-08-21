import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  HeartHandshake,
  Sparkles,
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  AlertCircle,
  Flame,
  CheckCircle2,
  HelpCircle,
  Layers,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Compass,
} from 'lucide-react';

interface PhilosophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionKey = 'all' | 'what-is' | 'why-exists' | 'how-it-works' | 'features' | 'ai-mentor' | 'real-day' | 'philosophy' | 'quick-start';

export const PhilosophyModal: React.FC<PhilosophyModalProps> = ({ isOpen, onClose }) => {
  const [activeFilter, setActiveFilter] = useState<SectionKey>('all');

  if (!isOpen) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      id="philosophy-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="philosophy-modal-title"
    >
      <div
        id="philosophy-modal-card"
        className="clay-modal w-full max-w-3xl my-4 sm:my-8 relative flex flex-col max-h-[92vh] text-zinc-200 text-xs overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header with Back / Close */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#0e1219]/95 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              type="button"
              className="clay-btn-secondary px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer min-h-[36px]"
              title="Return to previous screen"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
            <div>
              <h2 id="philosophy-modal-title" className="font-extrabold text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                <span>How DayTrace Works</span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hidden xs:inline-block">
                  Guide
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close dialog"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Navigation Filter Bar */}
        <div className="px-4 sm:px-6 py-2 border-b border-white/5 bg-[#0a0d13] shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-400 font-semibold mr-1 shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" /> Jump to:
          </span>
          <button
            type="button"
            onClick={() => scrollToSection('sec-what-is')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            1. What is DayTrace
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-why-exists')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            2. Why It Exists
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-how-it-works')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            3. Step-by-Step
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-features')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            4. Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-ai-mentor')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            5. AI Mentor
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-real-day')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            6. A Real Day
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-different')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            7. Philosophy
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-quick-start')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 whitespace-nowrap transition cursor-pointer font-bold"
          >
            8. Quick Start
          </button>
        </div>

        {/* Scrollable Content Container (Single clean scrollbar, never cut off) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pb-10 space-y-7 scrollbar-thin">
          
          {/* SECTION 1: WHAT IS DAYTRACE? */}
          <section id="sec-what-is" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-300 font-bold">1</span>
              <span>What is DayTrace?</span>
            </div>
            
            <div className="clay-card-elevated p-4 sm:p-5 space-y-3 border-emerald-500/20 bg-gradient-to-br from-[#101924] to-[#0d141e]">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                A flexible AI-powered productivity companion built for real human life.
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                DayTrace is not a rigid calendar or a stressful 24-hour scheduler that makes you feel guilty when things don't go according to plan. Instead, it is a practical, supportive system designed to help you understand:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-200 text-[11px] font-medium">What you actually need to do today.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-200 text-[11px] font-medium">What matters most vs. what can wait.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-200 text-[11px] font-medium">How much focused time you actually spend.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-200 text-[11px] font-medium">What interrupts your plans and why.</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY DAYTRACE EXISTS */}
          <section id="sec-why-exists" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] text-rose-300 font-bold">2</span>
              <span>Why DayTrace Exists</span>
            </div>

            <div className="clay-card p-4 sm:p-5 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Traditional productivity apps assume people have perfect days. Real life doesn&apos;t work that way.
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                In real life, days are messy and unpredictable:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200 text-[11px] font-medium flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Unexpected interruptions</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 text-[11px] font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Low-energy afternoons</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-blue-200 text-[11px] font-medium flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Changing priorities</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 text-[11px] font-medium flex items-center gap-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Family & household chores</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-[11px] font-medium flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Procrastination & fatigue</span>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-500/20 text-teal-200 text-[11px] font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Schedule changes</span>
                </div>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-medium pt-1">
                DayTrace treats unexpected responsibilities and changes as normal life events — <strong className="text-white">never as user failures</strong>.
              </p>
            </div>
          </section>

          {/* SECTION 3: HOW DAYTRACE WORKS (8-STEP CYCLE) */}
          <section id="sec-how-it-works" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300 font-bold">3</span>
              <span>How DayTrace Works (Step-by-Step)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Plan your day</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Set 2 to 4 realistic priority blocks rather than an impossible to-do list.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Identify what matters</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Tag top priority tasks so you know exactly where to direct your best energy.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Work through priorities</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Focus on one block at a time without multitasking overload.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center text-[10px]">4</span>
                  <span>Track your focus</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Use the integrated focus timer to record honest deep work minutes.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-[10px]">5</span>
                  <span>Handle interruptions</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Log interruptions or chores with 1 click so your historical record reflects reality.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px]">6</span>
                  <span>Reflect on your day</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Take 2 minutes in the evening to review what you completed, postponed, and learned.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-pink-500/20 flex items-center justify-center text-[10px]">7</span>
                  <span>Learn from your patterns</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Weekly reviews reveal what times of day you focus best and what common distractions occur.
                </p>
              </div>

              <div className="clay-card p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px]">8</span>
                  <span>Improve the next day</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">
                  Calibrate your capacity so tomorrow&apos;s plan is even more achievable.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: WHAT YOU CAN DO WITH DAYTRACE */}
          <section id="sec-features" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-300 font-bold">4</span>
              <span>What You Can Do With DayTrace</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">AI Mentor</div>
                    <div className="text-[11px] text-zinc-400 font-medium">
                      Conversational coaching grounded in your authentic recorded logs.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                  Interactive Coach
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Daily Planning & Priorities</div>
                    <div className="text-[11px] text-zinc-400 font-medium">
                      Set capacity hours, organize priority tasks, and mark postponed items without guilt.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                  Realistic Planning
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Focus Tracking & HUD</div>
                    <div className="text-[11px] text-zinc-400 font-medium">
                      Run deep work sessions with audio chimes and non-judgmental distraction timers.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                  Real Time Tracking
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Interruption Logging</div>
                    <div className="text-[11px] text-zinc-400 font-medium">
                      Record urgent errands, caretaking, and emergencies as unplanned responsibilities.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                  Zero Guilt
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Weekly & Monthly Reviews</div>
                    <div className="text-[11px] text-zinc-400 font-medium">
                      Audit your 7-day and monthly patterns with printable and downloadable reports.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                  Exportable Insights
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 5: AI MENTOR */}
          <section id="sec-ai-mentor" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] text-pink-300 font-bold">5</span>
              <span>The AI Mentor</span>
            </div>

            <div className="clay-card-elevated p-4 sm:p-5 space-y-3 bg-gradient-to-br from-[#181124] to-[#0f0e1a] border-purple-500/20">
              <h3 className="text-sm sm:text-base font-bold text-white">
                A constructive, honest companion that analyzes your real records.
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                Unlike generic chatbots, the DayTrace AI Mentor examines your stored tasks, focus logs, and interruptions. It never blindly praises or makes up fake numbers. You can ask realistic questions like:
              </p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono">
                  &ldquo;How should I prioritize my tasks this morning?&rdquo;
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono">
                  &ldquo;I keep procrastinating on my main goal. What small step should I take?&rdquo;
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono">
                  &ldquo;How was my day compared to what I originally planned?&rdquo;
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono">
                  &ldquo;I&apos;m struggling to stay focused today. What should I change?&rdquo;
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: A REAL DAY WITH DAYTRACE */}
          <section id="sec-real-day" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-300 font-bold">6</span>
              <span>A Real Day with DayTrace (Scenario)</span>
            </div>

            <div className="clay-card p-4 sm:p-5 space-y-4">
              <div className="space-y-3 border-l-2 border-emerald-500/30 pl-4">
                {/* Morning */}
                <div className="space-y-1 relative">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Morning — Plan Priorities</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
                    You choose 3 key priorities for today (e.g., 2.5 hours total capacity). You start a focus session for your main priority.
                  </p>
                </div>

                {/* Afternoon */}
                <div className="space-y-1 relative pt-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Afternoon — Life Happens & You Adapt</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
                    An unexpected family need or urgent errand arises. You tap <strong>&ldquo;Log Interruption&rdquo;</strong> to record 45 minutes of unplanned responsibility. DayTrace preserves this factually without breaking your score.
                  </p>
                </div>

                {/* Evening */}
                <div className="space-y-1 relative pt-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Sunset className="w-4 h-4 text-indigo-400" />
                    <span>Evening — 2-Minute Reflection</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
                    You complete your quick daily reflection. You see what got completed, what was postponed, and prepare a calm plan for tomorrow.
                  </p>
                </div>

                {/* End of Week */}
                <div className="space-y-1 relative pt-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>End of Week — Review Patterns</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
                    You review your 7-day patterns, identify what times of day you worked best, and download your weekly report.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: WHAT MAKES DAYTRACE DIFFERENT? */}
          <section id="sec-different" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-300 font-bold">7</span>
              <span>What Makes DayTrace Different?</span>
            </div>

            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/50 to-[#102420] border border-emerald-500/40 rounded-2xl space-y-3 shadow-md">
              <blockquote className="text-white font-extrabold text-sm sm:text-base italic border-l-2 border-emerald-400 pl-3">
                &ldquo;DayTrace isn&apos;t about following your schedule perfectly. It&apos;s about understanding your day, adapting when life changes, and improving over time.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-xs font-medium leading-relaxed">
                By acknowledging that energy fluctuates and unexpected interruptions happen, DayTrace turns productivity into a sustainable, stress-free habit.
              </p>
            </div>
          </section>

          {/* SECTION 8: QUICK START */}
          <section id="sec-quick-start" className="space-y-3 scroll-mt-6">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-300 font-bold">8</span>
              <span>Quick Start (5 Steps)</span>
            </div>

            <div className="clay-card-elevated p-4 sm:p-5 space-y-3">
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-white">Create your account:</strong> Your records are securely isolated and preserved.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-white">Set 2-3 priorities for today:</strong> Go to <em>Dashboard</em> or <em>Plan Tomorrow</em> and add your primary blocks.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-white">Start your first focus timer:</strong> Work through your priority block.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-white">Log interruptions when they happen:</strong> Click <em>Log</em> in the header or sidebar to record unexpected events.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">5</span>
                  <div>
                    <strong className="text-white">Reflect at the end of the day:</strong> Review your progress and plan the next day with confidence.
                  </div>
                </li>
              </ol>
            </div>
          </section>

        </div>

        {/* Bottom Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-white/5 bg-[#0e1219] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="clay-btn-secondary px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 min-h-[40px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Guide</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="clay-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
          >
            <span>Start Using DayTrace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
