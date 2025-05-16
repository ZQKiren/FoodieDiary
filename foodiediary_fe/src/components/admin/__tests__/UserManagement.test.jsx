import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../UserManagement';

const showToastMock = vi.fn();

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', postCount: 5 },
  { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user', postCount: 10 },
  { id: 3, name: 'Another User', email: 'another@example.com', role: 'user', postCount: 3 }
];

vi.mock('../../../services/admin', () => ({
  default: {
    getAllUsers: vi.fn(() => Promise.resolve(mockUsers)),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: showToastMock
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
  })
}));

import adminService from '../../../services/admin';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

describe('UserManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getAllUsers.mockImplementation(() => Promise.resolve(mockUsers));
    adminService.updateUserRole.mockResolvedValue({ message: 'Role updated successfully' });
    adminService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });
  });

  it('handles API errors when deleting a user', async () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Regular User')).toBeInTheDocument();
    });

    adminService.deleteUser.mockRejectedValue(new Error('Failed to delete user'));
    
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[1]);
    
    expect(screen.getByText(/Are you sure you want to delete the user/)).toBeInTheDocument();
    
    const confirmButton = screen.getByTestId('confirm-delete-button');
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Failed to delete user', 'error');
    });
  });
});