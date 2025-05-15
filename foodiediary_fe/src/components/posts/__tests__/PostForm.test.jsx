import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PostForm from '../PostForm';

// Mock dependencies
vi.mock('../../../services/posts', () => ({
  default: {
    createPost: vi.fn(),
    updatePost: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
}));

vi.mock('../../common/ImageUpload', () => ({
  default: ({ onChange, currentImage }) => (
    <div data-testid="image-upload">
      <button 
        data-testid="select-image" 
        onClick={() => onChange(new File([''], 'test.jpg', { type: 'image/jpeg' }))}
      >
        Select Image
      </button>
      <div data-testid="current-image">{currentImage || 'No image'}</div>
    </div>
  )
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn().mockReturnValue(vi.fn())
  };
});

// Import after mocking
import postService from '../../../services/posts';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

describe('PostForm Component', () => {
  const navigateMock = vi.fn();
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    useNavigate.mockReturnValue(navigateMock);
    useToast.mockReturnValue({ showToast: showToastMock });
    postService.createPost.mockResolvedValue({ message: 'Post created successfully' });
  });

  it('renders create post form by default', () => {
    render(
      <BrowserRouter>
        <PostForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Create Food Post')).toBeInTheDocument();
    expect(screen.getByLabelText('Food Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
  });

  it('renders edit post form when in edit mode', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      location: 'Test Location',
      review: 'Test review',
      rating: 4,
      eatenAt: '2023-01-01',
      image: 'https://example.com/image.jpg'
    };
    
    render(
      <BrowserRouter>
        <PostForm post={mockPost} isEditing={true} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Edit Food Post')).toBeInTheDocument();
    expect(screen.getByLabelText('Food Name')).toHaveValue('Test Post');
    expect(screen.getByLabelText('Location')).toHaveValue('Test Location');
    expect(screen.getByLabelText('Review')).toHaveValue('Test review');
    expect(screen.getByRole('button', { name: 'Update Post' })).toBeInTheDocument();
  });

  it('submits form to create a new post', async () => {
    render(
      <BrowserRouter>
        <PostForm />
      </BrowserRouter>
    );
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText('Food Name'), 'New Pizza');
    await userEvent.type(screen.getByLabelText('Location'), 'Pizza Place, Chicago');
    await userEvent.type(screen.getByLabelText('Review'), 'Great pizza with thin crust');
    
    // Select image
    await userEvent.click(screen.getByTestId('select-image'));
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Create Post' }));
    
    await waitFor(() => {
      expect(postService.createPost).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Pizza',
        location: 'Pizza Place, Chicago',
        review: 'Great pizza with thin crust',
        rating: 5, // Default rating
        image: expect.any(File)
      }));
    });
    
    // Should navigate to my-posts on success
    expect(navigateMock).toHaveBeenCalledWith('/my-posts');
    expect(showToastMock).toHaveBeenCalledWith('Post created successfully', 'success');
  });

  it('handles form submission errors', async () => {
    // Setup error response
    postService.createPost.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <PostForm />
      </BrowserRouter>
    );
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText('Food Name'), 'Test Food');
    await userEvent.type(screen.getByLabelText('Location'), 'Test Location');
    await userEvent.type(screen.getByLabelText('Review'), 'Test Review');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Create Post' }));
    
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to save post', 'error');
    });
    
    // Should not navigate on error
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('cancels form and navigates back', async () => {
    render(
      <BrowserRouter>
        <PostForm />
      </BrowserRouter>
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(navigateMock).toHaveBeenCalledWith('/my-posts');
  });
});