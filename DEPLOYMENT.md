# Deployment — iqraquest.org

Everything needed to put this site on the domain, keep it there, and
undo a bad release. Written to still make sense in a year.

---

## 1. Architecture

```
  your machine / Claude
          │
          │  git push
          ▼
  GitHub — UPASCO/iqraquest-website        ← the source of truth
          │
          │  push to main triggers .github/workflows/deploy.yml
          ▼
  GitHub Actions
    npm ci → lint → typecheck → test → next build → verify-export
          │
          │  uploads out/ as a Pages artifact
          ▼
  GitHub Pages  (CDN + free TLS certificate)
          │
          │  DNS: 4 A records + one CNAME, hosted at OVHcloud
          ▼
  https://iqraquest.org
```

Three things are worth stating plainly, because they are the source of
most confusion later:

- **OVHcloud stays the registrar and the DNS host.** The domain is not
  transferred anywhere. OVH answers "where does iqraquest.org live?";
  GitHub answers "here are the bytes".
- **The site is a static export.** `next build` writes plain HTML, CSS
  and JavaScript to `out/`. There is no server, no database and no
  runtime secret. Anything the site knows, a visitor can read.
- **Mail and web are separate services on the same domain.** The MX,
  SPF, DKIM and DMARC records route `support@iqraquest.org`. The A and
  CNAME records route the website. Changing the second must never touch
  the first.

---

## 2. First deployment

### Step 1 — GitHub Pages (three settings, once)

GitHub Pages is free for **public** repositories. Serving Pages from a
*private* repository requires a paid GitHub Pro or Team plan. The
repository is currently private, so pick one:

- make the repository **public** (free), or
- upgrade the account to **GitHub Pro** and leave it private.

Publishing the code does not publish the rights: `LICENSE` is an
all-rights-reserved notice, and the repository contains no secrets by
construction (see §6).

Then, in the repository:

1. **Settings → Pages → Build and deployment → Source**: choose
   **GitHub Actions**.
2. **Settings → Pages → Custom domain**: type `iqraquest.org`, press
   **Save**. GitHub will report "domain not verified" until DNS is in
   place — expected at this point.
3. Leave **Enforce HTTPS** unticked for now. It becomes available once
   the certificate is issued (step 3).

### Step 2 — DNS at OVHcloud

Open the OVH manager → **Domaines → iqraquest.org → Zone DNS**.

The zone as it stands today points the website at OVH's own parking
address, `213.186.33.5`. Four records change; every mail record stays
exactly as it is.

#### Records to change

| Sous-domaine | Type | Valeur actuelle | Action | Nouvelle valeur | Raison |
|---|---|---|---|---|---|
| `@` | A | `213.186.33.5` | **Modifier** | `185.199.108.153` | Points the apex at GitHub Pages instead of OVH parking |
| `@` | A | — | **Ajouter** | `185.199.109.153` | Second GitHub Pages address (redundancy) |
| `@` | A | — | **Ajouter** | `185.199.110.153` | Third GitHub Pages address |
| `@` | A | — | **Ajouter** | `185.199.111.153` | Fourth GitHub Pages address |
| `www` | A | `213.186.33.5` | **Supprimer** | — | A CNAME cannot coexist with an A record on the same name |
| `www` | CNAME | — | **Ajouter** | `upasco.github.io.` | GitHub then creates the `www` → apex redirect itself |
| `@` | TXT | `"1\|www.iqraquest.org"` | **Supprimer** | — | Internal marker of the OVH redirect/parking service, now false |
| `www` | TXT | `"3\|welcome"` | **Supprimer** | — | Marker of the OVH parking page |
| `ftp` | CNAME | `iqraquest.org.` | **Supprimer** (optional) | — | Served the OVH hosting FTP; meaningless once the site is on Pages |

> The four `185.199.10x.153` addresses are GitHub's published apex
> addresses for Pages. If GitHub's documentation ever lists different
> ones, **the documentation wins over this table** — check
> [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

#### Records to keep — do not touch

| Sous-domaine | Type | Valeur | Why it must stay |
|---|---|---|---|
| `@` | NS | `dns200.anycast.me.`, `ns200.anycast.me.` | OVH's name servers. Removing them takes the whole domain offline. |
| `@` | MX | `1 mx1.mail.ovh.net.` | **Mail.** Required for `support@iqraquest.org`. |
| `@` | MX | `5 mx2.mail.ovh.net.` | **Mail.** |
| `@` | MX | `100 mx3.mail.ovh.net.` | **Mail.** |
| `@` | SPF | `v=spf1 include:mx.ovh.com -all` | **Mail.** Authenticates outgoing mail; deleting it sends your mail to spam. |
| `_dmarc`, `*._domainkey`, `autodiscover`, `mail`, … | TXT / CNAME / SRV | (whatever exists) | **Mail.** DKIM, DMARC and client autodiscovery. |

**Scroll the zone to the very end before editing.** Anything related to
mail — `_dmarc`, `_domainkey`, `autodiscover`, `imap`, `pop3`, `smtp` —
is kept, whatever it looks like.

#### Optional: verify the domain with GitHub

Domain verification stops anyone else pointing a GitHub Pages site at
`iqraquest.org` if the DNS ever leaks. In GitHub: **Settings → Pages →
Add a domain**, then add the `_github-pages-challenge-UPASCO` TXT
record it gives you to the OVH zone. Purely additive — it touches
nothing else.

### Step 3 — HTTPS

DNS propagation takes anywhere from a few minutes to a few hours. Once
GitHub's Pages settings show the domain as verified, tick **Enforce
HTTPS**. GitHub issues and renews a Let's Encrypt certificate for both
`iqraquest.org` and `www.iqraquest.org` at no cost.

Then confirm all four of these end at `https://iqraquest.org`:

```bash
curl -sIL http://iqraquest.org       | grep -iE '^(HTTP|location)'
curl -sIL http://www.iqraquest.org   | grep -iE '^(HTTP|location)'
curl -sIL https://www.iqraquest.org  | grep -iE '^(HTTP|location)'
curl -sI  https://iqraquest.org      | head -1     # expect 200
```

---

## 3. Subsequent deployments

```bash
git add -A
git commit -m "feat: …"
git push -u origin main
```

That is the whole process. The push triggers `deploy.yml`, which runs
lint, typecheck, the message-catalogue parity tests, the build and
`scripts/verify-export.mjs` before publishing. If any gate fails,
**nothing is deployed** and the live site keeps serving the previous
build.

Work on a branch and open a pull request to get `ci.yml` to run the same
gates without touching production.

---

## 4. Rollback

Three routes, cheapest first.

**A — redeploy a previous commit (no history rewrite).** The safest and
usually the right one.

```bash
git revert --no-edit <bad-commit-sha>
git push origin main
```

**B — re-run an older successful deployment.** Repository → **Actions →
Deploy to GitHub Pages** → open the run that was good → **Re-run all
jobs**. This rebuilds that commit and republishes it. Nothing in git
changes.

**C — reset the branch.** Only when the last few commits must go and
nobody else has pulled them.

```bash
git reset --hard <good-commit-sha>
git push --force-with-lease origin main
```

`--force-with-lease`, never `--force`: it refuses if someone else has
pushed in the meantime.

**Recovery time** in every case is one Actions run — roughly two to
three minutes — plus CDN cache expiry.

---

## 5. Environment variables

The site reads its configuration at **build** time, so a variable change
requires a redeploy to take effect. Set them in the repository under
**Settings → Secrets and variables → Actions → Variables** (the
*Variables* tab, not *Secrets* — none of these are secret, and
`deploy.yml` reads them from `vars`).

| Variable | Purpose | Value today |
|---|---|---|
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Address shown on /support, /contact, legal pages | `support@iqraquest.org` |
| `NEXT_PUBLIC_APP_AVAILABLE_IOS` | Turns the App Store badge into a link | `false` |
| `NEXT_PUBLIC_APPLE_APP_URL` | App Store listing URL | *(empty)* |
| `NEXT_PUBLIC_APP_AVAILABLE_ANDROID` | Turns the Google Play badge into a link | `false` |
| `NEXT_PUBLIC_GOOGLE_PLAY_URL` | Play listing URL | *(empty)* |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Form relay; empty means the form uses `mailto:` | *(empty)* |
| `NEXT_PUBLIC_SOCIAL_*` | One per platform; empty hides the icon | *(empty)* |

Unset variables are fine — every one of them has a defined behaviour
when absent. See `.env.example`.

### Launch day

Publishing the apps is two variables per store:

```
NEXT_PUBLIC_APP_AVAILABLE_IOS      = true
NEXT_PUBLIC_APPLE_APP_URL          = https://apps.apple.com/app/idXXXXXXXXX
NEXT_PUBLIC_APP_AVAILABLE_ANDROID  = true
NEXT_PUBLIC_GOOGLE_PLAY_URL        = https://play.google.com/store/apps/details?id=com.iqraquest.app
```

Then **Actions → Deploy to GitHub Pages → Run workflow**. Every "coming
soon" badge across all twelve languages becomes a working store link.
Setting the flag without the URL, or the URL without the flag, leaves
the badge disabled on purpose — it is not possible to ship a badge that
links nowhere.

---

## 6. Secrets

There are none, and there is nowhere to put one.

The site is statically exported: every value it reads is compiled into
HTML that any visitor can view. `NEXT_PUBLIC_*` names this out loud.
`.gitignore` excludes every `.env*` file except `.env.example`, which
carries names and no values.

If the site ever needs a real secret — a mail relay key, an analytics
token — it needs a server-side component first (a Cloudflare Worker or
a form relay). Do not put it in a build variable.

---

## 7. Security headers — a known limitation of this host

GitHub Pages serves a fixed set of response headers and offers no way to
add custom ones. The consequences:

| Header | On GitHub Pages | Notes |
|---|---|---|
| `Content-Security-Policy` | **Partial** | Declared by the document via `<meta http-equiv>`; the fetch directives apply. |
| `frame-ancestors` / `X-Frame-Options` | **Not available** | These are header-only; a `<meta>` CSP cannot carry `frame-ancestors`. The site can be framed. |
| `Strict-Transport-Security` | **Not available** | GitHub serves HSTS for `*.github.io` but not for custom domains. "Enforce HTTPS" still redirects. |
| `Referrer-Policy` | **Yes** | Set by `<meta name="referrer">`. |
| `X-Content-Type-Options` | **Yes** | Set by `<meta http-equiv>`. |
| `Permissions-Policy` | **Not available** | Header-only. |

The site holds no session, no cookie, no login and no state, so the
practical exposure is limited to clickjacking of purely informational
pages. If the full header set is wanted later, either:

- put **Cloudflare** (free) in front — proxy the DNS and add a
  Transform Rule with the headers; or
- move the export to a host that sends headers. `public/.htaccess` is
  shipped ready for Apache (an OVH hosting plan) and already contains
  the complete set; GitHub Pages ignores it.

---

## 8. Alternative host — OVH web hosting

The export is host-agnostic. To serve it from the OVH hosting the
domain already points at:

1. `npm run build` — produces `out/`.
2. Upload the **contents** of `out/` to the hosting's `www/` directory
   over SFTP.
3. `public/.htaccess` is copied into `out/` by the build and gives
   Apache the HTTPS redirect, the `www` → apex redirect, the full
   security header set and `ErrorDocument 404 /404.html`.

In this scenario **no DNS change is needed at all** — the existing A
records already resolve to OVH — and the security-header limitation in
§7 disappears.

---

## 9. Troubleshooting

**GitHub Pages shows "Domain's DNS record could not be retrieved".**
DNS has not propagated yet. Check what the world sees:
```bash
dig +short iqraquest.org A
dig +short www.iqraquest.org CNAME
```
The first should list the four `185.199.10x.153` addresses; the second
`upasco.github.io.`. OVH's TTL is 3600 s by default, so allow an hour.

**The site loads but every page is unstyled.** The `.nojekyll` file is
missing from the deployment. Jekyll ignores directories starting with an
underscore, which deletes `/_next`. It is created by `public/.nojekyll`
and checked by `scripts/verify-export.mjs`.

**The custom domain resets to blank after a deploy.** The `CNAME` file
was dropped from the artifact. It lives at `public/CNAME` and is
verified on every build.

**"Enforce HTTPS" is greyed out.** The certificate has not been issued.
It needs correct DNS plus up to 24 hours. Remove and re-add the custom
domain to force a retry.

**A page 404s in one language only.** Run `npm run build && node
scripts/verify-export.mjs` locally — it lists every missing
locale/route pair by name.

**Mail stopped working after the DNS change.** An MX or SPF record was
edited. Restore:
```
@  MX   1    mx1.mail.ovh.net.
@  MX   5    mx2.mail.ovh.net.
@  MX   100  mx3.mail.ovh.net.
@  SPF       v=spf1 include:mx.ovh.com -all
```
and re-add any DKIM/DMARC entries. OVH also offers **Zone DNS → Réinitialiser
la zone**, but that resets the web records too — re-apply §2 afterwards.

**The 404 page is in French for a visitor on `/en/…`.** Expected. A
static host serves one `404.html`, and it is the French one. Every
*existing* page is fully localised; only the unknown-URL page is not.

---

## 10. Go-live checklist

Tick these in order. Anything unticked is a reason not to announce the
site.

### Repository

- [ ] Repository visibility resolved — **public**, or private with
      GitHub Pro (§2, step 1)
- [ ] `main` is the default branch and carries the site
- [ ] `LICENSE` present and all-rights-reserved
- [ ] `README.md` and `DEPLOYMENT.md` present
- [ ] No secret anywhere in the history — `.env*` gitignored except
      `.env.example`, which holds names and no values
- [ ] Latest commit pushed

### CI/CD

- [ ] **Settings → Pages → Source** = *GitHub Actions*
- [ ] The **Deploy to GitHub Pages** workflow has run green on `main`
- [ ] `ci.yml` runs on pull requests
- [ ] Dependabot is enabled (`.github/dependabot.yml`)

### DNS at OVHcloud

- [ ] `@` A → the four `185.199.10x.153` addresses (old `213.186.33.5`
      removed)
- [ ] `www` A record **deleted**
- [ ] `www` CNAME → `upasco.github.io.`
- [ ] `@` TXT `"1|www.iqraquest.org"` deleted
- [ ] `www` TXT `"3|welcome"` deleted
- [ ] **MX ×3 untouched** — `mx1/mx2/mx3.mail.ovh.net.`
- [ ] **SPF untouched** — `v=spf1 include:mx.ovh.com -all`
- [ ] **DKIM untouched** if present
- [ ] **DMARC untouched** if present
- [ ] A test message to `support@iqraquest.org` still arrives

### Domain and TLS

- [ ] **Settings → Pages → Custom domain** = `iqraquest.org`, saved and
      verified
- [ ] **Enforce HTTPS** ticked
- [ ] `https://iqraquest.org` returns 200
- [ ] `http://iqraquest.org` → 301 → `https://iqraquest.org`
- [ ] `http://www.iqraquest.org` → `https://iqraquest.org`
- [ ] `https://www.iqraquest.org` → `https://iqraquest.org`
- [ ] The certificate is valid and covers both names

### The site itself

- [ ] All nine pages load in all twelve languages
- [ ] The language switcher reaches every locale
- [ ] Arabic and Urdu render right-to-left
- [ ] The 404 page renders and is branded
- [ ] `https://iqraquest.org/sitemap.xml` lists 108 URLs with hreflang
- [ ] `https://iqraquest.org/robots.txt` points at the sitemap
- [ ] The favicon and the home-screen icon are the IqraQuest mark
- [ ] Pasting the URL into WhatsApp or Slack unfurls the Open Graph card
- [ ] No horizontal scroll on a 390 px viewport
- [ ] The contact form validates and opens a pre-filled mail draft
- [ ] Keyboard: the skip link is the first tab stop and focus is visible
      throughout

### Store readiness

- [ ] App Store badge shows **Bientôt disponible** and is not a link
- [ ] Google Play badge shows **Bientôt disponible** and is not a link
- [ ] `NEXT_PUBLIC_APP_AVAILABLE_*` are `false`
- [ ] The launch procedure in §5 has been read once, before launch day

### Search

- [ ] `iqraquest.org` added to Google Search Console (domain property,
      verified with a TXT record — additive, touches nothing else)
- [ ] The sitemap submitted there
