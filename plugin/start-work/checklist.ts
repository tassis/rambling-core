import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import YAML from "yaml"
import {
  type StartWorkChecklistState,
  type StartWorkChecklistTask,
  type StartWorkExecutionState,
  type StartWorkTaskStatus,
} from "./types"

const EXECUTION_STATES: StartWorkExecutionState[] = ["running", "waiting", "blocked", "replanning", "cancelled", "done", "ask-user"]
const TASK_STATUSES: StartWorkTaskStatus[] = ["not_started", "in_progress", "blocked", "cancelled", "complete"]

export interface StartWorkTaskPatch {
  status?: StartWorkTaskStatus
  blocked_by?: string
  unblock_when?: string
  next_action?: string
  last_update?: string
}

export function updateChecklistTask(
  checklist: StartWorkChecklistState,
  taskId: string,
  patch: StartWorkTaskPatch,
): StartWorkChecklistState {
  return {
    ...checklist,
    tasks: checklist.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            ...patch,
          }
        : task,
    ),
  }
}

export function setActiveTask(
  checklist: StartWorkChecklistState,
  activeTaskId: string | null,
  executionState?: StartWorkExecutionState,
): StartWorkChecklistState {
  return {
    ...checklist,
    active_task: activeTaskId,
    execution_state: executionState ?? checklist.execution_state,
  }
}

export function applyContinuationWriteback(
  checklist: StartWorkChecklistState,
  continuation: { kind: "waiting" | "done" | "replanning" | "ask-user"; activeTaskId: string | null; reason: string; note?: string },
): StartWorkChecklistState {
  const updatedChecklist = continuation.activeTaskId
    ? updateChecklistTask(checklist, continuation.activeTaskId, {
        last_update: continuation.note ?? continuation.reason,
      })
    : checklist

  return setActiveTask(
    updatedChecklist,
    continuation.kind === "done" ? null : continuation.activeTaskId ?? checklist.active_task,
    continuation.kind,
  )
}

export async function writeChecklistState(
  projectRoot: string,
  checklistPath: string,
  checklist: StartWorkChecklistState,
) {
  const absolutePath = path.isAbsolute(checklistPath)
    ? checklistPath
    : path.join(projectRoot, checklistPath)

  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, serializeChecklistState(checklist), "utf8")
}

export async function readChecklistState(
  projectRoot: string,
  checklistPath: string,
): Promise<StartWorkChecklistState | null> {
  const result = await readChecklistStateDetailed(projectRoot, checklistPath)
  return result.kind === "ok" ? result.checklist : null
}

export type ReadChecklistStateResult =
  | { kind: "ok"; checklist: StartWorkChecklistState }
  | { kind: "not-found"; message: string }
  | { kind: "parse-failed"; message: string }
  | { kind: "validation-failed"; message: string }

export async function readChecklistStateDetailed(
  projectRoot: string,
  checklistPath: string,
): Promise<ReadChecklistStateResult> {
  const absolutePath = path.isAbsolute(checklistPath)
    ? checklistPath
    : path.join(projectRoot, checklistPath)

  try {
    const text = await readFile(absolutePath, "utf8")
    try {
      return {
        kind: "ok",
        checklist: parseChecklistState(text),
      }
    } catch (error) {
      return {
        kind: classifyChecklistParseError(error),
        message: error instanceof Error ? error.message : String(error),
      }
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        kind: "not-found",
        message: `Checklist file could not be found at ${absolutePath}.`,
      }
    }

    return {
      kind: "parse-failed",
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

export function serializeChecklistState(checklist: StartWorkChecklistState) {
  const normalized = {
    plan: checklist.plan,
    active_task: checklist.active_task,
    execution_state: checklist.execution_state,
    tasks: checklist.tasks.map(serializeTaskCanonical),
    notes: checklist.notes && checklist.notes.length > 0 ? checklist.notes : undefined,
  }

  return YAML.stringify(normalized, {
    indent: 2,
    lineWidth: 0,
    minContentWidth: 0,
  })
}

export function parseChecklistState(text: string): StartWorkChecklistState {
  const parsed = YAML.parse(text)

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Checklist YAML did not parse to an object.")
  }

  const checked = parseChecklistShape(parsed)

  return {
    plan: checked.plan,
    active_task: checked.active_task,
    execution_state: checked.execution_state,
    tasks: checked.tasks,
    notes: checked.notes,
  }
}

function serializeTaskCanonical(task: StartWorkChecklistTask): StartWorkChecklistTask {
  const serialized: StartWorkChecklistTask = {
    id: task.id,
    title: task.title,
    status: task.status,
  }

  if (task.blocked_by !== undefined && task.blocked_by !== null) {
    serialized.blocked_by = task.blocked_by
  }

  if (task.unblock_when !== undefined && task.unblock_when !== null) {
    serialized.unblock_when = task.unblock_when
  }

  if (task.next_action !== undefined && task.next_action !== null) {
    serialized.next_action = task.next_action
  }

  if (task.last_update !== undefined && task.last_update !== null) {
    serialized.last_update = task.last_update
  }

  return serialized
}

type ParsedChecklistState = {
  plan: unknown
  active_task?: unknown
  execution_state: unknown
  tasks: unknown
  notes?: unknown
}

function parseChecklistShape(checklist: ParsedChecklistState | unknown) {
  if (typeof checklist !== "object" || checklist === null) {
    throw new Error("Checklist YAML did not parse to an object.")
  }

  const parsedChecklist = checklist as ParsedChecklistState

  if (typeof parsedChecklist.plan !== "string" || parsedChecklist.plan.length === 0) {
    throw new Error("Checklist plan must be a non-empty string.")
  }

  if (!EXECUTION_STATES.includes(parsedChecklist.execution_state as StartWorkExecutionState)) {
    throw new Error(`Checklist execution_state is invalid: ${String(parsedChecklist.execution_state)}`)
  }

  if (
    parsedChecklist.active_task !== undefined &&
    parsedChecklist.active_task !== null &&
    typeof parsedChecklist.active_task !== "string"
  ) {
    throw new Error("Checklist active_task must be a string or null.")
  }

  if (!Array.isArray(parsedChecklist.tasks)) {
    throw new Error("Checklist tasks must be an array.")
  }

  const normalizedTasks: StartWorkChecklistTask[] = parsedChecklist.tasks.map((task, index) => parseTaskShape(task, index))

  if (parsedChecklist.notes !== undefined) {
    if (!Array.isArray(parsedChecklist.notes) || parsedChecklist.notes.some((note) => typeof note !== "string")) {
      throw new Error("Checklist notes must be an array of strings when present.")
    }
  }

  return {
    plan: parsedChecklist.plan,
    active_task: parsedChecklist.active_task ?? null,
    execution_state: parsedChecklist.execution_state as StartWorkExecutionState,
    tasks: normalizedTasks,
    notes: parsedChecklist.notes && parsedChecklist.notes.length > 0 ? parsedChecklist.notes : undefined,
  }
}

type ParsedChecklistTask = {
  id?: unknown
  title?: unknown
  status?: unknown
  blocked_by?: unknown
  unblock_when?: unknown
  next_action?: unknown
  last_update?: unknown
}

function parseTaskShape(rawTask: ParsedChecklistTask, index: number): StartWorkChecklistTask {
  if (typeof rawTask !== "object" || rawTask === null) {
    throw new Error(`Checklist task ${index} must be an object.`)
  }

  if (typeof rawTask.id !== "string" || rawTask.id.length === 0) {
    throw new Error("Checklist task id must be a non-empty string.")
  }

  if (typeof rawTask.title !== "string" || rawTask.title.length === 0) {
    throw new Error(`Checklist task ${rawTask.id} title must be a non-empty string.`)
  }

  if (!TASK_STATUSES.includes(rawTask.status as StartWorkTaskStatus)) {
    throw new Error(`Checklist task ${rawTask.id} has invalid status: ${String(rawTask.status)}`)
  }

  validateNullableString(rawTask.blocked_by, `Checklist task ${rawTask.id} blocked_by`)
  validateNullableString(rawTask.unblock_when, `Checklist task ${rawTask.id} unblock_when`)
  validateNullableString(rawTask.next_action, `Checklist task ${rawTask.id} next_action`)
  validateNullableString(rawTask.last_update, `Checklist task ${rawTask.id} last_update`)

  return {
    id: rawTask.id,
    title: rawTask.title,
    status: rawTask.status as StartWorkTaskStatus,
    blocked_by: rawTask.blocked_by === undefined || rawTask.blocked_by === null ? undefined : String(rawTask.blocked_by),
    unblock_when: rawTask.unblock_when === undefined || rawTask.unblock_when === null ? undefined : String(rawTask.unblock_when),
    next_action: rawTask.next_action === undefined || rawTask.next_action === null ? undefined : String(rawTask.next_action),
    last_update: rawTask.last_update === undefined || rawTask.last_update === null ? undefined : String(rawTask.last_update),
  }
}

function validateNullableString(value: unknown, label: string) {
  if (value !== null && value !== undefined && typeof value !== "string") {
    throw new Error(`${label} must be a string or null.`)
  }
}

function classifyChecklistParseError(error: unknown): Exclude<ReadChecklistStateResult["kind"], "ok" | "not-found"> {
  if (error instanceof Error) {
    if (error.message.startsWith("Checklist ")) {
      return "validation-failed"
    }

    if (error.message.includes("YAML")) {
      return "parse-failed"
    }
  }

  return "parse-failed"
}

function isNotFoundError(error: unknown) {
  return !!error && typeof error === "object" && "code" in error && error.code === "ENOENT"
}
