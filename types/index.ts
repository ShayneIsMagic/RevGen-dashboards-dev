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
  prospect: string; // Client name for Active Clients
  proposedProject: string; // Project name
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
  taskWizeLink?: string; // Link to TaskWize project (Active Clients)
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

export interface GovContractItem {
  id: number;
  opportunityNumber: string; // e.g., "#16"
  title: string;
  agency: string; // Department/Agency name
  opportunityType: 'Federal' | 'State' | 'Local' | 'Emergency';
  portalUrl?: string; // Portal/source URL
  solicitationNumber?: string; // Solicitation/RFP number
  status: 'new' | 'registered' | 'reviewing' | 'preparing' | 'submitted' | 'awarded' | 'declined' | 'lost';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  capabilityMatch: number; // Percentage 0-100
  estimatedValue: number; // Contract value
  estimatedValueMax?: number; // Max contract value (range)
  dueDate?: string; // Proposal due date
  releaseDate?: string; // When opportunity was released
  prebidDate?: string; // Pre-bid conference date
  prebidLocation?: string; // Virtual link or physical location
  qaDeadline?: string; // Questions deadline
  naicsCode?: string; // NAICS code
  setState?: string; // For state contracts
  actionItems?: Array<{
    id: number;
    description: string;
    dueDate?: string;
    completed: boolean;
    completedDate?: string;
  }>;
  registrationRequired: boolean;
  registrationStatus?: 'not_started' | 'in_progress' | 'completed';
  portalRegistrationUrl?: string;
  documents?: Array<{
    id: number;
    name: string;
    url?: string;
    downloadedDate?: string;
  }>;
  teamingRequired: boolean;
  teamingPartners?: string[]; // List of potential partners
  technicalRequirements?: string; // Key technical requirements
  certifications?: string[]; // Required certifications
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  submittedDate?: string;
  awardDate?: string;
  interactions?: Array<{
    type: 'email' | 'phone' | 'meeting' | 'site_visit' | 'portal';
    date: string;
    notes: string;
    contactPerson?: string;
  }>;
}

export type GovContractType = 'all' | 'active' | 'submitted' | 'awarded' | 'declined';

export interface GoalMetrics {
  progress: string;
  remaining: number;
  daysRemaining: number;
  currentRunRate: number;
  requiredRunRate: number;
  onTrack: boolean;
}

