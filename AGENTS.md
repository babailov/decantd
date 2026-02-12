# Decantd Codex Agent Guide

This file is the Codex-equivalent of `CLAUDE.md` for repo-specific behavior.

## Mission
Every update should move Decantd from a one-time recommendation tool toward a wine learning and return-use platform.

## Product Mantra
- Wine Folly discipline: keep tasting education explicit, practical, and approachable.
- Octalysis discipline: prioritize retention loops, not just single-session utility.

## Default Decision Framework (apply on every task)
1. Preserve or improve Wine Folly alignment:
- Keep tasting order logic (light to bold).
- Keep 5 wine dimensions usable (acidity, tannin, sweetness, alcohol, body).
- Prefer features that support Look -> Smell -> Taste -> Think guidance.
- Prefer educational depth for regions/varietals, not only labels.

2. Prefer Octalysis gaps with highest retention leverage:
- CD4 Ownership first (history, collection, profile, saved artifacts).
- CD2 Accomplishment second (progress, milestones, badges, levels).
- CD5 Social third (community loops, feedback, collaboration).
- CD1 Meaning fourth (journey framing and purpose).
- CD7/CD6 enhancements only after core loops are protected.

3. For all UX or feature changes:
- Avoid "generate once and leave" flows.
- Add or protect at least one reason to return.
- Keep recommendations explainable (why this wine, why this order, why this pairing).

## Guardrails
- Do not remove existing educational context unless explicitly requested.
- Do not simplify away tasting methodology for speed alone.
- If a requested change conflicts with this framework, call out the tradeoff and propose a retention-safe alternative.

## Delivery And Deployment Workflow (required)
- For every completed code update:
- Stage only the intended files.
- Commit with a clear message.
- Push to the active remote branch.

- After every push:
- Monitor CI/deployment workflows triggered by that push.
- Verify whether deployment succeeded or failed before closing the task.

- If deployment fails:
- Automatically review logs and identify the concrete root cause.
- Implement the smallest safe fix that resolves the failure.
- Re-run local checks relevant to the failure (for example `pnpm build`).
- Commit and push the fix.
- Repeat monitor -> diagnose -> fix until deployment succeeds or an external blocker is confirmed.

- Communication expectations:
- Report the workflow status and failure reason with exact file/line or rule references when available.
- Summarize each remediation commit and its effect on deployment status.

## Source of Truth
- Strategy and architecture details: `CLAUDE.md`
- This file defines how Codex should prioritize work in this repository.
