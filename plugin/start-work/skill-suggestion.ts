import type { StartWorkSkillSuggestion } from "./types"

const TAG_RULES = [
  { tag: "integration", skill: "ramblings-integration-creator" },
  { tag: "handoff", skill: "ramblings-handoff" },
  { tag: "archive", skill: "ramblings-archive" },
  { tag: "resume", skill: "ramblings-resume-from-handoff" },
  { tag: "resume-from-handoff", skill: "ramblings-resume-from-handoff" },
  { tag: "brainstorm", skill: "ramblings-brainstorming" },
  { tag: "brief", skill: "ramblings-brief-writing" },
  { tag: "writing-plans", skill: "ramblings-writing-plans" },

  // Pack-level coding entrypoint; leaf routing is done inside ramblings-coding.
  { tag: "domain-coding", skill: "ramblings-coding-flow" },
] as const

const CAPABILITY_RULES = [
  { capability: "coding", skill: "ramblings-coding-flow" },
  ...TAG_RULES.map(({ tag, skill }) => ({ capability: tag, skill })),
  { capability: "integration-creator", skill: "ramblings-integration-creator" },
  { capability: "implementing", skill: "ramblings-implementing-plans" },
  { capability: "implementing-plans", skill: "ramblings-implementing-plans" },
] as const

const TAG_MAP: Record<string, string> = TAG_RULES.reduce((map, rule) => {
  map[rule.tag] = rule.skill
  return map
}, {} as Record<string, string>)

const CAPABILITY_MAP: Record<string, string> = CAPABILITY_RULES.reduce((map, rule) => {
  map[rule.capability] = rule.skill
  return map
}, {} as Record<string, string>)

const CODING_CANDIDATE_TAGS = ["candidate-implementation", "candidate-tdd", "candidate-review", "candidate-debugging"] as const
const CODING_FLOW_SKILL = "ramblings-coding-flow"

export interface StartWorkChecklistTaskSuggestionInput {
  tags?: string[]
  suggested_capability?: string
}

export function inferStartWorkSkillSuggestion(task: StartWorkChecklistTaskSuggestionInput): StartWorkSkillSuggestion | null {
  const tags = normalizeTags(task.tags)
  const tagSuggestions = uniqueSkillsFromTags(tags)

  const capabilitySuggestion = mapCapability(task.suggested_capability)

  if (hasConflictingDomainContextForCapability(tags, capabilitySuggestion)) {
    return null
  }

  if (tagSuggestions.length === 1 && hasConflictingCodingContext(tags, tagSuggestions[0])) {
    return null
  }

  if (tagSuggestions.length > 1) {
    return null
  }

  if (tagSuggestions.length === 1) {
    const [suggestion] = tagSuggestions

    if (capabilitySuggestion && capabilitySuggestion.skill !== suggestion.skill) {
      return null
    }

    return suggestion
  }

  if (shouldSuppressCapabilityForWeakCodingHint(tags, capabilitySuggestion)) {
    return null
  }

  return capabilitySuggestion
}

function uniqueSkillsFromTags(tags: string[]) {
  const uniqueSkills = new Map<string, string>()

  for (const tag of tags) {
    const normalizedTag = normalizeTag(tag)
    const skill = mapTag(normalizedTag)

    if (skill) {
      if (!uniqueSkills.has(skill)) {
        uniqueSkills.set(skill, tag)
      }
    }
  }

  return [...uniqueSkills].map(([skill, signal]) => ({
    skill,
    source: "tag" as const,
    signal,
  }))
}

function shouldSuppressCapabilityForWeakCodingHint(
  tags: string[],
  capabilitySuggestion: ReturnType<typeof mapCapability> | null,
) {
  if (!hasCodingCandidateHint(tags) || hasDomainCodingTag(tags)) {
    return false
  }

  return !capabilitySuggestion || capabilitySuggestion.skill !== CODING_FLOW_SKILL
}

function hasCodingCandidateHint(tags: string[]) {
  return tags.some((tag) => CODING_CANDIDATE_TAGS.includes(normalizeTag(tag) as (typeof CODING_CANDIDATE_TAGS)[number]))
}

function hasDomainCodingTag(tags: string[]) {
  return tags.some((tag) => normalizeTag(tag) === "domain-coding")
}

function hasConflictingCodingContext(tags: string[], suggestion: StartWorkSkillSuggestion) {
  if (suggestion.skill !== CODING_FLOW_SKILL) {
    return false
  }

  const domainTags = normalizedDomainTags(tags)
  return domainTags.length > 1
}

function hasConflictingDomainContextForCapability(
  tags: string[],
  capabilitySuggestion: ReturnType<typeof mapCapability> | null,
) {
  if (!capabilitySuggestion || capabilitySuggestion.skill !== CODING_FLOW_SKILL) {
    return false
  }

  const domainTags = normalizedDomainTags(tags)
  return domainTags.some((tag) => tag !== "domain-coding")
}

function normalizedDomainTags(tags: string[]) {
  return tags.map((tag) => normalizeTag(tag)).filter((tag) => tag.startsWith("domain-"))
}

function mapTag(normalizedTag: string) {
  return TAG_MAP[normalizedTag]
}

function mapCapability(value?: string) {
  if (!value || typeof value !== "string") {
    return null
  }

  const normalized = normalizeTag(value)
  const skill = CAPABILITY_MAP[normalized]

  if (!skill) {
    return null
  }

  return {
    skill,
    source: "suggested_capability" as const,
    signal: value,
  }
}

function normalizeTags(tags?: string[]) {
  if (!Array.isArray(tags)) {
    return [] as string[]
  }

  return [...new Set(
    tags
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean)
  )]
}

function normalizeTag(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
