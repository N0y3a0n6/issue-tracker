# System Design Document — Mini Issue Tracking System

## 1. Architecture Overview

The application follows a standard three-tier architecture:

```
┌─────────────────┐       HTTP/REST        ┌─────────────────┐       Prisma ORM      ┌─────────────────┐
│   Next.js 14    │ ─────────────────────▶ │  Express.js API │ ────────────────────▶ │   PostgreSQL 16  │
│   (Frontend)    │ ◀───────────────────── │   (Backend)     │ ◀──────────────────── │   (Database)    │
│   Port 3000     │       JSON responses   │   Port 4000     │     SQL queries       │   Port 5432     │
└─────────────────┘                        └─────────────────┘                        └─────────────────┘
```

### Frontend (Next.js 14)
- Renders the UI using React components with the App Router pattern
- Communicates with the backend exclusively via HTTP REST calls (never directly to the database)
- Stores the JWT token in `localStorage` for authenticated requests
- Runs client-side validation before submitting forms

### Backend (Node.js + Express.js)
- Stateless REST API server handling all business logic
- Validates all incoming requests independently of the frontend
- Issues and verifies JWT tokens for authentication
- Uses Prisma ORM to interact with PostgreSQL — no raw SQL
- Logs all significant actions (user login, issue created, project archived) to stdout

### Database (PostgreSQL 16)
- Single relational database with three core tables: `User`, `Project`, `Issue`
- Enforces data integrity via foreign keys, unique constraints, and enum types
- Managed via Prisma migrations — schema changes are version-controlled

---

## 2. Database Schema

```
User
├── id (PK, autoincrement)
├── name
├── email (UNIQUE)
├── passwordHash
└── createdAt

Project
├── id (PK, autoincrement)
├── name (UNIQUE)
├── description (nullable)
├── isArchived (default: false)
├── createdAt
└── ownerId (FK → User.id)

Issue
├── id (PK, autoincrement)
├── title
├── description (nullable)
├── priority (enum: LOW, MEDIUM, HIGH, CRITICAL)
├── status (enum: TODO, IN_PROGRESS, DONE)
├── createdAt
├── updatedAt (auto-updated)
├── projectId (FK → Project.id)
└── assigneeId (FK → User.id, nullable)
```

---

## 3. API Design

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login, returns JWT | No |
| GET | /projects | List user's projects | Yes |
| POST | /projects | Create project | Yes |
| GET | /projects/:id | Get project + issues | Yes |
| PATCH | /projects/:id | Edit/archive project | Yes |
| GET | /issues | List issues (with filters) | Yes |
| POST | /issues | Create issue | Yes |
| PATCH | /issues/:id | Update issue | Yes |
| DELETE | /issues/:id | Delete issue | Yes |

---

## 4. Tradeoffs & Decisions

### Why REST instead of GraphQL?
REST was chosen because:
- The data requirements are simple and predictable — no complex nested queries needed
- REST is easier to test with standard tools (curl, Supertest, Postman)
- REST has better tooling support for caching and HTTP semantics (status codes, methods)
- GraphQL adds complexity (schema, resolvers, N+1 problem) without benefit at this scale

### Why PostgreSQL instead of MySQL or SQLite?
- PostgreSQL is specified as "preferred" in the assessment
- PostgreSQL supports native enum types, which map cleanly to our `Status` and `Priority` fields
- PostgreSQL has better support for complex queries and JSON if the app evolves
- SQLite is not suitable for concurrent multi-user access in production
- Prisma has first-class PostgreSQL support

### Why JWT instead of Sessions?
- JWTs are stateless — the server doesn't need to store session data in the database or cache
- This makes horizontal scaling easier (any server can verify any token without shared state)
- JWTs are self-contained — the token carries the user's ID and email, reducing database lookups
- Tradeoff: JWTs cannot be invalidated server-side before expiry (mitigated with short expiry: 7 days)

### Why Prisma instead of raw SQL or other ORMs?
- Prisma generates a type-safe client from the schema, reducing bugs from typos in SQL
- Prisma migrations provide version-controlled, reproducible schema changes
- Prisma's query API is readable and intuitive for developers new to SQL
- Tradeoff: Prisma adds a layer of abstraction that can hide performance issues in complex queries

### Why Next.js instead of plain React?
- Next.js provides file-based routing out of the box (no react-router setup needed)
- App Router pattern provides clear separation between server and client components
- Tradeoff: Next.js adds build complexity vs a plain Vite/React app

---

## 5. Security Measures

- **Password hashing**: bcrypt with cost factor 10 — passwords are never stored in plain text
- **JWT authentication**: All protected routes require a valid, non-expired JWT
- **Authorization**: Ownership is checked on all write operations (users can only modify their own projects)
- **Input validation**: All inputs are validated on the backend regardless of frontend validation
- **SQL injection prevention**: Prisma uses parameterized queries — raw user input is never interpolated into SQL
- **Generic auth errors**: Login returns "Invalid email or password" for both wrong password and unknown email, preventing user enumeration attacks

---

## 6. Scaling Discussion

### 100 Users
Current architecture handles this comfortably with no changes needed. A single server, single database, and single Next.js instance is more than sufficient.

### 10,000 Users
At this scale, the following changes would be needed:
- **Database connection pooling**: Add PgBouncer or use Prisma Accelerate to manage database connections efficiently (PostgreSQL has a default limit of ~100 connections)
- **Caching**: Add Redis to cache frequently read data (project lists, dashboard stats) to reduce database load
- **Environment separation**: Separate staging and production environments with their own databases
- **Process manager**: Use PM2 or a container orchestrator to run multiple backend instances behind a load balancer
- **Structured logging**: Replace `console.log` with a structured logger (Winston, Pino) that outputs JSON, integrates with log aggregation (Datadog, CloudWatch)

### 1,000,000 Users
At this scale, the architecture changes significantly:
- **Horizontal scaling**: Multiple backend instances behind a load balancer (AWS ALB, Nginx). JWTs make this straightforward since there's no shared session state.
- **Database read replicas**: Primary PostgreSQL instance for writes, read replicas for GET requests. Prisma supports this via `$replicaClient`.
- **CDN**: Static frontend assets served from a CDN (CloudFront, Vercel Edge) to reduce server load
- **Search service**: Replace `ILIKE` title search with Elasticsearch or Typesense for fast full-text search at scale
- **Message queue**: Use a queue (RabbitMQ, SQS) for async tasks like sending email notifications on issue assignment
- **Database sharding**: At extreme scale, shard data by organization/workspace to distribute load across multiple database instances
- **Microservices consideration**: Split auth, projects, and issues into separate services with their own databases if team size and deployment frequency justify the complexity

---

## 7. DevOps

### Local Development
```bash
docker compose up    # starts PostgreSQL
cd backend && npm run dev   # starts API on :4000
cd frontend && npm run dev  # starts UI on :3000
```

### Docker
Each service has its own Dockerfile. `docker-compose.yml` at the root orchestrates all three services (db, backend, frontend) with a single command:
```bash
docker compose up --build
```

### CI/CD (GitHub Actions)
On every push/PR to `main`:
1. Backend job: install deps → generate Prisma client → run migrations → run Jest tests
2. Frontend job: install deps → lint → build
Both jobs run in parallel. A failed backend test blocks merging.
