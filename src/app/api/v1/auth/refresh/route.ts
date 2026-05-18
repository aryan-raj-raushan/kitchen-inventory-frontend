import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { refresh } from '@/server/services/auth.server.service';
import { UnauthorizedError } from '@/lib/errors';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get('refreshToken')?.value;
    if (!token) throw new UnauthorizedError('No refresh token');

    const { accessToken, refreshToken } = await refresh(token);

    const res = successResponse({ accessToken });
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
