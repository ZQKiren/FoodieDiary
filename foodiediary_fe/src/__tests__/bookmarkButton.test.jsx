// src/__tests__/BookmarkButton.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookmarkButton from '../components/common/BookmarkButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bookmarkService from '../services/bookmarks';

// Mock dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../context/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('../services/bookmarks', () => ({
  checkBookmark: jest.fn(),
  toggleBookmark: jest.fn()
}));

describe('BookmarkButton Component', () => {
  const mockShowToast = jest.fn();
  
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useToast.mockReturnValue({ showToast: mockShowToast });
    bookmarkService.checkBookmark.mockResolvedValue({ isBookmarked: false });
    bookmarkService.toggleBookmark.mockResolvedValue({ 
      isBookmarked: true, 
      message: 'Bookmark added successfully' 
    });
  });
  
  test('checks bookmark status on load', async () => {
    render(<BookmarkButton postId={1} />);
    
    await waitFor(() => {
      expect(bookmarkService.checkBookmark).toHaveBeenCalledWith(1);
    });
  });
  
  test('toggles bookmark when clicked', async () => {
    render(<BookmarkButton postId={1} />);
    
    await waitFor(() => {
      expect(bookmarkService.checkBookmark).toHaveBeenCalled();
    });
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(bookmarkService.toggleBookmark).toHaveBeenCalledWith(1);
      expect(mockShowToast).toHaveBeenCalledWith('Bookmark added successfully', 'success');
    });
  });
  
  test('shows warning when user is not logged in', async () => {
    useAuth.mockReturnValue({ user: null });
    
    render(<BookmarkButton postId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(bookmarkService.toggleBookmark).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Please login to bookmark posts', 'warning');
    });
  });
});