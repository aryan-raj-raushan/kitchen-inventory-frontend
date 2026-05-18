'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { login as loginService, logout as logoutService } from '@/services/auth.service';

export function useAuth() {
  const { isAuthenticated, setTokens, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await loginService(email, password);
      setTokens(accessToken);
      router.push('/pos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutService();
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  return { login, logout, isAuthenticated, isLoading, error };
}
