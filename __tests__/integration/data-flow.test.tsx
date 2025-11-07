import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PipelineManager from '@/components/PipelineManager';
import { usePipelineData } from '@/hooks/useLocalForage';
import { storage } from '@/lib/storage';
import type { Goal, PipelineItem } from '@/types';

// Mock the hooks
jest.mock('@/hooks/useLocalForage');
jest.mock('@/lib/storage');

const mockUsePipelineData = usePipelineData as jest.MockedFunction<typeof usePipelineData>;

describe('Data Flow Integration Tests', () => {
  const mockSetGoals = jest.fn();
  const mockSetLeadPipeline = jest.fn();
  const mockSetActiveClients = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUsePipelineData.mockReturnValue({
      goals: [],
      leadPipeline: [],
      activeClients: [],
      lostDeals: [],
      formerClients: [],
      setGoals: mockSetGoals,
      setLeadPipeline: mockSetLeadPipeline,
      setActiveClients: mockSetActiveClients,
      setLostDeals: jest.fn(),
      setFormerClients: jest.fn(),
      loading: false,
      refresh: jest.fn(),
    });

    (storage.saveGoals as jest.Mock).mockResolvedValue(undefined);
    (storage.saveLeadPipeline as jest.Mock).mockResolvedValue(undefined);
    (storage.saveActiveClients as jest.Mock).mockResolvedValue(undefined);
  });

  it('should create and save a goal', async () => {
    const user = userEvent.setup();
    render(<PipelineManager />);

    // Click Add Goal
    await user.click(screen.getByText(/Add Goal/i));

    // Fill in goal form
    await user.type(screen.getByPlaceholderText(/Goal Name/i), 'Q1 Revenue');
    await user.type(screen.getByPlaceholderText(/Starting Value/i), '0');
    await user.type(screen.getByPlaceholderText(/Current Value/i), '50000');
    await user.type(screen.getByPlaceholderText(/Target Value/i), '100000');
    
    const dateInput = screen.getByPlaceholderText(/Target Date/i) || 
                     screen.getByDisplayValue('');
    if (dateInput) {
      await user.type(dateInput, '2025-12-31');
    }

    // Save goal
    await user.click(screen.getByText(/Save Goal/i));

    await waitFor(() => {
      expect(mockSetGoals).toHaveBeenCalled();
      expect(storage.saveGoals).toHaveBeenCalled();
    });
  });

  it('should validate required goal fields', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    
    render(<PipelineManager />);

    await user.click(screen.getByText(/Add Goal/i));
    await user.click(screen.getByText(/Save Goal/i));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in required goal fields');
    });

    alertSpy.mockRestore();
  });

  it('should create and save a pipeline item', async () => {
    const user = userEvent.setup();
    render(<PipelineManager />);

    // Click Add Lead
    await user.click(screen.getByText(/Add Lead/i));

    // Fill in pipeline form
    await user.type(screen.getByPlaceholderText(/Prospect Name/i), 'Test Company');
    await user.type(screen.getByPlaceholderText(/Proposed Project/i), 'Test Project');
    await user.type(screen.getByPlaceholderText(/Amount/i), '10000');

    // Save item
    await user.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(mockSetLeadPipeline).toHaveBeenCalled();
      expect(storage.saveLeadPipeline).toHaveBeenCalled();
    });
  });

  it('should validate required pipeline fields', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    
    render(<PipelineManager />);

    await user.click(screen.getByText(/Add Lead/i));
    await user.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in Prospect and Proposed Project');
    });

    alertSpy.mockRestore();
  });

  it('should export data correctly', async () => {
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

    mockUsePipelineData.mockReturnValue({
      goals: [testGoal],
      leadPipeline: [],
      activeClients: [],
      lostDeals: [],
      formerClients: [],
      setGoals: mockSetGoals,
      setLeadPipeline: mockSetLeadPipeline,
      setActiveClients: mockSetActiveClients,
      setLostDeals: jest.fn(),
      setFormerClients: jest.fn(),
      loading: false,
      refresh: jest.fn(),
    });

    const createElementSpy = jest.spyOn(document, 'createElement');
    const clickSpy = jest.fn();
    
    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as any);

    render(<PipelineManager />);

    const exportButton = screen.getByText(/Export JSON/i);
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});

