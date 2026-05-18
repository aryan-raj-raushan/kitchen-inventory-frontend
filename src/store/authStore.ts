'use client';

import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated:
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('isAuthenticated') === 'true'
      : false,

  setTokens: (accessToken) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('isAuthenticated', 'true');
    }
    set({ accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('isAuthenticated');
    }
    set({ accessToken: null, isAuthenticated: false });
  },
}));
