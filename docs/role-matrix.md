# Role Matrix (4 Roles)

This is a scaffold role split based on your usecase diagram.

## Roles

- `GUEST`: unauthenticated visitor
- `CANDIDATE`: job seeker
- `EMPLOYER`: company/recruiter side
- `ADMIN`: platform operator

## Core permissions (skeleton)

### GUEST

- View public jobs
- Search/filter jobs
- Register/Login

### CANDIDATE

- All `GUEST` capabilities
- Manage profile/CV (placeholder)
- Apply to jobs
- Save jobs, track applications (placeholder)
- Receive alerts, review company, chat (placeholder)

### EMPLOYER

- All `GUEST` capabilities
- Manage company profile (placeholder)
- Create/Update/Delete own jobs
- View candidate pipeline, schedule interviews (placeholder)
- Buy credits/payment, chat (placeholder)

### ADMIN

- Manage users and moderation (placeholder)
- Approve/reject jobs (placeholder)
- Manage categories, locations, skills (placeholder)
- View reports/statistics (placeholder)
