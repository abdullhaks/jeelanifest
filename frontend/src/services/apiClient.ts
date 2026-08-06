import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and attempt refresh, and global error messages
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and it's not already a retry, and we didn't just fail a refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        
        if (data.admin) {
          useAuthStore.getState().setAuth(data.admin, data.accessToken);
        }
        
        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear state
        useAuthStore.getState().clearAuth();
        message.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Global error message
    if (error.response?.data?.message) {
      const msg = error.response.data.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg);
      }
    } else if (error.message) {
      message.error(error.message);
    } else {
      message.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
