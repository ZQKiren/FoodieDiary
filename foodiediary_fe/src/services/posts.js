// src/services/posts.js
import axiosInstance from '../utils/axios';

const postService = {
  // Get current user's posts with optional filtering
  getUserPosts: async (page = 1, limit = 10, search = '', minRating = 0) => {
    const response = await axiosInstance.get('/posts', {
      params: { page, limit, search, minRating },
    });
    return response.data;
  },

  // Get a single post by ID
  getPost: async (id) => {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  },

  // Create a new post
  createPost: async (postData) => {
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (key === 'image' && postData[key] instanceof File) {
        formData.append(key, postData[key]);
      } else {
        formData.append(key, postData[key]);
      }
    });

    const response = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing post
  updatePost: async (id, postData) => {
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (key === 'image' && postData[key] instanceof File) {
        formData.append(key, postData[key]);
      } else {
        formData.append(key, postData[key]);
      }
    });

    const response = await axiosInstance.put(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a post
  deletePost: async (id) => {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  },
};

export default postService;