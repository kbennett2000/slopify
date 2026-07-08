# Install & run Slopify

The plain, no-nonsense guide to getting the Slopify **web UI** running on your machine. (The README
is where the shouting lives; this page just gets you up and running.)

> ## ⚠️ Read this first — you need a Claude subscription
>
> Slopify runs on **your Claude subscription** — a **Claude Pro or Max plan**, which includes
> **Claude Code**. You sign in once with `claude login` and the app uses that. **There is no API
> key to buy and nothing to host.**
>
> **If you don't have a Claude plan that includes Claude Code, this app will not run.** No sign-in,
> no slop — save yourself the time. Get one at **[claude.com/claude-code](https://claude.com/claude-code)**.
>
> *(Prefer to pay per-use on the Anthropic API instead? That works too — see
> [Configuration](#configuration) — but the subscription is the simple path.)*

Once you're signed in, setup is basically: **install Node → run one launcher → the browser opens.**
First launch installs everything itself.

<p align="center">
  <img src="../assets/ui/hero.png" width="82%" alt="The Slopify web UI: type a mundane thought, crank the SlopDial to 11, hit Slopify." />
</p>

---

## What you need (both platforms-agnostic)

1. **[Node.js](https://nodejs.org) 18 or newer.** Download the "LTS" build from nodejs.org and install
   it. To check what you have, open a terminal and run `node --version`.
2. **A signed-in Claude.** Install [Claude Code](https://claude.com/claude-code) if you don't have it,
   then run **`claude login`** once and follow the prompt. This is what lets Slopify talk to Claude.

That's the whole prerequisite list. Now pick your OS.

---

## Windows

1. Install **Node.js 18+** from [nodejs.org](https://nodejs.org) (the LTS installer).
2. Run **`claude login`** once in a terminal (PowerShell or Command Prompt).
3. In the project's `web` folder, **double-click `start.bat`.**

A terminal window opens, sets itself up on the first run, and your browser pops open to Slopify.
Keep that window open while you use the app; close it to stop the server.

*Terminal alternative:* from the repo root, run `node web/start.mjs`.

---

## macOS

1. Install **Node.js 18+** from [nodejs.org](https://nodejs.org) (or `brew install node`).
2. Run **`claude login`** once in Terminal.
3. In the project's `web` folder, **double-click `start.command`.**

The first run installs dependencies, starts the server, and opens your browser automatically. Leave
the Terminal window open while you play; close it to stop.

*Terminal alternative:* `./web/start.command`, or `node web/start.mjs` from the repo root.

---

## Linux

1. Install **Node.js 18+** from [nodejs.org](https://nodejs.org), your distro's package manager, or
   [nvm](https://github.com/nvm-sh/nvm).
2. Run **`claude login`** once.
3. From the repo, run **`./web/start.sh`** (double-clicking works on most desktops too).

It installs on first run, starts the server, and opens your browser. `Ctrl-C` in the terminal stops it.

*Terminal alternative:* `node web/start.mjs`.

---

## First run is slower

The very first launch downloads the Claude Agent SDK (about **250 MB**) and installs dependencies —
**one time only**. After that, startup is quick. Each slopified post then takes roughly **15–30
seconds** to generate.

---

## Configuration

You shouldn't need any. It works out of the box on your Claude login with no config file. Two optional
knobs, if you want them (both via a `web/.env` file — copy `web/.env.example`):

| Setting | What it does |
|---|---|
| `PORT=3000` | Change the local port the app serves on (default `3000`). |
| `ANTHROPIC_API_KEY=sk-…` | Bill the **Anthropic API** per-use instead of using your subscription. If set, it takes over. Most people leave this unset. |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `node: command not found` or a version below 18 | Install/upgrade [Node.js](https://nodejs.org) 18+, then reopen your terminal. |
| It says you're **not signed in** and won't start | Run **`claude login`** (install [Claude Code](https://claude.com/claude-code) first if needed). |
| **401 / auth error** when you hit Slopify | Same fix — your Claude session expired or isn't set up: run `claude login` again. |
| `Port 3000 in use` | Set a different port: put `PORT=3100` in `web/.env`, or free up 3000. |
| Browser didn't open | The terminal prints the URL (e.g. `http://localhost:3000`) — open it yourself. |

---

## Advanced: run it inside Claude Code

The web UI is the main way to use Slopify. If you already live in **Claude Code**, you can also run it
straight from chat — from the repo folder:

```
/slopify today is a nice sunny day
```

You'll get one finished post. Ask to **"show the ladder"** to watch it build, or say **"3 passes,"**
**"final only,"** **"longer each pass"** to adjust on the fly. That's the power-user path; everyone
else should just [start the web UI](#windows).
