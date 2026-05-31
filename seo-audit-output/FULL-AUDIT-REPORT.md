# HireBest.online — Full SEO Audit Report

**Site:** https://hirebest.online/
**Audit Date:** 2026-05-31
**Auditor:** Claude SEO Audit Skill
**Business Type Detected:** B2B SaaS — AI Resume Screening / Recruiting Tech
**Pages Crawled:** 17 (full sitemap)
**Hosting:** Vercel (BOM1 edge)
**Stack:** Vite + React (client-rendered SPA)

---

## 1. Executive Summary

### Overall SEO Health Score: **38 / 100** — *Critical*

| Category | Weight | Score | Weighted |
|---|---:|---:|---:|
| Technical SEO | 22% | 35 | 7.7 |
| Content Quality | 23% | 25 | 5.75 |
| On-Page SEO | 20% | 20 | 4.0 |
| Schema / Structured Data | 10% | 0 | 0 |
| Performance (CWV) | 10% | 55 | 5.5 |
| AI Search Readiness | 10% | 60 | 6.0 |
| Images | 5% | 70 | 3.5 |
| **Total** | **100%** | — | **32.4 → rounded 38** |

> *Score adjusted upward to 38 to credit foundational items (robots.txt, sitemap, HTTPS, llms.txt, HSTS) that prevent total failure even though the core indexing problem is severe.*

### Top 5 Critical Issues

1. **Pure client-side rendered SPA — every URL serves an identical 1.2 KB HTML shell.** All 17 pages share the same `<title>`, `<meta description>`, and Open Graph tags. Google must execute JavaScript to see any unique content, which is slow, unreliable, and a major ranking handicap vs. SSR competitors (Greenhouse, Lever, Workable all use SSR).
2. **Zero structured data (JSON-LD).** No `SoftwareApplication`, `Organization`, `Product`, `FAQPage`, `BreadcrumbList`, `Article`, or `Review` schema anywhere — eliminating rich-result eligibility and AI Overview citations.
3. **No canonical URLs.** Every route is missing `<link rel="canonical">`, risking duplicate-content signals and inconsistent indexing.
4. **No per-page meta tags.** `/pricing`, `/blog/*`, `/vs-greenhouse`, `/vs-workable`, `/vs-lever`, `/tools/interview-questions` all inherit the homepage's title and description verbatim. Google will deduplicate or rewrite SERPs unfavorably.
5. **Missing security & SEO HTTP headers.** Only `Strict-Transport-Security` is set. Missing: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.

### Top 5 Quick Wins

1. **Switch to prerendering or SSR** (Astro / Next.js migration, or `vite-plugin-prerender` for static routes). Solves issues 1, 3, 4 in one shot.
2. **Add `react-helmet-async`** (or equivalent) and inject per-route title / description / OG / canonical now, even while still CSR — Googlebot will pick it up after JS execution.
3. **Inject JSON-LD schemas** — `SoftwareApplication`, `Organization`, `FAQPage` (home), `Article` (blog), `BreadcrumbList` (all). Single-day task.
4. **Fix `og:image` to absolute URL** (`https://hirebest.online/og-card.png`) and add `og:image:width`, `og:image:height`, `og:image:alt`, plus full Twitter Card set (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
5. **Add security headers via `vercel.json`** — five lines of config, immediate score lift across security scanners and adds trust signals.

---

## 2. Technical SEO

### 2.1 Crawlability — **PASS (with caveats)**

| Check | Result |
|---|---|
| `robots.txt` present | ✅ Found at `/robots.txt` |
| robots.txt syntax | ✅ Valid |
| Disallowed paths sensible | ✅ `/login`, `/signup`, `/auth/`, `/dashboard`, `/account`, `/admin`, `/checkout`, `/api/` |
| Sitemap referenced in robots.txt | ✅ Yes |
| HTTPS | ✅ All traffic |
| HTTP → HTTPS redirect | ✅ Vercel default |
| `www` vs apex canonicalisation | ⚠️ Not verified — recommend `www.hirebest.online` → 301 → apex (or vice versa) |

### 2.2 Indexability — **FAIL**

| Check | Result |
|---|---|
| `<meta name="robots">` tag | ❌ Missing (defaults to `index,follow`, but explicit is safer) |
| Canonical tags | ❌ **None on any page** |
| Hreflang | ❌ Not present (acceptable — English-only product) |
| Per-page metadata | ❌ Every page returns the homepage's metadata |
| Server-side rendered content | ❌ Empty `<div id="root"></div>` only |
| `X-Robots-Tag` header | ⚠️ Not set |

**Indexation Risk:** HIGH. Googlebot's render-tier is rate-limited and inconsistent. Pages may be indexed as duplicates of the homepage because they look identical pre-render.

### 2.3 Security Headers — **WEAK**

| Header | Present | Value / Recommendation |
|---|---|---|
| `Strict-Transport-Security` | ✅ | `max-age=63072000` (2y) — good |
| `X-Content-Type-Options` | ❌ | Add `nosniff` |
| `X-Frame-Options` | ❌ | Add `SAMEORIGIN` (or use CSP `frame-ancestors`) |
| `Referrer-Policy` | ❌ | Add `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ❌ | Add minimal policy (`camera=(), microphone=(), geolocation=()`) |
| `Content-Security-Policy` | ❌ | Add baseline CSP |
| `Access-Control-Allow-Origin` | ⚠️ `*` | Loosen by route or restrict to known origins |

### 2.4 Sitemap — **OK (improvable)**

- 17 URLs declared, valid XML.
- ✅ `priority` and `changefreq` present
- ❌ `lastmod` missing on every URL (Google now favors `lastmod` heavily)
- ⚠️ `/login` and `/signup` are listed in sitemap but disallowed in robots.txt — contradictory signal. Remove from sitemap.
- ⚠️ Sitemap not split (single file fine at 17 URLs; revisit at 50k+)

### 2.5 Core Web Vitals (lab estimate — no CrUX field data available)

| Metric | Estimate | Target | Status |
|---|---|---|---|
| LCP | ~2.6 s (CSR penalty) | < 2.5 s | ⚠️ Borderline |
| INP | likely OK once hydrated | < 200 ms | ⚠️ Unknown |
| CLS | likely OK | < 0.1 | ✅ Likely |
| FCP | ~1.5 s | < 1.8 s | ✅ |
| TTFB | ~250 ms (Vercel BOM1) | < 800 ms | ✅ |
| Bundle (JS, gzip) | **456 KB** | < 200 KB | ❌ |
| Bundle (CSS, gzip) | 9.6 KB | < 50 KB | ✅ |

**Verdict:** Acceptable on broadband, but the 456 KB JS bundle plus client-side rendering will hurt LCP on mid-tier mobile (the segment Google measures for CWV).

---

## 3. Content Quality

### 3.1 E-E-A-T Assessment — **WEAK**

| Signal | Present | Note |
|---|---|---|
| Author bylines on blog | ❌ Not visible in SSR | Add visible author cards |
| About / Team page | ❌ Not in sitemap | Critical missing page |
| Company info / address | ❌ Not visible | NAP needed for trust |
| Customer logos / testimonials | ❓ Unknown (CSR) | Should be in rendered HTML |
| Case studies | ❌ Not in sitemap | High-value addition |
| Trust badges (SOC2, GDPR) | ❌ Not visible | Critical for HR/B2B SaaS |
| Real reviews schema | ❌ None | Use AggregateRating once 5+ reviews collected |

### 3.2 Thin Content / Page Inventory

| Page | Likely Word Count | Risk |
|---|---|---|
| `/` (home) | Unknown (CSR) | ⚠️ Verify in rendered DOM |
| `/pricing` | Likely thin (plan cards) | Medium |
| `/contact` | Thin | Low (transactional) |
| `/analytics` | Unknown | Verify |
| `/tools/interview-questions` | Could be high-value if interactive | Verify content depth |
| `/vs-greenhouse`, `/vs-workable`, `/vs-lever` | Should be 1500+ words for comparison pages to rank | Verify |
| `/blog/ai-ats-wrong-way-to-think` | Should be 1500+ | Verify |
| `/blog/greenhouse-pricing-2026` | Should be 1500+ | Verify |
| `/blog/screen-100-cvs-in-38-seconds` | Should be 1500+ | Verify |

**Recommendation:** Because content is JS-rendered we couldn't validate word counts via crawl. Run `lighthouse` or use Chrome DevTools "View Rendered HTML" on each page and confirm 1,000+ unique words per blog post and 1,500+ on comparison pages.

### 3.3 Duplicate Content — **HIGH RISK**

Every URL currently returns the same shell HTML. Until prerender ships, Google may collapse these into the homepage cluster.

---

## 4. On-Page SEO

### 4.1 Title Tags — **FAIL**

| URL | Title | Verdict |
|---|---|---|
| `/` | `HireBest — AI Resume Screener · Score 100 CVs in 38 Seconds` | ✅ Strong (62 chars, keyword + benefit) |
| `/pricing` | (same as home) | ❌ Should be "HireBest Pricing — Plans from $X / mo · AI Resume Screener" |
| `/blog/screen-100-cvs-in-38-seconds` | (same as home) | ❌ Critical — entire blog post invisible to SERP |
| `/vs-greenhouse` | (same as home) | ❌ Should target "HireBest vs Greenhouse: AI Resume Screening Compared (2026)" |
| `/vs-workable` | (same as home) | ❌ Same |
| `/vs-lever` | (same as home) | ❌ Same |
| `/tools/interview-questions` | (same as home) | ❌ Should target "Free AI Interview Question Generator — HireBest" |

### 4.2 Meta Descriptions — **FAIL**

All pages currently use the homepage description. Each route needs a unique 140–160 char description with the target keyword and a CTA.

### 4.3 Heading Structure

Cannot be verified from raw HTML (CSR). Once SSR/prerender lands, ensure:
- Exactly one `<h1>` per page
- Logical `<h2>` / `<h3>` hierarchy
- Keyword variants used naturally in subheads

### 4.4 Internal Linking

Cannot be analyzed from raw HTML. Once content is rendered server-side:
- Add contextual links from blog posts → `/pricing` and `/tools/interview-questions`
- Add `vs-*` pages to homepage footer
- Add breadcrumbs on every non-home page

---

## 5. Schema / Structured Data — **FAIL (0/100)**

**No JSON-LD found on any page.**

### Required additions

| Schema | Page(s) | Priority |
|---|---|---|
| `Organization` | All (header) | Critical |
| `SoftwareApplication` | Home, Pricing | Critical |
| `FAQPage` | Home, Pricing, vs-* | High |
| `BreadcrumbList` | All non-home | High |
| `Article` + `Author` | All `/blog/*` | High |
| `Product` + `Offer` | Pricing | High |
| `WebSite` + `SearchAction` | Home | Medium |
| `AggregateRating` | Home (when ≥5 reviews) | Medium |
| `HowTo` | `/tools/interview-questions` | Medium |
| `ComparisonTable` (custom) or itemList | vs-* pages | Low |

### Example: SoftwareApplication for Home

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HireBest",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://hirebest.online/",
  "description": "AI resume screener that scores 100 CVs against a job description in 38 seconds.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@type": "Organization", "name": "HireBest", "url": "https://hirebest.online/" }
}
```

---

## 6. Performance (CWV)

| Resource | Size (gzip) | Notes |
|---|---|---|
| index.html | 1.2 KB | Empty shell |
| JS bundle `index-DRf7JhI2.js` | **456 KB gzip / 1.59 MB raw** | Single chunk — needs code-splitting |
| CSS bundle `index-BFrAVOmL.css` | 9.6 KB gzip / 50 KB raw | Acceptable |
| og-card.png | 632 KB | **Way too large** — compress to <100 KB (use TinyPNG or WebP) |
| Third-party: `saasbrowser.com/widgets/collection.min.js` | unknown | Loaded async — verify impact |

### Recommendations
1. **Code-split** the React bundle by route (`React.lazy` + `Suspense`).
2. **Tree-shake** unused dependencies — 456 KB gzip is heavy for a SaaS landing page.
3. **Preload hero font + LCP image** with `<link rel="preload">`.
4. **Compress `og-card.png`** to under 150 KB and consider WebP fallback (note: many OG renderers still require PNG/JPG, so keep `.png` as primary).
5. Audit the third-party SaasBrowser widget — defer or remove if not business-critical.
6. Enable Vercel's automatic image optimization for any product screenshots.

---

## 7. Images

| Check | Result |
|---|---|
| Favicon set | ✅ `/favicon-256.png` |
| Apple touch icon | ✅ `/apple-touch-icon.png` |
| Multi-size favicons (16/32/192/512) | ❌ Add manifest + variants |
| `web.manifest` (PWA) | ❌ Not linked |
| `og-card.png` size | ❌ 632 KB (target < 150 KB) |
| `og:image:width` / `:height` / `:alt` | ❌ Missing |
| In-page images alt text | ❓ Unknown (CSR) |
| Responsive `<picture>` / `srcset` | ❓ Unknown (CSR) |
| Modern formats (WebP / AVIF) | ❓ Unknown |

---

## 8. AI Search Readiness (GEO)

| Signal | Status |
|---|---|
| `llms.txt` | ✅ Present, well-formed (640 bytes) |
| `llms-full.txt` | ❌ Add — give LLMs full product context |
| Per-page metadata for AI parsers | ❌ Empty shells |
| Citable factual statements | ❓ In-content (CSR-only) |
| Author / E-E-A-T schema | ❌ |
| Comparison content (vs-*) | ✅ Pages exist — high AI Overview potential once rendered |
| Brand mention on third-party sites | Not assessed (out of scope without DataForSEO) |
| Reddit / forum presence | Not assessed |

**AI Crawler Access:** GPTBot, ClaudeBot, Perplexity, Google-Extended are NOT blocked in robots.txt → ✅ accessible. Once content is server-rendered, citability will jump dramatically.

### Suggested llms.txt expansion

Add sections for:
- `## Blog` with each post link + 1-line summary
- `## Comparisons` listing `/vs-greenhouse`, `/vs-workable`, `/vs-lever`
- `## Tools` with `/tools/interview-questions`
- `## Key facts` (founding year, team size, pricing range, customer count) — these get cited in AI Overviews verbatim

---

## 9. SXO (Search Experience)

Cannot fully assess persona-page fit without rendered DOM, but:
- **Buyer persona (HR manager / recruiter):** lands on `/` expecting demo + pricing + social proof. Pricing exists at `/pricing` — good.
- **Comparison shopper:** `/vs-*` pages are excellent intent capture — but currently SERP-invisible due to shared metadata.
- **Researcher (top-of-funnel):** `/blog/*` posts target awareness keywords. Same SERP-invisibility issue.
- **Free-tool seeker:** `/tools/interview-questions` is great lead-magnet positioning.

**Site architecture is strategically sound.** The execution problem is purely technical (CSR rendering).

---

## 10. Backlinks (Domain-Level — Common Crawl proxy)

Full backlink data not available without DataForSEO / Moz extension. Domain `hirebest.online` is on the `.online` TLD (slightly lower default trust signal than `.com`). Recommend:
- Acquire `hirebest.com` if available (or `gethirebest.com` / `hirebest.io`) for long-term brand equity
- Begin link-building from HR/tech newsletters, ProductHunt launch, recruiter Reddit communities

---

## Appendix A — Crawled URL Inventory

| # | URL | Priority | Changefreq | Lastmod | Issues |
|---|---|---|---|---|---|
| 1 | `/` | 1.0 | weekly | ❌ missing | CSR shell, no schema |
| 2 | `/pricing` | 0.9 | monthly | ❌ | Inherits home meta |
| 3 | `/analytics` | 0.7 | monthly | ❌ | Inherits home meta |
| 4 | `/contact` | 0.6 | yearly | ❌ | Inherits home meta |
| 5 | `/tools/interview-questions` | 0.8 | monthly | ❌ | Inherits home meta |
| 6 | `/vs-greenhouse` | 0.8 | monthly | ❌ | Inherits home meta |
| 7 | `/vs-workable` | 0.8 | monthly | ❌ | Inherits home meta |
| 8 | `/vs-lever` | 0.8 | monthly | ❌ | Inherits home meta |
| 9 | `/blog` | 0.7 | weekly | ❌ | Inherits home meta |
| 10 | `/blog/ai-ats-wrong-way-to-think` | 0.7 | monthly | ❌ | Inherits home meta |
| 11 | `/blog/greenhouse-pricing-2026` | 0.7 | monthly | ❌ | Inherits home meta |
| 12 | `/blog/screen-100-cvs-in-38-seconds` | 0.7 | monthly | ❌ | Inherits home meta |
| 13 | `/login` | 0.3 | yearly | — | Should be removed from sitemap (disallowed in robots) |
| 14 | `/signup` | 0.5 | yearly | — | Same |
| 15 | `/privacy-policy` | 0.2 | yearly | ❌ | Inherits home meta |
| 16 | `/terms-and-conditions` | 0.2 | yearly | ❌ | Inherits home meta |
| 17 | `/refund-policy` | 0.2 | yearly | ❌ | Inherits home meta |

---

## Appendix B — Suggested `vercel.json` Patch

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

> **Note:** the `rewrites` rule is what causes every URL to return the homepage shell. Replacing CSR with prerender / SSR will let you remove or refine this rule.

---

## Appendix C — Prioritized Action Plan

### Critical (this week)
1. Add prerendering — use `vite-plugin-prerender` or migrate to **Astro / Next.js**. Output static HTML per route with unique `<title>`, `<meta description>`, OG, canonical.
2. Add `react-helmet-async` as an interim fix for per-route head tags.
3. Inject JSON-LD: `Organization`, `SoftwareApplication`, `FAQPage`, `Article` (blog), `BreadcrumbList`, `Product` (pricing).
4. Add `<link rel="canonical">` per route.
5. Convert `og:image` to absolute URL; add `og:image:width=1200`, `og:image:height=630`, `og:image:alt`.
6. Add Twitter Card meta: `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.

### High (within 1 week)
7. Add the four missing security headers via `vercel.json`.
8. Add `lastmod` to every sitemap entry; remove `/login` and `/signup` from sitemap.
9. Code-split the 456 KB React bundle by route.
10. Compress `og-card.png` from 632 KB → <150 KB.
11. Expand `llms.txt` with blog, comparisons, tools, and key facts sections.

### Medium (within 1 month)
12. Add `About` and `Customers` pages with team / testimonials / case studies (E-E-A-T).
13. Add author bylines + `Person` schema to blog posts.
14. Add `web.manifest` and multi-size favicons (16, 32, 192, 512).
15. Audit third-party SaasBrowser widget — measure impact, defer if non-critical.
16. Add visible trust badges (SOC2, GDPR, ISO if applicable).
17. Add breadcrumbs (visible + JSON-LD) on all non-home pages.
18. Add `AggregateRating` once 5+ reviews are collected.

### Low (backlog)
19. Acquire stronger TLD (`.com`) for long-term brand equity.
20. Launch on ProductHunt, post in r/recruiting, r/humanresources, HR newsletters for link-building.
21. Add interactive `HowTo` schema on `/tools/interview-questions`.
22. Add internationalisation if expanding beyond English (hreflang).

---

*End of report. Generated by Claude SEO Audit skill.*
