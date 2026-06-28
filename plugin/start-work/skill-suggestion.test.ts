import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { inferStartWorkSkillSuggestion } from "./skill-suggestion"

test("inferStartWorkSkillSuggestion maps clear coding tags to ramblings-coding-flow", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["domain:coding", "candidate:tdd"],
    suggested_capability: "coding",
  })

  assert.equal(suggestion?.skill, "ramblings-coding-flow")
  assert.equal(suggestion?.source, "tag")
  assert.equal(suggestion?.signal, "domain:coding")
})

test("inferStartWorkSkillSuggestion maps sparse coding tag to ramblings-coding-flow", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["domain:coding"],
  })

  assert.equal(suggestion?.skill, "ramblings-coding-flow")
  assert.equal(suggestion?.source, "tag")
  assert.equal(suggestion?.signal, "domain:coding")
})

test("inferStartWorkSkillSuggestion falls back to coding when only suggested_capability matches coding", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["backend", "urgent"],
    suggested_capability: "coding",
  })

  assert.equal(suggestion?.skill, "ramblings-coding-flow")
  assert.equal(suggestion?.source, "suggested_capability")
  assert.equal(suggestion?.signal, "coding")
})

test("inferStartWorkSkillSuggestion is null for noisy mixed tags", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["domain:coding", "domain:workflow"],
    suggested_capability: "coding",
  })

  assert.equal(suggestion, null)
})

test("inferStartWorkSkillSuggestion is null when non-coding domain conflicts with coding capability", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["domain:docs"],
    suggested_capability: "coding",
  })

  assert.equal(suggestion, null)
})

test("inferStartWorkSkillSuggestion is null for conflicting coding hints", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["candidate:review"],
    suggested_capability: "archive",
  })

  assert.equal(suggestion, null)
})

test("inferStartWorkSkillSuggestion keeps existing core mappings for non-coding tasks", () => {
  const suggestion = inferStartWorkSkillSuggestion({
    tags: ["backend", "integration"],
  })

  assert.equal(suggestion?.skill, "ramblings-integration-creator")
  assert.equal(suggestion?.source, "tag")
  assert.equal(suggestion?.signal, "integration")
})
