import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withAuth(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  try {
    const token = await getToken({ req: request });

    if (!token?.sub) {
      return NextResponse.json(
        { message: 'Unauthorized' },
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

  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: 'An unexpected error occurred' },
    { status: 500 }
  );
} 