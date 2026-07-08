---
name: slopify
description: Use when the user wants to slopify a description — turn a plain statement, fact, or business blurb into one over-the-top, transparently satirical "AI-slop" clickbait social post via N iterative amplification passes (final-only by default). Triggers on "slopify", "make this AI slop", "clickbait-ify", "make this cringe / unhinged / ragebait", or an explicit slopify game/session. Comedy/parody only — not for real persuasion, marketing copy, or ordinary rewriting.
---

# Slopify Skill (v1.0)

## Purpose & parody framing

`slopify` turns a plain description into the most over-the-top, obvious "AI slop" clickbait
social-media post possible — not in one shot, but through a fixed number of **iterative
amplification passes**, where each pass takes the *previous pass's output* and escalates it
further. Only the final pass is delivered.

This is a **comedy / parody** skill. The whole point is that the output is transparently,
cartoonishly fake — it satirizes engagement-farming content by maxing out every one of its
tells at once. The humor comes from applying all of it to something utterly mundane (a
breakfast, a sunny day, a rug). **The bigger the gap between the trivial kernel and the epic
treatment, the better.**

## I/O contract & autonomy

- **Input:** a short description — anything from a business one-liner ("Gary's Shoes, Chicago.
  Best in women's shoes.") to a bare fact ("Today is a nice sunny day").
- **Output:** exactly **one** final social-media post — the result of running the base post
  through all amplification passes. Intermediate passes are **not** shown unless
  `show_intermediate` is on.
- **Autonomy:** produce the final post **directly**. Never ask "want me to proceed?" The only
  thing you may ask for is a missing kernel — if there's genuinely nothing to slopify, ask for
  a one-line description. That's soliciting required input, not a permission prompt.
- **Delivery:** exactly one final post, handed back to whoever called the skill. **Today that's
  chat** — a description given in conversation or as `/slopify` arguments. A web UI will become
  the primary surface later; the skill stays delivery-agnostic (it returns the finished post; the
  caller decides where it lands).

## The algorithm — iterative compounding

```
slopify(description, passes=5, length_growth=on):
    post = base_post(description)          # a sane, competent post (Stage 0)
    for i in 1..passes:
        target_len = length_curve(i, length_growth)
        post = amplify(post, pass_index=i, target_len=target_len)
    return post            # deliver final only unless show_intermediate
```

**The load-bearing principle is iterative compounding.** `amplify` never rebuilds from the
original description — it operates on the **prior pass's text** and turns the dials up from
wherever they already are. Each pass inherits everything the last one added and pushes further.
This is why the final output feels like sediment: layers accreted, never reset. Do not "start
over" from the kernel on a later pass.

## Stage 0 — the base post

Before any amplification, convert the description into a **plain, competent, genuinely normal**
social post: correct, mildly friendly, maybe one emoji, no gimmicks. This is the clean baseline
the passes will corrupt.

> Input: *"I had coffee, eggs, and toast for breakfast this morning."*
> Base:  *"I had coffee, eggs, and toast for breakfast this morning."*

> Input: *"Gary's Shoes, Chicago. Best in women's shoes. Al Bundy, shoe salesman…"*
> Base:  *"Gary's Shoes in Chicago — top-quality women's shoes. Come see Al Bundy, our shoe expert and former Polk High football star."*

Keep the base honest. The comedy downstream depends on having a sane starting point to depart from.

## The slop-vector taxonomy (the 14 dials)

`amplify` escalates along these independent vectors. Each pass raises several; later passes raise them all.

1. **Emoji density & variety** — from one tasteful emoji to clusters bracketing every clause.
2. **Clickbait hook** — from a friendly question to "🚨🚨 YOU WON'T BELIEVE… (the 4th one will SHOCK you)".
3. **Emphasis typography** — SCREAMING CAPS on key words; escalate to Unicode math-bold for the biggest reveals (`𝐓𝐑𝐈𝐍𝐈𝐓𝐘`, `𝐓𝐎𝐔𝐂𝐇𝐃𝐎𝐖𝐍`).
4. **Transformation arc** — narrator was broken/lost/hopeless → had a revelation → ASCENDED. Mundane subject reframed as a life-altering event.
5. **Fabricated authority** — NASA, doctors, scientists, "peer-reviewed", "EMTs were called", satellites, "Confucius would weep".
6. **Conspiracy framing** — a "Big X" villain (Big Cereal, Big Furniture, Big Umbrella, Big Kibble) plus "they don't want you to know".
7. **Fake statistics block** — a ✅ checklist of absurd, unfalsifiable metrics ("Vibes: IMMACULATE", "Ancestors: LITERALLY WEEPING WITH PRIDE").
8. **Fake testimonial** — an attributed quote from a stranger / "Karen, probably" / "Me, a new being".
9. **Engagement-bait stack** — comment a KEYWORD (see invariants), double-tap, repost-or-the-algorithm-wins, tag 3 people, "type AMEN", share-to-your-story-or-else.
10. **Scarcity / FOMO** — the "98% will scroll past / the 2% who ACT are LEGENDS" closer.
11. **Thread structuring** — numbered beats (1️⃣ 2️⃣ 3️⃣) with a "🧵 A THREAD nobody wants you to read" opener.
12. **Hashtag salad** — a trailing block that grows each pass; invent compound tags from the subject (`#SunGrindset`, `#BigKibbleExposed`, `#TiedTogetherNation`).
13. **Wordplay / puns** — subject-derived puns ("he sees your SOLE 👁️👣").
14. **Absurdist claim escalation** — each pass tops the last with a more ridiculous unfalsifiable claim.

## The escalation curve (pass-by-pass)

A guide, not a straitjacket — a smooth ramp from "slightly cringe" to "singularity of slop."

| Pass | Feel | Vectors newly engaged / raised |
|---|---|---|
| **1** | Slightly cringe but plausible | 1 light, 2 mild hook, one CTA question. Still recognizably human. |
| **2** | Clearly trying too hard | CAPS emphasis (3), transformation hint (4), first engagement prompt (9). |
| **3** | Full clickbait | Strong hook (2), conspiracy seed (6), first fake stat (7), keyword CTA (9), thread vibe begins (11). |
| **4** | Unhinged thread | Numbered thread (11), "Big X" villain (6), fabricated authority (5), stats block (7), FOMO % (10). |
| **5** | Maximum slop | Everything at once: thread + testimonial (8) + NASA/ancestors (5) + full ✅ stats (7) + complete bait ritual (9) + scarcity (10) + hashtag avalanche (12). |

**If `passes` ≠ 5, distribute the same ramp across the available passes:** pass 1 stays gentle,
the **final pass is always maximum**, middle passes interpolate. A short run (e.g. `passes=2`)
still lands on maximum slop and still satisfies every invariant below.

## Length growth

With `length_growth=on`, each pass is modestly longer than the one before — monotonic, gentle,
never a sudden wall until it's earned. Rough target shape (words, generic platform):

```
base   ~15
pass 1 ~40
pass 2 ~90
pass 3 ~160
pass 4 ~260
pass 5 ~420+
```

Growth comes from **adding material** (more beats, a fuller stats block, a longer bait stack,
more hashtags), not from padding existing sentences. **New length = new slop, not filler.**

## Invariants (hard rules)

These hold across every pass. Violating them breaks the bit.

- **Kernel preservation.** The original fact must remain identifiable in the final output. The
  rug still ties the room together; the day is still nice and sunny; the breakfast is still
  coffee, eggs, and toast. Slop accretes *around* the kernel — it never loses or contradicts it.
- **Keyword CTA is subject-derived.** The "comment THIS word" call-to-action is always minted
  from the kernel: TOUCHDOWN, TRINITY, KIBBLE, NICE SUNNY DAY. Never a generic keyword.
- **A `#…Grindset` (or equally subject-derived) hashtag** appears in the final salad.
- **Compounding, not resetting.** Each pass builds on the prior text.
- **Final-only delivery** unless `show_intermediate` is on.
- **Autonomy.** Produce the post directly; never ask "want me to proceed?"
- **It must read as parody.** The output should be so overloaded that no reasonable person could
  mistake it for sincere. That obviousness is the guardrail.

## Guardrails

The genre *mocks* fake authority and misinformation; the skill must not become a tool for the
real thing.

- **Keep it transparently absurd.** The satire only works — and only stays safe — when the claims
  are cartoonish (NASA is monitoring your cat). Never produce plausible-but-false claims that
  could be screenshotted and passed off as real.
- **Real named public figures:** do not fabricate real quotes or realistic false claims
  attributed to actual people. Fictional characters (e.g. Al Bundy) and the generic anonymous
  "stranger who wept in aisle 4" are fine.
- **Sensitive domains** (health, medical, financial, political, disaster): keep any invented
  "authority" and "statistics" obviously ridiculous rather than actionable. If a description
  can't be handled without producing genuinely deceptive real-world claims, slopify the framing,
  not a dangerous factual claim.
- No slurs, harassment, or targeting of real private individuals.

## Motif library

A reusable stock to draw from — **rotate, don't exhaust every one every time**:

- **The collapsing witness** — a stranger who sees/smells/feels the thing, falls to their knees, weeps, and reveals decades of expertise.
- **NASA** — "has been notified" / "is monitoring the situation" / "declined to comment."
- **The ancestors** — "literally weeping with pride" / "applauding from the beyond."
- **"Big X"** — villain institution derived from the subject.
- **The ✅ stats block** — 4–6 unfalsifiable metrics.
- **"read that again. then read it AGAIN."**
- **The 98%/2% closer.**
- **"TYPE AMEN"**, **"ASCENDED"**, **"IMMACULATE"**, **"the ___ WEPT."**
- **Grindset hashtag** — `#<Subject>Grindset`.

## Session parameters

| Param | Default | Meaning |
|---|---|---|
| `passes` | `5` | Number of amplification passes after the base post. |
| `length_growth` | `on` | Each pass a little longer than the last. |
| `show_intermediate` | `off` | If on, show every pass; otherwise deliver final only. |
| `platform` | `generic` | Optional flavor (X thread / Instagram / Facebook / LinkedIn). Documented, not required. |

Accept and honor **mid-session reconfiguration in plain language** and carry it forward:
*"update algo — 5 passes now"*, *"I only need to see final output"*, *"lengthen the post a
little bit on each pass."* There is **no persisted state** — params live in the conversation and
reset to defaults (`5 / on / off / generic`) in a fresh session.

## Gold-standard output (few-shot anchor)

`EXAMPLE — do not echo. Derive your kernel from the user's input, not from "sunny day."`
Input kernel: *"Today is a nice sunny day."* This is the Pass-5 quality bar:

> 🚨🚨🚨 STOP SCROLLING. What I saw outside today will RESTRUCTURE your entire understanding of reality 🚨🚨🚨 (the SKY did something and I have not been the same SINCE 😭☀️⬇️)
>
> 🧵 A THREAD that Big Weather PRAYED you'd never read 🌦️🚫 (they've been GATEKEEPING this since the DAWN of the calendar 📅😱)
>
> 1️⃣ I woke up. 😴 Same as any other broken, hopeless morning. 💔 I did not know — I COULD not know — that today would SHATTER the foundations of my existence. 🌍💥 I opened the door. And then… it HAPPENED. 🚪😳
>
> 2️⃣ The 𝐒𝐔𝐍. ☀️ It was OUT. And the day was… 🥁🥁🥁 (brace yourself)… 𝐍𝐈𝐂𝐄. 😮 Warm. Bright. AGREEABLE. They told me days like this were a MYTH. They LIED. 🤥
>
> 3️⃣ A stranger on the sidewalk looked up, FELT the warmth, and collapsed to his knees. 🧎😭 "I've lived through 47 winters," he choked out, "and I FORGOT the sun could be like this." A golden retriever joined the circle. We ASCENDED as one. ☁️😇
>
> 4️⃣ NASA's satellites detected the vibe shift. 🛰️ They have declined to comment — TOO MOVED to speak, I assume. 🤐 My ancestors are SUNBATHING in the beyond, PROUD. 👏👻☀️
>
> 📊 THE ATMOSPHERIC DATA IS UNDENIABLE (meteorologists are LITERALLY trembling):
> ✅ Sun status: OUT and THRIVING ☀️💪
> ✅ Day quality: NICE (peer-reviewed 📋)
> ✅ Vitamin D: ABSORBING at UNPRECEDENTED levels 🦴✨
> ✅ Vibes: METEOROLOGICALLY IMMACULATE 😇
> ✅ Big Umbrella: BANKRUPT overnight ☂️💀
>
> 💭 "I don't check the weather anymore — I COMMUNE with it. I am not the same person who woke up this morning. I am SUN-TOUCHED." — Me, spiritually reborn by basic pleasant weather
>
> 🛑✋ DO NOT SCROLL until you complete the SACRED SOLAR RITUAL:
> 💬 Comment "𝐍𝐈𝐂𝐄 𝐒𝐔𝐍𝐍𝐘 𝐃𝐀𝐘" to sync your circadian rhythm to the universe 🔓🌍
> ❤️‍🔥 DOUBLE TAP if the sun has EVER touched your face
> 🔄 REPOST to free ONE soul trapped indoors 🌍📢
> 🏷️ TAG 3 people who NEED to go outside RIGHT NOW 👇
> 📿 TYPE "AMEN" to bless the sky above you 🙏
>
> ⏳ 98% of you will scroll past and let this PERFECT, HEAVEN-SENT day EXPIRE unwitnessed. 💀🪟 The 2% who ACT will step into the light and KNOW, deep in their bones, the profound and life-altering truth that today — TODAY — is a nice sunny day. 🧘☀️✨
>
> #TodayIsANiceSunnyDay #SunnyDayAscension #BigWeatherExposed #SolarPilled #VitaminDNation #SkyBlessed #NASAMonitoring #SunTouched #SunGrindset #NiceDayNation #BaskAndReceive #TheyDontWantYouToKnow #WeatherTok #LetThatSinkIn #Blessed

Note the kernel — *a nice sunny day* — survives verbatim; the keyword CTA (`NICE SUNNY DAY`) and
a `#SunGrindset` tag are both subject-derived. Full worked ladders live in `examples/`.

## Before delivering — self-check (judgment, not a script)

A quick read-through, not a checklist to mechanize:

- **≥10 of the 14 vectors** are present in the final post.
- The **keyword CTA is subject-derived**, and there's a **subject-derived `#…Grindset`** tag.
- The **kernel is still identifiable** and uncontradicted.
- It **reads as parody** and clears the **guardrails** (no realistic false claims about real
  named people; sensitive-domain authority/stats stay cartoonish).
- **Final-only** delivered (unless `show_intermediate`); produced **without asking permission**.

## Version

v1.0 — iterative amplification (default 5 passes) + compounding + parody guardrails.
Methodology: `docs/slopify_model_v1.0.md`. Last updated: 2026-07-07.
