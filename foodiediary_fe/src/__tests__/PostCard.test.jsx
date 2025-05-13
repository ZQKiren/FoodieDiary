import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../components/posts/PostCard';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test User' } })
}));

jest.mock('../components/common/BookmarkButton', () => () => <button>Bookmark</button>);
jest.mock('../components/common/ShareButton', () => () => <button>Share</button>);

describe('PostCard Component', () => {
  const mockPost = {
    id: 1,
    title: 'Test Post',
    location: 'Test Location',
    review: 'This is a test review',
    rating: 4,
    eatenAt: new Date().toISOString(),
    image: 'https://example.com/image.jpg',
    isApproved: true,
    user: { id: 1, name: 'Test User' }
  };
  
  const mockOnDelete = jest.fn();
  
  test('renders post information correctly', () => {
    render(<PostCard post={mockPost} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('This is a test review')).toBeInTheDocument();
    expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
  });
  
  test('displays pending approval badge when post is not approved', () => {
    const unapprovedPost = { ...mockPost, isApproved: false };
    render(<PostCard post={unapprovedPost} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });
  
  test('calls onDelete when delete button is clicked', () => {
    render(<PostCard post={mockPost} onDelete={mockOnDelete} />);
    
    fireEvent.click(screen.getByText('Delete'));
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockPost.id);
  });
});