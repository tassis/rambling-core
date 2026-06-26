import { hookReturnReminder, schedulerReminder } from "../reminders"
import {
  continuationOutcomeContract,
  executionOrchestratorContract,
  firstIterationSequentialPolicy,
} from "../start-work/continuation"

export const startWork = {
  description: "Start or resume execution from the active unfinished plan, after archive-first cleanup of completed/cancelled work",
  template: `Role: execution-entry contract for /start-work.
Use ramblings-implementing-plans in project-root .ramblings/ only.

${schedulerReminder}

${hookReturnReminder}

${executionOrchestratorContract}

Core:
- start or resume; do not assume a fresh run.
- archive-first startup cleanup is required: completed/cancelled units are archived (and active-area copies cleaned) before unfinished execution resumes.
- if archive-first cleanup is unsafe, ambiguous, conflicts with source-of-truth, or cannot be validated, stop and ask user.
- ignore .ramblings/archive/** during active discovery; treat it as historical record only.

Source-of-truth:
- locate the project-root .ramblings/ checklist/plan artifact only.
- choose checklist first, then plan status, then handoff when they disagree.
- if multiple active unfinished candidates or an unresolved conflict exists, ask user.

Execution:
- ${firstIterationSequentialPolicy}
- continue only when an active unfinished plan has runnable, independent work.
- work in plan order unless the plan explicitly allows another independent runnable lane.
- resolve dependencies before specialist dispatch; keep orchestrator-direct work narrow (control-plane, reconcile/verification, tiny synchronous checks, or no-viable-delegation).
- prefer subagent-first execution for bounded, independent specialist tasks.
- when preparing delegated work, plan task tags and capability hints may inform soft skill suggestions, but do not treat them as hard routing requirements.

Hard rules:
- no polling, no partial-output advancement, no dependent-work advancement without completion.
- reconcile terminal hooks first, verify second, then pick exactly one continuation outcome.
- do not treat code edits as completion: verify then write .ramblings/ state.
- if execution is not safe, emit Blocked or Replanning explicitly.

${continuationOutcomeContract}

Waiting / blocked / replanning / done / ask-user:
- Continue: run an active unfinished runnable task when available; do not idle in this state.
- Waiting: use only when required background work runs and no independent task is runnable.
- Blocked: record Blocked by / Unblock when / Next action.
- Replanning: record Replan reason, What changed, Plan sections to revise, Next planning action.
- Done: only after verification success and all required plan/checklist state is written back; no tasks remain blocked or in progress and no handoff claims remaining execution work.
- Ask-user: when source-of-truth cannot be resolved safely, no valid unfinished plan exists, or continuation would be unsafe.

State-writeback:
- write execution-state only to project-root .ramblings/ artifacts that own the active plan.

Tool contract:
- use repo-prefixed helper tools as needed:
  - ramblings_start_work_resolve
  - ramblings_start_work_reconcile_and_rerun
  - ramblings_start_work_record_blocked
- simple checklist begin/complete transitions may be direct only when no delegation, terminal-result handling, or continuation mechanics are involved.`
}
