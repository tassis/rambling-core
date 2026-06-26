import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { ramblingsCommands } from "./index"

test("ramblingsCommands exports only the final core command set", () => {
  const actual = Object.keys(ramblingsCommands).sort()
  const expected = [
    "archive",
    "handoff",
    "office-hours",
    "resume-from-handoff",
    "start-work",
    "write-brief",
    "write-plan",
  ].sort()

  assert.deepEqual(actual, expected)
})
