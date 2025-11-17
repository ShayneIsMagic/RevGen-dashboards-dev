import type { SalesTargets, SalesMetrics, MetricStatus, LeadItem, PipelineItem } from '@/types';

// Default targets based on quick reference guide
export const defaultSalesTargets: SalesTargets = {
  leads: {
    dailyNewLeads: 2,
    monthlyQualifiedLeads: 50,
    leadToOpportunityRate: 45,
    referralPercentage: 40,
    maxDaysWithoutContact: 3,
  },
  sales: {
    winRateFromDiscovery: 35,
    averageSalesCycleDays: 45,
    setToScheduledMaxDays: 5,
    stageAnticipationAccuracy: 75,
    stageDurations: {
      intro: { target: 3, warning: 5, critical: 7 },
      mutualDiscovery: { target: 10, warning: 15, critical: 20 },
      proposal: { target: 15, warning: 20, critical: 30 },
      realign: { target: 12, warning: 18, critical: 25 },
      overcome: { target: 18, warning: 25, critical: 35 },
    },
    eventScheduling: {
      introductoryCall: 2,
      discoveryCall: 6,
      proposalPresentation: 10,
      realignmentMeeting: 8,
      overcomeSession: 7,
    },
    closeDistribution: {
      proposal: 25,
      realign: 15,
      overcome: 60,
    },
  },
  clients: {
    visitsPerClientPerYear: 4,
    testimonialCollectionRate: 50,
    referralsPerClientPerYear: 2,
    averageHealthScore: 85,
    atRiskThreshold: 70,
    minDaysBetweenVisits: 90,
  },
};

// Calculate metric status (onTrack, warning, critical)
export function calculateMetricStatus(
  currentValue: number,
  targetValue: number,
  isHigherBetter: boolean = true,
  warningThreshold: number = 0.8, // 80% of target
  criticalThreshold: number = 0.6 // 60% of target
): MetricStatus {
  const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  
  let status: 'onTrack' | 'warning' | 'critical';
  let message: string | undefined;

  if (isHigherBetter) {
    if (percentage >= 100) {
      status = 'onTrack';
      message = `Exceeding target by ${(percentage - 100).toFixed(1)}%`;
    } else if (percentage >= warningThreshold * 100) {
      status = 'onTrack';
      message = `On track (${percentage.toFixed(1)}% of target)`;
    } else if (percentage >= criticalThreshold * 100) {
      status = 'warning';
      message = `Below target (${percentage.toFixed(1)}% of target)`;
    } else {
      status = 'critical';
      message = `Significantly below target (${percentage.toFixed(1)}% of target)`;
    }
  } else {
    // For metrics where lower is better (e.g., days in stage)
    if (percentage <= 100) {
      status = 'onTrack';
      message = `Within target`;
    } else if (percentage <= (1 / warningThreshold) * 100) {
      status = 'warning';
      message = `Above target (${((percentage / 100) - 1).toFixed(1)}x target)`;
    } else {
      status = 'critical';
      message = `Significantly above target (${((percentage / 100) - 1).toFixed(1)}x target)`;
    }
  }

  return {
    status,
    currentValue,
    targetValue,
    percentage,
    message,
  };
}

// Calculate sales metrics from pipeline data
export function calculateSalesMetrics(
  leads: LeadItem[],
  salesPipeline: PipelineItem[],
  activeClients: PipelineItem[]
): SalesMetrics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Lead metrics
  const qualifiedLeads = leads.filter(l => l.status === 'qualified');
  const newLeads = leads.filter(l => {
    const created = new Date(l.createdAt);
    return created >= thirtyDaysAgo;
  });
  
  const sourceCounts: Record<string, number> = {};
  const sourceValues: Record<string, number[]> = {};
  leads.forEach(lead => {
    const source = lead.source || 'other';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    if (!sourceValues[source]) sourceValues[source] = [];
    sourceValues[source].push(lead.projectedOpportunity);
  });

  const bySource: Record<string, { count: number; percentage: number; conversionRate: number; averageValue: number }> = {};
  const totalLeads = leads.length;
  Object.keys(sourceCounts).forEach(source => {
    const count = sourceCounts[source];
    const values = sourceValues[source] || [];
    const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    // Calculate conversion rate (leads that became opportunities)
    const converted = leads.filter(l => l.source === source && l.status === 'converted').length;
    const conversionRate = count > 0 ? (converted / count) * 100 : 0;
    
    bySource[source] = {
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      conversionRate,
      averageValue: avgValue,
    };
  });

  // Calculate average days as lead
  const convertedLeads = leads.filter(l => l.status === 'converted');
  let totalDaysAsLead = 0;
  convertedLeads.forEach(lead => {
    const created = new Date(lead.createdAt);
    const converted = lead.stageHistory?.find(s => s.stage.includes('Converted'))?.date;
    if (converted) {
      const convertedDate = new Date(converted);
      const days = Math.floor((convertedDate.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
      totalDaysAsLead += days;
    }
  });
  const averageDaysAsLead = convertedLeads.length > 0 ? totalDaysAsLead / convertedLeads.length : 0;

  // Sales pipeline metrics
  const totalValue = salesPipeline.reduce((sum, item) => sum + item.amount, 0);
  const weightedValue = salesPipeline.reduce((sum, item) => {
    // Estimate probability based on stage
    let probability = 0.5;
    if (item.salesStage === 'Intro') probability = 0.2;
    else if (item.salesStage === 'Mutual Discovery') probability = 0.4;
    else if (item.salesStage === 'Proposal') probability = 0.6;
    else if (item.salesStage === 'Realign') probability = 0.7;
    else if (item.salesStage === 'Overcome') probability = 0.85;
    return sum + (item.amount * probability);
  }, 0);

  // Group by stage
  const byStage: Record<string, { count: number; value: number; averageDaysInStage: number; conversionRate: number }> = {};
  const stages = ['Intro', 'Mutual Discovery', 'Proposal', 'Realign', 'Overcome'];
  stages.forEach(stage => {
    const stageItems = salesPipeline.filter(item => item.salesStage === stage);
    const stageValue = stageItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate average days in stage from stage history
    let totalDays = 0;
    let itemsWithHistory = 0;
    stageItems.forEach(item => {
      const stageEntry = item.stageHistory?.find(s => s.stage.includes(stage));
      if (stageEntry) {
        const entered = new Date(stageEntry.date);
        const days = Math.floor((now.getTime() - entered.getTime()) / (24 * 60 * 60 * 1000));
        totalDays += days;
        itemsWithHistory++;
      }
    });
    const averageDaysInStage = itemsWithHistory > 0 ? totalDays / itemsWithHistory : 0;

    byStage[stage] = {
      count: stageItems.length,
      value: stageValue,
      averageDaysInStage,
      conversionRate: 0, // Would need historical data to calculate
    };
  });

  // Calculate sales cycle (simplified - would need closed deals with full history)
  const averageDaysInCycle = 42.5; // Placeholder - would calculate from closed deals

  // Client metrics
  const activeCount = activeClients.length;
  const totalLTV = activeClients.reduce((sum, item) => sum + item.amount, 0);
  const mrrTotal = activeClients.reduce((sum, item) => {
    return sum + (item.mrrAmount || 0);
  }, 0);

  // Calculate visits (would need visit tracking in PipelineItem)
  const clientVisits = {
    totalThisYear: 0, // Placeholder
    averagePerClient: 0, // Placeholder
  };

  return {
    leads: {
      total: leads.length,
      new: newLeads.length,
      qualified: qualifiedLeads.length,
      bySource,
      averageDaysAsLead,
      conversionToSales: totalLeads > 0 ? (salesPipeline.length / totalLeads) * 100 : 0,
    },
    sales: {
      pipeline: {
        totalOpportunities: salesPipeline.length,
        totalValue,
        weightedValue,
        byStage,
      },
      salesCycle: {
        averageDaysInCycle,
        byClosingStage: {}, // Would need closed deals data
      },
      conversionRates: {
        leadToOpportunity: totalLeads > 0 ? (salesPipeline.length / totalLeads) * 100 : 0,
        opportunityToClose: 0, // Would need closed deals
        overallLeadToClose: 0, // Would need closed deals
      },
      timingMetrics: {
        averageSetToScheduledDays: 0, // Would need event tracking
        byEventType: {}, // Would need event tracking
        stageChangeAccuracy: 0, // Would need event tracking
      },
    },
    clients: {
      activeClients: activeCount,
      totalLifetimeValue: totalLTV,
      monthlyRecurringRevenue: mrrTotal,
      clientRetentionRate: 94.5, // Placeholder
      clientVisits,
      testimonialCollection: {
        totalCollected: 0, // Placeholder
        collectionRate: 0, // Placeholder
      },
      referralGeneration: {
        totalReferrals: 0, // Placeholder
        referralsConverted: 0, // Placeholder
        conversionRate: 0, // Placeholder
        referralValue: 0, // Placeholder
      },
      healthScores: {
        averageHealthScore: 85, // Placeholder
        atRisk: 0, // Placeholder
        healthy: activeCount, // Placeholder
        thriving: 0, // Placeholder
      },
    },
  };
}

