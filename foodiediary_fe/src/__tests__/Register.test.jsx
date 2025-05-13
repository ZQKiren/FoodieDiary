import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
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
  useNavigate: () => jest.fn()
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockShowToast = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ register: mockRegister });
    useToast.mockReturnValue({ showToast: mockShowToast });
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  test('renders register form', () => {
    render(<Register />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles password mismatch', async () => {
    render(<Register />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'Test User' } 
    });
    
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'different123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Passwords do not match', 'error');
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  test('handles successful registration', async () => {
    mockRegister.mockResolvedValue({});
    
    render(<Register />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'Test User' } 
    });
    
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockShowToast).toHaveBeenCalledWith('Registration successful!', 'success');
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});