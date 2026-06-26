# Commands

`ramblings-core` exposes only the retained core command set. This is the active public surface.

- `office-hours`
- `write-brief`
- `write-plan`
- `start-work`
- `handoff`
- `resume-from-handoff`
- `archive`

The canonical lifecycle remains: brainstorm → brief → plan → execute → handoff/resume → archive.

## `office-hours`

Early discovery and open-ended shaping conversation before creating artifacts.

## `write-brief`

Capture converged discussion in a structured brief.

## `write-plan`

Turn an approved direction into implementation tasks and plan artifacts.

## `start-work`

Execute or resume an existing plan from project-root `.ramblings/` artifacts.

`start-work` is the execution entrypoint and prefers checklist-backed execution state.

## `handoff`

Create compact transfer context for another session or later continuation.

- Creates an append-only handoff artifact under `.ramblings/handoffs/`.
- Captures objective, status, and next action in compact form.

## `resume-from-handoff`

Restore execution context from an existing handoff artifact and continue safely.

- Selects by `work_unit` first, then broader `topic`, with ambiguity routed to explicit operator confirmation.

## `archive`

Perform explicit cleanup and archive consolidation once work is no longer an active execution candidate.

`/start-work` keeps a narrow auto-cleanup path for safe completed/cancelled units at entry; broader ambiguity/conflict cleanup remains operator-driven in `archive`.

## Verification and specialization

Verification discipline (evidence requirements, completion criteria) is a core concern here.

Specialized workflow methods (review lenses, testing strategy modes, triage, investigation/debug, readiness/reporting packs, and other method-focused workflows) are intentionally outside `ramblings-core` and are not part of this command set.
