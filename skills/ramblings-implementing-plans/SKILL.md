---
name: ramblings-implementing-plans
description: Execute an existing `.ramblings` plan as the workflow orchestrator: sequence tasks, keep verification meaningful, and synchronize checklist state.
---

# Ramblings Implementing Plans

Use this skill only when a plan has already been resolved and there is a checklist-directed execution target.

It is execution-orchestration guidance, not planning discovery and not a generic coding persona.

## Core principles

### 1) Checklist-first execution
- No execution without an active checklist.
- If checklist state is missing or unclear, normalize it first before broad execution.
- The checklist is the current execution truth (`status`, `next_action`, blockers, timestamps).
- It is execution-state, not a durable orchestration ledger.

### 2) Small verified slices
- One active task at a time by default.
- Execute the smallest meaningful slice and avoid opportunistic redesign.
- Do not mix unrelated cleanup into planned work.
- Do not treat edits as completion evidence.

### 3) Replan instead of freelancing
- If the plan is stale/unsafe or assumptions change, update the plan or route back to planning.
- Do not silently diverge from the written plan.

### 4) Orchestrator owns execution state
- This skill owns task choice, verification gates, and checklist writeback.
- Delegated lanes are bounded/reviewable; they do not own live state.

### 5) Consume checklist task routing metadata
- Prefer routing metadata from the active checklist task (`tags`, `suggested_capability`) as execution hints.
- Treat metadata-driven suggestion as optional: weak or noisy metadata may produce no suggestion.
- Do not re-author checklist routing metadata during execution; only add minimal, optional hints if none exist and it meaningfully helps routing.
- Missing routing metadata must never block execution.

## When to use

Use when:
- a plan plus checklist artifact already exists, or checklist can be normalized first;
- the work is to execute that plan safely and update progress truthfully.

Do not use for:
- initial requirement discovery/planning;
- unconverged design exploration;
- unplanned ad hoc coding.

## Execution methods (smallest safe path)

- **Inline**: tiny/local work where delegation adds little value.
- **Sequential** *(default)*: dependent tasks already ordered by the plan.
- **Delegated**: clearly bounded and reviewable tasks.
- **Limited parallel**: only for independent subtasks with known integration order.

Do not parallelize if tasks edit the same seam, depend on each other, or the workflow is still changing.

## Delegation rubric (explicit once)

Routing for delegation follows a compact rule:

- explicit user instruction first
- then existing checklist-task `tags`
- then checklist-task `suggested_capability`
- then conservative content-shape inference
- otherwise fallback to this core skill

When delegating, suggest a skill only for a clear, likely fit; skip weak/noisy matches; give one short reason only. Treat suggestions as advisory-only and environment-dependent, and never block execution if no suggestion exists or the lane does not load/follow it.
The runtime suggestion step itself may return no match.
When executing a task, start by reading its active checklist-task `tags`/`suggested_capability` metadata as the first execution signal and only supplement sparsely if the plan/task is unclear.

## Execution flow

1. Read plan and active checklist.
2. Select the next task from the active checklist entry.
3. Check that the task is still valid and not already complete.
4. Execute the minimal slice.
5. Verify immediately.
6. Update checklist with outcome/blockers.
7. Continue, block, or re-plan.

## Re-entry posture

- Re-read completion criteria before retrying a task.
- Confirm whether the step is already done to avoid duplicate work.
- Record partial progress or blockers in checklist notes.

## Layering model

1. `/start-work` (or equivalent) resolves the active task.
2. `ramblings-implementing-plans` orchestrates execution and owns checklist state updates.
3. Delegated lanes may use an implementation-posture skill for local execution quality.
4. Orchestrator writes live execution outcome back to checklist.

See the delegation rubric above for all delegation suggestions.

## Replan / route out

- If plan assumptions materially break, use `ramblings-writing-plans`.
- If execution becomes investigation-heavy, use a debugging workflow.
- If explicit review is needed, use a review-capable workflow.

## Verification posture (completion gate)

- Run the task-specific checks from the plan.
- If automation is weak, perform minimal practical manual verification.
- Update checklist only after verification passes.
- Code edits alone never complete a task.

## Explicit retained execution constraints

- Retained: do not create commits unless the user explicitly asks.
- Retained: do not mix unrelated cleanup into planned work.

## Progress note format

```md
## Progress Update
- Completed: <task>
- Verified: <command / manual check>
- Checklist updated: <entry + outcome/blocker>
- Blocked / Changed: <issue or deviation>
- Next: <next task>
```
