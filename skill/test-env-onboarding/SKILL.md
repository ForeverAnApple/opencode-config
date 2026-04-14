---
name: review-env-onboarding
description: Audit a repo, propose a Dockerized review environment, get one database-backed e2e flow running, and emit preflight and final reports with suggested changes and artifacts.
---

# Review Env Onboarding

Use this skill when a repo needs an internal review environment bootstrap: architecture audit, Dockerized runtime, test access path, fixture or seed data, and one passing e2e flow with artifacts.

## Goal

Reach one reproducible review environment that:
- boots with Docker or a Docker-plus-host hybrid
- connects to a real database
- supports an automated login or test access path
- runs at least one browser e2e flow successfully
- produces screenshots and a final onboarding report

## Required Reports

Emit two reports during the workflow.

### Preflight report

Before editing:
- repo architecture summary
- apps/services/packages involved in the first e2e path
- current testing and environment-variable inventory
- external dependency inventory
- blockers to Dockerized review testing
- suggested changes needed to reach one passing flow

### Final report

After verification:
- exact changes made
- what was kept real vs substituted
- whether the DB was clean-created, cloned, or seeded
- exact commands run
- what passed
- artifact paths
- remaining blockers or deferred improvements

## Workflow

1. Audit the repo.
   - Find app entrypoints, service boundaries, current Docker files, test tooling, env files, and external dependencies.
2. Choose the first e2e path.
   - Prefer one stable, user-visible, DB-backed flow over broad coverage.
3. Define the review environment policy.
   - Decide which dependencies stay real and which boundaries need temporary substitution for the first pass.
   - Default to preserving core platform services and real non-prod integrations when they are central to the product.
   - For services like remote sandbox providers, prefer keeping them real unless there is an explicit reason they block the first milestone.
4. Get the stack booting.
   - Add or update Docker Compose, runtime env wiring, healthchecks, and startup order.
5. Prepare data and access.
   - Run migrations.
   - Seed deterministic data or add a test login/access path.
6. Remove blockers.
   - Fix the minimum issues needed to make the first path testable.
7. Add browser verification.
   - Install Playwright if needed.
   - Add one smoke e2e.
   - Use `playwright-interactive` for proof screenshots when visual confirmation matters.
8. Emit the final report.

## Guidance

- Keep the first milestone narrow.
- Prefer real app logic and a real DB.
- Prefer real core product services by default, including sandbox/execution infrastructure when feasible.
- Substitute only the external boundaries that would otherwise block the first flow.
- Document every substitution explicitly in the final report.
- Do not claim “ready” until one e2e path has actually passed and produced artifacts.
