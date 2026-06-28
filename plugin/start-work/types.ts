export type StartWorkTaskStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "cancelled"
  | "complete"

export type StartWorkExecutionState =
  | "running"
  | "waiting"
  | "blocked"
  | "replanning"
  | "cancelled"
  | "done"
  | "ask-user"

export type StartWorkContinuationKind =
  | "continue"
  | "waiting"
  | "blocked"
  | "replanning"
  | "done"
  | "ask-user"

export interface StartWorkChecklistTask {
  id: string
  title: string
  status: StartWorkTaskStatus
  blocked_by?: string
  unblock_when?: string
  next_action?: string
  last_update?: string
  tags?: string[]
  suggested_capability?: string
}

export interface StartWorkChecklistState {
  plan: string
  active_task: string | null
  execution_state: StartWorkExecutionState
  tasks: StartWorkChecklistTask[]
  notes?: string[]
}

export interface StartWorkSkillSuggestion {
  skill: string
  source: "tag" | "suggested_capability"
  signal: string
}

export interface StartWorkPlanCandidate {
  planPath: string
  checklistPath: string | null
  handoffPath: string | null
}

export interface StartWorkArchiveCandidate {
  planPath: string
  checklistPath: string | null
  handoffPath: string | null
  cleanupState: "completed" | "cancelled"
}

export interface StartWorkArchiveEligibilityInput {
  candidate: StartWorkArchiveCandidate
  checklist: StartWorkChecklistState | null
  handoffClaimsActiveWork?: boolean
  hasConsolidationAmbiguity?: boolean
}

export type StartWorkArchiveDecisionKind = "auto-archive" | "ask-user" | "defer"

export interface StartWorkArchiveDecision {
  kind: StartWorkArchiveDecisionKind
  reason: string
}

export interface StartWorkArchiveAction {
  archivePath: string
  archivedFiles: string[]
  removedActiveFiles: string[]
}

export interface StartWorkArtifactConflict {
  reason: string
  details: string[]
}

export interface StartWorkArchiveDiscoveryResult {
  kind: "none" | "defer" | "ask-user" | "auto-archive"
  reason: string
  candidates?: StartWorkArchiveCandidate[]
  decision?: StartWorkArchiveDecision
}

export type StartWorkArtifactResolution =
  | {
      kind: "resolved"
      candidate: StartWorkPlanCandidate
      checklist: StartWorkChecklistState | null
      archiveActions?: StartWorkArchiveAction[]
    }
  | {
      kind: "ask-user"
      reason: string
      candidates: StartWorkPlanCandidate[]
    }
  | {
      kind: "no-active-plan"
      reason: string
      archiveActions?: StartWorkArchiveAction[]
    }
  | {
      kind: "conflict"
      conflict: StartWorkArtifactConflict
    }

export type StartWorkTaskSelection =
  | {
      kind: "task"
      task: StartWorkChecklistTask
    }
  | {
      kind: "waiting"
      reason: string
      task: StartWorkChecklistTask | null
    }
  | {
      kind: "blocked"
      reason: string
      task: StartWorkChecklistTask | null
    }
  | {
      kind: "done"
      reason: string
    }
  | {
      kind: "ask-user"
      reason: string
      taskIds: string[]
    }
  | {
      kind: "replanning"
      reason: string
    }

export interface StartWorkContinuation {
  kind: StartWorkContinuationKind
  reason: string
  activeTaskId: string | null
  note?: string
}

export type StartWorkArtifactResolutionKind = StartWorkArtifactResolution["kind"]

export interface StartWorkResolveToolMetadata {
  ok: true
  artifactResolutionKind: StartWorkArtifactResolutionKind
  checklistPath: string | null
  planPath: string | null
  taskSelectionKind?: StartWorkTaskSelection["kind"]
  continuationKind: StartWorkContinuationKind
  activeTaskId: string | null
  reason: string
  note: string | null
  archiveActions: StartWorkArchiveAction[]
  skillSuggestion: StartWorkSkillSuggestion | null
}

export interface StartWorkRecordBlockedToolMetadata {
  ok: true
  taskId: string
  checklistPath: string
  executionState: StartWorkExecutionState
  blockedBy: string
  unblockWhen: string
  nextAction: string
}

export interface StartWorkRerunContinuationToolMetadata {
  ok: true
  checklistPath: string
  planPath: string
  continuationKind: StartWorkContinuationKind
  activeTaskId: string | null
  reason: string
  note: string | null
}

export interface StartWorkToolErrorMetadata {
  ok: false
  code: "CHECKLIST_NOT_FOUND" | "CHECKLIST_PARSE_FAILED" | "CHECKLIST_VALIDATION_FAILED"
  checklistPath?: string
  taskId?: string
}

export type StartWorkTerminalResultStatus = "recorded" | "already-handled" | "mismatch" | "error"

export interface StartWorkRecordTerminalToolMetadata {
  /**
   * `ok` reflects workflow success for the terminal-result helper.
   * `recorded` and `already-handled` are successful outcomes; `mismatch` and `error` are failures.
   */
  ok: boolean
  status: StartWorkTerminalResultStatus
  taskId: string
  checklistPath: string
  executionState: StartWorkExecutionState
  message: string
}
