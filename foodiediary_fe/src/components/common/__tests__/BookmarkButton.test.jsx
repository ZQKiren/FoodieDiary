// src/components/common/__tests__/BookmarkButton.test.jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookmarkButton from '../BookmarkButton';

// Mock the services and contexts directly
vi.mock('../../../services/bookmarks', () => ({
  default: {
    checkBookmark: vi.fn(),
    toggleBookmark: vi.fn()
  }
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 1, name: 'Test User' }
  })
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
}));

// Import after mocking
import bookmarkService from '../../../services/bookmarks';

describe('BookmarkButton Component', () => {
  const postId = 5;

  beforeEach(() => {
    vi.clearAllMocks();
    bookmarkService.checkBookmark.mockResolvedValue({ isBookmarked: false });
    bookmarkService.toggleBookmark.mockResolvedValue({ 
      isBookmarked: true,
      message: 'Bookmark added successfully'
    });
  });

  it('renders bookmark button in initial state', async () => {
    render(<BookmarkButton postId={postId} />);
    
    // Wait for the component to check bookmark status
    await waitFor(() => {
      expect(bookmarkService.checkBookmark).toHaveBeenCalledWith(postId);
    });
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Bookmark');
    expect(button).not.toHaveClass('text-yellow-600');
  });
});