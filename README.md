# IqraQuest Website

Official website for **IqraQuest** — the family board game of Islamic
knowledge. Live at **[iqraquest.org](https://iqraquest.org)**.

Not open source. See [`LICENSE`](./LICENSE).

---

## What this is

A statically exported [Next.js](https://nextjs.org) site in twelve
languages, built to present the game, prepare its App Store and Google
Play launch, host its legal documents, and be the page Google returns
for "IqraQuest".

It is deliberately small and boring where it can be: no database, no
API, no analytics, no cookies, no third-party script, no runtime
secret. Everything it knows is compiled into HTML at build time.

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, tokens transposed from the app's design system |
| i18n | `next-intl`, 12 locales, French default |
| Output | Static export (`out/`), no server |
| Hosting | GitHub Pages, deployed by GitHub Actions on push to `main` |
| DNS | OVHcloud (registrar and DNS host — the domain is not transferred) |

---

## Local development

Requires Node 20.9 or later.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build → static export in `out/` |
| `npm start` | Serves the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Message-catalogue parity across all 12 languages |
| `npm run verify` | lint + typecheck + test + build, in that order |
| `npm run routes` | Regenerates the route tree (see *Adding a page*) |
| `npm run assets` | Re-derives web artwork from the app repository |

Run `npm run verify` before pushing. It is the same set of gates CI
runs, so a green local run means a green pipeline.

---

## Environment variables

Every variable is `NEXT_PUBLIC_*` — the site is static, so nothing it
reads can be secret. Copy `.env.example` to `.env.local` for local work.

```bash
cp .env.example .env.local
```

In production they are set as **repository Variables** (Settings →
Secrets and variables → Actions → *Variables*), read by
`.github/workflows/deploy.yml`. Every variable has a defined behaviour
when unset, so an empty configuration builds and deploys fine.

Full table in [`DEPLOYMENT.md`](./DEPLOYMENT.md#5-environment-variables).

**Never commit real values.** `.gitignore` excludes every `.env*` file
except `.env.example`.

---

## Project structure

```
app/
  (default)/        French, served un-prefixed:  /, /game, /knowledge, /privacy …
  (intl)/[locale]/  The other 11 languages:      /en/game, /ar/privacy …
  not-found.tsx     404 (exported as out/404.html)
  sitemap.ts        Multilingual sitemap with hreflang alternates
  robots.ts         robots.txt
  manifest.ts       Web app manifest
components/
  brand/IqraMark    The word اقرأ traced from the app's Naskh face, as SVG
  home/             Homepage sections (hero, brand story, knowledge quest, gameplay …)
  QuestionCard.tsx  A playable question, as the game shows one
  layout/           Header, Footer, LocaleSwitcher, SiteShell
  pages/            The real implementation of every page
  ui/primitives.tsx The design system: Section, Card, Button, Stat …
config/
  site.config.ts    Single source of truth: domain, brand, stores, email
i18n/
  routing.ts        Locales, RTL, hreflang and og:locale maps
  request.ts        next-intl server config
  navigation.ts     Locale-aware Link / router
lib/
  seo.ts            Metadata, canonical, hreflang, JSON-LD builders
  fonts.ts          Self-hosted typefaces
  sample-questions.ts  Real questions from the game's bank, all 12 languages
content/
  sample-questions.json  Extracted verbatim from the app's question files
messages/
  fr.json           The master catalogue — every string starts here
  en.json, ar.json … 11 translations, structurally identical
public/assets/      Web-optimised artwork derived from the app
scripts/
  prepare-assets.mjs  App artwork → AVIF/WebP + icons + OG card
  compose-board.mjs   The board mid-race: real tokens + drawn bonus medallions
  trace-iqra-mark.py  اقرأ → SVG path, shaped with HarfBuzz
  gen-routes.mjs      Generates both route trees
  verify-export.mjs   Post-build check of the exported site
styles/globals.css  Design tokens and base layer
tests/              Catalogue parity tests
```

### Why there are two route trees

The site is statically exported, so there is no middleware to resolve
locales at request time. French is served un-prefixed — the canonical
homepage is `https://iqraquest.org/`, not `/fr/` — which means the
French routes and the prefixed ones must both exist as files.

Rather than maintain eighteen near-identical page files, every page's
real implementation lives in `components/pages/`, and
`scripts/gen-routes.mjs` emits the thin route files that mount it. CI
fails if the committed route files differ from what the generator
produces.

---

## Adding a page

1. Write the component in `components/pages/index.tsx` and export it.
2. Add its copy to `messages/fr.json` under a new namespace, including a
   `title` and a `metaDescription`.
3. Add an entry to the `PAGES` table in `scripts/gen-routes.mjs`.
4. Add the route to `routes` in `lib/seo.ts` so it enters the sitemap.
5. Add it to `ROUTES` in `scripts/verify-export.mjs`.
6. `npm run routes && npm run verify`.
7. Translate the new namespace into the other eleven catalogues —
   `npm test` will tell you exactly which keys are missing.

---

## Internationalisation

Twelve locales, matching the application exactly:

`fr` (default) · `en` · `ar` · `de` · `es` · `id` · `it` · `ms` · `nl` ·
`pt` · `tr` · `ur`

- French is served from the root; every other locale is prefixed.
- `ar` and `ur` render right-to-left and switch to Noto Naskh Arabic.
- There is **no automatic redirect** based on browser language, and no
  locale cookie. URLs are deterministic, which keeps the canonical
  clean and means the site needs no consent banner.
- Every page emits `hreflang` for all twelve plus `x-default`.

### Changing a string

Edit `messages/fr.json`, then make the same change in the other eleven
files. `npm test` enforces that all twelve stay structurally identical —
same keys, same array lengths, same ICU placeholders — so a half-done
translation fails the build rather than shipping literal `{email}` to a
visitor.

### Adding a language

1. Add the code to `locales` in `i18n/routing.ts`, plus its endonym in
   `localeNames` and entries in `hreflangFor` / `openGraphLocale`.
2. Add it to `LOCALES` in `scripts/verify-export.mjs`.
3. Create `messages/<code>.json` from `fr.json`.
4. `npm run routes && npm run verify`.

---

## Adding the App Store / Google Play links

The badges are inert until a listing exists — by construction, not by
convention. A badge becomes a real link only when **both** its
availability flag is `true` **and** its URL is set:

```
NEXT_PUBLIC_APP_AVAILABLE_IOS     = true
NEXT_PUBLIC_APPLE_APP_URL         = https://apps.apple.com/app/id…
NEXT_PUBLIC_APP_AVAILABLE_ANDROID = true
NEXT_PUBLIC_GOOGLE_PLAY_URL       = https://play.google.com/store/apps/details?id=…
```

Set them as repository Variables and re-run the deploy workflow. All
twelve languages update at once. No code change, no copy change.

---

## Updating artwork

The site shows the real product: every image is the game's own asset,
re-encoded for the web. Regenerate them from a checkout of the
application repository:

```bash
IQRAQUEST_APP_DIR=/path/to/IqraQuest npm run assets
```

This writes `public/assets/*` (AVIF + WebP at the sizes the layouts
request), the favicon and Apple touch icon, and composes the 1200×630
Open Graph card. **The outputs are committed**, so the normal build and
CI never need the app repository.

Add or change a piece by editing the `jobs` table in
`scripts/prepare-assets.mjs`. Keep the naming convention —
`hero-*`, `board-*`, `world-*`, `horse-*`, `tile-*`, `prop-*`,
`brand-*` — since asset provenance is part of the story
`/intellectual-property` tells.

---

## Updating legal information

The legal pages are translated copy like everything else, in
`messages/*.json`:

| Page | Namespace |
|---|---|
| `/privacy` | `privacyPage` |
| `/terms` | `termsPage` |
| `/intellectual-property` | `ipPage` |

Two rules when editing them:

- **Bump `updated`** in the same namespace. A legal page whose date does
  not move has not been updated as far as a reader is concerned.
- **Do not introduce `®`.** IqraQuest is used as an unregistered
  trademark; `siteConfig.trademarkMark` is `™`, and
  `scripts/verify-export.mjs` fails the build if `®` reaches the
  homepage. Change this only if and when a registration actually
  completes, and then only for the territories and classes it covers.

The privacy text is kept consistent with the application's own policy in
the app repository (`legal/privacy_policy_*.md`). If one changes, change
both.

---

## Updating social links

The footer renders only platforms with a real URL. Set the relevant
variable to make an icon appear:

```
NEXT_PUBLIC_SOCIAL_TIKTOK / _INSTAGRAM / _YOUTUBE / _FACEBOOK / _X
```

Leave the rest empty. The site never links to a profile that does not
exist.

---

## Deployment

Push to `main`. GitHub Actions runs lint, typecheck, tests, build and a
post-build export verification, then publishes to GitHub Pages. If any
gate fails, nothing deploys and the live site keeps serving the previous
build.

Full procedure — GitHub Pages setup, the exact OVH DNS table, HTTPS,
rollback and troubleshooting — in **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**.

---

## Support

`support@iqraquest.org`
