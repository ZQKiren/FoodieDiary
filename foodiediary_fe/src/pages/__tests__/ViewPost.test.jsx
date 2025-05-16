import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ViewPost from '../ViewPost';

const navigateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '5' }),
    useNavigate: () => navigateMock
  };
});

vi.mock('../../services/posts', () => ({
  default: {
    getPost: vi.fn(),
    deletePost: vi.fn()
  }
}));

vi.mock('../../components/common/BookmarkButton', () => ({
  default: ({ postId }) => (
    <button data-testid="bookmark-button">Bookmark Post {postId}</button>
  )
}));

vi.mock('../../components/common/ShareButton', () => ({
  default: ({ postId }) => (
    <button data-testid="share-button">Share Post {postId}</button>
  )
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 1, name: 'Test User' }
  })
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ 
    showToast: showToastMock 
  })
}));

import postService from '../../services/posts';

describe('ViewPost Page', () => {
  const mockPost = {
    id: 5,
    title: 'Delicious Pizza',
    location: 'Pizza Place, New York',
    review: 'This was the best pizza I ever had.',
    rating: 5,
    eatenAt: '2023-05-15T00:00:00.000Z',
    image: 'https://example.com/pizza.jpg',
    isApproved: true,
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    postService.getPost.mockResolvedValue(mockPost);
    postService.deletePost.mockResolvedValue({ message: 'Post deleted successfully' });
  });

  it('shows loading state initially', async () => {
    postService.getPost.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockPost), 100))
    );

    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('displays post details correctly', async () => {
    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delicious Pizza')).toBeInTheDocument();
      expect(screen.getByText('Pizza Place, New York')).toBeInTheDocument();
      expect(screen.getByText('This was the best pizza I ever had.')).toBeInTheDocument();
      expect(screen.getByText('5/5')).toBeInTheDocument();
      expect(screen.getByText('May 15, 2023')).toBeInTheDocument();
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/pizza.jpg');
      expect(image).toHaveAttribute('alt', 'Delicious Pizza');
      
      expect(screen.getByTestId('bookmark-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('shows "post not found" message when post does not exist', async () => {
    postService.getPost.mockResolvedValue(null);

    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Post not found')).toBeInTheDocument();
      expect(screen.getByText('The post you are looking for does not exist or has been removed.')).toBeInTheDocument();
      expect(screen.getByText('← Back to My Posts')).toBeInTheDocument();
    });
  });

  it('handles delete post with confirmation', async () => {
    global.confirm = vi.fn().mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Delete'));

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this post?');

    expect(postService.deletePost).toHaveBeenCalledWith(5);
    
    expect(showToastMock).toHaveBeenCalledWith('Post deleted successfully', 'success');
    expect(navigateMock).toHaveBeenCalledWith('/my-posts');
  });

  it('does not delete when user cancels confirmation', async () => {
    global.confirm = vi.fn().mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Delete'));

    expect(global.confirm).toHaveBeenCalled();

    expect(postService.deletePost).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows pending approval banner for unapproved posts', async () => {
    const unapprovedPost = { ...mockPost, isApproved: false };
    postService.getPost.mockResolvedValue(unapprovedPost);

    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('This post is pending approval and is only visible to you.')).toBeInTheDocument();
    });
  });

  it('handles errors when deleting a post', async () => {
    global.confirm = vi.fn().mockReturnValue(true);
    
    postService.deletePost.mockRejectedValue(new Error('Failed to delete post'));

    render(
      <BrowserRouter>
        <ViewPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to delete post', 'error');
      expect(navigateMock).not.toHaveBeenCalled(); 
    });
  });
});