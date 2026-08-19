# DayTrace — Production Rules, Data Standard, User Trust & Welcome Experience

These rules are permanent specifications for DayTrace:

1. **Product Purpose & Real Human Life**: PLAN → FOCUS → RECORD → REVIEW → ADJUST → GROW. Flexible, realistic planning that accounts for real life (unplanned household/family responsibilities, fatigue, and delays are not failures).
2. **Zero Fake Data**: No placeholder users (no "Alex", "Jane", "John", "Demo User"), no simulated stats, no fake streaks or reports. Unauthenticated visitors see the public Auth screen. Clean empty states ("Not enough data yet") are shown when data is new.
3. **Planned vs Actual Distinction**: Always distinguish between what was planned and what actually occurred. Historical records preserve reality.
4. **Completion Rate Standard**: `(Completed Planned Tasks / Total Planned Tasks) * 100`. If 0 planned tasks, show `"No planned tasks"` (never show 0% as failure).
5. **Postponed Tasks Classification**: Track `Completed`, `Postponed`, `Cancelled`, and `Missed / Incomplete` separately. Postponed is not automatically failed.
6. **Interruption & Responsibility Classification**: `UNPLANNED_RESPONSIBILITY` (family, emergencies, chores) is separated from `DISTRACTION` and never labeled as wasted time.
7. **Distraction Tracking**: Factual, non-judgmental analysis with historical context.
8. **Grounded AI Analysis**: AI must never hallucinate user tasks, achievements, streaks, or numbers. Only analyze real stored records.
9. **Honest AI Mentoring**: Objective, respectful, evidence-based analyst. No false flatteries ("Great job!") unless supported by data.
10. **Daily Review**: 8-question structured reflection + 1 primary actionable step + `[Plan Tomorrow]` CTA.
11. **Weekly Review & Real Export**: 7-day authentic audit + downloadable report with real user data, patterns, honest assessment, and recommendations.
12. **Long-Term History**: Preserve historical records across days, weeks, months, and years.
13. **Streak Integrity**: Increments only on qualifying activity; never on app opens.
14. **Strict User Data Isolation**: Server-enforced authorization via `userId` on all database models. Zero cross-user data access.
15. **Error Trust & Resilience**: Preserve user input on errors; multi-tier model fallback (`gemini-3.7-flash` → `gemini-2.5-flash` → `gemini-2.5-flash-lite` → Local DayTrace Coaching Engine).
16. **Responsive UI Precision**: Native experience across mobile, tablet, and desktop.
17. **Personalized Welcome Experience**: Friendly, dismissible first-time banner after onboarding using the real user's first name, explaining PLAN → TRACK → REVIEW → IMPROVE, with the core philosophy statement and `[Plan My Day]` CTA.
18. **Zero Dark Patterns**: No shame, false urgency, or artificial guilt.
19. **Single Source of Truth**: Centralized, identical calculations across Dashboard, Reviews, AI, and Exports.

