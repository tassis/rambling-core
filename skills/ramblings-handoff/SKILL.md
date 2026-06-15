---
name: ramblings-handoff
description: Session handoff, context transfer, next-session summary, resumable work note, handoff artifact. Use only when work needs to be handed off to a later session, another agent run, or a future continuation. Save handoff artifacts under .ramblings/handoffs/ with dates, reference existing specs/plans/reviews instead of duplicating them, and prefer the newest relevant handoff when resuming.
---

# Ramblings Handoff

Use this skill only when work is being explicitly handed off.

This is not a generic summary skill. It exists to help the next session continue without re-deriving the entire context.

## Output location

Save handoff files under:

```text
.ramblings/handoffs/YYYY-MM-DD-<topic>.md
```

## When to use

Use this skill when:

- the current session is stopping but the work is not finished;
- a later session should resume from current context;
- the user wants a compact transfer artifact;
- another workflow stage should continue from the current one.

Do not use it for ordinary progress updates inside the same session.

## Lifecycle rule

Handoff artifacts are transitional by default.

That means:

1. create them only when a real handoff is needed;
2. date them clearly;
3. when resuming, read the newest relevant handoff first;
4. treat older handoffs as historical context, not primary truth;
5. after a successful continuation, obsolete handoffs may be cleaned up or ignored.

## Core rule

Do not duplicate large source artifacts.

Instead of copying full specs, plans, reviews, or diffs into the handoff, reference them explicitly:

- `.ramblings/specs/...`
- `.ramblings/plans/...`
- `.ramblings/reviews/...`
- `.ramblings/debug/...`

## What the handoff should contain

Include only what the next session actually needs:

1. current objective;
2. current state;
3. relevant artifacts to read first;
4. unresolved questions or blockers;
5. suggested next step;
6. suggested next skills.

## Suggested output

```markdown
# [Topic] Handoff

## Current objective

## Current state

## Read these first
- `.ramblings/specs/...`
- `.ramblings/plans/...`

## Open questions / blockers

## Suggested next step

## Suggested next skills
- `ramblings-*`

## Notes to future session
```

## Guidance

- optimize for continuation, not storytelling;
- keep it compact;
- call out what changed the plan or direction;
- redact or avoid sensitive information when it is not needed for continuation.
