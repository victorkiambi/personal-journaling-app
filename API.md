# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All API endpoints (except login and register) require authentication using JWT tokens.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": {
      "bio": "Software developer",
      "location": "New York"
    },
    "settings": {
      "theme": "light",
      "emailNotifications": true
    }
  }
}
```

### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
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

## User Management

### Get User Profile
```http
GET /users/me
Authorization: Bearer <token>
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

### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
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

## Development Setup
1. Ensure the server is running: `npm run dev`
2. Make sure PostgreSQL is running (via Docker): `docker-compose up -d`
3. The API will be available at `http://localhost:3000/api/v1` 