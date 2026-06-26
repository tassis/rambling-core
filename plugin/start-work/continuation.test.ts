import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { decideStartWorkContinuation } from "./continuation"

test("decideStartWorkContinuation returns continue for a runnable task", () => {
  const continuation = decideStartWorkContinuation({
    checklist: {
      plan: ".ramblings/plans/2026-06-19-topic.md",
      active_task: null,
      execution_state: "running",
      tasks: [],
    },
    taskSelection: {
      kind: "task",
      task: {
        id: "task-1",
        title: "Implement",
        status: "not_started",
      },
    },
  })

  assert.equal(continuation.kind, "continue")
  assert.equal(continuation.activeTaskId, "task-1")
})

test("decideStartWorkContinuation preserves ask-user note from artifact resolution", () => {
  const continuation = decideStartWorkContinuation({
    artifactResolution: {
      kind: "ask-user",
      reason: "Multiple unfinished plans remain.",
      candidates: [
        { planPath: ".ramblings/plans/a.md", checklistPath: null, handoffPath: null },
        { planPath: ".ramblings/plans/b.md", checklistPath: null, handoffPath: null },
      ],
    },
  })

  assert.equal(continuation.kind, "ask-user")
  assert.match(continuation.note ?? "", /a\.md.*b\.md/)
})
