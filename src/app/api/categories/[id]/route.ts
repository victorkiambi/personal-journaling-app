import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/categories/${params.id}`;
  
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
    { message: 'Failed to fetch category' },
    { status: 500 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/categories/${params.id}`;
  
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
    { message: 'Failed to update category' },
    { status: 500 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/categories/${params.id}`;
  
  const headers = new Headers(request.headers);
  
  const response = await fetch(newUrl.toString(), {
    method: request.method,
    headers,
  });
  
  if (!response.ok) {
    return response;
  }
  
  const responseData = await response.json();
  
  // Transform the response format
  if (responseData.success) {
    return NextResponse.json({ message: 'Category deleted successfully' });
  }
  
  return NextResponse.json(
    { message: 'Failed to delete category' },
    { status: 500 }
  );
} 