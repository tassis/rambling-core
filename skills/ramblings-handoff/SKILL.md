---
name: ramblings-handoff
description: Explicit cross-session transfer skill. Use only for handing off unfinished work to a later session/agent run/future continuation; not a generic status summary.
---

# Ramblings Handoff

Produce a compact, resumable transfer artifact so the next run can continue fast.

- **Not** for same-session progress updates.
- **Not** for generic storytelling or repeating source content.

## Transfer principles

1. **Explicit transfer only**: invoke for explicit handoff to later session/run only.
2. **Reference, don’t duplicate**: point to existing briefs/plans/checklists and any relevant supporting artifacts; never paste large artifacts.
3. **Newest first**: create dated artifacts and resume from the latest relevant one.
4. **Append-only continuity**: do not mutate past handoffs; keep history compactly.
5. **Resume-first output**: include only what a new session needs to take action immediately.

## Output path

Save handoff files at:

`.ramblings/handoffs/YYYY-MM-DD-<topic>.md`

## Compact frontmatter contract (required)

```yaml
---
topic: <broad-topic>
work_unit: <specific-work-unit>
references:
  - .ramblings/briefs/...
  - .ramblings/plans/...
supersedes: <previous-handoff-filename.md>   # optional
status: active                               # active | superseded | stale | complete
---
```

Rules:

- `topic`: broad bucket.
- `work_unit`: preferred resume key.
- `references`: source artifacts to read first.
- `supersedes`: optional explicit link to the direct predecessor.
- `status`: lifecycle hint; keep older handoffs even when superseded.

## Required sections in handoff body

- Current objective
- Current state
- Relevant artifacts to read first
- Blockers / questions
- Suggested next step
- Suggested next skills

Use brief bullets, not long prose.

## Recommended template

```markdown
---
topic: api-platform
work_unit: api-platform-error-path-hardening
references:
  - .ramblings/plans/api-platform.md
  - .ramblings/checklists/2026-06-27-api-platform.yaml
status: active
---

## Current objective

## Current state

## Relevant artifacts to read first
- .ramblings/...

## Blockers / questions

## Suggested next step

## Suggested next skills
- ramblings-writing-plans
- ramblings-implementing-plans
```

If you claim work is complete or ready for the next stage, reference equivalent evidence from current source artifacts.

Do not rewrite older handoffs by default; if unclear, create the next append-only handoff and mark `supersedes`.
