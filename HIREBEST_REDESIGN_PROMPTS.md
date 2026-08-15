# HireBest — Full-Site Redesign Image Prompt Pack (Apple Design Language)

**Product:** HireBest — AI CV screening for recruiters. "Screen 100 CVs in 38 seconds — with AI reasoning you can actually trust."
**Style lock:** Apple design language on the web — translucent materials, spring-implied motion, optical typography, spatial consistency. Reference bar: iOS 18, macOS Sequoia, Apple.com product pages.
**Canvas:** All images horizontal. Hero = 21:9; standard sections = 16:9; long tables = 16:10. One image per section, always.

---

## 🔒 GLOBAL BRAND WORLD — paste this before every per-section prompt

```
BRAND WORLD — HireBest (Apple design language, web)
Category: AI CV screening SaaS for recruiters and hiring teams.
Feel: fluid, precise, materials-first. Interfaces that read as physical objects,
not painted panels. Motion (implied in the still): spring-settled, never elastic
unless preceded by a flick.

Surface & materials:
- Base surface: near-white #FBFBFD (light) or graphite #1C1C1E (dark). Pick one
  per section, mostly light across the site. Never pure #FFFFFF or #000000.
- Floating chrome (nav, tab bars, sheets, popovers): translucent glass —
  backdrop-blur 24–40px, 60–70% white or 55% graphite fill, 1px top edge in
  rgba(255,255,255,0.6) reading as light catching the material.
- Depth stack: bigger surface = stronger blur + deeper shadow. Small chips barely lift.
- Scroll-edge fade under floating chrome (not a hairline divider) — a soft
  gradient mask where content passes beneath the glass.
- Materialize on enter/exit: blur radius and scale animate together, not opacity alone
  (imply this in the still with subtle scale mid-state on cards and sheets).

Palette (system-native discipline):
- Ink: #0B0B0F (labels, headings)
- Secondary label: #3C3C43 at 60%
- Tertiary label: #3C3C43 at 30%
- Separator: 1px #3C3C43 at 12%
- Fill (grouped background under content): #F2F2F7
- Accent: HireBest Blue #0A84FF (systemBlue calibrated). Single accent. Never gradient.
- Success dot / positive metric: systemGreen #30D158, used sparingly.
- Destructive / gap-warning: systemRed #FF453A, used sparingly.
Dark-mode variant of any section swaps to graphite base + high-contrast labels;
accent stays #0A84FF.

Typography:
- Family: SF Pro Display / SF Pro Text feel. Optical sizing implied.
- Large headings: SF Pro Display, semibold, tight tracking around -0.022em, leading 1.05.
- Body: SF Pro Text, regular, leading 1.45, tracking near 0.
- Small text: slight positive tracking (+0.01em), slightly heavier weight for legibility.
- Numeric metrics: SF Pro tabular numbers (fixed-width), aligned columns.
- No serif accents. No gradient text. No all-caps hero.

Motion language (in a still, imply through composition):
- Spring-settled position — content sitting exactly where it should rest, no diagonal drift.
- Direct-manipulation hint — where a card would be dragged, show a subtle finger-shaped
  scale/tilt (grabbed elements 1.03 scale, tiny 1° tilt) with sibling elements calmly parted.
- Momentum projection — a flicked-away card shows a small trailing motion blur streak,
  never a hard streak — the streak length maps to velocity.
- Interruptibility — never show elements mid-slide from a hard-coded path. If a sheet
  is opening, it opens from a plausible anchor (the button that triggered it).

Spatial consistency:
- Sheets rise from the bottom edge; popovers scale from their trigger (transform-origin
  at the trigger, not center). Menus tag the trigger they came from with a small chevron.
- Enter and exit share the same path — if it slid in from the right, it dismisses right.

Feedback:
- Buttons press to 0.97 scale on tap.
- Toggles show mid-flip state.
- Sliders show a filled track and a lifted thumb with a soft shadow.
- Success moments: a single quiet checkmark that scales in and settles (no confetti).

Materials & depth in imagery:
- Product screens rendered as if the chrome floats over content — nav bars translucent,
  content visibly bleeding underneath.
- Real photography, when used, is bright, modern, high-contrast, editorial — no
  stock "diverse team pointing at laptop" cliché. Prefer product photography of the
  device itself (MacBook, iPhone-scale mock) showing the HireBest UI.
- iPhone / MacBook mockup framing allowed and encouraged; keep the device bezel accurate
  and understated — do not stylize.

Anti-slop bans:
- No purple/blue AI gradients. No glowing orbs. No floating blobs.
- No skeuomorphic bevels. No 2010-era glass buttons (highlight + gloss).
- No hard 1px dividers under sticky headers — use scroll-edge fade instead.
- No fake KPI trios (99% / ∞ / 24-7).
- No text-left / image-right hero as default.
- No cloned card rows repeating section after section.
- No cursive serif "premium" flourish.
- Reduced-motion mode must be implied elsewhere on the site — one section
  variant shows the reduced-motion state (calm cross-fade, no springs) if needed.
```

---

# PAGE 1 — HOME (8 sections)

## Section 1 of 8 — Hero  `21:9`

Composition anchor: **stacked center, low, over a device-forward product shot**.
Hero scale: **Giant Statement**.

```
21:9. Base surface near-white #FBFBFD. Center of frame: a modern 14-inch
MacBook rendered in a clean ¾-front photograph, floating on the surface
with a soft grounded shadow (no lifted-from-plate feel). The MacBook
screen shows the HireBest app — a translucent top toolbar with the
"HireBest" wordmark, a candidate list scrolling under it (blurred faintly
where it passes below the glass), one row highlighted with the accent
color, a "92" match score in tabular numerals on the right of the row.

Above the device, upper 30% of the frame, centered, huge:
- Small accent-blue chip label with a tiny dot: "New — batch v2"
- H1, SF Pro Display semibold, tracking -0.022em, leading 1.05, two lines:
    "Screen 100 CVs.
     Trust every score."
- Sub, SF Pro Text, secondary label color, one line:
    "AI reasoning cited to your JD. Answers in 38 seconds."
- Two CTAs inline, centered under sub:
    • Primary: solid #0A84FF pill, white label "Try free for 14 days", 44px, no shadow.
    • Secondary: ghost inline label with a small chevron "Watch a 60-sec demo ›"

Top translucent nav bar spans the full width — real glass: blur 32px,
white fill at 65%, 1px bright top edge. Nav items sit in it: HireBest ·
Product · Pricing · Customers · Blog · Login · (accent-blue pill) "Start free".
Scroll-edge soft fade underneath the nav where content meets it.

No purple glow, no orbits, no skeuomorphic bevels.
```

---

## Section 2 of 8 — Trust bar  `16:10, short`

Composition anchor: **centered, quiet**.
Background: **base surface with a translucent frosted band**.

```
Short 16:10 band. Base surface #FBFBFD. A single centered translucent
capsule at 55% white, blur 24px, sitting mid-band, ~70% width, ~72px tall,
soft grounded shadow. Inside the capsule, a horizontal row: small
secondary-label caption on the left "Recruiting teams shipping with HireBest"
then a single row of 7 flat monotone company wordmarks, evenly spaced,
with faint 1px separators. Far right inside the capsule: small accent-blue
"+ 400 more ›" text.

Nothing else on the band. No marquee, no logos in circles.
```

---

## Section 3 of 8 — Feature grid (bento, materials)  `16:9`

Composition anchor: **pristine gapless bento**.
Background: **fill #F2F2F7 with white cards + one translucent panel**.

```
16:9 on grouped fill #F2F2F7. Four bento tiles in a mathematically clean
2×2 grid, gapless with a 1px separator system. Each tile is a white card,
16px inner padding, no shadow, subtle 12px rounded corners:

- Tile A (top-left, 8 cols): "Cited scoring" — a UI crop showing a
  candidate row with a "92" tabular numeral score on the right, two short
  reasoning bullets under it, each ending in a small filled accent-blue
  "JD ¶3" chip.
- Tile B (top-right, 4 cols): "Bulk intake" — a small still-life crop of
  a stack of PDF/DOCX file icons being drawn into a single line, rendered
  in Apple's flat-material icon language (no 3D pop).
- Tile C (bottom-left, 4 cols): "38-second batches" — a huge tabular-num
  "38s" in SF Pro Display, leading tight, single accent-blue underline.
- Tile D (bottom-right, 8 cols): "Compare & shortlist" — a translucent
  side-panel materializing over the tile (backdrop-blur visible, 1px light
  top edge), showing two candidates side-by-side, matched strengths in ink,
  gaps in systemRed. The panel casts a soft grounded shadow onto the tile
  below.

Section title top-left, above the grid, small secondary label: "How it works".
Ample interior padding. Single accent color per tile, max.
```

---

## Section 4 of 8 — Product showcase (device story)  `21:9`

Composition anchor: **image-as-canvas, dark surface**.
Background: **dark #1C1C1E full-bleed, MacBook centered, translucent side sheet emerging**.

```
21:9 full-bleed graphite #1C1C1E. Dark-mode variant.

Centered MacBook (¾-front) with the HireBest dashboard on screen, dark
mode. Emerging from the RIGHT edge of the MacBook: a translucent side
sheet rendered in the frame outside the laptop bezel — reading as a
platform-native detail sheet that has slid in from the right, blur 40px,
55% graphite fill, 1px top edge, deep grounded shadow. Inside the sheet:
a full candidate detail — name in SF Pro Display semibold, 92 score with
a small radial dial in accent-blue, 4 cited reasoning bullets. A small
close-glyph top-right of the sheet.

Left of the device, safe area, centered vertically:
- Small caption "The screening flow", tracking +0.01em, secondary label.
- H2 in white SF Pro Display, tight tracking, two lines:
    "Paste. Drop. Read."
- Sub in tertiary white: "No prompt engineering. No CSV wrangling."
- Ghost link with chevron: "See the full flow ›"

At the bottom of the frame, faint accent-blue three-dot indicator (like
a Page control), middle dot filled — hinting that this is one of three
product screens the user can flick between. Subtle horizontal blur streak
trailing from the middle dot to imply a spring-settled swipe.
```

---

## Section 5 of 8 — Use cases (three lanes, glass cards)  `16:9`

Composition anchor: **three equal columns**.
Background: **light base with three floating glass cards over a soft photo band**.

```
16:9. Upper 45% of the frame: a single wide, low-contrast editorial photo
band — a warm daylight shot of a modern office desk with a laptop, notebook,
plant. Muted, high-key, gently blurred.

Over that photo band, in the LOWER 60%, three translucent glass cards
floating on the base surface #FBFBFD. Each card: blur 28px, 65% white
fill, 12px corners, soft grounded shadow, 1px light top edge. Cards
overlap the photo band by ~40% vertically — the photo blurs visibly
through them (this is the point of the design).

Each card, top to bottom inside:
- Small accent-blue label chip.
- H3 in SF Pro Display semibold, two-line max.
- Body in secondary label, two-line max.
- Small inline link "See use case ›".

Cards L→R:
- "Solo & consultants — Turnaround in an afternoon."
- "Startups — One shortlist your team agrees on."
- "Agencies — 500 CVs a role, fully traceable."

Small caption top-left of section: "Built for how you actually hire."
```

---

## Section 6 of 8 — Testimonial (quiet quote wall)  `16:9`

Composition anchor: **stacked center, ultra minimal**.
Background: **base surface, single translucent quote card**.

```
16:9 base surface #FBFBFD. Centered vertically and horizontally, a single
translucent quote card (blur 32px, 60% white, 12px corners, grounded
shadow). Inside the card, padding generous:
- Small accent-blue mark (dot) at top-left of quote.
- Quote in SF Pro Display semibold, leading 1.15, tight tracking, three lines:
    "We stopped screening on Fridays.
     Now Fridays are for calls with
     the actual shortlist."
- Attribution row below: small circular avatar (real photo), "Priya M."
  in ink, "Head of Talent, Klarity Labs" in secondary label.

Below the card, a Page-control style row of three dots — middle dot
accent-blue, others tertiary — hinting at a next quote. A faint
projection blur to the right of the middle dot implies a spring-settled
snap.

No card stack, no five parallel quotes shouted at once.
```

---

## Section 7 of 8 — Pricing preview (three glass plans)  `16:9`

Composition anchor: **top-left lead + three cards bottom-right**.
Background: **base + one graphite recommended card breaks the rhythm**.

```
16:9 base surface #FBFBFD.

Upper-left third:
- Small secondary label "Pricing"
- H2 SF Pro Display semibold, tight tracking, two lines:
    "Three plans.
     No per-seat surprises."
- Sub, secondary label: "Every plan includes cited reasoning and export."

Lower-right two-thirds: three cards in a row, equal width, gapless:
- Card 1: Starter $49/mo — white with a translucent inner header band.
- Card 2: Growth $99/mo — DARK graphite #1C1C1E card, white type inside,
  accent-blue "Start free" pill. A small accent-blue "Recommended" chip
  pinned to the top-right, sitting proud of the card edge with a soft
  shadow (implies elevation).
- Card 3: Team $199/mo — white, ghost "Talk to sales" CTA.

Each card: plan name, price with /mo in SF Pro tabular, one-line audience,
4 bullets with checkmark glyphs (Apple-style), CTA at the bottom.

Under the row, a small inline link with chevron: "Compare all features ›".
```

---

## Section 8 of 8 — Final CTA + footer  `16:9`

Composition anchor: **mini minimalist, centered low, on a dark material**.
Background: **full-bleed graphite #1C1C1E, translucent inner CTA capsule**.

```
Full-bleed 16:9 graphite. Centered vertically, a large translucent
capsule (blur 40px, 55% graphite fill, 1px bright top edge, deep
grounded shadow, 20px corners). Inside the capsule, centered:
- H1 in white SF Pro Display semibold, tight tracking, one line:
    "Give your Fridays back."
- Sub in tertiary white: "14-day free trial. No card. Cancel from settings."
- Primary accent-blue pill: "Start screening — free"
- Row of tiny trust chips underneath, separated by • :
    "SOC 2 in progress" • "EU data residency" • "Human review always"

Below the capsule, a very fine footer strip in tertiary white, tracked
+0.01em, small:
HireBest · Product · Pricing · Customers · Blog · About · Contact · Login · © 2026
```

---

# PAGE 2 — PRICING (5 sections)

## Section 1 of 5 — Pricing hero  `16:9`

```
Base surface #FBFBFD, mostly negative space. Centered upper 60%:
- Small caption "Pricing" tracked +0.01em, secondary label.
- H1 SF Pro Display semibold, tight tracking, two lines:
    "Priced per role,
     not per seat."
- Sub, secondary label, one line.

Below the H1, a translucent capsule with a two-option segmented control
inside it (Apple-style Segmented Control): "Monthly" | "Annual (−20%)",
Annual selected with the pill inner slide highlighted accent-blue.
The capsule is glass — blur 20px, 55% white fill, 1px light top edge.

Bottom-of-frame whisper: three tabular numerals "49  99  199" in tertiary
label, spaced wide — a soft preview of the plans that follow.
```

## Section 2 of 5 — Plan comparison  `16:9`

```
Three plan cards spanning full width on grouped fill #F2F2F7. Same
structure as the home preview but expanded:
- Starter $49 (white) · Growth $99 (dark graphite, accent-blue CTA,
  "Recommended" chip) · Team $199 (white).
- Each card lists 7 features max, each with an Apple checkmark glyph
  (single-weight, no fill circle).
- Under all three cards, one line inline with a small accent-blue chevron
  link: "Need >10 seats or SSO? Talk to sales ›"

Cards use 12px corners, 1px separator system between cards (not gaps).
Grounded soft shadows only. No colored highlight bars.
```

## Section 3 of 5 — Feature matrix  `16:10`

```
Full feature matrix on base surface #FBFBFD.
- 18 feature rows grouped under 4 quiet section headers ("Screening",
  "Collaboration", "Data & security", "Support"). Each header row is a
  fill #F2F2F7 band with the group name in secondary label, tracked +0.01em.
- Three plan columns with SF Pro tabular numbers in the price headers,
  fixed to the top of the table with a translucent sticky bar (glass, blur
  24px, 65% white, scroll-edge fade beneath).
- Cells: Apple checkmark glyph for included, an em-dash "—" for not.
- Row separators: 1px #3C3C43 at 12%.
- No zebra stripes needed — the group headers do the rhythm.
```

## Section 4 of 5 — Proof block  `16:9`

Composition anchor: **right-third caption + left-two-thirds device photo**.

```
LEFT two-thirds: a MacBook Pro (¾-front) on the base surface, screen
showing a HireBest analytics view — one line chart in accent-blue,
tabular metrics above. Real product photography feel, grounded shadow.

RIGHT one-third: pull quote centered vertically.
- Quote in SF Pro Display semibold, tight tracking, three lines:
    "Our per-role screening
     time dropped from 6 hours
     to 40 minutes."
- Attribution: circular avatar, "Marcus O.", secondary label "Recruiting
  Lead, Brightfold".
- Below attribution, SF Pro tabular metric: "6h → 40m" in accent-blue
  with a small "average screening time" caption in tertiary.
```

## Section 5 of 5 — Pricing FAQ + CTA  `16:9`

```
Upper 55%: two-column FAQ — each row a translucent rounded pill (blur
16px, 55% white, 10px corners), showing question in ink, chevron on right.
Only the first row in each column is expanded, showing 2 lines of answer
in secondary label. The expanded row's chevron rotates 90° (spring-settled).

Lower 40%: a large translucent CTA capsule (blur 32px, 60% white fill)
spanning the middle 70% of the width. Inside it, one line SF Pro Display
semibold: "Still deciding? Try Growth free for 14 days." with an
accent-blue pill "Start free" pinned to its right.
```

---

# PAGE 3 — ABOUT (5 sections)

## Section 1 of 5 — About hero  `21:9`

```
21:9 base surface #FBFBFD. Ultra generous negative space. Centered upper 60%:
- Small caption "About HireBest", tracked +0.01em, secondary label.
- Giant H1 in SF Pro Display semibold, tight tracking -0.022em, leading
  1.02, two lines:
    "We built the tool
     we wished we had."

Bottom of frame: one line in secondary label:
    "Founded 2024 · Berlin & remote · 11 people, hiring."
```

## Section 2 of 5 — Origin story  `16:9`

Composition anchor: **right-text / left-photo (inverted classic)**.

```
LEFT two-thirds: a bright, modern editorial photograph — top-down of a
paper resume stack with a red pencil, warm daylight, high-contrast crisp.

RIGHT one-third: base surface, three short paragraphs of 2–3 lines in
body copy. Title above in SF Pro Display semibold: "One Friday, 200 CVs."
Small accent-blue inline "Meet the team ›" at the end.
```

## Section 3 of 5 — Team grid  `16:9`

```
Base surface. 11 team-member portraits arranged in a disciplined 6-column
grid, evenly spaced, with a subtle Y-offset every other card (a controlled
staggered rhythm — not scattered). Each portrait:
- Real natural-light photo, half-length, muted warm background.
- 12px rounded corners.
- Under: name in SF Pro Text semibold, role in secondary label, tracked
  +0.01em.

One card is intentionally an empty translucent glass tile (blur 20px,
55% white fill) with a small accent-blue "We're hiring — see roles ›" label.
```

## Section 4 of 5 — Values (three glass tiles)  `16:9`

```
Base surface. Three equal translucent tiles (blur 24px, 60% white,
grounded shadow, 12px corners), sitting on a very soft photo band across
the mid-frame (a warm daylight desk detail behind — the tiles blur it
naturally). Each tile:
- A single small accent-blue numeral top-left: "01" / "02" / "03".
- H3 in SF Pro Display semibold: "Cited or nothing" · "Recruiter first" ·
  "Fewer, better tools".
- Two-line body in secondary label.

Type does the work. No icons, no illustrations.
```

## Section 5 of 5 — Careers + closing CTA  `16:9`

Composition anchor: **bottom-left over a device photo**.

```
Full-bleed 16:9. Bright editorial photograph — the team mid-standup, warm
daylight, modern office, one whiteboard visible with faint marker scribble.

Bottom-left overlay, translucent glass capsule (blur 32px, 55% white,
1px top edge):
- Small caption "Careers", tracked +0.01em.
- H2 SF Pro Display semibold: "Come screen with us."
- Sub secondary label: "Remote-first. Async-heavy. We ship every week."
- Two CTAs inline: accent-blue pill "See 4 open roles" + inline "How we work ›"
```

---

# PAGE 4 — CONTACT (3 sections)

## Section 1 of 3 — Hero + segmented intent  `16:9`

```
Base surface, mostly space. Centered:
- H1 SF Pro Display semibold: "How can we help?"
- Sub secondary label: "Pick a lane. We respond within one business day."

Below, a translucent Segmented Control capsule (blur 20px, 55% white,
44px tall, grounded shadow) with three options: "Sales" | "Support" |
"Press", the "Sales" segment selected with an inner pill highlighted
accent-blue.
```

## Section 2 of 3 — Form + info  `16:9`

```
Base surface #FBFBFD.

LEFT 55%: a form on the base surface, no card — inputs use the Apple-style
grouped list pattern: a rounded rectangle fill #F2F2F7 with 1px hairline
separators between fields. Fields: Name, Work email, Company, Team size
(select with a small chevron), Message (multi-line). At the bottom of the
group, an inline accent-blue "Send message" pill spans the group width.

Above the form, small ink line: "You're contacting: Sales."

RIGHT 45%: three quiet info blocks in the same grouped-list style —
each row: small icon (Apple flat SF Symbols-style), label, value.
- Email · hello@hirebest.io
- Chat · in-app, 09–18 CET
- Post · Torstraße 100, 10119 Berlin
```

## Section 3 of 3 — Support cards + status  `16:9`

```
Base surface. Three translucent glass tiles, equal width, gapless with
1px separators between them:
- "Help center — 120+ articles" + chevron
- "API docs — Team plan" + chevron
- "Security — SOC 2, DPA, subprocessors" + chevron

Under the tiles, a slim translucent status band (blur 16px, 55% white,
40px tall): one systemGreen dot + "All systems operational" + right-aligned
accent-blue "· see status.hirebest.io ›"
```

---

# PAGE 5 — INTERVIEW QUESTIONS (free tool, 4 sections)

## Section 1 of 4 — Tool hero  `21:9`

Composition anchor: **centered low, over a warm still-life**.

```
Full-bleed 21:9. Background: bright modern still-life — open notebook,
fountain pen, filled coffee cup, natural window light. High-contrast,
crisp, editorial.

Bottom-center overlay, translucent capsule (blur 40px, 55% white, 12px
corners, deep grounded shadow):
- Small accent-blue chip "Free tool".
- H1 in SF Pro Display semibold, tight tracking, two lines:
    "500 interview questions,
     sorted by role and stage."
- Sub secondary label: "Filter by role, seniority, round. Copy or export in one click."
- Two CTAs inline: accent-blue pill "Browse questions" + inline "Download the pack (PDF) ›"
```

## Section 2 of 4 — Category grid  `16:9`

```
Base surface #FBFBFD. 4×3 gapless bento grid of translucent tiles (blur
20px, 60% white). Each tile shows a role and count:
Engineering · Product · Design · Data · Sales · Marketing · Ops · Finance
· Support · People · Legal · Executive.

Each tile: role name in SF Pro Display semibold, tabular count in
secondary label ("48 questions", "36 questions"…).

One tile — Engineering — is expanded to 2× width and shows three sample
question rows previewed inside, hinting at drill-down. A small chevron
in the top-right of that tile.
```

## Section 3 of 4 — Sample Q&A block  `16:10`

```
Base surface. Two-column layout:
- LEFT: a big question in SF Pro Display semibold, tight tracking, three
  lines:
    "Walk me through a time
     you shipped something
     you disagreed with."
  Below, small tag row: "SENIOR PRODUCT · BEHAVIORAL · ROUND 2" in
  secondary label, tracked +0.02em.
- RIGHT: "What to listen for" — a grouped list card (fill #F2F2F7,
  hairline separators) with three bullet rows. Below the group, two
  small controls: a ghost "Copy question" pill + inline "See 4 follow-ups ›".
```

## Section 4 of 4 — CTA back to product  `16:9`

```
Base surface. Centered mini section:
- H2 SF Pro Display semibold, one line: "Questions are the easy part. The shortlist takes HireBest."
- Accent-blue pill "Try HireBest free" + inline "How the scoring works ›"
```

---

# PAGE 6 — BLOG LIST (4 sections)

## Section 1 of 4 — Blog hero (featured post)  `21:9`

```
Full-bleed 21:9 editorial photograph — bright, modern, warm daylight
top-down of a printed JD on a desk with a red-pencil-annotated resume
beside it.

Top-left overlay, translucent capsule (blur 32px, 60% white):
- Small chip "Featured · 8 min read", secondary label.
- H1 in SF Pro Display semibold, two lines:
    "The 6-hour screening ritual
     is finally on borrowed time."
- Byline row: circular avatar, "Emma Rowe", "2026-07-14" in tertiary.
- Inline "Read essay ›" in accent-blue.
```

## Section 2 of 4 — Category filter strip  `16:10, short`

```
Base surface short band. A single Segmented Control-style row of category
pills (rounded, hairline outline, tap-selected accent-blue fill for "All"):
"All" · "Screening" · "Recruiting ops" · "Product updates" · "Field notes"
· "Guides".

Right side: a translucent search field (blur 16px, 55% white, rounded,
inset magnifier glyph) with a "Type to search" placeholder.
```

## Section 3 of 4 — Post grid  `16:9`

```
Base surface. 3×2 grid of translucent post cards (blur 20px, 60% white,
12px corners, 1px light top edge, grounded shadow). Each card:
- Top: photo crop, warmly graded (each different but from one family).
- Small accent-blue category label chip.
- Post title SF Pro Display semibold, 2 lines max.
- Meta row: circular avatar, author name, read time in tertiary label.
```

## Section 4 of 4 — Newsletter CTA  `16:9`

Composition anchor: **stacked center on a dim scrim over a soft photo**.

```
Full-bleed 16:9. A softly-blurred photograph background of a warm-lit
desk. Over it, a translucent dim scrim (rgba(28,28,30,0.45)) to push the
photo back.

Centered on the scrim, a translucent glass capsule (blur 40px, 55%
graphite fill, dark-mode variant):
- Small caption "Field notes — monthly" in tertiary white.
- H2 in white SF Pro Display semibold: "Recruiting essays, once a month."
- Inline email field (grouped list style) + accent-blue pill "Subscribe"
  to its right.
- Below: tiny tertiary caption "1,800+ recruiting leaders read this."
```

---

# PAGE 7 — VS GREENHOUSE (4 sections)

## Section 1 of 4 — Vs hero  `16:9`

Composition anchor: **top-left lead + right-side split poster**.

```
Base surface #FBFBFD.

LEFT 45%:
- Small caption "Comparison" secondary label.
- H1 SF Pro Display semibold, two lines:
    "HireBest vs. Greenhouse
     for CV screening."
- Sub secondary label: "Greenhouse is an ATS. HireBest is an opinionated screener that plays nicely with it."
- CTAs: accent-blue pill "Try HireBest free" + inline "Read full comparison ↓"

RIGHT 55%: a poster block, two panels stacked with a 1px separator
between them (not diagonal, cleaner Apple style):
- Upper panel: white, small "HireBest" label + huge SF Pro tabular "38s"
  numeral + tiny "avg per-role screening time" caption.
- Lower panel: grouped fill #F2F2F7, small "Greenhouse" label + huge "6h"
  numeral + tiny caption.
Both numbers accent-blue.
```

## Section 2 of 4 — Side-by-side comparison table  `16:10`

```
Base surface. Two-column comparison table on a grouped list card
(fill #F2F2F7 background, hairline separators between rows):
- 12 feature rows: JD-cited scoring, mixed-format batch upload, 38-second
  batch, shortlist collaboration, per-role pricing, pipeline management,
  offer letters, onboarding, API, ATS integration, price at 5 seats.
- LEFT column "HireBest": Apple checkmark (accent-blue) for included,
  tabular numeral for price ($99/mo).
- RIGHT column "Greenhouse": ink checkmark for included, em-dash for
  not-in-scope, larger tabular price.
- Header row uses a translucent sticky bar (blur 20px, 65% white).

Callout below the table, secondary label:
"HireBest sits in front of Greenhouse — not against it. Export shortlists in one click."
```

## Section 3 of 4 — Where HireBest wins  `16:9`

```
Base surface. Three equal columns, each a translucent glass tile floating
over a shared soft background photo band (blur is visible through the tiles):
- "Cited reasoning — every score points to a JD line."
- "38-second batches — screen 100 CVs before your coffee cools."
- "Per-role pricing — bring the whole hiring team."
```

## Section 4 of 4 — CTA  `16:9`

```
A wide translucent capsule centered on base surface (blur 32px, 55% white):
- One-line H2: "Keep Greenhouse. Add HireBest for the shortlist."
- Accent-blue pill "Start free" + inline "Read the migration guide ›"
```

---

# PAGE 8 — VS LEVER (4 sections)

*(Reuse the four Vs Greenhouse prompts with these substitutions):*

- Product name **Greenhouse → Lever** everywhere.
- Poster caption: "Lever avg. per-role screening time — self-reported, n=14".
- Feature matrix: Lever-strength row is "Nurture campaigns" (ink checkmark on Lever, em-dash on HireBest — honest).
- CTA link: "Read the Lever + HireBest guide ›".

## Section 1 of 4 — Vs hero (Lever)  `16:9`
## Section 2 of 4 — Side-by-side table (Lever)  `16:10`
## Section 3 of 4 — Where HireBest wins (Lever)  `16:9`
## Section 4 of 4 — CTA (Lever)  `16:9`

---

# PAGE 9 — VS WORKABLE (4 sections)

*(Same substitutions):*

- Product name **Greenhouse → Workable** everywhere.
- Poster caption: "Workable avg. per-role screening time — self-reported, n=11".
- Feature matrix: Workable-strength row is "Careers site builder" (ink checkmark on Workable, em-dash on HireBest).
- CTA link: "Read the Workable + HireBest guide ›".

## Section 1 of 4 — Vs hero (Workable)  `16:9`
## Section 2 of 4 — Side-by-side table (Workable)  `16:10`
## Section 3 of 4 — Where HireBest wins (Workable)  `16:9`
## Section 4 of 4 — CTA (Workable)  `16:9`

---

# PAGE 10 — LOGIN (2 sections)

## Section 1 of 2 — Split auth  `16:9`

Composition anchor: **60/40 photo + form**.

```
16:9 split.

LEFT 60%: a bright modern editorial photograph — a warm-lit desk with a
MacBook open showing a HireBest notification banner near the top-right of
the screen: "3 candidates scored above 85." The banner is a real
translucent notification (blur 24px, 55% white, 12px corners). Grounded.

RIGHT 40%: base surface. Vertically centered:
- Small "HireBest" wordmark ink at top.
- H2 SF Pro Display semibold: "Welcome back."
- Sub secondary label: "Sign in to keep screening."
- Grouped list card with two fields: Work email, Password. Hairline
  separator between them. Rounded rectangle fill #F2F2F7.
- Below the card, an accent-blue pill full-width "Sign in".
- Row of two ghost buttons underneath: "Continue with Google" · "Continue with SSO".
- Two inline links: "Forgot password?" · "Create account ›"
```

## Section 2 of 2 — Footer strip  `16:10, short`

```
Base surface mini band. Centered small caption in tertiary label:
"HireBest · SOC 2 in progress · EU data residency · © 2026"
```

---

# PAGE 11 — SIGNUP (2 sections)

## Section 1 of 2 — Split auth (signup)  `16:9`

Composition anchor: **inverted 40/60 — form left, photo right**.

```
Mirror of login. LEFT 40% is the form. RIGHT 60% is the editorial photo —
a hiring lead reviewing a shortlist on a wall, three candidate cards
pinned with tiny accent-blue score badges next to them.

Form fields on the left (grouped list): Work email, Password, Company
name. Below the group, small ink checkbox row: "I agree to Terms and
Privacy." Accent-blue full-width pill "Create account".

Then two ghost buttons: "Continue with Google" · "Continue with SSO".
One inline link: "Already have an account? Sign in ›"
```

## Section 2 of 2 — Trust strip  `16:10, short`

```
Base surface mini band. Four tiny chips separated by • in secondary label:
"SOC 2 in progress" • "EU data residency" • "Human review always" •
"No AI training on your data"
Right-aligned accent-blue inline: "See our data promise ›"
```

---

# PAGE 12 — DASHBOARD (5 sections)

These render **product UI reference frames**. Full Apple discipline: translucent chrome, grouped lists for content, scroll-edge fades where content passes beneath floating chrome, spring-implied motion in interactions.

## Section 1 of 5 — Dashboard shell + overview  `16:9`

```
16:9. Full app UI on base surface #FBFBFD.

- LEFT sidebar (thin, 220px, translucent glass — blur 32px, 65% white,
  scroll-edge fade at top and bottom): "HireBest" wordmark; nav rows:
  Overview, Roles, Candidates, Shortlists, Analytics, Team, Settings.
  Active row is "Roles" — filled accent-blue leading dot, ink label.
- TOP bar (translucent glass, blur 32px, 65% white, 1px light top edge):
  role dropdown "Senior Backend Engineer — Berlin" with a small chevron,
  a translucent search field, a ghost "New role" pill on the right, small
  circular avatar.
- MAIN area:
  - Big grouped list card (fill #F2F2F7 background, hairline separators)
    titled "Latest batch" — 8 candidate rows. Each row: circular initials
    avatar, name (SF Pro Text semibold), one-line reasoning excerpt in
    secondary label, tabular "0–100" match score on the right. Top row is
    92 in accent-blue, its row background subtly highlighted.
  - RIGHT column, stacked, two smaller cards: "Batch stats" (three
    tabular metrics — 100 CVs, 38s, 12 shortlisted) and "Notes to team".

All borders hairline, no drop shadows deeper than 6% opacity, scroll-edge
fade visible where the main area passes under the top bar.
```

## Section 2 of 5 — Screening batch in progress  `16:9`

```
Same shell. Main area shows batch-upload state:
- Large drop zone as a rounded rectangle fill #F2F2F7 with a hairline
  dashed border, centered accent-blue "+" glyph + "Drop CVs — PDF, DOCX,
  PNG, JPG." in ink.
- Below, a live-processing list of ~12 visible rows in a grouped list
  card: filename, a thin accent-blue progress bar (spring-settled fills at
  various %), and a small chip "Scored" (fill #34C759 at 20% + green ink)
  when done.
- Right column: "Batch summary" card — 87 / 100 done, ETA 11s in SF Pro
  tabular, small ghost "Pause" pill.

Imply spring interruptibility: one row shows a slightly translucent
paused state with the pause glyph and a smaller thumb, hinting the user
grabbed the progress mid-flight.
```

## Section 3 of 5 — Candidate detail view  `16:9`

```
Same shell. Main area is a candidate detail:
- Header row: name in SF Pro Display semibold, city + years in secondary
  label. Right side: "92 / 100" in SF Pro Display tabular with a small
  radial dial in accent-blue next to it.
- Two-column body:
  - LEFT: JD alignment — grouped list card with 4 rows, each cites a JD
    ¶ number in a small filled accent-blue chip on the right. Two rows
    have a systemGreen leading dot (strong match), one has a systemRed
    leading dot (gap).
  - RIGHT: resume excerpt — a translucent glass panel (blur 20px, 60%
    white) with the text rendered inside; a few highlighted spans in
    accent-blue at 20% opacity.
- Sticky BOTTOM action bar (translucent glass, blur 32px, 65% white,
  scroll-edge fade above where the main scroll passes under):
  ghost "Compare" · ghost "Add note" · accent-blue pill "Add to shortlist".
```

## Section 4 of 5 — Analytics  `16:9`

Data-viz allowed (site type earns it).

```
Same shell. Main area:
- Top row: three lightweight stat cards on grouped fill #F2F2F7 —
  "Average time-to-shortlist" (48m), "Roles closed this month" (7),
  "Shortlist agree-rate" (94%). Numbers SF Pro Display tabular, secondary
  label captions.
- One line chart across full width in a grouped list card: score
  distribution over 30 days. Accent-blue line, subtle fill under the line
  at 10% opacity. Fine gridlines in tertiary. Small tabular axis labels.
- Below chart: filter row of segmented control-style chips: Role,
  Seniority, Date range.

Restrained. No pie charts. No colored bars competing.
```

## Section 5 of 5 — Empty state  `16:9`

```
Same shell. Main area is a "Roles" empty state:
- Centered translucent card (blur 24px, 65% white, 12px corners, grounded
  shadow).
- Small tabular numeral "01" top-left of the card in tertiary label.
- H3 SF Pro Display semibold: "No roles yet."
- Sub secondary label: "Paste a job description to start your first batch."
- Accent-blue pill "Create your first role".
- Below: inline link "Import from Greenhouse / Lever / Workable ›"

No cartoon empty-box illustration. No ghost mascot.
```

---

# PAGE 13 — CHECKOUT (3 sections)

## Section 1 of 3 — Plan summary  `16:9`

```
Base surface. Two-column layout:
- LEFT 55%: order summary as a grouped list card (fill #F2F2F7, hairline
  separators). Header row: "Growth — Annual" in SF Pro Display semibold,
  right-aligned ghost "Change plan" link. Body rows:
    Base $99 × 12 — $1,188
    Annual discount −20% — −$237.60
    Tax (est.) — $0.00
  Footer row (bold hairline above): "Total due today" left,
  "$950.40" right in SF Pro Display tabular.
- RIGHT 45%: "What's included" — a translucent glass card (blur 24px,
  60% white). 6 bullets with Apple checkmark glyphs. Below, tertiary
  label: "Cancel anytime from settings."

Above both: a slim Segmented Control-style breadcrumb "Plan · Payment",
"Plan" selected in accent-blue.
```

## Section 2 of 3 — Payment form  `16:9`

```
Base surface. Centered column, narrow.
- Breadcrumb "Plan · Payment", "Payment" selected accent-blue.
- H2 SF Pro Display semibold: "Payment details".
- Grouped list card with fields: Card number (Visa glyph faint on
  right), Name on card, Country / postcode. Hairline separators.
- Below the card, small line "Billed to hello@company.com · edit".
- Accent-blue pill full-width "Pay $950.40" with a small SF Symbols
  lock glyph inline.
- Below: three tiny trust chips in tertiary — "Stripe secured" ·
  "SCA compliant" · "SOC 2 in progress".
```

## Section 3 of 3 — Success state  `16:9`

```
Base surface. Centered:
- A single quiet accent-blue checkmark inside a soft radial haze (implies
  the check just settled from a scale-spring — no confetti).
- H1 SF Pro Display semibold, one line: "You're in."
- Sub secondary label: "Receipt sent to hello@company.com. Your first role is one paste away."
- Two CTAs inline: accent-blue pill "Go to dashboard" + inline "Download invoice ›"

Below, a translucent glass receipt card (blur 20px, 60% white, 12px
corners) with a tabular order number and a small inline link
"View all invoices ›".
```

---

# 🔁 EXECUTION NOTES

1. **One image at a time.** Generate each section as its own horizontal image. Never merge sections.
2. **Global brand block first.** Paste the 🔒 GLOBAL BRAND WORLD block once per model session — most image models respect a persistent style contract across follow-ups.
3. **Aspect ratios.** Heroes → 21:9. Standard sections → 16:9. Long content (tables, matrix) → 16:10.
4. **Composition variety enforced.** Across the site: stacked-center (Home hero, About hero, Pricing hero, Contact hero), image-as-canvas dark (Home product showcase, Newsletter CTA), inverted classic (About origin, Pricing proof, Signup), bento (Home features, Team, Blog grid, Interview categories), three-column glass over photo (Home use cases, About values, Vs Wins). Text-left / image-right is used only where actually best.
5. **Materials discipline.** Translucent chrome appears in every hero and every dashboard frame. Scroll-edge fade replaces hard 1px dividers under sticky bars.
6. **Motion implied through composition.** Spring-settled positions; grabbed elements show subtle scale + tilt; flicked elements show a soft trailing streak; sheets emerge from plausible anchors, not float in from nowhere.
7. **Palette lock.** If the model drifts to purple/blue AI gradients, re-inject only: "Single accent is HireBest Blue #0A84FF (systemBlue). Never gradient. Never purple." and regenerate.
8. **Total images if you render everything:** 8 + 5 + 5 + 3 + 4 + 4 + 4 + 4 + 4 + 2 + 2 + 5 + 3 = **53 horizontal images.**
