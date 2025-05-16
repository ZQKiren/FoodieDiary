import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PostApproval from '../PostApproval';

const navigateMock = vi.fn();
const showToastMock = vi.fn();

let locationMock = {
  pathname: '/admin/posts',
  search: '',
  hash: '',
  state: null
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock
  };
});

vi.mock('date-fns', () => ({
  format: () => '01/01/2023'
}));

vi.mock('../../../services/admin', () => ({
  default: {
    getAllPosts: vi.fn(),
    updatePostStatus: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: showToastMock
  })
}));

import adminService from '../../../services/admin';

const mockPosts = [
  {
    id: 1,
    title: 'Pizza Review',
    location: 'Pizza Place',
    review: 'Great pizza with thin crust',
    rating: 5,
    eatenAt: '2023-05-15T00:00:00.000Z',
    isApproved: false,
    image: 'https://example.com/pizza.jpg',
    user: {
      id: 101,
      name: 'John Doe',
      email: 'john@example.com'
    }
  },
  {
    id: 2,
    title: 'Burger Review',
    location: 'Burger Joint',
    review: 'Juicy burger with crispy fries',
    rating: 4,
    eatenAt: '2023-05-10T00:00:00.000Z',
    isApproved: true,
    image: null,
    user: {
      id: 102,
      name: 'Jane Smith',
      email: 'jane@example.com'
    }
  }
];

describe('PostApproval Component', () => {
  const mockApiResponse = {
    posts: mockPosts,
    totalPages: 1,
    currentPage: 1,
    totalCount: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    locationMock = {
      pathname: '/admin/posts',
      search: '',
      hash: '',
      state: null
    };
    
    adminService.getAllPosts.mockResolvedValue(mockApiResponse);
    adminService.updatePostStatus.mockResolvedValue({ message: 'Status updated successfully' });
  });
  
  it('shows loading state initially', async () => {
    adminService.getAllPosts.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockApiResponse), 100))
    );

    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
    });
  });

  it('displays posts after loading', async () => {
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
      expect(screen.getByText('Burger Review')).toBeInTheDocument();
    });

    const pendingBadge = screen.getByText('Pending', { 
      selector: '.rounded-full'
    });
    expect(pendingBadge).toBeInTheDocument();
    
    const approvedBadge = screen.getByText('Approved', { 
      selector: '.rounded-full' 
    });
    expect(approvedBadge).toBeInTheDocument();
    
    expect(adminService.getAllPosts).toHaveBeenCalledTimes(1);
  });

  it('handles approve/hide post actions', async () => {
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
    });

    const approveButton = screen.getByText('Approve');
    await userEvent.click(approveButton);

    expect(adminService.updatePostStatus).toHaveBeenCalledWith(1, true);

    const hideButton = screen.getByText('Hide');
    await userEvent.click(hideButton);

    expect(adminService.updatePostStatus).toHaveBeenCalledWith(2, false);
  });

  it('opens and displays post detail modal', async () => {
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByText('Detail');
    await userEvent.click(detailButtons[0]);
    
    const locationLabel = screen.getByText('Location:');
    expect(locationLabel).toBeInTheDocument();
    
    const modalTitles = screen.getAllByText('Pizza Review');
    const isH3Present = modalTitles.some(el => el.tagName === 'H3');
    expect(isH3Present).toBe(true);
    
    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Location:')).not.toBeInTheDocument();
    });
  });

  it('handles filtering by approval status', async () => {
    locationMock = {
      pathname: '/admin/posts',
      search: '?approved=false',
      hash: '',
      state: null
    };

    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      const selectElement = screen.getByLabelText('Status:');
      expect(selectElement.value).toBe('false');
    });
   
    expect(adminService.getAllPosts).toHaveBeenCalled();
    
    adminService.getAllPosts.mockClear(); 
    const selectElement = screen.getByLabelText('Status:');
    await userEvent.selectOptions(selectElement, 'true');
    
    expect(navigateMock).toHaveBeenCalled();
  });

  it('handles search functionality', async () => {
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
    });
    
    adminService.getAllPosts.mockClear();
    
    const searchInput = screen.getByPlaceholderText('Search by title or location');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Pizza');
    
    const form = searchInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(adminService.getAllPosts).toHaveBeenCalled();
    });
    
    const calls = adminService.getAllPosts.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[2]).toBe('Pizza');
  });

  it('handles pagination correctly', async () => {
    const pagedResponse = {
      ...mockApiResponse,
      totalPages: 3,
      currentPage: 1
    };
    adminService.getAllPosts.mockResolvedValue(pagedResponse);
    
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Review')).toBeInTheDocument();
    });
    
    adminService.getAllPosts.mockClear();
    
    const paginationButtons = screen.getAllByRole('button');
    
    const page2Button = paginationButtons.find(b => b.textContent === '2');
    if (page2Button) {
      await userEvent.click(page2Button);
    } else {
      const nextButtons = screen.getAllByRole('button').filter(b => 
        b.textContent === 'Next' || 
        b.getAttribute('aria-label') === 'Next' ||
        b.querySelector('.sr-only')?.textContent === 'Next'
      );
      
      if (nextButtons.length > 0) {
        await userEvent.click(nextButtons[0]);
      }
    }
    
    await waitFor(() => {
      expect(adminService.getAllPosts).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    adminService.getAllPosts.mockRejectedValue(new Error('Failed to fetch posts'));
    
    render(
      <BrowserRouter>
        <PostApproval />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to load posts', 'error');
    });
  });
});