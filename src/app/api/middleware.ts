import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  DuplicateError,
  InvalidOperationError,
  RateLimitError,
  ServiceUnavailableError
} from '@/lib/errors';

export async function withAuth(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  try {
    const token = await getToken({ req: request });

    if (!token?.sub) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    return handler(token.sub);
  } catch (error) {
    return handleApiError(error);
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
} 