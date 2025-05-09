// src/services/admin.js
import axiosInstance from '../utils/axios';

const adminService = {
  // Get all posts (for admin)
  getAllPosts: async (page = 1, limit = 10, search = '', minRating = 0, approved = undefined) => {
    const response = await axiosInstance.get('/admin/posts', {
      params: { page, limit, search, minRating, approved },
    });
    return response.data;
  },

  // Update post approval status
  updatePostStatus: async (id, isApproved) => {
    const response = await axiosInstance.patch(`/admin/posts/${id}/status`, {
      isApproved,
    });
    return response.data;
  },

  // Get monthly statistics
  getMonthlyStats: async () => {
    const response = await axiosInstance.get('/admin/stats/monthly');
    return response.data;
  },

  // Get city statistics
  getCityStats: async () => {
    const response = await axiosInstance.get('/admin/stats/cities');
    return response.data;
  },

  // Get active users
  getMostActiveUsers: async () => {
    const response = await axiosInstance.get('/admin/stats/users/active');
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default adminService;