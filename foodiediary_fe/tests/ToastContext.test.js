import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../src/pages/Login';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import authService from '../src/services/auth';
import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';

// Mock services and hooks
vi.mock('../src/services/auth', () => ({
  login: vi.fn()
}));

// Mock react-router-dom's useNavigate and useLocation
const mockNavigate = vi.fn();
const mockLocation = { state: { from: { pathname: '/dashboard' } } };

vi.mock('react-router-dom', () => ({
  ...vi.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock ToastContext
const showToastMock = vi.fn();
vi.mock('../src/context/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({
    showToast: showToastMock
  })
}));

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.login.mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'user' }
    });
  });

  test('renders login form', () => {
    renderLoginPage();
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('submits login form with credentials', async () => {
    renderLoginPage();
    
    // Fill in the form
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Check if login service was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Verify navigation after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('shows loading state during login', async () => {
    // Setup a delayed login response
    authService.login.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            token: 'fake-token',
            user: { id: 1, email: 'test@example.com' }
          });
        }, 100);
      });
    });
    
    renderLoginPage();
    
    // Fill in the form
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('handles login error', async () => {
    // Setup error response
    const errorResponse = { 
      response: { 
        data: { message: 'Invalid credentials' } 
      } 
    };
    authService.login.mockRejectedValue(errorResponse);
    
    renderLoginPage();
    
    // Fill in the form
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Check if error toast was displayed
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        'Invalid credentials', 
        'error'
      );
    });
    
    // Button should not be in loading state anymore
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled();
    
    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles login error with no response data', async () => {
    // Setup generic error
    authService.login.mockRejectedValue(new Error('Network error'));
    
    renderLoginPage();
    
    // Fill in the form
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Check if fallback error toast was displayed
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        'Login failed. Please try again.',
        'error'
      );
    });
  });

  test('navigates to register page when register link is clicked', () => {
    renderLoginPage();
    
    userEvent.click(screen.getByText('Register now'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('redirects to home page by default if no "from" location', () => {
    // Override the mock to simulate no redirect location
    require('react-router-dom').useLocation = () => ({ state: null });
    
    renderLoginPage();
    
    // Fill in and submit the form
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    // Should redirect to home page (/) if no "from" location
    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('prevents default form submission behavior', () => {
    renderLoginPage();
    
    // Mock preventDefault to verify it's called
    const preventDefaultMock = vi.fn();
    
    // Get the form and simulate a submit event with preventDefault
    const form = screen.getByRole('form');
    form.addEventListener('submit', preventDefaultMock);
    
    // Trigger a submit event (this should call our event listener)
    userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    expect(preventDefaultMock).toHaveBeenCalled();
  });
});