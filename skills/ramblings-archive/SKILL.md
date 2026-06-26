---
name: ramblings-archive
description: Archive completed or near-completed work units, consolidate multiple related specs into one canonical spec, clean obsolete active .ramblings artifacts, preserve older specs as archive history, and package archive outputs using the existing .ramblings/archive flow. Use when the user asks to archive, 歸檔, 整理 completed work, clean up old specs, merge overlapping specs into one canonical spec, or reduce active .ramblings clutter while preserving historical context.
---

# Ramblings Archive

Use only for cleanup after work is done (or near-done), not active delivery.

## Decision-first use policy

Use this skill only when the work is in a **cleanup/archival phase**.

- **Do use:** archive completed work, consolidate overlapping specs, de-noise `.ramblings/`, preserve history.
- **Do not use:** active implementation, debugging, reviewing, or new-spec first-principles planning.

## Core decision principles

1. **Canonical-first:** produce one canonical workstream spec when possible.
2. **History-preserved:** keep older specs as archived context, never fabricate missing execution details.
3. **Readiness-gated:** archive only when completion checks pass.
4. **Active area clean:** after archiving, remove obsolete active duplicates; keep only still-current authoritative artifacts.

## 5-step behavior

### 1) Collect evidence
Collect plan, checklist (if present), related specs, handoffs, ready-checks, and any debug/retro/review notes.

### 2) Resolve canonicality (decision principle 1)
Decide one canonical outcome:

- generate a new merged canonical spec from overlaps, **or**
- keep one existing canonical spec when merging adds no value.

If the workstream is fully finished, archive the final canonical spec too unless there is a specific reason it must remain active.

Never keep multiple overlapping active canonical specs.

### 3) Preserve context (decision principle 2)
Move/retain obsolete specs as historical archive material with `summary.md`, `spec-index.md`, or compact notes.

### 4) Readiness gate (decision principle 3)
Archive only if all apply:

- plan complete;
- checklist complete if present;
- no active `in_progress` / `blocked` execution state;
- no handoff claiming pending execution;
- ready-check (if relevant) supports archival.

### 5) Package + cleanup (principles 3–4)

Use the existing flow:

`.ramblings/archive/YYYY-MM-DD-<topic>/`

Minimum required in package: `plan.md` plus `checklist.md` or `checklist.yaml`.

Optional: `spec.md`, `summary.md`, `spec-index.md`, `handoff.md`, `ready-check.md`, `retro.md`, `debug.md`.

Then clean active area: keep only still-canonical active items and remove obsolete overlap.

## Stop now (ask user)

- canonical source-of-truth is unclear or requires guesswork;
- work not complete enough to archive;
- contradictory active/in-progress states remain;
- multiple plausible canonical specs remain.

## Suggested compact output

```markdown
## Archive Review

- Work unit: <name>
- Archive-ready: yes / no
- Canonical decision: <new canonical | keep existing canonical | unresolved>
- Keep active: <items>
- Archive package: `.ramblings/archive/YYYY-MM-DD-<topic>/`
- Open ambiguities: <items>
```
