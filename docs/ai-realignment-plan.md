# AI Realignment Plan

## A) KEEP AS-IS
- Auth/session guard structure and ownership-scoped repositories.
- API response conventions (`ok`/`fail`) and request ID logging.
- Review/approve saved application workflow.
- Deterministic fit scoring backbone.

## B) KEEP BUT SIMPLIFY
- Resume upload dependency for first-run onboarding: keep as optional path.
- Monitoring integration: keep lightweight placeholder hook.

## C) UPGRADE TO LLM / AGENTIC
1. Job parsing: add optional LLM parser with schema-constrained JSON output + deterministic fallback.
2. Application generation: add optional LLM section generation with grounded prompts per section.
3. Fit analysis reasoning: preserve deterministic score, add optional LLM explanation layer that references evidence/gaps.
4. Prompt system: add first-class prompt module with versioned prompt builders.

## D) DEFER / REMOVE
- Scraping-heavy automation and third-party platform submission.
- ATS integrations, browser extension, mobile app, growth analytics.
- Any feature requiring paid infra/billing setup for MVP usability.

## Execution steps
1. Add AI config/env and OpenAI client wrapper with safe fallback behavior.
2. Add prompt library for parse/reason/generate tasks.
3. Wire optional LLM path into job parsing, section generation, and fit explanation.
4. Update docs to explain AI-native architecture, safety boundaries, and deferred items.
5. Keep current user flow stable and backwards-compatible.
