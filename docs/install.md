# Install

## Recommended install

Add this to `opencode.json` and restart OpenCode:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "ramblings-core@git+https://github.com/tassis/ramblings.git"
  ]
}
```

## Local clone install

If you are developing from a local checkout, use a direct plugin path instead:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "~/workdir/ramblings/plugin/ramblings-plugin.ts"
  ]
}
```

This package is `ramblings-core` and exposes only the core surface:

- register `/skills` from this repo
- register core commands: `office-hours`, `write-brief`, `write-plan`, `start-work`, `handoff`, `resume-from-handoff`, `archive`
- register the `conductor` planning agent

## Notes

- If you already define a command with the same name in your own config, this plugin leaves your command untouched.
- Restart OpenCode after config changes.

Note: since this is a focused core package, this refactor does not provide compatibility aliases or compatibility shims for removed command surfaces.
