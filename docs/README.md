# Issue Tracker

A lightweight issue tracking system built with Next.js, Express.js, and PostgreSQL — similar to Jira/Linear.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 16 (via Docker) |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| API Tests | Jest + Supertest |
| UI Tests | Playwright |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

## Quick Start (One Command)

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up --build
```

This starts three services:
- PostgreSQL on port `5432`
- Backend API on port `4000`
- Frontend on port `3000`

Open `http://localhost:3000` in your browser.

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- Docker Desktop

### 1. Start the database
```bash
docker compose up db -d
```

### 2. Set up the backend
```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

Backend runs on `http://localhost:4000`

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Running Tests

### API Tests (Jest + Supertest)
```bash
cd backend
npm test
```

Runs 31 automated API tests covering auth, projects, and issues endpoints.

### UI Tests (Playwright)
Make sure both backend and frontend are running first, then:
```bash
cd frontend
npx playwright test --project=chromium --workers=1
```

Runs 8 automated UI tests covering login, project creation, issue creation, and status changes.

---

## Project Structure

```
issue-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Version-controlled migrations
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.js        # Prisma client singleton
│   │   │   └── logger.js        # Application logger
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.js          # Register, login
│   │   │   ├── projects.js      # Projects CRUD
│   │   │   ├── issues.js        # Issues CRUD + search/filter
│   │   │   └── health.js        # Health check
│   │   ├── __tests__/           # Jest + Supertest tests
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/page.js    # Dashboard with stats + project list
│   │   ├── login/page.js        # Login page
│   │   ├── register/page.js     # Register page
│   │   ├── projects/[id]/page.js # Project detail + issue list
│   │   └── layout.js
│   ├── lib/
│   │   └── api.js               # API client wrapper
│   ├── e2e/                     # Playwright tests
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── test-strategy.md         # Test strategy document
│   ├── ui-test-cases.md         # 20 UI test cases
│   ├── api-test-cases.md        # 20 API test cases
│   ├── bug-report-template.md   # Bug report template + examples
│   └── system-design.md         # Architecture + tradeoffs
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
└── docker-compose.yml
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /projects | Yes | List active projects |
| POST | /projects | Yes | Create project |
| GET | /projects/:id | Yes | Get project + issues |
| PATCH | /projects/:id | Yes | Edit name or archive |
| GET | /issues | Yes | List issues (filterable) |
| POST | /issues | Yes | Create issue |
| PATCH | /issues/:id | Yes | Update issue |
| DELETE | /issues/:id | Yes | Delete issue |

### Query Parameters for `GET /issues`
- `title` — search by title (case-insensitive, partial match)
- `status` — filter by status (`TODO`, `IN_PROGRESS`, `DONE`)
- `priority` — filter by priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `assigneeId` — filter by assignee user ID
- `projectId` — filter by project ID

---

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/issue_tracker?schema=public
PORT=4000
JWT_SECRET=your-secret-key-here
```

---

## Assumptions

The following assumptions were made where the specification was ambiguous:

1. **Project visibility**: Projects are only visible to their owner. The spec mentions an `Owner` field but doesn't specify whether projects are shared across users — assumed private to owner for simplicity and security.

2. **Issue authorization**: Any authenticated user can create and edit issues within any project. The spec doesn't specify fine-grained issue permissions beyond project ownership — assumed open collaboration within the system.

3. **Logout implementation**: JWT tokens cannot be invalidated server-side without a token blocklist. Logout is implemented client-side by removing the token from localStorage. A production implementation would use short-lived tokens + refresh tokens, or a Redis-based blocklist.

4. **Assignee scope**: Issues can only be assigned to users who exist in the system. There is no invitation or team membership concept — any registered user can be assigned to any issue.

5. **Archive vs Delete**: The spec mentions "archive project" but not "delete project." Archived projects are soft-deleted (hidden from the list, data preserved). Hard delete was not implemented to avoid orphaning issues.

6. **Dashboard issue counts**: The dashboard counts all issues across all of the user's projects (not just one project). "Open issues" includes both `TODO` and `IN_PROGRESS` statuses. "Completed" is `DONE` only.

7. **Search scope**: Title search applies across all issues (not scoped to a single project) when called from `GET /issues`. The project page filters client-side for UX responsiveness.

8. **Password minimum length**: Set to 8 characters — the spec says "password minimum length" without specifying the value. 8 characters is the widely accepted minimum for basic security.

9. **JWT expiry**: Set to 7 days. The spec requires JWT authentication but doesn't specify expiry. 7 days balances security (token rotation) with user convenience (not logging out constantly).

10. **Edit project name UI**: The backend supports editing project names via `PATCH /projects/:id`, but a dedicated edit UI was not implemented on the frontend due to time constraints. The API endpoint is fully functional and tested.
