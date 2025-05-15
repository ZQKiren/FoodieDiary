import { vi } from 'vitest';

// Mock postService
export const mockPostService = {
  getUserPosts: vi.fn(),
  getPost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getSharedPost: vi.fn()
};

// Create mock implementation for postService
vi.mock('../src/services/posts', () => {
  return {
    default: mockPostService
  };
});

// Mock bookmarkService
export const mockBookmarkService = {
  getUserBookmarks: vi.fn(),
  toggleBookmark: vi.fn(),
  checkBookmark: vi.fn()
};

// Create mock implementation for bookmarkService
vi.mock('../src/services/bookmarks', () => {
  return {
    default: mockBookmarkService
  };
});

// Mock authService
export const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  verifyToken: vi.fn()
};

// Create mock implementation for authService
vi.mock('../src/services/auth', () => {
  return {
    default: mockAuthService
  };
});

// Mock adminService
export const mockAdminService = {
  getAllPosts: vi.fn(),
  updatePostStatus: vi.fn(),
  getMonthlyStats: vi.fn(),
  getCityStats: vi.fn(),
  getMostActiveUsers: vi.fn(),
  getAllUsers: vi.fn(),
  updateUserRole: vi.fn(),
  deleteUser: vi.fn()
};

// Create mock implementation for adminService
vi.mock('../src/services/admin', () => {
  return {
    default: mockAdminService
  };
});