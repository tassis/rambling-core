import { test } from "bun:test"
import * as assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import path from "node:path"
import ramblingsPlugin from "./ramblings-plugin"
import { ramblingsCommands } from "./commands/index"
import { startWorkTools } from "./tools/start-work"

test("plugin registration exposes only core command/agent/tool surface", async () => {
  const plugin = await ramblingsPlugin()

  const config: any = {
    skills: { paths: [] as string[] },
    command: {} as Record<string, unknown>,
    agent: {} as Record<string, unknown>,
  }

  await plugin.config(config)

  assert.equal(plugin.tool, startWorkTools)
  assert.deepEqual(Object.keys(plugin.tool).sort(), [
    "ramblings_start_work_record_blocked",
    "ramblings_start_work_reconcile_and_rerun",
    "ramblings_start_work_resolve",
  ].sort())

  assert.equal(config.skills.paths.length, 1)
  const expectedSkillsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../skills")
  assert.equal(config.skills.paths[0], expectedSkillsPath)

  assert.deepEqual(Object.keys(config.agent).sort(), ["conductor"].sort())
  assert.ok("conductor" in config.agent)

  assert.deepEqual(Object.keys(config.command).sort(), Object.keys(ramblingsCommands).sort())
  for (const [name, definition] of Object.entries(ramblingsCommands)) {
    assert.equal(config.command[name], definition)
  }
})
