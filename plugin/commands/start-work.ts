import { hookReturnReminder, schedulerReminder } from "../reminders"
import {
  continuationOutcomeContract,
  executionOrchestratorContract,
  firstIterationSequentialPolicy,
} from "../start-work/continuation"

export const startWork = {
  description: "Start or resume execution from the active unfinished plan, after archive-first cleanup of completed/cancelled work",
  template: `Use ramblings-implementing-plans. Enter execution mode for the current project's root .ramblings/ artifacts.

${schedulerReminder}

${hookReturnReminder}

${executionOrchestratorContract}

Treat this as /start-work semantics:
- start or resume; do not assume this always starts from scratch
- locate the project-root .ramblings/ directory only
- identify the active unfinished YAML checklist/plan safely before editing
- first evaluate completed and cancelled work units for startup archive cleanup before selecting unfinished work
- if completed/cancelled work units are safely archive-eligible, archive them first, clean the active-area copies, and only then continue unfinished work
- if completed/cancelled cleanup is unsafe, ambiguous, conflicts on source of truth, or otherwise cannot be validated safely, stop at explicit ask-user rather than continuing unfinished work
- ignore .ramblings/archive/** during active plan/checklist discovery; archived artifacts are historical records, not runnable candidates
- prefer a separate YAML checklist/execution-state artifact over inline plan status
- treat handoffs as hints, not stronger than an active checklist
- if multiple unfinished plans are plausible, do not guess; ask the user to choose
- if no unfinished plan can be identified safely, stop and tell the user to create or choose a plan explicitly

${firstIterationSequentialPolicy}

Source-of-truth contract:
- when checklist, plan status, and handoff disagree, prefer checklist first, then plan status, then handoff
- if artifact conflict cannot be resolved safely, stop and ask the user

Execution contract:
- if an active unfinished plan exists and a runnable task is available, continue; do not idle
- work task-by-task in plan order unless the plan explicitly allows another independent runnable task
- plan lanes/dependencies before dispatching specialist work
- prefer subagent-first execution for bounded, specialist-shaped, independently finishable work
- dispatch only independent work
- keep orchestrator-direct work narrow: control-plane, terminal reconciliation, verification, very small synchronous checks, or no-viable-delegation cases
- do not turn orchestrator self-parallelism into a substitute for ordinary discovery, research, review, or implementation delegation
- do not poll running jobs or use partial running output as completion evidence
- reconcile terminal results before verification
- final verification is orchestrator-owned after reconciliation
- writing code is not enough to finish a task; verify, re-check completion criteria, then update the project-root .ramblings/ plan/checklist state
- if execution cannot safely continue, enter blocked or replanning explicitly instead of guessing

${continuationOutcomeContract}

Waiting contract:
- if required background work is still running and no other independent runnable task is available, enter a valid waiting state rather than blocked or complete
- while waiting, do not poll running jobs, do not use partial output as completion evidence, and do not advance dependent work

Blocked contract:
- record Blocked by, Unblock when, and Next action

Replanning contract:
- if the plan itself is no longer a safe execution contract, record Replan reason, What changed, Plan sections to revise, and Next planning action, then route back to planning

Completion rules:
- do not declare a task complete until verification succeeds and plan/checklist state is written back
- do not declare the overall plan complete until all tasks are complete, no tasks remain blocked or in progress, required verification is done, and current handoffs do not claim remaining execution work

State-writeback contract:
- execution-state updates must be written only to the project-root .ramblings/ artifacts that own the current plan state

Tool contract:
- when using the plugin's deterministic helper tools, use the repo-prefixed names:
  - \`ramblings_start_work_resolve\`
  - \`ramblings_start_work_record_terminal\`
  - \`ramblings_start_work_reconcile_and_rerun\`
  - \`ramblings_start_work_record_blocked\`
  - \`ramblings_start_work_rerun_continuation\`
- simple begin/complete checklist state transitions may still be written directly when no delegation, terminal-result handling, or continuation mechanics are involved
- use the helper tools for artifact resolution, terminal-result recording, terminal reconciliation + rerun, blocker recording, and continuation decisions`
}
