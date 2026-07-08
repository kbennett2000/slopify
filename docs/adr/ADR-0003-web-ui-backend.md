# ADR-0003 — web UI backend: run the skill through the Claude Agent SDK on the user's subscription

**Status:** Accepted · 2026-07-07
**Builds on:** `ADR-0001` (prompt-only skill), `ADR-0002` (web UI is the planned interface)

## Context

ADR-0002 committed to a **web UI as the planned primary interface** and to keeping the skill
**delivery-agnostic** — "the web UI, when built, is expected to call the same skill so behavior stays
identical across surfaces." This ADR records how the first slice of that UI is built.

Two forces shape it:

1. **ADR-0001** makes slopify **prompt-only — no code, no state** — because every step is a
   generative/stylistic judgment with no verifiable contract. A web UI still needs *something* to
   receive a request, call a model, and return a post. The question is where the slop gets generated
   (answer: still the LLM, never JavaScript).
2. **It must work with a Claude subscription by default.** People who use slopify already pay for
   Claude via Claude Code; requiring a separate, pay-per-use Anthropic API key just to run the toy is
   the wrong default.

## Decision

Add a self-contained **`web/`** directory: a thin **Node/Express** backend plus one static page. The
backend does **not** reimplement the slop algorithm. At startup it reads the real
`.claude/skills/slopify/SKILL.md`, strips the YAML frontmatter, and uses the body **verbatim as the
system prompt**, wrapped only by a thin adapter instruction (the same orchestration-only role the
`/slopify` command plays). The user's description is the prompt. The **LLM stays the engine**.

Concrete choices for the first slice:

- **Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), not the raw Messages API.** This is the
  load-bearing choice for requirement #2: `query()` authenticates the way Claude Code does — the
  user's **Claude subscription (`~/.claude/.credentials.json`) by default**, or `ANTHROPIC_API_KEY`
  if one is present in the environment. No API key is required. (The first cut of this backend used
  `@anthropic-ai/sdk`, which only authenticates via an API key; that failed for a subscription user
  and was replaced.)
- **`settingSources: []`** so the SDK ignores the repo's own `.claude/settings.json` — otherwise its
  `claude-opus-4-8` / effort `max` pin would override the UI's model choice.
- **Model `claude-sonnet-5`** for the UI — a **deliberate deviation** from that engine pin (which is
  **unchanged**). Trades some quality for cheaper/faster iteration; a one-line revert in `server.js`.
  It means ADR-0002's "behavior stays identical across surfaces" is **not** literally true today —
  recorded here so the drift is intentional, not silent.
- **Thinking off → one-shot Pass-5, by default.** With adaptive thinking on, a full compounded post
  takes ~80–100s — too slow for a click-and-spin UI. With thinking **disabled** and an adapter that
  asks for the *Pass-5 endpoint directly*, the model emits a full-quality maximum-slop post in
  ~15–30s. Because the UI delivers **only the final post** (final-only is the default), one-shotting
  the endpoint serves the same deliverable. A `THINKING = "adaptive"` toggle in `server.js` restores
  the literal think-through-the-passes behavior for anyone who wants fidelity over speed.
- **Non-streaming, single shot**; a spinner covers the wait. Streaming is a noted future enhancement.
- **No persisted state** (consistent with ADR-0001); no in-UI parameter controls yet.

## Consequences

- **Good — works on a subscription out of the box.** `npm install && npm start` and a Claude Code
  login is the whole setup; no API key, no per-token bill.
- **Good — the skill is the single source of truth.** A methodology version-bump (`v1.1`, …) flows
  into the UI with no code change, because the backend re-reads `SKILL.md`. No slop logic to sync.
- **Good — clean boundary.** Model, thinking mode, and (later) streaming are all local to `web/`. The
  `.claude/` skill/command/settings are only *read*, never modified.
- **Trade-off — code + deps for the UI.** The UI now depends on Express and the Agent SDK — a
  departure from "nothing to install" *for the UI*. ADR-0001's prompt-only rule still governs the
  **skill itself**; the web UI is a separate caller, exactly as ADR-0002 framed it.
- **Trade-off — one-shot ≠ literal compounding.** The default path asks for the Pass-5 endpoint in a
  single generation rather than running the visible base→pass-5 ladder. Output quality holds at the
  north-star bar and every invariant is satisfied, but the *process* is not the literal compounding
  the methodology describes. The `adaptive` toggle and a future "show the ladder" feature are where
  literal, visible compounding lives.
- **Trade-off — Sonnet 5 quality may differ** from the Opus-pinned chat experience. Acceptable for a
  dev slice; revisit before calling the web UI the primary surface.
- **Note:** this ADR adds an interface and a runtime trade-off; it does **not** change the
  methodology, so the model doc stays at **v1.0**. No version bump — only a new caller was added.
