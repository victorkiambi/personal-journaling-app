# Journal API Documentation

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

### Authentication Endpoints

#### Register
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

#### Login
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

### Journal Entries

#### Create Entry
```http
POST /entries
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My Journal Entry",
  "content": "Today was a great day...",
  "isPublic": false,
  "categoryIds": ["category-uuid-1", "category-uuid-2"]
}
```

#### Get Entries (with pagination and filters)
```http
GET /entries?page=1&pageSize=10&categoryId=category-uuid&startDate=2024-03-18&endDate=2024-03-19&search=keyword
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

#### Get Single Entry
```http
GET /entries/{entry-id}
Authorization: Bearer <token>
```

#### Update Entry
```http
PUT /entries/{entry-id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "Updated content...",
  "isPublic": true,
  "categoryIds": ["category-uuid-1"]
}
```

#### Delete Entry
```http
DELETE /entries/{entry-id}
Authorization: Bearer <token>
```

### Categories

#### Create Category
```http
POST /categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Personal",
  "color": "#FF5733",
  "description": "Personal journal entries",
  "parentId": "parent-category-uuid"
}
```

#### Get Categories
```http
GET /categories
Authorization: Bearer <token>
```

For hierarchical view:
```http
GET /categories?hierarchical=true
Authorization: Bearer <token>
```

#### Get Single Category
```http
GET /categories/{category-id}
Authorization: Bearer <token>
```

#### Update Category
```http
PUT /categories/{category-id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "color": "#33FF57",
  "description": "Updated description"
}
```

#### Delete Category
```http
DELETE /categories/{category-id}
Authorization: Bearer <token>
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
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
Currently, there are no rate limits implemented. However, it's recommended to implement reasonable request throttling in the React Native app to prevent overwhelming the server.

## Data Models

### Journal Entry
```typescript
{
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
  metadata: {
    wordCount: number;
    readingTime: number;
    sentimentScore?: number;
    location?: any;
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
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children: Category[];
  _count?: {
    entries: number;
  };
}
```

## Development Setup
1. Ensure the server is running: `npm run dev`
2. Make sure PostgreSQL is running (via Docker): `docker-compose up -d`
3. The API will be available at `http://localhost:3000/api/v1` 