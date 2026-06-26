import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { parseChecklistState, readChecklistStateDetailed } from "./checklist"

test("parseChecklistState accepts a valid checklist", () => {
  const checklist = parseChecklistState(`plan: .ramblings/plans/2026-06-19-topic.md
active_task: null
execution_state: running
tasks:
  - id: task-1
    title: Example
    status: not_started
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  assert.equal(checklist.execution_state, "running")
  assert.equal(checklist.tasks[0].status, "not_started")
})

test("parseChecklistState accepts an explicit cancelled work unit", () => {
  const checklist = parseChecklistState(`plan: .ramblings/plans/2026-06-19-topic.md
active_task: null
execution_state: cancelled
tasks:
  - id: task-1
    title: Cancelled slice
    status: cancelled
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: Operator cancelled this work unit.
`)

  assert.equal(checklist.execution_state, "cancelled")
  assert.equal(checklist.tasks[0].status, "cancelled")
})

test("parseChecklistState rejects an invalid execution_state", () => {
  assert.throws(
    () => parseChecklistState(`plan: .ramblings/plans/2026-06-19-topic.md
execution_state: sideways
tasks: []
`),
    /execution_state is invalid/,
  )
})

test("parseChecklistState rejects a missing plan", () => {
  assert.throws(
    () => parseChecklistState(`execution_state: running
tasks: []
`),
    /plan must be a non-empty string/,
  )
})

test("parseChecklistState rejects malformed tasks with a validation error", () => {
  assert.throws(
    () => parseChecklistState(`plan: .ramblings/plans/2026-06-19-topic.md
active_task: null
execution_state: running
tasks:
  - not-an-object
`),
    /Checklist task 0 must be an object/,
  )
})

test("readChecklistStateDetailed distinguishes validation failures from missing files", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-checklist-read-"))
  const checklistPath = path.join(projectRoot, "bad.yaml")

  await writeFile(checklistPath, `plan: .ramblings/plans/topic.md
execution_state: running
tasks: []
notes:
  - label: object-not-string
`)

  const invalid = await readChecklistStateDetailed(projectRoot, checklistPath)
  assert.equal(invalid.kind, "validation-failed")

  const missing = await readChecklistStateDetailed(projectRoot, path.join(projectRoot, "missing.yaml"))
  assert.equal(missing.kind, "not-found")
})
