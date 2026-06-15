---
name: ramblings-resume-from-handoff
description: Resume from handoff, continue prior session, restart from latest handoff, continuation workflow. Use when the current task should continue from a previous handoff artifact. Read the newest relevant handoff in .ramblings/handoffs/, verify it is still current, then resume from referenced specs, plans, reviews, or debug notes instead of relying on the handoff alone.
---

# Ramblings Resume From Handoff

Use this skill when the current session is explicitly continuing work from a prior handoff.

## Goal

Resume safely from the latest relevant state without treating an old handoff note as perfect truth.

## Input location

Look for handoff artifacts in:

```text
.ramblings/handoffs/
```

## Resumption flow

### 1. Find the newest relevant handoff

Prefer the most recent handoff that matches the topic or workstream.

### 2. Verify that it is still current

Check whether:

- the referenced plan or spec still exists;
- newer work has already changed the situation;
- blockers are still real;
- the suggested next step still makes sense.

### 3. Read the source artifacts

Do not rely on the handoff note alone.

Read the referenced artifacts first, such as:

- `.ramblings/specs/...`
- `.ramblings/plans/...`
- `.ramblings/reviews/...`
- `.ramblings/debug/...`

### 4. Reconstruct current state

Summarize:

- what is still true;
- what has changed;
- what the next actionable step should be.

### 5. Continue with the right next skill

Depending on the state, hand off to:

- `ramblings-writing-plans`
- `ramblings-implementing-plans`
- `ramblings-systematic-debugging`
- `ramblings-verification`

## Suggested output

```markdown
## Resume Summary

**Latest handoff used:**
- `.ramblings/handoffs/...`

**Still current:**
- [item]

**Changed or stale:**
- [item]

**Artifacts to treat as source of truth:**
- [paths]

**Next step:**
- [action]

**Suggested next skill:**
- `ramblings-*`
```

## Guidance

- newest handoff first, but verify before trusting;
- source artifacts outrank the handoff note;
- if no handoff is current enough, say so and rebuild context deliberately.
