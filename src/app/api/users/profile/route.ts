import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/users/profile', '/api/v1/users/profile');
  
  const headers = new Headers(request.headers);
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    console.log(`Proxying profile request to: ${newUrl.toString()}`);
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
    });
    
    if (!response.ok) {
      console.error(`Profile proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Pass through the data directly
    if (responseData.success && responseData.data) {
      return NextResponse.json(responseData.data);
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch profile data' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Profile proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/users/profile', '/api/v1/users/profile');
  
  const headers = new Headers(request.headers);
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    console.log(`Proxying profile update request to: ${newUrl.toString()}`);
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
    });
    
    if (!response.ok) {
      console.error(`Profile update proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Pass through the data directly
    if (responseData.success && responseData.data) {
      return NextResponse.json(responseData.data);
    }
    
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Profile update proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 