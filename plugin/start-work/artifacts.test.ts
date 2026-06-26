import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { resolveStartWorkArtifacts } from "./artifacts"

test("resolveStartWorkArtifacts archives one ready completed work unit at entry and continues with unfinished work", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-artifacts-test-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-complete.md"), "# Complete\n**Status:** complete\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-complete.yaml"), `plan: .ramblings/plans/2026-06-19-complete.md
active_task: null
execution_state: done
tasks:
  - id: task-1
    title: Done
    status: complete
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)
  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-active.md"), "# Active\n**Status:** not started\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-active.yaml"), `plan: .ramblings/plans/2026-06-19-active.md
active_task: null
execution_state: running
tasks:
  - id: task-1
    title: Todo
    status: not_started
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  const resolution = await resolveStartWorkArtifacts(projectRoot)

  assert.equal(resolution.kind, "resolved")
  assert.equal(resolution.candidate.planPath, ".ramblings/plans/2026-06-19-active.md")
  assert.equal(resolution.archiveActions?.length, 1)
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-complete", "plan.md"), "utf8"))
  await assert.rejects(() => readFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-complete.md"), "utf8"))
})

test("resolveStartWorkArtifacts asks user when a linked handoff still claims active work", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-handoff-conflict-test-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "handoffs"), { recursive: true })

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-complete.md"), "# Complete\n**Status:** complete\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-complete.yaml"), `plan: .ramblings/plans/2026-06-19-complete.md
active_task: null
execution_state: done
tasks:
  - id: task-1
    title: Done
    status: complete
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)
  await writeFile(path.join(projectRoot, ".ramblings", "handoffs", "2026-06-19-complete.md"), `.ramblings/plans/2026-06-19-complete.md
status: active
remaining active execution work
`)

  const resolution = await resolveStartWorkArtifacts(projectRoot)

  assert.equal(resolution.kind, "ask-user")
  assert.match(resolution.reason, /handoff/i)
})

test("resolveStartWorkArtifacts auto-archives multiple safe completed/cancelled units before continuing unfinished work", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-multi-cleanup-test-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-complete.md"), "# Complete\n**Status:** complete\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-complete.yaml"), `plan: .ramblings/plans/2026-06-19-complete.md
active_task: null
execution_state: done
tasks:
  - id: task-1
    title: Done
    status: complete
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)
  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-cancelled.md"), "# Cancelled\n**Status:** cancelled\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-cancelled.yaml"), `plan: .ramblings/plans/2026-06-19-cancelled.md
active_task: null
execution_state: cancelled
tasks:
  - id: task-1
    title: Cancelled
    status: cancelled
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-active.md"), "# Active\n**Status:** not started\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-active.yaml"), `plan: .ramblings/plans/2026-06-19-active.md
active_task: null
execution_state: running
tasks:
  - id: task-1
    title: Todo
    status: not_started
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  const resolution = await resolveStartWorkArtifacts(projectRoot)

  assert.equal(resolution.kind, "resolved")
  assert.equal(resolution.candidate.planPath, ".ramblings/plans/2026-06-19-active.md")
  assert.equal(resolution.archiveActions?.length, 2)
  await assert.rejects(() => readFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-complete.md"), "utf8"))
  await assert.rejects(() => readFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-cancelled.md"), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-complete", "plan.md"), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-cancelled", "summary.md"), "utf8"))
})

test("resolveStartWorkArtifacts asks user before continuing when a cancelled cleanup candidate is unresolved", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-cancelled-cleanup-block-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-cancelled.md"), "# Cancelled\n**Status:** cancelled\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-cancelled.yaml"), `plan: .ramblings/plans/2026-06-19-cancelled.md
active_task: task-1
execution_state: cancelled
tasks:
  - id: task-1
    title: Cancelled but unresolved
    status: cancelled
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  await writeFile(path.join(projectRoot, ".ramblings", "plans", "2026-06-19-active.md"), "# Active\n**Status:** not started\n")
  await writeFile(path.join(projectRoot, ".ramblings", "checklists", "2026-06-19-active.yaml"), `plan: .ramblings/plans/2026-06-19-active.md
active_task: null
execution_state: running
tasks:
  - id: task-1
    title: Todo
    status: not_started
    blocked_by: null
    unblock_when: null
    next_action: null
    last_update: null
`)

  const resolution = await resolveStartWorkArtifacts(projectRoot)

  assert.equal(resolution.kind, "ask-user")
  assert.match(resolution.reason, /active_task|cancelled/i)
})
