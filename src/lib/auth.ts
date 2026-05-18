import jwt from 'jsonwebtoken';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export interface TokenPayload {
  sub: string;
  email: string;
}

function getSecret(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const val = process.env[key];
  if (!val) throw new Error(`${key} is not set`);
  return val;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret('JWT_SECRET'), { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret('JWT_SECRET')) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as TokenPayload;
}
