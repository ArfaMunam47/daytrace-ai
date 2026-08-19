# DayTrace — Production Rules, Data Standard, User Trust & Welcome Experience

These are permanent, application-level rules and the source of truth for DayTrace.
Every feature, calculation, view, workflow, AI response, report, export, and user interaction must strictly adhere to these rules across:
- Dashboard
- Daily Planning
- Tasks & Priority Blocks
- Goals & Milestones
- Focus Tracking & Timers
- Activity Logs & Audit History
- Streaks & Habit Records
- Analytics & Telemetry
- Daily Reviews & Evening Reflection
- Weekly & Monthly Reviews
- Report Exports (PDF/JSON/Text)
- AI Mentor Analysis & Stream Fallbacks
- Onboarding & Welcome Flow
- Profile & Settings

---

## 1. DayTrace Core Philosophy (Real Human Life)
DayTrace is NOT a rigid 24-hour scheduling application. It is designed around REAL HUMAN LIFE.
- People have unexpected interruptions, household/family responsibilities, fluctuating energy levels, delays, distractions, and imperfect days.
- **Never judge productivity solely by whether every planned task was completed.**
- **An unfinished task is NOT automatically a user failure.**
- **Completing many trivial tasks does NOT automatically make a day productive.**
- DayTrace helps users understand:
  1. What they planned
  2. What actually happened
  3. Why there was a difference
  4. What patterns are repeating
  5. What they should change next

---

## 2. Planned vs. Actual
Always distinguish between **PLANNED** and **ACTUAL**.
- Example: Planned = Study React (2h), Actual = Studied React (1h 20m).
- Never pretend planned values were actual values.
- Historical records must represent what actually occurred.

---

## 3. Productivity Calculations & No Fake Data
- All metrics, execution rates, focus times, distraction times, and streaks MUST be calculated from real, stored user records.
- Never use dummy values, placeholder statistics, hardcoded percentages, or fabricated streaks.
- If insufficient data exists, display: `"Not enough data yet."` or `"No activity recorded yet."`

---

## 4. Completion Rate Definition
- Completion Rate formula: `(Completed Planned Tasks / Total Planned Tasks) * 100`
- Only include tasks that were part of the user's actual daily plan. Exclude deleted, cancelled, or dummy tasks.
- If Total Planned Tasks is 0: Display `"No planned tasks."` (never display 0% as if the user failed).

---

## 5. Postponed Tasks Handling
A postponed task is NOT automatically a failed task.
- Explicitly categorize and track:
  - `Completed`
  - `Postponed`
  - `Cancelled`
  - `Missed / Incomplete`
- This distinction must be preserved across analytics, reviews, and exported reports.

---

## 6. Interruption & Responsibility Classification
- Unplanned events (family needs, household chores, emergencies, caretaking) are classified as `UNPLANNED_RESPONSIBILITY` or `INTERRUPTIONS` and are **NEVER categorized as wasted time or user failure**.
- Distinguish between:
  1. `PLANNED_WORK` / `DEEP_WORK` / `CREATIVE` / `LEARNING`
  2. `UNPLANNED_RESPONSIBILITY` / `FAMILY_CARE` / `HOUSEHOLD` / `EMERGENCY`
  3. `INTERRUPTIONS`
  4. `DISTRACTIONS` / `ENTERTAINMENT` / `SOCIAL_MEDIA`
  5. `REST` / `RECOVERY` / `MEALS`
  6. `UNKNOWN` / `UNTRACKED`

---

## 7. Distraction & Social Media Tracking
- Record digital entertainment/social media usage honestly without shaming.
- Provide factual, non-judgmental analysis with historical context (e.g., "You spent 82m on social media today. That was 24m higher than your weekly average.").

---

## 8. Grounded AI Analysis (No Hallucinations)
- AI must NEVER invent user tasks, achievements, focus sessions, streaks, goals, or statistics.
- All AI responses must be strictly anchored in structured user database records. If data is absent, state so plainly.

---

## 9. Honest Mentor Rule
- The AI Mentor acts as an objective, constructive mentor—never a blind cheerleader or sycophant.
- Do not output flattering clichés ("Great job!", "You're amazing!", "Perfect day!") unless verified by authentic data.
- If performance is mixed or poor, provide empathetic, evidence-based recommendations. Tone: **HONEST + USEFUL + CONSTRUCTIVE**.

---

## 10. Daily Review Framework
At the end of the day, help the user reflect:
1. What did I plan?
2. What did I complete?
3. What did I postpone?
4. What interrupted me?
5. Where did my time go?
6. What went well?
7. What did not go well?
8. What should I change tomorrow?
- Conclude with **ONE** primary actionable step and a clear `[Plan Tomorrow]` CTA.

---

## 11. Weekly Review Framework
Every weekly review must compute from the user's authentic 7-day logs:
- Planned vs. completed vs. postponed vs. cancelled tasks
- Focus time vs. distraction time vs. unplanned responsibilities
- Goal progress & habit streaks
- Multi-period comparisons where sufficient data exists
- Structured summary: `WHAT WENT WELL`, `WHAT DIDN'T GO WELL`, `BIGGEST PATTERN`, `RECOMMENDATION`, `NEXT ACTION`.

---

## 12. Weekly Report Export
- Users can export/download their weekly review as a clean document.
- Must include: Real user name, date range, daily breakdown, task outcomes, focus/distraction/interruption breakdown, habit progress, key patterns, honest assessment, recommendation, and next action.
- Never export dummy or simulated information.

---

## 13. Long-Term History Preservation
- Preserve historical activity across days, weeks, months, quarters, and years.
- Never wipe or overwrite historical data simply because a new week or month starts.

---

## 14. Streak Integrity
- Streaks increment only on authentic qualifying activity. Never increment purely for opening the app or logging in.
- If a qualifying day is missed, reflect the break accurately and honestly.

---

## 15. Real User Identity (Zero Placeholders)
- Never use fake placeholder names ("Alex", "John", "Jane", "Demo User").
- All personalized views must use the authenticated user's actual registered name (or polite generic greeting like "Welcome to DayTrace" if name is unset).

---

## 16. Strict User Data Isolation
- Every database model and query enforces user isolation via `user_id`.
- User A must never access User B's tasks, logs, goals, habits, reviews, or profile.

---

## 17. Meaningful Empty States
- When a new user has no prior history, display clean, encouraging empty states (e.g., "Your DayTrace journey starts today. Complete your first day to begin building your personal history.") rather than zero-state failure metrics.

---

## 18. Error Trust & Data Preservation
- Catch errors gracefully, preserve user input, retry with backoff only when safe, use fallback AI models, and notify the user transparently if an action fails. Never silently drop data.

---

## 19. AI Quota & Resilience Architecture
- Multi-tier model fallback chain (`gemini-3.7-flash` → `gemini-2.5-flash` → `gemini-2.5-flash-lite` → Local DayTrace Coaching Engine).
- Never claim AI is unlimited; inform user gracefully during upstream outages while preserving input.

---

## 20. Responsive UI Precision
- Support mobile, tablet, and desktop natively with appropriate layout reflow, touch targets (>=44px), and zero horizontal overflow or truncated critical information.

---

## 21. Welcome Experience for New Users
For first-time users after onboarding:
- Display personalized welcome banner:
  - **Title**: `Welcome to DayTrace, {firstName}.` (or `Welcome to DayTrace.`)
  - **Description**: `"DayTrace helps you plan around real life, track what actually happens, and understand your patterns over time."`
  - **Workflow**:
    - `PLAN`: Plan what matters today.
    - `TRACK`: Record what you actually do, including interruptions and unexpected changes.
    - `REVIEW`: See what went well, what didn't, and where your time went.
    - `IMPROVE`: Use your daily and weekly insights to make your next plan more realistic.

---

## 22. Welcome Message Personalization
- Use authenticated user's real first name. Never fabricate "Alex".

---

## 23. Welcome Banner Actions
- Primary CTA: `[Plan My Day]` (navigates directly to daily planning workflow).
- Secondary CTA: `[Explore DayTrace]` (or dismiss).

---

## 24. Welcome Banner Dismissal Persistence
- Persist dismissed state per authenticated user. Never show repetitive welcome messages on every login.
- Always provide access to "How DayTrace Works" via Help/Settings.

---

## 25. Product Philosophy Statement
Include the core philosophy:
> *"DayTrace isn't built around perfect days. It's built around real ones."*
> *"Plans change. Interruptions happen. Progress isn't always linear. DayTrace helps you understand what actually happened so you can make a better plan next time."*

---

## 26. Zero Dark Patterns
- No artificial urgency, shame notifications, manipulative streaks, or guilt-inducing copy.

---

## 27. Single Source of Truth for Calculations
- Shared, centralized math across Dashboard, Daily Review, Weekly Review, Monthly Review, AI Mentor, and Exports.

---

## 28. Development Guardrail Checklist
Verify against:
1. Authenticated user data only
2. Preserved history
3. Core philosophy compliance
4. Standardized calculations
5. Graceful empty states
6. Responsive design
7. Safe error handling
8. Zero fake data
9. Strict user data isolation
10. Preserved existing functionality

---

## 29. Production Launch Principle
Optimize DayTrace for trustworthiness and reliability when a real human uses it every day.
`REAL DATA → HONEST ANALYSIS → USEFUL INSIGHT → ACTIONABLE NEXT STEP → LONG-TERM HISTORY`
