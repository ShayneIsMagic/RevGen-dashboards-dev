import localforage from 'localforage';
import type { Goal, PipelineItem, LeadItem, GovContractItem, SalesTargets, SalesMetrics, DeveloperMetrics, DashboardConfig } from '@/types';

// Configure LocalForage
localforage.config({
  name: 'PipelineManager',
  storeName: 'pipeline_data',
  description: 'Pipeline Manager data storage',
});

export const storage = {
  // Goals
  async getGoals(): Promise<Goal[]> {
    return (await localforage.getItem('goals')) || [];
  },
  async saveGoals(goals: Goal[]): Promise<void> {
    await localforage.setItem('goals', goals);
  },

  // Leads Pipeline (separate from Sales)
  async getLeadsPipeline(): Promise<LeadItem[]> {
    return (await localforage.getItem('leadsPipeline')) || [];
  },
  async saveLeadsPipeline(items: LeadItem[]): Promise<void> {
    await localforage.setItem('leadsPipeline', items);
  },

  // Sales Pipeline (renamed from Lead Pipeline)
  async getSalesPipeline(): Promise<PipelineItem[]> {
    return (await localforage.getItem('salesPipeline')) || [];
  },
  async saveSalesPipeline(items: PipelineItem[]): Promise<void> {
    await localforage.setItem('salesPipeline', items);
  },

  // Legacy: Keep for backward compatibility
  async getLeadPipeline(): Promise<PipelineItem[]> {
    return (await localforage.getItem('leadPipeline')) || [];
  },
  async saveLeadPipeline(items: PipelineItem[]): Promise<void> {
    await localforage.setItem('leadPipeline', items);
  },

  // Active Clients
  async getActiveClients(): Promise<PipelineItem[]> {
    return (await localforage.getItem('activeClients')) || [];
  },
  async saveActiveClients(items: PipelineItem[]): Promise<void> {
    await localforage.setItem('activeClients', items);
  },

  // Lost Deals
  async getLostDeals(): Promise<PipelineItem[]> {
    return (await localforage.getItem('lostDeals')) || [];
  },
  async saveLostDeals(items: PipelineItem[]): Promise<void> {
    await localforage.setItem('lostDeals', items);
  },

  // Former Clients
  async getFormerClients(): Promise<PipelineItem[]> {
    return (await localforage.getItem('formerClients')) || [];
  },
  async saveFormerClients(items: PipelineItem[]): Promise<void> {
    await localforage.setItem('formerClients', items);
  },

  // Financial Data
  async getFinancialData(period: 'month' | 'quarter' | 'year', date: string): Promise<unknown | null> {
    const key = `financial_${period}_${date}`;
    return await localforage.getItem(key);
  },
  async saveFinancialData(period: 'month' | 'quarter' | 'year', date: string, data: unknown): Promise<void> {
    const key = `financial_${period}_${date}`;
    await localforage.setItem(key, data);
  },

  // Government Contracts
  async getGovContracts(): Promise<GovContractItem[]> {
    return (await localforage.getItem('govContracts')) || [];
  },
  async saveGovContracts(items: GovContractItem[]): Promise<void> {
    await localforage.setItem('govContracts', items);
  },

  // Sales Metrics & Targets
  async getSalesTargets(): Promise<SalesTargets | null> {
    return (await localforage.getItem('salesTargets')) as SalesTargets | null;
  },
  async saveSalesTargets(targets: SalesTargets): Promise<void> {
    await localforage.setItem('salesTargets', targets);
  },
  async getSalesMetrics(): Promise<SalesMetrics | null> {
    return (await localforage.getItem('salesMetrics')) as SalesMetrics | null;
  },
  async saveSalesMetrics(metrics: SalesMetrics): Promise<void> {
    await localforage.setItem('salesMetrics', metrics);
  },
  async getDashboardConfig(): Promise<DashboardConfig | null> {
    return (await localforage.getItem('dashboardConfig')) as DashboardConfig | null;
  },
  async saveDashboardConfig(config: DashboardConfig): Promise<void> {
    await localforage.setItem('dashboardConfig', config);
  },

  // Developer Metrics
  async getDeveloperMetrics(): Promise<DeveloperMetrics | null> {
    return (await localforage.getItem('developerMetrics')) as DeveloperMetrics | null;
  },
  async saveDeveloperMetrics(metrics: DeveloperMetrics): Promise<void> {
    await localforage.setItem('developerMetrics', metrics);
  },
};

