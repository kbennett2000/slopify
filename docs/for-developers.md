# Slopify for developers — a reference architecture for Claude Code skills

*Yes, the front of the box is all SlopStream™ and knobs that go to 11 — but back here in
engineering it's four tidy little files. Here's how the MIRACLE is actually assembled.*

Slopify is deliberately tiny and deliberately **prompt-only**: no application code, no build step,
no dependencies. That makes it a clean worked example of how a capability is packaged in Claude
Code. If you're here to learn the pattern (rather than to laugh at breakfast posts), this is the
map.

## The four moving parts

A skill like this is four artifacts that reference each other:

| Part | File | Role |
|---|---|---|
| **Methodology doc** | `docs/slopify_model_v1.0.md` | The *what & why*, versioned. The source of truth that refinement edits. |
| **Skill** | `.claude/skills/slopify/SKILL.md` | The *runtime rules*, distilled from the doc. YAML frontmatter (`name`, `description`) controls when it triggers; the body is the executable instructions. |
| **Command** | `.claude/commands/slopify.md` | Orchestration — the `/slopify` entry point. It wires arguments to the skill; it does **not** restate the algorithm. |
| **Settings** | `.claude/settings.json` | The engine pin (`claude-opus-4-8` / effort `max`), committed so every clone runs identically. `settings.local.json` holds personal permissions and is gitignored. |

Plus **`examples/`** (few-shot anchors the skill can point to) and **`docs/adr/`** (the decisions,
so future-you knows why it's shaped this way).

## How they fit together

```
user: "/slopify today is a nice sunny day"
        │
        ▼
.claude/commands/slopify.md        ← resolves the argument, invokes the skill
        │
        ▼
.claude/skills/slopify/SKILL.md    ← the actual method: base post → N passes → final
        │  (draws on examples/ as quality anchors; obeys settings.json's engine pin)
        ▼
one finished post, delivered in chat
```

The important boundary: the **skill produces a post and hands it back** — it doesn't care whether
the caller is the `/slopify` command, a plain chat request, or (later) a web UI. That
delivery-agnostic seam is what lets the interface change without touching the method.

## Running it as a web app

The same skill also drives a small local web UI in [`../web/`](../web/) — a thin Node/Express
backend that reads `SKILL.md` as its system prompt and runs it through the **Claude Agent SDK on
your Claude subscription** (no API key). It's a separate *caller*, not part of the prompt-only skill,
so it does carry dependencies — that boundary is recorded in
[`ADR-0003`](adr/ADR-0003-web-ui-backend.md).

Running it is one action — it self-installs on first run, starts the server, and opens your browser:

- **Prerequisites:** [Node.js](https://nodejs.org) 18+ and a signed-in Claude (`claude login` — the
  UI reuses Claude Code's subscription login).
- **Launch:** double-click `web/start.command` (macOS) / `web/start.bat` (Windows) / run
  `web/start.sh` (Linux), or `node web/start.mjs` from any terminal.

No API key and no `.env` are needed; see [`web/README.md`](../web/README.md) for the details.

## Why prompt-only?

Every step here — the base post, each amplification pass, judging "is this transparently parody?"
— is a generative, stylistic call with no verifiable contract a script could check. So there's
nothing to gain from code and a lot to lose in complexity; the judgment is carried by a strong
model at high effort instead. That decision is recorded in
`docs/adr/ADR-0001-slopify-prompt-only-skill.md` — worth reading as an example of *when not to
write code*.

## The frontmatter that makes it trigger

The skill's `description` is genre-specific on purpose — it lists real trigger phrases ("slopify,"
"make this AI slop," "clickbait-ify") and explicitly says what it is *not* for (persuasion,
marketing, ordinary rewriting). A vague description would fire on the wrong requests or fail to
fire on the right ones. Precision in that one field is most of what makes a skill feel reliable.

## Adapting the pattern for your own skill

1. **Write the doc first.** Nail down what the thing does and why, with worked examples, before any
   `SKILL.md`. The doc is where you think; the skill is where you execute.
2. **Distill the doc into `SKILL.md`.** Keep the operative core (the algorithm, the invariants, the
   guardrails, a few-shot anchor) in the body. Give it a precise, trigger-focused `description`.
3. **Add a thin command** for an explicit entry point. Orchestration only — don't duplicate the
   method.
4. **Pin the engine** in `settings.json` if the task needs a specific model or effort level.
5. **Record the sharp decisions** as ADRs so the rationale survives.
6. **Version by bumping the doc** (`v1.0` → `v1.1`), not by editing behavior silently, and move the
   skill's version line with it.

That's the whole recipe. Slopify just happens to use it to make a golden retriever ascend.
