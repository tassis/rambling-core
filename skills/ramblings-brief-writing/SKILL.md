---
name: ramblings-brief-writing
description: Discussion brief writing, direction capture, planning input, pre-plan artifact. Use when the user has converged enough on a direction to write down the chosen approach before implementation planning. Save brief artifacts under .ramblings/briefs/ and do not assume implementation starts immediately.
---

# Ramblings Brief Writing

Use this skill for converged decisions: turn discussion output into a **planning-input brief**, not an execution plan.

## Principle
- Trigger only when direction is chosen, not when still exploring.
- Goal: create a durable brief that seeds implementation planning.

## Where to write
Create: `.ramblings/briefs/YYYY-MM-DD-<topic>.md` (unless the user explicitly wants another path).

## Core behavior
1. Confirm discussion has converged and direction is decided.
2. Keep scope, constraints, assumptions, and open questions explicit.
3. Record rationale for the chosen direction.
4. Refine/confirm likely tags from discussion into lightweight hints.
5. Emit the standard brief structure and stop.

## Tag handoff (brief phase)
- Add compact optional tag hints only when they improve routing.
- Keep tags few, useful, and optional.
- `Suggested Capability` is a companion hint and should not replace tags.
- Do not fail or route away when tags are absent.

## Standard brief structure

```markdown
# [Topic] Brief

## Goal
## Context
## Assumptions
## Scope
## Non-goals
## Constraints
## Chosen Direction
## Alternatives Considered
## Open Questions
## Candidate Tags (optional)
## Next Step
```

## Writing principles
- Use concrete, short statements.
- Focus on planning input, not implementation tasks.
- If stack choices are given, treat them as constraints.
- Surface remaining uncertainty directly in Open Questions.

## Routing

- Explicit request wins: obey user intent to go to planning/execution phases.
- Then use `Tags` / `Suggested Capability`: if they point to a specialized-lane domain, try that first.
- Then infer from shape: if discussion is still exploratory, route back to `ramblings-brainstorming`.
- Otherwise keep this as the core brief-writing fallback.

## Specialized topics (compact)
- **DSL/language design**: target users, authoring style, syntax shape, valid-input examples, compatibility/parsing constraints, intentional non-goals.
- **Website/app design**: audience/use cases, flows, dependencies/data sources, framework constraints, rough structure.

## Explicit out-of-scope
- company-style feature specs
- formal technical designs
- stakeholder approval artifacts
- direct bug triage

Stop after producing the brief. If the user is ready to plan implementation, route to `ramblings-writing-plans`.
