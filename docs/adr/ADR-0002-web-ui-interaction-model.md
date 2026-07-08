# ADR-0002 — interaction model: web UI, not folder drop-off

**Status:** Accepted · 2026-07-07
**Supersedes:** the folder drop-off model inherited at spin-off

## Context

`slopify` began life inside a sibling repo whose tools ran on a folder convention: drop a file in
`input/`, collect results from `output/`. That fit batch document processing. As its own project,
slopify is a **single-kernel comedy generator** — you hand it one short description and get one
post back. The folder round-trip (plus the output-tagging that sharing a folder with another tool
required) is overhead a standalone toy doesn't need.

## Decision

- **Primary interface (planned): a web UI.** Type a kernel, watch the slop, optionally reveal the
  pass ladder. This is future work — it does not exist yet.
- **Interim interface: Claude Code.** The `/slopify` command and the `slopify` skill deliver a
  post **in chat**. This keeps the tool fully usable today with nothing to install.
- **No `input/` / `output/` folders** in this project. The skill is **delivery-agnostic**: it
  returns one finished post and the caller (chat now, web UI later) decides where it goes.

## Consequences

- **Good:** simpler mental model — one description in, one post out.
- **Good:** the delivery boundary is clean, so adding the web UI later means wiring a new caller,
  not changing the skill. This is the separation the reference architecture is meant to show.
- **Trade-off:** no batch/folder processing of many files at once. That was never slopify's use
  case, so the loss is acceptable.
- **Note:** the engine pin (`claude-opus-4-8` / effort `max`) lives in `.claude/settings.json`.
  The web UI, when built, is expected to call the same skill so behavior stays identical across
  surfaces.
