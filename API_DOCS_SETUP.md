# API Documentation Setup

## What was done:

### 1. Simplified API Documentation

- **Removed** multiple API docs pages (interactive, full, swagger)
- **Kept only one** main API documentation at `/api-docs`
- Uses SwaggerUI for complete interactive API documentation with schemas and examples

### 2. New Token Endpoint

Created `/api/auth/token` endpoint for getting Supabase authentication tokens:

#### GET `/api/auth/token`

- **Purpose**: Get current user's token from active session
- **Response**: Returns access_token, refresh_token, user info, and usage instructions
- **Usage**: Must be logged in first

#### POST `/api/auth/token`

- **Purpose**: Login with email/password and get token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as GET, returns tokens and instructions

### 3. Token Usage Instructions

The token endpoint returns:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "user": { "id": "...", "email": "...", "username": "..." },
  "instructions": {
    "usage": "Copy the access_token and use it as Bearer token in Authorization header",
    "example": "Authorization: Bearer eyJ...",
    "expires": "2025-09-28T..."
  }
}
```

### 4. Updated Swagger Documentation

- Added `/auth/token` endpoint to swagger.json
- Added schemas for `LoginRequest` and `TokenResponse`
- Updated both root and public swagger.json files

## How to use:

### For Development/Testing:

1. Visit `http://localhost:3000/api-docs` for complete API documentation
2. Use the `/auth/token` endpoint to get authentication tokens
3. Copy the `access_token` from the response
4. Use it in Authorization header: `Authorization: Bearer <token>`

### For Authentication Flow:

1. **Option 1**: If already logged in, call `GET /api/auth/token`
2. **Option 2**: Call `POST /api/auth/token` with email/password
3. Copy the returned `access_token`
4. Use it for authenticated API calls

The token endpoint is specifically designed to make it easy to get authentication tokens for API testing and development purposes.
