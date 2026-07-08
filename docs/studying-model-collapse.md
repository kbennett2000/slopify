# Studying model collapse with slopify

*Watch our flagship product EAT ITSELF, live! Results not typical!\* (\*Results extremely typical.)*

**Model collapse** is what happens when a generative model runs on its own outputs, repeatedly:
quality degrades, diversity shrinks, and detail erodes toward a bland, self-referential average.
Slopify is a small, vivid, hands-on way to watch a version of that happen — no training run
required.

→ Want the *why* — the actual science, in plain English, with references? See
[**What am I looking at?**](what-am-i-looking-at.md). This page is the hands-on "how to run it" half.

## The setup

Slopify normally **compounds**: each pass escalates the previous pass's text, so a single run gets
*more*. The collapse experiment does something different — it puts slopify in a **loop against its
own finished output**:

```
kernel₀ = "a nice sunny day"
post₁   = slopify(kernel₀)      # one full run
post₂   = slopify(post₁)        # feed the finished post back in as the next kernel
post₃   = slopify(post₂)
...
```

Each finished post becomes the next run's kernel. You're no longer amplifying a fact — you're
amplifying an amplification, and then amplifying *that*.

## What you'll see

It does **not** keep getting louder. **BUT WAIT — it gets *worse*** (which, for a collapse demo,
is exactly the good part). After a couple of rounds it starts hollowing out:

- **The shape survives.** There's still a hook, still numbered beats, still a weeping stranger,
  still a ✅ stats block. The *format* is stable — it's the last thing to go.
- **The specifics rot into placeholders.** The stranger loses his face and weeps "in the style of
  weeping." The number that was "47 winters" drifts to "40," then "50," then just `[NUMBER]`. The
  coffee shop becomes "a placeholder for a coffee shop."
- **Detail is replaced by the *idea* of detail.** Every metaphor becomes a metaphor for the
  previous metaphor. The post grows longer and says less — "the reflex of emphasis with nothing
  left to emphasize."

That progression — form outliving content — is the intuition behind model collapse, made visible
in a handful of steps. Real runs are often wilder than this tidy description: see
[`sample/collapse-run.md`](sample/collapse-run.md) for a captured cascade that escalates for six
rounds, then *forgets its own topic entirely* (a "cake" seed reincarnates as a shoe-store ad)
before briefly freezing into a fixed point.

## Running it

- **In the web UI, hit the ♻️ Feed It Back button.** After a normal run, one click feeds the
  finished post back in as the next kernel — you watch it get copied into the input box, locked, and
  re-slopified, with a **Generation N** counter climbing each round. It's the one-click version of
  the loop above; keep clicking and watch the decay set in. (It only automates the loop — see
  [`ADR-0005`](adr/ADR-0005-refeed-button.md).)
- **See a real captured run.** [`sample/collapse-run.md`](sample/collapse-run.md) records an actual
  cascade — the seed "I like cake." refed through the backend, version by version, until the
  transform stops changing the text. Read it top to bottom to watch the specifics drain while the
  format holds.
- In chat, kick off a normal run, then paste the result back as the next kernel — or just ask:
  *"slopify that, then slopify the result, five times, and show me each round."* Read the rounds side
  by side; the decay is usually obvious by round three or four.
- To watch escalation *within* a single run instead, turn on `show_intermediate` ("show the
  ladder") — that reveals the base → pass-5 climb, the compounding direction rather than the
  collapsing one. The two views are worth contrasting: one run *builds* detail; the loop *drains*
  it.

## Honest framing

This is a **demonstration, not a measurement.** It's a fast, legible way to build intuition for
what collapse *feels* like — not a controlled study, and slopify's parody register exaggerates the
effect. Treat the output as a teaching aid and a conversation starter, not as data.

The **♻️ Feed It Back** button just automates the loop — one click instead of copy-paste — so it's a
UI convenience over existing behavior, not a methodology change (no version bump; see
[`ADR-0005`](adr/ADR-0005-refeed-button.md)). A dedicated "recursion / collapse mode" (fixed seeds, a
diversity metric, structured logging) would be more — a **methodology version bump** (`v1.1`), not an
ad-hoc tweak. Until then, the loop — now one click — is the experiment.
