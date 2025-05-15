import { vi } from 'vitest';

// Base mock implementation
const axiosMock = {
  create: vi.fn(() => axiosInstanceMock),
  defaults: {
    headers: {
      common: {}
    }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn()
};

// Instance mock
const axiosInstanceMock = {
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn()
};

// Mock implementation for axios
vi.mock('axios', () => {
  return {
    default: axiosMock,
    ...axiosMock
  };
});

// Export mock implementations for use in tests
export { axiosMock, axiosInstanceMock };