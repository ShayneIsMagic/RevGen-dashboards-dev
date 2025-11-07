import { renderHook, waitFor } from '@testing-library/react';
import { usePipelineData } from '@/hooks/useLocalForage';
import { storage } from '@/lib/storage';
import type { Goal, PipelineItem } from '@/types';

// Mock the storage module
jest.mock('@/lib/storage');

describe('usePipelineData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock returns
    (storage.getGoals as jest.Mock).mockResolvedValue([]);
    (storage.getLeadPipeline as jest.Mock).mockResolvedValue([]);
    (storage.getActiveClients as jest.Mock).mockResolvedValue([]);
    (storage.getLostDeals as jest.Mock).mockResolvedValue([]);
    (storage.getFormerClients as jest.Mock).mockResolvedValue([]);
  });

  it('should load all data on mount', async () => {
    const { result } = renderHook(() => usePipelineData());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(storage.getGoals).toHaveBeenCalled();
    expect(storage.getLeadPipeline).toHaveBeenCalled();
    expect(storage.getActiveClients).toHaveBeenCalled();
    expect(storage.getLostDeals).toHaveBeenCalled();
    expect(storage.getFormerClients).toHaveBeenCalled();
  });

  it('should initialize with empty arrays', async () => {
    const { result } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goals).toEqual([]);
    expect(result.current.leadPipeline).toEqual([]);
    expect(result.current.activeClients).toEqual([]);
    expect(result.current.lostDeals).toEqual([]);
    expect(result.current.formerClients).toEqual([]);
  });

  it('should load existing data', async () => {
    const testGoal: Goal = {
      id: 1,
      name: 'Test Goal',
      category: 'Revenue',
      startingValue: 0,
      currentValue: 50,
      targetValue: 100,
      targetDate: '2025-12-31',
      unit: '$',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    (storage.getGoals as jest.Mock).mockResolvedValue([testGoal]);

    const { result } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goals).toEqual([testGoal]);
  });

  it('should handle loading errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (storage.getGoals as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goals).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  it('should provide setter functions', async () => {
    const { result } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.setGoals).toBe('function');
    expect(typeof result.current.setLeadPipeline).toBe('function');
    expect(typeof result.current.setActiveClients).toBe('function');
    expect(typeof result.current.setLostDeals).toBe('function');
    expect(typeof result.current.setFormerClients).toBe('function');
  });

  it('should provide refresh function', async () => {
    const { result } = renderHook(() => usePipelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
    
    // Test refresh
    await result.current.refresh();
    
    expect(storage.getGoals).toHaveBeenCalledTimes(2);
  });
});

