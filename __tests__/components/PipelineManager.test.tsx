import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PipelineManager from '@/components/PipelineManager';
import { storage } from '@/lib/storage';

// Mock the storage and hooks
jest.mock('@/lib/storage');
jest.mock('@/hooks/useLocalForage', () => ({
  usePipelineData: jest.fn(() => ({
    goals: [],
    leadPipeline: [],
    activeClients: [],
    lostDeals: [],
    formerClients: [],
    setGoals: jest.fn(),
    setLeadPipeline: jest.fn(),
    setActiveClients: jest.fn(),
    setLostDeals: jest.fn(),
    setFormerClients: jest.fn(),
    loading: false,
    refresh: jest.fn(),
  })),
}));

describe('PipelineManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    global.Blob = jest.fn((parts, options) => ({
      parts,
      options,
      size: 0,
      type: options?.type || '',
    })) as any;
  });

  it('should render the main heading', () => {
    render(<PipelineManager />);
    expect(screen.getByText('Pipeline Manager')).toBeInTheDocument();
  });

  it('should render export buttons', () => {
    render(<PipelineManager />);
    expect(screen.getByText(/Export JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Markdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Import JSON/i)).toBeInTheDocument();
  });

  it('should render goals section', () => {
    render(<PipelineManager />);
    expect(screen.getByText(/📊 Goals/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Add Goal/i).length).toBeGreaterThan(0);
  });

  it('should render pipeline section', () => {
    render(<PipelineManager />);
    expect(screen.getByText(/Pipeline Management/i)).toBeInTheDocument();
  });

  it('should show empty state when no goals exist', () => {
    render(<PipelineManager />);
    expect(screen.getByText(/No goals yet/i)).toBeInTheDocument();
  });

  it('should show goal form when Add Goal is clicked', async () => {
    const user = userEvent.setup();
    render(<PipelineManager />);
    
    const addGoalButtons = screen.getAllByText(/Add Goal/i);
    await user.click(addGoalButtons[0]);
    
    expect(screen.getByPlaceholderText(/Goal Name/i)).toBeInTheDocument();
  });

  it('should show pipeline tabs', () => {
    render(<PipelineManager />);
    expect(screen.getByText(/Lead Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Clients/i)).toBeInTheDocument();
    expect(screen.getByText(/Lost Deals/i)).toBeInTheDocument();
    expect(screen.getByText(/Former Clients/i)).toBeInTheDocument();
  });

  it('should handle export to JSON', () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    
    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as any);
    
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    
    render(<PipelineManager />);
    
    const exportButton = screen.getByText(/Export JSON/i);
    fireEvent.click(exportButton);
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    
    createElementSpy.mockRestore();
  });

  it('should handle export to Markdown', () => {
    render(<PipelineManager />);
    
    const exportButton = screen.getByText(/Export Markdown/i);
    fireEvent.click(exportButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});

