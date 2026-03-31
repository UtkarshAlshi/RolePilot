# AGENTS.md

## Purpose
This repository is optimized for a legally safer, low-cost, AI-native MVP that demonstrates practical LLM + agent-style workflows.

## Operating rules
1. Keep changes small, reviewable, and deployment-safe.
2. Prioritize AI-native value in these flows:
   - profile/resume understanding
   - job understanding
   - fit reasoning
   - grounded application generation
   - human-in-the-loop review
3. Preserve legal safety:
   - no restricted scraping/automation
   - no blind auto-submit
   - no fabricated claims
   - preserve confidence and missing-info signals
4. Preserve free-tier friendliness:
   - avoid mandatory paid infrastructure
   - keep object storage optional when possible
5. Preserve ownership/auth checks across all APIs.
6. Update docs when behavior changes.

## Implementation preference
- Prefer optional LLM integrations with deterministic fallback.
- Keep prompt logic in dedicated prompt modules.
- Keep generation grounded in profile/job facts and explicit fact sources.
