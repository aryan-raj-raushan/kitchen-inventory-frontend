import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/apiResponse';

export async function POST(): Promise<NextResponse> {
  const res = successResponse({ message: 'Logged out' });
  res.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
