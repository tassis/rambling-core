# ramblings-skills

Custom OpenCode-oriented workflow skills and optional command shortcuts.

This repo provides two layers:

1. `skills/` — the actual `ramblings-*` skills
2. `plugin/` — an OpenCode plugin that:
   - registers this repo's `skills/` directory
   - injects optional commands such as `office-hours` and `plan-ceo-review`

## Principles

- no automatic commits, merges, or PR creation
- no global bootstrap mode
- skills are manually or contextually invoked, not forced globally
- commands are convenience entrypoints, not hidden workflow overrides

## Install from local clone

Clone this repo anywhere, then add the plugin path to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "~/workdir/ramblings-skills/plugin/ramblings-plugin.ts"
  ]
}
```

Restart OpenCode after changing config.

## Intended future install direction

This repo is structured so it can later be used with git-backed plugin installation instead of a fixed local path.

## Commands provided by the plugin

- `office-hours`
- `plan-ceo-review`
- `plan-eng-review`
- `qa-review`
- `careful`
- `retro`
- `investigate`
- `write-spec`
- `write-plan`
- `execute-plan`

See `docs/commands.md` for details.
