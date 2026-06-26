import { tool } from "@opencode-ai/plugin"
import { recordBlockedTask, reconcileAndRerunContinuation, resolveStartWorkLoop } from "../start-work/index"
import { readChecklistStateDetailed, writeChecklistState } from "../start-work/checklist"
import type {
  StartWorkRecordBlockedToolMetadata,
  StartWorkResolveToolMetadata,
  StartWorkToolErrorMetadata,
} from "../start-work/types"

function okToolResult<T extends object>(output: string, metadata?: T) {
  return {
    output,
    metadata,
  }
}

function errorToolResult(code: StartWorkToolErrorMetadata["code"], message: string, metadata?: Omit<StartWorkToolErrorMetadata, "ok" | "code">) {
  return {
    output: `${code}: ${message}`,
    metadata: {
      ok: false,
      code,
      ...metadata,
    },
  }
}

const projectRootArgs = {
  project_root: tool.schema.string().describe("Project root path")
} as const

const projectRootChecklistArgs = {
  project_root: tool.schema.string().describe("Project root path"),
  checklist_path: tool.schema.string().describe("Checklist path relative to the project root")
} as const

const projectRootChecklistTaskArgs = {
  ...projectRootChecklistArgs,
  task_id: tool.schema.string().describe("Task identifier to reconcile terminal outcome for"),
  note: tool.schema.string().describe("Update note written to checklist state")
} as const

export const startWorkTools = {
  ramblings_start_work_resolve: tool({
    description: "Resolve the active start-work candidate and continuation outcome.",
    args: projectRootArgs,
    async execute({ project_root }: { project_root: string }) {
      const resolution = await resolveStartWorkLoop(project_root)

      if ("checklistPath" in resolution) {
        const metadata: StartWorkResolveToolMetadata = {
          ok: true,
          artifactResolutionKind: "resolved",
          checklistPath: resolution.checklistPath,
          planPath: resolution.checklist.plan,
          taskSelectionKind: resolution.taskSelection.kind,
          continuationKind: resolution.continuation.kind,
          activeTaskId: resolution.continuation.activeTaskId,
          reason: resolution.continuation.reason,
          note: resolution.continuation.note ?? null,
          archiveActions: resolution.archiveActions ?? [],
        }

        return okToolResult(`Resolved start-work state for ${project_root}.`, metadata)
      }

      if ("artifactResolutionKind" in resolution) {
        const metadata: StartWorkResolveToolMetadata = {
          ok: true,
          artifactResolutionKind: resolution.artifactResolutionKind,
          checklistPath: null,
          planPath: null,
          continuationKind: resolution.continuation.kind,
          activeTaskId: resolution.continuation.activeTaskId,
          reason: resolution.continuation.reason,
          note: resolution.continuation.note ?? null,
          archiveActions: [],
        }

        return okToolResult(`Resolved start-work state for ${project_root}.`, metadata)
      }

      const metadata: StartWorkResolveToolMetadata = {
        ok: true,
        artifactResolutionKind: "resolved",
        checklistPath: null,
        planPath: null,
        continuationKind: resolution.kind,
        activeTaskId: resolution.activeTaskId,
        reason: resolution.reason,
        note: resolution.note ?? null,
        archiveActions: [],
      }

      return okToolResult(`Resolved start-work state for ${project_root}.`, metadata)
    }
  }),

  ramblings_start_work_record_blocked: tool({
    description: "Mark a checklist task blocked with required blocker metadata.",
    args: {
      ...projectRootChecklistArgs,
      task_id: tool.schema.string().describe("Task identifier to mark blocked"),
      blocked_by: tool.schema.string().describe("Concrete blocker"),
      unblock_when: tool.schema.string().describe("Observable condition that clears the blocker"),
      next_action: tool.schema.string().describe("Immediate next action to resolve or route around the blocker"),
      note: tool.schema.string().describe("Update note written to checklist state")
    } as const,
    async execute({ project_root, checklist_path, task_id, blocked_by, unblock_when, next_action, note }: { project_root: string; checklist_path: string; task_id: string; blocked_by: string; unblock_when: string; next_action: string; note: string }) {
      const readResult = await readChecklistStateDetailed(project_root, checklist_path)
      if (readResult.kind !== "ok") {
        return checklistReadErrorToolResult(readResult, {
          checklistPath: checklist_path,
          taskId: task_id,
        })
      }
      const checklist = readResult.checklist
      const updated = recordBlockedTask(checklist, task_id, blocked_by, unblock_when, next_action, note)
      await writeChecklistState(project_root, checklist_path, updated)
      const metadata: StartWorkRecordBlockedToolMetadata = {
        ok: true,
        taskId: task_id,
        checklistPath: checklist_path,
        executionState: updated.execution_state,
        blockedBy: blocked_by,
        unblockWhen: unblock_when,
        nextAction: next_action,
      }

      return okToolResult(`Marked ${task_id} blocked in ${checklist_path}.`, metadata)
    }
  }),

  ramblings_start_work_reconcile_and_rerun: tool({
    description: "Perform deterministic terminal reconciliation and rerun continuation without dispatching the next lane.",
    args: {
      ...projectRootChecklistTaskArgs,
      note: tool.schema.string().describe("Reconciliation note written to checklist state"),
    } as const,
    async execute({ project_root, checklist_path, task_id, note }: { project_root: string; checklist_path: string; task_id: string; note: string }) {
      const readResult = await readChecklistStateDetailed(project_root, checklist_path)
      if (readResult.kind !== "ok") {
        return checklistReadErrorToolResult(readResult, { checklistPath: checklist_path, taskId: task_id })
      }

      const result = reconcileAndRerunContinuation(readResult.checklist, task_id, note)
      await writeChecklistState(project_root, checklist_path, result.checklist)

      return okToolResult(
        `Reconciled terminal result and recomputed continuation for ${task_id} in ${checklist_path}.`,
        {
          ok: true,
          checklistPath: checklist_path,
          taskId: task_id,
          executionState: result.checklist.execution_state,
          continuationKind: result.continuation.kind,
          activeTaskId: result.continuation.activeTaskId,
          reason: result.continuation.reason,
          note: result.continuation.note ?? null,
        },
      )
    }
  }),

} as const

function checklistReadErrorToolResult(
  readResult: Exclude<Awaited<ReturnType<typeof readChecklistStateDetailed>>, { kind: "ok" }>,
  metadata?: Omit<StartWorkToolErrorMetadata, "ok" | "code">,
) {
  switch (readResult.kind) {
    case "not-found":
      return errorToolResult("CHECKLIST_NOT_FOUND", readResult.message, metadata)
    case "validation-failed":
      return errorToolResult("CHECKLIST_VALIDATION_FAILED", readResult.message, metadata)
    case "parse-failed":
      return errorToolResult("CHECKLIST_PARSE_FAILED", readResult.message, metadata)
  }
}
