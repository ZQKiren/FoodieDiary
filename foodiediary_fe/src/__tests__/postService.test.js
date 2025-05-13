// src/__tests__/posts.service.test.js
import postService from '../services/posts';
import axiosInstance from '../utils/axios';

// Mock axiosInstance
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserPosts calls the API with correct parameters', async () => {
    const mockResponse = { 
      data: { 
        posts: [{ id: 1, title: 'Test Post' }],
        totalPages: 1,
        currentPage: 1,
        total: 1
      } 
    };
    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await postService.getUserPosts(2, 20, 'test', 4);

    expect(axiosInstance.get).toHaveBeenCalledWith('/posts', {
      params: { page: 2, limit: 20, search: 'test', minRating: 4 }
    });
    expect(result).toEqual(mockResponse.data);
  });

  test('getPost calls the API with correct ID', async () => {
    const mockResponse = { data: { id: 1, title: 'Test Post' } };
    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await postService.getPost(1);

    expect(axiosInstance.get).toHaveBeenCalledWith('/posts/1');
    expect(result).toEqual(mockResponse.data);
  });

  test('deletePost calls the API with correct ID', async () => {
    const mockResponse = { data: { message: 'Post deleted successfully' } };
    axiosInstance.delete.mockResolvedValue(mockResponse);

    const result = await postService.deletePost(1);

    expect(axiosInstance.delete).toHaveBeenCalledWith('/posts/1');
    expect(result).toEqual(mockResponse.data);
  });
});