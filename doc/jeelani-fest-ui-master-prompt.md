# MASTER PROMPT — Jeelani Fest Public UI Refactor

## 0. FILL-IN BEFORE YOU RUN THIS (2 minutes)

The design direction below is grounded in real Kerala-Islamic visual culture rather than generic "AI fest UI" defaults. If any of these are already fixed in your brand, replace them — otherwise the agent should use the defaults given.

```
FEST_NAME_EN        = "Jeelani Fest 2026"
FEST_NAME_AR        = 'مهرجان الجيلاني
COLLEGE_NAME        = SHEIKH JEELANI ISKAMIC ACADEMY
EDITION / YEAR       = 2026
EXISTING BRAND HEX   = choose you self
LOGO / EMBLEM ASSET  = bring a temp logo i will replace later
REPO ROOT / FRAMEWORK = Vite + React Router 
```

---

## 1. ROLE

You are acting as a senior frontend architect and visual designer pair (one of you thinks in system architecture, the other in motion/interaction detail — use that division of labor). You are refactoring the **presentation layer only** of an existing production web app for an Islamic college arts/talent fest in Kerala. This is not a rebuild — it is a skin-and-motion transplant on top of a working, data-driven app.

Treat this like a real client brief: the client has already seen generic bento/glassmorphism templates and rejected them for feeling like "any hackathon site." You are being paid to make something that could only be this fest, not a reskin of a SaaS landing page.

---

## 2. HARD CONSTRAINTS — DO NOT VIOLATE

These are non-negotiable. Violating any of these is a failed task, regardless of how good the visuals look.

1. **Zero backend logic changes.** Do not touch API routes, controllers, database models, auth, admin side, or business logic of any kind.
2. **Zero data-contract changes.** Every `fetch`/`axios` call, API endpoint, request payload, response shape, and prop interface passed *into* a component from a data-fetching hook must remain identical. You are restyling what's rendered, not what's fetched.
3. **Keep state management and routing logic intact.** You may reorganize *how components are composed and styled*, but hooks like `useEffect`, `useState`, context providers, React Query/SWR calls, socket listeners for live data, and route definitions stay functionally the same. If a component must be split for the new visual structure, extract presentational sub-components but keep the data-owning component as the single source of truth.
4. **Do not remove or hide any real data field currently rendered**, unless explicitly told to in the page spec below (e.g., consolidating a table into a card still needs to show the same info).
5. **Additive on the public side only.** The admin side is untouched.
6. **Every visual claim must degrade gracefully.** If a live data feed (points, live event) is empty/loading/errored, the UI must show a designed empty/loading/error state — never a broken layout.

Before writing any code, output a short **"Data Contract Audit"**: list every component being restyled and the exact props/hooks it currently consumes, confirming what stays untouched. This is your checkpoint to prove constraint #2 before touching JSX.

---

## 3. DESIGN DIRECTION

### 3.1 Ground it in the actual subject

This is not "a tech startup landing page." It's a Kerala Islamic college arts fest — the visual world to draw from: Mappila (Malabar Muslim) architectural ornament — teak lattice work (jaali/mashrabiya-style geometric screens), brass oil lamps, deep-emerald mosque domes, Arabic calligraphy and Kufic geometry, manuscript-ivory paper tones, and the competitive-scoreboard energy of a live arts meet (think: a stadium scoreboard crossed with an illuminated manuscript, not a crypto dashboard).

Avoid the three default AI-generated looks: (a) cream background + terracotta accent, (b) near-black + single neon accent, (c) hairline-rule broadsheet layout. None of these belong here unless deliberately chosen — they read as templated regardless of subject.

### 3.2 Design tokens (use these unless brand hex is supplied in section 0)

**Color — 6 named tokens:**

| Token | Hex | Use |
|---|---|---|
| `ink-navy` | `#0A1410` | Primary dark background (deep, slightly green-black — not pure black) |
| `emerald-deep` | `#0F4C3A` | Primary brand color, section backgrounds, glass tint base |
| `brass-gold` | `#C9A063` | Accent, live indicators, dividers, active states — used sparingly |
| `ivory-parchment` | `#F3ECDD` | Light-mode text on dark, card text, manuscript-paper feel |
| `oxblood-maroon` | `#6E2430` | Competitive/energy accent — "live," "winner," urgency states only |
| `amber-glow` | `#F2C879` | Glow/highlight for live pulses, number tickers, hover states |

**Typography — 3 roles, bilingual:**

- **Display (headlines, fest name, section titles):** Arabic → `Reem Kufi` (bold geometric Kufic — squared letterforms give real Islamic-geometric character, not a generic script font). Latin → `Space Grotesk` or `General Sans` (geometric sans that visually rhymes with Reem Kufi's squared proportions). Set with generous letter-spacing on English, normal on Arabic.
- **Body (paragraphs, descriptions, coordinator bios):** Arabic → `IBM Plex Sans Arabic` or `Cairo` (high legibility at small sizes). Latin → `Plus Jakarta Sans` or `Inter`.
- **Data/Scoreboard (live points, counters, program codes, timestamps):** `Space Mono` or `JetBrains Mono` — gives the live-graph and counter numerals a "scoreboard ticking" feel distinct from prose.

Load both Arabic and Latin fonts as variable fonts where available. Never fall back to a system Arabic font — it will look broken next to the custom Latin type.

**Signature element (the one thing this UI is remembered by):**
A thin animated geometric lattice line-pattern (SVG, inspired by jaali/mashrabiya screens) used as a background layer behind glass panels, animating almost imperceptibly on scroll (parallax drift, not attention-grabbing motion). This single motif recurs across hero background, section dividers, and the final-result reveal — it is the thread that ties every page together. Do not introduce a second competing "signature" motif elsewhere.

### 3.3 Glassmorphism tokens

```css
--glass-bg: rgba(255, 255, 255, 0.06);
--glass-bg-strong: rgba(255, 255, 255, 0.10);
--glass-border: rgba(201, 160, 99, 0.25);   /* brass-tinted border, not plain white */
--glass-blur: 16px;                          /* 8px on mobile — see perf rules */
--glass-shadow: 0 8px 32px rgba(10, 20, 16, 0.45);
--glass-inner-glow: inset 0 1px 0 rgba(243, 236, 221, 0.08);
```

Glass panels get a **brass-tinted border**, not a neutral white border — this is what stops it from reading as generic Linear/Stripe-style glassmorphism and ties it to the brass-lamp motif.

### 3.4 Bento grid philosophy — "Competition Bento Grid"

Treat the bento grid as a **scoreboard layout**, not a portfolio layout: tile sizes should encode importance/urgency, not just visual variety.

- Large tiles (2x2): live points graph, hero carousel, final result.
- Medium tiles (2x1 / 1x2): ongoing event, about section, gallery teaser.
- Small tiles (1x1): individual stat counters, coordinator chips.
- Every bento tile corner uses a subtle clipped/notched corner (inspired by geometric lattice framing) instead of a plain `rounded-2xl` — this is a small, cheap detail that reinforces the cultural motif everywhere.
- Tiles that show **live** data get a persistent, low-amplitude pulse ring in `amber-glow`, not a static "LIVE" badge alone.

### 3.5 Motion principles

- Page load: one orchestrated hero entrance sequence (staggered headline reveal + lattice fade-in), not scattered independent animations.
- Scroll: parallax on background layers only (lattice pattern, hero image depth) — never parallax the primary readable text, it hurts legibility with Arabic script in particular.
- Micro-interactions: tilt-on-hover for cards (subtle, 4–6° max), number counters animate once on viewport-enter (not on every re-render).
- Respect `prefers-reduced-motion`: disable parallax and tilt, keep only opacity/fade transitions.
- Live data updates (points changing) should animate the *delta* — a number ticking up/down with a brief glow flash — not just re-render silently.

---

## 4. TECH STACK & LIBRARIES

Confirmed stack: **React + Tailwind CSS + Framer Motion**. Add the following, chosen specifically for this brief (research current versions before installing):

**Component foundations**
- `shadcn/ui` — base accessible primitives (dialog/modal, tabs, select, tooltip) to build the live-result modals and filters on top of, restyled with the glass tokens above.
- `Aceternity UI` — source components for bento grid cells, spotlight/glow card effects, 3D tilt cards, meteor/particle backgrounds (use particles sparingly — only in the final-result reveal, not ambient everywhere).
- `Magic UI` — number ticker (for live points/analytics counters), marquee (for sponsor/coordinator strips), animated beam (optional, for "group progressing through rounds" visual if useful).

**Data visualization**
- `Recharts` or `Tremor` (Tremor is fastest for a clean "live points" bar/line race and category breakdowns for sub-junior/junior/senior) — restyle with the token palette, do not use library default colors.
- `react-countup` for total-analytics counters.

**Carousel / gallery**
- `Embla Carousel` (lightweight, used inside the hero bento tile — not a full-bleed slider) for the hero image carousel and coordinators strip.
- A masonry/justified layout (`react-photo-album` or custom CSS grid) for the Official Gallery and public Gallery page, with a glass lightbox on click.

**Motion & scroll**
- `Framer Motion` (already chosen) for entrance/tilt/modal transitions.
- `Lenis` for smooth-scroll, which makes the parallax layers feel intentional rather than jittery.
- Use CSS `transform: translate3d()` -driven parallax (via Framer Motion's `useScroll`/`useTransform`), never top/left-based parallax.

**Utility**
- `tailwindcss-logical` plugin (or Tailwind's native logical properties in v3.3+/v4) — mandatory for RTL-safe spacing (`ps-`, `pe-`, `ms-`, `me-` instead of `pl-`/`pr-`/`ml-`/`mr-`).
- `canvas-confetti` — reserved *only* for the Final Result reveal modal (winning team announcement). Do not use anywhere else — it should stay special.

Do a quick web check for current stable versions and any breaking API changes on Aceternity/Magic UI before pulling components, since these move fast.

---

## 5. GLOBAL RULES ACROSS ALL PAGES

- **Bilingual typography:** every headline that has both Arabic and English should NOT just stack the English translation under the Arabic in the same font — give Arabic its own line-height and baseline treatment (Arabic script needs ~1.4–1.6 line-height vs ~1.2 for Latin display type) so both read naturally, not cramped.
- **RTL handling:** if the app has a language toggle, `dir="rtl"` should flip the entire layout including bento grid reading order and card internal alignment — not just mirror text. If Arabic and English are shown together inline (not toggled), keep the overall layout LTR-structured but let individual Arabic text spans render with correct internal RTL shaping (`unicode-bidi: plaintext`).
- **Footer:** build once as a shared component (already implied by current structure) — restyle with the same glass + lattice motif so it doesn't feel like a bolted-on generic footer. Include fest socials, coordinator contact, and a subtle "powered by" line if applicable.
- **Navbar:** persistent glass navbar, condenses on scroll (height + blur increase), active route indicated with a brass underline, not a filled pill (keep it restrained).
- **Performance budget (critical — glassmorphism + parallax is expensive on mobile):**
  - Cap simultaneous `backdrop-blur` elements visible in viewport at any time; reduce blur radius on mobile (`8px` vs `16px` desktop) via a Tailwind responsive variant.
  - Parallax layers use `will-change: transform` only while in viewport, removed when scrolled out.
  - All gallery/carousel images lazy-load, served in modern formats (WebP/AVIF) with explicit width/height to prevent layout shift.
  - Virtualize the Participants list/grid if participant count is large (e.g. `react-virtuoso`) rather than rendering hundreds of glass cards at once.
- **Accessibility floor:** visible keyboard focus rings on every interactive element (style them in `brass-gold`, don't remove focus outlines for aesthetics), sufficient contrast for ivory-on-emerald text, all live-updating regions (`aria-live="polite"`) for points/results so screen readers announce changes, reduced-motion respected per §3.5.

---

## 6. PAGE-BY-PAGE SPEC

### 6.1 Hero / Home

Build as a tall parallax hero followed immediately by the competition bento grid (no hard section break — the lattice background should visually continue from hero into the grid).

- **Hero band:** lattice pattern (back layer, slow parallax) → fest emblem/logo → `FEST_NAME_AR` + `FEST_NAME_EN` as the display-type signature moment (staggered reveal on load) → moto line in body type → a compact glass carousel tile (Embla) cycling program posters/highlight images, NOT full-bleed — it should sit as one bento-scaled element so the hero doesn't feel like a generic slider site.
- **Competition Bento Grid (below hero), suggested cells:**
  - **Live Group Points** (large, 2x2): animated race/bar chart (Tremor/Recharts), ticking numbers, amber pulse ring while live.
  - **Live Ongoing Event** (medium): current program name, stage, category, a pulsing live badge, "watch results" CTA linking to the live modal.
  - **Artistic Talent breakdown** (medium): segmented control or tabs for Sub-Junior / Junior / Senior, each showing a compact radial/donut of category participation — keep this one tile with an internal switcher rather than three separate tiles competing for space.
  - **Official Gallery teaser** (medium): 4–6 program poster thumbnails in a mini-masonry, "View full gallery" link.
  - **About Jeelani Fest** (medium): concise mission copy over a subtle lattice texture, written in the fest's own voice (not generic "welcome to our website" copy).
  - **Meet the Coordinators** (wide strip): horizontal-scroll or Embla carousel of tilt-on-hover glass profile cards — photo, name, role, one-line description.
  - **Total Count Analytics** (row of small tiles): animated counters (react-countup) for total participants / groups / programs / colleges (whichever real metrics the backend already returns).
  - **The Contenders** (large grid): group cards with group emblem/banner, name, live rank if available, hover reveals a quick stat.
- **Footer.**

### 6.2 Group Section

Per-group profile pages/listing:
- Group listing view: bento/grid of group cards (reuse "Contenders" card component from home for consistency) with quick filters if group count is large.
- Group detail view: parallax banner header (group banner image + emblem), group name (bilingual), current standing/points, member roster, program-by-program participation history as a compact glass table or stacked list — same data as today, restyled.

### 6.3 Results

- Filter bar (glass, sticky on scroll): category (Sub-Junior/Junior/Senior), program type, stage, group.
- **Podium presentation** for placed results (1st/2nd/3rd) as a 3-card glass "podium" visual (center-elevated for 1st) with medal iconography, before falling back to a full sortable results table/list for everything else below the fold.
- Each result row expandable for full detail (judges, scores if shown publicly, participants involved) — same data currently displayed, just restyled into glass rows instead of a plain table if the current implementation is a bare `<table>`.

### 6.4 Participants

- Directory grid of participant cards: photo, name, group, category, programs entered — filterable/searchable (reuse the filter bar component from Results for consistency).
- Virtualize if the list is long (see performance rules).
- Individual participant detail (if the app has it) restyled as a glass profile card, same fields as today.

### 6.5 Gallery

- Masonry/justified photo grid, filterable by day/program/category if that metadata exists today.
- Glass lightbox on click with keyboard navigation (arrow keys, Esc to close), subtle parallax zoom on open.
- Lazy-loaded, blurred-placeholder-to-sharp image loading transition.

### 6.6 Live Modals

- **Live competition result modal:** triggered from the "Live Ongoing Event" tile or Results page. Glass overlay, animated reveal of scores/standings as they come in (respect existing socket/polling logic — only restyle the render). Amber pulse + subtle sound-optional cue (visual only unless audio already exists) when a new result posts.
- **Final Result modal:** the one place `canvas-confetti` and the strongest motion is allowed. Cinematic reveal sequence: countdown or drumroll-style suspense beat (visual, using Framer Motion sequencing) → winning group name and emblem revealed large-scale → confetti/particle burst in the brass/gold + emerald palette (not default rainbow confetti — tint it to the brand tokens) → final standings list beneath. This is the single "hero moment" of the entire app — spend your one big animated swing here, keep everything else restrained per §3.5.

---

## 7. WORKFLOW — HOW TO EXECUTE THIS

Work in phases, and after each phase, self-review against §2 (constraints) and §3 (design intent) before moving on. Do not attempt all pages in one pass.

1. **Phase 0 — Audit + Tokens.** Output the Data Contract Audit (§2). Set up the design token file (Tailwind config extension: colors, fonts, glass variables) and a small shared component library: `GlassCard`, `BentoGrid`/`BentoCell`, `ParallaxLayer`, `LiveBadge`, `StatCounter`, `PodiumCard`, `LatticeBackground`. Every page below should compose from these, not redefine styles ad hoc.
2. **Phase 1 — Hero + Home bento grid.** This sets the visual language for everything else. Build, screenshot, self-critique against the "does this look templated" check in §3.2 before proceeding.
3. **Phase 2 — Group, Results, Participants, Gallery.** Reuse Phase 0 components; these should now be fast since the design system exists.
4. **Phase 3 — Live modals** (highest motion complexity, do last so the component library is mature).
5. **Phase 4 — Responsive, RTL, performance, accessibility pass** across all pages (§5).
6. **Phase 5 — Final self-critique.** Take screenshots of every page at mobile + desktop widths, check against: does every glass panel have the brass-tinted border (not generic white)? Does the lattice motif recur consistently? Is any animation purely decorative with no purpose? Cut anything that doesn't earn its place.

At the end of each phase, report: files changed, confirmation that no data-fetching/prop-contract code was altered (only JSX structure/styling/motion wrappers), and any real data gaps where placeholder media had to be used (per the media note below).

---

## 8. MEDIA CONTENT NOTE

Source/generate imagery aligned to each section (program posters, coordinator photos, group emblems, gallery moments) wherever a real asset isn't already in the codebase, matching the emerald/brass/ivory palette so placeholders don't visually clash with the final design. Flag clearly in your Phase reports which images are placeholders so they can be swapped manually with real fest photography afterward.

---

**End of master prompt.** If anything above conflicts with the actual current component structure you find in the repo, prefer preserving working data logic over following this spec literally — flag the conflict and propose the smallest structural change needed to reconcile the two.
