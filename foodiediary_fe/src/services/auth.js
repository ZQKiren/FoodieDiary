import axiosInstance from '../utils/axios';

const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  },
};

export default authService;