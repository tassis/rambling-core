# Architecture

## Layers

### `skills/`

Contains the actual `ramblings-*` skills. These define workflow guidance such as brainstorming, spec writing, debugging, verification, review, and challenge sessions.

### `plugin/`

Contains an OpenCode plugin that registers this repo's `skills/` path and injects optional commands into live config.

## Design decisions

- The plugin does **not** inject a global workflow bootstrap.
- The plugin does **not** override user-defined commands of the same name.
- The plugin does **not** perform git actions.
- Commands are lightweight prompt shortcuts that encourage the right `ramblings-*` skill usage.

## Installation model

The current model assumes the repo is cloned locally and referenced via plugin path. The structure is chosen so future git-backed plugin installation is possible without redesigning the repo.
