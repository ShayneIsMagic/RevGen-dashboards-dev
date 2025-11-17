import type { DeveloperMetrics, PipelineItem } from '@/types';

// Calculate developer metrics from project and time tracking data
export function calculateDeveloperMetrics(
  activeClients: PipelineItem[],
  developerData?: DeveloperMetrics
): DeveloperMetrics {
  // If we have developer data, use it; otherwise calculate from active clients
  if (developerData) {
    return developerData;
  }

  // Calculate from active clients (projects)
  const projects = activeClients.map((client, index) => {
    const projectId = `PROJ${String(index + 1).padStart(3, '0')}`;
    const billableHours = 0; // Would come from time tracking
    const nonBillableHours = 0; // Would come from time tracking

    return {
      projectId,
      projectName: client.proposedProject,
      client: client.prospect,
      pointOfContact: {
        name: client.prospect,
        email: '',
        phone: '',
      },
      projectType: 'unique' as const,
      pricingModel: client.paymentType === 'MRR' ? 'hourly' as const : 'project-based' as const,
      dateRange: {
        start: client.startDate || client.createdAt,
        end: client.endDate || '',
        estimatedLaunch: '',
        actualLaunch: client.endDate || null,
      },
      timeTracking: {
        totalHours: billableHours + nonBillableHours,
        billableHours,
        nonBillableHours,
        byMonth: {},
        bySprint: {},
      },
      tasks: {
        total: 0,
        completed: 0,
        byStage: {},
      },
      activity: {
        planning: {
          clientMeetings: 0,
          deadlines: 0,
          taskCount: 0,
        },
        design: {
          hours: 0,
          assignments: [],
        },
        devQA: {
          hours: 0,
          assignments: [],
          testCoverage: 0,
        },
        deployment: {
          softLaunch: null,
          fullLaunch: client.endDate || null,
          hotfixes: 0,
        },
      },
      burnUpChart: [],
      estimatedVsActual: {
        estimatedHours: 0,
        actualHours: 0,
        variance: 0,
        variancePercentage: 0,
      },
    };
  });

  return {
    developers: [],
    projects,
  };
}

// Calculate developer productivity metrics
export function calculateDeveloperProductivity(developerMetrics: DeveloperMetrics) {
  const totalBillableHours = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.timeTracked.billableHours;
  }, 0);

  const totalNonBillableHours = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.timeTracked.nonBillableHours;
  }, 0);

  const totalHours = totalBillableHours + totalNonBillableHours;
  const billableUtilization = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;

  const totalTasksCompleted = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.tasks.completed;
  }, 0);

  const averageVelocity = developerMetrics.developers.length > 0
    ? developerMetrics.developers.reduce((sum, dev) => {
        return sum + dev.individualDashboard.currentPeriod.velocity.average;
      }, 0) / developerMetrics.developers.length
    : 0;

  const totalProjectsCompleted = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.results.projectsCompleted;
  }, 0);

  return {
    totalBillableHours,
    totalNonBillableHours,
    totalHours,
    billableUtilization,
    totalTasksCompleted,
    averageVelocity,
    totalProjectsCompleted,
    developerCount: developerMetrics.developers.length,
  };
}

// Connect developer metrics to sales metrics
export function connectDeveloperToSales(
  developerMetrics: DeveloperMetrics,
  activeClients: PipelineItem[]
) {
  // Calculate revenue from billable hours
  // Assuming average hourly rate (would come from QuickBooks or config)
  const averageHourlyRate = 150; // Default, should be configurable
  const totalBillableHours = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.timeTracked.billableHours;
  }, 0);
  const estimatedRevenue = totalBillableHours * averageHourlyRate;

  // Calculate projects completed (potential referral sources)
  const projectsCompleted = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.results.projectsCompleted;
  }, 0);

  // Calculate client satisfaction (from developer results)
  const averageSatisfaction = developerMetrics.developers.length > 0
    ? developerMetrics.developers.reduce((sum, dev) => {
        return sum + dev.individualDashboard.currentPeriod.results.satisfactionScore;
      }, 0) / developerMetrics.developers.length
    : 0;

  // Calculate delivery efficiency (estimated vs actual)
  const totalEstimatedHours = developerMetrics.projects.reduce((sum, proj) => {
    return sum + proj.estimatedVsActual.estimatedHours;
  }, 0);
  const totalActualHours = developerMetrics.projects.reduce((sum, proj) => {
    return sum + proj.estimatedVsActual.actualHours;
  }, 0);
  const deliveryEfficiency = totalEstimatedHours > 0
    ? (totalEstimatedHours / totalActualHours) * 100
    : 100;

  // Calculate on-time delivery rate
  const onTimeProjects = developerMetrics.projects.filter(proj => {
    if (!proj.dateRange.actualLaunch || !proj.dateRange.estimatedLaunch) return false;
    const actual = new Date(proj.dateRange.actualLaunch);
    const estimated = new Date(proj.dateRange.estimatedLaunch);
    return actual <= estimated;
  }).length;
  const onTimeDeliveryRate = developerMetrics.projects.length > 0
    ? (onTimeProjects / developerMetrics.projects.length) * 100
    : 0;

  // Calculate quality metrics (kickback ratio)
  const totalKickbacks = developerMetrics.developers.reduce((sum, dev) => {
    return sum + dev.individualDashboard.currentPeriod.skillGrowth.kickbackRatio;
  }, 0);
  const averageKickbackRatio = developerMetrics.developers.length > 0
    ? totalKickbacks / developerMetrics.developers.length
    : 0;

  return {
    estimatedRevenue,
    projectsCompleted,
    averageSatisfaction,
    deliveryEfficiency,
    onTimeDeliveryRate,
    averageKickbackRatio,
    // Connection to referrals: High satisfaction + on-time delivery = more referrals
    referralPotential: (averageSatisfaction / 5) * (onTimeDeliveryRate / 100) * 100,
    // Connection to revenue: Billable hours directly impact revenue
    revenuePerHour: averageHourlyRate,
    totalBillableHours,
  };
}

