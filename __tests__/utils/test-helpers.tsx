import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import type { Goal, PipelineItem } from '@/types';

// Test data factories
export const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
  id: Date.now(),
  name: 'Test Goal',
  category: 'Revenue',
  startingValue: 0,
  currentValue: 50,
  targetValue: 100,
  targetDate: '2025-12-31',
  unit: '$',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockPipelineItem = (overrides?: Partial<PipelineItem>): PipelineItem => ({
  id: Date.now(),
  prospect: 'Test Company',
  proposedProject: 'Test Project',
  amount: 10000,
  salesStage: 'Proposal',
  nextStep: 'Follow up',
  nextStepDate: '2025-11-15',
  notes: 'Test notes',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

