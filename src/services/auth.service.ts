import { gateway } from '@/lib/gateway';
import type { LoginResponse } from '@/types';

export async function login(email: string, password: string): Promise<string> {
  const data = await gateway.post<LoginResponse>('/auth/login', { email, password });
  return data.accessToken;
}

export async function logout(): Promise<void> {
  await gateway.post('/auth/logout');
}
