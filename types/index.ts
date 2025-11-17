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

export interface StageHistoryEntry {
  id: number;
  stage: string;
  date: string;
  notes?: string;
  nextStep?: string;
  nextStepDate?: string;
  actor?: string;
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
  stageHistory?: StageHistoryEntry[];
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
  stageHistory?: StageHistoryEntry[];
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

// Sales & Marketing Metrics Types
export interface SalesTargets {
  // Lead Targets
  leads: {
    dailyNewLeads: number; // Target: 2+ per day
    monthlyQualifiedLeads: number; // Target: 50+
    leadToOpportunityRate: number; // Target: 45%
    referralPercentage: number; // Target: 35-40%
    maxDaysWithoutContact: number; // Alert if >3 days
  };
  // Sales Pipeline Targets
  sales: {
    winRateFromDiscovery: number; // Target: 35%+
    averageSalesCycleDays: number; // Target: <45 days
    setToScheduledMaxDays: number; // Target: <5 days for all events
    stageAnticipationAccuracy: number; // Target: >75%
    // Stage duration targets (days)
    stageDurations: {
      intro: { target: number; warning: number; critical: number }; // 2-3, >5, >7
      mutualDiscovery: { target: number; warning: number; critical: number }; // 7-10, >15, >20
      proposal: { target: number; warning: number; critical: number }; // 10-15, >20, >30
      realign: { target: number; warning: number; critical: number }; // 8-12, >18, >25
      overcome: { target: number; warning: number; critical: number }; // 12-18, >25, >35
    };
    // Event scheduling targets (days)
    eventScheduling: {
      introductoryCall: number; // 1-2 days
      discoveryCall: number; // 4-6 days
      proposalPresentation: number; // 7-10 days
      realignmentMeeting: number; // 5-8 days
      overcomeSession: number; // 5-7 days
    };
    // Close distribution targets (%)
    closeDistribution: {
      proposal: number; // 25%
      realign: number; // 15%
      overcome: number; // 60%
    };
  };
  // Client Engagement Targets
  clients: {
    visitsPerClientPerYear: number; // Target: 4+
    testimonialCollectionRate: number; // Target: 50%
    referralsPerClientPerYear: number; // Target: 2+
    averageHealthScore: number; // Target: >85
    atRiskThreshold: number; // Alert if <70
    minDaysBetweenVisits: number; // Alert if >90 days
  };
}

export interface MetricStatus {
  status: 'onTrack' | 'warning' | 'critical';
  currentValue: number;
  targetValue: number;
  percentage: number;
  message?: string;
}

export interface SalesMetrics {
  leads: {
    total: number;
    new: number;
    qualified: number;
    bySource: Record<string, { count: number; percentage: number; conversionRate: number; averageValue: number }>;
    averageDaysAsLead: number;
    conversionToSales: number;
  };
  sales: {
    pipeline: {
      totalOpportunities: number;
      totalValue: number;
      weightedValue: number;
      byStage: Record<string, {
        count: number;
        value: number;
        averageDaysInStage: number;
        conversionRate: number;
      }>;
    };
    salesCycle: {
      averageDaysInCycle: number;
      byClosingStage: Record<string, number>;
    };
    conversionRates: {
      leadToOpportunity: number;
      opportunityToClose: number;
      overallLeadToClose: number;
    };
    timingMetrics: {
      averageSetToScheduledDays: number;
      byEventType: Record<string, number>;
      stageChangeAccuracy: number;
    };
  };
  clients: {
    activeClients: number;
    totalLifetimeValue: number;
    monthlyRecurringRevenue: number;
    clientRetentionRate: number;
    clientVisits: {
      totalThisYear: number;
      averagePerClient: number;
    };
    testimonialCollection: {
      totalCollected: number;
      collectionRate: number;
    };
    referralGeneration: {
      totalReferrals: number;
      referralsConverted: number;
      conversionRate: number;
      referralValue: number;
    };
    healthScores: {
      averageHealthScore: number;
      atRisk: number;
      healthy: number;
      thriving: number;
    };
  };
}

// Developer Tracking Types
export interface DeveloperMetrics {
  developers: Array<{
    developerId: string;
    name: string;
    role: string;
    status: 'active' | 'inactive';
    mvpStatus: boolean;
    individualDashboard: {
      currentPeriod: {
        dateRange: { start: string; end: string };
        timeTracked: {
          totalHours: number;
          billableHours: number;
          nonBillableHours: number;
        };
        tasks: {
          total: number;
          completed: number;
          byStage: Record<string, number>;
        };
        velocity: {
          total: number;
          average: number;
          trend: 'increasing' | 'decreasing' | 'stable';
        };
        productivity: {
          score: number;
          percentChange: number;
          tasksPerDay: number;
          hoursPerTask: number;
        };
        skillGrowth: {
          score: number;
          kickbackRatio: number;
          averageQATime: number;
        };
        results: {
          projectsCompleted: number;
          featuresShipped: number;
          satisfactionScore: number;
        };
      };
      projects: Array<{
        projectId: string;
        projectName: string;
        timeTracked: {
          billableHours: number;
          nonBillableHours: number;
        };
        tasks: Array<{
          taskId: string;
          taskName: string;
          stages: Array<{
            stageName: string;
            timeInStage: number;
            trackedTime: number;
            untrackedTime: number;
            workedBy: string[];
            startedDate: string;
            kickbacks: number;
          }>;
        }>;
      }>;
      oneOnOnes: {
        lastMeeting: string | null;
        nextMeeting: string | null;
        frequency: string;
        totalMeetings: number;
      };
      github: {
        commits: number;
        merges: number;
        pullRequests: number;
      };
    };
  }>;
  projects: Array<{
    projectId: string;
    projectName: string;
    client: string;
    pointOfContact: {
      name: string;
      email: string;
      phone: string;
    };
    projectType: 'unique' | 'repetitive';
    pricingModel: 'hourly' | 'project-based';
    dateRange: {
      start: string;
      end: string;
      estimatedLaunch: string;
      actualLaunch: string | null;
    };
    timeTracking: {
      totalHours: number;
      billableHours: number;
      nonBillableHours: number;
      byMonth: Record<string, { billable: number; nonBillable: number }>;
      bySprint: Record<string, { billable: number; nonBillable: number }>;
    };
    tasks: {
      total: number;
      completed: number;
      byStage: Record<string, number>;
    };
    activity: {
      planning: {
        clientMeetings: number;
        deadlines: number;
        taskCount: number;
      };
      design: {
        hours: number;
        assignments: string[];
      };
      devQA: {
        hours: number;
        assignments: string[];
        testCoverage: number;
      };
      deployment: {
        softLaunch: string | null;
        fullLaunch: string | null;
        hotfixes: number;
      };
    };
    burnUpChart: Array<{
      phase: string;
      estimatedHours: number;
      actualHours: number;
      startDate: string;
      endDate: string;
      progress: number;
    }>;
    estimatedVsActual: {
      estimatedHours: number;
      actualHours: number;
      variance: number;
      variancePercentage: number;
    };
  }>;
}

export interface DashboardConfig {
  lastUpdated: string;
  salesMethodology: 'IMPROV';
  dataSource: {
    crm: boolean;
    calendar: boolean;
    emailMarketing: boolean;
    testimonialPlatform: boolean;
    taskwize?: boolean;
    github?: boolean;
    googleCalendar?: boolean;
    quickbooks?: boolean;
  };
  targets?: SalesTargets;
}

