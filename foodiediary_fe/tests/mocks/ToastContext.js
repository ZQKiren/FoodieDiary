import React from 'react';

// Mock ToastContext functions
export const mockToastContext = {
  showToast: vi.fn()
};

// Create a mock implementation for the useToast hook
vi.mock('../src/context/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue(mockToastContext),
  ToastProvider: ({ children }) => <>{children}</>
}));