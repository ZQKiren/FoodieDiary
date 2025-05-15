// src/pages/__tests__/Login.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const navigateMock = vi.fn();

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock, 
    useLocation: () => ({
      state: { from: { pathname: '/dashboard' } }
    })
  };
});

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn()
  })
}));

// Mock ToastContext
vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
}));

// Import after mocking
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

describe('Login Page', () => {
  const loginMock = vi.fn();
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    useAuth.mockReturnValue({ login: loginMock });
    useToast.mockReturnValue({ showToast: showToastMock });
  });

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('submits the form with correct values', async () => {
    // Setup successful login
    loginMock.mockResolvedValue({});
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Verify login was called with correct arguments
    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Wait for navigation after successful login
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Login successful!', 'success');
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error message when login fails', async () => {
    // Setup login failure
    const errorMessage = 'Invalid credentials';
    loginMock.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Verify error handling
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(errorMessage, 'error');
      expect(navigateMock).not.toHaveBeenCalled();
    });
    
    // Button should no longer be in loading state
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled();
  });

  it('shows loading state during login attempt', async () => {
    // Setup delayed login response
    loginMock.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({}), 100);
    }));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Verify loading state
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled();
    });
  });

  it('navigates to register page when register link is clicked', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    await userEvent.click(screen.getByText('Register now'));
    
    expect(navigateMock).toHaveBeenCalledWith('/register');
  });
});