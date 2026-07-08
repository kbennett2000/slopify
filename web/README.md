# Slopify web UI (first slice)

A tiny local web front-end for slopify: one box in, one over-the-top post out.

The backend is deliberately thin. It reads the **real** methodology from
[`../.claude/skills/slopify/SKILL.md`](../.claude/skills/slopify/SKILL.md) and runs it through the
**Claude Agent SDK** — so it authenticates with **your Claude subscription by default** (no API key)
and the model does all the work; there is no slop logic in JavaScript. That's the "call the skill,
don't reimplement it" seam [ADR-0002](../docs/adr/ADR-0002-web-ui-interaction-model.md) called for;
the backend shape is recorded in [ADR-0003](../docs/adr/ADR-0003-web-ui-backend.md).

## Run it

> New here? For a plain, per-OS walkthrough (and the Claude-subscription requirement spelled out),
> see **[docs/install.md](../docs/install.md)**. The quick version:

**One-time prerequisites:**

- **[Node.js](https://nodejs.org) 18+** installed.
- **Signed in to Claude** — the UI runs on your Claude subscription, the same login Claude Code
  uses. Get [Claude Code](https://claude.com/claude-code) if you don't have it, then run
  `claude login`.

**Then run the launcher** — it installs dependencies on first run, starts the server, and opens
your browser:

- **macOS** — double-click `start.command` (or `./start.command` in a terminal)
- **Windows** — double-click `start.bat`
- **Linux** — `./start.sh`
- **Any OS, from a terminal** — `node start.mjs` (or `npm start`)

Type something mundane, hit **Slopify** (~15–30s), then **Copy**, share, or hit
**♻️ Feed It Back** to run the result through slopify *again* — a one-click model-collapse demo.

> First run downloads the Claude Agent SDK (~250 MB, one time only). **No API key, no `.env`
> needed** — signing in to Claude is the whole setup.

## Notes

- **Auth:** your Claude subscription by default (no API key, no `.env`). The launcher checks you're
  signed in before starting and points you to `claude login` if not. To bill the Anthropic API
  instead, put `ANTHROPIC_API_KEY` in `web/.env` (see [`.env.example`](.env.example)) — it takes over
  when present.
- **Commands:** `npm start` (or the OS launcher) runs the friendly path — preflight → install if
  needed → server → open browser. `npm run server` starts the raw server only; `npm run dev` adds
  auto-reload.
- **Not standalone:** the backend reads the real methodology from
  [`../.claude/skills/slopify/SKILL.md`](../.claude/skills/slopify/SKILL.md) two levels up, so run it
  from inside the repo — don't copy `web/` out on its own.
- **Model:** `claude-sonnet-5` (a UI-only choice). The project's Claude Code skill still runs on
  `claude-opus-4-8` at effort `max`; that pin in `../.claude/settings.json` is untouched — and
  deliberately ignored here (`settingSources: []`). Swapping the UI's model is a one-line change in
  [`server.js`](server.js).
- **Speed vs. fidelity:** by default `THINKING = "disabled"` in `server.js` — the model emits the
  full maximum-slop post in one shot (~15–30s). Set it to `"adaptive"` to have the model think
  through the compounding passes (higher fidelity to the literal ladder, but ~80–100s).
- **Refeed (♻️ Feed It Back):** once a post exists, one click runs *it* back through slopify as the
  next kernel — you watch the finished post get copied into the input, locked, and re-slopified, with
  a **Generation N** counter climbing each round. It's the one-click version of the
  [model-collapse loop](../docs/studying-model-collapse.md): the specifics hollow out into
  placeholders while the format survives ([what am I looking at?](../docs/what-am-i-looking-at.md)).
  Front-end only — the endpoint is unchanged ([ADR-0005](../docs/adr/ADR-0005-refeed-button.md)).
- **Scope:** this first slice keeps it simple — **Refeed** (above) is the one interactive control;
  there are still no in-UI *parameter* controls (passes / length / "show the ladder" / platform), no
  streaming, no deploy config yet.
