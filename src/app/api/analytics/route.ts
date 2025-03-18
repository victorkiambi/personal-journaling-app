import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/analytics', '/api/v1/analytics');
  
  const headers = new Headers(request.headers);
  
  try {
    console.log(`Proxying analytics request to: ${newUrl.toString()}`);
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
    });
    
    if (!response.ok) {
      console.error(`Analytics proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Pass through the data directly
    if (responseData.success && responseData.data) {
      return NextResponse.json(responseData.data);
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Analytics proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 