---
description: Slopify a description — inflate it into one over-the-top, transparently satirical AI-slop clickbait post via iterative amplification passes (final-only by default). Comedy/parody.
argument-hint: "[description] — e.g. \"today is a nice sunny day\"; or a param tweak like \"3 passes, show the ladder\""
---

Run the **slopify model** over the description using the `slopify` skill.

## Targets

Resolve `$ARGUMENTS`:

1. **A description** (the normal case) → treat `$ARGUMENTS` as the **kernel** and slopify it.
   Deliver the final post **in chat**.
2. **Only parameter directives** (e.g. "3 passes", "final only", "longer each pass", "show the
   ladder") → update the session params and carry them forward. Apply to the most recent kernel
   if there is one; otherwise acknowledge and wait for the next description.
3. **Empty** → there's nothing to slopify yet; ask for a one-line description. That's soliciting
   the required input, not a permission prompt.

## How to run it

1. Invoke the **`slopify` skill** and take `$ARGUMENTS` as the **kernel**.
2. Build the **base post**, then run the **amplification passes** (default 5), each escalating the
   *prior pass's text*. Don't jump straight to maximum slop — compounding is the method.
3. **Deliver the final post only** (unless `show_intermediate` is on), in chat.

## Rules

- **Autonomy.** Produce the post directly — never ask "want me to proceed?" The one thing you may
  ask for is a missing kernel.
- **Parody + guardrails.** Output must be transparently absurd. No realistic false claims about
  real named people; keep any sensitive-domain "authority"/"statistics" cartoonish, never
  actionable.
- **Final-only by default.** Show the full base→pass-5 ladder only when `show_intermediate` is on
  ("show the ladder").
- After each post, give a one-line chat summary: the kernel and the params used.

> **Interface note.** Chat is the interim surface — a web UI is planned as slopify's primary way
> to run (see `docs/adr/ADR-0002-web-ui-interaction-model.md`). This command keeps it usable from
> Claude Code in the meantime. There is no `input/` drop-off folder in this project.

See `CLAUDE.md` for conventions and `docs/slopify_model_v1.0.md` for the full methodology.
