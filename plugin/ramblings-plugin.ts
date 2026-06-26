import path from "path"
import { fileURLToPath } from "url"
import { conductor as newConductor } from "./agents/conductor"
import { ramblingsCommands } from "./commands/index"
import { startWorkTools } from "./tools/start-work"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillsDir = path.resolve(__dirname, "../skills")

export default async function ramblingsPlugin() {
  return {
    tool: startWorkTools,
    config: async (config: any) => {
      config.skills = config.skills || {}
      config.skills.paths = config.skills.paths || []

      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir)
      }

      config.command = config.command || {}
      config.agent = config.agent || {}

      if (!("conductor" in config.agent)) {
        config.agent.conductor = newConductor()
      }

      for (const [name, definition] of Object.entries(ramblingsCommands)) {
        if (!(name in config.command)) {
          config.command[name] = definition
        }
      }
    }
  }
}
