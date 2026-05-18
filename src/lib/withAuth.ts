import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './auth';
import { UnauthorizedError } from './errors';
import { errorResponse } from './apiResponse';

type AuthedHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>>; user: TokenPayload }
) => Promise<NextResponse>;

export function withAuth(handler: (req: NextRequest, ctx: any) => Promise<NextResponse>) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing authorization header');
      }
      const token = authHeader.slice(7);
      const user = verifyAccessToken(token);
      return handler(req, { ...ctx, user });
    } catch (err) {
      if (err instanceof UnauthorizedError) return errorResponse(err);
      return errorResponse(new UnauthorizedError());
    }
  };
}
