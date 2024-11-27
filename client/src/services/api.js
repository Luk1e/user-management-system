import axios from 'axios';

const API_URL = '/api/auth';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserStatus: async (userIds, status) => {
    const response = await api.put('/users/status', { userIds, status });
    return response.data;
  },

  deleteUsers: async (userIds) => {
    const response = await api.delete('/users', { data: { userIds } });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};


api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);