---
name: ramblings-brainstorming
description: Pre-brief/pre-plan exploration for discussion, requirement clarification, tradeoff shaping, and direction selection.
---

# Ramblings Brainstorming

## What this is
Use this skill for **pre-brief / pre-plan** exploration: discuss requirements, shape tradeoffs, and select direction before any brief or plan is finalized.

Use when users say they want to "think this through first", "design this", or "evaluate approaches".

## Behavioral principles
- **Clarify first**: pin down goal, users, outcomes, and constraints.
- **Bound early**: define scope, non-goals, fixed stack, and reuse obligations.
- **Compare narrowly**: evaluate a small set of realistic options.
- **Choose and commit**: recommend one path as soon as confidence is sufficient.
- **Route decisively**: move onward once design is stable.

## Flow
1. Clarify objective and constraints.  
2. Surface scope boundaries and compatibility assumptions.  
3. Explore 2–3 viable options with fit, tradeoffs, complexity, and long-term risk.  
4. Recommend one approach and justify it against constraints.  
5. Propose a few lightweight candidate tags if useful for downstream handoff (optional, non-binding).  
6. Decide: continue discussion, or route to next artifact.

## Routing
- Explicit request first: follow any user request to move to brief-writing or plan-writing.
- Metadata second: if `Tags` / `Suggested Capability` strongly indicates a specialized lane, route there first.
- Then conservative inference: converged decision -> `ramblings-brief-writing`; clear sequenced scope -> `ramblings-writing-plans`.
- Otherwise keep using this core phase as fallback (do not depend on any extension pack being present).

## Output (when useful)
When meaningful decisions emerge, save notes at:
`.ramblings/briefs/YYYY-MM-DD-<topic>.md`

Suggested compact note structure:
```markdown
- Objective
- Constraints
- Options considered
- Recommendation + rationale
- Open questions
- Candidate tags (optional)
- Next step
```

## Compact special cases
- **Website/app**: users, core flows/screens, data/services integration, MVP must-have.
- **DSL/config**: users, authoring ergonomics, syntax shape, compatibility, usage examples.
- **Existing-project feature**: impacted components/files, behavior to preserve, highest-risk integration points.
