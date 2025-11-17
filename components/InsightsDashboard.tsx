'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { defaultSalesTargets, calculateMetricStatus, calculateSalesMetrics } from '@/lib/salesMetrics';
import { calculateDeveloperMetrics, connectDeveloperToSales } from '@/lib/developerMetrics';
import type { SalesTargets, SalesMetrics, MetricStatus, LeadItem, PipelineItem, DeveloperMetrics } from '@/types';
import Link from 'next/link';

export default function InsightsDashboard() {
  const [targets, setTargets] = useState<SalesTargets>(defaultSalesTargets);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [salesPipeline, setSalesPipeline] = useState<PipelineItem[]>([]);
  const [activeClients, setActiveClients] = useState<PipelineItem[]>([]);
  const [developerMetrics, setDeveloperMetrics] = useState<DeveloperMetrics | null>(null);
  const [salesConnection, setSalesConnection] = useState<ReturnType<typeof connectDeveloperToSales> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load targets
      const savedTargets = await storage.getSalesTargets();
      if (savedTargets) {
        setTargets(savedTargets);
      }

      // Load pipeline data to calculate metrics
      const [leadsData, salesData, activeData, devData] = await Promise.all([
        storage.getLeadsPipeline(),
        storage.getSalesPipeline(),
        storage.getActiveClients(),
        storage.getDeveloperMetrics(),
      ]);

      setLeads(leadsData);
      setSalesPipeline(salesData);
      setActiveClients(activeData);

      // Calculate metrics
      const calculatedMetrics = calculateSalesMetrics(leadsData, salesData, activeData);
      setMetrics(calculatedMetrics);

      // Calculate developer metrics
      const calculatedDevMetrics = calculateDeveloperMetrics(activeData, devData || undefined);
      setDeveloperMetrics(calculatedDevMetrics);

      // Connect developer metrics to sales
      const connection = connectDeveloperToSales(calculatedDevMetrics, activeData);
      setSalesConnection(connection);
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTargets = async (updatedTargets: SalesTargets) => {
    try {
      await storage.saveSalesTargets(updatedTargets);
      setTargets(updatedTargets);
      setEditingTarget(null);
    } catch (error) {
      console.error('Error saving targets:', error);
      alert('Error saving targets. Please try again.');
    }
  };

  const updateTarget = (path: string, value: number) => {
    const newTargets = { ...targets };
    const keys = path.split('.');
    let current: any = newTargets;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setTargets(newTargets);
  };

  const getStatusColor = (status: 'onTrack' | 'warning' | 'critical') => {
    switch (status) {
      case 'onTrack':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: 'onTrack' | 'warning' | 'critical') => {
    switch (status) {
      case 'onTrack':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading insights...</div>
        </div>
      </div>
    );
  }

  // Calculate metric statuses
  const leadMetrics: Record<string, MetricStatus> = metrics ? {
    dailyNewLeads: calculateMetricStatus(
      metrics.leads.new / 30, // Approximate daily
      targets.leads.dailyNewLeads,
      true
    ),
    monthlyQualifiedLeads: calculateMetricStatus(
      metrics.leads.qualified,
      targets.leads.monthlyQualifiedLeads,
      true
    ),
    leadToOpportunityRate: calculateMetricStatus(
      metrics.leads.conversionToSales,
      targets.leads.leadToOpportunityRate,
      true
    ),
    referralPercentage: calculateMetricStatus(
      metrics.leads.bySource['referral']?.percentage || 0,
      targets.leads.referralPercentage,
      true
    ),
  } : {};

  const salesMetrics: Record<string, MetricStatus> = metrics ? {
    winRateFromDiscovery: calculateMetricStatus(
      metrics.sales.conversionRates.opportunityToClose,
      targets.sales.winRateFromDiscovery,
      true
    ),
    averageSalesCycleDays: calculateMetricStatus(
      metrics.sales.salesCycle.averageDaysInCycle,
      targets.sales.averageSalesCycleDays,
      false // Lower is better
    ),
  } : {};

  const clientMetrics: Record<string, MetricStatus> = metrics ? {
    visitsPerClientPerYear: calculateMetricStatus(
      metrics.clients.clientVisits.averagePerClient,
      targets.clients.visitsPerClientPerYear,
      true
    ),
    testimonialCollectionRate: calculateMetricStatus(
      metrics.clients.testimonialCollection.collectionRate,
      targets.clients.testimonialCollectionRate,
      true
    ),
    averageHealthScore: calculateMetricStatus(
      metrics.clients.healthScores.averageHealthScore,
      targets.clients.averageHealthScore,
      true
    ),
  } : {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insights Dashboard</h1>
            <p className="text-gray-600 mt-1">Track performance against targets and goals</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              ← Pipeline
            </Link>
            <Link
              href="/contracts"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Gov Contracts
            </Link>
            <Link
              href="/financial"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Financial
            </Link>
            <Link
              href="/developers"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              👥 Developers
            </Link>
          </div>
        </div>

        {/* Targets Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Targets & Goals</h2>
            <button
              onClick={() => {
                if (editingTarget) {
                  saveTargets(targets);
                } else {
                  setEditingTarget('all');
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {editingTarget ? 'Save All Targets' : 'Edit Targets'}
            </button>
          </div>

          {/* Lead Targets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TargetInput
                label="Daily New Leads"
                value={targets.leads.dailyNewLeads}
                onChange={(v) => updateTarget('leads.dailyNewLeads', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Monthly Qualified Leads"
                value={targets.leads.monthlyQualifiedLeads}
                onChange={(v) => updateTarget('leads.monthlyQualifiedLeads', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Lead to Opportunity Rate (%)"
                value={targets.leads.leadToOpportunityRate}
                onChange={(v) => updateTarget('leads.leadToOpportunityRate', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Referral Percentage (%)"
                value={targets.leads.referralPercentage}
                onChange={(v) => updateTarget('leads.referralPercentage', v)}
                editing={editingTarget !== null}
              />
            </div>
          </div>

          {/* Sales Targets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sales Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TargetInput
                label="Win Rate from Discovery (%)"
                value={targets.sales.winRateFromDiscovery}
                onChange={(v) => updateTarget('sales.winRateFromDiscovery', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Average Sales Cycle (days)"
                value={targets.sales.averageSalesCycleDays}
                onChange={(v) => updateTarget('sales.averageSalesCycleDays', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Set to Scheduled Max Days"
                value={targets.sales.setToScheduledMaxDays}
                onChange={(v) => updateTarget('sales.setToScheduledMaxDays', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Stage Anticipation Accuracy (%)"
                value={targets.sales.stageAnticipationAccuracy}
                onChange={(v) => updateTarget('sales.stageAnticipationAccuracy', v)}
                editing={editingTarget !== null}
              />
            </div>
          </div>

          {/* Client Targets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Client Engagement Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TargetInput
                label="Visits per Client per Year"
                value={targets.clients.visitsPerClientPerYear}
                onChange={(v) => updateTarget('clients.visitsPerClientPerYear', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Testimonial Collection Rate (%)"
                value={targets.clients.testimonialCollectionRate}
                onChange={(v) => updateTarget('clients.testimonialCollectionRate', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Referrals per Client per Year"
                value={targets.clients.referralsPerClientPerYear}
                onChange={(v) => updateTarget('clients.referralsPerClientPerYear', v)}
                editing={editingTarget !== null}
              />
              <TargetInput
                label="Average Health Score"
                value={targets.clients.averageHealthScore}
                onChange={(v) => updateTarget('clients.averageHealthScore', v)}
                editing={editingTarget !== null}
              />
            </div>
          </div>
        </div>

        {/* Metrics Status */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lead Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Metrics</h3>
              <div className="space-y-3">
                {Object.entries(leadMetrics).map(([key, status]) => (
                  <MetricCard key={key} label={key} status={status} />
                ))}
              </div>
            </div>

            {/* Sales Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Metrics</h3>
              <div className="space-y-3">
                {Object.entries(salesMetrics).map(([key, status]) => (
                  <MetricCard key={key} label={key} status={status} />
                ))}
              </div>
            </div>

            {/* Client Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Metrics</h3>
              <div className="space-y-3">
                {Object.entries(clientMetrics).map(([key, status]) => (
                  <MetricCard key={key} label={key} status={status} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Developer to Sales Connection */}
        {salesConnection && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Developer → Sales Connection</h2>
            <p className="text-gray-600 mb-4">
              How developer productivity and project delivery impact sales and revenue
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <ConnectionCard
                title="Revenue from Billable Hours"
                value={`$${(salesConnection.estimatedRevenue / 1000).toFixed(0)}k`}
                subtitle={`${salesConnection.totalBillableHours.toFixed(0)} hours × $${salesConnection.revenuePerHour}/hr`}
                impact="Direct revenue impact"
                color="green"
              />
              <ConnectionCard
                title="Referral Potential"
                value={`${salesConnection.referralPotential.toFixed(0)}%`}
                subtitle={`Satisfaction: ${salesConnection.averageSatisfaction.toFixed(1)}/5 | On-time: ${salesConnection.onTimeDeliveryRate.toFixed(0)}%`}
                impact="High satisfaction + on-time delivery = referrals"
                color="blue"
              />
              <ConnectionCard
                title="Projects Completed"
                value={salesConnection.projectsCompleted.toString()}
                subtitle="Each project is a potential referral source"
                impact="More projects = more referral opportunities"
                color="purple"
              />
              <ConnectionCard
                title="Delivery Efficiency"
                value={`${salesConnection.deliveryEfficiency.toFixed(1)}%`}
                subtitle="Estimated vs Actual hours"
                impact="Efficient delivery improves profitability"
                color="indigo"
              />
              <ConnectionCard
                title="On-Time Delivery Rate"
                value={`${salesConnection.onTimeDeliveryRate.toFixed(1)}%`}
                subtitle="Projects delivered on schedule"
                impact="On-time delivery increases client satisfaction"
                color="teal"
              />
              <ConnectionCard
                title="Quality Score"
                value={`${(100 - salesConnection.averageKickbackRatio).toFixed(0)}%`}
                subtitle={`${salesConnection.averageKickbackRatio.toFixed(1)}% kickback ratio`}
                impact="High quality reduces rework and increases satisfaction"
                color="orange"
              />
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-2">💡 Key Insights</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>
                  • <strong>Billable Hours → Revenue:</strong> {salesConnection.totalBillableHours.toFixed(0)} billable hours 
                  generate approximately ${(salesConnection.estimatedRevenue / 1000).toFixed(0)}k in revenue
                </li>
                <li>
                  • <strong>Project Completion → Referrals:</strong> {salesConnection.projectsCompleted} completed projects 
                  with {salesConnection.averageSatisfaction.toFixed(1)}/5 satisfaction create a {salesConnection.referralPotential.toFixed(0)}% referral potential
                </li>
                <li>
                  • <strong>On-Time Delivery → Client Retention:</strong> {salesConnection.onTimeDeliveryRate.toFixed(0)}% on-time delivery 
                  rate contributes to higher client satisfaction and retention
                </li>
                <li>
                  • <strong>Quality → Efficiency:</strong> {salesConnection.averageKickbackRatio.toFixed(1)}% kickback ratio 
                  means {(100 - salesConnection.averageKickbackRatio).toFixed(0)}% quality, reducing rework and improving profitability
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionCard({
  title,
  value,
  subtitle,
  impact,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  impact: string;
  color: 'green' | 'blue' | 'purple' | 'indigo' | 'teal' | 'orange';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    teal: 'bg-teal-50 border-teal-200 text-teal-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-80 mb-2">{subtitle}</p>
      <p className="text-xs italic opacity-70">{impact}</p>
    </div>
  );
}

function TargetInput({
  label,
  value,
  onChange,
  editing,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  editing: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editing ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold">{value}</div>
      )}
    </div>
  );
}

function MetricCard({ label, status }: { label: string; status: MetricStatus }) {
  const formatLabel = (l: string) => {
    return l.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor(status.status).replace('text-', 'border-').replace('bg-', '')}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{formatLabel(label)}</span>
        <span className="text-lg">{getStatusIcon(status.status)}</span>
      </div>
      <div className="text-xs text-gray-900 font-semibold">
        {status.currentValue.toFixed(1)} / {status.targetValue.toFixed(1)} ({status.percentage.toFixed(1)}%)
      </div>
      {status.message && (
        <div className="text-xs text-gray-500 mt-1">{status.message}</div>
      )}
    </div>
  );
}

function getStatusColor(status: 'onTrack' | 'warning' | 'critical') {
  switch (status) {
    case 'onTrack':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

function getStatusIcon(status: 'onTrack' | 'warning' | 'critical') {
  switch (status) {
    case 'onTrack':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '🚨';
  }
}

