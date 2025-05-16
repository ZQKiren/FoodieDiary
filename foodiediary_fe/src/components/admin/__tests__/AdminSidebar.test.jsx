import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  let mockLocation = {
    pathname: '/admin',
    search: '',
    hash: '',
    state: null
  };
  
  return {
    ...actual,
    useLocation: vi.fn(() => mockLocation),
    // Mock this to avoid errors with NavLink
    NavLink: ({ children, className, to, end }) => {
      // Simple implementation to handle the className function
      const isActive = mockLocation.pathname === to || 
        (to.includes('?') && mockLocation.search.includes(to.split('?')[1]));
      
      const resolvedClassName = typeof className === 'function' 
        ? className({ isActive })
        : className;
        
      return (
        <a 
          href={to} 
          className={resolvedClassName}
          data-active={isActive ? 'true' : 'false'}
          data-testid={`nav-link-${to.replace(/\W/g, '-')}`}
        >
          {children}
        </a>
      );
    }
  };
});

// Import after mocking
import { useLocation } from 'react-router-dom';

describe('AdminSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation links', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check all navigation link texts are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('highlights the dashboard link when on the dashboard page', () => {
    // Set the location to dashboard
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/admin',
      search: '',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check that the dashboard link has the active class (contains green text)
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-green-100');
    expect(dashboardLink).toHaveClass('text-green-700');
  });

  it('highlights the posts link when on the posts page', () => {
    // Set the location to posts page
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/admin/posts',
      search: '',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check that the posts link has the active class (contains green text)
    const postsLink = screen.getByText('Posts').closest('a');
    expect(postsLink).toHaveClass('bg-green-100');
    expect(postsLink).toHaveClass('text-green-700');
  });

  it('highlights the pending approvals link when on that page', () => {
    // Set the location to pending approvals page
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/admin/posts',
      search: '?approved=false',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check that the pending approvals link has the active class (contains green text)
    const pendingApprovalsLink = screen.getByText('Pending Approvals').closest('a');
    expect(pendingApprovalsLink).toHaveClass('bg-green-100');
    expect(pendingApprovalsLink).toHaveClass('text-green-700');
  });

  it('highlights the users link when on the users page', () => {
    // Set the location to users page
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/admin/users',
      search: '',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check that the users link has the active class (contains green text)
    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveClass('bg-green-100');
    expect(usersLink).toHaveClass('text-green-700');
  });

  it('correctly handles complex URL matching with search params', () => {
    // Test with a more complex URL with multiple search parameters
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/admin/posts',
      search: '?approved=false&page=2',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // The pending approvals link should still be active
    const pendingApprovalsLink = screen.getByText('Pending Approvals').closest('a');
    expect(pendingApprovalsLink).toHaveClass('bg-green-100');
    expect(pendingApprovalsLink).toHaveClass('text-green-700');
  });

  it('does not highlight any links when on an unrelated page', () => {
    // Set the location to some unrelated page
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/some-other-page',
      search: '',
      hash: '',
      state: null
    });

    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );

    // Check that none of the links have the active class
    const links = [
      screen.getByText('Dashboard').closest('a'),
      screen.getByText('Posts').closest('a'),
      screen.getByText('Pending Approvals').closest('a'),
      screen.getByText('Users').closest('a')
    ];

    links.forEach(link => {
      expect(link).not.toHaveClass('bg-green-100');
      expect(link).not.toHaveClass('text-green-700');
      expect(link).toHaveClass('text-gray-600');
    });
  });
});