// src/__tests__/auth.service.test.js
import authService from '../services/auth';
import axiosInstance from '../utils/axios';

// Mock axiosInstance
jest.mock('../utils/axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login calls the correct API endpoint', async () => {
    const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await authService.login('test@example.com', 'password123');

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result).toEqual(mockResponse.data);
  });

  test('register calls the correct API endpoint', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await authService.register(userData);

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
    expect(result).toEqual(mockResponse.data);
  });

  test('verifyToken calls the correct API endpoint', async () => {
    const mockResponse = { data: { valid: true } };
    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await authService.verifyToken();

    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/verify');
    expect(result).toEqual(mockResponse.data);
  });
});