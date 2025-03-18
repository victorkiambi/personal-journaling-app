import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/users/change-password', '/api/v1/users/change-password');
  
  const headers = new Headers(request.headers);
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    console.log(`Proxying password change request to: ${newUrl.toString()}`);
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
    });
    
    if (!response.ok) {
      console.error(`Password change proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Pass through the data directly
    if (responseData.success) {
      return NextResponse.json(responseData);
    }
    
    return NextResponse.json(
      { message: 'Failed to change password' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Password change proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 