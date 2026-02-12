# Decantd — AI-Powered Wine Tasting Planner

## 1. Project Overview

**App name:** Decantd
**Phase:** 1 (MVP)
**Scope:** AI-powered wine tasting plan generator — users describe their occasion, food, preferences, budget, and desired wine count; an AI sommelier returns a curated, ordered tasting plan with flavor profiles, pairing rationales, and tasting tips.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + App Router (Turbopack dev) |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + wine design tokens in `theme.css` |
| State | Zustand 5 (`createWithEqualityFn` + `persist` + `shallow`) |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Data Fetching | TanStack React Query v5 |
| AI | Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) |
| UI Components | Radix UI primitives, Lucide icons |
| Animations | Motion (framer-motion) |
| Charts | Recharts (RadarChart) |
| Toast | Sonner |
| Drawer | Vaul |
| Package Manager | pnpm (v10.6.5) |

---

## 2. Architecture & Key Patterns

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # App shell layout group (Header + BottomNav)
│   │   ├── dashboard/page.tsx    # Placeholder — "Coming in Phase 2"
│   │   ├── tasting/
│   │   │   ├── [id]/page.tsx     # View generated tasting plan
│   │   │   └── new/page.tsx      # 6-step tasting wizard
│   │   └── layout.tsx            # AppShell wrapper
│   ├── api/tasting/
│   │   ├── [id]/route.ts         # GET — fetch plan by ID
│   │   └── generate/route.ts     # POST — generate plan via AI
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── manifest.ts              # PWA manifest
│   ├── global-error.tsx         # Error boundary
│   └── not-found.tsx            # 404
├── common/
│   ├── components/              # Shared UI (AppShell, Badge, Button, Card, Dialog,
│   │                            #   Drawer, FlavorRadar, Input, Progress, Slider,
│   │                            #   Toast, WineCard)
│   ├── constants/
│   │   ├── environment.ts       # isDevEnvironment flag
│   │   ├── queryKeys.ts         # React Query key factory
│   │   └── wine.const.ts       # Occasions, regions, budget presets
│   ├── db/
│   │   ├── migrations/0001_initial.sql
│   │   ├── client.ts            # D1 client helper
│   │   └── schema.ts            # Drizzle schema
│   ├── fonts/index.ts           # Playfair Display + Source Sans 3
│   ├── functions/cn.ts          # clsx + extendTailwindMerge
│   ├── hooks/services/useTastingPlan.ts  # React Query hook
│   ├── providers/QueryProvider.tsx
│   ├── services/tasting-api.ts  # API client
│   ├── stores/useTastingStore.ts # Wizard state (Zustand + localStorage)
│   ├── styles/main.css          # Tailwind imports + @theme tokens
│   ├── types/
│   │   ├── tasting.ts           # TastingPlan, TastingPlanInput
│   │   └── wine.ts              # WineRecommendation, FlavorProfile, WineType, Occasion
│   └── utils/cloudflare.ts      # getCloudflareContext wrapper
├── modules/
│   ├── Landing/LandingHero.tsx          # Hero + "How It Works" 3-step
│   ├── TastingPlan/
│   │   ├── FlavorProfileCard.tsx
│   │   ├── PairingRationale.tsx
│   │   ├── SharePlan.tsx                # Web Share API + clipboard fallback
│   │   ├── TastingPlanView.tsx          # Full plan view with wine timeline
│   │   └── WineRecommendation.tsx       # Animated wine card wrapper
│   └── TastingWizard/
│       ├── steps/
│       │   ├── OccasionStep.tsx          # Step 1: 6 occasion cards
│       │   ├── FoodStep.tsx              # Step 2: free-text + 11 suggestion chips
│       │   ├── PreferencesStep.tsx       # Step 3: "Surprise me!" toggle + 12 region chips
│       │   ├── BudgetStep.tsx            # Step 4: 4 presets + dual-thumb slider ($5–$200)
│       │   ├── CountStep.tsx             # Step 5: +/- counter (1–8) with wine glass icons
│       │   └── ReviewStep.tsx            # Step 6: summary card + "Generate My Plan"
│       ├── TastingWizard.tsx            # Step router
│       └── WizardProgress.tsx           # Progress bar (Step X of 6)
└── server/ai/
    ├── prompts/tasting-plan.ts          # System + user prompt templates
    └── generate-plan.ts                 # Anthropic API call + Zod validation
```

### Core Patterns

- **Dual-env API access:** `isDevEnvironment` → `process.env` locally, `getCloudflareContext().env` on Cloudflare Workers
- **Zustand stores:** `createWithEqualityFn` + `persist` middleware + `shallow` equality (requires `use-sync-external-store` peer dep)
- **Component convention:** `ComponentName/ComponentName.tsx` + `index.ts` barrel
- **cn() utility:** `clsx` + `extendTailwindMerge` with custom class groups for wine design tokens
- **Font loading:** `next/font/google` with `.variable` CSS class pattern, applied on `<html>`
- **CSS theming:** `@theme {}` blocks in `main.css` for Tailwind v4 extension
- **Validation:** Zod schemas on both API input (route handler) and AI output (structured JSON)
- **Animations:** Motion (framer-motion) with staggered delays on plan view cards

### Data Flow

```
Wizard UI → Zustand (persisted to localStorage)
         → API POST /api/tasting/generate
         → System prompt + user prompt → Claude Sonnet 4.5 → Structured JSON
         → Zod validation → D1 insert (tasting_plans + tasting_plan_wines)
         → Redirect to /tasting/[id]
         → React Query GET → TastingPlanView (timeline + FlavorRadar charts)
```

### D1 Schema (2 tables)

**`tasting_plans`** — 14 columns: id, occasion, food_pairing, region_preferences (JSON), budget_min, budget_max, budget_currency, wine_count, generated_plan (JSON), title, description, is_public, created_at, updated_at

**`tasting_plan_wines`** — 19 columns: id, plan_id (FK), varietal, region, sub_region, year_range, acidity, tannin, sweetness, alcohol, body, description, pairing_rationale, flavor_notes (JSON), tasting_order, estimated_price_min, estimated_price_max, wine_type, created_at

### Key Files Reference

| Purpose | File |
|---|---|
| Wizard state & step order | `src/common/stores/useTastingStore.ts` |
| AI system prompt | `src/server/ai/prompts/tasting-plan.ts` |
| AI generation (API call) | `src/server/ai/generate-plan.ts` |
| Plan generation route | `src/app/api/tasting/generate/route.ts` |
| Wine constants (occasions, regions) | `src/common/constants/wine.const.ts` |
| FlavorRadar chart | `src/common/components/FlavorRadar/FlavorRadar.tsx` |
| Zustand store | `src/common/stores/useTastingStore.ts` |
| Drizzle schema | `src/common/db/schema.ts` |
| D1 migration | `src/common/db/migrations/0001_initial.sql` |
| Cloudflare config | `wrangler.toml` |

---

## 3. Current Feature Inventory (Phase 1)

| Feature | Status | Notes |
|---|---|---|
| Landing page with CTA | ✅ Done | Hero + 3-step "How It Works" + "Create Your Tasting Plan" CTA |
| 6-step tasting wizard | ✅ Done | Occasion → Food Pairing → Preferences → Budget → Wine Count → Review |
| AI plan generation (Claude Sonnet 4.5) | ✅ Done | Structured JSON output, Zod-validated, lightest-to-boldest ordering |
| Plan view with wine timeline | ✅ Done | Vertical timeline, FlavorRadar charts, flavor notes, pairing rationale, tasting tips (collapsible), estimated total cost |
| Share via Web Share API / clipboard | ✅ Done | Fallback to clipboard with toast confirmation |
| D1 persistence (plans + wines) | ✅ Done | 2 tables, 33 columns total |
| Wizard state persistence (localStorage) | ✅ Done | 8 fields persisted via Zustand `persist` — resume mid-wizard |
| "Surprise me" region toggle | ✅ Done | Clears region prefs, tells AI to pick diverse global selection |
| Bottom nav shell | ⚠️ Partial | Home + New (elevated primary) active; Explore, Social, Profile disabled (50% opacity) |
| Dashboard | ⚠️ Placeholder | Wine glass icon + "Coming in Phase 2 — track your tastings, earn XP, and level up" |
| PWA manifest | ✅ Done | `manifest.ts` for installability |

---

## 4. Wine Folly Alignment Audit

Wine Folly is the gold standard for accessible wine education. This audit maps their core methodology against Decantd's current implementation.

| Wine Folly Principle | Decantd Implementation | Rating |
|---|---|---|
| **Tasting order (light → bold)** | AI system prompt enforces lightest-to-boldest ordering. Timeline UI visualizes the progression with numbered dots. | ✅ Strong |
| **5 dimensions of wine** (acidity, tannin, sweetness, alcohol, body) | FlavorRadar chart maps all 5 on a 0–5 scale per wine. Color-coded by wine type (red/white/rosé/sparkling). | ✅ Strong |
| **Food pairing logic** | AI generates a `pairingRationale` explaining why each wine works with the chosen food. Displayed per wine card. | ✅ Present |
| **Regional education** | 12 popular regions with flag emojis for selection, but zero educational content about what makes each region distinct (terroir, climate, signature grapes). | ⚠️ Surface-level |
| **Varietal knowledge** | Wine varietal names and descriptions shown, but no deeper education (grape characteristics, climate preferences, common blends). | ⚠️ Gap |
| **Visual tasting (color/clarity)** | Not addressed. Wine Folly's tasting method starts with visual inspection — color depth, clarity, viscosity. | ❌ Missing |
| **Aroma/nose guidance** | Not addressed. Wine Folly emphasizes identifying aromas before tasting — fruit, floral, earth, oak. | ❌ Missing |
| **"How to Taste" method** (Look → Smell → Taste → Think) | Not implemented as a guided flow. Users receive wines but no structured tasting methodology. | ❌ Missing |
| **Serving temperature & glassware** | Not included in wine recommendations. Wine Folly emphasizes correct serving temp and glass shape. | ❌ Missing |

**Key insight:** Decantd nails the *selection* side of Wine Folly (ordering, dimensions, pairing) but completely misses the *tasting experience* side (how to actually taste, what to look for, how to develop your palate).

---

## 5. Octalysis Framework Audit

Yu Kai Chou's Octalysis framework identifies 8 core drives that motivate human behavior. This audit evaluates how Decantd activates each drive and identifies gaps.

### CD1 — Epic Meaning & Calling
*"Why should I care? Am I part of something bigger?"*

- **Current:** Minimal. Landing page positions the app as a convenience tool ("AI-powered tasting plans... in seconds"). No narrative framing.
- **Gap:** No sense of joining a community, no personal growth narrative ("Become a confident wine host"), no mission beyond utility.
- **Opportunity:** Onboarding story, community mission statement, "wine journey" framing, progression narrative.

### CD2 — Development & Accomplishment
*"Am I making progress? Am I getting better?"*

- **Current:** Wizard progress bar (Step X of 6). That's it.
- **Gap:** No XP, no levels, no tasting history, no skill progression, no achievements, no badges. Dashboard is a placeholder. Users generate a plan and nothing accumulates.
- **Opportunity:** Tasting journal, XP system, varietal/region badges, "palate level" progression, streak tracking, completion stats.

### CD3 — Empowerment of Creativity & Feedback
*"Can I express myself and see results?"*

- **Current: STRONG.** The wizard lets users customize 5 dimensions (occasion, food, regions, budget, count). The AI responds with a unique, personalized plan. FlavorRadar provides rich visual feedback. Tasting tips add educational value.
- **Strength:** This is the app's strongest drive. The wizard → AI → personalized result loop is genuinely satisfying.
- **Gap:** No ability to rate wines, adjust the plan post-generation, swap wines, add personal notes, or customize after creation.

### CD4 — Ownership & Possession
*"Do I own something I want to grow?"*

- **Current:** Weak. Plans are generated and stored in D1, but users have no visible collection, profile, or personal history.
- **Gap:** No "My Tastings" collection, no wine cellar tracker, no saved favorites, no personal flavor profile that evolves over time.
- **Opportunity:** Tasting journal, personal wine collection, flavor preference profile that improves AI recommendations, wine wishlist.

### CD5 — Social Influence & Relatedness
*"Am I connected to others?"*

- **Current:** Share button exists (Web Share API with clipboard fallback). Social tab is disabled in bottom nav.
- **Gap:** No user accounts, no profiles, no following, no comments, no community plans, no "see what others are drinking." Sharing is outbound-only with no social loop back into the app.
- **Opportunity:** Public plan gallery, comments/ratings on shared plans, "trending wines," collaborative tasting events, follow system.

### CD6 — Scarcity & Impatience
*"Is there urgency or exclusivity?"*

- **Current:** None. Everything is available immediately, unlimited, no constraints.
- **Gap:** No limited-time recommendations, no seasonal suggestions, no "rare find" highlights, no premium tier.
- **Opportunity:** Seasonal wine spotlights, "wine of the week," limited-edition themed tastings (holiday, harvest season), early access to new features.

### CD7 — Unpredictability & Curiosity
*"What happens next?"*

- **Current: MODERATE.** The "Surprise me!" toggle for regions is the strongest expression. The AI generation itself is inherently unpredictable — you don't know what wines you'll get. The moment between "Generate" and seeing results is genuinely exciting.
- **Gap:** No ongoing discovery loop. Once you see the plan, curiosity is satisfied with no hook to return.
- **Opportunity:** "Discovery mode" with mystery wines, daily wine facts, "try something you've never had" challenges, randomized educational content.

### CD8 — Loss & Avoidance
*"What might I lose?"*

- **Current:** Wizard state persistence prevents losing progress mid-wizard. That's it.
- **Gap:** No streaks to maintain, no expiring rewards, no "don't miss this seasonal wine" urgency, no invested progress at risk.
- **Opportunity:** Tasting streaks, expiring seasonal plans, progress milestones at risk of resetting.

---

## 6. Octalysis Balance Assessment

```
              CD1 (Epic Meaning)
                   ●○○○○

     CD8 /                     \ CD2 (Accomplishment)
    ●○○○○                       ●○○○○
         |                     |
   CD7   |      DECANTD       | CD3
  ●●●○○  |     Phase 1        | ●●●●○
         |                     |
     CD6 \                     / CD4
    ○○○○○                       ●○○○○

              CD5 (Social)
                   ●●○○○
```

**Scores:**
| Core Drive | Score | Notes |
|---|---|---|
| CD1 — Epic Meaning | 1/5 | Convenience positioning only |
| CD2 — Accomplishment | 1/5 | Wizard progress bar only |
| CD3 — Creativity & Feedback | 4/5 | **Strongest drive** — wizard customization + AI personalization |
| CD4 — Ownership | 1/5 | No visible collection or personal profile |
| CD5 — Social | 2/5 | Outbound share only, no social loop |
| CD6 — Scarcity | 0/5 | Nothing scarce or time-limited |
| CD7 — Curiosity | 3/5 | "Surprise me" + AI unpredictability |
| CD8 — Loss Avoidance | 1/5 | Wizard persistence only |

**Diagnosis:** The app is heavily weighted toward CD3 (Creativity/Feedback) with moderate CD7 (Curiosity). The left-brain drives (CD2 Accomplishment, CD4 Ownership) and social drives (CD1, CD5) are nearly absent. This creates a **"one-and-done" usage pattern** — users create a plan, enjoy it, but have no reason to return.

**The retention problem:** Without accumulation (CD4), progression (CD2), or social loops (CD5), there's no compounding value. Each session is independent. The app needs to shift from a *tool* to a *platform* where value grows over time.

---

## 7. Strategic Priorities (Phase 2 Roadmap Themes)

Prioritized by retention impact, informed by Octalysis gaps:

### Priority 1: CD4 Ownership → Tasting Journal & Wine Collection
Give users something that accumulates and belongs to them. "My Tastings" history, personal flavor profile, wine wishlist. This is the foundation for all other engagement loops — without ownership, there's nothing to progress toward, share, or lose.

### Priority 2: CD2 Accomplishment → Progress & Achievement System
XP earned from tastings completed, wines tried, regions explored. Levels that unlock (e.g., "Curious Sipper" → "Emerging Palate" → "Confident Host"). Badges for milestones (first red, first sparkling, all 12 regions, etc.). Visible stats on dashboard.

### Priority 3: CD5 Social → Public Plans & Community
Public plan gallery. Browse, like, and comment on others' plans. "Trending wines this week." Follow other tasters. Collaborative tasting events ("host a tasting with friends"). This closes the social loop — sharing leads back into the app.

### Priority 4: CD1 Epic Meaning → Wine Journey Narrative
Reframe the experience as personal growth. Onboarding narrative ("Begin your wine journey"). Progress milestones feel meaningful ("You've explored 6 of 12 regions"). Community framing ("Join 1,000 curious tasters").

### Priority 5: CD7 Curiosity → Discovery & Education Loop
Wine Folly-style education integrated into the tasting experience. "Look → Smell → Taste → Think" guided flow. Region deep-dives. Varietal profiles. Daily wine facts. "Mystery wine" challenge mode. This turns the app into a learning platform, not just a recommendation engine.

### Priority 6: CD6 Scarcity → Seasonal & Limited Content
Seasonal wine spotlights (rosé season, harvest specials). "Wine of the week" featured selections. Limited-edition themed tastings (holiday, regional harvest). Time-limited challenges that create urgency to engage.

---

## 8. Development Guidelines

### Commands
```bash
pnpm dev              # Start dev server (port 5173, Turbopack)
pnpm build            # Production build
pnpm deploy           # Build + deploy to Cloudflare Workers
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate:local # Apply migrations to local D1
```

### Conventions
- **Git workflow:** Always commit and push after completing work
- **Package manager:** Always `pnpm`, never `npm` or `yarn`
- **Components:** `ComponentName/ComponentName.tsx` + `index.ts` barrel export
- **State:** Zustand with `createWithEqualityFn` + `persist` + `shallow`
- **Styling:** Tailwind v4 with wine design tokens in `@theme {}` blocks in `main.css`
- **API routes:** Dual-env pattern — `process.env` in dev, `getCloudflareContext().env` deployed
- **Validation:** Zod schemas on API input AND AI output
- **Animations:** Motion (framer-motion) with consistent staggered delays
- **Fonts:** Playfair Display (display/headings), Source Sans 3 (body)
- **Icons:** Lucide React

### Environment Variables
- `ANTHROPIC_API_KEY` — Required for AI generation
- `NEXT_PUBLIC_ENV` — `development` | `staging` | `production`

### D1 Database Bindings
- Dev: `decantd-db-dev`
- Staging: `decantd-db-staging`
- Production: `decantd-db-prod`
