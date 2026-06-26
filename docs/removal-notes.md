# Removal Notes (`ramblings-core`)

`ramblings-core` is now a bounded core package. The following non-core workflow surfaces were removed from this package:

## Removed command surfaces

- `start-feature`
- `challenge-me`
- `careful`
- `ready-check`
- `retro`
- `investigate`
- `grill-me`

## Removed agent surfaces

- `review` (`@reviewer` special orchestration path)

## Removed skill packs

- `ramblings-challenge-me`
- `ramblings-product-review`
- `ramblings-engineering-review`
- `ramblings-qa-review`
- `ramblings-devex-review`
- `ramblings-requesting-code-review`
- `ramblings-receiving-code-review`
- `ramblings-ready-check`
- `ramblings-retro`
- `ramblings-investigation`
- `ramblings-systematic-debugging`
- `ramblings-testing-strategy`
- `ramblings-triage`
- `ramblings-prototype`
- `ramblings-grill-me`

## Why removed

These surfaces are now considered specialized workflows, not part of `ramblings-core` execution core.

## Canonical retained lifecycle

- `office-hours` → `write-brief` → `write-plan` → `start-work` → `handoff` / `resume-from-handoff` → `archive`

The retained core adds value through compact handoff/resume continuity and archive hygiene while keeping verification policy, evidence requirements, and execution mechanics in scope.
