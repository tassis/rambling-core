---
name: ramblings-grill-me
description: Grill me, stress-test my idea, challenge by questions, one-question-at-a-time review, ambiguity reduction. Use when the user explicitly wants rigorous questioning of a plan, idea, spec, architecture, or approach instead of immediate advice. Ask one important question at a time, use the codebase when it can answer, and push toward clarity before execution.
---

# Ramblings Grill Me

Use this skill when the user explicitly asks to be challenged through questions.

This skill is for phrases and intents like:

- "grill me"
- "stress-test this"
- "challenge my thinking"
- "ask me the hard questions"
- "pressure-test this idea"

## Goal

Reduce ambiguity and expose weak assumptions before the work moves forward.

## Core behavior

Ask one important question at a time.

After each answer:

1. use it to refine your understanding;
2. ask the next most important unresolved question;
3. stop when the design or decision is clear enough.

## Codebase-first rule

If the repository can answer a question, inspect the codebase instead of asking the user.

Ask the user only when:

- the answer depends on intent, preference, or product judgment;
- the repository cannot answer it;
- a design choice is genuinely open.

## Question quality

Good questions should:

- expose assumptions;
- clarify scope or constraints;
- test whether the proposal solves the right problem;
- reveal likely failure points or complexity traps.

Avoid trivia, performative interrogation, or multiple stacked questions at once.

## Helpful framing

For each question, when useful, include one of these:

- why this question matters;
- what trade-off it affects;
- what a strong answer would clarify.

## Suggested interaction style

Use this pattern:

```markdown
## Current challenge
[one focused question]

**Why this matters:**
- [brief reason]
```

Then wait for the answer before asking the next one.

## When to stop

Stop grilling when:

- the main ambiguities are resolved;
- the remaining questions are minor;
- the user wants to move into spec, plan, or implementation.

At that point, suggest the next skill if appropriate, such as:

- `ramblings-spec-writing`
- `ramblings-writing-plans`
- `ramblings-product-review`
- `ramblings-engineering-review`
- `ramblings-qa-review`

## What not to do

- do not ask five questions at once;
- do not re-ask what the codebase already answers;
- do not drift into implementation while key questions remain unresolved.
