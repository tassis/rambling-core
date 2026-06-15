---
name: ramblings-triage
description: Triage, issue intake, bug-or-feature sorting, information gathering, next-step routing. Use when a report, request, or problem statement is still messy and the first job is to classify it, identify missing information, and decide whether it should go to investigation, debugging, spec writing, or implementation planning.
---

# Ramblings Triage

Use this skill when the request is still too messy to act on directly.

## Goal

Turn a vague report or request into a clearer next action.

## Questions to answer

1. Is this a bug, feature request, maintenance task, or unclear mix?
2. What information is missing?
3. What artifact or workflow should happen next?

## Triage flow

### 1. Classify the request

Sort it roughly into one of:

- bug / regression;
- feature / improvement;
- investigation needed;
- spec/discussion needed;
- implementation-ready task.

### 2. Identify missing context

Look for missing pieces such as:

- reproduction steps;
- exact files or scripts involved;
- expected vs actual behavior;
- user intent or scope;
- environment or dependency assumptions.

### 3. Decide the next route

Typical routes:

- `ramblings-investigation`
- `ramblings-systematic-debugging`
- `ramblings-spec-writing`
- `ramblings-writing-plans`

## Suggested output

```markdown
## Triage Summary

**Classification:**
- [bug / feature / investigation / spec / implementation-ready]

**Missing information:**
- [item]

**Current confidence:**
- [brief note]

**Recommended next step:**
- [action]

**Suggested next skill:**
- `ramblings-*`
```

## Guidance

- do not over-analyze at intake;
- do just enough sorting to send the work to the correct next stage;
- if the codebase can answer factual questions, inspect it before asking the user.
