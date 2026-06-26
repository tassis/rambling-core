import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  StartWorkArchiveAction,
  StartWorkArchiveDecision,
  StartWorkArchiveDiscoveryResult,
  StartWorkArchiveCandidate,
  StartWorkArchiveEligibilityInput,
  StartWorkChecklistState,
} from "./types"

const RAMBLINGS_DIR = ".ramblings"
const ARCHIVE_DIR = path.posix.join(RAMBLINGS_DIR, "archive")

export function decideSimplePathArchiveEligibility(input: StartWorkArchiveEligibilityInput): StartWorkArchiveDecision {
  const checklist = input.checklist
  const candidateState = input.candidate.cleanupState

  if (!checklist || !input.candidate.checklistPath) {
    return {
      kind: "defer",
      reason: `${capitalizeCleanupState(candidateState)} work cannot be archived on the simple path without a checklist execution-state artifact.`,
    }
  }

  if (checklist.tasks.length === 0) {
    return {
      kind: "defer",
      reason: "Checklist has no tasks, so archive eligibility cannot be confirmed safely.",
    }
  }

  if (candidateState === "completed" && checklist.execution_state !== "done") {
    return {
      kind: "defer",
      reason: "Checklist execution_state is not done.",
    }
  }

  if (candidateState === "cancelled" && checklist.execution_state !== "cancelled") {
    return {
      kind: "ask-user",
      reason: "Cancelled cleanup candidates must record execution_state as cancelled before auto-archive.",
    }
  }

  if (checklist.active_task) {
    return {
      kind: "ask-user",
      reason: "Checklist still records an active_task, so remaining execution work is unresolved.",
    }
  }

  if (checklist.tasks.some((task) => task.status === "in_progress" || task.status === "blocked" || task.status === "not_started")) {
    return {
      kind: "ask-user",
      reason: "Checklist still contains runnable or unresolved tasks.",
    }
  }

  if (candidateState === "completed" && !checklist.tasks.every((task) => task.status === "complete")) {
    return {
      kind: "defer",
      reason: "Not all checklist tasks are complete.",
    }
  }

  if (candidateState === "cancelled") {
    const hasCancelledTask = checklist.tasks.some((task) => task.status === "cancelled")
    const hasUnsupportedTaskState = checklist.tasks.some((task) => task.status !== "cancelled" && task.status !== "complete")

    if (!hasCancelledTask) {
      return {
        kind: "ask-user",
        reason: "Cancelled cleanup candidates must include at least one cancelled checklist task.",
      }
    }

    if (hasUnsupportedTaskState) {
      return {
        kind: "ask-user",
        reason: "Cancelled cleanup candidates may only contain complete or cancelled tasks.",
      }
    }
  }

  if (input.hasConsolidationAmbiguity) {
    return {
      kind: "ask-user",
      reason: "Unresolved consolidation or canonical artifact ambiguity remains for this work unit.",
    }
  }

  if (input.handoffClaimsActiveWork) {
    return {
      kind: "ask-user",
      reason: "A linked handoff still claims remaining active execution work for this work unit.",
    }
  }

  if (candidateState === "cancelled") {
    return {
      kind: "auto-archive",
      reason: "Checklist is explicitly cancelled and no unresolved cleanup blockers remain.",
    }
  }

  return {
    kind: "auto-archive",
    reason: "Checklist execution and task state indicate this unit is complete and archive-safe.",
  }
}

export function findSimplePathArchiveCandidate(
  candidates: Array<{ candidate: StartWorkArchiveCandidate; checklist: StartWorkChecklistState; handoffClaimsActiveWork: boolean }>,
): StartWorkArchiveDiscoveryResult {
  if (candidates.length === 0) {
    return { kind: "none", reason: "No completed or cancelled work units were found for archive evaluation." }
  }

  const autoArchiveCandidates: StartWorkArchiveCandidate[] = []

  for (const entry of candidates) {
    const decision = decideSimplePathArchiveEligibility({
      candidate: entry.candidate,
      checklist: entry.checklist,
      handoffClaimsActiveWork: entry.handoffClaimsActiveWork,
    })

    if (decision.kind !== "auto-archive") {
      return {
        kind: decision.kind,
        reason: decision.reason,
        candidates: candidates.map(({ candidate }) => candidate),
        decision,
      }
    }

    autoArchiveCandidates.push(entry.candidate)
  }

  return {
    kind: "auto-archive",
    reason:
      autoArchiveCandidates.length === 1
        ? "1 completed/cancelled work unit is safe to auto-archive."
        : `${autoArchiveCandidates.length} completed/cancelled work units are safe to auto-archive.`,
    candidates: autoArchiveCandidates,
  }
}

export async function performSimplePathArchive(
  projectRoot: string,
  candidate: StartWorkArchiveCandidate,
  checklist: StartWorkChecklistState,
): Promise<StartWorkArchiveAction> {
  if (!candidate.checklistPath) {
    throw new Error("Cannot perform simple-path archive without a checklist path.")
  }

  const archiveDir = path.join(projectRoot, ARCHIVE_DIR, path.basename(candidate.planPath, ".md"))
  const archivePath = toProjectRelative(projectRoot, archiveDir)

  const archivedFiles: string[] = []
  const removedActiveFiles: string[] = []

  if (await pathExists(archiveDir)) {
    throw new Error(`Archive destination already exists: ${archivePath}`)
  }

  await mkdir(path.dirname(archiveDir), { recursive: true })
  await mkdir(archiveDir, { recursive: false })

  const planAbsolutePath = toAbsoluteProjectPath(projectRoot, candidate.planPath)
  const checklistAbsolutePath = toAbsoluteProjectPath(projectRoot, candidate.checklistPath)
  const archivedPlanAbsolutePath = path.join(archiveDir, "plan.md")
  const archivedChecklistAbsolutePath = path.join(archiveDir, "checklist.yaml")

  try {
    await copyFile(planAbsolutePath, archivedPlanAbsolutePath)
    archivedFiles.push(toProjectRelative(projectRoot, archivedPlanAbsolutePath))

    await copyFile(checklistAbsolutePath, archivedChecklistAbsolutePath)
    archivedFiles.push(toProjectRelative(projectRoot, archivedChecklistAbsolutePath))

    if (candidate.handoffPath) {
      const handoffAbsolutePath = toAbsoluteProjectPath(projectRoot, candidate.handoffPath)
      const handoffText = await readTextSafe(handoffAbsolutePath)

      if (handoffText && canArchiveHandoff(handoffText)) {
        const archivedHandoffAbsolutePath = path.join(archiveDir, "handoff.md")
        if (await copyOptionalFile(handoffAbsolutePath, archivedHandoffAbsolutePath)) {
          archivedFiles.push(toProjectRelative(projectRoot, archivedHandoffAbsolutePath))
        }
      }
    }

    const summaryAbsolutePath = path.join(archiveDir, "summary.md")
    await writeFile(summaryAbsolutePath, createArchiveSummary(candidate, checklist, archivePath, archivedFiles), "utf8")
    archivedFiles.push(toProjectRelative(projectRoot, summaryAbsolutePath))

    await rm(planAbsolutePath)
    removedActiveFiles.push(candidate.planPath)

    await rm(checklistAbsolutePath)
    removedActiveFiles.push(candidate.checklistPath)

    if (candidate.handoffPath && archivedFiles.some((filePath) => filePath.endsWith("handoff.md"))) {
      const handoffAbsolutePath = toAbsoluteProjectPath(projectRoot, candidate.handoffPath)
      await rm(handoffAbsolutePath)
      removedActiveFiles.push(candidate.handoffPath)
    }
  } catch (error) {
    await rm(archiveDir, { recursive: true, force: true })
    throw error
  }

  return {
    archivePath,
    archivedFiles,
    removedActiveFiles,
  }
}
function createArchiveSummary(
  candidate: StartWorkArchiveCandidate,
  checklist: StartWorkChecklistState,
  archivePath: string,
  archivedFiles: string[],
) {
  return [
    "# Archive Summary",
    "",
    "## Work unit",
    "",
    `- \`${path.basename(candidate.planPath, ".md")}\``,
    "",
    "## Archive outcome",
    "",
    "- archived",
    "",
    "## Why archived",
    "",
    `- The plan is ${candidate.cleanupState === "cancelled" ? "cancelled" : "complete enough"} for entry-time simple-path archive packaging.`,
    `- The checklist is ${candidate.cleanupState === "cancelled" ? "cancelled" : "complete"}.`,
    `- \`execution_state\` is \`${checklist.execution_state}\` and \`active_task\` is ${checklist.active_task ? `\`${checklist.active_task}\`` : "`null`"}.`,
    "",
    "## Archive package",
    "",
    `- \`${archivePath}\``,
    "",
    "## Archived artifacts",
    "",
    ...archivedFiles.map((filePath) => `- \`${path.posix.basename(filePath)}\``),
    "",
    "## Notes",
    "",
    "- This archive was created by `/start-work` entry-time simple-path cleanup before unfinished-work resolution continued.",
  ].join("\n")
}

function capitalizeCleanupState(cleanupState: StartWorkArchiveCandidate["cleanupState"]) {
  return cleanupState.charAt(0).toUpperCase() + cleanupState.slice(1)
}

function canArchiveHandoff(handoffText: string) {
  const normalized = handoffText.toLowerCase()

  if (normalized.includes("remaining active execution work")) {
    return false
  }

  return !normalized.includes("status: active")
}

async function copyOptionalFile(sourcePath: string, destinationPath: string) {
  const text = await readTextSafe(sourcePath)
  if (text === null) {
    return false
  }

  await copyFile(sourcePath, destinationPath)
  return true
}

function toAbsoluteProjectPath(projectRoot: string, filePath: string) {
  return path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath)
}

function toProjectRelative(projectRoot: string, absolutePath: string) {
  return absolutePath.replace(`${projectRoot}${path.sep}`, "").replace(/\\/g, "/")
}

async function readTextSafe(filePath: string) {
  try {
    return await readFile(filePath, "utf8")
  } catch {
    return null
  }
}

async function pathExists(filePath: string) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}
