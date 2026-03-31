# AI Job Application Copilot — MVP Foundation

## Architecture

### 1) System architecture (desktop-first web app)
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Backend:** Next.js Route Handlers + Server Actions for MVP speed.
- **Database:** PostgreSQL with Prisma ORM.
- **Auth:** Auth.js (email + OAuth providers later).
- **File storage:** Object storage (S3/R2/Supabase storage) for resume PDFs.
- **AI layer:** Provider-agnostic LLM gateway (OpenAI first, Anthropic pluggable).
- **Parsing layer:** Resume PDF text extraction + schema-constrained LLM extraction.
- **Observability:** Structured logs + request IDs + error tracking.

### 2) Modular services
1. **Auth & Identity**
   - User account, session, basic profile bootstrap.
2. **Profile Vault Service**
   - Canonical user facts (experience, skills, preferences).
   - Manual completion and corrections override extraction.
3. **Resume Ingestion Service**
   - Upload, extract text, parse to structured profile draft.
   - Confidence and missing-field markers.
4. **Job Ingestion Service**
   - Input from raw JD text or job URL.
   - Optional URL fetch/summarize with source capture.
5. **Job Parsing Service**
   - Structured extraction: must-have/nice-to-have, responsibilities, keywords.
6. **Fit Analysis Engine**
   - Deterministic + LLM-assisted scoring with interpretable reasons.
   - Recommendation bands: Strong / Reasonable / Stretch / Skip.
7. **Application Generation Engine**
   - Sectioned outputs: cover letter, why-role, why-company, recruiter message, short answers.
   - Strict grounding in profile facts + job facts.
8. **Review Workspace Service**
   - Editable sections, uncertainty warnings, missing-data prompts.
   - Section-only regeneration preserving user edits elsewhere.
9. **Saved Workflow Service**
   - Jobs, analyses, generated packets, versions, user edits.

### 3) Data + AI trust architecture
- **Fact grounding contract:**
  - Every generated section stores `fact_sources` (profile fields + job fields).
  - If missing facts, system outputs explicit `missing_info` warnings.
- **No hallucination policy:**
  - Prompt templates instruct model to refuse unsupported claims.
  - Post-generation validator checks for unsupported claims heuristically.
- **Confidence model:**
  - Per-section confidence (`high`, `medium`, `low`) + reasons.
- **Auditability:**
  - Persist parse outputs, prompts/version metadata, regeneration lineage.

### 4) API architecture style
- Route handlers under `/api/*`.
- Zod schema validation for every input/output contract.
- Service-layer isolation:
  - `src/server/services/*`
  - `src/server/repositories/*`
  - `src/lib/llm/*`
- Idempotent save/update APIs for robust retry.

### 5) Security + production baseline
- Row-level authorization by `userId` on every query.
- Signed upload URLs for resume storage.
- PII-conscious logs (redact email/phone/resume raw text).
- Rate-limit AI endpoints.
- CSRF/session protections via framework defaults + secure cookies.

---

## Entities

### Core relational model

1. **User**
- `id`, `email`, `name`, `createdAt`, `updatedAt`

2. **Profile** (1:1 User)
- Contact + links + location + summary
- `noticePeriod`, `workAuthorization`, `salaryExpectation`, `relocationPreference`, `startAvailability`

3. **Experience** (many:1 Profile)
- `company`, `title`, `startDate`, `endDate`, `isCurrent`, `description`, `achievements[]`

4. **Project** (many:1 Profile)
- `name`, `role`, `description`, `techStack[]`, `link`

5. **Skill** (many:1 Profile)
- `name`, `category`, `level`, `years`

6. **Education** (many:1 Profile)
- `institution`, `degree`, `field`, `startDate`, `endDate`

7. **Preference** (1:1 Profile)
- `preferredRoles[]`, `preferredLocations[]`, `employmentType[]`, `remotePreference`

8. **TargetCompany** (many:1 User)
- `companyName`, `careersUrl`, `notes`, `isActive`

9. **Resume** (many:1 User)
- `storageKey`, `fileName`, `mimeType`, `uploadedAt`, `parseStatus`
- `rawText`, `extractedJson`, `confidenceSummary`

10. **JobPosting** (many:1 User)
- `sourceType` (`text` | `url`), `sourceUrl`, `rawText`
- Parsed fields: `title`, `companyName`, `location`, `requirements`, `responsibilities`, `mustHaveSkills`, `niceToHaveSkills`, `keywords`

11. **JobAnalysis** (1:1 JobPosting per latest, or many versions)
- `matchScore`, `recommendation`, `strengths[]`, `gaps[]`, `reasoning`, `confidence`

12. **GeneratedApplication** (many:1 JobPosting + User)
- `status` (`draft` | `reviewed` | `approved`)
- `tone`, `groundingNotes`, `overallConfidence`

13. **ApplicationAnswer** (many:1 GeneratedApplication)
- `sectionType` (`cover_letter`, `why_role`, `why_company`, `recruiter_message`, `short_answer`, `resume_emphasis`)
- `content`, `confidence`, `missingInfo[]`, `factSources[]`, `isUserEdited`

14. **DraftVersion** (many:1 GeneratedApplication)
- Snapshot of answers and metadata for regeneration history.

### Key relationships
- `User -> Profile (1:1)`
- `Profile -> Experience/Project/Skill/Education (1:many)`
- `User -> Resume/JobPosting/TargetCompany (1:many)`
- `JobPosting -> JobAnalysis (1:many versions or 1 latest)`
- `JobPosting -> GeneratedApplication (1:many)`
- `GeneratedApplication -> ApplicationAnswer/DraftVersion (1:many)`

---

## Pages

### Public/auth pages
1. `/` — marketing + CTA.
2. `/login` — auth entry.
3. `/signup` — account creation.

### App shell pages (authenticated)
4. `/dashboard`
   - Recent jobs, draft packets, quick actions.

5. `/onboarding`
   - Step 1: upload resume
   - Step 2: review parsed profile
   - Step 3: complete missing fields

6. `/profile`
   - Profile vault editor (contact, experience, projects, skills, education, preferences).

7. `/jobs/new`
   - Input JD text or URL.

8. `/jobs/[jobId]`
   - Parsed JD details + edit corrections + save.

9. `/jobs/[jobId]/analysis`
   - Fit score, must-have vs nice-to-have breakdown, strengths/gaps, recommendation.

10. `/jobs/[jobId]/application`
   - Generate packet controls (tone/sections).

11. `/jobs/[jobId]/review`
   - **Core workspace**: all facts used, generated outputs, confidence flags, missing info, inline edits, per-section regenerate.

12. `/applications`
   - Saved generated packets list.

13. `/applications/[applicationId]`
   - Open existing packet, edit, regenerate sections, version history.

14. `/settings`
   - Account, privacy, provider keys (optional for power users later).

### Later (not MVP)
15. `/watchlist` — target company monitoring.
16. `/assistant` — browser-assistant connected workflows.

---

## Milestone plan

### Milestone 0 — Foundation (Week 1)
- Initialize Next.js + TypeScript + Tailwind + Prisma + Auth.js.
- Define schema + migrations for core entities.
- Build app shell, auth guards, base layout/navigation.
- Add logging, validation, error boundary components.

**Exit criteria:** user can sign up/login and access protected app shell.

### Milestone 1 — Profile Vault + Resume Parsing (Weeks 2–3)
- Resume PDF upload (signed URL/local fallback).
- Extract PDF text and run structured parsing pipeline.
- Prefill profile from parsed resume with confidence/missing flags.
- Manual correction/completion UI + save profile.

**Exit criteria:** user has a trustworthy reusable profile created from resume + manual edits.

### Milestone 2 — Job Intake + Parsing (Week 4)
- Job creation via pasted JD text or URL.
- Job parser for structure: title/company/skills/requirements/questions.
- Job details editor to fix parser mistakes.

**Exit criteria:** structured job record stored and editable.

### Milestone 3 — Fit Analysis (Week 5)
- Implement interpretable fit engine.
- Must-have vs nice-to-have comparison against profile skills/experience.
- Recommendation category + confidence display.

**Exit criteria:** user sees honest, explainable apply recommendation.

### Milestone 4 — Application Packet Generation (Week 6)
- Generate sectioned outputs with strict grounding.
- Add unsupported-claim checks + missing-info warnings.
- Persist generated answers with per-section confidence.

**Exit criteria:** high-quality packet drafts created without fabricated claims.

### Milestone 5 — Review Workspace + Regeneration (Weeks 7–8)
- Build full review workspace with inline editing.
- Section-level regeneration while preserving user edits.
- Approve/finalize flow and saved history versions.

**Exit criteria:** user can confidently review/edit/approve every output.

### Milestone 6 — Saved Workflow + Production Readiness (Week 9)
- Dashboard for saved jobs and applications.
- Empty/loading/error states; retry flows.
- Production env docs, deployment pipeline (Vercel + managed Postgres), monitoring hooks.

**Exit criteria:** MVP usable end-to-end in production-like environment.

### Milestone 7 — Post-MVP roadmap (after validation)
- Watchlist monitoring for selected companies.
- ATS-focused integrations (Greenhouse/Lever) where viable.
- Browser assistant for form mapping + user-approved fill.
