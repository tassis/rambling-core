import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { recordDelegatedLaneTerminalOutcome, reconcileAndRerunContinuation } from "./index"
import { startWorkTools } from "../tools/start-work"
import type { StartWorkChecklistState } from "./types"

function assertObjectToolResult(result: unknown): asserts result is { output: string; metadata?: Record<string, unknown> } {
  assert.equal(typeof result, "object")
  assert.ok(result !== null)
  const objectResult = result as { output?: unknown }
  assert.ok("output" in objectResult)
}

test("ramblings_start_work_reconcile_and_rerun returns stable success metadata", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-tool-contract-"))
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })
  const checklistPath = path.join(projectRoot, ".ramblings", "checklists", "tool.yaml")

  await writeFile(
    checklistPath,
    `plan: .ramblings/plans/tool.md
active_task: null
execution_state: running
tasks:
  - id: task-1
    title: Todo
    status: not_started
`,
  )

  const result = await startWorkTools.ramblings_start_work_reconcile_and_rerun.execute(
    {
      project_root: projectRoot,
      checklist_path: checklistPath,
      task_id: "task-1",
      note: "lane completed",
    },
    {} as never,
  )

  assertObjectToolResult(result)
  assert.equal(result.metadata?.ok, true)
  assert.equal(result.metadata?.checklistPath, checklistPath)
  assert.equal(result.metadata?.taskId, "task-1")
  assert.equal(result.metadata?.continuationKind, "continue")
})

test("ramblings_start_work_reconcile_and_rerun preserves specific checklist error codes", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-tool-error-"))
  const badChecklistPath = path.join(projectRoot, "bad.yaml")
  await writeFile(
    badChecklistPath,
    `plan: .ramblings/plans/tool.md
execution_state: running
tasks: []
notes:
  - label: invalid
`,
  )

  const result = await startWorkTools.ramblings_start_work_reconcile_and_rerun.execute(
    {
      project_root: projectRoot,
      checklist_path: badChecklistPath,
      task_id: "task-1",
      note: "lane completed",
    },
    {} as never,
  )

  assertObjectToolResult(result)
  assert.equal(result.metadata?.ok, false)
  assert.equal(result.metadata?.code, "CHECKLIST_VALIDATION_FAILED")
})

test("ramblings_start_work_reconcile_and_rerun reports malformed tasks as validation failures", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-tool-bad-delegation-"))
  const badChecklistPath = path.join(projectRoot, "bad-delegation.yaml")
  await writeFile(
    badChecklistPath,
    `plan: .ramblings/plans/tool.md
active_task: null
execution_state: running
tasks:
  - not-an-object
`,
  )

  const result = await startWorkTools.ramblings_start_work_reconcile_and_rerun.execute(
    {
      project_root: projectRoot,
      checklist_path: badChecklistPath,
      task_id: "task-1",
      note: "lane completed",
    },
    {} as never,
  )

  assertObjectToolResult(result)
  assert.equal(result.metadata?.ok, false)
  assert.equal(result.metadata?.code, "CHECKLIST_VALIDATION_FAILED")
})

test("ramblings_start_work_resolve preserves original artifact resolution kind for non-resolved outcomes", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-tool-resolve-"))
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })

  const result = await startWorkTools.ramblings_start_work_resolve.execute(
    {
      project_root: projectRoot,
    },
    {} as never,
  )

  assertObjectToolResult(result)
  assert.equal(result.metadata?.ok, true)
  assert.equal(result.metadata?.artifactResolutionKind, "no-active-plan")
  assert.equal(result.metadata?.continuationKind, "ask-user")
})

test("recordDelegatedLaneTerminalOutcome clears blocked task wait state", () => {
  const checklist: StartWorkChecklistState = {
    plan: ".ramblings/plans/tool.md",
    active_task: "task-1",
    execution_state: "waiting",
    tasks: [
      {
        id: "task-1",
        title: "Delegated task",
        status: "in_progress",
        blocked_by: "delegation:explorer",
        unblock_when: "delegated lane completion",
        last_update: undefined,
      },
    ],
  }

  const outcome = recordDelegatedLaneTerminalOutcome(checklist, "task-1", "lane completed")

  assert.equal(outcome.kind, "recorded")
  assert.equal(outcome.metadata.status, "recorded")
  assert.equal(outcome.checklist.tasks[0].blocked_by, undefined)
  assert.equal(outcome.checklist.tasks[0].unblock_when, undefined)
})

test("recordDelegatedLaneTerminalOutcome does not rewrite already unblocked terminal state", () => {
  const checklist: StartWorkChecklistState = {
    plan: ".ramblings/plans/tool.md",
    active_task: "task-1",
    execution_state: "running",
    tasks: [
      {
        id: "task-1",
        title: "Delegated task",
        status: "in_progress",
        last_update: "lane completed",
      },
    ],
  }

  const outcome = recordDelegatedLaneTerminalOutcome(checklist, "task-1", "lane completed again")

  assert.equal(outcome.kind, "already-handled")
  assert.equal(outcome.metadata.ok, true)
  assert.equal(outcome.metadata.status, "already-handled")
  assert.equal(outcome.checklist.tasks[0].blocked_by, undefined)
})

test("recordDelegatedLaneTerminalOutcome does not treat non-waiting task as terminal writeback", () => {
  const checklist: StartWorkChecklistState = {
    plan: ".ramblings/plans/tool.md",
    active_task: "task-1",
    execution_state: "running",
    tasks: [
      {
        id: "task-1",
        title: "Delegated task",
        status: "in_progress",
        last_update: undefined,
      },
    ],
  }

  const outcome = recordDelegatedLaneTerminalOutcome(checklist, "task-1", "missing")

  assert.equal(outcome.kind, "already-handled")
  assert.equal(outcome.metadata.ok, true)
  assert.equal(outcome.metadata.status, "already-handled")
})

test("reconcileAndRerunContinuation yields stable waiting, done, and continue outcomes", () => {
  const waiting = reconcileAndRerunContinuation(
    {
      plan: ".ramblings/plans/tool.md",
      active_task: "task-1",
      execution_state: "running",
      tasks: [
        {
          id: "task-1",
          title: "Delegated task",
          status: "in_progress",
          blocked_by: "delegation:explorer",
          unblock_when: "delegated lane completion",
          last_update: undefined,
        },
        {
          id: "task-2",
          title: "Next task",
          status: "not_started",
          blocked_by: undefined,
          unblock_when: undefined,
          next_action: undefined,
          last_update: undefined,
        },
      ],
    } satisfies StartWorkChecklistState,
    "task-1",
    "lane completed",
  )
  assert.equal(waiting.continuation.kind, "continue")

  const done = reconcileAndRerunContinuation(
    {
      plan: ".ramblings/plans/tool.md",
      active_task: "task-1",
      execution_state: "running",
      tasks: [
        {
          id: "task-1",
          title: "Delegated task",
          status: "complete",
          last_update: undefined,
        },
      ],
    } satisfies StartWorkChecklistState,
    "task-1",
    "lane completed",
  )
  assert.equal(done.continuation.kind, "done")

  const continueState = reconcileAndRerunContinuation(
    {
      plan: ".ramblings/plans/tool.md",
      active_task: "task-1",
      execution_state: "running",
      tasks: [
        {
          id: "task-1",
          title: "Delegated task",
          status: "in_progress",
          blocked_by: "delegation:explorer",
          unblock_when: "delegated lane completion",
          last_update: undefined,
        },
        {
          id: "task-2",
          title: "Next task",
          status: "not_started",
          blocked_by: undefined,
          unblock_when: undefined,
          next_action: undefined,
          last_update: undefined,
        },
      ],
    } satisfies StartWorkChecklistState,
    "task-1",
    "lane completed",
  )
  assert.equal(continueState.continuation.kind, "continue")
})
