# API Contract (MVP)

Base path: `/api`
Auth: session-based; all endpoints except auth require authenticated user.
Content type: `application/json` unless file upload.

## 1) Profile + Resume

### POST `/api/resumes/upload-url`
Create signed upload URL for PDF resume.

Request:
```json
{ "fileName": "resume.pdf", "mimeType": "application/pdf" }
```

Response:
```json
{ "uploadUrl": "...", "storageKey": "resumes/user_123/1710000000-uuid-resume.pdf", "expiresIn": 900, "requiredHeaders": {"content-type": "application/pdf"}, "provider": "local" }
```

### POST `/api/resumes`
Persist uploaded resume metadata and start parse pipeline.

Request:
```json
{ "storageKey": "resumes/user_123/1710000000-uuid-resume.pdf", "fileName": "resume.pdf", "mimeType": "application/pdf", "resumeText": "(optional pasted resume text)" }
```

Response:
```json
{ "resumeId": "res_123", "parseStatus": "PENDING" }
```

### GET `/api/resumes/:resumeId`
Get resume + parse output.

Response:
```json
{
  "id": "res_123",
  "parseStatus": "COMPLETED",
  "rawText": "...",
  "extractedJson": {},
  "confidenceSummary": {}
}
```

### POST `/api/profile/merge-from-resume`
Merge extracted resume facts into profile draft.

Request:
```json
{ "resumeId": "res_123" }
```

Response:
```json
{ "profileId": "pro_123", "mergedFields": ["fullName", "skills", "experience"] }
```

### GET `/api/profile`
Fetch canonical profile + related entities.

### PUT `/api/profile`
Update top-level profile details.

### PUT `/api/profile/experience`
Bulk upsert experiences.

### PUT `/api/profile/projects`
Bulk upsert projects.

### PUT `/api/profile/skills`
Bulk upsert skills.

### PUT `/api/profile/education`
Bulk upsert education entries.

### PUT `/api/profile/preferences`
Update preferences and target roles/locations.

## 2) Job intake + parsing

### POST `/api/jobs`
Create job posting from raw text or URL.

Request:
```json
{
  "sourceType": "TEXT",
  "sourceUrl": null,
  "rawText": "Job description..."
}
```

Response:
```json
{ "jobId": "job_123" }
```

### POST `/api/jobs/:jobId/parse`
Parse job posting into structured fields.

Response:
```json
{
  "jobId": "job_123",
  "title": "Software Engineer",
  "companyName": "Acme",
  "mustHaveSkills": ["TypeScript", "React"],
  "niceToHaveSkills": ["Kubernetes"],
  "screeningQs": []
}
```

### GET `/api/jobs/:jobId`
Return job posting and parsed structure.

### PUT `/api/jobs/:jobId`
User-correct parsed fields.

## 3) Fit analysis

### POST `/api/jobs/:jobId/analyze`
Generate fit analysis against canonical profile.

Response:
```json
{
  "analysisId": "ana_123",
  "matchScore": 78,
  "recommendation": "REASONABLE_APPLY",
  "strengths": ["Strong React + TypeScript"],
  "gaps": ["No production Kubernetes experience"],
  "mustHaveMatch": [],
  "niceToHaveFit": [],
  "reasoning": "...",
  "confidence": "MEDIUM"
}
```

### GET `/api/jobs/:jobId/analysis/latest`
Fetch most recent analysis.

## 4) Application packet generation

### POST `/api/jobs/:jobId/applications`
Generate a new application packet.

Request:
```json
{
  "tone": "professional_concise",
  "sections": ["COVER_LETTER", "WHY_ROLE", "WHY_COMPANY", "RECRUITER_MESSAGE"]
}
```

Response:
```json
{ "applicationId": "app_123", "status": "DRAFT" }
```

### GET `/api/applications/:applicationId`
Fetch packet with answers and confidence flags.

### PATCH `/api/applications/:applicationId/answers/:answerId`
Update section content (user edit).

Request:
```json
{ "content": "Updated text by user." }
```

Response:
```json
{ "answerId": "ans_123", "isUserEdited": true }
```

### POST `/api/applications/:applicationId/regenerate-section`
Regenerate a single section while preserving other edits.

Request:
```json
{ "sectionType": "WHY_ROLE", "tone": "professional_concise" }
```

### POST `/api/applications/:applicationId/approve`
Mark packet approved for use.

Response:
```json
{ "applicationId": "app_123", "status": "APPROVED" }
```

### GET `/api/applications`
List saved applications (filter by status/company/date).

## 5) Target companies

### GET `/api/target-companies`
List user target companies.

### POST `/api/target-companies`
Create target company record.

### PUT `/api/target-companies/:id`
Update company watch preferences.

### DELETE `/api/target-companies/:id`
Soft-disable target company (`isActive=false`).

## Error format (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "details": [{ "field": "sourceType", "message": "Required" }],
    "requestId": "req_123"
  }
}
```

## Validation and trust rules

- Reject generation requests if profile is missing mandatory contact fields.
- Attach `missingInfo` warnings whenever source facts are insufficient.
- Never emit unsupported claims in generated sections; return `LOW` confidence when evidence is weak.
