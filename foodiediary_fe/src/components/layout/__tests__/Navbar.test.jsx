// src/components/layout/__tests__/Navbar.test.jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';

// Mock the auth hook
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Import after mocking
import { useAuth } from '../../../context/AuthContext';

describe('Navbar Component', () => {
  const regularUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };
  
  const adminUser = {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };
  
  const logoutMock = vi.fn();
  const isAdminMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  const renderNavbar = (user = null) => {
    // Set up the mock for useAuth
    useAuth.mockReturnValue({
      user,
      logout: logoutMock,
      isAdmin: isAdminMock.mockReturnValue(user?.role === 'admin')
    });
    
    return render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  };

  it('renders app name/logo', () => {
    renderNavbar();
    expect(screen.getByText('Foodie Diary')).toBeInTheDocument();
  });
});