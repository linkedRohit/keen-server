
# API Documentation for Frontend (AI Studio)

## Overview
This backend provides secure storage and LLM processing. 
Authentication is handled via Supabase (Email Magic Link). 
YOU MUST AUTHENTICATE via Supabase Client on the frontend before calling these APIs.

## Authentication
1. **Frontend**: Use Supabase Auth UI or JS Client to sign in.
2. **Token**: When making API calls, Next.js Middleware automatically handles session via cookies if on the same domain. If cross-domain, ensure you send the `sb-access-token` header or relevant cookies. 
   *(Note: Since this is a "THIN backend" for a "Frontend built using Google AI Studio", if the frontend is hosted separately (e.g., in AI Studio's preview or a different Vercel app), you might need to handle CORS and cookie logic carefully. Standard assumption: Frontend and Backend share the domain or use valid cross-site cookie settings).*

## Endpoints

### 1. Create Person
- **Endpoint**: `POST /api/person`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Barack Obama",
    "persona_tags": ["leader", "chill"]
  }
  ```
- **Response**: Created Person object

### 2. Create Meeting
- **Endpoint**: `POST /api/person`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "person_id": "uuid-here",
    "title": "Coffee Chat",
    "meeting_time": "2023-10-27T10:00:00Z",
    "reflection_text": "Talked about the future of AI..."
  }
  ```
- **Response**: Created Meeting object

### 3. Generate Insight (LLM)
- **Endpoint**: `POST /api/insight`
- **Body**:
  ```json
  {
    "person_id": "uuid-here",
    "meeting_id": "uuid-here",
    "reflection_text": "Same text as above (or refined)" 
  }
  ```
- **Behavior**: Calls backend LLM, saves result to DB.
- **Response**: 
  ```json
  {
    "success": true,
    "insight": { ... }
  }
  ```

### 4. Get Meeting Details
- **Endpoint**: `GET /api/meeting/:id`
- **Response**: Meeting object + `insights` array + `people` object.

### 5. Get Upcoming Meetings
- **Endpoint**: `GET /api/upcoming`
- **Response**: List of future meetings.

## Error Handling
All endpoints return standard HTTP codes:
- 401: Unauthorized (Not logged in)
- 400: Bad Request (Missing fields)
- 404: Not Found (or access denied by RLS)
- 500: Internal Server Error

## Setup
1. Run SQL from `supabase_schema.sql` in Supabase SQL Editor.
2. Set Environment Variables in `.env.local` or Vercel.
