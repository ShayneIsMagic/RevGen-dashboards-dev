import type { Goal, GoalMetrics } from '@/types';

export function calculateGoalMetrics(goal: Goal): GoalMetrics {
  const starting = goal.startingValue ?? 0;
  const current = goal.currentValue ?? 0;
  const target = goal.targetValue ?? 0;
  const total = target - starting;
  const currentProgress = current - starting;
  const remaining = target - current;
  const progress = total !== 0 ? (currentProgress / total * 100).toFixed(1) : '0.0';

  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const daysElapsed = Math.max(1, Math.ceil((today.getTime() - new Date(goal.createdAt || goal.targetDate).getTime()) / (1000 * 60 * 60 * 24)));
  const currentRunRate = daysElapsed > 0 ? currentProgress / daysElapsed : 0;
  const requiredRunRate = daysRemaining > 0 ? remaining / daysRemaining : 0;

  return {
    progress,
    remaining,
    daysRemaining,
    currentRunRate,
    requiredRunRate,
    onTrack: currentRunRate >= requiredRunRate,
  };
}

