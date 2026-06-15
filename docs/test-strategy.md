# Test Strategy Document — Mini Issue Tracking System

## 1. Functional Testing — What Should Be Tested?

### Authentication
- User can register with valid name, email, and password.
- Registration is rejected for invalid email formats (e.g. missing `@`, no domain).
- Registration is rejected for passwords below the minimum length.
- Registration is rejected when the email already exists in the system.
- Passwords are stored as hashes, never in plain text.
- User can log in with correct credentials and receives a valid session/JWT.
- Login is rejected with incorrect email or password (without revealing which one is wrong).
- Logout invalidates the session/token so it can no longer access protected routes.
- Protected routes (projects, issues) reject requests without a valid token/session.

### Projects
- A logged-in user can create a project with a name and description.
- Project creation fails if the name is missing or empty.
- Project creation fails if the name already exists (per the error example in the spec).
- A user can view a list of their projects.
- A user can view a single project's details (name, description, created at, owner).
- A user can edit a project's name, and the change persists.
- A user can archive a project, and archived projects are excluded from the active project list (but not deleted).
- A user cannot edit or archive a project they do not own (authorization check).

### Issues
- A user can create an issue within a project with title, description, priority, and status.
- Issue creation fails if the title is missing.
- Default status on creation is "Todo" (or as documented).
- A user can edit issue fields (title, description, priority, status, assignee).
- A user can delete an issue, and it no longer appears in the issue list.
- A user can assign an issue to a valid user; assigning to a non-existent user is rejected.
- A user can change an issue's status across all valid transitions (Todo → In Progress → Done, and any reverse transitions if allowed).
- Status and priority values are restricted to the allowed enums (Todo/In Progress/Done; Low/Medium/High/Critical) — invalid values are rejected.
- `Created At` is set automatically on creation and never changes; `Updated At` changes on every edit.

### Search & Filters
- Searching by title returns issues containing the search term (case-insensitive, partial match).
- Searching with no matches returns an empty result, not an error.
- Filtering by status returns only issues with that status.
- Filtering by priority returns only issues with that priority.
- Filtering by assignee returns only issues assigned to that user.
- Combined filters (e.g. status + priority) return the intersection of results, not the union.

### Frontend
- Dashboard accurately displays total projects, total issues, open issues, and completed issues, and updates when underlying data changes.
- Project page shows correct project details, issue list, and filter controls.
- Issue form performs client-side validation (e.g. required title) before submission and shows clear error messages.

---

## 2. API Testing — What Endpoints Need Validation?

| Endpoint | Validation Needed |
|---|---|
| `POST /auth/register` | Required fields present; email format; password length; duplicate email rejected; password hashed in storage |
| `POST /auth/login` | Correct credential check; invalid credentials return generic error; token/session issued on success |
| `POST /auth/logout` | Token/session invalidated; subsequent requests with old token are rejected |
| `GET /projects` | Returns only projects belonging to (or visible to) the requesting user; requires authentication |
| `POST /projects` | Required fields validated; duplicate name rejected; owner set to authenticated user; unauthenticated request rejected |
| `PATCH /projects/:id` (edit/archive) | Only the owner can edit; non-existent project ID returns 404; invalid field values rejected |
| `GET /issues` | Supports query params for search/filter (title, status, priority, assignee); requires authentication |
| `POST /issues` | Required fields validated; status/priority restricted to enum values; project ID must exist; unauthenticated request rejected |
| `PATCH /issues/:id` | Partial updates work correctly; invalid status/priority values rejected; non-existent issue returns 404; only authorized users can edit |
| `DELETE /issues/:id` | Issue is removed; non-existent ID returns 404; only authorized users can delete; deleting twice returns appropriate error (not a crash) |

Cross-cutting validations for **every** endpoint:
- Missing/invalid auth token returns 401, not 500.
- Malformed JSON body returns 400 with a meaningful error message (matching the `{"error": "..."}` format from the spec).
- SQL injection attempts in inputs (e.g. `' OR 1=1`) do not bypass auth or expose data.
- Response status codes match REST conventions (200/201/400/401/403/404).

---

## 3. Regression Testing — What Areas Are High Risk?

These areas should be re-tested after any change, because they're either central to the system or frequently touched:

- **Authentication flow** — almost every other feature depends on a valid session/token. A regression here breaks the entire app.
- **Issue status transitions** — central to the "tracker" use case; bugs here directly affect dashboard counts (open vs. completed issues).
- **Project-issue relationship** — issues belong to projects; archiving a project or deleting it should not silently break or orphan issues.
- **Search and filter combinations** — these involve query-building logic that's easy to break with small backend changes (e.g. adding a new filter could break existing ones).
- **Dashboard aggregate counts** — derived data that must stay in sync with underlying issue/project changes; easy to miss when CRUD logic changes.
- **Authorization checks** — any change to ownership or assignment logic risks exposing or blocking access incorrectly.

---

## 4. Risk Analysis — What Could Fail in Production?

| Risk | Impact | Likelihood | Notes |
|---|---|---|---|
| Plaintext or weak password storage | High | Medium | Must verify hashing (e.g. bcrypt) is actually applied, not just claimed |
| JWT not expiring or not invalidated on logout | High | Medium | Could allow indefinite access with a stolen token |
| Missing backend validation (relying on frontend only) | High | High | Spec explicitly calls this out; attacker can bypass UI entirely |
| SQL injection via unsanitized inputs | High | Medium | Especially in search/filter query params |
| Race conditions on concurrent issue edits | Medium | Low | Two users editing the same issue could overwrite each other's changes silently |
| Incorrect authorization (user A edits user B's project) | High | Medium | Needs explicit ownership checks on every write operation |
| Dashboard counts drifting from actual data | Medium | Medium | If counts are cached or computed incorrectly after delete/archive |
| Poor error messages leaking stack traces or internals | Medium | Medium | Could expose database structure to attackers |
| Duplicate project name check failing under concurrent creation | Low | Low | Edge case, but spec explicitly mentions this error |
| Search performance degrading with large datasets | Medium | Low (at small scale) | Becomes relevant at the 10k–1M user scaling discussion |
