# opennoteserver

This is a half-assed attempt to turn X's community notes into a Bun.sh server. It's basically compatible with any service you can think of as it works with your own data structure.

## API Documentation

### Delete a Vote

**Endpoint:** `DELETE /api/votes`

**Query Parameters:**
- `noteId` (string): The ID of the note.
- `userId` (string): The ID of the user.

**Response:**
- `200 OK`: `{ success: true }`
- `400 Bad Request`: `{ success: false, error: "Vote not found." }`

### Delete a Note

**Endpoint:** `DELETE /api/votes`

**Query Parameters:**
- `noteId` (string): The ID of the note.

**Response:**
- `200 OK`: `{ success: true }`
- `400 Bad Request`: `{ success: false, error: "Note not found." }`

### Create a Note

**Endpoint:** `POST /api/notes`

**Query Parameters:**
- `postId` (string): The ID of the post.
- `userId` (string): The ID of the user.
- `text` (string): The text of the note.

**Response:**
- `200 OK`: `{ success: true, ...note }`
- `400 Bad Request`: `{ success: false, error: "Validation error." }`

### Create or Update a Vote

**Endpoint:** `POST /api/votes`

**Query Parameters:**
- `noteId` (string): The ID of the note.
- `userId` (string): The ID of the user.
- `score` (number): The score of the vote (must be either 0 (not helpful), 0.5 (somewhat helpful), or 1 (helpful))
- `forceValid` (any): Force the vote to be valid (optional). Put anything here for it to be valid.

**Response:**
- `200 OK`: `{ success: true, ...record }`
- `400 Bad Request`: `{ success: false, error: "Validation error." }`

### Get Notes for a Post

**Endpoint:** `GET /api/getNotesForPost/:id`

**Path Parameters:**
- `id` (string): The ID of the post.

**Response:**
- `200 OK`: `[{ ...note, ratings: [...], score: number, status: string }]`

## Running the Server

To run the server, use the following command:

```sh
bun index.js
```