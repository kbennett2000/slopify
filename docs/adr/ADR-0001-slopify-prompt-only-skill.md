# ADR-0001 — slopify is a prompt-only skill

**Status:** Accepted · 2026-07-07
**Context doc:** `docs/slopify_model_v1.0.md` (§16)

## Context

`slopify` inflates a plain description into an over-the-top AI-slop clickbait post through a
fixed number of iterative amplification passes. Every step — the base post, each amplification
pass, length growth, vector selection, guardrail judgment — is a **generative / stylistic
transform**. There is no verifiable contract to enforce programmatically: "is this post
sufficiently slop?" and "is this transparently parody?" are judgment calls, not assertions a
script can check. Mechanical or dynamic exit criteria are unreliable for a task like this — the
judgment is carried by a strong model at high effort, not by a script.

## Decision

Encode the entire algorithm in `.claude/skills/slopify/SKILL.md` (plus worked examples under
`examples/` and the `/slopify` command as orchestration). **No executable code, no persisted
state, no dependencies.** Session parameters (`passes`, `length_growth`, `show_intermediate`,
`platform`) live in the conversation, not in a config file.

## Consequences

- **Good:** nothing to install, run, or maintain; the skill is portable across every Claude Code
  surface; the whole tool is just one doc, one skill, and one command.
- **Good:** behavior is refined the same way the model is — by editing the doc and bumping the
  version, not by shipping code.
- **Trade-off:** determinism is not guaranteed (the same kernel can yield different posts). That
  is acceptable and arguably desirable for a comedy generator; the invariants and pre-delivery
  self-check in `SKILL.md` are the quality floor, not a script.
- **Trade-off:** no per-run telemetry or automated acceptance tests. The §16 acceptance criteria
  are verified by reading the output, not by CI.
