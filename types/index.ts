export interface Goal {
  id: number;
  name: string;
  category: 'Revenue' | 'MRR' | 'Cash Flow' | 'Custom';
  startingValue: number;
  currentValue: number;
  targetValue: number;
  targetDate: string;
  unit: string;
  createdAt: string;
}

export interface PipelineItem {
  id: number;
  prospect: string;
  proposedProject: string;
  amount: number;
  salesStage?: string;
  nextStep: string;
  nextStepDate?: string;
  notes?: string;
  createdAt: string;
  lostDate?: string;
  endDate?: string;
  startDate?: string;
  paymentType?: 'MRR' | 'Project' | 'Hybrid'; // MRR, Project (one-time), or Hybrid
  mrrAmount?: number; // If MRR or Hybrid, the monthly amount
}

export interface LeadItem {
  id: number;
  prospect: string;
  company?: string;
  source: string; // Where the lead came from
  projectedOpportunity: number;
  interactions: Array<{
    type: 'text' | 'phone' | 'email' | 'in-person';
    date: string;
    notes: string;
  }>;
  notes: {
    solution?: string;
    budget?: string;
    people?: string;
    timing?: string;
    general?: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
}

export type PipelineType = 'leads' | 'sales' | 'active' | 'lost' | 'former';

export interface GoalMetrics {
  progress: string;
  remaining: number;
  daysRemaining: number;
  currentRunRate: number;
  requiredRunRate: number;
  onTrack: boolean;
}

