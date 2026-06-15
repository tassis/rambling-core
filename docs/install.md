# Install

## Local clone install

1. Clone this repo to any location.
2. Add the plugin path to `opencode.json`.
3. Restart OpenCode.

Example:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "~/workdir/ramblings-skills/plugin/ramblings-plugin.ts"
  ]
}
```

The plugin will:

- register `<repo>/skills`
- inject the bundled commands

## Notes

- If you already define a command with the same name in your own config, this plugin leaves your command untouched.
- Restart OpenCode after config changes.
