import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        ...(err instanceof AppError && 'fields' in err ? { fields: (err as any).fields } : {}),
      },
      { status: err.statusCode }
    );
  }

  logger.error(err, 'Unhandled error');
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
