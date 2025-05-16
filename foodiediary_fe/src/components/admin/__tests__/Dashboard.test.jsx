// Mock browser APIs first
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// Mock amCharts libraries (try both v4 and v5 paths)
vi.mock('@amcharts/amcharts4', () => ({}), { virtual: true });
vi.mock('@amcharts/amcharts4/core', () => ({}), { virtual: true });
vi.mock('@amcharts/amcharts4/charts', () => ({}), { virtual: true });
vi.mock('@amcharts/amcharts5', () => ({}), { virtual: true });
vi.mock('@amcharts/amcharts5/core', () => ({}), { virtual: true });
vi.mock('@amcharts/amcharts5/charts', () => ({}), { virtual: true });

// Import React after mocks
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock chart components
// Important: Check these paths match exactly how they're imported in Dashboard.jsx
vi.mock('../charts/MonthlyPostsChart', () => ({
  default: () => React.createElement('div', { 'data-testid': 'monthly-posts-chart' }, 'Monthly Chart Mock')
}));

vi.mock('../charts/TopCitiesChart', () => ({
  default: () => React.createElement('div', { 'data-testid': 'top-cities-chart' }, 'Cities Chart Mock')
}));

// Mock other dependencies
const navigateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('../../../services/admin', () => ({
  default: {
    getMonthlyStats: vi.fn(),
    getCityStats: vi.fn(),
    getMostActiveUsers: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: showToastMock
  })
}));

vi.mock('../TopUsersTable', () => ({
  default: ({ users }) => (
    React.createElement('div', 
      { 'data-testid': 'top-users-table' },
      `Users Table with ${users.length} users`
    )
  )
}));

// Now import Dashboard and other modules
import Dashboard from '../Dashboard';
import adminService from '../../../services/admin';

describe('Dashboard Component', () => {
  // Test data and setup
  const mockMonthlyStats = [
    { month: 1, count: 5 },
    { month: 2, count: 8 },
    { month: 3, count: 12 }
  ];
  
  const mockCityStats = [
    { city: 'New York', count: 25 },
    { city: 'Los Angeles', count: 15 },
    { city: 'Chicago', count: 10 }
  ];
  
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', postCount: 10 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', postCount: 8 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', postCount: 5 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getMonthlyStats.mockResolvedValue(mockMonthlyStats);
    adminService.getCityStats.mockResolvedValue(mockCityStats);
    adminService.getMostActiveUsers.mockResolvedValue(mockUsers);
  });

  // Modified loading spinner test
  it('shows loading state initially', async () => {
    // Mock loading spinner test ID
    const delayPromise = (data) => new Promise(resolve => setTimeout(() => resolve(data), 100));
    
    adminService.getMonthlyStats.mockImplementation(() => delayPromise(mockMonthlyStats));
    adminService.getCityStats.mockImplementation(() => delayPromise(mockCityStats));
    adminService.getMostActiveUsers.mockImplementation(() => delayPromise(mockUsers));

    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Look for the loading spinner div with animation classes instead of data-testid
    const loadingElement = container.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  it('displays dashboard data after loading', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-posts-chart')).toBeInTheDocument();
      expect(screen.getByTestId('top-cities-chart')).toBeInTheDocument();
      expect(screen.getByTestId('top-users-table')).toBeInTheDocument();
      
      expect(adminService.getMonthlyStats).toHaveBeenCalledTimes(1);
      expect(adminService.getCityStats).toHaveBeenCalledTimes(1);
      expect(adminService.getMostActiveUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('handles API errors gracefully', async () => {
    adminService.getMonthlyStats.mockRejectedValue(new Error('Failed to fetch monthly stats'));
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to load dashboard stats', 'error');
    });
  });

  it('renders quick links correctly', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('All Food Posts')).toBeInTheDocument();
      
      const links = screen.getAllByRole('link');
      const linkHrefs = Array.from(links).map(link => link.getAttribute('href'));
      
      expect(linkHrefs).toContain('/admin/posts?approved=false');
      expect(linkHrefs).toContain('/admin/users');
      expect(linkHrefs).toContain('/admin/posts');
    });
  });
});