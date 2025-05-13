import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Mock dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../context/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null })
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockShowToast = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
    useToast.mockReturnValue({ showToast: mockShowToast });
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    mockLogin.mockResolvedValue({});
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockShowToast).toHaveBeenCalledWith('Login successful!', 'success');
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue({ response: { data: { message: errorMessage } } });
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'wrong@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
    });
  });
});