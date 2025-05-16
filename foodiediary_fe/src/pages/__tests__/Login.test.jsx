import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const navigateMock = vi.fn();

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

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn()
  })
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showToast: vi.fn()
  })
}));

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

describe('Login Page', () => {
  const loginMock = vi.fn();
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
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
    loginMock.mockResolvedValue({});
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Login successful!', 'success');
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    loginMock.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(errorMessage, 'error');
      expect(navigateMock).not.toHaveBeenCalled();
    });
    
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled();
  });

  it('shows loading state during login attempt', async () => {
    loginMock.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({}), 100);
    }));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    
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
    
    const linkElement = screen.getByText('Register now').closest('a');
      expect(linkElement).toHaveAttribute('href', '/register');
  });
});