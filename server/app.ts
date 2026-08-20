import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { generateAIContent, generateAIContentStream, getAIRouterTelemetry } from './aiRouter.js';
import {
  buildMentorSystemInstruction,
  buildWeeklyReviewSystemInstruction,
  formatConversationPrompt,
  generateNaturalFallbackReply,
  MentorUserContext,
} from './mentorEngine.js';

dotenv.config();

export const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'daytrace_prod_jwt_secret_983719283712';

app.use(express.json({ limit: '10mb' }));

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded || !decoded.userId) {
      return res.status(403).json({ error: 'Session expired or invalid. Please log in again.' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// ----------------------------------------------------
// Health Check & Diagnostic Status
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseEngine: db.getEngine(),
    isPersistent: db.isPersistent(),
    time: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

// 1. Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const normalizedEmail = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  try {
    const { firstName, lastName, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'All fields (first name, last name, email, password) are required.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existingUser = await db.findUserByEmail(normalizedEmail);
    if (existingUser) {
      console.warn(`[Auth] Signup rejected for existing email: ${normalizedEmail}`);
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email: normalizedEmail,
      passwordHash,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const profile = await db.getUserProfile(user.id);

    console.log(`[Auth] User created successfully: ${user.id} (${normalizedEmail})`);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    console.error(`[Auth] Signup database/server failure for ${normalizedEmail}:`, error?.message || error);
    return res.status(500).json({ error: 'Something went wrong while completing registration. Please try again.' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  const normalizedEmail = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  try {
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user;
    try {
      user = await db.findUserByEmail(normalizedEmail);
    } catch (dbErr: any) {
      console.error(`[Auth] Database lookup error during login for ${normalizedEmail}:`, dbErr?.message || dbErr);
      return res.status(500).json({ error: 'Something went wrong while signing you in. Please try again.' });
    }

    if (!user) {
      console.warn(`[Auth] Login attempt for unregistered email: ${normalizedEmail}`);
      return res.status(401).json({
        error: 'No account found with this email. Please switch to Create Account to sign up.',
        code: 'USER_NOT_FOUND',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[Auth] Login failed: Password mismatch for user: ${user.id} (${normalizedEmail})`);
      return res.status(401).json({
        error: 'Incorrect password. Please verify your password or use "Forgot password?" to reset it.',
        code: 'INVALID_PASSWORD',
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const profile = await db.getUserProfile(user.id);

    console.log(`[Auth] User login successful: ${user.id} (${normalizedEmail})`);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    console.error(`[Auth] Unexpected server error during login for ${normalizedEmail}:`, error?.message || error);
    return res.status(500).json({ error: 'Something went wrong while signing you in. Please try again.' });
  }
});

// 3. Get Current User & Profile (/api/auth/me)
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.findUserById(req.userId!);
    if (!user) {
      console.warn(`[Auth] /api/auth/me: User ${req.userId} not found in database.`);
      return res.status(404).json({ error: 'User account not found.' });
    }

    const profile = await db.getUserProfile(user.id);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    console.error(`[Auth] Error in /api/auth/me for user ${req.userId}:`, error?.message || error);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// 4. Update Profile
app.patch('/api/auth/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      role,
      customRole,
      custom_role,
      occupation,
      dailyCapacityHours,
      mainGoalsSummary,
      timezone,
      theme,
      soundEffects,
      notificationsEnabled,
      onboarded,
      welcomeDismissed,
    } = req.body;

    if (firstName || lastName) {
      await db.updateUser(req.userId!, {
        ...(firstName ? { firstName: String(firstName).trim() } : {}),
        ...(lastName ? { lastName: String(lastName).trim() } : {}),
      });
    }

    const updatedProfile = await db.updateUserProfile(req.userId!, {
      ...(role !== undefined ? { role } : {}),
      ...(customRole !== undefined ? { customRole } : {}),
      ...(custom_role !== undefined ? { custom_role } : {}),
      ...(occupation !== undefined ? { occupation } : {}),
      ...(dailyCapacityHours !== undefined ? { dailyCapacityHours: Number(dailyCapacityHours) } : {}),
      ...(mainGoalsSummary !== undefined ? { mainGoalsSummary } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(soundEffects !== undefined ? { soundEffects: Boolean(soundEffects) } : {}),
      ...(notificationsEnabled !== undefined ? { notificationsEnabled: Boolean(notificationsEnabled) } : {}),
      ...(onboarded !== undefined ? { onboarded: Boolean(onboarded) } : {}),
      ...(welcomeDismissed !== undefined ? { welcomeDismissed: Boolean(welcomeDismissed) } : {}),
    });

    const user = await db.findUserById(req.userId!);

    return res.json({
      success: true,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        createdAt: user!.createdAt,
      },
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// 5. Forgot Password & Reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link/code has been generated.',
        resetCode: '123456',
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.updateUser(user.id, {
      resetToken: resetCode,
      resetTokenExpiry: Date.now() + 1000 * 60 * 60,
    });

    return res.json({
      success: true,
      message: 'Password reset code generated.',
      resetCode,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const { resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user || user.resetToken !== resetCode || (user.resetTokenExpiry && user.resetTokenExpiry < Date.now())) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    return res.json({ success: true, message: 'Password has been successfully updated. You can now log in.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ----------------------------------------------------
// Data Access & Sync API (Isolated strictly to req.userId)
// ----------------------------------------------------

app.get('/api/data', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.getUserData(req.userId!);
    if (!data) {
      return res.status(404).json({ error: 'User dataset not found.' });
    }
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

app.post('/api/sync', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await db.syncUserData(req.userId!, req.body);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Failed to synchronize data with database.' });
  }
});

// Goals
app.post('/api/goals', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, category, targetHours, priority, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Goal name is required.' });

    const goal = await db.createGoal(req.userId!, {
      name: String(name).trim(),
      description: description || '',
      category: category || 'CORE_SKILL',
      targetHours: Number(targetHours) || 100,
      currentHours: 0,
      priority: priority || 'high',
      status: status || 'active',
    });
    return res.status(201).json(goal);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create goal.' });
  }
});

app.patch('/api/goals/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const goal = await db.updateGoal(req.userId!, req.params.id, req.body);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });
    return res.json(goal);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update goal.' });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await db.deleteGoal(req.userId!, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Goal not found.' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

// Projects
app.post('/api/projects', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, goalId, deadline, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required.' });

    const project = await db.createProject(req.userId!, {
      name: String(name).trim(),
      description: description || '',
      goalId,
      deadline,
      status: status || 'active',
      timeSpentMinutes: 0,
    });
    return res.status(201).json(project);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create project.' });
  }
});

app.patch('/api/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await db.updateProject(req.userId!, req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    return res.json(project);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update project.' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await db.deleteProject(req.userId!, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Project not found.' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// Tasks
app.post('/api/tasks', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, date, priority, estimatedMinutes, projectId, goalId } = req.body;
    if (!name || !date) return res.status(400).json({ error: 'Task name and date are required.' });

    const task = await db.createTask(req.userId!, {
      name: String(name).trim(),
      date,
      priority: priority || 'should',
      estimatedMinutes: Number(estimatedMinutes) || 30,
      actualMinutes: 0,
      completed: false,
      projectId,
      goalId,
    });
    return res.status(201).json(task);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create task.' });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const task = await db.updateTask(req.userId!, req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    return res.json(task);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update task.' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await db.deleteTask(req.userId!, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Task not found.' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// Focus Sessions
app.post('/api/focus-sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { activityName, category, startedAt, plannedDurationMinutes, taskId, isInterruption, interruptionType, notes } = req.body;
    if (!activityName) return res.status(400).json({ error: 'Activity name is required.' });

    const session = await db.createFocusSession(req.userId!, {
      activityName: String(activityName),
      category: category || 'DEEP_WORK',
      startedAt: startedAt || Date.now(),
      plannedDurationMinutes: Number(plannedDurationMinutes) || 25,
      actualDurationMinutes: 0,
      status: 'running',
      taskId,
      isInterruption: Boolean(isInterruption),
      interruptionType,
      notes,
    });
    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create focus session.' });
  }
});

app.patch('/api/focus-sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const session = await db.updateFocusSession(req.userId!, req.params.id, req.body);
    if (!session) return res.status(404).json({ error: 'Focus session not found.' });
    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update focus session.' });
  }
});

// Activity Logs
app.post('/api/activity-logs', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { activityName, category, durationMinutes, date, goalId, projectId, taskId, isInterruption, interruptionType, notes, timestamp } = req.body;
    if (!activityName || !durationMinutes) {
      return res.status(400).json({ error: 'Activity name and duration are required.' });
    }

    const log = await db.createActivityLog(req.userId!, {
      activityName: String(activityName).trim(),
      category: category || 'DEEP_WORK',
      durationMinutes: Number(durationMinutes),
      date: date || new Date().toISOString().split('T')[0],
      goalId,
      projectId,
      taskId,
      isInterruption: Boolean(isInterruption),
      interruptionType,
      notes,
      timestamp: timestamp || new Date().toISOString(),
    });
    return res.status(201).json(log);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record activity log.' });
  }
});

app.delete('/api/activity-logs/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await db.deleteActivityLog(req.userId!, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Log not found.' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete activity log.' });
  }
});

// Habits
app.post('/api/habits', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, frequencyPerWeek } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required.' });

    const habit = await db.createHabit(req.userId!, {
      name: String(name).trim(),
      description: description || '',
      frequencyPerWeek: Number(frequencyPerWeek) || 7,
      streakCount: 0,
      bestStreak: 0,
      completedDates: [],
    });
    return res.status(201).json(habit);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create habit.' });
  }
});

app.patch('/api/habits/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const habit = await db.updateHabit(req.userId!, req.params.id, req.body);
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    return res.json(habit);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update habit.' });
  }
});

app.delete('/api/habits/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const ok = await db.deleteHabit(req.userId!, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Habit not found.' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

app.post('/api/habits/:id/toggle-date', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required.' });

    const habit = await db.toggleHabitDate(req.userId!, req.params.id, String(date));
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    return res.json(habit);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to toggle habit date.' });
  }
});

// Time Limits
app.post('/api/time-limits', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limits } = req.body;
    if (!Array.isArray(limits)) return res.status(400).json({ error: 'Limits array is required.' });

    const updated = await db.setTimeLimits(req.userId!, limits);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to save time limits.' });
  }
});

// Reviews
app.post('/api/reviews', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, periodLabel, startDate, endDate, dataSummary, aiMentorReport, userReflection } = req.body;
    const review = await db.saveReview(req.userId!, {
      type: type || 'weekly',
      periodLabel: periodLabel || 'Weekly Review',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date().toISOString(),
      dataSummary: dataSummary || {},
      aiMentorReport,
      userReflection,
    });
    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to save review.' });
  }
});

// ----------------------------------------------------
// AI Mentor & Advisory Endpoints
// (Protected with authenticateToken: only user's isolated data is processed)
// ----------------------------------------------------

app.post('/api/ai/mentor-review', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { reviewType, dataSummary, userProfile } = req.body;
  const user = await db.findUserById(req.userId!);
  const userProf = await db.getUserProfile(req.userId!);
  const safeProfile = {
    name: user ? `${user.firstName} ${user.lastName}`.trim() : (userProfile?.name || 'User'),
    occupation: userProf?.occupation || userProf?.role || userProfile?.occupation || 'Professional / Student',
    goals: userProfile?.goals || [],
  };

  const systemPrompt = buildWeeklyReviewSystemInstruction(safeProfile);

  const userPrompt = `Generate an Honest AI ${reviewType === 'monthly' ? 'Monthly' : 'Weekly'} Mentor Review.
User Profile:
- Name: ${safeProfile.name}
- Role/Occupation: ${safeProfile.occupation}
- Main Goals: ${JSON.stringify(safeProfile.goals || [])}

Performance Data (Real User Logs & Tasks):
${JSON.stringify(dataSummary, null, 2)}

Provide an honest, constructive 10-point analysis evaluating planned vs actual focus time, distraction overages, interruption impacts, task execution rate, consistency, and role-appropriate recommendations.`;

  const aiResult = await generateAIContent(userPrompt, {
    systemInstruction: systemPrompt,
    responseMimeType: 'application/json',
    temperature: 0.35,
    endpointName: 'mentor-review',
    userId: req.userId,
    validator: (data) => {
      return (
        data &&
        typeof data === 'object' &&
        (typeof data.summary === 'string' || typeof data.weeklyOverview === 'string') &&
        Array.isArray(data.wins) &&
        Array.isArray(data.recommendations)
      );
    },
  });

  if (aiResult.success && aiResult.data) {
    return res.json({
      success: true,
      source: aiResult.modelUsed,
      fallbackUsed: aiResult.fallbackUsed,
      fallbackChain: aiResult.fallbackChain,
      durationMs: aiResult.durationMs,
      report: aiResult.data,
    });
  }

  // Graceful deterministic fallback if AI is unavailable or rate limited across all models
  console.warn(`[DayTrace] Falling back to deterministic review engine. Reason: ${aiResult.error || 'AI unavailable'}`);
  const fallbackReport = generateDeterministicMentorReport(reviewType, dataSummary, safeProfile);
  return res.json({
    success: true,
    source: 'local_deterministic_engine',
    fallbackUsed: true,
    report: fallbackReport,
    notice: 'AI generation is temporarily unavailable. Your activity data has been analyzed via the DayTrace core audit engine.',
    error: aiResult.error,
    errorCategory: aiResult.errorCategory,
  });
});

app.post('/api/ai/plan-advisory', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { plannedTasks, historicalAvgDailyHours, userProfile } = req.body;
  const user = await db.findUserById(req.userId!);
  const userName = user ? user.firstName : (userProfile?.name || 'User');

  const totalPlannedMinutes = (plannedTasks || []).reduce(
    (acc: number, t: any) => acc + (Number(t.estimatedMinutes) || 0),
    0
  );
  const plannedHours = (totalPlannedMinutes / 60).toFixed(1);

  const prompt = `Analyze this daily plan for feasibility:
User: ${userName} (${userProfile?.occupation || 'Learner/Developer'})
Total Planned Workload: ${plannedHours} hours (${totalPlannedMinutes} minutes).
Historical Average Execution: ${historicalAvgDailyHours || 3.2} hours/day.
Planned Tasks:
${JSON.stringify(plannedTasks, null, 2)}

Provide a concise, practical evaluation. If it exceeds realistic capacity, gently suggest which tasks to move to 'Should Do' or 'Optional'.`;

  const systemInstruction = `You are an adaptive productivity coach. Return JSON:
{
  "isUnrealistic": boolean,
  "plannedHours": number,
  "advice": string (2-3 sentences max, honest and encouraging without shaming),
  "suggestedPriorityCuts": [string, ...]
}`;

  const aiResult = await generateAIContent(prompt, {
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.3,
    endpointName: 'plan-advisory',
    userId: req.userId,
    validator: (data) => data && typeof data === 'object' && typeof data.advice === 'string',
  });

  if (aiResult.success && aiResult.data) {
    return res.json({
      success: true,
      source: aiResult.modelUsed,
      fallbackUsed: aiResult.fallbackUsed,
      ...aiResult.data,
    });
  }

  // Deterministic calculation fallback
  const isUnrealistic = totalPlannedMinutes > 360;
  let advice = '';
  if (totalPlannedMinutes > 480) {
    advice = `You have planned ${plannedHours}h of focused work. Based on realistic human cognitive stamina and unpredictable responsibilities, this is likely over-optimistic. Consider narrowing down to 2-3 essential 'Must Do' items.`;
  } else if (totalPlannedMinutes > 360) {
    advice = `You have planned ${plannedHours}h of focused work. Be mindful of potential interruptions from chores or unexpected events.`;
  } else {
    advice = `You have planned ${plannedHours}h of focused work. This is a balanced, sustainable target with buffer for real life.`;
  }

  return res.json({
    success: true,
    source: 'local_capacity_engine',
    fallbackUsed: true,
    isUnrealistic,
    plannedHours: Number(plannedHours),
    advice,
    suggestedPriorityCuts: totalPlannedMinutes > 420 ? ['Demote lowest priority tasks to Optional'] : [],
    notice: 'Evaluated using local capacity guidelines.',
  });
});

// Live AI Mentor Chat Streaming SSE endpoint (Ultra-fast, sub-second token delivery)
app.post('/api/ai/chat-stream', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { message, history, currentView } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
  });

  const sendSSE = (eventObj: any) => {
    if (!clientDisconnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(eventObj)}\n\n`);
    }
  };

  try {
    const user = await db.findUserById(req.userId!);
    const profile = await db.getUserProfile(req.userId!);
    const userData = await db.getUserData(req.userId!);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = (userData?.tasks || []).filter((t: any) => t.date === todayStr);
    const todayLogs = (userData?.activityLogs || []).filter((l: any) => l.date === todayStr);
    const activeGoals = (userData?.goals || []).filter((g: any) => g.status !== 'completed');
    const activeHabits = userData?.habits || [];

    const mentorContext: MentorUserContext = {
      userId: req.userId!,
      userName: user ? `${user.firstName} ${user.lastName}`.trim() : 'User',
      userFirstName: user ? user.firstName : 'there',
      occupation: profile?.occupation || profile?.role || 'Professional / Student',
      dailyCapacityHours: profile?.dailyCapacityHours || 4.5,
      todayStr,
      currentView: currentView || 'dashboard',
      todayTasks,
      todayLogs,
      activeGoals,
      activeHabits,
      weeklyReviews: (userData?.reviews || []).filter((r: any) => r.type === 'weekly'),
    };

    const systemPrompt = buildMentorSystemInstruction(mentorContext);
    const formattedPrompt = formatConversationPrompt(history || [], message);

    sendSSE({ type: 'start' });

    const streamResult = await generateAIContentStream(
      formattedPrompt,
      {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        endpointName: 'mentor-chat-stream',
        userId: req.userId,
      },
      (chunkText) => {
        if (!clientDisconnected) {
          sendSSE({ type: 'chunk', text: chunkText });
        }
      }
    );

    if (streamResult.success && streamResult.totalText && streamResult.totalText.trim()) {
      sendSSE({
        type: 'done',
        modelUsed: streamResult.modelUsed,
        fallbackUsed: streamResult.fallbackUsed,
        totalText: streamResult.totalText,
      });
      res.end();
      return;
    }

    // Natural offline conversational fallback if AI stream failed
    console.warn(`[DayTrace Stream] Stream failover fallback triggered: ${streamResult.error || 'No content'}`);
    const fallbackReply = generateNaturalFallbackReply(message, history || [], mentorContext);

    // Stream fallback piece by piece for consistent smooth UX
    const words = fallbackReply.split(' ');
    for (let i = 0; i < words.length; i++) {
      sendSSE({ type: 'chunk', text: (i > 0 ? ' ' : '') + words[i] });
      await new Promise((r) => setTimeout(r, 20));
    }

    sendSSE({
      type: 'done',
      modelUsed: 'local_mentor_fallback',
      fallbackUsed: true,
      totalText: fallbackReply,
      notice: 'Generated via DayTrace offline coaching rules.',
    });
    res.end();
  } catch (error: any) {
    console.error('Error in /api/ai/chat-stream:', error);
    sendSSE({ type: 'error', error: 'Failed to complete stream response.' });
    res.end();
  }
});

// Live AI Mentor Chat endpoint with failover & multi-turn history (REST fallback)
app.post('/api/ai/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, history, currentView } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const user = await db.findUserById(req.userId!);
    const profile = await db.getUserProfile(req.userId!);
    const userData = await db.getUserData(req.userId!);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = (userData?.tasks || []).filter((t: any) => t.date === todayStr);
    const todayLogs = (userData?.activityLogs || []).filter((l: any) => l.date === todayStr);
    const activeGoals = (userData?.goals || []).filter((g: any) => g.status !== 'completed');
    const activeHabits = userData?.habits || [];

    const mentorContext: MentorUserContext = {
      userId: req.userId!,
      userName: user ? `${user.firstName} ${user.lastName}`.trim() : 'User',
      userFirstName: user ? user.firstName : 'there',
      occupation: profile?.occupation || profile?.role || 'Professional / Student',
      dailyCapacityHours: profile?.dailyCapacityHours || 4.5,
      todayStr,
      currentView: currentView || 'dashboard',
      todayTasks,
      todayLogs,
      activeGoals,
      activeHabits,
      weeklyReviews: (userData?.reviews || []).filter((r: any) => r.type === 'weekly'),
    };

    const systemPrompt = buildMentorSystemInstruction(mentorContext);
    const formattedPrompt = formatConversationPrompt(history || [], message);

    const aiResult = await generateAIContent(formattedPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.6,
      endpointName: 'mentor-chat',
      userId: req.userId,
    });

    if (aiResult.success && aiResult.rawText && aiResult.rawText.trim()) {
      return res.json({
        success: true,
        source: aiResult.modelUsed,
        fallbackUsed: aiResult.fallbackUsed,
        reply: aiResult.rawText.trim(),
      });
    }

    // Graceful, natural conversational deterministic fallback if AI provider is temporarily unavailable
    console.warn(`[DayTrace] AI Chat fallback triggered: ${aiResult.error || 'Provider unavailable'}`);
    const fallbackReply = generateNaturalFallbackReply(message, history || [], mentorContext);

    return res.json({
      success: true,
      source: 'local_mentor_fallback',
      fallbackUsed: true,
      reply: fallbackReply,
      notice: 'Generated via DayTrace offline coaching rules while AI service reconnects.',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ error: 'Failed to generate mentor response.' });
  }
});

// AI Telemetry & Health Monitoring Endpoint
app.get('/api/ai/telemetry', authenticateToken, (req: AuthenticatedRequest, res) => {
  const telemetry = getAIRouterTelemetry();
  return res.json(telemetry);
});

// Deterministic mentor report generator fallback (10-Point Analysis Structure)
export function generateDeterministicMentorReport(reviewType: string, summary: any, profile: any) {
  const focusMinutes = Number(summary?.totalFocusMinutes || (summary?.totalFocusHours ? summary.totalFocusHours * 60 : 0));
  const focusHours = focusMinutes / 60;
  const plannedMinutes = Number(summary?.plannedFocusMinutes || (summary?.plannedFocusHours ? summary.plannedFocusHours * 60 : 0));
  const plannedHours = plannedMinutes / 60;
  const completedTasksCount = Number(summary?.completedTasksCount || 0);
  const totalTasksCount = Number(summary?.totalTasksCount || 0);
  const incompleteTasksCount = Math.max(0, totalTasksCount - completedTasksCount);
  const executionRate = Number(
    summary?.executionRate || (totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : plannedHours > 0 ? Math.round((focusHours / plannedHours) * 100) : 100)
  );
  const distractionMinutes = Number(summary?.distractionMinutes || (summary?.totalDistractionHours ? summary.totalDistractionHours * 60 : 0));
  const distractionHours = distractionMinutes / 60;
  const responsibilityMinutes = Number(summary?.responsibilityMinutes || (summary?.totalResponsibilityHours ? summary.totalResponsibilityHours * 60 : 0));
  const responsibilityHours = responsibilityMinutes / 60;
  const habitConsistency = Number(summary?.habitConsistency || 85);

  let score = Math.round(
    Math.min(100, Math.max(25, (executionRate || 75) * 0.4 + habitConsistency * 0.3 + (focusHours > 0 ? 20 : 0) - (distractionHours > 5 ? 10 : 0)))
  );
  let scoreGrade = score >= 85 ? 'A' : score >= 75 ? 'B+' : score >= 65 ? 'B' : score >= 50 ? 'C+' : 'Needs Realignment';

  const wins: string[] = [];
  const challenges: string[] = [];
  const productivityPatterns: string[] = [];
  const recommendations: string[] = [];

  if (focusHours >= 10) {
    wins.push(`Logged ${focusHours.toFixed(1)} hours of deep focused work across authentic time records.`);
  } else if (focusHours > 0) {
    wins.push(`Maintained focused output totaling ${focusHours.toFixed(1)} hours.`);
  } else {
    wins.push('Logged daily activities and established a baseline for structured time awareness.');
  }

  if (completedTasksCount > 0) {
    wins.push(`Successfully delivered ${completedTasksCount} planned action items.`);
  }

  if (responsibilityHours > 0) {
    wins.push(`Balanced ${responsibilityHours.toFixed(1)}h of real-world responsibilities and interruptions while maintaining active habit records.`);
  }

  if (plannedHours > 0 && focusHours < plannedHours * 0.75) {
    const diff = (plannedHours - focusHours).toFixed(1);
    challenges.push(`Planned vs Actual variance: Scheduled ${plannedHours.toFixed(1)}h but executed ${focusHours.toFixed(1)}h (shortfall of ${diff}h).`);
    productivityPatterns.push('Tendency to plan idealized daily schedules that underestimate task transition friction and real-life delays.');
    recommendations.push(`Calibrate next week's planned focus target down to ~${Math.max(4, Math.round(focusHours * 1.15))}h to match your real throughput.`);
  }

  if (distractionHours > 3) {
    challenges.push(`Distraction leakage accumulated ${distractionHours.toFixed(1)}h in entertainment / social feeds.`);
    recommendations.push('Enforce strict 20-minute daily boundaries on entertainment feeds before starting deep work.');
  }

  if (recommendations.length < 3) {
    recommendations.push('Protect 1 uninterrupted 60-minute focus block each morning before checking communications or feeds.');
    recommendations.push('Cap daily "Must Do" tasks at a maximum of 2 core priorities to prevent cognitive overload.');
    recommendations.push('Log unplanned interruptions immediately as they occur to maintain accurate self-knowledge.');
  }

  if (productivityPatterns.length === 0) {
    productivityPatterns.push('Strongest focus execution occurs during morning sessions, with higher vulnerability to distraction in late afternoon.');
    productivityPatterns.push('Task completion rate increases significantly on days with fewer than 4 planned items.');
  }

  const role = (profile?.occupation || 'Professional / Student').toLowerCase();
  let nextFocus = profile?.goals?.[0]?.name || 'Core project milestone delivery & sustainable daily planning';
  if (role.includes('student')) {
    nextFocus = 'Consistent study blocks & active recall exam preparation';
  } else if (role.includes('builder') || role.includes('dev')) {
    nextFocus = 'Deep building sessions & core feature delivery';
  }

  const overview = `Across this ${reviewType || 'weekly'} period, you recorded ${focusHours.toFixed(1)}h of focused output with an execution rate of ${executionRate}%. You balanced planned milestones against real-world commitments and interruptions.`;

  return {
    score,
    scoreGrade,
    summary: overview,
    weeklyOverview: overview,
    focusAnalysis: {
      totalFocusHours: Number(focusHours.toFixed(1)),
      sessionCount: Math.max(1, Math.round(focusMinutes / 45)),
      avgSessionMinutes: 45,
      mostProductiveDay: 'Mid-week peak',
      leastProductiveDay: 'Weekend / Transition days',
      insight: `You achieved ${focusHours.toFixed(1)}h of deep work. Maintaining 45-minute focus intervals helps sustain stamina.`,
    },
    taskAnalysis: {
      completedCount: completedTasksCount,
      incompleteCount: incompleteTasksCount,
      postponedCount: Math.min(incompleteTasksCount, 3),
      executionRate,
      insight: `Completed ${completedTasksCount} of ${totalTasksCount} planned tasks (${executionRate}% completion rate).`,
    },
    interruptionAnalysis: {
      interruptionCount: Math.max(1, Math.round(responsibilityHours * 1.5)),
      totalInterruptionHours: Number(responsibilityHours.toFixed(1)),
      impactSummary: responsibilityHours > 0
        ? `Handled ${responsibilityHours.toFixed(1)}h of unplanned responsibilities and household interruptions with resilience.`
        : 'Interruptions remained minimal across the period.',
    },
    consistency: {
      activeDaysCount: Math.min(7, Math.max(1, totalTasksCount > 0 ? 5 : 2)),
      strongestPattern: 'Morning deep work initiation',
      weaknessPattern: 'Late afternoon energy dips',
    },
    productivityPatterns,
    wins,
    problems: challenges.length > 0 ? challenges : ['Occasional variance in daily start times.'],
    challenges: challenges.length > 0 ? challenges : ['Balancing planned goals against unexpected daily tasks.'],
    realityCheck: focusHours >= (plannedHours * 0.7)
      ? 'You are making steady, measurable forward strides on your core priorities. Protect this consistency.'
      : 'You are making progress, but over-committing in morning plans creates false frustration. Aligning your daily plan with reality is your primary growth lever.',
    recommendations,
    nextWeekFocus: nextFocus,
  };
}
