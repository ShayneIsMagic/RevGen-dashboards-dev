import { calculateGoalMetrics } from '@/lib/utils';
import type { Goal } from '@/types';

describe('calculateGoalMetrics', () => {
  const baseGoal: Goal = {
    id: 1,
    name: 'Test Goal',
    category: 'Revenue',
    startingValue: 0,
    currentValue: 0,
    targetValue: 100,
    targetDate: '2025-12-31',
    unit: '$',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate progress correctly', () => {
    const goal = { ...baseGoal, startingValue: 0, currentValue: 50, targetValue: 100 };
    const metrics = calculateGoalMetrics(goal);
    
    expect(metrics.progress).toBe('50.0');
  });

  it('should handle zero starting value', () => {
    const goal = { ...baseGoal, startingValue: 0, currentValue: 25, targetValue: 100 };
    const metrics = calculateGoalMetrics(goal);
    
    expect(metrics.progress).toBe('25.0');
    expect(metrics.remaining).toBe(75);
  });

  it('should calculate remaining amount correctly', () => {
    const goal = { ...baseGoal, startingValue: 0, currentValue: 30, targetValue: 100 };
    const metrics = calculateGoalMetrics(goal);
    
    expect(metrics.remaining).toBe(70);
  });

  it('should calculate days remaining correctly', () => {
    const goal = { ...baseGoal, targetDate: '2025-12-31' };
    const metrics = calculateGoalMetrics(goal);
    
    // Should be approximately 214 days (June 1 to Dec 31)
    expect(metrics.daysRemaining).toBeGreaterThan(200);
    expect(metrics.daysRemaining).toBeLessThan(250);
  });

  it('should calculate run rates correctly', () => {
    const goal = {
      ...baseGoal,
      startingValue: 0,
      currentValue: 50,
      targetValue: 100,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const metrics = calculateGoalMetrics(goal);
    
    // Current run rate: 50 / ~150 days = ~0.33/day
    expect(metrics.currentRunRate).toBeGreaterThan(0);
    expect(metrics.requiredRunRate).toBeGreaterThan(0);
  });

  it('should determine on-track status correctly', () => {
    // On track case
    const onTrackGoal = {
      ...baseGoal,
      startingValue: 0,
      currentValue: 80,
      targetValue: 100,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const onTrackMetrics = calculateGoalMetrics(onTrackGoal);
    expect(onTrackMetrics.onTrack).toBe(true);

    // Behind case
    const behindGoal = {
      ...baseGoal,
      startingValue: 0,
      currentValue: 10,
      targetValue: 100,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const behindMetrics = calculateGoalMetrics(behindGoal);
    expect(behindMetrics.onTrack).toBe(false);
  });

  it('should handle null values safely', () => {
    const goal = {
      ...baseGoal,
      startingValue: null as any,
      currentValue: null as any,
      targetValue: null as any,
    };
    
    expect(() => calculateGoalMetrics(goal)).not.toThrow();
    const metrics = calculateGoalMetrics(goal);
    expect(metrics.progress).toBe('0.0');
  });

  it('should handle zero total (target equals starting)', () => {
    const goal = { ...baseGoal, startingValue: 100, currentValue: 100, targetValue: 100 };
    const metrics = calculateGoalMetrics(goal);
    
    expect(metrics.progress).toBe('0.0');
    expect(metrics.remaining).toBe(0);
  });

  it('should handle negative days remaining (past due)', () => {
    const goal = { ...baseGoal, targetDate: '2025-01-01' };
    const metrics = calculateGoalMetrics(goal);
    
    expect(metrics.daysRemaining).toBeLessThan(0);
  });
});

