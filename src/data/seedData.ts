import {
  UserProfile,
  TimeLimitBoundary,
} from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'User',
  occupation: 'Professional / Builder',
  dailyCapacityHours: 4.5,
  mainGoalsSummary: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  theme: 'dark',
  soundEffects: true,
  notificationsEnabled: true,
  onboarded: false,
};

export const INITIAL_TIME_LIMITS: TimeLimitBoundary[] = [
  {
    id: 'limit-1',
    activityName: 'YouTube / Video Streaming',
    limitMinutes: 30,
    period: 'daily',
  },
  {
    id: 'limit-2',
    activityName: 'Social Media / Feeds',
    limitMinutes: 20,
    period: 'daily',
  },
];
