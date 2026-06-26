# ramblings-core

`ramblings-core` is a focused workflow core for OpenCode.

It owns the compact execution spine:

- brainstorming
- briefing
- planning
- execution
- handoff/resume continuity
- archive hygiene

It also defines a core verification policy: work only advances when completion is backed by observable evidence.

Detailed review methods, testing strategies, readiness/reporting packs, investigation/debug workflows, and other specialized postures are intentionally **out of scope** for this package and are expected to live in follow-on workflow packs.

## Canonical default lifecycle

The default `ramblings-core` lifecycle is:

1. brainstorm (`office-hours`)
2. brief (`write-brief`)
3. plan (`write-plan`)
4. execute (`start-work`)
5. handoff / resume (`handoff`, `resume-from-handoff`)
6. archive (`archive`)

`handoff`, `resume-from-handoff`, and `archive` are first-class, canonical steps in the public default lifecycle.

Execution is checklist-driven: runtime work assumes an existing `.ramblings/checklists/` artifact in addition to a plan. The conductor is responsible for drafting/normalizing that checklist before execution begins; the orchestrator then operationalizes it as live execution state. Checklist artifacts should stay compact: optional task fields are omitted when they do not carry current-state information.

## Package identity

- Package name: `ramblings-core`
- Entry plugin: `plugin/ramblings-plugin.ts`
- Core command set:
  - `office-hours`
  - `write-brief`
  - `write-plan`
  - `start-work`
  - `handoff`
  - `resume-from-handoff`
  - `archive`
- Agent: `@conductor`
- Skills path: `/skills` in this repository

## What is in scope

- Brainstorming, briefing, planning, execution, continuation, and archive mechanics.
- Project-root `.ramblings/` artifacts as durable state.
- Minimal helper tools required for `start-work` state operations.
- No execution entrypoint without checklist state: the checklist is the executable current-state source, while plans remain semantic instructions and risk guidance. Empty optional checklist fields should not be serialized as `null` placeholders.

## What is not in scope

- `ready-check`, review, challenge, grill, careful, investigate, triage, retro, prototype, testing-strategy, and similar specialized workflow packs.
- Mandatory ideology (no mandatory TDD, no mandatory careful mode, no mandatory review posture).
- Compatibility or fallback aliases for removed command/agent/skill surfaces.

These specialized workflows can be added later as separate packages that compose with `ramblings-core`.

## Install

See [`docs/install.md`](docs/install.md) for install examples and plugin wiring.

## Learn more

- [`docs/install.md`](docs/install.md): installation and plugin behavior.
- [`docs/commands.md`](docs/commands.md): command-level usage.
- [`docs/skills.md`](docs/skills.md): routing map for core skills.
- [`docs/architecture.md`](docs/architecture.md): execution boundary and runtime contract.
- [`docs/removal-notes.md`](docs/removal-notes.md): removed/non-core surface rationale.
