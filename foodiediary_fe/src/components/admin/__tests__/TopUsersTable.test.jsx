import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopUsersTable from '../TopUsersTable';

describe('TopUsersTable Component', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', postCount: 10 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', postCount: 8 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', postCount: 5 }
  ];

  it('renders a table with correct headers', () => {
    render(
      <BrowserRouter>
        <TopUsersTable users={mockUsers} />
      </BrowserRouter>
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Email');
    expect(headers[2]).toHaveTextContent('Posts');
  });

  it('renders the correct number of user rows', () => {
    render(
      <BrowserRouter>
        <TopUsersTable users={mockUsers} />
      </BrowserRouter>
    );

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(mockUsers.length + 1);
  });

  it('displays correct user data in each row', () => {
    render(
      <BrowserRouter>
        <TopUsersTable users={mockUsers} />
      </BrowserRouter>
    );

    mockUsers.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(user.postCount.toString())).toBeInTheDocument();
    });
  });

  it('displays user initials in avatars', () => {
    render(
      <BrowserRouter>
        <TopUsersTable users={mockUsers} />
      </BrowserRouter>
    );

    const jInitials = screen.getAllByText('J');

    expect(jInitials).toHaveLength(2);

    jInitials.forEach(initial => {
      expect(initial).toHaveClass('text-green-800');
    });

    const bInitial = screen.getByText('B');
    expect(bInitial).toBeInTheDocument();
    expect(bInitial).toHaveClass('text-green-800');
  });

  it('handles empty user list gracefully', () => {
    render(
      <BrowserRouter>
        <TopUsersTable users={[]} />
      </BrowserRouter>
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1); 
  });

  it('handles users with missing names correctly', () => {
    const usersWithMissingNames = [
      { id: 1, name: '', email: 'noname@example.com', postCount: 7 },
      { id: 2, name: null, email: 'null@example.com', postCount: 3 },
      { id: 3, name: undefined, email: 'undefined@example.com', postCount: 2 }
    ];

    render(
      <BrowserRouter>
        <TopUsersTable users={usersWithMissingNames} />
      </BrowserRouter>
    );

    const uAvatars = screen.getAllByText('U');
    expect(uAvatars).toHaveLength(3);
  });
});