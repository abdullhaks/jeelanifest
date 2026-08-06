# MASTER PROMPT — Jeelani Fest 2026 Public UI Refactor

**Paste this entire document into Claude Opus 4.6 (Thinking) or Gemini 3.1 Pro (High) as the system/first message. Do NOT summarize it before executing — treat every section as a hard requirement.**

---

## 0. ROLE & MISSION

You are a senior frontend architect and visual designer. You are performing a **total UI/visual refactor** of the **public-facing side only** of an existing web app called **"Jeelani Fest 2026"** — a management platform for an Islamic college arts/talent festival in Kerala, India.

The app already works. Your job is **not** to rebuild functionality — it is to take the existing data and existing logic and wrap it in a completely new, premium, visually energetic UI using a **competition bento grid + glassmorphism + parallax** design language.

Think of this as: same skeleton and same blood flow, entirely new skin.

---

## 1. HARD CONSTRAINTS — DO NOT VIOLATE

1. **Zero backend changes.** Do not touch, rename, or restructure any API routes, database models, admin panel, authentication logic, or server-side code.
2. **Do not change data contracts.** If a component currently consumes `props.groupPoints` or calls `useGroups()`, `useResults()`, `useParticipants()`, `useLiveEvents()` etc., keep the same hooks/functions/API calls — only change how the returned data is *rendered*.
3. **Do not touch the admin side** (routes, components, or logic under any `/admin` directory).
4. **Only the public side is in scope**: Home, Groups, Results, Participants, Gallery, Live Modals.
5. Preserve all existing routing (React Router paths must not break).
6. Where existing components mix data-fetching and presentation in one file, you may **split them** into a `Container` (keeps logic untouched) + `View` (new UI) pattern — this is the recommended refactor pattern, not a violation of constraint #2.
7. If a required field/data isn't available from the current backend response, do not invent fake data — leave a clearly marked placeholder/fallback state instead.

---

## 2. TECH STACK (already decided)

- **React** (assume the existing project's version/setup — do not migrate to Next.js unless the project already uses it)
- **Tailwind CSS** — extend the config, don't fight it
- **Framer Motion** — for all animation, page transitions, scroll reveals, parallax
- **TypeScript if the project already uses it** (match existing convention)

### Libraries to research and integrate (pick the best-fit, high-quality ones — don't reinvent):
- **shadcn/ui** (Radix-based, Tailwind-native) — as the base primitive layer (Dialog/Modal, Tabs, Accordion, Tooltip, Sheet for mobile nav)
- **Aceternity UI** and **Magic UI** — for bento-grid cards, spotlight/glow effects, animated borders, marquee, text reveal effects — cherry-pick components, don't import wholesale
- **Embla Carousel** (`embla-carousel-react`) — for the hero image carousel and gallery carousel (lightweight, unopinionated, works great with Framer Motion)
- **Recharts** or **visx** — for the Live Group Points graph and Artistic Talent (Sub Junior/Junior/Senior) graphs — pick Recharts for speed unless custom axis behavior is needed
- **react-parallax-tilt** or manual Framer Motion `useScroll`/`useTransform` — for parallax layers (prefer Framer Motion native scroll hooks over adding another dependency where possible)
- **lenis** (`@studio-freight/lenis`) — for smooth-scroll, which makes parallax feel premium instead of janky
- **lucide-react** — icon set (clean, modern, matches glassmorphism aesthetic)
- **react-countup** — for the "total count analytics" numbers (animate counting up on scroll into view)
- **PhotoSwipe** or a custom shadcn `Dialog` + Embla — for the Gallery lightbox

Justify any additional library choice in one sentence before using it. Prefer fewer, well-chosen libraries over many overlapping ones.

---

## 3. DESIGN SYSTEM

### 3.1 Reference analysis (source: attached bentogrids.com shot — Photomator design)
The reference demonstrates the exact grid discipline to replicate:
- **Asymmetric bento cells** in a 12-column-feeling grid: one large card spans 2 columns + 2 rows, paired with a stacked 2x2 photo-collage card of the same total height, a full-width short banner strip, then two half-width cards below.
- **Consistent large corner radius** across every card (~24–28px / `rounded-3xl`).
- **Generous, consistent gutters** between cards (~16–24px).
- **Card content types to replicate as patterns:**
  - Photo-background card with bold white headline text overlaid bottom-left, dark gradient scrim for legibility.
  - Solid color-block gradient card (used for CTA/highlight moments) with a pill button.
  - Photo-collage card (multiple smaller images tiled in a 2x2 or 4-grid within one bento cell).
  - Light/neutral card with dark headline + one accent-colored word/link.
  - **Floating glassmorphism pill tags** overlaid on photography (small frosted-glass rounded pills with short text) — use this exact pattern for tagging things like program names, categories, or "LIVE" badges over imagery.
- Typography in the reference is bold, tight-tracking, large-scale sans-serif for headlines; this should translate to your Arabic/English pairing (see 3.3).

### 3.2 Color palette (Islamic college fest in Kerala — adapt, don't copy generic SaaS blue)
Design a palette that feels **festive, cultural, premium** — not corporate. Suggested direction (adjust to your judgment, but stay in this territory):
- **Base/dark mode background:** deep emerald-black or ink-teal (`#0A1410` – `#0F1F1A` range) as the primary canvas — Islamic green carries strong cultural resonance for this context.
- **Accent gradient 1:** emerald → gold (`from-emerald-600 to-amber-400`) for primary CTAs and highlight cards.
- **Accent gradient 2:** deep maroon → rose-gold, as a secondary accent for "Results/Winner" contexts.
- **Glass surfaces:** `bg-white/5` to `bg-white/10` with `backdrop-blur-xl`, `border border-white/10`, subtle inner glow.
- **Neutral cards:** warm off-white/cream (`#F7F3EA` range) for light-card contrast sections (About, Coordinators) so it doesn't become monotone-dark.
- Reserve gold/amber strictly for **winners, live badges, and key CTAs** — if everything glows gold, nothing does.
- Support **light mode is optional**; if time-limited, ship a polished dark theme first (matches glassmorphism better) and treat light mode as a stretch goal.

### 3.3 Typography (Arabic + English)
- **English display/headline font:** something with strong geometric character — e.g. `Clash Display`, `General Sans`, `Cabinet Grotesk`, or `Poppins` (700–800 weight) for headlines; `Inter` or `General Sans` for body copy.
- **Arabic font:** `Noto Naskh Arabic` or `Cairo` or `Almarai` for a modern-but-legible Arabic feel (avoid overly calligraphic decorative fonts for body/UI text — reserve true calligraphic styling, e.g. `Amiri` or `Reem Kufi`, for the logo/hero moto/section dividers only).
- Use `font-feature-settings` / proper `dir="rtl"` handling wherever Arabic text blocks appear — don't just flip font, flip direction correctly for that text node only (mixed LTR page with RTL inline blocks).
- Set a clear type scale (e.g. Tailwind: `text-6xl/text-7xl` hero, `text-4xl` section headers, `text-lg` body) and use it consistently across all 6 pages — no ad hoc sizing per page.

### 3.4 Motion language
- **Scroll-reveal:** sections and bento cards fade+rise into view on scroll (Framer Motion `whileInView`, stagger children by ~0.08–0.12s).
- **Parallax:** hero background/carousel images move at a slower scroll-speed than foreground text/cards (`useScroll` + `useTransform`, 2–3 depth layers max — don't overdo it, motion sickness is real on mobile).
- **Hover micro-interactions:** bento cards lift slightly (`y: -4 to -6px`) with a soft shadow/glow bloom on hover (desktop only — replace with tap-scale feedback on touch devices).
- **Live data elements** (live points graph, live event badge): use a **pulsing glow/dot** and smooth number transitions (`react-countup` or animated Recharts) rather than a jarring re-render/snap.
- **Modals** (live result / final result): scale+fade entrance, backdrop blur-in, confetti/celebratory motion **only** on the Final Result "winner" reveal — keep other modals restrained.
- Respect `prefers-reduced-motion` — provide a reduced-motion fallback (opacity-only transitions, no parallax) for accessibility.

---

## 4. GLOBAL COMPONENTS TO BUILD FIRST

Build these once, reuse everywhere — do not rebuild per-page.

1. **`<GlassCard>`** — the base bento cell primitive: rounded-3xl, glass or solid variant, optional image background + scrim, optional floating pill tag slot, hover-lift built in.
2. **`<BentoGrid>`** — a responsive grid wrapper that accepts children with `colSpan`/`rowSpan` props and collapses gracefully to a single column on mobile (see §6).
3. **`<Navbar>`** — glassmorphism sticky navbar (frosted, `backdrop-blur-lg`, shrinks on scroll), mobile version uses a `shadcn Sheet` slide-out menu. Include active-route indicator.
4. **`<Footer>`** — single shared footer, used on all 6 public pages, includes fest branding, quick links, coordinator/social contact, and Arabic moto line.
5. **`<StatCounter>`** — animated count-up stat block (for "Total count analytics") with icon + label.
6. **`<LiveBadge>`** — pulsing "LIVE" pill used across hero + live modals.
7. **`<ResultModal>` / `<FinalResultModal>`** — shared modal shells (shadcn Dialog + custom content), Final variant has celebratory motion treatment.

---

## 5. PAGE-BY-PAGE BREAKDOWN

For each page, map the existing sections onto bento cells. Vary card sizes deliberately — avoid a uniform grid of equal squares, that defeats the bento aesthetic.

### 5.1 Home / Hero
- **Hero cell (large, spans full width or 2/3 width):** program name + Arabic/English moto, embedded Embla carousel of fest images as the background layer with parallax depth, `LiveBadge` if an event is ongoing.
- **Live Group Points graph:** medium bento cell, Recharts bar/line, glass card, auto-refreshing indicator.
- **Live ongoing event details:** small-to-medium card adjacent to the points graph, pulsing live indicator, event name/venue/time.
- **Artistic Talent graph (Sub Junior / Junior / Senior):** one wide card with tabbed or grouped chart (shadcn Tabs to switch category, animated transition between datasets).
- **Official Gallery (dedicated program posters):** photo-collage bento cell (2x2 or masonry tile), links to full Gallery page.
- **About Jeelani Fest:** neutral/light card, editorial typography treatment, short + "Read more" expand if long.
- **Meet the Coordinators:** horizontal scroll or grid of glass profile cards (photo, name, role/description), hover reveal for description on desktop, always-visible on mobile.
- **Total count analytics:** row of `StatCounter` cells (e.g. Groups, Participants, Events, Days) — this pairs well as 4 small square bento cells in a row.
- **The Contenders (groups showcase):** grid of group cards, each a glass card with group image/emblem + name, links to Group detail.
- **Footer.**

### 5.2 Group Section
- Grid/list of group cards (reuse Contenders card style from Home for consistency) linking into a detail view per group — name, members, points breakdown, achievements — presented in a bento layout (one large group-identity card + smaller stat/achievement cards beside it).

### 5.3 Results
- Filterable/sortable results table or card-grid (by category: Sub Junior/Junior/Senior, by program) — present as bento cards per program result rather than a plain HTML table, each showing 1st/2nd/3rd with rank-colored glass accents (gold/silver/bronze border-glow). Include search/filter bar styled to match (glass input, shadcn Select).

### 5.4 Participants
- Searchable/filterable directory — grid of participant glass cards (photo, name, group, chest number/category). Include a search input + category filter chips at top, sticky on scroll for large lists.

### 5.5 Gallery
- Masonry or justified photo grid (not uniform squares — vary aspect ratios for visual rhythm), lightbox on click (PhotoSwipe or shadcn Dialog + Embla for prev/next), lazy-load images, optional category filter (stage events / candid / posters).

### 5.6 Live Modals
- **Live Competition Result modal:** triggered from Home's live event card — shows in-progress or just-published result for that specific event, glass modal, live-pulse indicator if still updating.
- **Final Result modal:** the closing moment of the fest — overall winning team/group announcement. Highest visual investment on the whole site: full-bleed gradient background (emerald→gold or maroon→gold), large winning group name/emblem reveal animation, confetti or particle burst (Framer Motion or a lightweight canvas-confetti lib), point breakdown table below the reveal, share/screenshot-friendly layout.

---

## 6. RESPONSIVENESS — NON-NEGOTIABLE

- Breakpoints: mobile (`<640px`), tablet (`640–1024px`), desktop (`>1024px`) — test all three explicitly, don't just resize a desktop layout and call it done.
- **Bento grid on mobile must NOT literally shrink the desktop grid.** Redesign the stacking order per breakpoint: on mobile, cells go full-width, stacked in a deliberate priority order (hero → live status → key stats → rest), not just DOM order collapsed.
- Carousels, coordinator rows, and gallery grids: horizontal-scroll-with-snap on mobile (`snap-x snap-mandatory`) instead of cramming a multi-column desktop grid into a tiny viewport.
- Touch targets ≥44px on mobile; hover-only interactions must have a tap/visible equivalent on touch devices.
- Test parallax and sticky navbar performance on mobile specifically — disable/simplify heavy parallax layers below a certain breakpoint if frame rate suffers.
- Arabic RTL text blocks must reflow correctly at every breakpoint, not just desktop.

---

## 7. MEDIA CONTENT HANDLING

- Use existing project images/posters wherever available (fetch from the same data source/CDN path the current app already uses — do not hardcode new asset paths that bypass the existing media pipeline).
- Where a section needs imagery that doesn't exist yet in the project (e.g. category background art, decorative textures), use **tasteful placeholder treatment** (gradient mesh, subtle Islamic geometric pattern SVG, or blurred low-opacity placeholder) rather than generic stock photos — flag each one clearly in code comments as `{/* PLACEHOLDER: replace with real asset */}` so it's easy to find and swap manually later.
- Optimize all images (proper `next/image`-equivalent lazy loading, responsive `srcset`, or at minimum native `loading="lazy"` + explicit width/height to prevent layout shift).

---

## 8. EXECUTION PROCESS (follow in this order)

1. **Audit first.** List every existing component/page file on the public side, and for each, identify: (a) what data/logic it currently owns, (b) what UI it currently renders. Output this as an inventory before writing new code.
2. **Set up the design system.** Extend `tailwind.config` with the color palette, font families, and radius/spacing scale from §3. Install and configure the chosen libraries from §2.
3. **Build global components** from §4 in isolation (e.g. in a style-guide/storybook-like scratch page if useful) before wiring them into real pages.
4. **Refactor page-by-page** in this order: Home → Results → Participants → Groups → Gallery → Live Modals (Home last-polished once patterns are proven, but built first since it's the most complex/highest-value page to prototype the system on).
5. For each page: keep the existing data-fetching layer untouched, wrap it with the new `View` components, verify the page still functions against real/live data, THEN polish animation/responsiveness.
6. **Final pass:** cross-page consistency check (spacing scale, type scale, color usage, motion timing all matching across all 6 surfaces), full responsive QA at 3 breakpoints, `prefers-reduced-motion` check, Lighthouse pass for performance (glassmorphism blur + parallax can be GPU-expensive — profile it).

---

## 9. QUALITY BAR / DO's AND DON'Ts

**Do:**
- Vary bento card sizes deliberately per the reference grid discipline (§3.1).
- Keep glass-blur usage purposeful — glass surfaces should sit ON something (imagery/gradient), not float on flat black with nothing to blur.
- Keep the gold/amber accent rare and earned (winners, live status, primary CTA only).
- Make the Final Result reveal feel like a genuine "moment" — this is the emotional peak of the whole app.

**Don't:**
- Don't make every card the same size — that's a plain grid, not a bento grid.
- Don't apply parallax to more than 2–3 depth layers per view — it gets nauseating, especially on mobile.
- Don't let Arabic text get squeezed into an English-first layout as an afterthought — design each bilingual section with both scripts in mind from the start.
- Don't touch admin routes, API layer, or auth logic under any circumstance.
- Don't ship without testing on an actual small mobile viewport (not just browser devtools at desktop zoom).

---

## 10. DELIVERABLE

Working, responsive, production-quality React components implementing the above across all 6 public surfaces, using only the agreed stack (React + Tailwind + Framer Motion + the researched supporting libraries), with zero backend/admin modifications, and a short summary at the end listing:
- Every new dependency added and why.
- Every file touched and whether it was a full rewrite or a Container/View split.
- Any `{/* PLACEHOLDER */}` media flags left for manual replacement.
