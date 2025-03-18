import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { handleApiError } from '../../middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await AuthService.register(body);
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return handleApiError(error);
  }
} 