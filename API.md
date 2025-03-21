# API Documentation

## Base URL
```
https://shamiri-journal.fly.dev/api/v1
```

## Authentication
All API endpoints require authentication using NextAuth.js sessions. The application automatically handles authentication via cookies set by NextAuth.js.

Protected routes are secured using NextAuth.js middleware. When accessing the API programmatically, you'll need to include the session cookie.

## Authentication

### NextAuth.js Routes
The following routes are automatically managed by NextAuth.js:

```
/api/auth/signin
/api/auth/callback
/api/auth/signout
/api/auth/session
/api/auth/csrf
```

### Get Current User Session
```http
GET /api/auth/session
```

Response:
```json
{
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "image": "https://example.com/profile.jpg"
  },
  "expires": "2023-04-19T12:00:00.000Z"
}
```

### Profile Management

#### Get User Profile
```http
GET /api/v1/users/me
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "profile": {
      "bio": "Software developer",
      "location": "New York",
      "website": "https://example.com"
    }
  }
}
```

#### Update User Profile
```http
PUT /api/v1/users/profile
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Updated bio",
  "location": "New York",
  "website": "https://example.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "profile": {
      "bio": "Updated bio",
      "location": "New York",
      "website": "https://example.com"
    }
  }
}
```

#### Change Password
```http
POST /api/v1/users/change-password
Content-Type: application/json

{
  "currentPassword": "currentpassword",
  "newPassword": "newpassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Journal Entries

### Create Entry
```http
POST /entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Journal Entry",
  "content": "Today was a great day...",
  "categoryIds": ["category-uuid-1", "category-uuid-2"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "entry-uuid",
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "categories": [
      {
        "id": "category-uuid-1",
        "name": "Personal"
      },
      {
        "id": "category-uuid-2",
        "name": "Work"
      }
    ],
    "metadata": {
      "wordCount": 150,
      "readingTime": 1
    }
  }
}
```

### Get Entries (with pagination and filters)
```http
GET /entries?page=1&pageSize=10&categoryId=category-uuid&startDate=2024-03-18&endDate=2024-03-19&search=keyword
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "entry-uuid",
        "title": "My Journal Entry",
        "content": "Today was a great day...",
        "categories": [...],
        "metadata": {
          "wordCount": 150,
          "readingTime": 1
        },
        "createdAt": "2024-03-19T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### Get Single Entry
```http
GET /entries/{entry-id}
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "entry-uuid",
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "categories": [...],
    "metadata": {
      "wordCount": 150,
      "readingTime": 1
    },
    "createdAt": "2024-03-19T10:00:00Z",
    "updatedAt": "2024-03-19T10:00:00Z"
  }
}
```

### Update Entry
```http
PUT /entries/{entry-id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "categoryIds": ["category-uuid-1"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "entry-uuid",
    "title": "Updated Title",
    "content": "Updated content...",
    "categories": [...],
    "metadata": {
      "wordCount": 200,
      "readingTime": 2
    }
  }
}
```

### Delete Entry
```http
DELETE /entries/{entry-id}
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

## AI Features

### Text Analysis

#### Analyze Text Content
```http
POST /api/v1/analyze/text
Content-Type: application/json

{
  "content": "Text content to analyze for suggestions and improvements."
}
```

Response:
```json
{
  "suggestions": [
    {
      "text": "Text content to analyze",
      "confidence": 0.9,
      "category": "grammar",
      "replacement": "Text content to analyze.",
      "explanation": "Grammar improvement suggestion",
      "context": "Text content to analyze"
    },
    {
      "text": "Text content to analyze for suggestions and improvements.",
      "confidence": 0.8,
      "category": "style",
      "explanation": "Your writing could be more readable. Try using simpler words and shorter sentences."
    }
  ],
  "autoCompletions": [
    "with additional details and context."
  ],
  "writingStyle": {
    "readability": 75,
    "complexity": 5,
    "suggestions": [
      "Consider adding more descriptive language to enhance clarity."
    ]
  }
}
```

### AI Insights

#### Generate Insights for Journal Entry
```http
POST /api/v1/entries/{entry-id}/insights
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "insight-uuid-1",
      "entryId": "entry-uuid",
      "type": "theme",
      "content": "This entry focuses on personal growth.",
      "confidence": 0.85
    },
    {
      "id": "insight-uuid-2",
      "entryId": "entry-uuid",
      "type": "pattern",
      "content": "You tend to write more about personal development in the morning.",
      "confidence": 0.75
    },
    {
      "id": "insight-uuid-3",
      "entryId": "entry-uuid",
      "type": "recommendation",
      "content": "Consider exploring your thoughts on career development in more detail.",
      "confidence": 0.65
    }
  ]
}
```

#### Get Insights for a Journal Entry
```http
GET /api/v1/entries/{entry-id}/insights
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "insight-uuid-1",
      "entryId": "entry-uuid",
      "type": "theme",
      "content": "This entry focuses on personal growth.",
      "confidence": 0.85,
      "createdAt": "2024-03-19T10:00:00Z"
    },
    {
      "id": "insight-uuid-2",
      "entryId": "entry-uuid",
      "type": "pattern",
      "content": "You tend to write more about personal development in the morning.",
      "confidence": 0.75,
      "createdAt": "2024-03-19T10:00:00Z"
    }
  ]
}
```

#### Get All User Insights
```http
GET /api/v1/insights?type=theme&timeRange=week
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "insight-uuid-1",
      "entryId": "entry-uuid",
      "type": "theme",
      "content": "This entry focuses on personal growth.",
      "confidence": 0.85,
      "createdAt": "2024-03-19T10:00:00Z",
      "entry": {
        "id": "entry-uuid",
        "title": "My Journal Entry",
        "createdAt": "2024-03-19T10:00:00Z"
      }
    }
  ]
}
```

#### Delete an Insight
```http
DELETE /api/v1/insights/{insight-id}
```

Response:
```json
{
  "success": true,
  "message": "Insight deleted successfully"
}
```

## Categories

### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Personal",
  "color": "#FF5733"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Personal",
    "color": "#FF5733",
    "createdAt": "2024-03-19T10:00:00Z"
  }
}
```

### Get Categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "name": "Personal",
      "color": "#FF5733",
      "createdAt": "2024-03-19T10:00:00Z",
      "_count": {
        "entries": 5
      }
    }
  ]
}
```

### Get Single Category
```http
GET /categories/{category-id}
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Personal",
    "color": "#FF5733",
    "createdAt": "2024-03-19T10:00:00Z",
    "entries": [
      {
        "id": "entry-uuid",
        "title": "My Entry",
        "createdAt": "2024-03-19T10:00:00Z"
      }
    ]
  }
}
```

### Update Category
```http
PUT /categories/{category-id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "color": "#33FF57"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Updated Name",
    "color": "#33FF57",
    "updatedAt": "2024-03-19T10:00:00Z"
  }
}
```

### Delete Category
```http
DELETE /categories/{category-id}
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

## Analytics

### Get User Analytics
```http
GET /analytics
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalEntries": 100,
    "totalWords": 15000,
    "averageWordsPerEntry": 150,
    "entriesByCategory": [
      {
        "category": "Personal",
        "count": 50
      },
      {
        "category": "Work",
        "count": 30
      }
    ],
    "entriesByMonth": [
      {
        "month": "2024-03",
        "count": 20
      }
    ],
    "writingStreak": {
      "currentStreak": 5,
      "longestStreak": 10
    }
  }
}
```

## Response Format
All API endpoints follow a consistent response format:

Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Codes
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
Currently, there are no rate limits implemented. However, it's recommended to implement reasonable request throttling in the client application to prevent overwhelming the server.

## Data Models

### Journal Entry
```typescript
{
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
  metadata: {
    wordCount: number;
    readingTime: number;
  };
}
```

### Category
```typescript
{
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  entries?: JournalEntry[];
  _count?: {
    entries: number;
  };
}
```

### User Profile
```typescript
{
  id: string;
  userId: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### AI Insight
```typescript
{
  id: string;
  entryId: string;
  userId: string;
  type: 'theme' | 'pattern' | 'recommendation';
  content: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  entry?: JournalEntry;
}
```

### Text Analysis
```typescript
{
  suggestions: {
    text: string;
    confidence: number;
    category: 'grammar' | 'style' | 'completion';
    replacement?: string;
    explanation?: string;
    context?: string;
  }[];
  autoCompletions: string[];
  writingStyle: {
    readability: number;
    complexity: number;
    suggestions: string[];
  };
}
```

## Development Setup
1. Ensure the server is running: `npm run dev`
2. Make sure PostgreSQL is running (via Docker): `docker-compose up -d`
3. The API will be available at `http://localhost:3000/api/v1` 