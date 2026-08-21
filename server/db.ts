import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface UserProfileRecord {
  userId: string;
  avatarUrl?: string;
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
  periodLabel: string;
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

export type DatabaseEngine = 'postgres' | 'local_file';

class DatabaseService {
  private engine: DatabaseEngine = 'local_file';
  private pgPool: pg.Pool | null = null;
  private pgInitialized = false;
  private pgInitPromise: Promise<void> | null = null;

  private fileData: DatabaseSchema = {
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

  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
    if (dbUrl) {
      this.engine = 'postgres';
      const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      this.pgPool = new Pool({
        connectionString: dbUrl,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
        max: isServerless ? 3 : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      this.pgInitPromise = this.initPostgresSchema();
    } else {
      this.engine = 'local_file';
      this.loadFileDatabase();
      if (isServerless) {
        console.warn(
          '[DayTrace Persistence Notice] Running in serverless environment without DATABASE_URL.\n' +
          'Local files in /tmp are ephemeral. For permanent user account persistence across deployments,\n' +
          'configure a PostgreSQL or Supabase DATABASE_URL in your Netlify site settings.'
        );
      }
    }
  }

  public getEngine(): DatabaseEngine {
    return this.engine;
  }

  public isPersistent(): boolean {
    return this.engine === 'postgres';
  }

  // --- PostgreSQL Initialization ---
  private async initPostgresSchema(): Promise<void> {
    if (!this.pgPool) return;
    try {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');

        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name VARCHAR(128) NOT NULL,
            last_name VARCHAR(128) NOT NULL,
            avatar_url TEXT,
            reset_token VARCHAR(64),
            reset_token_expiry BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS profiles (
            user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            avatar_url TEXT,
            role VARCHAR(128),
            custom_role VARCHAR(128),
            occupation VARCHAR(255),
            daily_capacity_hours REAL DEFAULT 4.5,
            main_goals_summary JSONB DEFAULT '[]'::jsonb,
            timezone VARCHAR(64) DEFAULT 'UTC',
            theme VARCHAR(32) DEFAULT 'dark',
            sound_effects BOOLEAN DEFAULT TRUE,
            notifications_enabled BOOLEAN DEFAULT TRUE,
            onboarded BOOLEAN DEFAULT FALSE,
            welcome_dismissed BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS goals (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(64),
            target_hours REAL DEFAULT 100,
            current_hours REAL DEFAULT 0,
            priority VARCHAR(32) DEFAULT 'high',
            status VARCHAR(32) DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            goal_id VARCHAR(64),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            deadline VARCHAR(64),
            status VARCHAR(32) DEFAULT 'active',
            time_spent_minutes INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS tasks (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            project_id VARCHAR(64),
            goal_id VARCHAR(64),
            date VARCHAR(32) NOT NULL,
            name VARCHAR(255) NOT NULL,
            priority VARCHAR(32) DEFAULT 'should',
            estimated_minutes INTEGER DEFAULT 30,
            actual_minutes INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            rolled_over BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS focus_sessions (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            task_id VARCHAR(64),
            activity_name VARCHAR(255) NOT NULL,
            category VARCHAR(64) NOT NULL,
            started_at BIGINT NOT NULL,
            paused_at BIGINT,
            resumed_at BIGINT,
            ended_at BIGINT,
            planned_duration_minutes INTEGER DEFAULT 25,
            actual_duration_minutes INTEGER DEFAULT 0,
            status VARCHAR(32) DEFAULT 'completed',
            is_interruption BOOLEAN DEFAULT FALSE,
            interruption_type VARCHAR(64),
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            goal_id VARCHAR(64),
            project_id VARCHAR(64),
            task_id VARCHAR(64),
            date VARCHAR(32) NOT NULL,
            activity_name VARCHAR(255) NOT NULL,
            category VARCHAR(64) NOT NULL,
            duration_minutes INTEGER NOT NULL,
            is_interruption BOOLEAN DEFAULT FALSE,
            interruption_type VARCHAR(64),
            notes TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS time_limits (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            activity_name VARCHAR(255) NOT NULL,
            limit_minutes INTEGER NOT NULL,
            period VARCHAR(32) DEFAULT 'daily'
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS habits (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            frequency_per_week INTEGER DEFAULT 7,
            streak_count INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            completed_dates JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS reviews (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(32) DEFAULT 'weekly',
            period_label VARCHAR(128),
            start_date VARCHAR(64),
            end_date VARCHAR(64),
            data_summary JSONB,
            ai_mentor_report JSONB,
            user_reflection TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS growth_milestones (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            month VARCHAR(64) NOT NULL,
            theme VARCHAR(255),
            focus_hours REAL DEFAULT 0,
            goals_reached INTEGER DEFAULT 0,
            projects_completed INTEGER DEFAULT 0,
            highlights JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query('COMMIT');
        this.pgInitialized = true;
        console.log('[DayTrace Database] PostgreSQL schema initialized successfully.');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[DayTrace Database] Error initializing PostgreSQL schema:', err);
        throw err;
      } finally {
        client.release();
      }
    } catch (connErr) {
      console.error('[DayTrace Database] Could not connect to PostgreSQL database:', connErr);
    }
  }

  private async ensurePostgresReady() {
    if (this.engine === 'postgres' && !this.pgInitialized && this.pgInitPromise) {
      await this.pgInitPromise;
    }
  }

  // --- Local File Database Operations ---
  private lastFileMtime = 0;

  private ensureFileDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Filesystem access warning (operating in-memory mode if disk is read-only):', err);
    }
  }

  private loadFileDatabase() {
    try {
      this.ensureFileDir();
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        this.lastFileMtime = stat.mtimeMs;
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.fileData = {
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
        this.saveFileSync();
      }
    } catch (err) {
      console.error('Error loading database file, initializing clean in-memory database:', err);
    }
  }

  private reloadIfFileModified() {
    if (this.engine !== 'local_file') return;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        if (stat.mtimeMs > this.lastFileMtime) {
          this.loadFileDatabase();
        }
      }
    } catch (err) {
      // Non-fatal warning
    }
  }

  private saveFileSync() {
    try {
      this.ensureFileDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.fileData, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
      if (fs.existsSync(DB_FILE)) {
        this.lastFileMtime = fs.statSync(DB_FILE).mtimeMs;
      }
    } catch (err) {
      console.warn('Database save warning (persisting in memory):', err);
    }
  }

  private saveFileAsync() {
    // Perform immediate synchronous write to ensure no data is lost in serverless executions
    this.saveFileSync();
  }

  // ==========================================
  // USERS & PROFILES
  // ==========================================

  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query(
        'SELECT id, email, password_hash as "passwordHash", first_name as "firstName", last_name as "lastName", avatar_url as "avatarUrl", reset_token as "resetToken", reset_token_expiry as "resetTokenExpiry", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1',
        [cleanEmail]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    }

    this.reloadIfFileModified();
    const u = this.fileData.users.find((user) => user.email.toLowerCase() === cleanEmail);
    return u || null;
  }

  public async findUserById(id: string): Promise<UserRecord | null> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query(
        'SELECT id, email, password_hash as "passwordHash", first_name as "firstName", last_name as "lastName", avatar_url as "avatarUrl", reset_token as "resetToken", reset_token_expiry as "resetTokenExpiry", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
        [id]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    }

    this.reloadIfFileModified();
    const u = this.fileData.users.find((user) => user.id === id);
    return u || null;
  }

  public async createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord> {
    const id = crypto.randomUUID();
    const cleanEmail = user.email.toLowerCase().trim();
    const now = new Date().toISOString();

    const newUser: UserRecord = {
      id,
      email: cleanEmail,
      passwordHash: user.passwordHash,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      avatarUrl: user.avatarUrl || undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        'INSERT INTO users (id, email, password_hash, first_name, last_name, avatar_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newUser.id, newUser.email, newUser.passwordHash, newUser.firstName, newUser.lastName, newUser.avatarUrl || null, newUser.createdAt, newUser.updatedAt]
      );

      // Create default profile
      await this.pgPool.query(
        `INSERT INTO profiles (user_id, avatar_url, occupation, daily_capacity_hours, main_goals_summary, timezone, theme, sound_effects, notifications_enabled, onboarded, welcome_dismissed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newUser.id,
          newUser.avatarUrl || null,
          'Professional / Builder',
          4.5,
          JSON.stringify([]),
          'UTC',
          'dark',
          true,
          true,
          false,
          false,
          now,
        ]
      );

      // Create default time limits
      await this.pgPool.query(
        `INSERT INTO time_limits (id, user_id, activity_name, limit_minutes, period)
         VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
        [
          crypto.randomUUID(), newUser.id, 'YouTube / Video Streaming', 30, 'daily',
          crypto.randomUUID(), newUser.id, 'Social Media / Feeds', 20, 'daily',
        ]
      );

      return newUser;
    }

    // Local file fallback
    this.fileData.users.push(newUser);
    this.fileData.profiles.push({
      userId: newUser.id,
      avatarUrl: newUser.avatarUrl,
      occupation: 'Professional / Builder',
      dailyCapacityHours: 4.5,
      mainGoalsSummary: [],
      timezone: 'UTC',
      theme: 'dark',
      soundEffects: true,
      notificationsEnabled: true,
      onboarded: false,
      welcomeDismissed: false,
      updatedAt: now,
    });
    this.fileData.timeLimits.push(
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
    this.saveFileAsync();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const current = await this.findUserById(id);
      if (!current) return null;

      const newFirstName = updates.firstName !== undefined ? updates.firstName.trim() : current.firstName;
      const newLastName = updates.lastName !== undefined ? updates.lastName.trim() : current.lastName;
      const newAvatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl;
      const newPasswordHash = updates.passwordHash || current.passwordHash;
      const newResetToken = updates.resetToken !== undefined ? updates.resetToken : current.resetToken;
      const newResetExpiry = updates.resetTokenExpiry !== undefined ? updates.resetTokenExpiry : current.resetTokenExpiry;

      await this.pgPool.query(
        `UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3, password_hash = $4, reset_token = $5, reset_token_expiry = $6, updated_at = $7 WHERE id = $8`,
        [newFirstName, newLastName, newAvatarUrl || null, newPasswordHash, newResetToken || null, newResetExpiry || null, now, id]
      );

      return {
        ...current,
        ...updates,
        firstName: newFirstName,
        lastName: newLastName,
        avatarUrl: newAvatarUrl,
        updatedAt: now,
      };
    }

    const idx = this.fileData.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.fileData.users[idx] = {
      ...this.fileData.users[idx],
      ...updates,
      updatedAt: now,
    };
    this.saveFileAsync();
    return this.fileData.users[idx];
  }

  public async getUserProfile(userId: string): Promise<UserProfileRecord> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query(
        `SELECT user_id as "userId", avatar_url as "avatarUrl", role, custom_role as "customRole", occupation, daily_capacity_hours as "dailyCapacityHours",
                main_goals_summary as "mainGoalsSummary", timezone, theme, sound_effects as "soundEffects",
                notifications_enabled as "notificationsEnabled", onboarded, welcome_dismissed as "welcomeDismissed", updated_at as "updatedAt"
         FROM profiles WHERE user_id = $1`,
        [userId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          ...row,
          mainGoalsSummary: typeof row.mainGoalsSummary === 'string' ? JSON.parse(row.mainGoalsSummary || '[]') : (row.mainGoalsSummary || []),
        };
      }

      // If missing profile, insert default
      const defaultProf: UserProfileRecord = {
        userId,
        occupation: 'Professional / Builder',
        dailyCapacityHours: 4.5,
        mainGoalsSummary: [],
        timezone: 'UTC',
        theme: 'dark',
        soundEffects: true,
        notificationsEnabled: true,
        onboarded: false,
        welcomeDismissed: false,
        updatedAt: now,
      };

      await this.pgPool.query(
        `INSERT INTO profiles (user_id, avatar_url, occupation, daily_capacity_hours, main_goals_summary, timezone, theme, sound_effects, notifications_enabled, onboarded, welcome_dismissed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, defaultProf.avatarUrl || null, defaultProf.occupation, defaultProf.dailyCapacityHours, JSON.stringify(defaultProf.mainGoalsSummary), defaultProf.timezone, defaultProf.theme, defaultProf.soundEffects, defaultProf.notificationsEnabled, defaultProf.onboarded, defaultProf.welcomeDismissed, now]
      );
      return defaultProf;
    }

    let profile = this.fileData.profiles.find((p) => p.userId === userId);
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
        welcomeDismissed: false,
        updatedAt: now,
      };
      this.fileData.profiles.push(profile);
      this.saveFileAsync();
    }
    return profile;
  }

  public async updateUserProfile(userId: string, updates: Partial<UserProfileRecord>): Promise<UserProfileRecord> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const current = await this.getUserProfile(userId);
      const merged: UserProfileRecord = {
        ...current,
        ...updates,
        updatedAt: now,
      };

      await this.pgPool.query(
        `INSERT INTO profiles (user_id, avatar_url, role, custom_role, occupation, daily_capacity_hours, main_goals_summary, timezone, theme, sound_effects, notifications_enabled, onboarded, welcome_dismissed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (user_id) DO UPDATE SET
           avatar_url = EXCLUDED.avatar_url,
           role = EXCLUDED.role,
           custom_role = EXCLUDED.custom_role,
           occupation = EXCLUDED.occupation,
           daily_capacity_hours = EXCLUDED.daily_capacity_hours,
           main_goals_summary = EXCLUDED.main_goals_summary,
           timezone = EXCLUDED.timezone,
           theme = EXCLUDED.theme,
           sound_effects = EXCLUDED.sound_effects,
           notifications_enabled = EXCLUDED.notifications_enabled,
           onboarded = EXCLUDED.onboarded,
           welcome_dismissed = EXCLUDED.welcome_dismissed,
           updated_at = EXCLUDED.updated_at`,
        [
          userId,
          merged.avatarUrl || null,
          merged.role || null,
          merged.customRole || merged.custom_role || null,
          merged.occupation || 'Professional / Builder',
          merged.dailyCapacityHours || 4.5,
          JSON.stringify(merged.mainGoalsSummary || []),
          merged.timezone || 'UTC',
          merged.theme || 'dark',
          merged.soundEffects ?? true,
          merged.notificationsEnabled ?? true,
          merged.onboarded ?? false,
          merged.welcomeDismissed ?? false,
          now,
        ]
      );
      return merged;
    }

    const idx = this.fileData.profiles.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      const newProfile: UserProfileRecord = {
        userId,
        avatarUrl: updates.avatarUrl,
        occupation: updates.occupation || 'Professional / Builder',
        dailyCapacityHours: updates.dailyCapacityHours || 4.5,
        mainGoalsSummary: updates.mainGoalsSummary || [],
        timezone: updates.timezone || 'UTC',
        theme: updates.theme || 'dark',
        soundEffects: updates.soundEffects ?? true,
        notificationsEnabled: updates.notificationsEnabled ?? true,
        onboarded: updates.onboarded ?? false,
        welcomeDismissed: updates.welcomeDismissed ?? false,
        updatedAt: now,
      };
      this.fileData.profiles.push(newProfile);
      this.saveFileAsync();
      return newProfile;
    }

    this.fileData.profiles[idx] = {
      ...this.fileData.profiles[idx],
      ...updates,
      updatedAt: now,
    };
    this.saveFileAsync();
    return this.fileData.profiles[idx];
  }

  // ==========================================
  // COMPLETE USER DATASET FOR AUTHENTICATED USER
  // ==========================================

  public async getUserData(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const profile = await this.getUserProfile(userId);

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();

      const [goalsRes, projectsRes, tasksRes, focusRes, logsRes, limitsRes, habitsRes, reviewsRes, milestonesRes] = await Promise.all([
        this.pgPool.query('SELECT id, user_id as "userId", name, description, category, target_hours as "targetHours", current_hours as "currentHours", priority, status, created_at as "createdAt", updated_at as "updatedAt" FROM goals WHERE user_id = $1 ORDER BY created_at ASC', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", goal_id as "goalId", name, description, deadline, status, time_spent_minutes as "timeSpentMinutes", created_at as "createdAt", updated_at as "updatedAt" FROM projects WHERE user_id = $1 ORDER BY created_at ASC', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", project_id as "projectId", goal_id as "goalId", date, name, priority, estimated_minutes as "estimatedMinutes", actual_minutes as "actualMinutes", completed, rolled_over as "rolledOver", created_at as "createdAt", updated_at as "updatedAt" FROM tasks WHERE user_id = $1 ORDER BY created_at ASC', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", task_id as "taskId", activity_name as "activityName", category, started_at as "startedAt", paused_at as "pausedAt", resumed_at as "resumedAt", ended_at as "endedAt", planned_duration_minutes as "plannedDurationMinutes", actual_duration_minutes as "actualDurationMinutes", status, is_interruption as "isInterruption", interruption_type as "interruptionType", notes, created_at as "createdAt" FROM focus_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 100', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", goal_id as "goalId", project_id as "projectId", task_id as "taskId", date, activity_name as "activityName", category, duration_minutes as "durationMinutes", is_interruption as "isInterruption", interruption_type as "interruptionType", notes, timestamp FROM activity_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 500', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", activity_name as "activityName", limit_minutes as "limitMinutes", period FROM time_limits WHERE user_id = $1', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", name, description, frequency_per_week as "frequencyPerWeek", streak_count as "streakCount", best_streak as "bestStreak", completed_dates as "completedDates", created_at as "createdAt" FROM habits WHERE user_id = $1 ORDER BY created_at ASC', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", type, period_label as "periodLabel", start_date as "startDate", end_date as "endDate", data_summary as "dataSummary", ai_mentor_report as "aiMentorReport", user_reflection as "userReflection", created_at as "createdAt" FROM reviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]),
        this.pgPool.query('SELECT id, user_id as "userId", month, theme, focus_hours as "focusHours", goals_reached as "goalsReached", projects_completed as "projectsCompleted", highlights, created_at as "createdAt" FROM growth_milestones WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      ]);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        profile,
        goals: goalsRes.rows,
        projects: projectsRes.rows,
        tasks: tasksRes.rows,
        focusSessions: focusRes.rows,
        activityLogs: logsRes.rows,
        timeLimits: limitsRes.rows,
        habits: habitsRes.rows.map((h: any) => ({
          ...h,
          completedDates: typeof h.completedDates === 'string' ? JSON.parse(h.completedDates || '[]') : (h.completedDates || []),
        })),
        reviews: reviewsRes.rows.map((r: any) => ({
          ...r,
          dataSummary: typeof r.dataSummary === 'string' ? JSON.parse(r.dataSummary || '{}') : (r.dataSummary || {}),
          aiMentorReport: typeof r.aiMentorReport === 'string' ? JSON.parse(r.aiMentorReport || '{}') : r.aiMentorReport,
        })),
        growthMilestones: milestonesRes.rows.map((m: any) => ({
          ...m,
          highlights: typeof m.highlights === 'string' ? JSON.parse(m.highlights || '[]') : (m.highlights || []),
        })),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      profile,
      goals: this.fileData.goals.filter((g) => g.userId === userId),
      projects: this.fileData.projects.filter((p) => p.userId === userId),
      tasks: this.fileData.tasks.filter((t) => t.userId === userId),
      focusSessions: this.fileData.focusSessions.filter((s) => s.userId === userId),
      activityLogs: this.fileData.activityLogs.filter((a) => a.userId === userId),
      timeLimits: this.fileData.timeLimits.filter((l) => l.userId === userId),
      habits: this.fileData.habits.filter((h) => h.userId === userId),
      reviews: this.fileData.reviews.filter((r) => r.userId === userId),
      growthMilestones: this.fileData.growthMilestones.filter((m) => m.userId === userId),
    };
  }

  // ==========================================
  // GOALS
  // ==========================================
  public async createGoal(userId: string, goal: Omit<GoalRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<GoalRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newGoal: GoalRecord = {
      id,
      userId,
      name: goal.name.trim(),
      description: goal.description || '',
      category: goal.category || 'CORE_SKILL',
      targetHours: Number(goal.targetHours) || 100,
      currentHours: Number(goal.currentHours) || 0,
      priority: goal.priority || 'high',
      status: goal.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO goals (id, user_id, name, description, category, target_hours, current_hours, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [newGoal.id, userId, newGoal.name, newGoal.description, newGoal.category, newGoal.targetHours, newGoal.currentHours, newGoal.priority, newGoal.status, now, now]
      );
      return newGoal;
    }

    this.fileData.goals.push(newGoal);
    this.saveFileAsync();
    return newGoal;
  }

  public async updateGoal(userId: string, id: string, updates: Partial<GoalRecord>): Promise<GoalRecord | null> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      const name = updates.name !== undefined ? updates.name.trim() : current.name;
      const description = updates.description !== undefined ? updates.description : current.description;
      const category = updates.category !== undefined ? updates.category : current.category;
      const targetHours = updates.targetHours !== undefined ? Number(updates.targetHours) : Number(current.target_hours);
      const currentHours = updates.currentHours !== undefined ? Number(updates.currentHours) : Number(current.current_hours);
      const priority = updates.priority !== undefined ? updates.priority : current.priority;
      const status = updates.status !== undefined ? updates.status : current.status;

      await this.pgPool.query(
        `UPDATE goals SET name = $1, description = $2, category = $3, target_hours = $4, current_hours = $5, priority = $6, status = $7, updated_at = $8
         WHERE id = $9 AND user_id = $10`,
        [name, description, category, targetHours, currentHours, priority, status, now, id, userId]
      );

      return {
        id,
        userId,
        name,
        description,
        category,
        targetHours,
        currentHours,
        priority,
        status,
        createdAt: current.created_at,
        updatedAt: now,
      };
    }

    const idx = this.fileData.goals.findIndex((g) => g.id === id && g.userId === userId);
    if (idx === -1) return null;
    this.fileData.goals[idx] = {
      ...this.fileData.goals[idx],
      ...updates,
      updatedAt: now,
    };
    this.saveFileAsync();
    return this.fileData.goals[idx];
  }

  public async deleteGoal(userId: string, id: string): Promise<boolean> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.fileData.goals.findIndex((g) => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    this.fileData.goals.splice(idx, 1);
    this.saveFileAsync();
    return true;
  }

  // ==========================================
  // PROJECTS
  // ==========================================
  public async createProject(userId: string, project: Omit<ProjectRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ProjectRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newProject: ProjectRecord = {
      id,
      userId,
      goalId: project.goalId,
      name: project.name.trim(),
      description: project.description || '',
      deadline: project.deadline,
      status: project.status || 'active',
      timeSpentMinutes: Number(project.timeSpentMinutes) || 0,
      createdAt: now,
      updatedAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO projects (id, user_id, goal_id, name, description, deadline, status, time_spent_minutes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newProject.id, userId, newProject.goalId || null, newProject.name, newProject.description, newProject.deadline || null, newProject.status, newProject.timeSpentMinutes, now, now]
      );
      return newProject;
    }

    this.fileData.projects.push(newProject);
    this.saveFileAsync();
    return newProject;
  }

  public async updateProject(userId: string, id: string, updates: Partial<ProjectRecord>): Promise<ProjectRecord | null> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      const name = updates.name !== undefined ? updates.name.trim() : current.name;
      const description = updates.description !== undefined ? updates.description : current.description;
      const goalId = updates.goalId !== undefined ? updates.goalId : current.goal_id;
      const deadline = updates.deadline !== undefined ? updates.deadline : current.deadline;
      const status = updates.status !== undefined ? updates.status : current.status;
      const timeSpentMinutes = updates.timeSpentMinutes !== undefined ? Number(updates.timeSpentMinutes) : Number(current.time_spent_minutes);

      await this.pgPool.query(
        `UPDATE projects SET name = $1, description = $2, goal_id = $3, deadline = $4, status = $5, time_spent_minutes = $6, updated_at = $7
         WHERE id = $8 AND user_id = $9`,
        [name, description, goalId || null, deadline || null, status, timeSpentMinutes, now, id, userId]
      );

      return {
        id,
        userId,
        goalId,
        name,
        description,
        deadline,
        status,
        timeSpentMinutes,
        createdAt: current.created_at,
        updatedAt: now,
      };
    }

    const idx = this.fileData.projects.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return null;
    this.fileData.projects[idx] = {
      ...this.fileData.projects[idx],
      ...updates,
      updatedAt: now,
    };
    this.saveFileAsync();
    return this.fileData.projects[idx];
  }

  public async deleteProject(userId: string, id: string): Promise<boolean> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.fileData.projects.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.fileData.projects.splice(idx, 1);
    this.saveFileAsync();
    return true;
  }

  // ==========================================
  // TASKS
  // ==========================================
  public async createTask(userId: string, task: Omit<TaskRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TaskRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTask: TaskRecord = {
      id,
      userId,
      projectId: task.projectId,
      goalId: task.goalId,
      date: task.date,
      name: task.name.trim(),
      priority: task.priority || 'should',
      estimatedMinutes: Number(task.estimatedMinutes) || 30,
      actualMinutes: Number(task.actualMinutes) || 0,
      completed: Boolean(task.completed),
      rolledOver: Boolean(task.rolledOver),
      createdAt: now,
      updatedAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO tasks (id, user_id, project_id, goal_id, date, name, priority, estimated_minutes, actual_minutes, completed, rolled_over, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [newTask.id, userId, newTask.projectId || null, newTask.goalId || null, newTask.date, newTask.name, newTask.priority, newTask.estimatedMinutes, newTask.actualMinutes, newTask.completed, newTask.rolledOver, now, now]
      );
      return newTask;
    }

    this.fileData.tasks.push(newTask);
    this.saveFileAsync();
    return newTask;
  }

  public async updateTask(userId: string, id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null> {
    const now = new Date().toISOString();
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      const name = updates.name !== undefined ? updates.name.trim() : current.name;
      const date = updates.date !== undefined ? updates.date : current.date;
      const priority = updates.priority !== undefined ? updates.priority : current.priority;
      const estimatedMinutes = updates.estimatedMinutes !== undefined ? Number(updates.estimatedMinutes) : Number(current.estimated_minutes);
      const actualMinutes = updates.actualMinutes !== undefined ? Number(updates.actualMinutes) : Number(current.actual_minutes);
      const completed = updates.completed !== undefined ? Boolean(updates.completed) : Boolean(current.completed);
      const rolledOver = updates.rolledOver !== undefined ? Boolean(updates.rolledOver) : Boolean(current.rolled_over);
      const projectId = updates.projectId !== undefined ? updates.projectId : current.project_id;
      const goalId = updates.goalId !== undefined ? updates.goalId : current.goal_id;

      await this.pgPool.query(
        `UPDATE tasks SET name = $1, date = $2, priority = $3, estimated_minutes = $4, actual_minutes = $5, completed = $6, rolled_over = $7, project_id = $8, goal_id = $9, updated_at = $10
         WHERE id = $11 AND user_id = $12`,
        [name, date, priority, estimatedMinutes, actualMinutes, completed, rolledOver, projectId || null, goalId || null, now, id, userId]
      );

      return {
        id,
        userId,
        projectId,
        goalId,
        date,
        name,
        priority,
        estimatedMinutes,
        actualMinutes,
        completed,
        rolledOver,
        createdAt: current.created_at,
        updatedAt: now,
      };
    }

    const idx = this.fileData.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (idx === -1) return null;
    this.fileData.tasks[idx] = {
      ...this.fileData.tasks[idx],
      ...updates,
      updatedAt: now,
    };
    this.saveFileAsync();
    return this.fileData.tasks[idx];
  }

  public async deleteTask(userId: string, id: string): Promise<boolean> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.fileData.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (idx === -1) return false;
    this.fileData.tasks.splice(idx, 1);
    this.saveFileAsync();
    return true;
  }

  // ==========================================
  // FOCUS SESSIONS
  // ==========================================
  public async createFocusSession(userId: string, session: Omit<FocusSessionRecord, 'id' | 'userId' | 'createdAt'>): Promise<FocusSessionRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newSession: FocusSessionRecord = {
      id,
      userId,
      taskId: session.taskId,
      activityName: session.activityName,
      category: session.category || 'DEEP_WORK',
      startedAt: session.startedAt || Date.now(),
      pausedAt: session.pausedAt,
      resumedAt: session.resumedAt,
      endedAt: session.endedAt,
      plannedDurationMinutes: Number(session.plannedDurationMinutes) || 25,
      actualDurationMinutes: Number(session.actualDurationMinutes) || 0,
      status: session.status || 'running',
      isInterruption: Boolean(session.isInterruption),
      interruptionType: session.interruptionType,
      notes: session.notes,
      createdAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO focus_sessions (id, user_id, task_id, activity_name, category, started_at, paused_at, resumed_at, ended_at, planned_duration_minutes, actual_duration_minutes, status, is_interruption, interruption_type, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [newSession.id, userId, newSession.taskId || null, newSession.activityName, newSession.category, newSession.startedAt, newSession.pausedAt || null, newSession.resumedAt || null, newSession.endedAt || null, newSession.plannedDurationMinutes, newSession.actualDurationMinutes, newSession.status, newSession.isInterruption, newSession.interruptionType || null, newSession.notes || null, now]
      );
      return newSession;
    }

    this.fileData.focusSessions.push(newSession);
    this.saveFileAsync();
    return newSession;
  }

  public async updateFocusSession(userId: string, id: string, updates: Partial<FocusSessionRecord>): Promise<FocusSessionRecord | null> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM focus_sessions WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      const status = updates.status !== undefined ? updates.status : current.status;
      const endedAt = updates.endedAt !== undefined ? updates.endedAt : current.ended_at;
      const actualDurationMinutes = updates.actualDurationMinutes !== undefined ? Number(updates.actualDurationMinutes) : Number(current.actual_duration_minutes);
      const notes = updates.notes !== undefined ? updates.notes : current.notes;

      await this.pgPool.query(
        `UPDATE focus_sessions SET status = $1, ended_at = $2, actual_duration_minutes = $3, notes = $4 WHERE id = $5 AND user_id = $6`,
        [status, endedAt || null, actualDurationMinutes, notes || null, id, userId]
      );

      return {
        id,
        userId,
        taskId: current.task_id,
        activityName: current.activity_name,
        category: current.category,
        startedAt: Number(current.started_at),
        pausedAt: current.paused_at ? Number(current.paused_at) : undefined,
        resumedAt: current.resumed_at ? Number(current.resumed_at) : undefined,
        endedAt: endedAt ? Number(endedAt) : undefined,
        plannedDurationMinutes: Number(current.planned_duration_minutes),
        actualDurationMinutes,
        status,
        isInterruption: Boolean(current.is_interruption),
        interruptionType: current.interruption_type,
        notes,
        createdAt: current.created_at,
      };
    }

    const idx = this.fileData.focusSessions.findIndex((s) => s.id === id && s.userId === userId);
    if (idx === -1) return null;
    this.fileData.focusSessions[idx] = {
      ...this.fileData.focusSessions[idx],
      ...updates,
    };
    this.saveFileAsync();
    return this.fileData.focusSessions[idx];
  }

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  public async createActivityLog(userId: string, log: Omit<ActivityLogRecord, 'id' | 'userId'>): Promise<ActivityLogRecord> {
    const id = crypto.randomUUID();
    const newLog: ActivityLogRecord = {
      id,
      userId,
      goalId: log.goalId,
      projectId: log.projectId,
      taskId: log.taskId,
      date: log.date,
      activityName: log.activityName.trim(),
      category: log.category || 'DEEP_WORK',
      durationMinutes: Number(log.durationMinutes),
      isInterruption: Boolean(log.isInterruption),
      interruptionType: log.interruptionType,
      notes: log.notes,
      timestamp: log.timestamp || new Date().toISOString(),
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO activity_logs (id, user_id, goal_id, project_id, task_id, date, activity_name, category, duration_minutes, is_interruption, interruption_type, notes, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [newLog.id, userId, newLog.goalId || null, newLog.projectId || null, newLog.taskId || null, newLog.date, newLog.activityName, newLog.category, newLog.durationMinutes, newLog.isInterruption, newLog.interruptionType || null, newLog.notes || null, newLog.timestamp]
      );

      // Increment hours on associated goal/project
      if (newLog.goalId) {
        await this.pgPool.query(
          `UPDATE goals SET current_hours = ROUND((current_hours + ($1::real / 60))::numeric, 1), updated_at = NOW() WHERE id = $2 AND user_id = $3`,
          [newLog.durationMinutes, newLog.goalId, userId]
        );
      }
      if (newLog.projectId) {
        await this.pgPool.query(
          `UPDATE projects SET time_spent_minutes = time_spent_minutes + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
          [newLog.durationMinutes, newLog.projectId, userId]
        );
      }

      return newLog;
    }

    this.fileData.activityLogs.push(newLog);
    if (newLog.goalId) {
      const g = this.fileData.goals.find((goal) => goal.id === newLog.goalId && goal.userId === userId);
      if (g) {
        g.currentHours = Math.round((g.currentHours + (newLog.durationMinutes / 60)) * 10) / 10;
      }
    }
    if (newLog.projectId) {
      const p = this.fileData.projects.find((proj) => proj.id === newLog.projectId && proj.userId === userId);
      if (p) {
        p.timeSpentMinutes += newLog.durationMinutes;
      }
    }
    this.saveFileAsync();
    return newLog;
  }

  public async deleteActivityLog(userId: string, id: string): Promise<boolean> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('DELETE FROM activity_logs WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.fileData.activityLogs.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return false;
    this.fileData.activityLogs.splice(idx, 1);
    this.saveFileAsync();
    return true;
  }

  // ==========================================
  // TIME LIMITS
  // ==========================================
  public async setTimeLimits(userId: string, limits: Array<Omit<TimeLimitRecord, 'userId'>>): Promise<TimeLimitRecord[]> {
    const formatted = limits.map((l) => ({
      id: l.id || crypto.randomUUID(),
      userId,
      activityName: l.activityName,
      limitMinutes: Number(l.limitMinutes),
      period: l.period || 'daily',
    }));

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query('DELETE FROM time_limits WHERE user_id = $1', [userId]);
      for (const lim of formatted) {
        await this.pgPool.query(
          `INSERT INTO time_limits (id, user_id, activity_name, limit_minutes, period) VALUES ($1, $2, $3, $4, $5)`,
          [lim.id, userId, lim.activityName, lim.limitMinutes, lim.period]
        );
      }
      return formatted;
    }

    this.fileData.timeLimits = this.fileData.timeLimits.filter((l) => l.userId !== userId).concat(formatted);
    this.saveFileAsync();
    return formatted;
  }

  // ==========================================
  // HABITS
  // ==========================================
  public async createHabit(userId: string, habit: Omit<HabitRecord, 'id' | 'userId' | 'createdAt'>): Promise<HabitRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newHabit: HabitRecord = {
      id,
      userId,
      name: habit.name.trim(),
      description: habit.description || '',
      frequencyPerWeek: Number(habit.frequencyPerWeek) || 7,
      streakCount: Number(habit.streakCount) || 0,
      bestStreak: Number(habit.bestStreak) || 0,
      completedDates: habit.completedDates || [],
      createdAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO habits (id, user_id, name, description, frequency_per_week, streak_count, best_streak, completed_dates, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newHabit.id, userId, newHabit.name, newHabit.description, newHabit.frequencyPerWeek, newHabit.streakCount, newHabit.bestStreak, JSON.stringify(newHabit.completedDates), now]
      );
      return newHabit;
    }

    this.fileData.habits.push(newHabit);
    this.saveFileAsync();
    return newHabit;
  }

  public async updateHabit(userId: string, id: string, updates: Partial<HabitRecord>): Promise<HabitRecord | null> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      const name = updates.name !== undefined ? updates.name.trim() : current.name;
      const description = updates.description !== undefined ? updates.description : current.description;
      const frequencyPerWeek = updates.frequencyPerWeek !== undefined ? Number(updates.frequencyPerWeek) : Number(current.frequency_per_week);
      const streakCount = updates.streakCount !== undefined ? Number(updates.streakCount) : Number(current.streak_count);
      const bestStreak = updates.bestStreak !== undefined ? Number(updates.bestStreak) : Number(current.best_streak);
      const completedDates = updates.completedDates !== undefined ? updates.completedDates : (typeof current.completed_dates === 'string' ? JSON.parse(current.completed_dates || '[]') : current.completed_dates);

      await this.pgPool.query(
        `UPDATE habits SET name = $1, description = $2, frequency_per_week = $3, streak_count = $4, best_streak = $5, completed_dates = $6
         WHERE id = $7 AND user_id = $8`,
        [name, description, frequencyPerWeek, streakCount, bestStreak, JSON.stringify(completedDates), id, userId]
      );

      return {
        id,
        userId,
        name,
        description,
        frequencyPerWeek,
        streakCount,
        bestStreak,
        completedDates,
        createdAt: current.created_at,
      };
    }

    const idx = this.fileData.habits.findIndex((h) => h.id === id && h.userId === userId);
    if (idx === -1) return null;
    this.fileData.habits[idx] = {
      ...this.fileData.habits[idx],
      ...updates,
    };
    this.saveFileAsync();
    return this.fileData.habits[idx];
  }

  public async deleteHabit(userId: string, id: string): Promise<boolean> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.fileData.habits.findIndex((h) => h.id === id && h.userId === userId);
    if (idx === -1) return false;
    this.fileData.habits.splice(idx, 1);
    this.saveFileAsync();
    return true;
  }

  public async toggleHabitDate(userId: string, habitId: string, dateStr: string): Promise<HabitRecord | null> {
    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      const res = await this.pgPool.query('SELECT * FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
      if (res.rows.length === 0) return null;

      const current = res.rows[0];
      let completedDates: string[] = typeof current.completed_dates === 'string' ? JSON.parse(current.completed_dates || '[]') : (current.completed_dates || []);
      const exists = completedDates.includes(dateStr);
      if (exists) {
        completedDates = completedDates.filter((d) => d !== dateStr);
      } else {
        completedDates.push(dateStr);
      }

      // Calculate streak
      const dates = [...completedDates].sort();
      let currentStreak = 0;
      const dateSet = new Set(dates);
      let checkDate = new Date();
      let checkStr = checkDate.toISOString().split('T')[0];
      if (!dateSet.has(checkStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }
      while (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }

      const bestStreak = Math.max(Number(current.best_streak || 0), currentStreak);

      await this.pgPool.query(
        `UPDATE habits SET completed_dates = $1, streak_count = $2, best_streak = $3 WHERE id = $4 AND user_id = $5`,
        [JSON.stringify(completedDates), currentStreak, bestStreak, habitId, userId]
      );

      return {
        id: habitId,
        userId,
        name: current.name,
        description: current.description,
        frequencyPerWeek: Number(current.frequency_per_week),
        streakCount: currentStreak,
        bestStreak,
        completedDates,
        createdAt: current.created_at,
      };
    }

    const habit = this.fileData.habits.find((h) => h.id === habitId && h.userId === userId);
    if (!habit) return null;

    const exists = habit.completedDates.includes(dateStr);
    if (exists) {
      habit.completedDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      habit.completedDates.push(dateStr);
    }

    const dates = [...habit.completedDates].sort();
    let currentStreak = 0;
    const dateSet = new Set(dates);
    let checkDate = new Date();
    let checkStr = checkDate.toISOString().split('T')[0];
    if (!dateSet.has(checkStr)) {
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
    this.saveFileAsync();
    return habit;
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  public async saveReview(userId: string, review: Omit<ReviewRecord, 'id' | 'userId' | 'createdAt'>): Promise<ReviewRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newReview: ReviewRecord = {
      id,
      userId,
      type: review.type || 'weekly',
      periodLabel: review.periodLabel || 'Weekly Review',
      startDate: review.startDate,
      endDate: review.endDate,
      dataSummary: review.dataSummary || {},
      aiMentorReport: review.aiMentorReport,
      userReflection: review.userReflection,
      createdAt: now,
    };

    if (this.engine === 'postgres' && this.pgPool) {
      await this.ensurePostgresReady();
      await this.pgPool.query(
        `INSERT INTO reviews (id, user_id, type, period_label, start_date, end_date, data_summary, ai_mentor_report, user_reflection, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newReview.id, userId, newReview.type, newReview.periodLabel, newReview.startDate, newReview.endDate, JSON.stringify(newReview.dataSummary), newReview.aiMentorReport ? JSON.stringify(newReview.aiMentorReport) : null, newReview.userReflection || null, now]
      );
      return newReview;
    }

    this.fileData.reviews.push(newReview);
    this.saveFileAsync();
    return newReview;
  }

  // ==========================================
  // SYNC BATCH STATE
  // ==========================================
  public async syncUserData(
    userId: string,
    state: Partial<{
      profile: Partial<UserProfileRecord>;
      goals: GoalRecord[];
      projects: ProjectRecord[];
      tasks: TaskRecord[];
      focusSessions: FocusSessionRecord[];
      activityLogs: ActivityLogRecord[];
      timeLimits: TimeLimitRecord[];
      habits: HabitRecord[];
    }>
  ) {
    if (state.profile) {
      await this.updateUserProfile(userId, state.profile);
    }
    if (state.goals) {
      for (const g of state.goals) {
        if (g.id) {
          const updated = await this.updateGoal(userId, g.id, g);
          if (!updated) {
            await this.createGoal(userId, g);
          }
        } else {
          await this.createGoal(userId, g);
        }
      }
    }
    if (state.projects) {
      for (const p of state.projects) {
        if (p.id) {
          const updated = await this.updateProject(userId, p.id, p);
          if (!updated) {
            await this.createProject(userId, p);
          }
        } else {
          await this.createProject(userId, p);
        }
      }
    }
    if (state.tasks) {
      for (const t of state.tasks) {
        if (t.id) {
          const updated = await this.updateTask(userId, t.id, t);
          if (!updated) {
            await this.createTask(userId, t);
          }
        } else {
          await this.createTask(userId, t);
        }
      }
    }
    if (state.timeLimits) {
      await this.setTimeLimits(userId, state.timeLimits);
    }
    if (state.habits) {
      for (const h of state.habits) {
        if (h.id) {
          const updated = await this.updateHabit(userId, h.id, h);
          if (!updated) {
            await this.createHabit(userId, h);
          }
        } else {
          await this.createHabit(userId, h);
        }
      }
    }

    return await this.getUserData(userId);
  }
}

export const db = new DatabaseService();
