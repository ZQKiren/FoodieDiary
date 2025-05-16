import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditPost from '../EditPost';

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
    updatePost: vi.fn()
  }
}));

vi.mock('../../components/posts/PostForm', () => ({
  default: vi.fn(({ post, isEditing }) => (
    <div data-testid="post-form">
      <div>Editing: {post?.title || 'Loading...'}</div>
      <div data-testid="is-editing">{isEditing ? 'Edit Mode' : 'Create Mode'}</div>
    </div>
  ))
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: showToastMock
  })
}));

import postService from '../../services/posts';
import { useToast } from '../../context/ToastContext';

describe('EditPost Page', () => {
  const mockPost = {
    id: 5,
    title: 'Test Post',
    location: 'Test Location',
    review: 'Test review content',
    rating: 4,
    eatenAt: '2023-05-15T00:00:00.000Z',
    image: 'https://example.com/image.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    postService.getPost.mockResolvedValue(mockPost);
  });

  it('shows loading state initially', async () => {
    postService.getPost.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockPost), 100))
    );

    render(
      <BrowserRouter>
        <EditPost />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('fetches post data and passes it to PostForm', async () => {
    render(
      <BrowserRouter>
        <EditPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(postService.getPost).toHaveBeenCalledWith(5);
      expect(screen.getByText('Editing: Test Post')).toBeInTheDocument();
      expect(screen.getByTestId('is-editing').textContent).toBe('Edit Mode');
    });
  });

  it('handles error when fetching post fails', async () => {
    postService.getPost.mockRejectedValue(new Error('Failed to fetch post'));

    render(
      <BrowserRouter>
        <EditPost />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to load post', 'error');
      expect(navigateMock).toHaveBeenCalledWith('/my-posts');
    });
  });
});