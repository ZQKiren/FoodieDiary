import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

// Test component using the context
const TestComponent = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-name">{user.name}</div>
          <div data-testid="is-admin">{isAdmin() ? 'Admin' : 'User'}</div>
        </>
      ) : (
        <div data-testid="no-user">No user logged in</div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage mock
    window.localStorage.getItem.mockClear();
    window.localStorage.setItem.mockClear();
    window.localStorage.removeItem.mockClear();
    
    // Default no token
    window.localStorage.getItem.mockReturnValue(null);
  });
  
  test('provides null user when no token is available', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });
  
  test('provides user data when token is valid', async () => {
    // Mock localStorage to return a token
    window.localStorage.getItem.mockImplementation(key => {
      if (key === 'token') return 'mock-token';
      return null;
    });
    
    // Mock jwt decode to return user data
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('User');
    });
  });
  
  test('identifies admin user correctly', async () => {
    // Mock localStorage to return a token
    window.localStorage.getItem.mockImplementation(key => {
      if (key === 'token') return 'mock-token';
      return null;
    });
    
    // Mock jwt decode to return admin user data
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin');
    });
  });
});