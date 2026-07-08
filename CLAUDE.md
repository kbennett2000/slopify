# Slopify

Slopify turns a plain description into one over-the-top, transparently satirical **"AI-slop"
clickbait post**. It doesn't do it in one shot: a sane base post is escalated through **N
compounding amplification passes** (default 5), each turning the dials up from where the last one
left them, until the result is cartoonishly, unmistakably fake. The joke is the gap between a
trivial kernel ("today is a nice sunny day") and the epic treatment it gets. Current model
version: **v1.0** (`docs/slopify_model_v1.0.md`).

## Why this project exists (three purposes)

1. **A toy.** It's funny. Play with it, get a laugh.
2. **A reference architecture.** It's a small, complete, *prompt-only* example of how to build and
   use a skill in Claude Code — a versioned methodology doc, a `SKILL.md`, a slash command, an
   engine pin, and ADRs, with nothing to install. See `docs/for-developers.md`.
3. **A model-collapse study tool.** Feed slopify's own output back in as the next kernel and it
   doesn't get louder — it *hollows out*, keeping the shape while the specifics decay to
   placeholders. That's model collapse you can watch happen. See `docs/studying-model-collapse.md`.

These three sit on the same object: the same silly generator is the teaching example and the
research probe. Keep all three in mind when changing anything here.

## Nature of the task

Slopify is **generative and stylistic** — there's no correct answer to compute, only judgment to
apply. "Is this post sufficiently, transparently slop?" and "does the kernel still survive?" are
read-and-decide calls, not assertions a script can check. So the **LLM is the engine**: the whole
tool is a prompt, pinned to `claude-opus-4-8` at effort `max` (`.claude/settings.json`) because
coherently compounding slop across five passes while holding every invariant and guardrail wants
the strong model. No code, no persisted state — see
`docs/adr/ADR-0001-slopify-prompt-only-skill.md`.

## Interface: chat + a first-slice web UI

The planned primary interface is a **web UI**, and a **first slice now exists** in `web/` — a thin
local Node/Express backend that reads `SKILL.md` as the system prompt and runs it through the Claude
Agent SDK on your **Claude subscription** (`claude-sonnet-5` for now; no API key needed), plus a
one-page front-end. See `docs/adr/ADR-0003-web-ui-backend.md`. slopify also still runs inside
**Claude Code**: the `/slopify` command and the `slopify` skill, delivering a post **in chat**.
There is deliberately **no `input/`/`output/` drop-off folder** — the skill is delivery-agnostic
(one description in, one post out; the caller decides where it lands). See
`docs/adr/ADR-0002-web-ui-interaction-model.md`.

## Repository map

- `docs/slopify_model_v1.0.md` — the canonical, versioned methodology (what & why); the source of
  truth that refinement edits.
- `docs/for-developers.md` — how the skill is assembled (the reference-architecture walkthrough).
- `docs/studying-model-collapse.md` — the recursion experiment and how to run it.
- `docs/adr/` — architecture decisions (prompt-only; web-UI interaction model; web-UI backend).
- `.claude/skills/slopify/` — the `slopify` skill (`SKILL.md`) + worked `examples/`.
- `.claude/commands/slopify.md` — the `/slopify` command (the run mechanism).
- `.claude/settings.json` — the engine pin (shared, committed). `settings.local.json` — personal
  permissions (gitignored).
- `web/` — the first-slice web UI: a thin Node/Express backend (reads `SKILL.md` as the system
  prompt, runs it via the Claude Agent SDK on your subscription) + a one-page front-end. See
  `docs/adr/ADR-0003-web-ui-backend.md`.

## Running slopify

Run **`/slopify <description>`** (or just ask — "slopify 'today is a nice sunny day'"). Under the
hood: a sane **base post** → **N amplification passes** (default 5), each escalating the *prior
pass's* text into a more absurd clickbait post. It runs **autonomously** (never asks to proceed)
and delivers the **final post only** — in chat — unless you ask to see the ladder ("show the
ladder"). Params adjust in plain language mid-session (`passes`, `length_growth`,
`show_intermediate`, `platform`); there is no persisted state (they reset to `5 / on / off /
generic` each session). Methodology: `docs/slopify_model_v1.0.md`.

## Scope guardrails

Slopify runs only on an explicit request or `/slopify`. Its output must stay **transparently
satirical** — the obvious absurdity *is* the guardrail. No realistic false claims about real named
people (fictional characters are fine); in sensitive domains (health, medical, financial,
political, disaster) any invented "authority" or "statistics" stay cartoonish, never actionable;
no slurs, harassment, or targeting of real private individuals.

## Non-negotiable rules

Reminders only — authoritative wording lives in `SKILL.md` and the model doc.

- **Kernel preserved** and identifiable in the final post; **compounding**, not resetting — each
  pass builds on the prior text, never rebuilds from the kernel.
- **Subject-derived** keyword CTA + a `#…Grindset` (or equally subject-derived) hashtag.
- **Final-only** by default; **autonomous** (never ask to proceed).
- **Must read as parody** — the transparent absurdity is the guardrail.
- **Judgment is the LLM's**, never a script's.

## Source of truth (don't duplicate)

Slopify is a **doc + skill + orientation** trio — keep them from drifting:
- **`docs/slopify_model_v1.0.md`** — the methodology (what & why). Canonical; this is what
  refinement edits.
- **`.claude/skills/slopify/SKILL.md`** — the runtime execution rules, distilled from the doc.
- **`CLAUDE.md`** (this file) — orientation + workflow only. Do not restate methodology here.

On conflict, the doc wins for intent, the skill wins for execution.

## Refining the model

When a post falls flat (the human's verdict is ground truth):
1. Capture the input/output pair and the *specific miss* as a new example in
   `.claude/skills/slopify/examples/`.
2. Propose a methodology edit as a new per-version doc (`docs/slopify_model_v1.1.md`) and update
   the current-version pointer.
3. Update the skill's version line to match.

Never change behavior silently — it goes through a version bump. The doc, the skill's version
line, and any version mention here move **together**.
