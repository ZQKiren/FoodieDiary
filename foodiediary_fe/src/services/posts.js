import axiosInstance from '../utils/axios';

const postService = {
  getUserPosts: async (page = 1, limit = 10, search = '', minRating = 0) => {
    const response = await axiosInstance.get('/posts', {
      params: { page, limit, search, minRating },
    });
    return response.data;
  },

  getPost: async (id) => {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
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

  updatePost: async (id, postData) => {
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

  deletePost: async (id) => {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  },
};

export default postService;