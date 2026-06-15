# UI Test Cases — Mini Issue Tracking System

## Test Case Format
- **TC ID**: Unique identifier
- **Title**: What is being tested
- **Preconditions**: What must be true before the test
- **Steps**: Exact actions to perform
- **Expected Result**: What should happen
- **Type**: Positive / Negative / Edge

---

## Authentication

### TC-UI-01 — Successful User Registration
- **Type**: Positive
- **Preconditions**: User is not logged in, email does not exist in system
- **Steps**:
  1. Navigate to `/register`
  2. Enter valid name: "Alice Smith"
  3. Enter valid email: "alice@example.com"
  4. Enter valid password: "password123"
  5. Click "Create account"
- **Expected Result**: User is redirected to `/login` page

---

### TC-UI-02 — Successful Login
- **Type**: Positive
- **Preconditions**: User is registered with email "alice@example.com" / password "password123"
- **Steps**:
  1. Navigate to `/login`
  2. Enter email: "alice@example.com"
  3. Enter password: "password123"
  4. Click "Sign in"
- **Expected Result**: User is redirected to `/dashboard`. Token is saved in localStorage.

---

### TC-UI-03 — Login with Wrong Password
- **Type**: Negative
- **Preconditions**: User is registered with email "alice@example.com"
- **Steps**:
  1. Navigate to `/login`
  2. Enter email: "alice@example.com"
  3. Enter password: "wrongpassword"
  4. Click "Sign in"
- **Expected Result**: Error message "Invalid email or password" is displayed. User remains on login page.

---

### TC-UI-04 — Login with Non-existent Email
- **Type**: Negative
- **Preconditions**: None
- **Steps**:
  1. Navigate to `/login`
  2. Enter email: "nobody@example.com"
  3. Enter password: "password123"
  4. Click "Sign in"
- **Expected Result**: Error message "Invalid email or password" is displayed (same message as wrong password — no enumeration).

---

### TC-UI-05 — Registration with Invalid Email Format
- **Type**: Negative
- **Preconditions**: None
- **Steps**:
  1. Navigate to `/register`
  2. Enter name: "Bob"
  3. Enter email: "not-an-email"
  4. Enter password: "password123"
  5. Click "Create account"
- **Expected Result**: Browser or app prevents submission. Error shown about invalid email format.

---

### TC-UI-06 — Registration with Short Password
- **Type**: Edge
- **Preconditions**: None
- **Steps**:
  1. Navigate to `/register`
  2. Enter name: "Bob"
  3. Enter valid email: "bob@example.com"
  4. Enter password: "123" (less than 8 characters)
  5. Click "Create account"
- **Expected Result**: Error message shown about minimum password length. Account is not created.

---

### TC-UI-07 — Logout
- **Type**: Positive
- **Preconditions**: User is logged in on dashboard
- **Steps**:
  1. Click "Logout" in the header
- **Expected Result**: User is redirected to `/login`. Token is removed from localStorage.

---

### TC-UI-08 — Unauthenticated Access to Dashboard
- **Type**: Negative
- **Preconditions**: User is not logged in (no token in localStorage)
- **Steps**:
  1. Navigate directly to `/dashboard`
- **Expected Result**: User is redirected to `/login`

---

## Projects

### TC-UI-09 — Create Project Successfully
- **Type**: Positive
- **Preconditions**: User is logged in on dashboard
- **Steps**:
  1. Click "+ New Project"
  2. Enter name: "My Project"
  3. Enter description: "A test project"
  4. Click "Create Project"
- **Expected Result**: Project appears in the project list. Total Projects count increases by 1.

---

### TC-UI-10 — Create Project with Empty Name
- **Type**: Negative
- **Preconditions**: User is logged in on dashboard
- **Steps**:
  1. Click "+ New Project"
  2. Leave name field empty
  3. Click "Create Project"
- **Expected Result**: Error message "Project name is required" is displayed. Project is not created.

---

### TC-UI-11 — Create Project with Duplicate Name
- **Type**: Negative
- **Preconditions**: User is logged in. Project named "My Project" already exists.
- **Steps**:
  1. Click "+ New Project"
  2. Enter name: "My Project" (same as existing)
  3. Click "Create Project"
- **Expected Result**: Error message "Project name already exists" is displayed.

---

### TC-UI-12 — View Project List on Dashboard
- **Type**: Positive
- **Preconditions**: User is logged in. At least one project exists.
- **Steps**:
  1. Navigate to `/dashboard`
- **Expected Result**: All active (non-archived) projects are listed with name, description, and created date.

---

### TC-UI-13 — Archive Project
- **Type**: Positive
- **Preconditions**: User is logged in. Project exists.
- **Steps**:
  1. Navigate to the project page
  2. Click "Archive Project"
  3. Confirm the action
- **Expected Result**: User is redirected to dashboard. Archived project no longer appears in the project list.

---

### TC-UI-14 — Dashboard Stats Accuracy
- **Type**: Positive
- **Preconditions**: User has 2 projects, 3 issues (2 open, 1 done)
- **Steps**:
  1. Navigate to `/dashboard`
- **Expected Result**: Stats show: Total Projects = 2, Total Issues = 3, Open Issues = 2, Completed = 1.

---

## Issues

### TC-UI-15 — Create Issue Successfully
- **Type**: Positive
- **Preconditions**: User is logged in. Project exists. User is on project page.
- **Steps**:
  1. Click "+ New Issue"
  2. Enter title: "Fix login bug"
  3. Enter description: "Login fails on mobile"
  4. Select priority: "HIGH"
  5. Click "Create Issue"
- **Expected Result**: Issue appears in the issue list with correct title, priority badge, and default status "TODO".

---

### TC-UI-16 — Create Issue with Empty Title
- **Type**: Negative
- **Preconditions**: User is on project page
- **Steps**:
  1. Click "+ New Issue"
  2. Leave title empty
  3. Click "Create Issue"
- **Expected Result**: Error message "Issue title is required" is displayed. Issue is not created.

---

### TC-UI-17 — Change Issue Status
- **Type**: Positive
- **Preconditions**: User is on project page. Issue exists with status "TODO".
- **Steps**:
  1. Find the issue in the list
  2. Change status dropdown from "Todo" to "In Progress"
- **Expected Result**: Dropdown updates immediately. Status change persists on page refresh.

---

### TC-UI-18 — Delete Issue
- **Type**: Positive
- **Preconditions**: User is on project page. Issue exists.
- **Steps**:
  1. Click "Delete" next to an issue
  2. Confirm the deletion
- **Expected Result**: Issue is removed from the list. Total Issues count on dashboard decreases.

---

### TC-UI-19 — Filter Issues by Status
- **Type**: Positive
- **Preconditions**: Project has issues with different statuses (TODO, IN_PROGRESS, DONE)
- **Steps**:
  1. On project page, select "In Progress" from the status filter dropdown
- **Expected Result**: Only issues with status "IN_PROGRESS" are displayed.

---

### TC-UI-20 — Search Issues by Title
- **Type**: Positive
- **Preconditions**: Project has multiple issues including one titled "Fix login bug"
- **Steps**:
  1. On project page, type "login" in the search box
- **Expected Result**: Only issues containing "login" in the title are shown (case-insensitive).

---

## Summary

| TC ID | Title | Type | Area |
|---|---|---|---|
| TC-UI-01 | Successful User Registration | Positive | Auth |
| TC-UI-02 | Successful Login | Positive | Auth |
| TC-UI-03 | Login with Wrong Password | Negative | Auth |
| TC-UI-04 | Login with Non-existent Email | Negative | Auth |
| TC-UI-05 | Registration with Invalid Email | Negative | Auth |
| TC-UI-06 | Registration with Short Password | Edge | Auth |
| TC-UI-07 | Logout | Positive | Auth |
| TC-UI-08 | Unauthenticated Access to Dashboard | Negative | Auth |
| TC-UI-09 | Create Project Successfully | Positive | Projects |
| TC-UI-10 | Create Project with Empty Name | Negative | Projects |
| TC-UI-11 | Create Project with Duplicate Name | Negative | Projects |
| TC-UI-12 | View Project List on Dashboard | Positive | Projects |
| TC-UI-13 | Archive Project | Positive | Projects |
| TC-UI-14 | Dashboard Stats Accuracy | Positive | Projects |
| TC-UI-15 | Create Issue Successfully | Positive | Issues |
| TC-UI-16 | Create Issue with Empty Title | Negative | Issues |
| TC-UI-17 | Change Issue Status | Positive | Issues |
| TC-UI-18 | Delete Issue | Positive | Issues |
| TC-UI-19 | Filter Issues by Status | Positive | Issues |
| TC-UI-20 | Search Issues by Title | Positive | Issues |
