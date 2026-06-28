# Architecture

`ramblings-core` is the execution-focused bounded core package for OpenCode workflow.

Read this after the README if you want the internal model and runtime boundary.

## Core boundary

`ramblings-core` owns a compact workflow loop and deterministic execution control:

- brainstorm → brief → plan → execute
- handoff/resume continuity
- archive hygiene
- core verification policy (observable success evidence required before completion)

It does **not** own specialized workflow methods such as review/challenge packs, investigation/debugging, triage, readiness/reporting, testing-strategy modes, prototype workflows, or posture/method packs. Those belong to separate follow-on workflow packages.

Those follow-on packages are expected to integrate through compact extension shapes rather than by redefining core lifecycle semantics:

- **phase replacement**
- **phase overlay**
- **delegated posture**
- **route-out workflow**

## Layers

### `skills/`

Contains only the core skills registered by this package:

- `ramblings-brainstorming`
- `ramblings-brief-writing`
- `ramblings-writing-plans`
- `ramblings-implementing-plans`
- `ramblings-handoff`
- `ramblings-resume-from-handoff`
- `ramblings-archive`
- `ramblings-integration-creator`

### `plugin/`

Contains the OpenCode plugin registration and core command/tool wiring:

- injects only core commands
- registers the `conductor` planning agent
- exposes only the repo-prefixed `start-work` helper tools
- includes `create-integration` as an optional authoring helper for extension-pack scaffolding

## Default lifecycle

Default lifecycle is explicitly:

1. brainstorm
2. brief
3. plan
4. execute
5. handoff/resume
6. archive

This lifecycle is implemented around durable project-root `.ramblings/` artifacts and YAML checklist state.

`handoff`, `resume-from-handoff`, and `archive` are canonical default lifecycle phases, not optional extras.

### Verification policy

- Completion is a checkpoint tied to explicit evidence.
- Code edits alone do not satisfy completion.
- The package does not mandate one implementation ideology (for example, no mandated TDD, no mandatory careful-mode sequencing, no required review posture).

## Runtime surface and guardrails

- `start-work` is the execution entrypoint and handles continuation using checklist state, startup archive cleanup, and deterministic helper decisions.
- Commands are convenience entrypoints, not a full runtime scheduler.
- `conductor` remains a planning surface and is not used as a substitute execution orchestrator; it may draft/normalize an initial checklist before execution starts.
- The plugin avoids global bootstrap behavior and does not override existing user-defined commands/agents of the same name.
- `conductor` may use plugin-provided agents when available, but extension packs are optional and core-owned execution paths remain safe fallback.
- Non-core workflow methods and specialist packs are kept out of this package’s default surface.

When installed, extension packs should prefer specialist routing only when the match is clear; otherwise the generic core phase remains the fallback.

`start-work` emits optional guidance from checklist task `tags` (with optional `suggested_capability`) as a **pack-level advisory signal only**. For coding tasks, the recommended output is `ramblings-coding-flow`, which is then responsible for choosing any internal coding specialist. This is not a runtime selector registry, not automatic dispatch, and does not replace `/start-work` lifecycle ownership.

### Execution-core contract

`start-work` in `ramblings-core` assumes only:

- plan
- checklist / execution-state artifact
- compact handoff/resume continuity
- archive hygiene
- verification evidence policy

Execution requires the checklist artifact to exist before task execution proceeds; the plan itself is the semantic contract and does not carry live execution state. The checklist is therefore the current-state execution contract while execution is active.

Checklist artifacts should stay compact. Optional task fields such as `next_action`, `last_update`, `blocked_by`, and `unblock_when` may be omitted entirely when they do not add current-state value, rather than being serialized as `null` placeholders.

`conductor` drafts or normalizes the initial checklist; the orchestrator updates it as work progresses.

It does not require `ready-check`, review workflows, investigation/debugging helper packs, or method/posture systems to function as core execution.

Core continuity behavior is intentionally compact:

- recover the task objective quickly
- recover current status quickly
- recover execution phase quickly
- route back to the plan/checklist source of truth (plan = intent and risk context, checklist = live current-state)

Core archive behavior is intentionally compact:

- safely package completed/cancelled work units
- keep archived artifacts out of active discovery
- perform safe startup cleanup so discovery remains focused

## Installation and identity

Package identity is `ramblings-core`. Plugin wiring and exposed runtime are intentionally narrow and core-only, whether installed via git spec or local plugin path.
