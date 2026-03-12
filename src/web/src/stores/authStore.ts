import { create } from 'zustand';
import apiClient from '../services/apiClient';
import type { AuthUser, LoginRequest, RegisterRequest, AuthResponse } from '../types/suspension';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_USER: AuthUser = { id: 'demo', email: 'demo@example.com', name: 'Demo User' };

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (req) => {
    if (isDemo) {
      set({ user: DEMO_USER, token: 'demo', isAuthenticated: true, isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', req);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
    }
  },

  register: async (req) => {
    if (isDemo) {
      set({ user: DEMO_USER, token: 'demo', isAuthenticated: true, isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', req);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    if (!isDemo) {
      localStorage.removeItem('auth_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (isDemo) {
      // Auto-authenticate in demo mode
      set({ user: DEMO_USER, token: 'demo', isAuthenticated: true });
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      set({ token, isAuthenticated: true });
      apiClient
        .post<AuthResponse>('/auth/refresh')
        .then((res) => {
          const { token: newToken, user } = res.data;
          localStorage.setItem('auth_token', newToken);
          set({ token: newToken, user, isAuthenticated: true });
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          set({ token: null, user: null, isAuthenticated: false });
        });
    }
  },
}));
