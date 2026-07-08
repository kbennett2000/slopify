#!/usr/bin/env node
// slopify web UI launcher — one command to run the app on Windows, macOS, or Linux.
//
// It does the boring parts for you: checks you're signed in to Claude, installs
// dependencies on first run, starts the local server, and opens your browser.
//
// Dependency-free ON PURPOSE — it uses only Node built-ins so it can run BEFORE
// `npm install` has fetched anything. Do not add imports from node_modules here.

import { existsSync, readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === "win32";

function die(msg) {
  console.error(msg);
  process.exit(1);
}

// --- tiny .env reader -------------------------------------------------------
// dotenv isn't installed yet on the very first run, so parse web/.env ourselves
// (just enough to honor an ANTHROPIC_API_KEY / PORT override if the user set one).
function readEnvFile() {
  const out = {};
  let raw;
  try {
    raw = readFileSync(join(__dirname, ".env"), "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq === -1) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileEnv = readEnvFile();
const pick = (name) => (process.env[name] || fileEnv[name] || "").trim();
const apiKey = pick("ANTHROPIC_API_KEY");
const oauthToken = pick("CLAUDE_CODE_OAUTH_TOKEN");
const PORT = process.env.PORT || fileEnv.PORT || "3000";
const APP_URL = `http://localhost:${PORT}`;

// --- 0. Node version --------------------------------------------------------
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (Number.isFinite(nodeMajor) && nodeMajor < 18) {
  die(
    `\n  slopify needs Node 18 or newer — you have ${process.versions.node}.\n` +
      `  Update from https://nodejs.org, then run this again.\n`,
  );
}

console.log("\n  📺  slopify — starting up…\n");

// --- 1. Preflight: are we signed in to Claude? ------------------------------
// The app authenticates the way Claude Code does: your Claude subscription, read
// from ~/.claude/.credentials.json. An API key (or OAuth token) overrides that,
// so if one is set we skip this check.
const credsPath = join(homedir(), ".claude", ".credentials.json");
if (!apiKey && !oauthToken && !existsSync(credsPath)) {
  die(
    "  ✗ You're not signed in to Claude yet.\n\n" +
      "  slopify's web UI runs on your Claude subscription — the same login\n" +
      "  Claude Code uses. To fix it, run this in a terminal:\n\n" +
      "      claude login\n\n" +
      "  Don't have Claude Code? Get it here, then sign in:\n" +
      "      https://claude.com/claude-code\n\n" +
      "  (Prefer to bill the Anthropic API instead? Put ANTHROPIC_API_KEY in\n" +
      "  web/.env — see web/.env.example.)\n\n" +
      "  Then run this again.\n",
  );
}

// --- 2. First-run install ---------------------------------------------------
if (!existsSync(join(__dirname, "node_modules"))) {
  console.log(
    "  📦 First run: installing dependencies. This pulls the Claude Agent SDK\n" +
      "     (~250 MB, one time — grab a coffee). Future runs skip this.\n",
  );
  const npm = isWin ? "npm.cmd" : "npm";
  const res = spawnSync(npm, ["install"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: isWin, // Windows needs a shell to resolve npm.cmd
  });
  if (res.status !== 0) {
    die(
      "\n  ✗ `npm install` failed (see the output above).\n" +
        "  Fix the error and run this again.\n",
    );
  }
  console.log("\n  ✓ Dependencies installed.\n");
}

// --- 3. Start the server (as a child) + open the browser --------------------
console.log("  🚀 Launching the server…\n");
const server = spawn(process.execPath, ["server.js"], {
  cwd: __dirname,
  stdio: "inherit",
  env: process.env,
});

server.on("error", (err) =>
  die(`\n  ✗ Couldn't start the server: ${err.message}\n`),
);
server.on("exit", (code) => process.exit(code ?? 0));

// Forward Ctrl+C (and termination) so the server shuts down cleanly with us.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    if (!server.killed) server.kill(sig);
  });
}

// Wait until the port is actually accepting connections, then open the browser.
function waitForServer(port, tries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const sock = createConnection({ port: Number(port), host: "127.0.0.1" });
      sock.once("connect", () => {
        sock.destroy();
        resolve();
      });
      sock.once("error", () => {
        sock.destroy();
        if (n <= 0) return reject(new Error("timeout"));
        setTimeout(() => attempt(n - 1), 250);
      });
    };
    attempt(tries);
  });
}

function openBrowser(url) {
  let cmd, args;
  if (isWin) {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else if (process.platform === "darwin") {
    cmd = "open";
    args = [url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.on("error", () => {}); // headless box / no opener — the URL is printed anyway
    child.unref();
  } catch {
    /* ignore — we print the URL below regardless */
  }
}

waitForServer(PORT)
  .then(() => {
    console.log(`\n  ✓ slopify is live → ${APP_URL}  (opening your browser…)\n`);
    openBrowser(APP_URL);
  })
  .catch(() => {
    console.log(
      `\n  slopify should be running — open ${APP_URL} in your browser.\n`,
    );
  });
