'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { calculateDeveloperMetrics, calculateDeveloperProductivity, connectDeveloperToSales } from '@/lib/developerMetrics';
import type { DeveloperMetrics, PipelineItem } from '@/types';
import Link from 'next/link';

export default function DeveloperDashboard() {
  const [developerMetrics, setDeveloperMetrics] = useState<DeveloperMetrics | null>(null);
  const [activeClients, setActiveClients] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'developers' | 'projects'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devData, clientsData] = await Promise.all([
        storage.getDeveloperMetrics(),
        storage.getActiveClients(),
      ]);

      setActiveClients(clientsData);

      // Calculate or use existing developer metrics
      const calculated = calculateDeveloperMetrics(clientsData, devData || undefined);
      setDeveloperMetrics(calculated);
      
      // Save calculated metrics
      await storage.saveDeveloperMetrics(calculated);
    } catch (error) {
      console.error('Error loading developer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading developer metrics...</div>
        </div>
      </div>
    );
  }

  const productivity = developerMetrics
    ? calculateDeveloperProductivity(developerMetrics)
    : null;

  const salesConnection = developerMetrics
    ? connectDeveloperToSales(developerMetrics, activeClients)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
            <p className="text-gray-600 mt-1">Track productivity, skills, and project delivery</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              ← Pipeline
            </Link>
            <Link
              href="/insights"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              📊 Insights
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
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 font-medium ${
              selectedView === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setSelectedView('developers')}
            className={`px-4 py-2 font-medium ${
              selectedView === 'developers'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Developers ({developerMetrics?.developers.length || 0})
          </button>
          <button
            onClick={() => setSelectedView('projects')}
            className={`px-4 py-2 font-medium ${
              selectedView === 'projects'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🚀 Projects ({developerMetrics?.projects.length || 0})
          </button>
        </div>

        {/* Overview */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Productivity Metrics */}
            {productivity && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Productivity Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MetricBox
                    label="Billable Utilization"
                    value={`${productivity.billableUtilization.toFixed(1)}%`}
                    subtitle={`${productivity.totalBillableHours.toFixed(0)} / ${productivity.totalHours.toFixed(0)} hours`}
                  />
                  <MetricBox
                    label="Tasks Completed"
                    value={productivity.totalTasksCompleted.toString()}
                    subtitle={`${productivity.developerCount} developers`}
                  />
                  <MetricBox
                    label="Average Velocity"
                    value={productivity.averageVelocity.toFixed(1)}
                    subtitle="Points per sprint"
                  />
                  <MetricBox
                    label="Projects Completed"
                    value={productivity.totalProjectsCompleted.toString()}
                    subtitle="This period"
                  />
                </div>
              </div>
            )}

            {/* Sales Connection */}
            {salesConnection && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Connection to Sales & Revenue</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricBox
                    label="Estimated Revenue"
                    value={`$${(salesConnection.estimatedRevenue / 1000).toFixed(0)}k`}
                    subtitle={`${salesConnection.totalBillableHours.toFixed(0)} billable hours × $${salesConnection.revenuePerHour}/hr`}
                    highlight
                  />
                  <MetricBox
                    label="Delivery Efficiency"
                    value={`${salesConnection.deliveryEfficiency.toFixed(1)}%`}
                    subtitle="Estimated vs Actual"
                  />
                  <MetricBox
                    label="On-Time Delivery"
                    value={`${salesConnection.onTimeDeliveryRate.toFixed(1)}%`}
                    subtitle="Projects delivered on time"
                  />
                  <MetricBox
                    label="Client Satisfaction"
                    value={`${(salesConnection.averageSatisfaction * 20).toFixed(0)}%`}
                    subtitle={`${salesConnection.averageSatisfaction.toFixed(1)}/5.0 average`}
                  />
                  <MetricBox
                    label="Referral Potential"
                    value={`${salesConnection.referralPotential.toFixed(0)}%`}
                    subtitle="Based on satisfaction & delivery"
                    highlight
                  />
                  <MetricBox
                    label="Quality Score"
                    value={`${(100 - salesConnection.averageKickbackRatio).toFixed(0)}%`}
                    subtitle={`${salesConnection.averageKickbackRatio.toFixed(1)}% kickback ratio`}
                  />
                </div>
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-900">
                    <strong>💡 Insight:</strong> High satisfaction ({salesConnection.averageSatisfaction.toFixed(1)}/5) 
                    combined with on-time delivery ({salesConnection.onTimeDeliveryRate.toFixed(0)}%) 
                    creates a referral potential of {salesConnection.referralPotential.toFixed(0)}%. 
                    Each completed project is a potential referral source.
                  </p>
                </div>
              </div>
            )}

            {/* Individual Developer Summary */}
            {developerMetrics && developerMetrics.developers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Developer Summary</h2>
                <div className="space-y-3">
                  {developerMetrics.developers.map((dev) => (
                    <div key={dev.developerId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{dev.name}</h3>
                          <p className="text-sm text-gray-600">{dev.role}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Billable</p>
                            <p className="font-semibold text-gray-900">
                              {dev.individualDashboard.currentPeriod.timeTracked.billableHours.toFixed(0)}h
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tasks</p>
                            <p className="font-semibold text-gray-900">
                              {dev.individualDashboard.currentPeriod.tasks.completed}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Velocity</p>
                            <p className="font-semibold text-gray-900">
                              {dev.individualDashboard.currentPeriod.velocity.average.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Projects</p>
                            <p className="font-semibold text-gray-900">
                              {dev.individualDashboard.currentPeriod.results.projectsCompleted}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Developers View */}
        {selectedView === 'developers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Individual Developers</h2>
            {developerMetrics && developerMetrics.developers.length > 0 ? (
              <div className="space-y-6">
                {developerMetrics.developers.map((dev) => (
                  <DeveloperCard key={dev.developerId} developer={dev} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No developer data available. Import from Taskwize or add manually.</p>
              </div>
            )}
          </div>
        )}

        {/* Projects View */}
        {selectedView === 'projects' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
            {developerMetrics && developerMetrics.projects.length > 0 ? (
              <div className="space-y-4">
                {developerMetrics.projects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No project data available. Projects are calculated from active clients.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-4 ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-indigo-900' : 'text-gray-900'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function DeveloperCard({ developer }: { developer: DeveloperMetrics['developers'][0] }) {
  const { individualDashboard } = developer;
  const { currentPeriod } = individualDashboard;

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{developer.name}</h3>
          <p className="text-sm text-gray-600">{developer.role}</p>
        </div>
        <div className="flex gap-2">
          {developer.mvpStatus && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">MVP</span>
          )}
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              developer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {developer.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Billable Hours</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentPeriod.timeTracked.billableHours.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tasks Completed</p>
          <p className="text-lg font-semibold text-gray-900">{currentPeriod.tasks.completed}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Velocity</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentPeriod.velocity.average.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Productivity</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentPeriod.productivity.score.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">Skill Growth</p>
          <p className="text-sm font-semibold text-gray-900">
            {currentPeriod.skillGrowth.score.toFixed(0)}% (Kickback: {currentPeriod.skillGrowth.kickbackRatio.toFixed(1)}%)
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Projects Completed</p>
          <p className="text-sm font-semibold text-gray-900">
            {currentPeriod.results.projectsCompleted}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Satisfaction</p>
          <p className="text-sm font-semibold text-gray-900">
            {currentPeriod.results.satisfactionScore.toFixed(1)}/5.0
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: DeveloperMetrics['projects'][0] }) {
  const variance = project.estimatedVsActual.variancePercentage;
  const isOverBudget = variance > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{project.projectName}</h3>
          <p className="text-sm text-gray-600">{project.client}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {project.projectType}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {project.pricingModel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Billable Hours</p>
          <p className="text-sm font-semibold text-gray-900">
            {project.timeTracking.billableHours.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tasks</p>
          <p className="text-sm font-semibold text-gray-900">
            {project.tasks.completed} / {project.tasks.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Time Variance</p>
          <p
            className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
          >
            {variance > 0 ? '+' : ''}
            {variance.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className="text-sm font-semibold text-gray-900">
            {project.dateRange.actualLaunch ? 'Launched' : 'In Progress'}
          </p>
        </div>
      </div>
    </div>
  );
}

