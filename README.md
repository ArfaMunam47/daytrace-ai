# DayTrace

> Adaptive productivity for real human life.

DayTrace is a full-stack intelligent productivity platform that helps you plan around real life, track what actually happens, and understand your patterns over time. It's not another rigid 24-hour scheduler — it's built for the reality that plans change, interruptions happen, and progress isn't always linear.

**Plan. Track. Review. Improve.**

---

## Core Features

### 🗓️ Planning
| Feature | Description |
| --- | --- |
| **Daily Planning** | Realistic daily plans with priority tiers (`Must Do` / `Should Do` / `Optional`) calibrated to your history. |
| **Plan Tomorrow** | Dedicated planning workflow with AI-assisted feasibility advisory. |
| **Goals & Projects** | Long-term goals with target hours, deadlines, and connected projects. |

### ⏱️ Tracking & Focus
| Feature | Description |
| --- | --- |
| **Focus Timers** | Stopwatch and countdown timers with a persistent on-screen HUD. |
| **Activity Logs** | Honest audit trail of what actually happened — with proper category classification. |
| **Interruption Tracking** | Family, chores, and emergencies logged as responsibilities, never as wasted time. |
| **Distraction Boundaries** | Daily and weekly limits on entertainment with proactive prompts. |

### 📈 Habits & Growth
| Feature | Description |
| --- | --- |
| **Habits & Streaks** | Authentic streaks that only count real qualifying activity. |
| **Growth Timeline** | Month-over-month progress across focus hours, goals, and projects. |
| **History Preservation** | Daily, weekly, monthly, and yearly records are never wiped. |

### 🤖 Reviews & AI Mentor
| Feature | Description |
| --- | --- |
| **Daily Review** | Guided reflection: what you planned, completed, postponed, and where your time went. |
| **Weekly & Monthly Reviews** | Structured summaries with honest assessments and clear next actions. |
| **AI Mentor** | Grounded, evidence-based coaching that never invents your data — with live streaming chat. |
| **Report Exports** | Clean PDF, JSON, or CSV exports of your reviews and activity. |

### 🔐 Trust & Reliability
| Feature | Description |
| --- | --- |
| **Grounded AI** | Every analysis is anchored in real user records — zero fabricated statistics. |
| **AI Resilience** | Multi-model fallback chain (`gemini-2.5-flash` → `gemini-3.7-flash` → `gemini-2.5-flash-lite`) with automatic failover and a local deterministic coaching engine. |
| **Data Isolation** | Strict per-user isolation via `user_id` on every model and query. |
| **No Dark Patterns** | No urgency, shame, or manipulation — just honest, useful insight. |

---

## Project Structure

```
daytrace/
│
├── server.ts                     # Express + Vite server entry point
├── vite.config.ts                # Vite / React / Tailwind configuration
├── netlify.toml                  # Netlify deployment config
├── tsconfig.json                 # TypeScript configuration
│
├── server/                       # Backend
│   ├── app.ts                    # REST API routes (auth, tasks, logs, reviews, AI)
│   ├── aiRouter.ts               # Resilient multi-model AI router with fallback chain
│   ├── mentorEngine.ts           # AI Mentor prompts + offline coaching fallback
│   └── db.ts                     # Per-user JSON data layer
│
├── netlify/functions/            # Serverless functions
│
├── src/                          # Frontend
│   ├── main.tsx                  # React entry
│   ├── App.tsx                   # App shell & view routing
│   ├── types.ts                  # Shared domain types
│   ├── index.css                 # Global styles
│   │
│   ├── components/
│   │   ├── views/                # Dashboard, Plan, Focus, Logs, Reviews,
│   │   │                         # Goals, Habits, Analytics, AI Mentor, Settings
│   │   ├── AuthView.tsx          # Sign up / login
│   │   ├── Sidebar.tsx           # Navigation
│   │   ├── OnboardingModal.tsx   # First-run setup
│   │   ├── WelcomeBanner.tsx     # Personalized welcome
│   │   ├── ActiveTimerHUD.tsx    # Persistent focus timer
│   │   ├── QuickLogModal.tsx     # Quick activity entry
│   │   └── InterruptionModal.tsx # Interruption capture
│   │
│   ├── context/
│   │   └── AppContext.tsx        # Global state (auth, data, timers, reviews)
│   │
│   ├── utils/
│   │   ├── dateUtils.ts          # Date helpers
│   │   ├── pdfExport.ts          # PDF reports
│   │   ├── csvExport.ts          # CSV exports
│   │   └── sound.ts              # UI sounds
│   │
│   └── data/
│       └── seedData.ts           # Seed models
│
└── assets/                       # Static assets
```

---

## Architecture

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19 · TypeScript · Tailwind CSS v4 · Vite · Motion |
| **Backend** | Express · JWT auth · bcrypt · per-user JSON data store |
| **AI** | Google Gemini SDK · model fallback chain · streaming SSE · deterministic local fallback engine |

**Single source of truth for all calculations** — completion rates, focus time, and streaks are computed consistently across the Dashboard, Daily/Weekly/Monthly Reviews, AI Mentor, and report exports.

---

## Design Principles

1. **Real data only** — no placeholders, dummy values, or fake streaks.
2. **Unfinished tasks aren't failures** — postponed, cancelled, and missed are distinct statuses.
3. **Responsibilities aren't waste** — family, household, and emergencies are honored, not penalized.
4. **Honest AI** — the mentor never invents achievements or flatters blindly.
5. **History preserved** — your journey is never wiped when a new period starts.
6. **Graceful everywhere** — errors are handled gently, input is preserved, and AI failures fall back safely.

---

*"DayTrace isn't built around perfect days. It's built around real ones."*