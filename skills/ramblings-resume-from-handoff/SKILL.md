---
name: ramblings-resume-from-handoff
description: Resume from handoff, continue prior session, restart from latest handoff, continuation workflow. Use when the current task should continue from a previous handoff artifact. Read the newest relevant handoff in .ramblings/handoffs/, verify it is still current, then resume from referenced briefs, plans, checklists, or other supporting artifacts instead of relying on the handoff alone.
---

# Ramblings Resume From Handoff

Use this skill only when the session is an explicit continuation from a prior handoff.

## Core behavior (verification-first)

- Verify before trust: read handoff + check truth in source artifacts.
- Resume from the latest relevant handoff, but only if still current.
- Keep source artifacts as source-of-truth, handoff as hint.

## Location

Primary artifacts:

`.ramblings/handoffs/`

## Resume principles

1. **Specificity-first selection**
   - Prefer exact `work_unit` match over broad `topic` match.
   - If equal, use newest relevant handoff.

2. **Freshness-first validity**
   - Exclude `superseded`, `stale`, and clearly invalidated candidates.
   - Prefer handoffs that explicitly `supersede` others.

3. **Source-first verification**
   - Verify referenced brief/plan/checklist and supporting artifacts exist and align.
   - Confirm blockers, state, and next action still make sense.
   - If source says otherwise, follow source.

4. **Conservative legacy handling**
   - Old handoffs without metadata may be used only as weak hints.
   - Infer topic from filename/content only when clear; otherwise treat as ambiguous.

## Procedure

1. Select the newest valid handoff using the principles above.
2. Immediately open referenced source artifacts (`briefs`, `plans`, `checklists`, and other supporting artifacts) and validate claims.
3. Classify each key claim: `current`, `stale`, or `ambiguous`.
4. Reconstruct state and next action from validated claims.
5. If after verification multiple plausible candidates remain, stop and ask the user.

### Mandatory precedence

Any conflict between handoff and source artifacts: **source artifacts win**.

## Routing (compact)

- `ramblings-writing-plans`
- `ramblings-implementing-plans`
- external debugging workflow if available
- external review or completion-check workflow if available

```markdown
## Resume summary

- Latest handoff: `.ramblings/handoffs/...`
- Still current: [...]
- Stale/changed: [...]
- Source-of-truth artifacts: [...]
- Next action: [...]
- Next skill: `ramblings-*`

- If ambiguity remains: ask user to disambiguate.
```
