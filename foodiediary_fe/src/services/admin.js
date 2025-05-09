import axiosInstance from '../utils/axios';

const adminService = {
  getAllPosts: async (page = 1, limit = 10, search = '', minRating = 0, approved = undefined) => {
    const response = await axiosInstance.get('/admin/posts', {
      params: { page, limit, search, minRating, approved },
    });
    return response.data;
  },

  updatePostStatus: async (id, isApproved) => {
    const response = await axiosInstance.patch(`/admin/posts/${id}/status`, {
      isApproved,
    });
    return response.data;
  },

  getMonthlyStats: async () => {
    const response = await axiosInstance.get('/admin/stats/monthly');
    return response.data;
  },

  getCityStats: async () => {
    const response = await axiosInstance.get('/admin/stats/cities');
    return response.data;
  },

  getMostActiveUsers: async () => {
    const response = await axiosInstance.get('/admin/stats/users/active');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default adminService;