import bookmarkService from '../services/bookmarks';
import axiosInstance from '../utils/axios';

// Mock axiosInstance
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('Bookmark Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('toggleBookmark calls the API with correct postId', async () => {
    const mockResponse = { 
      data: { 
        isBookmarked: true,
        message: 'Bookmark added successfully'
      } 
    };
    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await bookmarkService.toggleBookmark(1);

    expect(axiosInstance.post).toHaveBeenCalledWith('/bookmarks/toggle', { postId: 1 });
    expect(result).toEqual(mockResponse.data);
  });

  test('checkBookmark calls the API with correct postId', async () => {
    const mockResponse = { data: { isBookmarked: true } };
    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await bookmarkService.checkBookmark(1);

    expect(axiosInstance.get).toHaveBeenCalledWith('/bookmarks/1');
    expect(result).toEqual(mockResponse.data);
  });

  test('getUserBookmarks calls the API with correct parameters', async () => {
    const mockResponse = { 
      data: { 
        posts: [{ id: 1, title: 'Test Post' }],
        totalPages: 1,
        currentPage: 1,
        total: 1
      } 
    };
    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await bookmarkService.getUserBookmarks(2, 15);

    expect(axiosInstance.get).toHaveBeenCalledWith('/bookmarks', {
      params: { page: 2, limit: 15 }
    });
    expect(result).toEqual(mockResponse.data);
  });
});