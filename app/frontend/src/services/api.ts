// NOTE: The backend API base URL should be 'http://localhost:5000'.
// Example endpoints: '/api/auth/login', '/api/auth/signup', '/api/profile', etc.
// Make sure your frontend calls match these routes and the backend is running on this port.

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type for GET requests
  if (req.method && req.method.toLowerCase() === 'get' && req.headers['Content-Type']) {
    delete req.headers['Content-Type'];
  }
  return req;
});

export const createPost = (postData: {
  content: string;
  tags?: string[];
  visibility?: string;
  media?: string[];
}) => API.post('/posts', postData);

export const getProfile = () => API.get('/profile');

export const api = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData: { email: string; password: string; name: string }) => {
    const response = await API.post('/auth/signup', userData);
    return response.data;
  },

  // Profile endpoints
  getProfile: async () => {
    const response = await API.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  },
}; 