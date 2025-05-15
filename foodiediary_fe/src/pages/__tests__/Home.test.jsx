import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
}));

// Import after mocking
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

describe('Home Page', () => {
  // Setup function to render with different auth states
  const renderHome = (isAuthenticated = false) => {
    useAuth.mockReturnValue({
      user: isAuthenticated ? { id: 1, name: 'Test User' } : null
    });

    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the welcome title', () => {
    renderHome();
    expect(screen.getByText('Welcome to Foodie Diary')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    renderHome();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Record Your Food Experiences')).toBeInTheDocument();
    expect(screen.getByText('Upload Food Photos')).toBeInTheDocument();
    expect(screen.getByText('Filter and Search')).toBeInTheDocument();
  });

  it('shows Register button when user is not logged in', () => {
    renderHome();
    const registerButton = screen.getByRole('link', { name: /join now/i });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toHaveAttribute('href', '/register');
  });

  it('shows Create New Post button when user is logged in', () => {
    renderHome(true);
    const createPostButton = screen.getByRole('link', { name: /create new post/i });
    expect(createPostButton).toBeInTheDocument();
    expect(createPostButton).toHaveAttribute('href', '/new-post');
  });

  it('shows appropriate call-to-action for logged-out users', () => {
    renderHome();
    expect(screen.getByText('Start Your Food Journey Today')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
  });

  it('shows different call-to-action for logged-in users', () => {
    renderHome(true);
    expect(screen.getByText('Start Your Food Journey Today')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to my food diary/i })).toBeInTheDocument();
  });
});