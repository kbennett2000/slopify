import "dotenv/config";
import express from "express";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Config (tune here) -----------------------------------------------------
// The UI runs on Sonnet 5 while we build it out. The project's Claude Code skill
// pin (claude-opus-4-8 / effort max, in .claude/settings.json) is untouched — and
// deliberately ignored here via settingSources: [] below. See ADR-0003.
const MODEL = "claude-sonnet-5";

// Thinking mode drives the quality/latency trade-off:
//   "disabled" — fast (~15-30s). The model emits the maximum-slop Pass-5 post in
//                one shot (the ADAPTER below asks for the endpoint directly).
//                Full-quality output; this is the default for a responsive UI.
//   "adaptive" — the model thinks through the compounding passes before writing.
//                Highest fidelity to the literal ladder method, but ~80-100s.
const THINKING = "disabled"; // "disabled" | "adaptive"
const EFFORT = "medium"; // only applied when THINKING !== "disabled": low|medium|high|xhigh|max

const PORT = process.env.PORT || 3000;

// --- The engine seam: build the system prompt from the REAL skill -----------
// Read .claude/skills/slopify/SKILL.md, strip its YAML frontmatter, and use the
// body verbatim as the system prompt. The LLM stays the engine — no slop logic
// is reimplemented here — and a methodology version-bump flows into the UI for
// free (CLAUDE.md: "source of truth — don't duplicate").
const SKILL_PATH = join(
  __dirname,
  "..",
  ".claude",
  "skills",
  "slopify",
  "SKILL.md",
);

function loadSkillBody() {
  const raw = readFileSync(SKILL_PATH, "utf8");
  // Drop a leading `---\n … \n---` YAML frontmatter block (Claude Code routing
  // metadata) if present; keep the executable body.
  return raw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

// Thin adapter — orchestration only, the same role the /slopify command plays.
// It frames this single stateless call: the SKILL.md above is the method; produce
// the final (Pass-5) post directly. Because the UI only ever delivers the final
// post, we ask for that endpoint in one shot rather than the visible ladder — that
// is what lets us run with thinking off and stay fast. (ADR-0003.)
const ADAPTER = [
  "You are the slopify engine. Everything above is your methodology — the vector taxonomy, the escalation curve, the invariants, the guardrails, the motif library, and the gold-standard Pass-5 example define your target.",
  "The next user message is the KERNEL: the plain description to slopify.",
  "Compose and return ONLY the final, maximum-slop delivered post directly — the Pass-5 endpoint, in full, as if the compounding passes had already been applied.",
  "It must be long (aim ~320-450 words) and fire the whole stack at once: a screaming multi-emoji hook; a numbered 🧵 thread with a transformation arc; a 'Big X' conspiracy derived from the subject; fabricated authority (NASA / ancestors / experts); a ✅ stats block of absurd metrics; an attributed testimonial; the full engagement-bait ritual with a subject-derived KEYWORD call-to-action; the 98%/2% scarcity closer; and a hashtag avalanche including a subject-derived #…Grindset tag.",
  "The kernel must remain identifiable, and it must read as transparent parody.",
  "Output ONLY the post as plain text — no preamble, no pass ladder, no commentary, no surrounding quotes or code fences.",
].join(" ");

const SYSTEM = `${loadSkillBody()}\n\n---\n\n${ADAPTER}`;

// --- Run one slopify via the Agent SDK --------------------------------------
// query() authenticates the way Claude Code does: the user's Claude subscription
// (~/.claude/.credentials.json) by default, or ANTHROPIC_API_KEY if it is present
// in the environment (dotenv loads web/.env into process.env, which the SDK's
// subprocess inherits). No API key is required.
async function slopify(kernel) {
  const options = {
    model: MODEL,
    systemPrompt: SYSTEM, // a string fully replaces the default Claude Code prompt
    thinking: { type: THINKING },
    allowedTools: [], // pure text generation; no tools
    settingSources: [], // ignore the repo's .claude/settings.json (Opus pin)
    permissionMode: "bypassPermissions", // never block on a permission prompt
    maxTurns: 1,
  };
  if (THINKING !== "disabled") options.effort = EFFORT;

  let text = "";
  for await (const msg of query({ prompt: kernel, options })) {
    if (msg.type === "assistant") {
      for (const block of msg.message.content) {
        if (block.type === "text") text = block.text;
      }
    } else if (msg.type === "result" && msg.subtype !== "success") {
      const detail = Array.isArray(msg.errors) ? msg.errors.join("; ") : "";
      throw new Error(`generation failed (${msg.subtype})${detail ? ": " + detail : ""}`);
    }
  }
  return text.trim();
}

// --- Server -----------------------------------------------------------------
const app = express();
app.use(express.json({ limit: "32kb" }));
app.use(express.static(join(__dirname, "public")));

app.post("/api/slopify", async (req, res) => {
  const kernel = (req.body?.kernel ?? "").toString().trim();
  if (!kernel) {
    return res.status(400).json({ error: "Give me a description to slopify." });
  }

  try {
    const post = await slopify(kernel);
    if (!post) {
      return res.status(502).json({ error: "The model came back empty — try again." });
    }
    return res.json({ post });
  } catch (err) {
    const m = (err?.message || String(err)).toLowerCase();
    console.error("slopify error:", err?.message || err);
    if (/auth|credential|login|unauthorized|api[_ ]?key|forbidden|401|403/.test(m)) {
      return res.status(401).json({
        error:
          "Couldn't authenticate with Claude. Sign in to Claude Code (run `claude login`), or set ANTHROPIC_API_KEY in web/.env.",
      });
    }
    if (/rate.?limit|429|overloaded|529/.test(m)) {
      return res.status(429).json({ error: "Rate limited — wait a moment and try again." });
    }
    return res
      .status(500)
      .json({ error: "Something went wrong generating the post. Check the server logs." });
  }
});

// Turn framework errors (e.g. a malformed JSON body) into clean JSON, never an
// HTML stack trace that leaks internal paths.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("request error:", err?.message || err);
  res.status(err?.status || 400).json({ error: "Bad request." });
});

app.listen(PORT, () => {
  console.log(`slopify web UI → http://localhost:${PORT}`);
  // Heads-up if there's no way to authenticate. The launcher (start.mjs) checks
  // this before starting, but `npm run server` skips it. Non-fatal — the model
  // call would otherwise fail later with a 401.
  const hasKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!hasKey && !existsSync(join(homedir(), ".claude", ".credentials.json"))) {
    console.log(
      "  ⚠ Not signed in to Claude — requests will fail. Run `claude login` first.",
    );
  }
});
