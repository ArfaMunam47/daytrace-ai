# DayTrace

**Adaptive productivity for real human life.**

DayTrace is a full-stack intelligent productivity platform that helps you plan around real life, track what actually happens, and understand your patterns over time. Unlike rigid 24-hour scheduling tools, DayTrace is built around the reality that plans change, interruptions happen, and progress is rarely linear.

The platform combines realistic daily planning, honest activity tracking, distraction boundaries with reasonable limits, interruption awareness, habit and streak records, goals and projects, and a grounded AI Mentor — all surfaced through consistent daily, weekly, and monthly reviews and a single source of truth for every calculation.

## Philosophy

> _"DayTrace isn't built around perfect days. It's built around real ones."_

> _"Plans change. Interruptions happen. Progress isn't always linear. DayTrace helps you understand what actually happened so you can make a better plan next time."_

There are no dark patterns here — no artificial urgency, no shame notifications, no manipulative streaks. An unfinished task is never automatically a user failure. Completing many trivial tasks does not automatically make a day productive. DayTrace distinguishes what you planned from what actually happened, then helps you understand the difference.

## Features

### Core Experience
- **Welcome & Onboarding** — Guided first-run experience for new users, including an onboarding flow for profile setup, goals, daily capacity, and typical responsibilities. Optionally persistent dismissed state.
- **Personalized Welcome Banner** — First-time users are greeted by name, with primary `[Plan My Day]` and secondary `[Explore DayTrace]` actions.
- **Responsive UI** — Native mobile, tablet, and desktop layouts with touch-friendly targets and no horizontal overflow.

### Planning
- **Daily Planning** — Build a realistic daily plan with priority tiers (`Must Do`, `Should Do`, `Optional`) and estimated durations, calibrated to your historical capacity.
- **Plan Tomorrow** — Dedicated workflow for planning the next day with AI-assisted feasibility advisory.
- **Goals & Projects** — Track long-term goals with target hours, deadlines, and priority, broken down into time-spending projects.

### Tracking & Focus
- **Focus Tracking & Timers** — Start/stop stopwatch and countdown timers directly from planned tasks, with a persistent HUD and active session context.
- **Activity Logs & Audit History** — Record what actually happened — including unplanned responsibilities, interruptions, and distractions — with honest category classification.
- **Interruption Tracking** — Log family needs, chores, emergencies, and errands as `UNPLANNED_RESPONSIBILITY` / `INTERRUPTIONS`, never as wasted time.
- **Distraction Boundaries** — Set daily/weekly time limits on entertainment and social media sources with proactive boundary prompts.

### Habits & Growth
- **Habits & Streaks** — Track habit frequency per week and authentic streaks that only increment on real qualifying activity.
- **Growth Timeline** — A progress history of focus hours, goals reached, projects completed, and execution-rate averages across months.
- **Long-Term History Preservation** — Daily, weekly, monthly, quarterly and yearly records are never wiped or overwritten.

### Reviews & Mentorship
- **Daily Review Framework** — Guided evening reflection: what you planned, completed, postponed, interrupted, and where your time went, concluding with one primary actionable step and a `[Plan Tomorrow]` CTA.
- **Weekly Review** — Calculated from authentic 7-day logs: planned vs completed vs postponed vs cancelled tasks, focus vs. distraction vs. unplanned responsibilities, habit progress, multi-period comparisons, and a structured `WHAT WENT WELL` / `WHAT DIDN'T GO WELL` / `BIGGEST PATTERN` / `RECOMMENDATION` / `NEXT ACTION` summary.
- **Monthly Review** — Monthly aggregation with category breakdowns, goals progress, habit consistency, and AI feedback.
- **AI Mentor** — A grounded, honest mentor that never invents data. It analyzes real, stored records, highlights blind spots, and gives evidence-based recommendations. Supports live streaming chat with multi-turn context.
- **Report Exports** — Clean document, JSON, or CSV export of weekly reviews and activity — real user name, dates, data, and honest assessment included.

### Trust & Reliability
- **Grounded AI Analysis** — Every AI response is anchored in structured user database records; never fabricated.
- **Honest Mentor Rule** — No flattering clichés; performance-neutral, evidence-based feedback only when authenticated data supports it.
- **AI Quota & Resilience Architecture** — Multi-tier model fallback chain (`gemini-2.5-flash` → `gemini-3.7-flash` → `gemini-2.5-flash-lite`) with automatic failover, per-model cooldowns, in-flight request deduplication, per-user rate limiting, controlled back-off with jitter, and a deterministic local DayTrace Coaching Engine as the final fallback. Clean telemetry exposes system health and audit logs.
- **Strict User Data Isolation** — Every database model and query enforces user isolation via `user_id`; users only ever access their own data.

---

## Project Structure

```
daytrace/
├── server.ts                          # Express + Vite entry point (dev middleware / static prod)
├── vite.config.ts                     # Vite + React + Tailwind configuration
├── netlify.toml                        # Netlify deployment configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies and scripts
│
├── server/                              # Backend (Express + TypeScript)
│   ├── app.ts                           # API routes: auth, data sync, goals, projects,
│   │                                    # tasks, focus sessions, activity logs, habits,
│   │                                    # time limits, reviews, AI mentor endpoints
│   ├── aiRouter.ts                      # Resilient AI router: multi-model fallback chain,
│   │                                    # cooldowns, rate limits, JSON repair, telemetry
│   ├── mentorEngine.ts                  # AI mentor system instructions + prompt builder +
│   │                                    # natural offline fallback conversation engine
│   └── db.ts                            # JSON file-based data layer (users, profiles, tasks,
│                                        # goals, projects, habits, activity logs, reviews)
│
├── netlify/functions/                  # Netlify serverless function deployment
│
├── src/                                # Frontend (React + TypeScript + Tailwind CSS)
│   ├── main.tsx                         # React application entry
│   ├── App.tsx                          # Application shell & routing between views
│   ├── types.ts                         # Shared domain types (tasks, logs, goals, reviews)
│   ├── index.css                        # Global styles
│   │
│   ├── components/                     # Shared UI components
│   │   ├── AuthView.tsx                 # Sign up / log in / password reset
│   │   ├── Sidebar.tsx                  # Navigation sidebar & mobile menu
│   │   ├── OnboardingModal.tsx          # First-run profile setup
│   │   ├── WelcomeBanner.tsx            # Personalized welcome experience
│   │   ├── ActiveTimerHUD.tsx           # Persistently visible focus timer
│   │   ├── QuickLogModal.tsx            # Quick activity entry
│   │   ├── InterruptionModal.tsx        # Interruption capture
│   │   ├── PhilosophyModal.tsx          # Product philosophy reference
│   │   │
│   │   └── views/                      # Feature views
│   │       ├── DashboardView.tsx        # Overview of today
│   │       ├── PlanTomorrowView.tsx     # Realistic future-day planning + advisory
│   │       ├── FocusView.tsx            # Focus timer & sessions
│   │       ├── ActivityLogView.tsx      # Activity audit trail
│   │       ├── GoalsProjectsView.tsx    # Goals & connected projects
│   │       ├── HabitsStreaksView.tsx    # Habit consistency & streaks
│   │       ├── AnalyticsView.tsx        # Time analytics & category breakdowns
│   │       ├── WeeklyReviewView.tsx     # 7-day review with AI mentor report
│   │       ├── MonthlyReviewView.tsx    # Monthly review
│   │       ├── GrowthTimelineView.tsx   # Month-over-month progress
│   │       ├── AIMentorView.tsx         # Live streaming mentor chat
│   │       └── SettingsView.tsx         # Profile, preferences, exports
│   │
│   ├── context/
│   │   └── AppContext.tsx               # Global state: auth, user data, timers, review
│   │
│   ├── utils/
│   │   ├── dateUtils.ts                  # Date helpers and week/month boundaries
│   │   ├── pdfExport.ts                  # PDF report generation
│   │   ├── csvExport.ts                  # CSV data export
│   │   └── sound.ts                      # UI sound utilities
│   │
│   └── data/
│       └── seedData.ts                  # Initial seed models (no fabricated user stats)
│
└── assets/                             # Static assets
```

## Core Architecture Highlights

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Motion for animations, and Lucide icons.
- **Backend:** Express with typed REST APIs, JWT authentication, bcrypt password hashing, and a shared, isolated per-user JSON data store.
- **AI Layer:** Google Gemini SDK wired through the `aiRouter`, with a strict model priority chain, automatic failover, structured JSON validation and repair, streaming SSE chat, and a local deterministic coaching engine as the guaranteed last-resort fallback — so the AI Mentor stays honest and available.
- **Single Source of Truth for Calculations:** Centralized math is shared across Dashboard, Daily Review, Weekly Review, Monthly Review, AI Mentor, and report Exports — one consistent definition of every completion rate, focus time, and streak.

---

## Trust & Data Standards

DayTrace is engineered around the following non-negotiable standards:

1. **Real data only** — every metric is computed from stored user records. No placeholders, no dummy values, no hardcoded percentages, no fake streaks.
2. **Unfinished tasks are not user failures** — postponed, cancelled, and missed tasks are explicitly categorized and never blurred in analysis.
3. **Unplanned responsibilities are never waste** — family care, household, emergency, and errands are tracked as `UNPLANNED_RESPONSIBILITY`.
4. **Honest analysis without judgment** — distractions are recorded contextually, with fair commentary such as historical averages rather than shame.
5. **Grounded AI** — the AI Mentor never invents tasks, goals, or statistics; it surfaces authentic patterns and absent data honestly.
6. **Meaningful empty states** — new users see clean, encouraging starting states instead of zero-failure metrics.
7. **Preserved history** — records persist across days, weeks, months, and years; never overwritten by fresh periods.
8. **Graceful resilience** — errors are caught gracefully, user input is preserved, AI failures fall back to local engines, and outages are communicated transparently.
9. **Zero dark patterns** — no urgency, no guilt, no manipulation.