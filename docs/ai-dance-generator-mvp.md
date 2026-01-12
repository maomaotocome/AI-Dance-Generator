# AI Dance Generator — MVP Research & Build Spec

## Goal (MVP)
Launch an English website that reliably helps users generate “viral-ready” AI dance videos (MP4) that are easy to post to TikTok/Reels/Shorts, starting with the smallest feature set that can ship and iterate.

**MVP definition:** a user can (1) choose a dance template or prompt, (2) optionally upload a reference image, (3) generate a short video, (4) download it, (5) retry/iterate.

---

## What’s actually “hot” about the keyword
The virality pattern behind “AI dance generator” content is usually one of these:

1) **Template choreography + re-skin** (most consistent)
- A fixed dance/choreo clip is used as the “motion source” (template).
- Users change the character (e.g., “a panda”, “a cyborg girl”, “a plush toy”), the scene, or the style.
- This yields consistent rhythm/moves across videos → “same prompt looks same” effect.

2) **Text-to-video dance prompt** (fast, but less consistent)
- A single “viral prompt” produces similar motion/style.
- Output variance is higher (different choreography), but it’s frictionless.

3) **Photo/avatar + dance** (highest personalization)
- User uploads a photo; model animates/retargets a body + dance motion.
- This requires (a) good motion control, (b) identity preservation, and often (c) higher costs.

**Recommendation for MVP:** implement **(1)** as the primary flow (consistency sells), and keep **(2)** as a fallback for users without a template video URL.

---

## MVP user flow (English site)

### Flow A (recommended): “Template Dance”
1. User selects a **dance template** (3–10 options).
2. User picks a **character/style** (simple prompt builder).
3. (Optional) user uploads **reference image** for identity/style.
4. Click **Generate** → queue + progress.
5. Preview + **Download MP4**.

**Why this wins:** you control the choreography, duration, framing, and rhythm → outputs feel “the same trend”.

### Flow B (fallback): “Prompt Dance”
1. User chooses a “viral prompt” preset.
2. Edit prompt (optional).
3. Generate + download.

---

## Core features (MVP scope)
Only ship what directly increases successful generations and shareability.

### 1) Generation UI (one page)
- Mode switch: `Template Dance` (video-to-video) / `Prompt Dance` (text-to-video).
- Prompt builder (minimal):
  - Character (text)
  - Style (dropdown: “3D Pixar-ish”, “Anime”, “Claymation”, “Cyberpunk”, “Plush toy”, “Sticker/2D”)
  - Scene (dropdown: “Studio”, “Street”, “Stage”)
- Output:
  - Preview video player
  - Download button
  - Retry button

### 2) Reliability basics
- Progress polling + timeout messaging.
- Clear error states (“template URL invalid”, “provider overloaded”, “insufficient credits”).

### 3) Monetization (keep it simple)
- Credit-based (already supported by the template).
- Offer a **small free trial** later; for MVP you can start paid-only if you already have traffic intent.

### 4) SEO landing essentials
- Page title/meta: “AI Dance Generator — Create Viral Dance Videos”.
- “How it works” section + FAQ (indexable content).
- Showcase 6–12 example outputs (later).

---

## Non-goals (defer)
- Full TikTok publishing integration.
- User project library with folders, tags, remix chains.
- On-site video editor (trim/captions).
- Music licensing and soundtracks (big compliance risk).

---

## Provider strategy (MVP)
You don’t want to train models in MVP. Use providers and swap later.

### Recommended default for “Template Dance”
Use a **video-to-video edit** model that accepts:
- `video_url` (template choreography)
- optional `input_images` / reference images
- `prompt` (re-skin instructions)

In this repo, the `fal` provider already supports `fal-ai/kling-video/o1/video-to-video/edit` as a video-to-video model option.

### Fallback for “Prompt Dance”
Use `text-to-video` models (lower consistency but no template required).

---

## Prompt design (practical)

### Prompt template (video-to-video re-skin)
Keep it short and strongly constrained:
- “Keep the same choreography and timing as the input video.”
- “Keep camera framing, duration, and motion.”
- “Only change character + outfit + background style.”

Example:
> Keep the same choreography, timing, and camera framing as the input video. Transform the dancer into: {CHARACTER}. Style: {STYLE}. Scene: {SCENE}. High quality, smooth motion, no glitches, consistent body.

### Prompt template (text-to-video)
Add choreography + camera constraints:
> A full-body dancer performs a viral TikTok dance loop, upbeat energy, stable camera, centered framing, smooth motion, {STYLE} style, {SCENE}, 9:16 vertical, high quality.

---

## Trust, safety, and policy (MVP must-haves)
- Clear disclaimer: user must own/upload rights to reference media; no copyrighted music included.
- Block explicit/illegal content in prompts (basic moderation can be added later).
- Watermarking is optional but recommended to prevent “free-riding” and drive referrals.

---

## Metrics to track (MVP)
- Landing → generate click-through rate (CTR)
- Generation success rate (SUCCESS / tasks)
- Time-to-first-video
- Retry rate per user (signals “fun” and “share intent”)
- Paid conversion: visit → sign up → first purchase

---

## What’s already in this repo (use it)
- Next.js landing + i18n + SEO metadata helpers
- `/api/ai/generate` + `/api/ai/query` (task-based generation)
- Providers: `fal`, `replicate`, `kie`
- Credits + payment plumbing + activity logs

---

## Minimal launch checklist
1. Pick one provider (start with `fal`) and configure API key in admin settings.
2. Add 3–10 dance template URLs (hosted by you: R2/S3 recommended).
3. Put 6 example outputs on the landing page.
4. Launch on a clean domain and submit sitemap + Search Console.
5. Post 10–30 TikTok videos with your own tool → funnel traffic back.

