import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { login } from '@/server/services/auth.server.service';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = validateBody(LoginSchema, body);

    const { accessToken, refreshToken } = await login(email, password);

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
