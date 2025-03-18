import { NextRequest, NextResponse } from 'next/server';

// Set a reasonable timeout that's not excessive
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  maxDuration: 30, // 30 seconds timeout
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/entries/${params.id}`;
  
  const headers = new Headers(request.headers);
  
  try {
    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Journal entry proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Transform the response format
    if (responseData.success && responseData.data) {
      // Transform the entry to include a category property
      const transformedEntry = {
        ...responseData.data,
        category: responseData.data.categories && responseData.data.categories.length > 0 
          ? {
              id: responseData.data.categories[0].id,
              name: responseData.data.categories[0].name,
              color: responseData.data.categories[0].color
            }
          : {
              id: 'default',
              name: 'Uncategorized',
              color: '#808080'
            }
      };
      
      return NextResponse.json(transformedEntry);
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Journal entry proxy error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/entries/${params.id}`;
  
  const headers = new Headers(request.headers);
  
  try {
    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    // Transform the request body from categoryId to categoryIds array
    const requestData = await request.json();
    const transformedBody = {
      ...requestData,
      categoryIds: requestData.categoryId ? [requestData.categoryId] : undefined
    };
    
    // Remove the original categoryId property
    if ('categoryId' in transformedBody) {
      delete transformedBody.categoryId;
    }
    
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
      body: JSON.stringify(transformedBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Journal entry update proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    const responseData = await response.json();
    
    // Transform the response format
    if (responseData.success && responseData.data) {
      // Transform the updated entry to match the expected format with a single category
      const entry = {
        ...responseData.data,
        category: responseData.data.categories && responseData.data.categories.length > 0 
          ? {
              id: responseData.data.categories[0].id,
              name: responseData.data.categories[0].name,
              color: responseData.data.categories[0].color
            }
          : {
              id: 'default',
              name: 'Uncategorized',
              color: '#808080'
            }
      };
      return NextResponse.json(entry);
    }
    
    return NextResponse.json(
      { message: 'Failed to update journal entry' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Journal entry update proxy error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = `/api/v1/entries/${params.id}`;
  
  const headers = new Headers(request.headers);
  
  try {
    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(newUrl.toString(), {
      method: 'DELETE',
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Journal entry delete proxy error: ${response.status} ${response.statusText}`);
      return response;
    }
    
    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Journal entry delete proxy error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 