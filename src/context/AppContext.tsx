import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ViewMode,
  ActivityCategory,
  PriorityTier,
  InterruptionType,
  UserProfile,
  PlannedTask,
  ActivityLogItem,
  Goal,
  Project,
  Habit,
  DistractionLimit,
  ActiveTimerSession,
  DailyReflection,
  WeeklyReviewData,
  MonthlyReviewData,
  TimelineMonth,
  User,
  AuthStatus,
  UserRoleIdentifier,
} from '../types';
import { getTodayString } from '../utils/dateUtils';

interface AppContextType {
  // Auth
  authStatus: AuthStatus;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (firstName: string, lastName: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; resetCode?: string; error?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  
  // Profile & Onboarding
  profile: UserProfile;
  userProfile: UserProfile;
  updateProfile: (profileUpdates: Partial<UserProfile> & { firstName?: string; lastName?: string }) => Promise<void>;
  completeOnboarding: (
    nameOrParams:
      | string
      | {
          name?: string;
          firstName?: string;
          lastName?: string;
          role?: UserRoleIdentifier;
          customRole?: string;
          occupation?: string;
          dailyCapacityHours?: number;
          mainGoalsSummary?: string;
        },
    legacyOccupation?: string,
    legacyGoalsSummary?: string,
    legacyCapacity?: number
  ) => Promise<{ success: boolean; error?: string }>;

  // Goals & Projects
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'currentHours' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'timeSpentMinutes' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Planned Tasks
  plannedTasks: PlannedTask[];
  addTask: (task: Omit<PlannedTask, 'id' | 'actualMinutes' | 'completed' | 'createdAt' | 'orderIndex'>) => void;
  updateTask: (id: string, updates: Partial<PlannedTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  carryTaskToTomorrow: (id: string) => void;
  reorderTasks: (reordered: PlannedTask[]) => void;

  // Active Timer & Distraction HUD
  activeTimer: ActiveTimerSession | null;
  startTimer: (params: {
    taskName: string;
    category?: ActivityCategory;
    plannedMinutes?: number;
    taskId?: string;
    goalId?: string;
    projectId?: string;
    isDistractionBoundary?: boolean;
    isInterruption?: boolean;
    interruptionType?: InterruptionType;
    distractionLimitId?: string;
  }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishTimer: (accomplishmentNote?: string) => void;
  cancelTimer: () => void;
  addExtraTimeToTimer: (minutes: number) => void;

  // Activity & Interruption Logs
  activityLogs: ActivityLogItem[];
  logActivity: (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  quickLogActivity: (
    activityName: string,
    category: ActivityCategory,
    durationMinutes: number,
    notes?: string,
    goalId?: string,
    projectId?: string
  ) => void;
  deleteActivityLog: (id: string) => void;
  quickLogInterruption: (
    type: InterruptionType,
    activityName: string,
    durationMinutes: number,
    notes?: string
  ) => void;

  // Distraction Boundaries
  distractionLimits: DistractionLimit[];
  updateDistractionLimit: (id: string, newLimitMinutes: number) => void;
  addDistractionLimit: (activityName: string, limitMinutes: number) => void;
  deleteDistractionLimit: (id: string) => void;
  getDistractionUsageToday: (activityNameOrId: string) => number;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streakCount' | 'bestStreak' | 'completedDates' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, dateStr: string) => void;

  // Reflections & Reviews
  reflections: DailyReflection[];
  saveReflection: (reflection: Omit<DailyReflection, 'id' | 'createdAt'>) => void;
  weeklyReviews: WeeklyReviewData[];
  saveWeeklyReview: (review: Omit<WeeklyReviewData, 'id' | 'createdAt'>) => void;
  generateWeeklyReview: (weekStart?: string) => Promise<WeeklyReviewData>;
  monthlyReviews: MonthlyReviewData[];
  saveMonthlyReview: (review: Omit<MonthlyReviewData, 'id' | 'createdAt'>) => void;
  generateMonthlyReview: (monthStr?: string) => Promise<MonthlyReviewData>;
  timelineMonths: TimelineMonth[];

  // Computed Real Live Stats (NO fake numbers!)
  todayStats: {
    focusMinutes: number;
    plannedMinutes: number;
    executionRate: number;
    distractionMinutes: number;
    responsibilityMinutes: number;
    completedCount: number;
    totalTasksCount: number;
    distractionBoundaryExceeded: boolean;
  };

  // Sounds & UI
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (type: 'start' | 'complete' | 'warning' | 'chime') => void;

  // Network & Auth Fetch
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;

  // Backup / Data Export
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonStr: string) => boolean;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE_STRUCT: UserProfile = {
  name: 'User',
  occupation: 'Professional / Builder',
  dailyCapacityHours: 4.5,
  mainGoalsSummary: '',
  typicalResponsibilities: ['Household chores', 'Family commitments', 'Errands & admin'],
  onboarded: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  theme: 'dark',
  soundEffects: true,
  notificationsEnabled: true,
};

const DEFAULT_DISTRACTION_LIMITS: DistractionLimit[] = [
  { id: 'limit-1', activityName: 'YouTube / Video Streaming', limitMinutes: 30 },
  { id: 'limit-2', activityName: 'Social Media / Feeds', limitMinutes: 20 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [authStatus, setAuthStatus] = useState<AuthStatus>('LOADING');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Entities
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE_STRUCT);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [distractionLimits, setDistractionLimits] = useState<DistractionLimit[]>(DEFAULT_DISTRACTION_LIMITS);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReviewData[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReviewData[]>([]);
  const [timelineMonths, setTimelineMonths] = useState<TimelineMonth[]>([]);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimerSession | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer Tick Trigger to re-render stats accurately
  const [, setTimerTick] = useState<number>(0);

  // Authenticated fetch helper
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const activeToken = token || localStorage.getItem('daytrace_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...options.headers,
      };
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('daytrace_token');
      if (!storedToken) {
        setAuthStatus('UNAUTHENTICATED');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const authData = await res.json();
          setUser(authData.user);
          setToken(storedToken);

          const fetchedProfile: UserProfile = {
            ...DEFAULT_PROFILE_STRUCT,
            ...authData.profile,
            name: `${authData.user.firstName} ${authData.user.lastName}`.trim(),
            firstName: authData.user.firstName,
            lastName: authData.user.lastName,
          };
          setProfile(fetchedProfile);
          setAuthStatus('AUTHENTICATED');

          // Load user's database records
          const dataRes = await fetch('/api/data', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (dataRes.ok) {
            const dbData = await dataRes.json();
            setGoals(dbData.goals || []);
            setProjects(dbData.projects || []);
            setPlannedTasks(dbData.tasks || []);
            setActivityLogs(dbData.activityLogs || []);
            setDistractionLimits(dbData.timeLimits?.length ? dbData.timeLimits : DEFAULT_DISTRACTION_LIMITS);
            setHabits(dbData.habits || []);
            setWeeklyReviews(dbData.reviews?.filter((r: any) => r.type === 'weekly') || []);
            setMonthlyReviews(dbData.reviews?.filter((r: any) => r.type === 'monthly') || []);
            setTimelineMonths(dbData.growthMilestones || []);
          }
        } else {
          localStorage.removeItem('daytrace_token');
          setToken(null);
          setUser(null);
          setAuthStatus('UNAUTHENTICATED');
        }
      } catch (err) {
        console.error('Error verifying auth:', err);
        setAuthStatus('UNAUTHENTICATED');
      }
    };

    initAuth();
  }, []);

  // Timer Tick Interval
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    const interval = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Web Audio chime synthesizer
  const playSound = useCallback(
    (type: 'start' | 'complete' | 'warning' | 'chime') => {
      if (!soundEnabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'start') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === 'complete') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.15);
          osc.frequency.setValueAtTime(783.99, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
        } else if (type === 'warning') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.setValueAtTime(293.66, now + 0.2);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        }
      } catch {
        // Fallback
      }
    },
    [soundEnabled]
  );

  // --- Auth Handlers ---

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      localStorage.setItem('daytrace_token', data.token);
      setToken(data.token);
      setUser(data.user);

      const loadedProfile: UserProfile = {
        ...DEFAULT_PROFILE_STRUCT,
        ...data.profile,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      };
      setProfile(loadedProfile);
      setAuthStatus('AUTHENTICATED');

      // Fetch user's persistent data
      const dataRes = await fetch('/api/data', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (dataRes.ok) {
        const dbData = await dataRes.json();
        setGoals(dbData.goals || []);
        setProjects(dbData.projects || []);
        setPlannedTasks(dbData.tasks || []);
        setActivityLogs(dbData.activityLogs || []);
        setDistractionLimits(dbData.timeLimits?.length ? dbData.timeLimits : DEFAULT_DISTRACTION_LIMITS);
        setHabits(dbData.habits || []);
        setWeeklyReviews(dbData.reviews?.filter((r: any) => r.type === 'weekly') || []);
        setMonthlyReviews(dbData.reviews?.filter((r: any) => r.type === 'monthly') || []);
        setTimelineMonths(dbData.growthMilestones || []);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network failure. Please check your connection.' };
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string, confirmPassword?: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      localStorage.setItem('daytrace_token', data.token);
      setToken(data.token);
      setUser(data.user);

      const newProfile: UserProfile = {
        ...DEFAULT_PROFILE_STRUCT,
        ...data.profile,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
      };
      setProfile(newProfile);
      setAuthStatus('AUTHENTICATED');

      setGoals([]);
      setProjects([]);
      setPlannedTasks([]);
      setActivityLogs([]);
      setDistractionLimits(DEFAULT_DISTRACTION_LIMITS);
      setHabits([]);
      setWeeklyReviews([]);
      setMonthlyReviews([]);
      setTimelineMonths([]);

      return { success: true };
    } catch {
      return { success: false, error: 'Network failure. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('daytrace_token');
    setToken(null);
    setUser(null);
    setProfile(DEFAULT_PROFILE_STRUCT);
    setGoals([]);
    setProjects([]);
    setPlannedTasks([]);
    setActivityLogs([]);
    setHabits([]);
    setWeeklyReviews([]);
    setMonthlyReviews([]);
    setTimelineMonths([]);
    setActiveTimer(null);
    setAuthStatus('UNAUTHENTICATED');
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, message: data.message, resetCode: data.resetCode };
    } catch {
      return { success: false, error: 'Failed to process request.' };
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Failed to reset password.' };
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile> & { firstName?: string; lastName?: string }) => {
    const updatedName =
      profileUpdates.firstName || profileUpdates.lastName
        ? `${profileUpdates.firstName || user?.firstName || ''} ${profileUpdates.lastName || user?.lastName || ''}`.trim()
        : profileUpdates.name || profile.name;

    setProfile((prev) => ({
      ...prev,
      ...profileUpdates,
      name: updatedName,
    }));

    if (profileUpdates.firstName || profileUpdates.lastName) {
      setUser((prev) => (prev ? {
        ...prev,
        ...(profileUpdates.firstName ? { firstName: profileUpdates.firstName } : {}),
        ...(profileUpdates.lastName ? { lastName: profileUpdates.lastName } : {}),
      } : null));
    }

    try {
      await authFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileUpdates),
      });
    } catch (err) {
      console.error('Failed to update profile on server:', err);
    }
  };

  // --- Goals CRUD ---

  const addGoal = (goalData: Omit<Goal, 'id' | 'currentHours' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      userId: user?.id,
      currentHours: 0,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);

    authFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    authFetch(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    authFetch(`/api/goals/${id}`, { method: 'DELETE' });
  };

  // --- Projects CRUD ---

  const addProject = (projectData: Omit<Project, 'id' | 'timeSpentMinutes' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      userId: user?.id,
      timeSpentMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);

    authFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    authFetch(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    authFetch(`/api/projects/${id}`, { method: 'DELETE' });
  };

  // --- Planned Tasks CRUD ---

  const addTask = (taskData: Omit<PlannedTask, 'id' | 'actualMinutes' | 'completed' | 'createdAt' | 'orderIndex'>) => {
    const todayTasks = plannedTasks.filter((t) => t.date === taskData.date);
    const newTask: PlannedTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      userId: user?.id,
      actualMinutes: 0,
      completed: false,
      orderIndex: todayTasks.length,
      createdAt: new Date().toISOString(),
    };
    setPlannedTasks((prev) => [newTask, ...prev]);

    authFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  };

  const updateTask = (id: string, updates: Partial<PlannedTask>) => {
    setPlannedTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    authFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  };

  const deleteTask = (id: string) => {
    setPlannedTasks((prev) => prev.filter((t) => t.id !== id));
    authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
  };

  const toggleTaskCompletion = (id: string) => {
    const task = plannedTasks.find((t) => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    updateTask(id, { completed: nextCompleted });
    if (nextCompleted) {
      playSound('complete');
    }
  };

  const carryTaskToTomorrow = (id: string) => {
    const task = plannedTasks.find((t) => t.id === id);
    if (!task) return;

    const curr = new Date(task.date);
    curr.setDate(curr.getDate() + 1);
    const tomorrowStr = curr.toISOString().split('T')[0];

    updateTask(id, {
      date: tomorrowStr,
      postponedCount: (task.postponedCount || 0) + 1,
      rolledOver: true,
    });
  };

  const reorderTasks = (reordered: PlannedTask[]) => {
    const indexed = reordered.map((t, idx) => ({ ...t, orderIndex: idx }));
    setPlannedTasks((prev) => {
      const rest = prev.filter((t) => !indexed.some((it) => it.id === t.id));
      return [...indexed, ...rest];
    });
  };

  // --- Active Timer & Distraction Boundaries ---

  const startTimer = (params: {
    taskName: string;
    category?: ActivityCategory;
    plannedMinutes?: number;
    taskId?: string;
    goalId?: string;
    projectId?: string;
    isDistractionBoundary?: boolean;
    isInterruption?: boolean;
    interruptionType?: InterruptionType;
  }) => {
    const now = Date.now();
    const session: ActiveTimerSession = {
      taskName: params.taskName,
      activityName: params.taskName,
      category: params.category || 'PRODUCTIVE',
      plannedMinutes: params.plannedMinutes || 25,
      startedAt: now,
      pausedAt: null,
      totalPausedMs: 0,
      status: 'running',
      taskId: params.taskId,
      goalId: params.goalId,
      projectId: params.projectId,
      isDistractionBoundary: params.isDistractionBoundary,
      isInterruption: params.isInterruption,
      interruptionType: params.interruptionType,
    };
    setActiveTimer(session);
    playSound('start');

    authFetch('/api/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({
        activityName: params.taskName,
        category: params.category || 'PRODUCTIVE',
        plannedDurationMinutes: params.plannedMinutes || 25,
        taskId: params.taskId,
        isInterruption: params.isInterruption,
        interruptionType: params.interruptionType,
      }),
    });
  };

  const pauseTimer = () => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    setActiveTimer({
      ...activeTimer,
      pausedAt: Date.now(),
      status: 'paused',
    });
  };

  const resumeTimer = () => {
    if (!activeTimer || activeTimer.status !== 'paused') return;
    const now = Date.now();
    const pauseDelta = activeTimer.pausedAt ? now - activeTimer.pausedAt : 0;
    setActiveTimer({
      ...activeTimer,
      pausedAt: null,
      totalPausedMs: activeTimer.totalPausedMs + pauseDelta,
      status: 'running',
    });
  };

  const finishTimer = (accomplishmentNote?: string) => {
    if (!activeTimer) return;
    const now = Date.now();
    const pausedMs = activeTimer.pausedAt
      ? activeTimer.totalPausedMs + (now - activeTimer.pausedAt)
      : activeTimer.totalPausedMs;
    const elapsedMs = Math.max(0, now - activeTimer.startedAt - pausedMs);
    const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

    logActivity({
      date: getTodayString(),
      activityName: activeTimer.taskName || activeTimer.activityName || 'Focus Session',
      category: activeTimer.category,
      durationMinutes: elapsedMinutes,
      isInterruption: !!activeTimer.isInterruption,
      interruptionType: activeTimer.interruptionType,
      goalId: activeTimer.goalId,
      projectId: activeTimer.projectId,
      taskId: activeTimer.taskId,
      notes: accomplishmentNote,
    });

    if (activeTimer.taskId) {
      const task = plannedTasks.find((t) => t.id === activeTimer.taskId);
      if (task) {
        updateTask(activeTimer.taskId, {
          actualMinutes: (task.actualMinutes || 0) + elapsedMinutes,
        });
      }
    }

    setActiveTimer(null);
    playSound('complete');
  };

  const cancelTimer = () => {
    setActiveTimer(null);
  };

  const addExtraTimeToTimer = (minutes: number) => {
    if (!activeTimer) return;
    setActiveTimer({
      ...activeTimer,
      plannedMinutes: activeTimer.plannedMinutes + minutes,
    });
  };

  // --- Activity & Interruption Logs ---

  const logActivity = (logData: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newLog: ActivityLogItem = {
      ...logData,
      id: `log-${Date.now()}`,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (logData.goalId) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === logData.goalId
            ? { ...g, currentHours: Math.round((g.currentHours + logData.durationMinutes / 60) * 10) / 10 }
            : g
        )
      );
    }
    if (logData.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === logData.projectId
            ? { ...p, timeSpentMinutes: p.timeSpentMinutes + logData.durationMinutes }
            : p
        )
      );
    }

    authFetch('/api/activity-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  };

  const quickLogActivity = (
    activityName: string,
    category: ActivityCategory,
    durationMinutes: number,
    notes?: string,
    goalId?: string,
    projectId?: string
  ) => {
    logActivity({
      date: getTodayString(),
      activityName,
      category,
      durationMinutes,
      isInterruption: category === 'RESPONSIBILITY',
      interruptionType: category === 'RESPONSIBILITY' ? 'urgent_chore' : undefined,
      notes,
      goalId,
      projectId,
    });
    playSound('complete');
  };

  const quickLogInterruption = (
    type: InterruptionType,
    activityName: string,
    durationMinutes: number,
    notes?: string
  ) => {
    logActivity({
      date: getTodayString(),
      activityName: activityName || 'Real-life responsibility',
      category: 'RESPONSIBILITY',
      durationMinutes,
      isInterruption: true,
      interruptionType: type,
      notes,
    });
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    authFetch(`/api/activity-logs/${id}`, { method: 'DELETE' });
  };

  // --- Distraction Limits ---

  const updateDistractionLimit = (id: string, newLimitMinutes: number) => {
    const updated = distractionLimits.map((l) =>
      l.id === id ? { ...l, limitMinutes: newLimitMinutes } : l
    );
    setDistractionLimits(updated);
    authFetch('/api/time-limits', {
      method: 'POST',
      body: JSON.stringify({ limits: updated }),
    });
  };

  const addDistractionLimit = (activityName: string, limitMinutes: number) => {
    const newLim: DistractionLimit = {
      id: `limit-${Date.now()}`,
      activityName,
      limitMinutes,
    };
    const updated = [...distractionLimits, newLim];
    setDistractionLimits(updated);
    authFetch('/api/time-limits', {
      method: 'POST',
      body: JSON.stringify({ limits: updated }),
    });
  };

  const deleteDistractionLimit = (id: string) => {
    const updated = distractionLimits.filter((l) => l.id !== id);
    setDistractionLimits(updated);
    authFetch('/api/time-limits', {
      method: 'POST',
      body: JSON.stringify({ limits: updated }),
    });
  };

  const getDistractionUsageToday = (activityNameOrId: string): number => {
    const today = getTodayString();
    const limit = distractionLimits.find(
      (l) => l.id === activityNameOrId || l.activityName.toLowerCase() === activityNameOrId.toLowerCase()
    );
    const targetName = limit ? limit.activityName.toLowerCase() : activityNameOrId.toLowerCase();

    const logged = activityLogs
      .filter(
        (l) =>
          l.date === today &&
          (l.activityName.toLowerCase() === targetName ||
            (limit && (l.category === 'DISTRACTION' || l.category === 'ENTERTAINMENT')))
      )
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    let currentRunning = 0;
    if (
      activeTimer &&
      (activeTimer.taskName?.toLowerCase() === targetName ||
        (limit &&
          (activeTimer.category === 'DISTRACTION' ||
            activeTimer.category === 'ENTERTAINMENT' ||
            activeTimer.isDistractionBoundary)))
    ) {
      const now = Date.now();
      const pausedMs = activeTimer.pausedAt
        ? activeTimer.totalPausedMs + (now - activeTimer.pausedAt)
        : activeTimer.totalPausedMs;
      currentRunning = Math.floor(Math.max(0, now - activeTimer.startedAt - pausedMs) / 60000);
    }

    return logged + currentRunning;
  };

  // --- Habits ---

  const addHabit = (habitData: Omit<Habit, 'id' | 'streakCount' | 'bestStreak' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      userId: user?.id,
      streakCount: 0,
      bestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);

    authFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    authFetch(`/api/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    authFetch(`/api/habits/${id}`, { method: 'DELETE' });
  };

  const toggleHabitDate = (id: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const exists = h.completedDates.includes(dateStr);
        const newDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];

        let currentStreak = 0;
        const set = new Set(newDates);
        const cursor = new Date();
        let cStr = cursor.toISOString().split('T')[0];

        if (!set.has(cStr)) {
          cursor.setDate(cursor.getDate() - 1);
          cStr = cursor.toISOString().split('T')[0];
        }

        while (set.has(cStr)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
          cStr = cursor.toISOString().split('T')[0];
        }

        return {
          ...h,
          completedDates: newDates,
          streakCount: currentStreak,
          bestStreak: Math.max(h.bestStreak || 0, currentStreak),
        };
      })
    );

    authFetch(`/api/habits/${id}/toggle-date`, {
      method: 'POST',
      body: JSON.stringify({ date: dateStr }),
    });
  };

  // --- Reflections & Reviews ---

  const saveReflection = (reflectionData: Omit<DailyReflection, 'id' | 'createdAt'>) => {
    const newRef: DailyReflection = {
      ...reflectionData,
      id: `ref-${Date.now()}`,
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };
    setReflections((prev) => {
      const filtered = prev.filter((r) => r.date !== reflectionData.date);
      return [newRef, ...filtered];
    });
  };

  const saveWeeklyReview = (reviewData: Omit<WeeklyReviewData, 'id' | 'createdAt'>) => {
    const newRev: WeeklyReviewData = {
      ...reviewData,
      id: `rev-w-${Date.now()}`,
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };
    setWeeklyReviews((prev) => [newRev, ...prev]);

    authFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ ...reviewData, type: 'weekly' }),
    });
  };

  const saveMonthlyReview = (reviewData: Omit<MonthlyReviewData, 'id' | 'createdAt'>) => {
    const newRev: MonthlyReviewData = {
      ...reviewData,
      id: `rev-m-${Date.now()}`,
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };
    setMonthlyReviews((prev) => [newRev, ...prev]);

    authFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ ...reviewData, type: 'monthly' }),
    });
  };

  const generateWeeklyReview = async (weekStart?: string): Promise<WeeklyReviewData> => {
    const start = weekStart || new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
    const end = new Date().toISOString().split('T')[0];
    const periodLabel = `${start} to ${end}`;

    const periodLogs = activityLogs.filter((l) => l.date >= start && l.date <= end);
    const periodTasks = plannedTasks.filter((t) => t.date >= start && t.date <= end);

    const totalFocusMinutes = periodLogs
      .filter((l) => l.category === 'PRODUCTIVE' || l.category === 'PERSONAL' || l.category === 'DEEP_WORK' || l.category === 'LEARNING')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    const plannedFocusMinutes = periodTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const completedTasksCount = periodTasks.filter((t) => t.completed).length;
    const totalTasksCount = periodTasks.length;
    const executionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    const distractionMinutes = periodLogs
      .filter((l) => l.category === 'DISTRACTION' || l.category === 'ENTERTAINMENT')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const responsibilityMinutes = periodLogs
      .filter((l) => l.category === 'RESPONSIBILITY' || l.category === 'FAMILY' || l.category === 'CHORES')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    const categoryBreakdown: Record<string, number> = {};
    periodLogs.forEach((l) => {
      categoryBreakdown[l.category] = (categoryBreakdown[l.category] || 0) + l.durationMinutes;
    });

    const dataSummary = {
      periodLabel,
      totalFocusMinutes,
      plannedFocusMinutes,
      completedTasksCount,
      totalTasksCount,
      executionRate,
      distractionMinutes,
      responsibilityMinutes,
      categoryBreakdown,
    };

    let aiMentorReport;
    try {
      const aiRes = await authFetch('/api/ai/mentor-review', {
        method: 'POST',
        body: JSON.stringify({
          reviewType: 'weekly',
          dataSummary,
          userProfile: {
            name: profile.name,
            occupation: profile.occupation,
            goals: goals.map((g) => g.name),
          },
        }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiMentorReport = aiData.report;
      }
    } catch (err) {
      console.error('Error generating AI review:', err);
    }

    const review: WeeklyReviewData = {
      id: `rev-w-${Date.now()}`,
      userId: user?.id,
      periodLabel,
      startDate: start,
      endDate: end,
      weekStart: start,
      weekEnd: end,
      totalFocusMinutes,
      plannedFocusMinutes,
      completedTasksCount,
      totalTasksCount,
      executionRate,
      distractionMinutes,
      responsibilityMinutes,
      categoryBreakdown,
      aiMentorReport,
      createdAt: new Date().toISOString(),
    };

    saveWeeklyReview(review);
    return review;
  };

  const generateMonthlyReview = async (monthStr?: string): Promise<MonthlyReviewData> => {
    const currentMonth = monthStr || new Date().toISOString().substring(0, 7);
    const periodLabel = `${currentMonth}`;
    const start = `${currentMonth}-01`;
    const end = `${currentMonth}-31`;

    const periodLogs = activityLogs.filter((l) => l.date.startsWith(currentMonth));
    const periodTasks = plannedTasks.filter((t) => t.date.startsWith(currentMonth));

    const totalFocusMinutes = periodLogs
      .filter((l) => l.category === 'PRODUCTIVE' || l.category === 'PERSONAL' || l.category === 'DEEP_WORK' || l.category === 'LEARNING')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    const plannedFocusMinutes = periodTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const completedTasksCount = periodTasks.filter((t) => t.completed).length;
    const totalTasksCount = periodTasks.length;
    const executionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    const distractionMinutes = periodLogs
      .filter((l) => l.category === 'DISTRACTION' || l.category === 'ENTERTAINMENT')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const responsibilityMinutes = periodLogs
      .filter((l) => l.category === 'RESPONSIBILITY' || l.category === 'FAMILY' || l.category === 'CHORES')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    const categoryBreakdown: Record<string, number> = {};
    periodLogs.forEach((l) => {
      categoryBreakdown[l.category] = (categoryBreakdown[l.category] || 0) + l.durationMinutes;
    });

    const dataSummary = {
      periodLabel,
      totalFocusMinutes,
      plannedFocusMinutes,
      completedTasksCount,
      totalTasksCount,
      executionRate,
      distractionMinutes,
      responsibilityMinutes,
      categoryBreakdown,
    };

    let aiMentorReport;
    try {
      const aiRes = await authFetch('/api/ai/mentor-review', {
        method: 'POST',
        body: JSON.stringify({
          reviewType: 'monthly',
          dataSummary,
          userProfile: {
            name: profile.name,
            occupation: profile.occupation,
            goals: goals.map((g) => g.name),
          },
        }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiMentorReport = aiData.report;
      }
    } catch (err) {
      console.error('Error generating monthly AI review:', err);
    }

    const review: MonthlyReviewData = {
      id: `rev-m-${Date.now()}`,
      userId: user?.id,
      monthStr: currentMonth,
      periodLabel,
      startDate: start,
      endDate: end,
      totalFocusMinutes,
      totalFocusHours: Number((totalFocusMinutes / 60).toFixed(1)),
      plannedFocusMinutes,
      completedProjectsCount: projects.filter((p) => p.status === 'completed').length,
      activeGoalsCount: goals.filter((g) => g.status === 'active').length,
      executionRate,
      distractionHours: Number((distractionMinutes / 60).toFixed(1)),
      responsibilityHours: Number((responsibilityMinutes / 60).toFixed(1)),
      distractionMinutes,
      responsibilityMinutes,
      categoryBreakdown,
      aiMentorReport,
      createdAt: new Date().toISOString(),
    };

    saveMonthlyReview(review);
    return review;
  };

  // --- Complete Onboarding Flow ---

  const completeOnboarding = async (
    nameOrParams:
      | string
      | {
          name?: string;
          firstName?: string;
          lastName?: string;
          role?: UserRoleIdentifier;
          customRole?: string;
          occupation?: string;
          dailyCapacityHours?: number;
          mainGoalsSummary?: string;
        },
    legacyOccupation?: string,
    legacyGoalsSummary?: string,
    legacyCapacity?: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let effectiveName = '';
      let effectiveRole: UserRoleIdentifier | undefined;
      let effectiveCustomRole: string | undefined;
      let effectiveOccupation = '';
      let effectiveGoalsSummary = '';
      let effectiveCapacity = 4.5;

      if (typeof nameOrParams === 'string') {
        effectiveName = nameOrParams.trim();
        effectiveOccupation = legacyOccupation?.trim() || 'Professional / Builder';
        effectiveGoalsSummary = legacyGoalsSummary?.trim() || '';
        effectiveCapacity = legacyCapacity || 4.5;
      } else {
        effectiveName = nameOrParams.name?.trim() || `${nameOrParams.firstName || ''} ${nameOrParams.lastName || ''}`.trim();
        effectiveRole = nameOrParams.role;
        effectiveCustomRole = nameOrParams.customRole?.trim();
        effectiveOccupation = nameOrParams.occupation?.trim() || (effectiveRole === 'other' ? effectiveCustomRole : effectiveRole) || 'Professional / Builder';
        effectiveGoalsSummary = nameOrParams.mainGoalsSummary?.trim() || '';
        effectiveCapacity = nameOrParams.dailyCapacityHours || 4.5;
      }

      const nameParts = effectiveName.split(' ');
      const effectiveFirstName = nameParts[0] || user?.firstName || 'User';
      const effectiveLastName = nameParts.slice(1).join(' ') || user?.lastName || '';

      const res = await authFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: effectiveFirstName,
          lastName: effectiveLastName,
          role: effectiveRole,
          customRole: effectiveCustomRole,
          custom_role: effectiveCustomRole,
          occupation: effectiveOccupation,
          dailyCapacityHours: effectiveCapacity,
          mainGoalsSummary: effectiveGoalsSummary,
          onboarded: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "We couldn't save your data. Please try again." };
      }

      setProfile((prev) => ({
        ...prev,
        name: `${effectiveFirstName} ${effectiveLastName}`.trim(),
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
        role: effectiveRole,
        customRole: effectiveCustomRole,
        custom_role: effectiveCustomRole,
        occupation: effectiveOccupation,
        dailyCapacityHours: effectiveCapacity,
        mainGoalsSummary: effectiveGoalsSummary,
        onboarded: true,
      }));

      setUser((prev) => (prev ? {
        ...prev,
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
      } : null));

      // Create initial goal if summary provided
      if (effectiveGoalsSummary) {
        addGoal({
          name: effectiveGoalsSummary,
          description: 'Primary focus ambition established during onboarding setup.',
          category: 'PRODUCTIVE',
          targetHours: Math.round(effectiveCapacity * 20),
          priority: 'high',
          status: 'active',
        });
      }

      playSound('complete');
      return { success: true };
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      return { success: false, error: "We couldn't save your data. Please try again." };
    }
  };

  // --- Computed Real Stats (Zero fake values) ---
  const todayStr = getTodayString();
  const todayTasks = plannedTasks.filter((t) => t.date === todayStr);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalTasksCount = todayTasks.length;
  const executionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  const plannedMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const todayLogs = activityLogs.filter((l) => l.date === todayStr);
  const loggedFocusMinutes = todayLogs
    .filter((l) => l.category === 'PRODUCTIVE' || l.category === 'PERSONAL' || l.category === 'DEEP_WORK' || l.category === 'LEARNING')
    .reduce((acc, l) => acc + l.durationMinutes, 0);

  let currentTimerFocusMinutes = 0;
  let currentTimerDistractionMinutes = 0;
  if (activeTimer) {
    const now = Date.now();
    const pausedMs = activeTimer.pausedAt
      ? activeTimer.totalPausedMs + (now - activeTimer.pausedAt)
      : activeTimer.totalPausedMs;
    const elapsedMinutes = Math.floor(Math.max(0, now - activeTimer.startedAt - pausedMs) / 60000);
    if (activeTimer.category === 'ENTERTAINMENT' || activeTimer.category === 'DISTRACTION' || activeTimer.isDistractionBoundary) {
      currentTimerDistractionMinutes = elapsedMinutes;
    } else {
      currentTimerFocusMinutes = elapsedMinutes;
    }
  }

  const focusMinutes = loggedFocusMinutes + currentTimerFocusMinutes;

  const loggedDistractionMinutes = todayLogs
    .filter((l) => l.category === 'ENTERTAINMENT' || l.category === 'DISTRACTION')
    .reduce((acc, l) => acc + l.durationMinutes, 0);
  const distractionMinutes = loggedDistractionMinutes + currentTimerDistractionMinutes;

  const responsibilityMinutes = todayLogs
    .filter((l) => l.category === 'RESPONSIBILITY' || l.category === 'FAMILY' || l.category === 'CHORES')
    .reduce((acc, l) => acc + l.durationMinutes, 0);

  const primaryLimit = distractionLimits[0]?.limitMinutes || 30;
  const distractionBoundaryExceeded = distractionMinutes > primaryLimit;

  const todayStats = {
    focusMinutes,
    plannedMinutes,
    executionRate,
    distractionMinutes,
    responsibilityMinutes,
    completedCount,
    totalTasksCount,
    distractionBoundaryExceeded,
  };

  const exportAllDataJSON = () => {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user,
        profile,
        goals,
        projects,
        plannedTasks,
        activityLogs,
        distractionLimits,
        habits,
        reflections,
        weeklyReviews,
        monthlyReviews,
      },
      null,
      2
    );
  };

  const importAllDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.plannedTasks) setPlannedTasks(parsed.plannedTasks);
      if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      if (parsed.distractionLimits) setDistractionLimits(parsed.distractionLimits);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.profile) setProfile(parsed.profile);

      authFetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(parsed),
      });

      return true;
    } catch {
      return false;
    }
  };

  const resetToSampleData = () => {
    setGoals([]);
    setProjects([]);
    setPlannedTasks([]);
    setActivityLogs([]);
    setHabits([]);
    setWeeklyReviews([]);
    setMonthlyReviews([]);
    authFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        goals: [],
        projects: [],
        tasks: [],
        activityLogs: [],
        habits: [],
      }),
    });
  };

  return (
    <AppContext.Provider
      value={{
        authStatus,
        user,
        token,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        profile,
        userProfile: profile,
        updateProfile,
        completeOnboarding,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        projects,
        addProject,
        updateProject,
        deleteProject,
        plannedTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        carryTaskToTomorrow,
        reorderTasks,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        finishTimer,
        cancelTimer,
        addExtraTimeToTimer,
        activityLogs,
        logActivity,
        quickLogActivity,
        deleteActivityLog,
        quickLogInterruption,
        distractionLimits,
        updateDistractionLimit,
        addDistractionLimit,
        deleteDistractionLimit,
        getDistractionUsageToday,
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDate,
        reflections,
        saveReflection,
        weeklyReviews,
        saveWeeklyReview,
        generateWeeklyReview,
        monthlyReviews,
        saveMonthlyReview,
        generateMonthlyReview,
        timelineMonths,
        todayStats,
        soundEnabled,
        setSoundEnabled,
        playSound,
        authFetch,
        exportAllDataJSON,
        importAllDataJSON,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
