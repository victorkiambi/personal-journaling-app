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
    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
    });
    
    if (!response.ok) {
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
  try {
    const url = new URL(request.url);
    const newUrl = new URL(url.toString());
    newUrl.pathname = `/api/v1/entries/${params.id}`;
    
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    // Transform the request body from categoryId to categoryIds array
    const requestData = await request.json();
    
    // Create a minimal transformed body with only necessary fields
    const transformedBody = {
      title: requestData.title,
      content: requestData.content,
      categoryIds: requestData.categoryId ? [requestData.categoryId] : []
    };
    
    // Set a reasonable fetch timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
    
    try {
      const response = await fetch(newUrl.toString(), {
        method: 'PUT',
        headers,
        body: JSON.stringify(transformedBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(errorJson, { status: response.status });
        } catch {
          return NextResponse.json(
            { message: `Error: ${response.status} ${response.statusText}` },
            { status: response.status }
          );
        }
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { message: 'Request took too long to complete. Please try again.' },
          { status: 408 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
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
    const response = await fetch(newUrl.toString(), {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      return response;
    }
    
    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 