import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/journal', '/api/v1/entries');
  
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
    let entries = [];
    
    // If it's a paginated response, transform the items
    if (responseData.data.items) {
      entries = responseData.data.items.map(entry => ({
        ...entry,
        // Use the first category as the main category or provide a default one
        category: entry.categories && entry.categories.length > 0 
          ? {
              id: entry.categories[0].id,
              name: entry.categories[0].name,
              color: entry.categories[0].color
            }
          : {
              id: 'default',
              name: 'Uncategorized',
              color: '#808080'
            }
      }));
      return NextResponse.json(entries);
    }
    
    // If it's a single entry, transform it
    if (responseData.data.categories) {
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
    
    return NextResponse.json(responseData.data);
  }
  
  return NextResponse.json(
    { message: 'Failed to fetch journal entries' },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace('/api/journal', '/api/v1/entries');
  
  const headers = new Headers(request.headers);
  
  // Transform the request body from categoryId to categoryIds array
  const requestData = await request.json();
  const transformedBody = {
    ...requestData,
    categoryIds: requestData.categoryId ? [requestData.categoryId] : []
  };
  
  // Remove the original categoryId property
  if ('categoryId' in transformedBody) {
    delete transformedBody.categoryId;
  }
  
  const response = await fetch(newUrl.toString(), {
    method: request.method,
    headers,
    body: JSON.stringify(transformedBody),
  });
  
  if (!response.ok) {
    return response;
  }
  
  const responseData = await response.json();
  
  // Transform the response format
  if (responseData.success && responseData.data) {
    // Transform the new entry to match the expected format with a single category
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
    { message: 'Failed to create journal entry' },
    { status: 500 }
  );
} 