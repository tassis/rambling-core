import path from "path"
import { fileURLToPath } from "url"
import { ramblingsCommands } from "./commands/index"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillsDir = path.resolve(__dirname, "../skills")

export default async function ramblingsPlugin() {
  return {
    config: async (config: any) => {
      config.skills = config.skills || {}
      config.skills.paths = config.skills.paths || []

      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir)
      }

      config.command = config.command || {}

      for (const [name, definition] of Object.entries(ramblingsCommands)) {
        if (!(name in config.command)) {
          config.command[name] = definition
        }
      }
    }
  }
}
