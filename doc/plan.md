# Art Fest Management System — Agentic Build Plan (for Antigravity)

### EVENT NAME = JEELANI FEST 2026 
### CONTECTED AT = SHEIKH JEELANI ISLAMIC ACADEMY , MANKHERI , VALANCHERY,MALAPPURAM,KERALA
### DATE = 2026 AUGUST 22,23,24
### MOTO = INK TO INFINITY
### CONTECTED BY = GOUSIYYA STUDENTS CENTER


## 1. Design System Reference

### 1.1 Admin Panel — "Employee/HR Dashboard" genre (inspiration: dribbble.com/shots/26973590)

I was not able to pixel-inspect that specific locked Dribbble shot (Dribbble shots render client-side and aren't scrapable), so treat the description below as the **genre-accurate direction** for that exact style of dashboard — cross-check the live shot yourself once and tweak spacing/colors to match exactly; the structure below is what agents should build against:

- **Layout:** Fixed left sidebar (collapsible on tablet/mobile into a drawer), top bar with search, notifications bell, admin avatar + dropdown (profile, change password, logout).
- **Sidebar:** Logo/institution mark at top, grouped nav items with icon (Lucide) + label, active item has a soft pill/rounded highlight background, subtle left accent bar.
- **Color system:** Neutral off-white/very light gray canvas (`#F7F8FA`), white cards with large radius (16–20px) and soft, low-opacity shadows (no hard borders), one confident accent color (institution brand — default to an emerald/teal or deep maroon+gold palette fitting an Islamic institution aesthetic, configurable via Tailwind theme tokens) used sparingly for primary buttons, active states, and chart accents.
- **Typography:** Clean geometric sans (Inter / Plus Jakarta Sans), bold numerals for stat cards, muted gray for secondary labels.
- **Dashboard home:** Row of KPI stat cards (total students, total groups, competitions ongoing, results published today) each with an icon chip, big number, small trend/label. Below: a live analytics section — line/area chart for point progression, donut/bar chart for category distribution, a recent-activity feed (real-time via socket), and an upcoming-programs mini list.
- **Tables (Ant Design):** Rounded container, zebra-free clean rows, avatar+name combo cells, colored status tags (upcoming/started/ended, published/draft), row actions as icon buttons with tooltips, sticky header, built-in AntD pagination wired to backend pagination.
- **Forms/modals:** AntD Modal or Drawer for create/edit, Zod-validated, clear inline error states, a confirmation step (AntD `Modal.confirm` styled to match theme) before every destructive or state-changing action (delete, publish, disable).
- **Motion:** Framer Motion for page transitions (subtle fade+slide), stat card count-up animation, drawer/modal spring transitions, list item stagger on load.

### 1.2 Public Site — "Awwwards-grade" experiential site (inspiration: awwwards.com)

Awwwards.com itself is a curation index of many different award-winning sites, not one single design — so "match Awwwards" means **match the caliber and grammar of Awwwards-winning sites**, not a specific layout. Build to these conventions:

- **Hero:** Full-bleed, full-viewport carousel/video background (motion clips of programs/events with graceful crossfade), large bilingual display type — English title in a bold modern display serif/sans and Arabic title in a proper Arabic web font (e.g. `Noto Naskh Arabic` / `Cairo` / `Amiri` depending on desired feel) sitting together intentionally (not English-then-translation as an afterthought — give the Arabic real typographic weight, correct RTL shaping, and matching baseline alignment).
- **Motion grammar:** Scroll-triggered reveals (Framer Motion `whileInView`), parallax on hero media, smooth section-to-section transitions, micro-interactions on hover (magnetic buttons, image tilt/scale on hover for gallery/poster cards), custom cursor optional on desktop only.
- **Layout grammar:** Asymmetric/editorial grids rather than centered-everything, generous whitespace, large section numerals/labels (e.g. "01 — Live Standings"), bold oversized headings breaking grid occasionally for drama.
- **Color/mood:** Dark, cinematic base sections (hero, championship reveal) contrasted with light, airy content sections (results, gallery, participants) — an intentional light/dark rhythm as the user scrolls, rather than one flat theme.
- **Data-as-spectacle:** The live group point race and talent race aren't just charts — animate bar/line movement when points update (spring transitions), confetti burst (canvas-confetti or Framer Motion particles) on result publish, celebratory full-screen modal takeover for the final championship reveal.
- **Reusability:** Because this same visual language must hold up across `/`, `/results`, `/groups`, `/participants`, `/festgallery`, build 4–6 core section "building blocks" (BigStat, RaceGraph, PosterCard, ProfileCard, ResultCard, AnnouncementModal) rather than one-off page layouts, so parity and consistency are structural, not manually maintained.

---

## 2. Tech Stack (from spec — locked)

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Animation | Framer Motion |
| State | Zustand |
| Admin UI kit | Ant Design |
| Reusable primitives | Material UI (used selectively for base primitives, wrapped in project components — not raw MUI everywhere) |
| Backend | NestJS |
| Auth | JWT (access + refresh), httpOnly cookies |
| Validation | Zod (frontend **and** backend) |
| DB | MongoDB (Mongoose) |
| Media | Cloudinary |
| Realtime | Socket.IO |
| Hosting | Frontend → Vercel, Backend → Render |

---

## 3. Repository Structure (locked — matches spec exactly)

```
/backend
  /src
    /modules
      /auth
      /students
      /groups
      /competitions
      /results
      /posters
      /gallery
      /common        (pagination, search/filter/sort utils, zod pipes, guards)
      /cloudinary
      /socket
    main.ts
  .env
/frontend
  /public
  /src
    /assets
    /components
      /admincomponents
      /publiccomponents
      /shared          (cross-cutting primitives: Button, Modal, Table wrapper, etc.)
    /pages
      /admin
      /public
    /services          (axios/fetch API clients, one per module)
    /store             (zustand stores: authStore, uiStore, etc.)
    /hooks
    /schemas           (zod schemas, shared shape with backend DTOs)
    /router
  .env
  .gitignore
requirements.md
plan.md
README.md
```

---

## 4. Environment Variables (locked — from spec)

**Backend `.env`**
```
MONGO_URL=mongodb+srv://...
PORT_NUMBER=3000
ORIGINS=http://localhost:5173,http://localhost:5174,https://jsc-official.vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
SEED_ADMIN_USERNAME=
SEED_ADMIN_PASSWORD=
DEFAULT_PAGE_LIMIT=9
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

> Note for production on Render/Vercel: `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none` (cross-site cookies between Vercel domain and Render domain require `SameSite=None; Secure`), and `ORIGINS` must include the real Vercel URL.

---

## 5. Phase-by-Phase Plan

Each phase below has: **Goal**, **Agent Prompt** (paste verbatim into Antigravity), **Deliverables**, **Acceptance Checklist**, **Status**.

---

### Phase 0 — Repo, Tooling & Skeleton
**Status:** ✅ Done

**Goal:** Stand up empty-but-wired monorepo, both apps boot, base API ping works.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` in full before starting. Initialize the monorepo exactly per the folder structure in `plan.md` section 3. Backend: NestJS app with Mongoose connection using `MONGO_URL`, global `ValidationPipe` replaced by a Zod-based validation pipe (create `/common/pipes/zod-validation.pipe.ts`), CORS configured from `ORIGINS` env (comma-split), a `GET /api/health` endpoint returning `{ status: 'ok', time }`. Frontend: Vite + React + TS, Tailwind configured with a custom theme (institution accent color as CSS variable so it's swappable later), React Router with two route trees: public (`/`, `/results`, `/results/:id`, `/groups`, `/participants`, `/participants/:id`, `/festgallery`) and admin (`/admin/*`), Zustand `authStore` skeleton, an `apiClient` service (axios instance with `baseURL=VITE_API_URL`, `withCredentials: true`). On app load, call `GET /api/health` and show a small non-blocking toast/badge if backend is unreachable — do not block rendering on it. Add `.gitignore` for both apps (node_modules, dist, .env, .DS_Store). Do not build any feature UI yet — this phase is pure scaffolding.

**Deliverables:** Bootable backend (`npm run start:dev`) and frontend (`npm run dev`) with health check wired end to end.

**Acceptance Checklist:**
- [ ] `GET localhost:3000/api/health` returns 200 JSON
- [ ] Frontend loads at `localhost:5173`, console shows health check result
- [ ] Folder structure matches section 3 exactly
- [ ] `.env.example` committed for both apps (real `.env` gitignored)

---

### Phase 1 — Backend Core Infrastructure
**Status:** ✅ Done

**Goal:** Auth, Cloudinary, Socket.IO, and the shared search/filter/sort/pagination utility — all the cross-cutting plumbing every feature module will reuse.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Build the following NestJS modules: (1) `auth` — admin login against a single seeded admin (from `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`, hashed with bcrypt on seed), issuing short-lived access JWT + long-lived refresh JWT, access token returned in response body for the frontend to hold in memory/Zustand, refresh token set as an httpOnly, `Secure`/`SameSite` cookie (values from env) so it works across Windows/Android/iOS browsers and survives app restarts; add `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `PATCH /auth/change-password`, all Zod-validated. Add an `AuthGuard` (verifies access token) and apply it to all admin routes built in later phases. (2) `cloudinary` module wrapping upload/destroy, exposing a reusable `uploadImage(buffer, folder)` service method used by every module needing image upload. (3) `socket` module: a Socket.IO gateway (`/realtime` namespace) with typed events we will emit from later phases (`result:published`, `final:announced`, `points:updated`) — for now just wire the gateway and a connection log. (4) `common` module: a `PaginationQueryDto` (Zod schema: `page`, `limit` default from `DEFAULT_PAGE_LIMIT`, `search`, `sortBy`, `sortOrder`, plus module-specific `filter` fields) and a reusable `paginate(model, query, searchableFields)` helper using Mongoose that every list endpoint in later phases will call, so search+filter+sort+pagination behavior is identical everywhere in the app.

**Deliverables:** Working login flow (Postman-testable), Cloudinary upload utility, socket gateway, shared pagination helper.

**Acceptance Checklist:**
- [ ] Login returns access token + sets refresh cookie; refresh cookie flagged httpOnly
- [ ] `/auth/refresh` correctly rotates access token using cookie
- [ ] Protected test route rejects without valid access token
- [ ] Cloudinary test upload returns a hosted URL
- [ ] Socket client can connect to `/realtime` and see a console log server-side
- [ ] `paginate()` helper unit-tested with dummy collection: search, sort, filter, and page/limit all verified

---

**Status:** ✅ Done

**Goal:** Login screen, protected/public routing based on Zustand auth state, and the dashboard shell (sidebar + topbar) per section 1.1.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md`, especially section 1.1, before starting. Build the admin login page (Ant Design Form + Zod validation, Framer Motion entrance), wired to `POST /auth/login`; on success store admin profile + access token in the `authStore` (Zustand, with an axios interceptor that attaches the token and auto-calls `/auth/refresh` on 401 then retries once). Build a `RequireAdmin` route wrapper: if no admin in store, silently attempt `/auth/refresh` once on app boot (to survive page refresh) before redirecting to `/admin/login`; if admin present, render children. Build the dashboard shell exactly per the design direction in section 1.1: collapsible sidebar (icons from Lucide) with nav placeholders for Dashboard, Competitions, Groups, Students, Results, Posters, Gallery; topbar with search input, admin avatar dropdown containing Change Password and Logout. Change Password and Logout both require a confirmation modal (per the spec's "confirmation for all admin activities" rule) before executing. Build the Dashboard landing page with placeholder KPI stat cards (dummy numbers) and placeholder chart containers — full analytics logic comes once real data models exist in later phases, but the visual scaffold should be final now.

**Deliverables:** Full admin auth loop + dashboard shell, responsive at mobile/tablet/laptop breakpoints.

**Acceptance Checklist:**
- [ ] Wrong credentials show inline error; correct credentials land on `/admin`
- [ ] Refreshing the browser on `/admin/*` keeps the session (via refresh cookie) instead of bouncing to login
- [ ] Visiting `/admin/*` while logged out redirects to `/admin/login`; visiting `/admin/login` while logged in redirects to `/admin`
- [ ] Sidebar collapses to a drawer under tablet width; fully usable on mobile
- [ ] Logout and Change Password both show a confirmation step first

---

### Phase 3 — Competitions Module (CRUD)
**Status:** ✅ Done

**Goal:** Full competition management per the nuanced spec (group vs individual, sub-junior/junior/senior sub-entries, stage assignment after creation, status lifecycle).

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Backend: `Competition` schema — `name`, `type` (`group` | `individual`), for `individual` type store three independently toggleable sub-entries (`subJunior`, `junior`, `senior`, each `{ enabled: boolean }`) so any can be disabled without deleting the parent competition, `date`, `time`, `stage` (nullable at creation — spec says "not fixed, added after creation via edit"; options `stage1` | `stage2` | `offStage`), `status` (`upcoming` | `started` | `ended`, default `upcoming`). Full CRUD REST endpoints using the shared `paginate()` helper for listing (searchable by name, filterable by type/status/stage, sortable by date). Frontend: Admin Competitions page — AntD Table with search box (debounced ~400ms), filter dropdowns (type, status, stage), sortable columns, backend pagination; Create/Edit as an AntD Drawer form with Zod validation matching backend DTO exactly, sub-junior/junior/senior toggles only shown when type is `individual`; stage field only editable via the Edit flow (disabled/hidden at creation, per spec); a status control (e.g. segmented control or select) to move a competition through upcoming → started → ended, each transition behind a confirmation modal; delete behind a confirmation modal.

**Deliverables:** Competitions CRUD end-to-end with the exact business rules above.

**Acceptance Checklist:**
- [ ] Individual-type competition correctly stores and can independently disable sub-junior/junior/senior
- [ ] Stage cannot be set at creation, only via edit afterward
- [ ] Status transitions and delete both require confirmation
- [ ] Search debounces, filters combine correctly with search, sort and pagination all hit backend (verify via network tab, not client-side filtering)

---

**Status:** ✅ Done

**Goal:** Groups with logo upload, computed/first-letter fallback, member list, ordered leader array, soft delete.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Backend: `Group` schema — `name`, `logoUrl` (optional; if absent, frontend renders the first letter of `name` as an avatar, no need to store a generated image), `totalPoints` (default 0, only ever mutated by the Results module in a later phase — do not expose a manual edit field for it in this phase's form), `members` (array of Student refs, populated on read), `leaders` (ordered array of Student refs — index 0 = main leader, 1/2 = assistant leaders, validated so all leader IDs must also exist in `members`), `isDeleted` (boolean, default false — soft delete: delete endpoint sets this flag rather than removing the document; all list/read endpoints filter `isDeleted: false` by default). CRUD endpoints using shared `paginate()` (search by name, sort by totalPoints/name). Frontend: Groups admin page, AntD Table (avatar-or-initial + name + member count + total points + leader chips), search/sort/pagination wired to backend, Create/Edit drawer with Cloudinary logo upload (via the Phase 1 upload service), a member picker (multi-select of students — note: this can use dummy/mock student data until Phase 5 lands, then re-point to the real students list), a leader-order picker (drag-to-reorder or three explicit "Main/Assistant/Assistant" selects constrained to chosen members), delete behind confirmation (soft delete — show a "Restore" action for soft-deleted groups if you add an archived view, optional nice-to-have not required by spec).

**Deliverables:** Groups CRUD with soft delete, logo fallback, ordered leaders.

**Acceptance Checklist:**
- [ ] Group without logo renders first-letter avatar consistently everywhere it's displayed
- [ ] Leaders array order is preserved and rendered as Main/Assistant 1/Assistant 2
- [ ] Deleting a group sets `isDeleted`, doesn't remove the document, and it disappears from default lists
- [ ] `totalPoints` has no manual edit control in this phase's UI

---

### Phase 5 — Student Management Module (CRUD)
**Status:** ✅ Done

**Goal:** Student profiles with category, group, profile image, points, and per-program result display exactly as specified (stars per rank).

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Backend: `Student` schema — `name`, `class`, `group` (ref), `category` (`subJunior` | `junior` | `senior`), `profileImage` (Cloudinary, optional), `points` (default 0, mutated only by Results module, no manual edit field), `programs` (array of `{ competition: ref, rankAwarded?: '1st' | '2nd' | '3rd' | null }` — default empty array, meaning "non" per spec). CRUD with shared `paginate()` (search by name, filter by group/category/class). Frontend: Students admin page — AntD Table showing avatar, name, class, group, category, points, and a compact rendering of their programs list where any ranked program shows the star convention from the spec, e.g. `ENGLISH POEM - 1ST ⭐⭐⭐`, `ENGLISH ESSAY - 2ND ⭐⭐` (1st = 3 stars, 2nd = 2 stars, 3rd = 1 star — confirm this mapping matches intent, it's implied by the example). Create/Edit drawer with Zod validation, profile image upload. **After initial save**, per spec, expose a distinct "Add Programs" action/step on the student that loads only competitions matching (a) the student's `category` for individual-type competitions with that sub-category enabled, and (b) group-type competitions relevant to the student's `group` — and lets the admin attach/detach programs (rank stays null here; rank is only ever set through the Results module in Phase 6, not manually here).

**Deliverables:** Students CRUD with category/group-aware program attachment flow.

**Acceptance Checklist:**
- [ ] Program picker only ever shows competitions valid for the student's category/group (never shows disabled sub-categories or irrelevant group competitions)
- [ ] Star rendering matches the spec's example format exactly
- [ ] `points` has no manual edit control in this phase's UI
- [ ] Search/filter (by group, category, class)/sort/pagination all backend-driven

---

### Phase 6 — Results Management (the core workflow)
**Status:** ✅ Done

**Goal:** The most business-critical module: select a program → load correct participants (students or groups) → record ranks with multi-winner support → publish with point propagation → realtime announcement + confetti on the public site.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting — this module has the most business logic in the whole app, get the branching exactly right. Backend: `Result` schema — `competition` (ref), `status` (`draft` | `published`), `winners` — an array (not fixed 1st/2nd/3rd fields) of `{ rank: '1st'|'2nd'|'3rd', participantType: 'student'|'group', participant: ref }`, explicitly supporting **multiple winners at the same rank** (e.g. two students both `1st`) per spec. `POST /results` creates/updates a draft. `POST /results/:id/publish` is a separate, guarded endpoint that: (a) flips status to published, (b) for each winner increments the relevant `Student.points` and, if that student belongs to a group, also increments that `Group.totalPoints`; for group-type winners increments `Group.totalPoints` directly, (c) updates the corresponding entries in `Student.programs[].rankAwarded` for individual winners, (d) emits a `result:published` socket event with the populated result payload. Add `POST /results/final-announcement` (separate from per-program publish) that records overall championship (1st/2nd/3rd group) and emits a `final:announced` socket event — this is a one-time/rare event, model it as a small singleton-style document, not tied to a single competition. Frontend admin: Results page — program selector (competitions list), on select load participants (students if individual, groups if group-type, respecting category sub-entry toggles), a rank-assignment UI supporting multiple participants per rank, "Save Draft" vs "Publish" (publish behind a strong confirmation modal — this is irreversible-feeling and mutates points across the system), a separate "Announce Final Result" flow (group/podium pickers) also behind confirmation. Frontend public: a `RealtimeProvider` (socket client) that listens for `result:published` and shows a live announcement modal (name of program + winners) with a confetti burst (`canvas-confetti` or Framer-Motion-driven particles), and updates the live point graph (built next phase) without a page reload; listens for `final:announced` and shows a distinct, more dramatic full-screen championship modal with confetti.

**Deliverables:** Full result lifecycle with correct point propagation and realtime public announcements.

**Acceptance Checklist:**
- [ ] Two students can both be recorded as 1st for the same program and both receive points on publish
- [ ] Publishing an individual result updates both the student's points **and** their group's totalPoints, and stamps the rank star onto that student's program entry
- [ ] Publishing a group-type result updates only the group's totalPoints
- [ ] Draft results do not affect any points until publish
- [ ] Publish and Final Announcement both require confirmation and are visibly distinct actions from draft-saving
- [ ] A connected public client sees the announcement modal + confetti within ~1s of publish, with no manual refresh

---

### Phase 7 — Posters Management
**Status:** ✅ Done

**Goal:** Simple CRUD for program posters feeding the public poster gallery.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Backend: `Poster` schema — `title`/associated competition reference (optional), `image` (Cloudinary), `description` (optional), standard CRUD with `paginate()`. Frontend admin: simple CRUD page (grid of poster cards + upload drawer), delete behind confirmation.

**Deliverables:** Posters CRUD.

**Acceptance Checklist:**
- [ ] Upload/replace/delete all work through Cloudinary
- [ ] List uses shared search/pagination pattern for consistency even if the dataset is small

---

### Phase 8 — Fest Gallery Management
**Status:** ✅ Done

**Goal:** CRUD for general fest photo gallery (image + description).

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Backend: `GalleryImage` schema — `image` (Cloudinary), `description`, CRUD with `paginate()`. Frontend admin: grid-based CRUD page mirroring the Posters page pattern (component reuse expected — extract a shared `MediaCrudGrid` component used by both Phase 7 and Phase 8 rather than duplicating).

**Deliverables:** Gallery CRUD, with a shared component refactor between Posters and Gallery.

**Acceptance Checklist:**
- [ ] Posters and Gallery share the underlying grid/upload component (check for duplication)
- [ ] Delete behind confirmation

---

### Phase 9 — Public Site Shell, Hero & Bilingual Typography
**Status:** ✅ Done

**Goal:** Build the awwwards-grade shell per section 1.2: layout, hero carousel, header/footer, PWA-ready app shell (PWA config itself finalized in Phase 13).

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md`, especially section 1.2, before starting. Build the public site's root layout and footer (present on every page), and the `/` page's hero section: a full-viewport carousel (Framer Motion or a lightweight carousel lib) cycling dummy motion/video clips and images, with a simultaneous English display title and Arabic title rendered together with real typographic care — correct Arabic web font, RTL-correct rendering for the Arabic string specifically (the rest of the site stays LTR), matching visual weight/baseline between the two scripts, not just two `<h1>`s stacked. Use dummy video/image assets for now (clearly marked as placeholders to swap later, per spec). Apply the dark/light section rhythm and asymmetric editorial grid direction from section 1.2 as the base page template that later public-site phases will slot content into.

**Deliverables:** Public shell + hero, responsive, PWA-shell-ready.

**Acceptance Checklist:**
- [ ] Arabic title renders correctly RTL-shaped, properly spaced, visually paired with the English title (not an afterthought)
- [ ] Hero carousel auto-advances and is swipeable on mobile
- [ ] Layout holds up at mobile/tablet/laptop breakpoints
- [ ] Footer present across all routes once other pages exist

---

### Phase 10 — Public Live Sections (Point Race, Talent Race, Ongoing Programs)
**Status:** ✅ Done

**Goal:** The "data-as-spectacle" realtime sections on `/`.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Build three sections on `/`, each backed by real (or seeded dummy) data and updating live via the Phase 6 socket events (specifically `points:updated`, which should be emitted from the Results publish flow in addition to the announcement events): (1) Live group point race — an animated horizontal bar/leaderboard race chart, groups reordering with spring motion as points change. (2) Live "Artistic Talent" race — computed leaderboards for overall-best, best-sub-junior, best-junior, best-senior students by points, presented as a tabbed or segmented section. (3) Ongoing programs — a live list of competitions with `status: started`, showing name + current stage (e.g. "English Poem Reciting — Stage 1"), updating when admins change status/stage.

**Deliverables:** Three realtime public sections wired to socket + REST fallback (initial load via REST, then socket for deltas).

**Acceptance Checklist:**
- [ ] Bars/leaderboard reorder with animation, not an instant snap, when points change
- [ ] All four talent-race tabs (overall/sub-junior/junior/senior) compute correctly from student points+category
- [ ] Ongoing programs list updates live when an admin starts/ends a competition or changes its stage, no refresh needed

---

### Phase 11 — Public Static/Informational Sections
**Status:** ✅ Done

**Goal:** Remaining `/` sections: posters gallery, coordinators, about, event-count analytics, group intro.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Build, in order on `/`: a creative poster gallery pulling from the Phase 7 Posters API (masonry/creative grid with hover motion per section 1.2); a coordinators section with hard-coded dummy data (name, role, photo) per spec; an about-the-program section (dummy copy for now); an event-count analytics strip (e.g. "3 Teams", "120+ Events" — pull real counts from backend where possible: team count from Groups, event count from Competitions, rather than hard-coding, since that data already exists by this phase); a group-introduction section pulling real Groups data (logo/initial, name, short stat).

**Deliverables:** Remaining home-page sections.

**Acceptance Checklist:**
- [ ] Event-count numbers are computed from real backend data, not hard-coded, wherever the underlying data already exists
- [ ] Poster gallery hover/motion matches the section 1.2 grammar (not a static grid)
- [ ] Coordinators section clearly uses placeholder/hard-coded data as specified

---

### Phase 12 — Public Results, Groups, and Participants Pages
**Status:** ✅ Done

**Goal:** The three dedicated public listing/detail routes.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Build: `/results` — list of all **published** results only (draft results must never be visible publicly), search/filter/sort/pagination consistent with the rest of the platform (reuse the same debounce/filter/sort/pagination pattern used in admin, backed by public read-only endpoints), each item opens a detail modal or `/results/:id` route showing full winner breakdown. `/groups` — full group listing (logo/initial, points, member count) with a detail view showing members and leaders. `/participants` — full student listing with search/filter (by group/category), each opening `/participants/:id` showing personal details, competitions entered, results, and total points. Both list pages should visually reuse the ProfileCard/ResultCard building blocks established in section 1.2 rather than introducing new one-off card designs.

**Deliverables:** Three public pages + two detail routes, fully backend-search/filter/sort/paginated.

**Acceptance Checklist:**
- [ ] `/results` never shows unpublished/draft results even via direct API inspection
- [ ] All three pages use the same search/filter/sort/pagination interaction pattern as admin (component reuse, not reinvention)
- [ ] Detail routes are directly linkable/shareable (`/results/:id`, `/participants/:id`) and load correctly on hard refresh

---

### Phase 13 — Responsiveness, PWA & Global Search Audit
**Status:** ✅ Done

**Goal:** Cross-cutting hardening pass across the whole app.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Do a full pass: (1) Configure the public app as an installable PWA (manifest with icons, theme colors matching the design system, service worker with a sensible caching strategy — cache-first for static/media assets, network-first for API calls — do not aggressively cache live data like point standings). Admin panel does not need to be a PWA per spec, only the public side. (2) Audit every list/table across both admin and public (competitions, groups, students, results, posters, gallery, public results/groups/participants) and confirm each one uses the shared debounced-search + filter + sort + backend-pagination pattern from Phase 1 — fix any page that drifted into ad-hoc/client-side filtering. (3) Full responsive pass at mobile/tablet/laptop breakpoints on every route in both admin and public, fixing overflow, tap-target sizing, and drawer/modal behavior on small screens.

**Deliverables:** PWA-ready public app, consistent search/filter/sort/pagination everywhere, verified responsiveness.

**Acceptance Checklist:**
- [ ] Public site installable as a PWA on Android/iOS/desktop Chrome, works offline for previously-visited static content
- [ ] Every single list view in the app (enumerate them) confirmed to hit backend for search/filter/sort/pagination — no exceptions
- [ ] Manual device-width testing (or responsive dev tools) passes on every route at 375px, 768px, and 1440px+

---

### Phase 14 — Deployment
**Status:** ✅ Done

**Goal:** Ship to Vercel (frontend) + Render (backend) with production-correct config.

**Agent Prompt:**
> Re-read `requirements.md` and `plan.md` before starting. Prepare production configs: backend `Dockerfile`/Render build settings, environment variables set on Render matching section 4 with `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none`; frontend `vercel.json`/build settings with `VITE_API_URL` and `VITE_SOCKET_URL` pointed at the live Render URL; confirm CORS `ORIGINS` on the backend includes the live Vercel domain; verify Socket.IO works cross-origin in production (CORS config on the gateway itself, not just REST); smoke-test the full login → admin action → public realtime update loop against the live deployed URLs, not localhost.

**Deliverables:** Live frontend + backend, verified end-to-end in production.

**Acceptance Checklist:**
- [ ] Admin login works on the live Vercel URL against the live Render API (cross-site cookie confirmed working)
- [ ] Socket connection succeeds cross-origin in production
- [ ] A publish action in the live admin panel triggers a live realtime update on the live public site

---

### Phase 15 — Final Parity Audit
**Status:** ✅ Done

**Goal:** Line-by-line re-check of `requirements.md` against the shipped product before calling it done.

**Agent Prompt:**
> Re-read `requirements.md` line by line and, for every single requirement in it, state explicitly whether it is (a) fully implemented, (b) implemented differently than specified and why, or (c) missing — do not summarize or skip any line, including seemingly minor ones like the exact star-rating convention, the leader-array ordering convention, or the confirmation-modal requirement on every admin action. Produce this as a checklist in a `PARITY.md` file. Fix any gaps found before considering the project complete.

**Deliverables:** `PARITY.md` — the final proof of 100% requirement coverage.

**Acceptance Checklist:**
- [ ] Every bullet in the original spec has a corresponding line in `PARITY.md`
- [ ] No item marked "missing" remains unresolved

---

## 6. Working Notes for Using This With Antigravity

- Feed **one phase at a time**. Antigravity (like most agentic coding tools) degrades in accuracy over very long single sessions — smaller, checkpointed phases with explicit re-grounding on `requirements.md` produce far more faithful output than one giant prompt.
- After each phase, **manually run the Acceptance Checklist yourself** before telling the agent to proceed — don't trust the agent's own "done" claim without checking.
- Update the `Status` field (☐ Not started / ◐ In progress / ✅ Done) at the top of each phase as you go — this file doubles as your project tracker.
- If the agent ever proposes silently changing a modeled field, a route, or a UX flow from what's written here, stop and correct the plan file first, then re-prompt — keep `plan.md` as the always-current single source of truth, not just a one-time brief.
- Consider committing after every phase passes its checklist, so you always have a rollback point if a later phase's agent edits regress something earlier.

## 7. Design-Reference Caveat

The Dribbble shot and Awwwards site referenced in the original spec could not be pixel-inspected directly by this planning pass (Dribbble shots are client-rendered and not scrapable; Awwwards.com is a curated index of many sites, not a single design). Section 1 translates both into concrete, buildable design rules based on the genre conventions those references clearly point to. Before Phase 2 (admin shell) and Phase 9 (public hero), it's worth personally opening both links once, screenshotting anything you specifically want matched pixel-for-pixel (a color, a specific card shape, a specific animation), and pasting that detail directly into the relevant phase prompt so the agent has a concrete visual target rather than only a written description.
