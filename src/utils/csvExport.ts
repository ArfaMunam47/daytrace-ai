import { ActivityLogItem, Goal, Project, PlannedTask } from '../types';

export function exportActivityLogsToCSV(
  logs: ActivityLogItem[],
  goals: Goal[],
  projects: Project[],
  tasks: PlannedTask[]
): void {
  const goalMap = new Map(goals.map((g) => [g.id, g.name]));
  const projMap = new Map(projects.map((p) => [p.id, p.name]));

  const headers = [
    'Date',
    'Activity',
    'Category',
    'Planned Duration (min)',
    'Actual Duration (min)',
    'Goal',
    'Project',
    'Completed',
    'Interruption',
    'Interruption Type',
    'Notes',
    'Timestamp',
  ];

  const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const rows = logs.map((log) => {
    const goalName = log.goalId ? goalMap.get(log.goalId) || '' : '';
    const projName = log.projectId ? projMap.get(log.projectId) || '' : '';
    const matchingTask = tasks.find(
      (t) => t.date === log.date && t.name.toLowerCase() === log.activityName.toLowerCase()
    );

    const plannedDuration = matchingTask ? matchingTask.estimatedMinutes : '';
    const completed = matchingTask ? (matchingTask.completed ? 'YES' : 'NO') : 'N/A';
    const isInterruption = log.isInterruption ? 'YES' : 'NO';
    const interruptionType = log.interruptionType || '';

    return [
      log.date,
      escapeCsv(log.activityName),
      log.category,
      plannedDuration,
      log.durationMinutes,
      escapeCsv(goalName),
      escapeCsv(projName),
      completed,
      isInterruption,
      escapeCsv(interruptionType),
      escapeCsv(log.notes || ''),
      log.timestamp,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DayTrace-Activity-Export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportActivityLogsCSV = exportActivityLogsToCSV;

export function exportWeeklyReviewCSV(review: {
  weekStart: string;
  weekEnd: string;
  totalFocusMinutes: number;
  plannedFocusMinutes: number;
  executionPercentage: number;
  distractionMinutes: number;
  responsibilityMinutes: number;
  completedTasksCount: number;
  unfinishedTasksCount: number;
  habitConsistencyPercent: number;
  topActivities: { name: string; minutes: number; category: string }[];
  biggestDistractions: { name: string; minutes: number; limitMinutes: number; overageMinutes: number }[];
}): void {
  const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Week Start', review.weekStart],
    ['Week End', review.weekEnd],
    ['Total Focus Minutes', String(review.totalFocusMinutes)],
    ['Planned Focus Minutes', String(review.plannedFocusMinutes)],
    ['Execution Rate (%)', String(review.executionPercentage)],
    ['Distraction Minutes', String(review.distractionMinutes)],
    ['Responsibility Minutes', String(review.responsibilityMinutes)],
    ['Completed Tasks', String(review.completedTasksCount)],
    ['Deferred/Unfinished Tasks', String(review.unfinishedTasksCount)],
    ['Habit Consistency (%)', String(review.habitConsistencyPercent)],
    ['', ''],
    ['--- Top Activities ---', '--- Minutes ---'],
    ...review.topActivities.map((a) => [a.name, `${a.minutes} min (${a.category})`]),
    ['', ''],
    ['--- Distraction Item ---', '--- Minutes Logged (Limit / Overage) ---'],
    ...review.biggestDistractions.map((d) => [
      d.name,
      `${d.minutes} min (Limit: ${d.limitMinutes}m, Overage: ${d.overageMinutes}m)`,
    ]),
  ];

  const csvContent = rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DayTrace-Weekly-Review-${review.weekStart}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
