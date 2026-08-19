import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface UserProfileRecord {
  userId: string;
  role?: string;
  customRole?: string;
  custom_role?: string;
  occupation: string;
  dailyCapacityHours: number;
  mainGoalsSummary: string | string[];
  timezone: string;
  theme: 'dark' | 'light' | 'system';
  soundEffects: boolean;
  notificationsEnabled: boolean;
  onboarded: boolean;
  welcomeDismissed?: boolean;
  updatedAt: string;
}

export interface GoalRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  targetHours: number;
  currentHours: number;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  goalId?: string;
  name: string;
  description: string;
  deadline?: string;
  status: 'active' | 'completed' | 'on_hold';
  timeSpentMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  projectId?: string;
  goalId?: string;
  date: string; // YYYY-MM-DD
  name: string;
  priority: 'must' | 'should' | 'could';
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  rolledOver?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSessionRecord {
  id: string;
  userId: string;
  taskId?: string;
  activityName: string;
  category: 'DEEP_WORK' | 'SHALLOW_WORK' | 'LEARNING' | 'CHORES' | 'FAMILY' | 'DISTRACTION' | 'REST';
  startedAt: number;
  pausedAt?: number;
  resumedAt?: number;
  endedAt?: number;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  isInterruption?: boolean;
  interruptionType?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLogRecord {
  id: string;
  userId: string;
  goalId?: string;
  projectId?: string;
  taskId?: string;
  date: string; // YYYY-MM-DD
  activityName: string;
  category: 'DEEP_WORK' | 'SHALLOW_WORK' | 'LEARNING' | 'CHORES' | 'FAMILY' | 'DISTRACTION' | 'REST';
  durationMinutes: number;
  isInterruption: boolean;
  interruptionType?: 'family' | 'errand' | 'tech_issue' | 'urgent_chore' | 'other';
  notes?: string;
  timestamp: string;
}

export interface TimeLimitRecord {
  id: string;
  userId: string;
  activityName: string;
  limitMinutes: number;
  period: 'daily' | 'weekly';
}

export interface HabitRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequencyPerWeek: number;
  streakCount: number;
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  userId: string;
  type: 'weekly' | 'monthly';
  periodLabel: string; // e.g. "Aug 10 - Aug 16, 2026" or "August 2026"
  startDate: string;
  endDate: string;
  dataSummary: Record<string, unknown>;
  aiMentorReport?: Record<string, unknown>;
  userReflection?: string;
  createdAt: string;
}

export interface GrowthMilestoneRecord {
  id: string;
  userId: string;
  month: string;
  theme: string;
  focusHours: number;
  goalsReached: number;
  projectsCompleted: number;
  highlights: string[];
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  profiles: UserProfileRecord[];
  goals: GoalRecord[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
  focusSessions: FocusSessionRecord[];
  activityLogs: ActivityLogRecord[];
  timeLimits: TimeLimitRecord[];
  habits: HabitRecord[];
  reviews: ReviewRecord[];
  growthMilestones: GrowthMilestoneRecord[];
}

const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.VERCEL
);
const DATA_DIR = isServerless ? path.join('/tmp', 'daytrace_data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'daytrace.json');

class DatabaseService {
  private data: DatabaseSchema = {
    users: [],
    profiles: [],
    goals: [],
    projects: [],
    tasks: [],
    focusSessions: [],
    activityLogs: [],
    timeLimits: [],
    habits: [],
    reviews: [],
    growthMilestones: [],
  };

  private isLoaded = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.load();
  }

  private ensureDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Filesystem access warning (operating in-memory mode if disk is read-only):', err);
    }
  }

  private load() {
    try {
      this.ensureDir();
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          profiles: parsed.profiles || [],
          goals: parsed.goals || [],
          projects: parsed.projects || [],
          tasks: parsed.tasks || [],
          focusSessions: parsed.focusSessions || [],
          activityLogs: parsed.activityLogs || [],
          timeLimits: parsed.timeLimits || [],
          habits: parsed.habits || [],
          reviews: parsed.reviews || [],
          growthMilestones: parsed.growthMilestones || [],
        };
      } else {
        this.saveSync();
      }
    } catch (err) {
      console.error('Error loading database file, initializing clean in-memory database:', err);
    }
    this.isLoaded = true;
  }

  private saveSync() {
    try {
      this.ensureDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      // In serverless environments where disk writes might be restricted, keep state in-memory safely
      console.warn('Database save warning (persisting in memory):', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSync();
      this.saveTimeout = null;
    }, 50);
  }

  // --- Users & Profiles ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): UserRecord {
    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      ...user,
      email: user.email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Create default profile for user
    const defaultProfile: UserProfileRecord = {
      userId: newUser.id,
      occupation: 'Professional / Builder',
      dailyCapacityHours: 4.5,
      mainGoalsSummary: [],
      timezone: 'UTC',
      theme: 'dark',
      soundEffects: true,
      notificationsEnabled: true,
      onboarded: false,
      updatedAt: new Date().toISOString(),
    };
    this.data.profiles.push(defaultProfile);

    // Create default sensible time limit boundaries
    this.data.timeLimits.push(
      {
        id: crypto.randomUUID(),
        userId: newUser.id,
        activityName: 'YouTube / Video Streaming',
        limitMinutes: 30,
        period: 'daily',
      },
      {
        id: crypto.randomUUID(),
        userId: newUser.id,
        activityName: 'Social Media / Feeds',
        limitMinutes: 20,
        period: 'daily',
      }
    );

    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  public getUserProfile(userId: string): UserProfileRecord {
    let profile = this.data.profiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        userId,
        occupation: 'Professional / Builder',
        dailyCapacityHours: 4.5,
        mainGoalsSummary: [],
        timezone: 'UTC',
        theme: 'dark',
        soundEffects: true,
        notificationsEnabled: true,
        onboarded: false,
        updatedAt: new Date().toISOString(),
      };
      this.data.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfileRecord>): UserProfileRecord {
    const idx = this.data.profiles.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      const newProfile: UserProfileRecord = {
        userId,
        occupation: updates.occupation || 'Professional / Builder',
        dailyCapacityHours: updates.dailyCapacityHours || 4.5,
        mainGoalsSummary: updates.mainGoalsSummary || [],
        timezone: updates.timezone || 'UTC',
        theme: updates.theme || 'dark',
        soundEffects: updates.soundEffects ?? true,
        notificationsEnabled: updates.notificationsEnabled ?? true,
        onboarded: updates.onboarded ?? false,
        updatedAt: new Date().toISOString(),
      };
      this.data.profiles.push(newProfile);
      this.save();
      return newProfile;
    }
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.profiles[idx];
  }

  // --- Complete User Dataset for authenticated user ---
  public getUserData(userId: string) {
    const user = this.findUserById(userId);
    if (!user) return null;
    const profile = this.getUserProfile(userId);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      profile,
      goals: this.data.goals.filter((g) => g.userId === userId),
      projects: this.data.projects.filter((p) => p.userId === userId),
      tasks: this.data.tasks.filter((t) => t.userId === userId),
      focusSessions: this.data.focusSessions.filter((s) => s.userId === userId),
      activityLogs: this.data.activityLogs.filter((a) => a.userId === userId),
      timeLimits: this.data.timeLimits.filter((l) => l.userId === userId),
      habits: this.data.habits.filter((h) => h.userId === userId),
      reviews: this.data.reviews.filter((r) => r.userId === userId),
      growthMilestones: this.data.growthMilestones.filter((m) => m.userId === userId),
    };
  }

  // --- Goals ---
  public createGoal(userId: string, goal: Omit<GoalRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): GoalRecord {
    const newGoal: GoalRecord = {
      id: crypto.randomUUID(),
      userId,
      ...goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  public updateGoal(userId: string, id: string, updates: Partial<GoalRecord>): GoalRecord | null {
    const idx = this.data.goals.findIndex((g) => g.id === id && g.userId === userId);
    if (idx === -1) return null;
    this.data.goals[idx] = {
      ...this.data.goals[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.goals[idx];
  }

  public deleteGoal(userId: string, id: string): boolean {
    const idx = this.data.goals.findIndex((g) => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    this.data.goals.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Projects ---
  public createProject(userId: string, project: Omit<ProjectRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): ProjectRecord {
    const newProject: ProjectRecord = {
      id: crypto.randomUUID(),
      userId,
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.projects.push(newProject);
    this.save();
    return newProject;
  }

  public updateProject(userId: string, id: string, updates: Partial<ProjectRecord>): ProjectRecord | null {
    const idx = this.data.projects.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.projects[idx];
  }

  public deleteProject(userId: string, id: string): boolean {
    const idx = this.data.projects.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.data.projects.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Tasks ---
  public createTask(userId: string, task: Omit<TaskRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TaskRecord {
    const newTask: TaskRecord = {
      id: crypto.randomUUID(),
      userId,
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public updateTask(userId: string, id: string, updates: Partial<TaskRecord>): TaskRecord | null {
    const idx = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.tasks[idx];
  }

  public deleteTask(userId: string, id: string): boolean {
    const idx = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Focus Sessions ---
  public createFocusSession(userId: string, session: Omit<FocusSessionRecord, 'id' | 'userId' | 'createdAt'>): FocusSessionRecord {
    const newSession: FocusSessionRecord = {
      id: crypto.randomUUID(),
      userId,
      ...session,
      createdAt: new Date().toISOString(),
    };
    this.data.focusSessions.push(newSession);
    this.save();
    return newSession;
  }

  public updateFocusSession(userId: string, id: string, updates: Partial<FocusSessionRecord>): FocusSessionRecord | null {
    const idx = this.data.focusSessions.findIndex((s) => s.id === id && s.userId === userId);
    if (idx === -1) return null;
    this.data.focusSessions[idx] = {
      ...this.data.focusSessions[idx],
      ...updates,
    };
    this.save();
    return this.data.focusSessions[idx];
  }

  // --- Activity Logs ---
  public createActivityLog(userId: string, log: Omit<ActivityLogRecord, 'id' | 'userId'>): ActivityLogRecord {
    const newLog: ActivityLogRecord = {
      id: crypto.randomUUID(),
      userId,
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    };
    this.data.activityLogs.push(newLog);

    // If linked to goal or project, increment their hours
    if (newLog.goalId) {
      const g = this.data.goals.find((goal) => goal.id === newLog.goalId && goal.userId === userId);
      if (g) {
        g.currentHours = Math.round((g.currentHours + (newLog.durationMinutes / 60)) * 10) / 10;
      }
    }
    if (newLog.projectId) {
      const p = this.data.projects.find((proj) => proj.id === newLog.projectId && proj.userId === userId);
      if (p) {
        p.timeSpentMinutes += newLog.durationMinutes;
      }
    }

    this.save();
    return newLog;
  }

  public deleteActivityLog(userId: string, id: string): boolean {
    const idx = this.data.activityLogs.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return false;
    this.data.activityLogs.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Time Limits ---
  public setTimeLimits(userId: string, limits: Array<Omit<TimeLimitRecord, 'userId'>>): TimeLimitRecord[] {
    // Remove existing
    this.data.timeLimits = this.data.timeLimits.filter((l) => l.userId !== userId);
    const newLimits = limits.map((l) => ({
      id: l.id || crypto.randomUUID(),
      userId,
      activityName: l.activityName,
      limitMinutes: l.limitMinutes,
      period: l.period || 'daily',
    }));
    this.data.timeLimits.push(...newLimits);
    this.save();
    return newLimits;
  }

  // --- Habits ---
  public createHabit(userId: string, habit: Omit<HabitRecord, 'id' | 'userId' | 'createdAt'>): HabitRecord {
    const newHabit: HabitRecord = {
      id: crypto.randomUUID(),
      userId,
      ...habit,
      createdAt: new Date().toISOString(),
    };
    this.data.habits.push(newHabit);
    this.save();
    return newHabit;
  }

  public updateHabit(userId: string, id: string, updates: Partial<HabitRecord>): HabitRecord | null {
    const idx = this.data.habits.findIndex((h) => h.id === id && h.userId === userId);
    if (idx === -1) return null;
    this.data.habits[idx] = {
      ...this.data.habits[idx],
      ...updates,
    };
    this.save();
    return this.data.habits[idx];
  }

  public deleteHabit(userId: string, id: string): boolean {
    const idx = this.data.habits.findIndex((h) => h.id === id && h.userId === userId);
    if (idx === -1) return false;
    this.data.habits.splice(idx, 1);
    this.save();
    return true;
  }

  public toggleHabitDate(userId: string, habitId: string, dateStr: string): HabitRecord | null {
    const habit = this.data.habits.find((h) => h.id === habitId && h.userId === userId);
    if (!habit) return null;

    const exists = habit.completedDates.includes(dateStr);
    if (exists) {
      habit.completedDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      habit.completedDates.push(dateStr);
    }

    // Recalculate streak
    const dates = [...habit.completedDates].sort();
    let currentStreak = 0;
    let maxStreak = 0;

    // Simple consecutive day calculation
    const today = new Date();
    const dateSet = new Set(dates);
    
    // Check backwards from today or yesterday
    let checkDate = new Date();
    let checkStr = checkDate.toISOString().split('T')[0];
    if (!dateSet.has(checkStr)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    while (dateSet.has(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    habit.streakCount = currentStreak;
    habit.bestStreak = Math.max(habit.bestStreak || 0, currentStreak);

    this.save();
    return habit;
  }

  // --- Reviews ---
  public saveReview(userId: string, review: Omit<ReviewRecord, 'id' | 'userId' | 'createdAt'>): ReviewRecord {
    const newReview: ReviewRecord = {
      id: crypto.randomUUID(),
      userId,
      ...review,
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.push(newReview);
    this.save();
    return newReview;
  }

  // --- Sync Batch State ---
  public syncUserData(userId: string, state: Partial<{
    profile: Partial<UserProfileRecord>;
    goals: GoalRecord[];
    projects: ProjectRecord[];
    tasks: TaskRecord[];
    focusSessions: FocusSessionRecord[];
    activityLogs: ActivityLogRecord[];
    timeLimits: TimeLimitRecord[];
    habits: HabitRecord[];
  }>) {
    if (state.profile) {
      this.updateUserProfile(userId, state.profile);
    }
    if (state.goals) {
      this.data.goals = this.data.goals.filter((g) => g.userId !== userId).concat(
        state.goals.map((g) => ({ ...g, userId }))
      );
    }
    if (state.projects) {
      this.data.projects = this.data.projects.filter((p) => p.userId !== userId).concat(
        state.projects.map((p) => ({ ...p, userId }))
      );
    }
    if (state.tasks) {
      this.data.tasks = this.data.tasks.filter((t) => t.userId !== userId).concat(
        state.tasks.map((t) => ({ ...t, userId }))
      );
    }
    if (state.activityLogs) {
      this.data.activityLogs = this.data.activityLogs.filter((a) => a.userId !== userId).concat(
        state.activityLogs.map((a) => ({ ...a, userId }))
      );
    }
    if (state.timeLimits) {
      this.data.timeLimits = this.data.timeLimits.filter((l) => l.userId !== userId).concat(
        state.timeLimits.map((l) => ({ ...l, userId }))
      );
    }
    if (state.habits) {
      this.data.habits = this.data.habits.filter((h) => h.userId !== userId).concat(
        state.habits.map((h) => ({ ...h, userId }))
      );
    }
    this.save();
    return this.getUserData(userId);
  }
}

export const db = new DatabaseService();
