import { storage } from '@/lib/storage';
import type { Goal, PipelineItem } from '@/types';
import localforage from 'localforage';

// Mock localforage
jest.mock('localforage', () => {
  const mockStore: Record<string, any> = {};
  
  return {
    __esModule: true,
    default: {
      config: jest.fn(),
      getItem: jest.fn((key: string) => Promise.resolve(mockStore[key] || null)),
      setItem: jest.fn((key: string, value: any) => {
        mockStore[key] = value;
        return Promise.resolve(value);
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStore[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStore).forEach(key => delete mockStore[key]);
        return Promise.resolve();
      }),
    },
  };
});

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Goals', () => {
    it('should get empty array when no goals exist', async () => {
      const goals = await storage.getGoals();
      expect(goals).toEqual([]);
    });

    it('should save and retrieve goals', async () => {
      const testGoals: Goal[] = [
        {
          id: 1,
          name: 'Test Goal',
          category: 'Revenue',
          startingValue: 0,
          currentValue: 50,
          targetValue: 100,
          targetDate: '2025-12-31',
          unit: '$',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      await storage.saveGoals(testGoals);
      const retrieved = await storage.getGoals();
      
      expect(retrieved).toEqual(testGoals);
    });
  });

  describe('Lead Pipeline', () => {
    it('should get empty array when no leads exist', async () => {
      const leads = await storage.getLeadPipeline();
      expect(leads).toEqual([]);
    });

    it('should save and retrieve lead pipeline', async () => {
      const testLeads: PipelineItem[] = [
        {
          id: 1,
          prospect: 'Test Company',
          proposedProject: 'Test Project',
          amount: 10000,
          salesStage: 'Proposal',
          nextStep: 'Follow up',
          nextStepDate: '2025-11-15',
          notes: 'Test notes',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      await storage.saveLeadPipeline(testLeads);
      const retrieved = await storage.getLeadPipeline();
      
      expect(retrieved).toEqual(testLeads);
    });
  });

  describe('Active Clients', () => {
    it('should save and retrieve active clients', async () => {
      const testClients: PipelineItem[] = [
        {
          id: 1,
          prospect: 'Client Co',
          proposedProject: 'Project',
          amount: 20000,
          nextStep: 'Review',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      await storage.saveActiveClients(testClients);
      const retrieved = await storage.getActiveClients();
      
      expect(retrieved).toEqual(testClients);
    });
  });

  describe('Lost Deals', () => {
    it('should save and retrieve lost deals', async () => {
      const testLost: PipelineItem[] = [
        {
          id: 1,
          prospect: 'Lost Co',
          proposedProject: 'Lost Project',
          amount: 5000,
          nextStep: 'N/A',
          lostDate: '2025-01-01T00:00:00.000Z',
          createdAt: '2024-12-01T00:00:00.000Z',
        },
      ];

      await storage.saveLostDeals(testLost);
      const retrieved = await storage.getLostDeals();
      
      expect(retrieved).toEqual(testLost);
    });
  });

  describe('Former Clients', () => {
    it('should save and retrieve former clients', async () => {
      const testFormer: PipelineItem[] = [
        {
          id: 1,
          prospect: 'Former Co',
          proposedProject: 'Former Project',
          amount: 15000,
          nextStep: 'N/A',
          endDate: '2025-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      await storage.saveFormerClients(testFormer);
      const retrieved = await storage.getFormerClients();
      
      expect(retrieved).toEqual(testFormer);
    });
  });
});

