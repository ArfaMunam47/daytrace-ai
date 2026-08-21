export type ViewMode =
  | 'DASHBOARD'
  | 'PLAN_TOMORROW'
  | 'FOCUS'
  | 'ACTIVITY_LOG'
  | 'GOALS_PROJECTS'
  | 'HABITS_STREAKS'
  | 'ANALYTICS'
  | 'WEEKLY_REVIEW'
  | 'MONTHLY_REVIEW'
  | 'AI_MENTOR'
  | 'SETTINGS'
  | 'GROWTH_TIMELINE';

export type ActivityCategory =
  | 'PRODUCTIVE'
  | 'PERSONAL'
  | 'ENTERTAINMENT'
  | 'RESPONSIBILITY'
  | 'DEEP_WORK'
  | 'SHALLOW_WORK'
  | 'LEARNING'
  | 'CHORES'
  | 'FAMILY'
  | 'DISTRACTION'
  | 'REST';

export type PriorityTier = 'MUST_DO' | 'SHOULD_DO' | 'OPTIONAL' | 'COULD_DO' | 'must' | 'should' | 'could';

export type InterruptionType =
  | 'FAMILY'
  | 'CHORES'
  | 'ERRANDS'
  | 'WORK_EMERGENCY'
  | 'HEALTH'
  | 'OTHER'
  | 'family'
  | 'household'
  | 'visitor'
  | 'phone_call'
  | 'meal'
  | 'unexpected_work'
  | 'emergency'
  | 'errand'
  | 'tech_issue'
  | 'urgent_chore'
  | 'other';

export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export type UserRoleIdentifier =
  | 'student'
  | 'software_developer'
  | 'designer'
  | 'entrepreneur'
  | 'freelancer'
  | 'business_professional'
  | 'content_creator'
  | 'researcher'
  | 'teacher'
  | 'job_seeker'
  | 'employee'
  | 'homemaker'
  | 'other';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRoleIdentifier;
  customRole?: string;
  custom_role?: string;
  occupation: string;
  dailyCapacityHours: number;
  mainGoalsSummary?: string;
  typicalResponsibilities?: string[];
  onboarded: boolean;
  welcomeDismissed?: boolean;
  timezone: string;
  theme?: 'dark' | 'light' | 'system';
  soundEffects?: boolean;
  notificationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlannedTask {
  id: string;
  userId?: string;
  projectId?: string;
  goalId?: string;
  date: string; // YYYY-MM-DD
  name: string;
  category?: ActivityCategory;
  priorityTier: PriorityTier;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  orderIndex: number;
  postponedCount?: number;
  rolledOver?: boolean;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string;
  goalId?: string;
  projectId?: string;
  taskId?: string;
  date: string; // YYYY-MM-DD
  activityName: string;
  category: ActivityCategory;
  durationMinutes: number;
  isInterruption: boolean;
  interruptionType?: InterruptionType;
  notes?: string;
  timestamp: string; // ISO String
}

export type ActivityLog = ActivityLogItem;

export interface Goal {
  id: string;
  userId?: string;
  name: string;
  description: string;
  category: 'PRODUCTIVE' | 'PERSONAL' | string;
  targetHours: number;
  currentHours: number;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  status: 'active' | 'completed' | 'paused' | 'in_progress';
  createdAt?: string;
}

export interface Project {
  id: string;
  userId?: string;
  goalId?: string;
  name: string;
  description: string;
  deadline?: string;
  status: 'active' | 'completed' | 'on_hold';
  timeSpentMinutes: number;
  createdAt?: string;
}

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  description: string;
  frequencyPerWeek: number;
  streakCount: number;
  bestStreak: number;
  completedDates: string[];
  createdAt?: string;
}

export interface DistractionLimit {
  id: string;
  userId?: string;
  activityName: string;
  limitMinutes: number;
  period?: 'daily' | 'weekly';
}

export type TimeLimitBoundary = DistractionLimit;

export interface ActiveTimerSession {
  id?: string;
  taskId?: string;
  taskName?: string;
  goalId?: string;
  projectId?: string;
  activityName?: string;
  category: ActivityCategory;
  mode?: 'countdown' | 'stopwatch';
  plannedMinutes: number;
  startedAt: number;
  pausedAt?: number | null;
  resumedAt?: number;
  accumulatedSeconds?: number;
  totalPausedMs: number;
  status: 'running' | 'paused' | 'idle';
  isInterruption?: boolean;
  interruptionType?: InterruptionType;
  isDistractionBoundary?: boolean;
  notes?: string;
}

export interface DailyReflection {
  id?: string;
  userId?: string;
  date: string;
  honestScore?: number;
  rating?: number;
  accomplished?: string;
  whatWentWell?: string;
  interrupted?: string;
  distracted?: string;
  improveTomorrow?: string;
  frictionReason?: string;
  aiFeedbackSummary?: string;
  createdAt?: string;
}

export interface AIMentorReport {
  score: number;
  scoreGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'Needs Realignment' | string;
  summary: string;
  wins?: string[];
  problems?: string[];
  patterns?: string[];
  realityCheck?: string;
  recommendations?: string[];
  nextWeekFocus?: string;
  strengths?: string[];
  blindSpots?: string[];
  nextWeekAdvice?: string[];
}

export interface WeeklyReviewData {
  id: string;
  userId?: string;
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
  weekStart?: string;
  weekEnd?: string;
  totalFocusMinutes: number;
  plannedFocusMinutes: number;
  executionRate?: number;
  executionPercentage?: number;
  completedTasksCount: number;
  totalTasksCount?: number;
  unfinishedTasksCount?: number;
  distractionMinutes: number;
  responsibilityMinutes: number;
  habitConsistency?: number;
  categoryBreakdown?: Record<string, number>;
  aiMentorReport?: AIMentorReport;
  userReflection?: string;
  keyTakeaways?: string;
  createdAt?: string;
}

export type WeeklyReview = WeeklyReviewData;

export interface MonthlyReviewData {
  id: string;
  userId?: string;
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
  monthStr: string;
  totalFocusMinutes?: number;
  totalFocusHours: number;
  plannedFocusMinutes?: number;
  executionRate?: number;
  completedProjectsCount?: number;
  activeGoalsCount?: number;
  habitConsistency?: number;
  habitConsistencyAvg?: number;
  responsibilityHours: number;
  distractionHours: number;
  responsibilityMinutes?: number;
  distractionMinutes?: number;
  topActivities?: Array<{ name: string; minutes: number }>;
  categoryBreakdown?: Record<string, number>;
  aiMentorReport?: AIMentorReport;
  userReflection?: string;
  createdAt?: string;
}

export type MonthlyReview = MonthlyReviewData;

export interface TimelineMonth {
  id?: string;
  userId?: string;
  month: string;
  monthName?: string;
  year?: number;
  theme?: string;
  focusHours: number;
  goalsReached?: number;
  goalsAdvancedCount?: number;
  projectsCompleted: number;
  highlights?: string[];
  keyAccomplishments?: string[];
  executionRateAvg?: number;
  reflectionSummary?: string;
}

export type GrowthMilestone = TimelineMonth;

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  source?: string;
  fallbackUsed?: boolean;
  isStreaming?: boolean;
}

export type MentorPanelState = 'docked' | 'expanded' | 'collapsed';
