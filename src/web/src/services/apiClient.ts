import axios from 'axios';
import { useNotificationStore } from '../stores/notificationStore';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }

    if (error.response?.status === 429) {
      const message = 'Too many requests. Please wait a moment before trying again.';
      useNotificationStore.getState().addNotification('error', message);
      return Promise.reject(new Error(message));
    }

    // Extract meaningful error message from API response
    const data = error.response?.data;
    let message = 'Request failed';
    if (typeof data === 'string') {
      message = data;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.errors) {
      // FluentValidation problem+json format
      const errors = Object.values(data.errors).flat();
      message = errors.join('. ') || message;
    } else if (data?.title) {
      message = data.title;
    } else if (error.message) {
      message = error.message;
    }

    // Surface non-401 errors as notifications (401s are handled by auth flow)
    if (error.response?.status !== 401) {
      useNotificationStore.getState().addNotification('error', message);
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
