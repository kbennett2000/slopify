# `slopify` — Skill Design Document

**Consumer:** Claude Code
**Deliverable:** a prompt-only skill named `slopify`
**Build size:** single slice (prompt-only; no code, no state, no deps — see §12)

---

## 1. Purpose

`slopify` turns a plain description into the most over-the-top, obvious "AI slop"
clickbait social-media post possible. It does this not in one shot but through a
fixed number of **iterative amplification passes**, where each pass takes the
*previous pass's output* as its input and escalates it further. Only the final
pass is delivered to the user.

This is a comedy / parody skill. The whole point is that the output is
transparently, cartoonishly fake — it satirizes engagement-farming content by
maxing out every one of its tells at once.

---

## 2. Design intent — what "slop" means here

The target aesthetic is the fusion of every recognizable engagement-bait tell:

- Ragebait / clickbait hooks ("YOU WON'T BELIEVE…", "STOP SCROLLING")
- Emoji saturation
- The fake-transformation testimonial arc
- Fabricated authority (NASA, doctors, scientists, "peer-reviewed")
- Conspiracy framing ("Big X doesn't want you to know")
- Invented statistics and testimonials
- The full engagement-bait ritual stack (comment a keyword, double-tap, tag 3, "type AMEN")
- FOMO / scarcity ("98% will scroll past")
- Hashtag salad

The humor comes from applying **all of this to something utterly mundane** (a
breakfast, a sunny day, a rug). The bigger the gap between the trivial kernel and
the epic treatment, the better the output.

---

## 3. I/O contract

**Input:** a short description. Anything from a business one-liner
("Gary's Shoes, Chicago. Best in women's shoes.") to a bare fact
("Today is a nice sunny day").

**Output:** a single final social-media post — the result of running the base
post through all amplification passes. Intermediate passes are **not** shown
unless the user explicitly asks to see the ladder.

**The skill runs autonomously.** Once given an assignment it produces the final
post directly. It does not ask permission to proceed, and it does not ask which
platform unless the user has configured a platform flavor (see §13).

---

## 4. Configurable parameters

| Param | Default | Meaning |
|---|---|---|
| `passes` | `5` | Number of amplification passes applied after the base post. |
| `length_growth` | `on` | Each pass is a little longer than the previous one (see §9). |
| `show_intermediate` | `off` | If on, show every pass; otherwise deliver final only. |
| `platform` | `generic` | Optional flavor (X thread / Instagram / Facebook / LinkedIn). See §13. |

These are session-adjustable in natural language. The reference game established
the pattern exactly: *"update algo — content gets 5 passes now by default"*,
*"I only need to see final output"*, *"lengthen the post a little bit on each
pass."* The skill must honor mid-session reconfiguration and carry it forward.

---

## 5. The algorithm

```
slopify(description, passes=5, length_growth=on):
    post = base_post(description)          # §6 — a sane, competent post
    for i in 1..passes:
        target_len = length_curve(i, length_growth)   # §9
        post = amplify(post, pass_index=i, target_len=target_len)   # §7, §8
    return post            # deliver final only unless show_intermediate
```

**The load-bearing principle is iterative compounding.** `amplify` never rebuilds
from the original description — it operates on the prior pass's text and turns the
dials up from wherever they already are. Each pass inherits everything the last
one added and pushes further. This is why the final output feels like sediment:
layers accreted, never reset.

---

## 6. Stage 0 — the base post

Before any amplification, convert the description into a **plain, competent,
genuinely normal** social post: correct, mildly friendly, maybe one emoji, no
gimmicks. This is the clean baseline the passes will corrupt.

> Input: *"I had coffee, eggs, and toast for breakfast this morning."*
> Base:  *"I had coffee, eggs, and toast for breakfast this morning."*

> Input: *"Gary's Shoes, Chicago. Best in women's shoes. Al Bundy, shoe salesman…"*
> Base:  *"Gary's Shoes in Chicago — top-quality women's shoes. Come see Al Bundy, our shoe expert and former Polk High football star."*

Keep the base honest. The comedy downstream depends on having a sane starting
point to depart from.

---

## 7. The slop-vector taxonomy (the dials)

`amplify` escalates along these independent vectors. Each pass raises several of
them. Later passes raise them all.

1. **Emoji density & variety** — from one tasteful emoji to clusters bracketing
   every clause.
2. **Clickbait hook** — from a friendly question to "🚨🚨 YOU WON'T BELIEVE… (the
   4th one will SHOCK you)".
3. **Emphasis typography** — SCREAMING CAPS on key words; escalate to Unicode
   math-bold for the biggest reveals (`𝐓𝐑𝐈𝐍𝐈𝐓𝐘`, `𝐓𝐎𝐔𝐂𝐇𝐃𝐎𝐖𝐍`).
4. **Transformation arc** — the narrator was broken/lost/hopeless → had a
   revelation → ASCENDED. Mundane subject reframed as a life-altering event.
5. **Fabricated authority** — NASA, doctors, scientists, "peer-reviewed",
   "EMTs were called", satellites, "Confucius would weep".
6. **Conspiracy framing** — a "Big X" villain (Big Cereal, Big Furniture, Big
   Umbrella, Big Kibble) plus "they don't want you to know".
7. **Fake statistics block** — a ✅ checklist of absurd, unfalsifiable metrics
   ("Vibes: IMMACULATE", "Ancestors: LITERALLY WEEPING WITH PRIDE").
8. **Fake testimonial** — an attributed quote from a stranger / "Karen, probably"
   / "Me, a new being".
9. **Engagement-bait stack** — comment a KEYWORD (§10), double-tap, repost-or-
   the-algorithm-wins, tag 3 people, "type AMEN", share-to-your-story-or-else.
10. **Scarcity / FOMO** — the "98% will scroll past / the 2% who ACT are LEGENDS"
    closer.
11. **Thread structuring** — break the body into numbered beats (1️⃣ 2️⃣ 3️⃣) with a
    "🧵 A THREAD nobody wants you to read" opener.
12. **Hashtag salad** — a trailing block that grows each pass; invent compound
    tags from the subject (`#SunGrindset`, `#BigKibbleExposed`, `#TiedTogetherNation`).
13. **Wordplay / puns** — subject-derived puns ("he sees your SOLE 👁️👣").
14. **Absurdist claim escalation** — each pass tops the last with a more
    ridiculous unfalsifiable claim.

---

## 8. The escalation curve (pass-by-pass)

A guide, not a straitjacket — the aim is a smooth ramp from "slightly cringe" to
"singularity of slop."

| Pass | Feel | Vectors newly engaged / raised |
|---|---|---|
| **1** | Slightly cringe but plausible | 1 light, 2 mild hook, one CTA question. Still recognizably human. |
| **2** | Clearly trying too hard | CAPS emphasis (3), transformation hint (4), first engagement prompt (9). |
| **3** | Full clickbait | Strong hook (2), conspiracy seed (6), first fake stat (7), keyword CTA (9), thread vibe begins (11). |
| **4** | Unhinged thread | Numbered thread (11), "Big X" villain (6), fabricated authority (5), stats block (7), FOMO % (10). |
| **5** | Maximum slop | Everything at once: thread + testimonial (8) + NASA/ancestors (5) + full ✅ stats (7) + complete bait ritual (9) + scarcity (10) + hashtag avalanche (12). |

If `passes` ≠ 5, distribute the same ramp across the available passes: pass 1
stays gentle, the final pass is always maximum, and the middle passes interpolate.

---

## 9. Length growth

With `length_growth=on`, each pass is modestly longer than the one before —
monotonic, gentle, never a sudden wall until it's earned.

Rough target shape (words, generic platform):

```
base   ~15
pass 1 ~40
pass 2 ~90
pass 3 ~160
pass 4 ~260
pass 5 ~420+
```

Growth comes from *adding* material (more beats, a fuller stats block, a longer
bait stack, more hashtags), not from padding existing sentences. New length =
new slop, not filler.

---

## 10. Invariants (hard rules)

These hold across every pass. Violating them breaks the bit.

- **Kernel preservation.** The original fact must remain identifiable in the
  final output. The rug still ties the room together; the cat's breath still
  smells like cat food; the day is still nice and sunny. Slop accretes *around*
  the kernel — it never loses or contradicts it.
- **Keyword CTA is subject-derived.** The "comment THIS word" call-to-action is
  always minted from the kernel: TOUCHDOWN, TRINITY, KIBBLE, TIED IT TOGETHER,
  NICE SUNNY DAY. Never a generic keyword.
- **Compounding, not resetting.** Each pass builds on the prior text (see §5).
- **Final-only delivery** unless `show_intermediate` is on.
- **Autonomy.** Produce the post directly; never ask "want me to proceed?"
- **It must read as parody.** The output should be so overloaded that no
  reasonable person could mistake it for sincere. That obviousness is the
  guardrail (see §11).

---

## 11. Guardrails

The genre *mocks* fake authority and misinformation; the skill must not become a
tool for the real thing.

- **Keep it transparently absurd.** The satire only works — and only stays safe —
  when the claims are cartoonish (NASA is monitoring your cat). Never produce
  plausible-but-false claims that could be screenshotted and passed off as real.
- **Real named public figures:** do not fabricate real quotes or realistic false
  claims attributed to actual people. Fictional characters (e.g. Al Bundy) and
  the generic anonymous "stranger who wept in aisle 4" are fine.
- **Sensitive domains** (health, medical, financial, political, disaster): keep
  any invented "authority" and "statistics" obviously ridiculous rather than
  actionable. If a description can't be handled without producing genuinely
  deceptive real-world claims, slopify the framing, not a dangerous factual claim.
- No slurs, harassment, or targeting of real private individuals.

---

## 12. Recurring motif library

A reusable stock the skill can draw from (rotate, don't exhaust every one every
time). These recurred organically across the reference sessions and give the
output its house style:

- **The collapsing witness** — a stranger who sees/smells/feels the thing, falls
  to their knees, weeps, and reveals decades of expertise.
- **NASA** — "has been notified" / "is monitoring the situation" / "declined to
  comment."
- **The ancestors** — "literally weeping with pride" / "standing and applauding
  from the beyond."
- **"Big X"** — villain institution derived from the subject.
- **The ✅ stats block** — 4–6 unfalsifiable metrics.
- **"read that again. then read it AGAIN."**
- **The 98%/2% closer.**
- **"TYPE AMEN"**, **"ASCENDED"**, **"IMMACULATE"**, **"the ___ WEPT."**
- **Grindset hashtag** — `#<Subject>Grindset`.

---

## 13. Optional extension — platform flavors

Out of scope for slice 1; document only. If `platform` is set, adjust register:

- **X/Twitter thread** — heavy 🧵 numbered beats, "a thread 👇".
- **Instagram** — caption-style, emoji-dense, hashtag block at the very bottom.
- **Facebook** — "SHARE if you agree 🙏", boomer-forward energy, "Amen".
- **LinkedIn** — the "I fired a candidate for X. Here's why that made me cry
  in my Tesla" genre: short staccato lines, fake vulnerability, "Agree? 👇".

Default `generic` blends all of them, which is what the reference outputs use.

---

## 14. Worked example A — full pass ladder

Illustrates the escalation curve. Input: *"I had coffee, eggs, and toast for
breakfast this morning."* (Shown here for CC's reference; in normal operation
only Pass 5 is delivered.)

- **Base:** *I had coffee, eggs, and toast for breakfast this morning.*
- **Pass 1:** *Started my morning right ☕ Coffee, eggs, and toast — simple but perfect! 🍳🍞 What's YOUR go-to breakfast?*
- **Pass 2:** Adds CAPS, "body is a temple," a "drop your breakfast below 👇" prompt.
- **Pass 3:** "The breakfast that CHANGED my entire day 🚨", "THE TRINITY," a "comment FUELED" CTA, first conspiracy seed.
- **Pass 4:** Numbered thread, "Big Cereal," "nutritionists are FURIOUS," a stats block, the 9/10 FOMO line.
- **Pass 5 (delivered):** Full thread with NASA, the applauding stranger, the ✅ stats block ("Ancestors: LITERALLY WEEPING WITH PRIDE"), the complete bait ritual ("comment 𝐓𝐑𝐈𝐍𝐈𝐓𝐘 … type AMEN"), the 97%/3% closer, and a 15-tag hashtag avalanche (`#BigCerealExposed #ProteinPilled #AncestorsWatching …`).

Note the kernel — coffee, eggs, toast — survives verbatim into Pass 5.

---

## 15. Worked example B — input → final delivery

Input: *"Today is a nice sunny day"* → the delivered Pass-5 output exhibits, in
order: triple-🚨 hook with a "(the SKY did something)" tease; a 🧵 "Big Weather
PRAYED you'd never read" opener; four numbered transformation beats building to
the reveal that the day is, in fact, **NICE**; the collapsing-stranger + golden
retriever + NASA-satellites motif; a ✅ atmospheric-data block ("Big Umbrella:
BANKRUPT overnight ☂️💀"); an attributed testimonial ("— Me, spiritually reborn
by basic pleasant weather"); the full bait ritual keyed to `NICE SUNNY DAY`
including "type AMEN" and "duet this with a photo of YOUR sunny day"; the 98%/2%
scarcity closer; and a ~16-tag hashtag block (`#SolarPilled #BigWeatherExposed
#SunGrindset …`).

Use this as the north-star output quality bar.

---

## 16. Implementation guidance for Claude Code

**This is a prompt-only skill.** No executable code, no persisted state, no
dependencies. The entire skill is a `SKILL.md` whose body encodes §5–§12 as
instructions. Do not over-engineer it into a pipeline with scripts — there is no
determinism to enforce here that a well-written prompt doesn't already carry.

Recommended `SKILL.md` shape:

- **Frontmatter `description`** (drives triggering) — something like: *"Use when
  the user wants to slopify a description — turn a plain statement, fact, or
  business blurb into an over-the-top AI-slop clickbait social post via N
  iterative amplification passes. Triggers on 'slopify', 'make this AI slop',
  'clickbait-ify', or an explicit slopify game/session."*
- **Body sections**, adapted from this doc:
  1. The one-paragraph purpose (§1) and parody framing (§2, §11).
  2. The algorithm and compounding principle (§5).
  3. The base-post step (§6).
  4. The slop-vector taxonomy (§7) and pass-by-pass curve (§8) — the operative core.
  5. Length growth (§9), invariants (§10), motif library (§12).
  6. The two worked examples (§14, §15) as few-shot quality anchors — include at
     least the full Pass-5 sunny-day output verbatim as the bar.
  7. Session-parameter handling (§4): the skill must accept and persist in-session
     natural-language reconfiguration ("5 passes now", "final only", "longer each
     pass").

**Acceptance criteria:**

1. Given a plain description, the skill returns exactly one final post (final-only
   default) whose kernel is still identifiable.
2. `passes`, `show_intermediate`, and `length_growth` are honored and adjustable
   mid-session in plain language.
3. Output exhibits ≥10 of the 14 slop vectors, the subject-derived keyword CTA,
   and a subject-derived `#…Grindset` tag.
4. Output is transparently satirical and passes §11 guardrails (no realistic
   false claims about real named people; sensitive-domain claims stay cartoonish).
5. The skill produces the post directly without asking permission to proceed.

**Suggested single ADR:** `ADR-0001 — slopify is a prompt-only skill.` Records the
decision to encode the algorithm entirely in `SKILL.md` rather than as code, on
the grounds that every step is a generative/stylistic transform with no
verifiable contract to enforce programmatically.
