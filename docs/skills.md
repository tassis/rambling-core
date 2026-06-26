# Skills

`ramblings-core` keeps only the workflow skills required for the canonical lifecycle.

For command-first entrypoints, see [`docs/commands.md`](commands.md).

## Core skill set

- [`ramblings-brainstorming`](../skills/ramblings-brainstorming/SKILL.md)
- [`ramblings-brief-writing`](../skills/ramblings-brief-writing/SKILL.md)
- [`ramblings-writing-plans`](../skills/ramblings-writing-plans/SKILL.md)
- [`ramblings-implementing-plans`](../skills/ramblings-implementing-plans/SKILL.md)
- [`ramblings-handoff`](../skills/ramblings-handoff/SKILL.md)
- [`ramblings-resume-from-handoff`](../skills/ramblings-resume-from-handoff/SKILL.md)
- [`ramblings-archive`](../skills/ramblings-archive/SKILL.md)

### Routing guide (core only)

- shape options / discuss → `ramblings-brainstorming`
- shape converged → `ramblings-brief-writing`
- need implementation tasks → `ramblings-writing-plans`
- execute plan → `ramblings-implementing-plans`
- transfer context → `ramblings-handoff`
- resume context → `ramblings-resume-from-handoff`
- cleanup completed work → `ramblings-archive`

## Verification policy in skills

Core completion behavior is evidence-backed. Skills in this package should preserve durable references and execution signals so completion can be validated from the artifacts they help produce.

## Non-core work (out of scope for this package)

The following workflow families are intentionally excluded from this package and are intended only as follow-on workflow packs:

- review/challenge/grill/reviewer orchestration
- readiness/reporting (`ready-check`-style)
- investigation/debugging and testing-strategy workflows
- triage/prototype/careful/posture modes
