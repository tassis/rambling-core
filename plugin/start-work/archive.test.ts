import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { decideSimplePathArchiveEligibility, findSimplePathArchiveCandidate, performSimplePathArchive } from "./archive"
import type { StartWorkChecklistState } from "./types"

function completeChecklist(planPath: string): StartWorkChecklistState {
  return {
    plan: planPath,
    active_task: null,
    execution_state: "done",
    tasks: [
      {
        id: "task-1",
        title: "Done task",
        status: "complete",
      },
    ],
  }
}

function cancelledChecklist(planPath: string): StartWorkChecklistState {
  return {
    plan: planPath,
    active_task: null,
    execution_state: "cancelled",
    tasks: [
      {
        id: "task-1",
        title: "Cancelled task",
        status: "cancelled",
      },
    ],
  }
}

test("decideSimplePathArchiveEligibility returns auto-archive for completed work with explicit complete tasks", () => {
  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-topic.md",
    checklistPath: ".ramblings/checklists/2026-06-19-topic.yaml",
    handoffPath: null,
    cleanupState: "completed" as const,
  }

  const decision = decideSimplePathArchiveEligibility({
    candidate,
    checklist: completeChecklist(candidate.planPath),
  })

  assert.equal(decision.kind, "auto-archive")
})

test("decideSimplePathArchiveEligibility auto-archives completed work without explicit completion evidence", () => {
  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-topic.md",
    checklistPath: ".ramblings/checklists/2026-06-19-topic.yaml",
    handoffPath: null,
    cleanupState: "completed" as const,
  }

  const decision = decideSimplePathArchiveEligibility({
    candidate,
    checklist: completeChecklist(candidate.planPath),
  })

  assert.equal(decision.kind, "auto-archive")
})

test("decideSimplePathArchiveEligibility auto-archives a safe cancelled work unit without extra evidence", () => {
  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-cancelled.md",
    checklistPath: ".ramblings/checklists/2026-06-19-cancelled.yaml",
    handoffPath: null,
    cleanupState: "cancelled" as const,
  }

  const decision = decideSimplePathArchiveEligibility({
    candidate,
    checklist: cancelledChecklist(candidate.planPath),
  })

  assert.equal(decision.kind, "auto-archive")
})

test("findSimplePathArchiveCandidate returns auto-archive for multiple safe completed/cancelled units", () => {
  const discovery = findSimplePathArchiveCandidate([
    {
      candidate: {
        planPath: ".ramblings/plans/2026-06-19-complete.md",
        checklistPath: ".ramblings/checklists/2026-06-19-complete.yaml",
        handoffPath: null,
        cleanupState: "completed" as const,
      },
      checklist: completeChecklist(".ramblings/plans/2026-06-19-complete.md"),
      handoffClaimsActiveWork: false,
    },
    {
      candidate: {
        planPath: ".ramblings/plans/2026-06-19-cancelled.md",
        checklistPath: ".ramblings/checklists/2026-06-19-cancelled.yaml",
        handoffPath: null,
        cleanupState: "cancelled" as const,
      },
      checklist: cancelledChecklist(".ramblings/plans/2026-06-19-cancelled.md"),
      handoffClaimsActiveWork: false,
    },
  ])

  assert.equal(discovery.kind, "auto-archive")
  assert.equal(discovery.candidates?.length, 2)
})

test("performSimplePathArchive packages files and removes active plan/checklist copies", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-archive-test-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "handoffs"), { recursive: true })

  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-topic.md",
    checklistPath: ".ramblings/checklists/2026-06-19-topic.yaml",
    handoffPath: ".ramblings/handoffs/2026-06-19-topic.md",
    cleanupState: "completed" as const,
  }

  await writeFile(path.join(projectRoot, candidate.planPath), "# Plan\n")
  await writeFile(path.join(projectRoot, candidate.checklistPath), "plan: .ramblings/plans/2026-06-19-topic.md\nexecution_state: done\ntasks: []\n")
  await writeFile(path.join(projectRoot, candidate.handoffPath), "handoff summary\nstatus: done\n")

  const action = await performSimplePathArchive(projectRoot, candidate, completeChecklist(candidate.planPath))

  assert.equal(action.archivePath, ".ramblings/archive/2026-06-19-topic")
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-topic", "plan.md"), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-topic", "checklist.yaml"), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-topic", "handoff.md"), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-topic", "summary.md"), "utf8"))
  await assert.rejects(() => readFile(path.join(projectRoot, candidate.planPath), "utf8"))
  await assert.rejects(() => readFile(path.join(projectRoot, candidate.checklistPath), "utf8"))
  await assert.rejects(() => readFile(path.join(projectRoot, candidate.handoffPath), "utf8"))
})

test("decideSimplePathArchiveEligibility asks user when linked handoff still claims active work", () => {
  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-topic.md",
    checklistPath: ".ramblings/checklists/2026-06-19-topic.yaml",
    handoffPath: ".ramblings/handoffs/2026-06-19-topic.md",
    cleanupState: "completed" as const,
  }

  const decision = decideSimplePathArchiveEligibility({
    candidate,
    checklist: completeChecklist(candidate.planPath),
    handoffClaimsActiveWork: true,
  })

  assert.equal(decision.kind, "ask-user")
})

test("performSimplePathArchive fails when archive destination already exists and preserves active files", async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "ramblings-archive-collision-"))
  await mkdir(path.join(projectRoot, ".ramblings", "plans"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "checklists"), { recursive: true })
  await mkdir(path.join(projectRoot, ".ramblings", "archive", "2026-06-19-topic"), { recursive: true })

  const candidate = {
    planPath: ".ramblings/plans/2026-06-19-topic.md",
    checklistPath: ".ramblings/checklists/2026-06-19-topic.yaml",
    handoffPath: null,
    cleanupState: "completed" as const,
  }

  await writeFile(path.join(projectRoot, candidate.planPath), "# Plan\n")
  await writeFile(path.join(projectRoot, candidate.checklistPath), "plan: .ramblings/plans/2026-06-19-topic.md\nexecution_state: done\ntasks: []\n")

  await assert.rejects(() => performSimplePathArchive(projectRoot, candidate, completeChecklist(candidate.planPath)), /Archive destination already exists/)
  await assert.doesNotReject(() => readFile(path.join(projectRoot, candidate.planPath), "utf8"))
  await assert.doesNotReject(() => readFile(path.join(projectRoot, candidate.checklistPath), "utf8"))
})
