import axiosInstance from '../utils/axios';

const bookmarkService = {
  getUserBookmarks: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get('/bookmarks', {
      params: { page, limit },
    });
    return response.data;
  },

  toggleBookmark: async (postId) => {
    const response = await axiosInstance.post('/bookmarks/toggle', { postId });
    return response.data;
  },

  checkBookmark: async (postId) => {
    const response = await axiosInstance.get(`/bookmarks/${postId}`);
    return response.data;
  },
};

export default bookmarkService;