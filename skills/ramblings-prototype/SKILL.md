---
name: ramblings-prototype
description: Prototype, throwaway experiment, feasibility spike, design spike, de-risking build. Use when the goal is to answer a focused question quickly before committing to a full implementation, such as testing a UI direction, validating a DSL shape, checking an integration path, or proving technical feasibility.
---

# Ramblings Prototype

Use this skill when the right next step is a throwaway or semi-throwaway experiment.

## Goal

Answer a focused question quickly without pretending the result is production-ready.

## Good prototype questions

- Can this UI direction work?
- Is this DSL shape expressive enough?
- Can this integration path function at all?
- Is this architecture idea viable before full build-out?

## Prototype rules

1. State the question being answered.
2. Define what success or failure would look like.
3. Keep scope intentionally narrow.
4. Do not mistake a spike for finished implementation.

## Output location

If a written artifact is helpful, record it under:

```text
.ramblings/specs/YYYY-MM-DD-<topic>-prototype.md
```

## Suggested output

```markdown
## Prototype Goal

## Question being tested

## Scope limits

## What was tried

## What was learned

## Recommended next step
```

## Guidance

- prefer the smallest experiment that answers the question;
- call out what remains unproven;
- if the prototype is successful and the user wants to continue, move to `ramblings-spec-writing` or `ramblings-writing-plans`.
