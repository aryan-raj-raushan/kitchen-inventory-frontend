import 'server-only';
import bcrypt from 'bcryptjs';
import { findByEmail } from '../repositories/auth.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export async function login(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const admin = await findByEmail(email);
  if (!admin) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const payload = { sub: admin._id.toString(), email: admin.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return {
    accessToken: signAccessToken({ sub: payload.sub, email: payload.email }),
    refreshToken: signRefreshToken({ sub: payload.sub, email: payload.email }),
  };
}
