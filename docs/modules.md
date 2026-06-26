# ramblings-core module inventory

This is the canonical keep/remove/out-of-scope map for this repository.

## Keep in `ramblings-core`

### Commands

- `plugin/commands/office-hours.ts`
- `plugin/commands/write-brief.ts`
- `plugin/commands/write-plan.ts`
- `plugin/commands/start-work.ts`
- `plugin/commands/handoff.ts`
- `plugin/commands/resume-from-handoff.ts`
- `plugin/commands/archive.ts`

### Agent

- `plugin/agents/conductor.ts`

### Skills

- `skills/ramblings-brainstorming/SKILL.md`
- `skills/ramblings-brief-writing/SKILL.md`
- `skills/ramblings-writing-plans/SKILL.md`
- `skills/ramblings-implementing-plans/SKILL.md`
- `skills/ramblings-handoff/SKILL.md`
- `skills/ramblings-resume-from-handoff/SKILL.md`
- `skills/ramblings-archive/SKILL.md`

### Runtime / helpers

- `plugin/start-work/*`
- `plugin/tools/start-work.ts`

### Core lifecycle

Default lifecycle for this package:

`brainstorm → brief → plan → execute → handoff/resume → archive`

Verification is part of this core boundary as a policy for completion evidence. Method families such as review, challenge, triage, investigation, testing-strategy, debug, or other specialist styles are intentionally not required by default.

### Execution-core contract

`ramblings-core` execution depends on these minimum elements only:

- a plan
- a checklist / execution-state artifact
- compact handoff/resume continuity
- archive hygiene
- verification evidence policy

This means the core package does **not** require:

- `ready-check`
- review flows
- investigation/debugging helper flows
- posture/method features such as TDD-specific or careful-mode behavior

Core handoff/resume stays minimal:

- restore the current objective quickly
- restore current task / status quickly
- restore the current execution phase quickly
- point back to plan/checklist source-of-truth artifacts

Core archive stays minimal:

- archive safely completed or cancelled work units
- keep archived artifacts out of active discovery
- allow startup cleanup to reduce active-surface noise and token cost

Core completion policy stays strict:

- completion must rely on observable evidence
- code edits alone are not enough to mark work complete

## Remove from this project

### Commands

- `plugin/commands/start-feature.ts`
- `plugin/commands/challenge-me.ts`
- `plugin/commands/careful.ts`
- `plugin/commands/ready-check.ts`
- `plugin/commands/retro.ts`
- `plugin/commands/investigate.ts`
- `plugin/commands/grill-me.ts`

### Agent

- `plugin/agents/review.ts`

### Skills

- `skills/ramblings-challenge-me/SKILL.md`
- `skills/ramblings-product-review/SKILL.md`
- `skills/ramblings-engineering-review/SKILL.md`
- `skills/ramblings-qa-review/SKILL.md`
- `skills/ramblings-devex-review/SKILL.md`
- `skills/ramblings-requesting-code-review/SKILL.md`
- `skills/ramblings-receiving-code-review/SKILL.md`
- `skills/ramblings-ready-check/SKILL.md`
- `skills/ramblings-retro/SKILL.md`
- `skills/ramblings-investigation/SKILL.md`
- `skills/ramblings-systematic-debugging/SKILL.md`
- `skills/ramblings-testing-strategy/SKILL.md`
- `skills/ramblings-triage/SKILL.md`
- `skills/ramblings-prototype/SKILL.md`
- `skills/ramblings-grill-me/SKILL.md`

No removed items are preserved here as dormant defaults.

## Explicitly out of scope for this refactor

All future specialized workflows are intentionally outside the current `ramblings-core` package:

- review-oriented packs
- readiness/reporting packs
- investigation/debug/testing-support packs
- posture/method packs
- umbrella goal-oriented and detailed guided flows
- any runtime package-splitting design beyond removing them from `ramblings-core`
