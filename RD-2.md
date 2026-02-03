## [RD-5: Assessment Setup](https://gfw.atlassian.net/browse/RD-2) 


### Tasks Overview

- [ ] [Database Schema Setup for Assessment Creation](https://gfw.atlassian.net/browse/RD-5)
  Description: Implement database tables and relationships required for assessment setup flow.

- [ ] [Setup Assessment Form UI](https://gfw.atlassian.net/browse/RD-6)
  Description: Build the /setup-assessment page with two-section form layout using WRI Design System components.

- [ ] Client-Side Form Validation
  Description: Implement client-side validation using React Hook Form with inline error display.

- [ ] Assessment Creation API Endpoint
  Description: Create POST /api/assessments/setup endpoint with transaction-based database writes.


- [ ] Success Modal with Credential Display
  Description: Implement blocking modal to display assessment URL and password after creation.

- [ ] One-Time Access Token Flow
  Description: Generate and validate one-time bypass token for post-setup access.

- [ ] Password Authentication for Assessment Access
  Description: Implement password prompt UI and login endpoint for returning users.


### Task Dependencies Diagram
Database Schema Setup
```
  ├─> Setup Assessment Form UI
  │     └─> Client-Side Form Validation
  │           └─> Assessment Creation API Endpoint
  │                 └─> Success Modal with Credential Display
  │                       └─> One-Time Access Token Flow
  │                             └─> Password Authentication for Assessment Access
```

### Recommended Checklist for Testing

**- Unit Tests:**
- [ ] Password generation produces 10-char alphanumeric string
- [ ] Email validation regex accepts/rejects sample inputs
- [ ] bcrypt hash verification works for correct/incorrect passwords

**- Integration Tests:**
- [ ] Form submission creates all 3 database records
- [ ] Transaction rollback on partial failure
- [ ] Token consumption after first use
- [ ] Session cookie persists 24 hours

**- E2E Tests:**
- [ ] Complete flow: form fill → submit → modal → start assessment
- [ ] Return flow: saved URL → password → access granted
- [ ] Invalid password attempt shows error without account lock