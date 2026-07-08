# Slopify 🚨

### *STOP DOING IT YOURSELF!* — the machine that turns a shrug into a SPECTACLE

**Slopify takes something totally mundane and inflates it into the most unhinged, over-the-top
"AI slop" clickbait post imaginable.** "Today is a nice sunny day" goes in; a 400-word thread with
NASA, a weeping stranger, a ✅ stats block, and fifteen hashtags comes out. The kernel is always
still in there — it just… **ASCENDED.** ☀️📈

> **🚨 THE HONEST PART (this bit is load-bearing):** It's a joke. The whole point is that the
> output is *transparently* fake — nobody could mistake it for real. That obvious absurdity is also
> exactly what keeps it safe.

*Want the full 2am-infomercial sales pitch, complete with SlopStream™ and a knob that goes to 11?*
**→ [READ THE BROCHURE](docs/AS-SEEN-ON-TV.md) ←**

---

## 📞 Try it — OPERATORS ARE STANDING BY

In Claude Code, from this folder:

```
/slopify today is a nice sunny day
```

or just ask: *"slopify 'Gary's Shoes, Chicago. Best in women's shoes.'"*

You'll get **one** finished post. Want to watch it build from a normal sentence up to maximum
slop? Say **"show the ladder."** Want it shorter or calmer? **"3 passes,"** **"final only,"**
**"longer each pass"** — it adjusts on the fly.

## 🖥️ BUT WAIT — THERE'S A WEB UI!

A first-slice web UI now lives in [`web/`](web/) — a local page that slopifies through your
**Claude subscription** (no API key needed), now wearing its own gloriously over-the-top
infomercial skin (yes, the knob goes to 11, and yes, confetti):

```
cd web && npm install && npm start
```

then open `localhost:3000`. It still lives in Claude Code too, delivering in chat. A polished web
UI remains the planned primary way in.

## 🎁 It's also two other things (STILL FREE!)

Underneath the bit, this little project does double duty:

- **A reference example for building Claude Code skills.** It's completely prompt-only — no code,
  no dependencies — so it's an easy-to-read template for the *doc → skill → command → settings*
  pattern. Start with [`docs/for-developers.md`](docs/for-developers.md).
- **A way to watch model collapse.** Feed slopify's own output back in as the next input, over and
  over, and it stops getting louder and starts getting *emptier* — the shape survives while the
  details rot into placeholders. [`docs/studying-model-collapse.md`](docs/studying-model-collapse.md)
  walks through the experiment.

## ⚙️ How it works, in one breath

A plain **base post** → **5 amplification passes**, each one escalating the *previous* pass's text
(never restarting from scratch) along a taxonomy of engagement-bait tells, until it hits maximum
slop. Only the last pass is delivered. Full methodology:
[`docs/slopify_model_v1.0.md`](docs/slopify_model_v1.0.md).

## 🛡️ Guardrails

Comedy only. It stays cartoonish on purpose: no realistic false claims about real named people,
and in sensitive areas (health, money, politics, disasters) any fake "authority" or "statistics"
stay obviously ridiculous, never actionable. **If you can screenshot it and pass it off as real, it
wasn't slopified right.**
