# Bug Report Template

## Template

| Field | Details |
|---|---|
| **Title** | Short, descriptive summary of the bug |
| **Environment** | OS, Browser, Node version, App version/branch |
| **Steps to Reproduce** | Numbered steps to reliably reproduce the issue |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happens |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 / P4 |
| **Attachments** | Screenshots, logs, network traces |

---

## Severity Definitions

| Severity | Definition |
|---|---|
| **Critical** | System is down or data loss occurs. No workaround exists. |
| **High** | Core feature is broken. Workaround is difficult or impossible. |
| **Medium** | Feature partially works. A workaround exists. |
| **Low** | Minor UI issue or cosmetic defect. No functional impact. |

## Priority Definitions

| Priority | Definition |
|---|---|
| **P1** | Must fix immediately — blocks release or affects all users |
| **P2** | Must fix in current sprint |
| **P3** | Fix in next sprint |
| **P4** | Fix when time permits |

---

## Example Bug Report #1

| Field | Details |
|---|---|
| **Title** | Login returns "Invalid email or password" for valid credentials after password reset |
| **Environment** | macOS 14.x, Chrome 124, Node.js v20, branch: `main` |
| **Steps to Reproduce** | 1. Register with email "alice@example.com" and password "password123" <br> 2. Log out <br> 3. Attempt to login with correct credentials |
| **Expected Result** | User is logged in and redirected to `/dashboard` |
| **Actual Result** | Error message "Invalid email or password" is displayed. User cannot log in. |
| **Severity** | Critical |
| **Priority** | P1 |
| **Attachments** | Screenshot of error message, server logs showing 401 response |

---

## Example Bug Report #2

| Field | Details |
|---|---|
| **Title** | Archived projects still appear in dashboard project list |
| **Environment** | macOS 14.x, Chrome 124, Node.js v20, branch: `main` |
| **Steps to Reproduce** | 1. Login as a registered user <br> 2. Create a project named "Test Project" <br> 3. Navigate to the project page <br> 4. Click "Archive Project" and confirm <br> 5. Navigate back to `/dashboard` |
| **Expected Result** | "Test Project" does not appear in the active project list |
| **Actual Result** | "Test Project" still appears in the project list with no archived indicator |
| **Severity** | High |
| **Priority** | P2 |
| **Attachments** | Screenshot of dashboard showing archived project |

---

## Example Bug Report #3

| Field | Details |
|---|---|
| **Title** | Dashboard "Open Issues" count does not update after issue status changed to DONE |
| **Environment** | macOS 14.x, Chrome 124, Node.js v20, branch: `main` |
| **Steps to Reproduce** | 1. Login and navigate to dashboard <br> 2. Note the "Open Issues" count (e.g. 3) <br> 3. Navigate to a project page <br> 4. Change an issue status from "Todo" to "Done" <br> 5. Navigate back to dashboard |
| **Expected Result** | "Open Issues" count decreases by 1, "Completed" count increases by 1 |
| **Actual Result** | Both counts remain unchanged until page is manually refreshed |
| **Severity** | Medium |
| **Priority** | P3 |
| **Attachments** | Screen recording showing count not updating |
