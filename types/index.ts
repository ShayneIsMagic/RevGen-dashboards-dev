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

export interface ActionItem {
  id: number;
  description: string;
  dueDate?: string;
  completed: boolean;
  completedDate?: string;
  assignedTo?: string;
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
  // Meeting & Action Items
  defaultMeetingLink?: string; // Zoom/Google Meet link for this deal/client
  actionItems?: ActionItem[]; // General action items for this deal/client
  interactions?: Array<{
    type: 'text' | 'phone' | 'email' | 'in-person' | 'video';
    date: string;
    notes: string;
    meetingLink?: string; // Override default meeting link for this interaction
    actionItems?: ActionItem[]; // Action items from this specific interaction
  }>;
}

export interface LeadItem {
  id: number;
  prospect: string;
  company?: string;
  source: string; // Where the lead came from
  projectedOpportunity: number;
  defaultMeetingLink?: string; // Zoom/Google Meet link for this lead
  actionItems?: ActionItem[]; // General action items for this lead
  interactions: Array<{
    type: 'text' | 'phone' | 'email' | 'in-person' | 'video';
    date: string;
    notes: string;
    meetingLink?: string; // Override default meeting link for this interaction
    actionItems?: ActionItem[]; // Action items from this specific interaction
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

