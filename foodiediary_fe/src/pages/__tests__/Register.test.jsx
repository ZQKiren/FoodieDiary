import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    register: vi.fn()
  })
}));

// Mock ToastContext
vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
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
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

describe('Register Page', () => {
  const registerMock = vi.fn();
  const showToastMock = vi.fn();
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    useAuth.mockReturnValue({ register: registerMock });
    useToast.mockReturnValue({ showToast: showToastMock });
    useNavigate.mockReturnValue(navigateMock);
  });

  it('renders registration form correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Create a new account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill form with non-matching passwords
    await userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'different');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Verify error handling for password mismatch
    expect(showToastMock).toHaveBeenCalledWith('Passwords do not match', 'error');
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('submits registration with correct values', async () => {
    // Setup successful registration
    registerMock.mockResolvedValue({});
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill form with matching passwords
    await userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Verify registration was called with correct arguments
    expect(registerMock).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Wait for navigation after successful registration
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Registration successful!', 'success');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows error message when registration fails', async () => {
    // Setup registration failure
    const errorMessage = 'User already exists';
    registerMock.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email address'), 'existing@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Verify error handling
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(errorMessage, 'error');
      expect(navigateMock).not.toHaveBeenCalled();
    });
    
    // Button should no longer be in loading state
    expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
  });

  it('navigates to login page when sign in link is clicked', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    await userEvent.click(screen.getByText('Sign in'));
    
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});