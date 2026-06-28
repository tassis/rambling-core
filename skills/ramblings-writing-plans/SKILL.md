---
name: ramblings-writing-plans
description: Existing-project implementation planning, legacy maintenance plan writing for .ramblings plans. Prefer brief-first by default; write plans only when implementation-ready or explicitly requested, then include concrete files, ordered tasks, and verification.
---

# Maintenance Writing Plans

Write concise implementation plans for **existing projects** (not greenfield speculation).

## Scope

- Use for maintenance work where behavior is already in place.
- **Brief-first by default.** Plan only when implementation-ready, explicitly requested, or explicitly accepted.
- This is a maintenance contract: prioritize safety over novelty in imperfect projects.

## Output artifacts

Primary plan:

```text
.ramblings/plans/YYYY-MM-DD-<topic>.md
```

Optional execution state:

```text
.ramblings/checklists/YYYY-MM-DD-<topic>.yaml
```

In Conductor Mode these files are planning artifacts under `.ramblings/` and must not be treated as product edits.

## Tag responsibility in planning

- Plans should stay focused on risk, intent, paths, and verification.
- Keep tags few, meaningful, and optional.
- Missing or sparse tags are valid; execution should not depend on them being present.

Task-level routing metadata is authored in checklist tasks, not plan task blocks.

### Preferred starter tag set (for checklist task authoring)

Prefer this shared starter set before inventing new tags.

- **domain:** `coding`, `writing`, `frontend`, `backend`, `database`, `docs`, `workflow`
- **process:** `planning`, `implementation`, `refactor`, `migration`, `debug`, `qa`, `handoff`, `archive`
- **risk / posture:** `high-risk`, `verification-heavy`, `bounded`, `multi-step`

If one of these fits, use it instead of inventing a synonym. Add a new tag only when the starter set clearly cannot express the work shape.

## When to use

- Multi-step work
- Multiple files/subsystems touched
- Clear implementation-ready target with concrete files + ordered tasks + verification
- User asks for a plan / allows direct planning / direct landing
- Risk is high enough to require a written execution contract

### Routing

- Explicit request first: follow user direction for handoff (e.g., execute, investigate, or delegate).
- Then checklist task metadata: when task metadata clearly maps to a specialized lane, route there first.
- Then conservative inference: if work is already sequenced and checklist-ready -> `ramblings-implementing-plans`; if not implementation-ready -> `ramblings-brainstorming`.
- Otherwise keep using this core planning skill as fallback.

Skip for trivial one-file tweaks unless explicitly requested.

## Required contract (do not weaken)

### Plan header (required first block)

Every plan must start with:

```markdown
# [Topic] Maintenance Plan

**Goal:** [one sentence]
**Current Risk:** [what is uncertain or dangerous]
**Approach:** [2-4 sentences]
**Verification Strategy:** [tests, reproduction, manual checks]

---

**Execution State:** `.ramblings/checklists/YYYY-MM-DD-<topic>.yaml`
```

The checklist is the source of **live execution state**; the plan is planning intent + risk + recommendations.

### Plan body must include

- Exact file paths for read/create/modify.
- Ordered tasks.
- Verification for each risky step.
- Route-sensitive metadata (`tags`, `suggested_capability`) belongs in checklist task entries, not plan task blocks.
- Clear “manual when no automation” fallback.
- Completion criteria that are observable.
- Resumption via checklist reference.

### Plan/checklist split (explicit)

- **Plan:** why, risk, steps, recommendation, checks.
- **Checklist:** status, active task, next action, blockers.

## Task template (compact, clear)

```markdown
## Task N: [short name]

**Why:** [why this task exists]

**Risk:** [low/medium/high; key uncertainty]

**Files:**
- Read: `path/to/file`
- Modify: `path/to/file`
- Create: `path/to/file`
- Verify: `path/to/test-or-command`

**Suggested External Review:** [optional, plan-only review hint; not checklist routing metadata]

**Steps:**
1. [specific action]
2. [specific action]

**Verification:**
- Run: `exact command`
- Expect: [observable result]

**Completion Criteria:**
- [specific done condition]

**Re-entry / Idempotence:**
- [how to detect already complete]

**Notes / Risks:** [short edge case or dependency]
```

## Principle rules (short form)

1. `Risk`, `Suggested External Review` are soft hints only; task routing metadata belongs in checklist tasks.
2. Use exact paths and deterministic commands.
3. Keep tasks small, concrete, and ordered.
4. State exactly which tests run; if unavailable, state manual checks explicitly.
5. Do not over-design; this is maintenance planning.
6. Every task is complete only after verification passes and the checklist is updated.

## No-placeholder rule

Forbidden phrases (replace with concrete work):

- TODO
- implement later
- add validation
- handle edge cases
- write tests
- refactor as needed
- similar to previous task

## Maintenance-specific guidance

- Start with behavior understanding when behavior is uncertain.
- Add targeted inspection steps for confusing/risky files.
- Prefer minimal, reversible changes.
- Use the checklist for multi-session resumability.

## Before finishing a plan

Self-check quickly:

1. Do requirements map to tasks?
2. Are all paths concrete?
3. Is verification explicit for risky items?
4. Is automation vs manual verification clear?
5. Can resume be done from checklist without guessing?

(End of file)
