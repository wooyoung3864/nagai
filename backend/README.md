# API Reference

## Authentication (`/auth`)

### POST /auth/google
Authenticate and register/login a user via a Supabase JWT.

**Request Body**
    {
      "access_token": "string"
    }

**Response**
    {
      "access_token": "string",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "google_id": "string",
        "email": "string",
        "full_name": "string",
        "created_at": "2023-01-01T00:00:00Z",
        "last_login": "2023-01-01T00:00:00Z"
      },
      "is_new": true
    }

---

## Users (`/users`)

### POST /users/
Register a new user (internal; normally handled by auth).

**Request Body**
    {
      "google_id": "string",
      "email": "string",
      "full_name": "string"
    }

**Response**
    {
      "id": 1,
      "google_id": "string",
      "email": "string",
      "full_name": "string",
      "created_at": "2023-01-01T00:00:00Z",
      "last_login": "2023-01-01T00:00:00Z"
    }

### POST /users/agree-terms
Agree to terms for a user.

**Request Body**
    {
      "user_id": 1
    }

**Response**
    (UserOut as above, with has_agreed_terms = true)

### POST /users/set-name
Set a user's full name.

**Request Body**
    {
      "user_id": 1,
      "full_name": "John Doe"
    }

**Response**
    (UserOut as above, with full_name and has_set_name = true)

---

## Sessions (`/sessions`)

### POST /sessions/
Start a new session.

**Request Body**
    {
      "type": "FOCUS",        // or "BREAK"
      "access_token": "string"
    }

**Response**
    {
      "id": 1,
      "type": "FOCUS",
      "start_time": "2023-01-01T00:00:00Z",
      "end_time": null,
      "status": "RUNNING",
      "focus_secs": 0,
      "avg_score": null
    }

### PATCH /sessions/{sid}/update
Update a session's status and optional fields.

**Query Parameters**
    status: "RUNNING" | "PAUSED" | "STOPPED" | "COMPLETED"
    focus_secs: integer (optional)
    avg_score: float (optional)

**Request Body**
    {
      "access_token": "string"
    }

**Response**
    (SessionOut as above; updated fields)

### POST /sessions/monthly-focus-summary
Returns daily summed focus_secs for the specified month.

**Request Body**
    {
      "year": 2025,
      "month": 5,
      "access_token": "string"
    }

**Response**
    [
      { "day": "2025-05-01", "total_focus_secs": 1234 },
      ...
    ]

### POST /sessions/by-day
Return all sessions for a specific date.

**Request Body**
    {
      "date": "2025-05-21",
      "access_token": "string"
    }

**Response**
    [
      (SessionOut as above), ...
    ]

---

## Distractions (`/distractions`)

### POST /distractions/
Add a new distraction event.

**Request Body**
    {
      "session_id": 1,
      "timestamp": "2023-01-01T01:23:45Z",
      "focus_score": 75,
      "is_focused": false,
      "observed_behaviors": ["looking_away"],
      "explanation": "user looked away",
      "snapshot_url": "https://...",
      "access_token": "string"
    }

**Response**
    {
      "id": 1,
      "user_id": 1,
      "session_id": 1,
      "timestamp": "2023-01-01T01:23:45Z",
      "focus_score": 75,
      "is_focused": false,
      "observed_behaviors": ["looking_away"],
      "explanation": "user looked away",
      "snapshot_url": "https://..."
    }

### POST /distractions/query
Query distraction events for the authenticated user (typically for unfocused events).

**Request Body**
    {
      "access_token": "string",
      "user_id": 1,
      "start": "2025-05-20T00:00:00Z", // optional
      "end":   "2025-05-21T00:00:00Z"  // optional
    }

**Response**
    [
      (DistractionOut as above), ...
    ]

---

## Secrets (`/admin/secrets`)

### POST /admin/secrets/
Store or update a secret key for a given service.

**Request Body**
    {
      "service": "gemini",
      "plaintext_key": "abc123",
      "key_name": "default"
    }

**Response**
    {
      "id": 1,
      "service": "gemini",
      "key_name": "default",
      "created_at": "2025-05-21T15:23:45Z",
      "updated_at": "2025-05-21T15:23:45Z"
    }

### POST /admin/secrets/retrieve
Retrieve a secret key value (decrypted).

**Request Body**
    {
      "service": "gemini",
      "key_name": "default"
    }

**Response**
    "abc123"

### POST /admin/secrets/frontend-env
Return selected secrets as environment variables.

**Request Body**
    [
      "gemini.default",
      "supabase.key"
    ]

**Response**
    {
      "GEMINI_DEFAULT": "abc123",
      "SUPABASE_KEY": "xyz456"
    }
