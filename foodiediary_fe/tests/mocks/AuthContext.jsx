// tests/mocks/AuthContext.jsx
import { vi } from 'vitest';
import React from 'react';

// Mock user data
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

export const mockAdmin = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

// Mock AuthContext functions
export const mockAuthContext = {
  user: mockUser,
  token: 'mock-token',
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  isAdmin: vi.fn().mockReturnValue(false),
  loading: false
};

// Mock admin AuthContext
export const mockAdminAuthContext = {
  ...mockAuthContext,
  user: mockAdmin,
  isAdmin: vi.fn().mockReturnValue(true)
};

// Create a mock implementation for the useAuth hook
export const setupAuthContextMock = () => {
  vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn().mockReturnValue(mockAuthContext),
    AuthProvider: ({ children }) => <>{children}</>
  }));
};