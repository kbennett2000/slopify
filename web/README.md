# Slopify web UI (first slice)

A tiny local web front-end for slopify: one box in, one over-the-top post out.

The backend is deliberately thin. It reads the **real** methodology from
[`../.claude/skills/slopify/SKILL.md`](../.claude/skills/slopify/SKILL.md) and runs it through the
**Claude Agent SDK** — so it authenticates with **your Claude subscription by default** (no API key)
and the model does all the work; there is no slop logic in JavaScript. That's the "call the skill,
don't reimplement it" seam [ADR-0002](../docs/adr/ADR-0002-web-ui-interaction-model.md) called for;
the backend shape is recorded in [ADR-0003](../docs/adr/ADR-0003-web-ui-backend.md).

## Run it

```
cd web
npm install
npm start
```

Open <http://localhost:3000>, type something mundane, hit **Slopify** (~15–30s), then **Copy**.

You just need to be signed in to Claude Code (`claude login`) — the UI reuses that subscription
login. **No API key required.**

## Notes

- **Auth:** your Claude subscription by default. To bill the Anthropic API instead, put
  `ANTHROPIC_API_KEY` in `web/.env` (see [`.env.example`](.env.example)) — it takes over when present.
- **Model:** `claude-sonnet-5` (a UI-only choice). The project's Claude Code skill still runs on
  `claude-opus-4-8` at effort `max`; that pin in `../.claude/settings.json` is untouched — and
  deliberately ignored here (`settingSources: []`). Swapping the UI's model is a one-line change in
  [`server.js`](server.js).
- **Speed vs. fidelity:** by default `THINKING = "disabled"` in `server.js` — the model emits the
  full maximum-slop post in one shot (~15–30s). Set it to `"adaptive"` to have the model think
  through the compounding passes (higher fidelity to the literal ladder, but ~80–100s).
- **Scope:** this first slice keeps it simple — no in-UI parameter controls (passes / length / "show
  the ladder" / platform), no streaming, no deploy config yet.
