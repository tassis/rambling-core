---
name: ramblings-writing-plans
description: Existing project implementation plan, legacy maintenance plan, .ramblings plans. Prefer brief-first by default; use for multi-step execution only when the work is implementation-ready, the user explicitly asks for a plan, or the user explicitly accepts direct plan mode. Write concrete plans into .ramblings/plans/ with exact files, ordered tasks, and verification steps.
---

# Maintenance Writing Plans

Write implementation plans for existing-project work.

This is not greenfield planning. Assume:

- the codebase may be inconsistent;
- tests may be weak;
- names and boundaries may already be messy;
- you should minimize risk while still being concrete.

## Output location

Save plans under:

```text
.ramblings/plans/YYYY-MM-DD-<topic>.md
```

Use the user's preferred location if they explicitly override this.

In Conductor Mode, writing planning artifacts under `.ramblings/` is allowed and expected. Conductor Mode should not treat these files as implementation edits.

If execution state should live separately from the main plan, save it under:

```text
.ramblings/checklists/YYYY-MM-DD-<topic>.yaml
```

## When to use

Use this skill when:

- the task is multi-step;
- the task touches multiple files or subsystems;
- the user explicitly asks for an implementation plan or allows direct planning/landing;
- the work is clearly implementation-ready with concrete files, ordered steps, and verification;
- the existing project is risky enough that execution should be guided by a written plan.

Do not use it for trivial one-file tweaks unless the user explicitly asks for a written plan.

## Plan goals

The plan must help a low-context engineer execute safely.

Planning guidance includes task meaning, why a task exists, risk, and recommended execution strategy. Those semantic fields belong in the plan and **must not** be migrated into the checklist as durable runtime state.

That means the plan must include:

- exact files to read, create, or modify;
- the order of operations;
- how to validate each risky step;
- where automated tests are realistic and where they are not;
- what manual verification is required when tests are weak;
- a separate execution-state reference so a later session can resume without guessing;
- completion criteria that make each task safe to re-check before rerunning.

## Plan shape

Every plan should start with:

```markdown
# [Topic] Maintenance Plan

**Goal:** [one sentence]

**Current Risk:** [what makes this change dangerous or uncertain]

**Approach:** [2-4 sentences]

**Verification Strategy:** [tests, reproductions, manual checks]

---
```

Then add task sections.

Immediately after the header, add a required checklist reference:

```markdown
**Execution State:** `.ramblings/checklists/YYYY-MM-DD-<topic>.yaml`
```

The referenced checklist is the source of truth for **current execution state** while execution is active (status + next action + blockers + update markers). The plan carries intent/risk/recommendations and should not carry live completion state.

## Task structure

Use this format (task metadata below is semantic planning guidance, not a hard runtime contract):

```markdown
## Task N: [short name]

**Why:** [why this task exists]

**Tags:** [short tags for routing/ownership e.g. `backend`, `frontend`, `docs`; optional]

**Risk:** [low/medium/high; key uncertainty or blast radius]

**Files:**
- Read: `path/to/file`
- Modify: `path/to/file`
- Create: `path/to/file`
- Verify: `path/to/test-or-command`

**Suggested Capability:** [optional: capability the executor may want (e.g. code-editing, integration, review)]

**Suggested External Review:** [optional: recommended reviewer type or focus, not mandatory]

**Steps:**
1. [specific action]
2. [specific action]
3. [specific action]

**Verification:**
- Run: `exact command`
- Expect: [concrete expected result]

**Completion Criteria:**
- [specific observable condition that means this task is actually done]
- [use file state, test result, command output, or visible behavior rather than abstract intent]

**Re-entry / Idempotence Notes:**
- [how to tell whether this task was already completed]
- [what to re-check before rerunning]

**Notes / Risks:**
- [edge case, dependency, ambiguity, migration concern]
```

## Planning rules

Semantic metadata guidance:

1. `Tags`, `Risk`, `Suggested Capability`, and `Suggested External Review` are hints for coordination and planning. They should never be treated as hard requirements, mandatory approvals, or executable dependencies.
2. Keep them practical and lightweight; do not inflate every task with lengthy prose.
3. Do not tie these fields to specific tool, extension, or agent names.
4. The plan/checklist boundary remains: task meaning/risk/recommendation text belongs to the plan; the checklist remains live execution-state only.
5. Checklist fields are expected to be sparse and current-state-focused (e.g., active task id, task status, and next action), not reusable orchestration descriptions.

6. Use exact file paths.
7. Keep tasks small and ordered.
8. Prefer concrete steps over vague intent.
9. If you mention tests, say exactly which tests or commands.
10. If automated tests are not practical, say so explicitly and specify manual verification.
11. Follow existing project structure unless the user is intentionally restructuring it.
12. Every task must include completion criteria.
13. Every risky or multi-step task must say how to detect "already done" before re-executing it.
14. A task is not complete until its verification has passed and its completion is reflected in the referenced checklist.
15. Conductor Mode may write or update `.ramblings/plans/**` and `.ramblings/checklists/**`, but should not edit product code while doing planning-only work.

## No-placeholder rule

These are plan failures:

- "TODO"
- "implement later"
- "add validation"
- "handle edge cases"
- "write tests"
- "refactor as needed"
- "similar to previous task"

Replace them with concrete actions.

## Maintenance-specific guidance

For old or fragile codebases:

1. Include a task to understand current behavior before changing it.
2. If behavior is unclear, include a reproduction or observation step.
3. If a risky file is large or confusing, say what part to inspect first.
4. Prefer minimal, reversible changes over cleanup sprees.
5. If execution may span multiple sessions, use the referenced checklist to preserve resumable progress safely.

## Before finishing the plan

Self-check:

1. Does each requirement map to a task?
2. Are file paths concrete?
3. Does each risky task have verification?
4. Did you clearly distinguish automated vs manual verification?
5. Did you avoid over-design for a maintenance task?
6. Can an implementer tell what is done, what is blocked, and what can be safely retried?
