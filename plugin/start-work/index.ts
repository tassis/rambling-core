import { applyContinuationWriteback, setActiveTask, updateChecklistTask, writeChecklistState } from "./checklist"
import { decideStartWorkContinuation, type StartWorkContinuationInput } from "./continuation"
import { getNextRunnableTask, resolveStartWorkArtifacts } from "./artifacts"
import {
  type StartWorkArtifactResolutionKind,
  type StartWorkChecklistState,
  type StartWorkContinuation,
  type StartWorkRecordTerminalToolMetadata,
  type StartWorkSkillSuggestion,
  type StartWorkTaskSelection,
} from "./types"
import { inferStartWorkSkillSuggestion } from "./skill-suggestion"

export interface StartWorkLoopState {
  checklistPath: string
  checklist: StartWorkChecklistState
  taskSelection: StartWorkTaskSelection
  continuation: StartWorkContinuation
  skillSuggestion?: StartWorkSkillSuggestion
  archiveActions?: Array<{
    archivePath: string
    archivedFiles: string[]
    removedActiveFiles: string[]
  }>
}

export interface StartWorkLoopContinuationState {
  artifactResolutionKind: Exclude<StartWorkArtifactResolutionKind, "resolved">
  continuation: StartWorkContinuation
}

export async function resolveStartWorkLoop(
  projectRoot: string,
): Promise<StartWorkLoopState | StartWorkLoopContinuationState | StartWorkContinuation> {
  const artifactResolution = await resolveStartWorkArtifacts(projectRoot)

  if (artifactResolution.kind !== "resolved") {
    return {
      artifactResolutionKind: artifactResolution.kind,
      continuation: decideStartWorkContinuation({ artifactResolution }),
    }
  }

  if (!artifactResolution.checklist || !artifactResolution.candidate.checklistPath) {
    return {
      kind: "ask-user",
      reason: "The active plan does not yet have a YAML checklist execution-state artifact. Create or select one before continuing execution.",
      activeTaskId: null,
      note: artifactResolution.candidate.planPath,
    }
  }

  const taskSelection = getNextRunnableTask(artifactResolution.checklist)
  const continuation = decideStartWorkContinuation({
    artifactResolution,
    checklist: artifactResolution.checklist,
    taskSelection,
  })
  const skillSuggestion = getActiveTaskSuggestion(taskSelection)

  return {
    checklistPath: artifactResolution.candidate.checklistPath,
    checklist: artifactResolution.checklist,
    taskSelection,
    continuation,
    skillSuggestion,
    archiveActions: artifactResolution.archiveActions,
  }
}

function getActiveTaskSuggestion(taskSelection: StartWorkTaskSelection): StartWorkSkillSuggestion | undefined {
  if (taskSelection.kind === "task" || taskSelection.kind === "waiting" || taskSelection.kind === "blocked") {
    const suggestion = inferStartWorkSkillSuggestion(taskSelection.task)

    if (suggestion) {
      return suggestion
    }
  }

  return undefined
}

export function recordDelegatedLaneTerminalResult(
  checklist: StartWorkChecklistState,
  taskId: string,
  note: string,
): StartWorkChecklistState {
  return recordDelegatedLaneTerminalOutcome(checklist, taskId, note).checklist
}

export function recordDelegatedLaneTerminalOutcome(
  checklist: StartWorkChecklistState,
  taskId: string,
  note: string,
):
  | { kind: "recorded"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string }
  | { kind: "already-handled"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string }
  | { kind: "error"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string } {
  const task = checklist.tasks.find((candidate) => candidate.id === taskId)
  if (!task) {
    return terminalOutcome(
      checklist,
      taskId,
      "error",
      `Task ${taskId} was not found in the checklist.`,
    )
  }

  if (task.status !== "in_progress" || task.blocked_by == null || task.unblock_when == null) {
    return terminalOutcome(
      updateChecklistTask(checklist, taskId, {
        last_update: note,
      }),
      taskId,
      "already-handled",
      `No delegated-wait state remains for ${taskId}.`,
    )
  }

  const updated = setActiveTask(
    updateChecklistTask(checklist, taskId, {
      blocked_by: undefined,
      unblock_when: undefined,
      next_action: undefined,
      last_update: note,
    }),
    taskId,
    "running",
  )

  return terminalOutcome(updated, taskId, "recorded", `Recorded terminal result for ${taskId}.`)
}

function terminalOutcome(
  checklist: StartWorkChecklistState,
  taskId: string,
  kind: "recorded" | "already-handled" | "error",
  message: string,
):
  | { kind: "recorded"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string }
  | { kind: "already-handled"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string }
  | { kind: "error"; checklist: StartWorkChecklistState; metadata: StartWorkRecordTerminalToolMetadata; message: string } {
  const metadata: StartWorkRecordTerminalToolMetadata = {
    ok: kind === "recorded" || kind === "already-handled",
    status: kind,
    taskId,
    checklistPath: "",
    executionState: checklist.execution_state,
    message,
  }

  return { kind, checklist, metadata, message }
}

export function recordBlockedTask(
  checklist: StartWorkChecklistState,
  taskId: string,
  blockedBy: string,
  unblockWhen: string,
  nextAction: string,
  note: string,
): StartWorkChecklistState {
  const blockedState = updateChecklistTask(checklist, taskId, {
    status: "blocked",
    blocked_by: blockedBy,
    unblock_when: unblockWhen,
    next_action: nextAction,
    last_update: note,
  })

  return setActiveTask(blockedState, taskId, "blocked")
}

export function recordReplanningState(
  checklist: StartWorkChecklistState,
  taskId: string | null,
  note: string,
): StartWorkChecklistState {
  const updatedChecklist = taskId
    ? updateChecklistTask(checklist, taskId, {
        next_action: "route back to planning",
        last_update: note,
      })
    : checklist

  return setActiveTask(updatedChecklist, taskId, "replanning")
}

export async function writeLoopChecklist(
  projectRoot: string,
  loopState: StartWorkLoopState,
  checklist: StartWorkChecklistState,
) {
  await writeChecklistState(projectRoot, loopState.checklistPath, checklist)
}

export function rerunContinuation(checklist: StartWorkChecklistState): StartWorkContinuation {
  const taskSelection = getNextRunnableTask(checklist)
  const input: StartWorkContinuationInput = { checklist, taskSelection }
  return decideStartWorkContinuation(input)
}

export function reconcileDelegatedLaneTerminalResult(
  checklist: StartWorkChecklistState,
  taskId: string,
  note: string,
): StartWorkChecklistState {
  const task = checklist.tasks.find((candidate) => candidate.id === taskId)

  if (!task) {
    return checklist
  }

  if (task.status === "in_progress" && task.blocked_by != null && task.unblock_when != null) {
    return setActiveTask(
      updateChecklistTask(checklist, taskId, {
        blocked_by: undefined,
        unblock_when: undefined,
        next_action: undefined,
        last_update: note,
      }),
      taskId,
      "running",
    )
  }

  return setActiveTask(updateChecklistTask(checklist, taskId, { last_update: note }), taskId, checklist.execution_state)
}

export function reconcileAndRerunContinuation(
  checklist: StartWorkChecklistState,
  taskId: string,
  note: string,
): { checklist: StartWorkChecklistState; continuation: StartWorkContinuation } {
  const reconciled = reconcileDelegatedLaneTerminalResult(checklist, taskId, note)
  const continuation = rerunContinuation(reconciled)

  switch (continuation.kind) {
    case "waiting":
    case "done":
    case "replanning":
    case "ask-user":
      return {
        checklist: applyContinuationWriteback(reconciled, continuation as any),
        continuation,
      }
    case "continue":
      return { checklist: reconciled, continuation }
  }

  return { checklist: reconciled, continuation }
}
