import { create } from 'zustand';

interface AdminData {
  username: string;
}

interface AuthState {
  admin: AdminData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: AdminData, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (admin, accessToken) =>
    set({ admin, accessToken, isAuthenticated: true }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  clearAuth: () =>
    set({ admin: null, accessToken: null, isAuthenticated: false }),
}));
