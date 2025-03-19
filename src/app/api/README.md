# API Documentation

## Overview

The Shamiri Journal API is built using Next.js API Routes and follows RESTful principles. All endpoints are protected with authentication except for the authentication endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response**: User object with token

#### Login
- **POST** `/auth/login`
- **Description**: Login user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object with token

#### Get Current User
- **GET** `/auth/me`
- **Description**: Get current user information
- **Response**: User object

### Journal Entries

#### List Entries
- **GET** `/entries`
- **Description**: Get paginated list of journal entries
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `pageSize`: Items per page (default: 10)
  - `categoryId`: Filter by category
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
  - `search`: Search query
- **Response**: Paginated entries with metadata

#### Get Entry
- **GET** `/entries/:id`
- **Description**: Get single journal entry
- **Response**: Entry object

#### Create Entry
- **POST** `/entries`
- **Description**: Create new journal entry
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "categoryIds": ["string"]
  }
  ```
- **Response**: Created entry object

#### Update Entry
- **PUT** `/entries/:id`
- **Description**: Update journal entry
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "categoryIds": ["string"]
  }
  ```
- **Response**: Updated entry object

#### Delete Entry
- **DELETE** `/entries/:id`
- **Description**: Delete journal entry
- **Response**: Success message

### Categories

#### List Categories
- **GET** `/categories`
- **Description**: Get all categories
- **Response**: Array of category objects

#### Get Category
- **GET** `/categories/:id`
- **Description**: Get single category
- **Response**: Category object

#### Create Category
- **POST** `/categories`
- **Description**: Create new category
- **Request Body**:
  ```json
  {
    "name": "string",
    "color": "string"
  }
  ```
- **Response**: Created category object

#### Update Category
- **PUT** `/categories/:id`
- **Description**: Update category
- **Request Body**:
  ```json
  {
    "name": "string",
    "color": "string"
  }
  ```
- **Response**: Updated category object

#### Delete Category
- **DELETE** `/categories/:id`
- **Description**: Delete category
- **Response**: Success message

### Analytics

#### Get Analytics
- **GET** `/analytics`
- **Description**: Get user analytics
- **Query Parameters**:
  - `startDate`: Start date for analytics
  - `endDate`: End date for analytics
  - `categoryId`: Filter by category
  - `timeRange`: Time range for analytics (day, week, month, year)
- **Response**: Analytics data object

### User Management

#### Get Profile
- **GET** `/users/profile`
- **Description**: Get user profile
- **Response**: Profile object

#### Update Profile
- **PUT** `/users/profile`
- **Description**: Update user profile
- **Request Body**:
  ```json
  {
    "bio": "string",
    "location": "string",
    "website": "string"
  }
  ```
- **Response**: Updated profile object

#### Get Settings
- **GET** `/users/settings`
- **Description**: Get user settings
- **Response**: Settings object

#### Update Settings
- **PUT** `/users/settings`
- **Description**: Update user settings
- **Request Body**:
  ```json
  {
    "theme": "string",
    "emailNotifications": boolean
  }
  ```
- **Response**: Updated settings object

#### Change Password
- **POST** `/users/change-password`
- **Description**: Change user password
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**: Success message

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string",
  "message": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Versioning

The API is versioned through the URL path. The current version is v1.

## OpenAPI Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/swagger
```

## Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs) 