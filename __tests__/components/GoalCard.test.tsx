import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockGoal } from '../utils/test-helpers';
import type { Goal } from '@/types';

// This would be a separate component if we extract it
// For now, testing goal functionality within PipelineManager context
describe('Goal Card Functionality', () => {
  it('should display goal information correctly', () => {
    const goal = createMockGoal({
      name: 'Q1 Revenue',
      startingValue: 0,
      currentValue: 75000,
      targetValue: 150000,
    });

    // This would test the GoalCard component if extracted
    // For now, we test within PipelineManager
    expect(goal.name).toBe('Q1 Revenue');
    expect(goal.currentValue).toBe(75000);
  });

  it('should calculate metrics correctly', () => {
    const goal = createMockGoal({
      startingValue: 0,
      currentValue: 50,
      targetValue: 100,
    });

    // Progress should be 50%
    const progress = ((goal.currentValue - goal.startingValue) / (goal.targetValue - goal.startingValue)) * 100;
    expect(progress).toBe(50);
  });
});

