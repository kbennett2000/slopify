# What Am I Looking At?

*The science behind the slopify collapse demo.*

---

## What just happened

*(Deep breath — the shouting stops here. This is the honest, actual explainer.)*

You gave the app a normal, ordinary statement. It turned that statement into an
over-produced social media post — emojis, fake statistics, a weeping stranger,
NASA, a wall of hashtags. Then it did something stranger: it fed that post back
into itself, and again, and again.

Watch the arc:

1. **Escalation** — the post gets louder and more ornate with each pass.
2. **Ornamental peak** — every device is firing at once, but the post still
   *means* something. It's still about your original statement.
3. **Decay** — something turns over. The specific details start draining out —
   faces, place names, the one-off jokes — while the *format* stays perfectly
   intact. You get slop with the nutrients boiled out.
4. **Mode-spike** — the post begins to stutter, repeating its highest-frequency
   pieces because repetition is the only way left to "make it bigger."
5. **Fixed point** — the output collapses to a single repeating motif. Run the
   transform again and *nothing changes*. The loop has terminated.

That terminal state — where the transformation stops having any effect — is not
a bug. It's the whole point of the demo. You've just watched a small, legible
version of a real and well-documented phenomenon.

*Want a real one? [`sample/collapse-run.md`](sample/collapse-run.md) is an actual captured
cascade — messier and wilder than this idealized arc. It escalates, **forgets its own topic
entirely** (a "cake" seed reincarnates, mid-run, as a shoe-store ad), briefly freezes into a
fixed point, then escalates again. The arc above is the clean sketch; that file is the weather.*

---

## The name for this: model collapse

The effect is called **model collapse**: a degenerative process in which a
generative system trained on its own output progressively forgets the true
underlying data distribution. The foundational result, from Shumailov and
colleagues in *Nature* (2024), showed that indiscriminately learning from data
produced by other models causes this collapse — models forget the true
distribution over time, even without any change in the world they're modeling.

The single most important detail: collapse eats the **tails of the distribution
first**. The rare, specific, low-probability material disappears before anything
else. That's exactly why, in the demo, the individual details (the faces, the
place names, the specific numbers) evaporate *before* the loud, generic tokens
do. Specificity dies first; the reflex of emphasis dies last.

---

## The two phases

The literature splits collapse into two stages, and the demo walks through both:

- **Early collapse** — the model loses the low-probability tails: diversity,
  specificity, edge cases. *In the app:* details get replaced by placeholders.
- **Late collapse** — the distribution converges toward a low-variance point,
  often a single mode. *In the app:* the stutter, and then the fixed point.

In the *Nature* study's density-estimation experiments, repeatedly fitting a
distribution to samples of itself caused the samples to converge, after enough
iterations, onto a single mode. The `🚨 AMEN 🚨 AMEN` attractor at the end of a
slopify run is the text-genre version of that same convergence.

---

## Why it happens

Three sources of error compound across iterations:

- **Finite-sample error** — you can only ever draw a limited number of samples,
  so rare events get undersampled and eventually vanish entirely.
- **Expressivity / approximation error** — no model perfectly represents its
  target distribution, so each "copy of a copy" distorts a little more.
- **Iteration** — these errors don't cancel out. They accumulate, generation
  over generation, until the distribution has drifted beyond recognition.

The intuition specific to *this* app: the slopify operator only ever says *make
it bigger, louder, more*. That instruction carries no new information — so "more"
can only ever resolve to "more of the most probable thing." That makes the
transform **mode-seeking**: mathematically, a contraction toward the peak of the
distribution. Which is precisely why the loop *terminates* at a fixed point
instead of wandering forever. Probability mass migrates toward the single most
likely token until that's all that's left.

---

## Honest caveat: what this demo is, and isn't

The foundational research describes **retraining a model's weights** on synthetic
data across successive generations of models. This app does something adjacent
but genuinely different: it applies a **fixed transform to its own output,
in-context**, with no weights changing at any point.

So treat this demo as a **legible analogy**, not a literal reproduction of the
training-loop experiment. Its value is that it makes the *shape* of collapse
hand-inspectable: every generative device in a slop post (the weeping stranger,
NASA, the stats block, the hashtag salad) is a countable, nameable thing, so you
can watch each one degrade and drop out in sequence — something you can't do by
staring at a perplexity curve. The mechanism rhymes with model collapse; the
setup is not identical. Anyone who tells you otherwise is overselling it.

---

## Related vocabulary you'll run into

- **Model autophagy disorder (MAD) / self-consuming loops** — the framing from
  Alemohammad et al., *Self-Consuming Generative Models Go MAD* (ICLR 2024),
  which studies "autophagous" (self-consuming) loops. Their headline finding:
  without enough fresh real data at each iteration, the quality *or* diversity of
  the synthetic data inevitably decreases.
- **Mode collapse** — an older GAN-era term for the *endpoint geometry* (a
  generator that only produces a few output types). Useful for separating the
  *process* (collapse / MAD) from the *terminal shape* (mode collapse).
- **Regression to the mean** — the statistical undertow beneath all of it.
- **"Habsburg AI," "AI inbreeding," the ouroboros** — informal / journalistic
  labels for the same idea. Evocative, not technical. Fine for a headline,
  not for a citation.

---

## Is collapse inevitable? (Read this before you panic)

No — and the demo can actually show you why not.

The central rebuttal comes from Gerstgrasser et al., *Is Model Collapse
Inevitable?* (2024). They confirm that **replacing** real data with each
generation's synthetic data does tend toward collapse — but show that
**accumulating** each new generation of synthetic data *alongside the original
real data* avoids it, across a range of model sizes and architectures. The
theoretical version: if data are replaced, test error grows with each iteration;
if data accumulate, test error has a finite upper bound independent of the number
of iterations.

Related mitigations in the broader literature: keep a fresh real-data anchor,
and verify or curate synthetic data to suppress noise accumulation and bound the
error. The takeaway is not "synthetic data is doom." It's "self-consumption
*without a real-data anchor* is doom." That distinction is the whole ballgame.

---

## Why it matters beyond the joke

As AI-generated text and images flood the internet, future models scrape that
output as training data — closing exactly the kind of feedback loop these papers
describe. Left unmanaged, that could pollute future model generations, which is
why researchers stress that filtering and provenance for synthetic data need to
be taken seriously. A quieter consequence: verified human data becomes a scarce
and valuable resource.

But keep the alarm proportionate — see the section above. Collapse is a failure
mode to *manage*, not an inevitability to dread.

---

## Try it yourself

*Turn the knobs. For science.* The web UI now ships the **first** of these controls; the rest
are the roadmap:

- **♻️ Feed It Back — live now.** After any run, one click refeeds the output as the next kernel
  and a **Generation N** counter climbs — the self-consuming loop this whole page describes, one
  click at a time. A real captured cascade, annotated version by version, is in
  [`sample/collapse-run.md`](sample/collapse-run.md). One honest caveat: each in-UI run is a
  one-shot Pass-5 (the backend re-maxes every call, thinking off), so what you're watching is the
  **outer** post→post loop, not compounding inside a single run.
- **Seed choice — you already have this** (just type a different kernel). Run cascades from very
  different starting posts and compare where they end up. The open question — is the final attractor
  seed-*invariant* or seed-*determined*? — is now something you can actually poke at, and early hand
  runs suggest **seed-sensitive**: a bland "today is a nice sunny day" froze into a near-fixed-point
  within a round or two, while "I like cake" escalated for six rounds and then *crashed* — losing its
  topic entirely and reincarnating as an ad for a shoe store (see the captured run). Same loop,
  wildly different fate.
- **Pass count & length-growth — roadmap.** Expose the parameters and watch the phase transition
  slide earlier or later.
- **"Inject fresh data" toggle — roadmap.** Reintroduce a brand-new real seed every few passes and
  watch collapse get *arrested*. This is a live, playable demonstration of the Gerstgrasser
  "accumulate, don't replace" result — the same app that shows you the disease shows you the cure.

---

## References & further reading

**Start here (accessible):**

- Emily Wenger. "AI produces gibberish when trained on too much AI-generated
  data." *Nature* News & Views (2024). DOI 10.1038/d41586-024-02355-z. — the
  one-page plain-English intro.

**Foundational:**

- Ilia Shumailov, Zakhar Shumaylov, Yiren Zhao, Nicolas Papernot, Ross Anderson &
  Yarin Gal. "AI models collapse when trained on recursively generated data."
  *Nature* 631, 755–759 (2024). DOI 10.1038/s41586-024-07566-y. (Preprint
  precursor: "The Curse of Recursion," arXiv:2305.17493.)

**The self-consuming-loop framing:**

- Sina Alemohammad et al. "Self-Consuming Generative Models Go MAD." ICLR 2024.
  arXiv:2307.01850. — the image-model view, and the source of the "MAD" /
  "autophagy" vocabulary.

**Counterpoints & mitigations:**

- Matthias Gerstgrasser et al. "Is Model Collapse Inevitable? Breaking the Curse
  of Recursion by Accumulating Real and Synthetic Data." 2024. arXiv:2404.01413.
  — the essential rebuttal.
- Quentin Bertrand et al. "On the Stability of Iterative Retraining of Generative
  Models on Their Own Data." ICLR 2024. — when the loop is stable.
- Nate Gillman et al. "Self-Correcting Self-Consuming Loops for Generative Model
  Training." ICML 2024. — a correction mechanism.

**For the theoretically inclined:**

- Elvis Dohmatob et al. — work treating collapse as a change in scaling laws
  ("A Tale of Tails") and "Strong Model Collapse." *Verify current titles/venues
  before citing; these are the one set of references in this doc not confirmed
  against a live source at time of writing.*

---

*This document accompanies the slopify collapse demo. The demo is an
illustration, not an experiment — see "What this demo is, and isn't," above.*
