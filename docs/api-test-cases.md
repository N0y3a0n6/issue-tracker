# API Test Cases — Mini Issue Tracking System

## Test Case Format
- **TC ID**: Unique identifier
- **Endpoint**: HTTP method + path
- **Description**: What is being tested
- **Request**: Method, headers, body
- **Expected Response**: Status code + body
- **Type**: Positive / Negative / Edge

---

## Authentication

### TC-API-01 — Register with Valid Data
- **Type**: Positive
- **Endpoint**: `POST /auth/register`
- **Request Body**: `{ "name": "Alice", "email": "alice@example.com", "password": "password123" }`
- **Expected Response**:
  - Status: `201 Created`
  - Body contains: `id`, `name`, `email`, `createdAt`
  - Body does NOT contain: `passwordHash`

---

### TC-API-02 — Register with Missing Fields
- **Type**: Negative
- **Endpoint**: `POST /auth/register`
- **Request Body**: `{ "email": "alice@example.com" }` (missing name and password)
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Name, email, and password are required" }`

---

### TC-API-03 — Register with Invalid Email Format
- **Type**: Negative
- **Endpoint**: `POST /auth/register`
- **Request Body**: `{ "name": "Alice", "email": "not-an-email", "password": "password123" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Invalid email format" }`

---

### TC-API-04 — Register with Short Password
- **Type**: Edge
- **Endpoint**: `POST /auth/register`
- **Request Body**: `{ "name": "Alice", "email": "alice@example.com", "password": "123" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body contains error about minimum password length

---

### TC-API-05 — Register with Duplicate Email
- **Type**: Negative
- **Endpoint**: `POST /auth/register`
- **Preconditions**: User with "alice@example.com" already exists
- **Request Body**: `{ "name": "Alice2", "email": "alice@example.com", "password": "password123" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Email already registered" }`

---

### TC-API-06 — Login with Valid Credentials
- **Type**: Positive
- **Endpoint**: `POST /auth/login`
- **Request Body**: `{ "email": "alice@example.com", "password": "password123" }`
- **Expected Response**:
  - Status: `200 OK`
  - Body contains: `token` (JWT string), `user.id`, `user.email`

---

### TC-API-07 — Login with Wrong Password
- **Type**: Negative
- **Endpoint**: `POST /auth/login`
- **Request Body**: `{ "email": "alice@example.com", "password": "wrongpassword" }`
- **Expected Response**:
  - Status: `401 Unauthorized`
  - Body: `{ "error": "Invalid email or password" }` (generic — does not reveal which field is wrong)

---

### TC-API-08 — Login with Non-existent Email
- **Type**: Negative
- **Endpoint**: `POST /auth/login`
- **Request Body**: `{ "email": "nobody@example.com", "password": "password123" }`
- **Expected Response**:
  - Status: `401 Unauthorized`
  - Body: `{ "error": "Invalid email or password" }` (same error as wrong password)

---

### TC-API-09 — Access Protected Route Without Token
- **Type**: Negative
- **Endpoint**: `GET /projects`
- **Headers**: None
- **Expected Response**:
  - Status: `401 Unauthorized`
  - Body: `{ "error": "No token provided" }`

---

### TC-API-10 — Access Protected Route With Invalid Token
- **Type**: Negative
- **Endpoint**: `GET /projects`
- **Headers**: `Authorization: Bearer notavalidtoken`
- **Expected Response**:
  - Status: `401 Unauthorized`
  - Body: `{ "error": "Invalid or expired token" }`

---

## Projects

### TC-API-11 — Create Project with Valid Data
- **Type**: Positive
- **Endpoint**: `POST /projects`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "name": "My Project", "description": "A description" }`
- **Expected Response**:
  - Status: `201 Created`
  - Body contains: `id`, `name`, `description`, `isArchived: false`, `ownerId`

---

### TC-API-12 — Create Project with Empty Name
- **Type**: Negative
- **Endpoint**: `POST /projects`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "name": "" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Project name is required" }`

---

### TC-API-13 — Create Project with Duplicate Name
- **Type**: Negative
- **Endpoint**: `POST /projects`
- **Preconditions**: Project named "My Project" already exists
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "name": "My Project" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Project name already exists" }`

---

### TC-API-14 — Get Projects List (excludes archived)
- **Type**: Positive
- **Endpoint**: `GET /projects`
- **Preconditions**: Two projects exist, one is archived
- **Headers**: `Authorization: Bearer <valid_token>`
- **Expected Response**:
  - Status: `200 OK`
  - Body: Array containing only the non-archived project

---

### TC-API-15 — Archive a Project
- **Type**: Positive
- **Endpoint**: `PATCH /projects/:id`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "isArchived": true }`
- **Expected Response**:
  - Status: `200 OK`
  - Body: `{ ..., "isArchived": true }`

---

## Issues

### TC-API-16 — Create Issue with Valid Data
- **Type**: Positive
- **Endpoint**: `POST /issues`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "title": "Fix bug", "projectId": 1 }`
- **Expected Response**:
  - Status: `201 Created`
  - Body contains: `id`, `title`, `status: "TODO"`, `priority: "MEDIUM"`, `createdAt`, `updatedAt`

---

### TC-API-17 — Create Issue with Missing Title
- **Type**: Negative
- **Endpoint**: `POST /issues`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "projectId": 1 }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body: `{ "error": "Issue title is required" }`

---

### TC-API-18 — Create Issue with Invalid Priority
- **Type**: Edge
- **Endpoint**: `POST /issues`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Request Body**: `{ "title": "Fix bug", "projectId": 1, "priority": "URGENT" }`
- **Expected Response**:
  - Status: `400 Bad Request`
  - Body contains error about invalid priority value

---

### TC-API-19 — Filter Issues by Status
- **Type**: Positive
- **Endpoint**: `GET /issues?status=TODO`
- **Preconditions**: Issues exist with different statuses
- **Headers**: `Authorization: Bearer <valid_token>`
- **Expected Response**:
  - Status: `200 OK`
  - Body: Array containing only issues with `status: "TODO"`

---

### TC-API-20 — Delete Non-existent Issue
- **Type**: Edge
- **Endpoint**: `DELETE /issues/99999`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Expected Response**:
  - Status: `404 Not Found`
  - Body: `{ "error": "Issue not found" }`

---

## Summary

| TC ID | Endpoint | Description | Type |
|---|---|---|---|
| TC-API-01 | POST /auth/register | Register with valid data | Positive |
| TC-API-02 | POST /auth/register | Missing required fields | Negative |
| TC-API-03 | POST /auth/register | Invalid email format | Negative |
| TC-API-04 | POST /auth/register | Password too short | Edge |
| TC-API-05 | POST /auth/register | Duplicate email | Negative |
| TC-API-06 | POST /auth/login | Valid credentials | Positive |
| TC-API-07 | POST /auth/login | Wrong password | Negative |
| TC-API-08 | POST /auth/login | Non-existent email | Negative |
| TC-API-09 | GET /projects | No auth token | Negative |
| TC-API-10 | GET /projects | Invalid token | Negative |
| TC-API-11 | POST /projects | Valid project creation | Positive |
| TC-API-12 | POST /projects | Empty project name | Negative |
| TC-API-13 | POST /projects | Duplicate project name | Negative |
| TC-API-14 | GET /projects | Excludes archived projects | Positive |
| TC-API-15 | PATCH /projects/:id | Archive a project | Positive |
| TC-API-16 | POST /issues | Valid issue creation | Positive |
| TC-API-17 | POST /issues | Missing title | Negative |
| TC-API-18 | POST /issues | Invalid priority value | Edge |
| TC-API-19 | GET /issues?status=TODO | Filter by status | Positive |
| TC-API-20 | DELETE /issues/99999 | Delete non-existent issue | Edge |
