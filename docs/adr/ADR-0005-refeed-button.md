# ADR-0005 — The "Refeed" button: one-click recursive slopify in the web UI

**Status:** Accepted · 2026-07-08
**Builds on:** the delivery-agnostic skill ([ADR-0002](ADR-0002-web-ui-interaction-model.md)) and the
stateless web backend ([ADR-0003](ADR-0003-web-ui-backend.md))

## Context

Slopify exists for three reasons at once (see `CLAUDE.md`): it's a toy, a prompt-only reference
architecture, and a **model-collapse study tool**. The third one has a signature move — feed a
finished slop post back in as the *next* kernel and watch it hollow out: the format survives while the
specifics rot into placeholders (`docs/studying-model-collapse.md`, `docs/what-am-i-looking-at.md`).

Until now that loop had **no first-class affordance**. The docs told newcomers to run it by hand —
"paste the result back as the next kernel" — or to ask in chat. Worse, `what-am-i-looking-at.md` was
already written *as if the app performed the loop itself* ("Then it did something stranger: it fed
that post back into itself, and again, and again"), and its "Try it yourself" section described
controls that didn't exist. The web UI (`web/public/index.html`) did a single run and stopped.

The ask: a **Refeed button** that runs the already-slopified output back through slopify with one
click, making the collapse loop a real, visible, on-brand feature — and giving the serious docs a
captured, version-by-version series of the decay.

Two facts shape the design:

1. **The backend is already a stateless kernel→post function.** `POST /api/slopify` takes
   `{ kernel }` and returns `{ post }` (`web/server.js`); it does not care whether the incoming string
   is a fresh description or a prior slop post. Refeeding is just *resend the last `post` as the next
   `kernel`.* So this is a **front-end caller**, not a backend change — the same "wire a new caller,
   don't touch the skill" seam ADR-0002/0003 established.
2. **Each in-UI run is a one-shot Pass-5.** The server runs `thinking: "disabled"` (ADR-0003), so a
   single call re-maxes to full slop rather than walking the visible ladder. The collapse therefore
   comes from the **outer** post→post loop, not from within one call. That nuance has to be stated
   honestly in the docs, but it doesn't change the mechanism the button implements.

## Decision

Add a **Refeed button** ("♻️ Feed It Back!") and a **Generation counter** to the result card in
`web/public/index.html` — a **front-end-only** change; the endpoint, `SKILL.md`, and the model doc are
untouched.

- **One parameterized path.** The existing `slopify()` becomes `slopify({ refeed })`. A normal run
  reads the typed kernel; a refeed reads the last output (`#out`), **visibly copies it into the input
  box**, and sends it as the next kernel. Both share one begin/try/finally, so the spinner, copy/share
  reveal, confetti, and error handling are reused, not duplicated.
- **The output feeds back in the open.** On refeed the finished post is written into `#kernel` so the
  user *sees* what's being re-fed; the input goes **`readOnly` (not `disabled`)** during generation so
  the fed-back text stays legible and keyboard-reachable, then unlocks in `finally`. This applies to
  normal runs too — consistent, and it closes a pre-existing ⌘/Ctrl+Enter re-entrancy gap.
- **One in-flight guard.** A single `isGenerating` flag covers the Go button, the ⌘/Ctrl+Enter
  shortcut, and Refeed, so a second run can't start mid-generation (which matters because a run clears
  `#out` before fetching — a mid-run refeed would otherwise send an empty kernel). Refeed also no-ops
  (with a shake) on an empty box or a prior error string.
- **A Generation counter as the teaching aid.** A badge reads `Generation 1`, then
  `Generation N · IT'S GETTING WORSE™` on each refeed, resetting when a fresh kernel is typed. It sells
  "worse" as a feature — which is simultaneously the joke and the literal truth of the demo — and it
  cleanly labels each round of the captured series.
- **On-brand, but honest.** The button reuses the existing `.share-btn.share-primary` pill (no new
  button CSS) with a subtle pink "sell" glow gated under `prefers-reduced-motion`; a key note
  under the output states plainly that it "gets emptier, not better — that's the point," and the
  button's `aria-label` carries that honest meaning for screen readers.
- **A captured collapse series for the serious docs.** A short seed ("I like cake.") is refed through
  the live backend until the transform reaches a fixed point, and **every version is recorded as
  text** in `docs/sample/collapse-run.md`; the two collapse docs link to it and summarize the arc. It
  is captured by a throwaway loop that POSTs to the local `/api/slopify` endpoint (the same path the
  button uses) — **no browser, no new dependency, no binary assets**, which keeps the launcher's
  deliberately dependency-free runtime intact and the artifact legible and diffable in git.

## Consequences

- **Good — the collapse loop is now one click.** The demo slopify was built to show is a first-class
  feature, not a copy-paste chore; `what-am-i-looking-at.md`'s "it fed that post back into itself"
  narrative is finally something the app actually does, and its "Try it yourself" list has its first
  real control.
- **Good — no backend surface added.** Refeed reuses the stateless endpoint verbatim; there is no new
  route, request field, response field, or persisted state. A future methodology bump still flows in
  through `SKILL.md` with no UI change.
- **Good — reuse over new code.** One parameterized function, the existing share-pill styling, and the
  existing reduced-motion / confetti / shake helpers; the net new surface is small.
- **Trade-off — the captured run is non-reproducible.** It needs a live server, subscription auth, and
  real generation; model output varies run to run. It's recorded as **text** (legible, diffable, no
  binary assets) and framed as an illustration ("results not typical\*"), consistent with how the docs
  already treat the demo.
- **Note — one-shot ≠ literal compounding.** Because the server runs with thinking disabled, each
  round re-maxes to Pass-5 and the collapse is the outer post→post loop; the docs say so explicitly.
- **No version bump.** This adds a **caller and an affordance over existing behavior**, exactly like
  the web UI itself (ADR-0003) and the README stamps (ADR-0004), both of which stayed at **v1.0**. It
  changes no execution rule, so `SKILL.md` and `docs/slopify_model_v1.0.md` are unchanged and the
  model stays at **v1.0**. The dedicated, *instrumented* "recursion / collapse mode" (fixed seeds, a
  diversity metric, structured logging) sketched in `studying-model-collapse.md` remains a separate,
  future **v1.1** — a plain refeed button sits deliberately below that line.
