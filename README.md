# AI Job Application Copilot (AI-Native MVP)

A private/demo SaaS-style MVP that showcases AI-assisted product delivery and LLM-powered workflows:

- profile understanding from resume text
- job description understanding
- fit analysis (deterministic backbone + optional AI reasoning)
- grounded application packet generation
- human review/edit/regenerate/approve loop
- saved applications revisit workflow

This project is intentionally legal-safer and free-tier-conscious.

## Why this project is resume-worthy

This codebase is designed so you can honestly say:

- built and shipped an AI-native job application copilot largely with AI assistance
- integrated LLMs into parse/analyze/generate workflows with grounded prompts
- preserved human-in-the-loop approval and anti-fabrication constraints
- optimized for practical low-cost deployment and legal safety

## Core AI/agent components

1. **Prompt library** (`src/server/prompts/index.ts`)
   - versioned prompt builders for job parsing, fit reasoning, and section generation.
2. **Optional LLM client** (`lib/ai/openai-client.ts`)
   - OpenAI Responses API path when key is set.
   - deterministic fallbacks when key is absent.
3. **LLM-enhanced job parsing** (`src/server/services/job-parser.ts`)
   - schema-shaped extraction + fallback parser.
4. **LLM-enhanced fit reasoning** (`src/server/services/analysis-service.ts`)
   - deterministic score remains source-of-truth; LLM enriches explanation only.
5. **LLM-enhanced section generation** (`src/server/services/generation-templates.ts`)
   - grounded, section-specific generation with fallback templates.
6. **Resume text extraction path** (`src/server/services/resume-parser.ts`)
   - optional extraction from provided resume text; storage upload remains supported.

## Legal/safety boundaries

- No restricted scraping or aggressive automation.
- No blind auto-submit to third-party sites.
- No fabricated skills/experience/metrics.
- Generated outputs must stay grounded in supplied profile/job facts.
- Human review/edits are required before final use.

## Free-tier / cost policy

Preferred first deploy path:
- Vercel Hobby (private/demo usage)
- Neon Free Postgres
- Optional LLM calls only when `OPENAI_API_KEY` is set

If LLM key is absent, core workflows still run using deterministic fallbacks.

## Environment setup

```bash
cp .env.example .env
```

Required baseline vars are validated at startup in `lib/env.ts`.

### Optional AI vars
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (default `gpt-4.1-mini`)

## Local development

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Pre-release checks

```bash
npm run lint
npm run typecheck
npm run build
npm run prisma:generate
npx prisma migrate deploy
```

## Deployment and operations docs

- `docs/deployment-runbook.md` — deployment sequence, migration flow, limitations
- `docs/staging-smoke-test.md` — end-to-end staging smoke checklist
- `docs/ai-realignment-plan.md` — keep/simplify/upgrade/defer decisions

## What is intentionally deferred

- scraping-heavy discovery automation
- ATS integrations
- browser extension / mobile app
- growth analytics and expansion features

These are deferred to keep the MVP legal, focused, and low-cost.
