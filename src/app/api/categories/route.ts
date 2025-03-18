import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/categories', '/api/v1/categories');
  
  const headers = new Headers(request.headers);
  
  const response = await fetch(newUrl.toString(), {
    method: request.method,
    headers,
    body: request.body ? request.body : undefined,
  });
  
  if (!response.ok) {
    return response;
  }
  
  const responseData = await response.json();
  
  // Transform the response format
  if (responseData.success && responseData.data) {
    return NextResponse.json(responseData.data);
  }
  
  return NextResponse.json(
    { message: 'Failed to fetch categories' },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/categories', '/api/v1/categories');
  
  const headers = new Headers(request.headers);
  
  const response = await fetch(newUrl.toString(), {
    method: request.method,
    headers,
    body: request.body ? request.body : undefined,
  });
  
  if (!response.ok) {
    return response;
  }
  
  const responseData = await response.json();
  
  // Transform the response format
  if (responseData.success && responseData.data) {
    return NextResponse.json(responseData.data);
  }
  
  return NextResponse.json(
    { message: 'Failed to create category' },
    { status: 500 }
  );
} 