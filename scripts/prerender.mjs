#!/usr/bin/env node
/**
 * Post-build per-route HTML generator.
 *
 * Reads dist/index.html and writes one HTML file per public marketing route
 * with route-specific <title>, meta description, OG, Twitter, canonical.
 * Legal pages get noindex injected.
 * The React bundle still hydrates on load, so this is "meta-level prerender" —
 * it solves the audit issue of every route sharing identical homepage meta,
 * without refactoring routing.
 *
 * Vercel serves dist/<route>/index.html when it exists; the SPA rewrite in
 * vercel.json catches anything else (dashboard, dynamic slugs not in the list).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

const BASE = 'https://hirebest.online'

const routes = [
  {
    path: '/about',
    title: 'About HireBest — Founder Story, Mission, and Team',
    description: 'HireBest was built by a founder who spent 4 hours screening 200 CVs for one role. Now 100 CVs take 38 seconds. Meet the team behind the AI resume screener.',
    imageAlt: 'About HireBest — Founder story and company mission',
    type: 'website',
  },
  {
    path: '/pricing',
    title: 'Pricing — From $49/mo. 14-day free trial. Cancel anytime · HireBest',
    description: "Simple SaaS pricing for AI resume screening. Starter $49/mo, Growth $99/mo (most popular), Team $199/mo, or Enterprise custom. 14-day free trial — no credit card.",
    imageAlt: 'HireBest pricing — Starter $49/mo, Growth $99/mo, Team $199/mo, Enterprise custom',
    type: 'website',
  },
  {
    path: '/analytics',
    title: 'Hiring Analytics — Track screenings, fit ratio, missing skills · HireBest',
    description: "Track screening velocity, average fit ratio, and the most common missing skills across your hiring pipeline.",
    imageAlt: 'HireBest hiring analytics dashboard — fit ratio, velocity, missing skills',
    type: 'website',
  },
  {
    path: '/contact',
    title: 'Contact HireBest — WhatsApp or email us · HireBest',
    description: "Questions about plans, custom builds, or your existing order? Reach out — we usually reply within a few hours.",
    imageAlt: 'Contact HireBest — WhatsApp and email support',
    type: 'website',
  },
  {
    path: '/tools/interview-questions',
    title: 'Free AI Interview Question Generator · HireBest',
    description: 'Paste a JD. Get 5 tailored interview questions with model answers. Free, no signup, no usage limit.',
    imageAlt: 'Free AI interview question generator — paste JD, get 5 tailored questions',
    type: 'website',
  },
  {
    path: '/vs-greenhouse',
    title: 'HireBest vs Greenhouse (2026): Which is Right for Your Team? · HireBest',
    description: 'A direct comparison of HireBest and Greenhouse on pricing, AI features, setup time, and which type of team belongs on each platform.',
    imageAlt: 'HireBest vs Greenhouse 2026 — pricing and AI feature comparison',
    type: 'website',
  },
  {
    path: '/vs-workable',
    title: 'HireBest vs Workable: Which AI Resume Screener Wins in 2026? · HireBest',
    description: 'Workable runs around $299/month. HireBest starts at $49/month with a 14-day free trial. Compare features, pricing, and what each is built for.',
    imageAlt: 'HireBest vs Workable — $49/month vs $299/month AI resume screener comparison',
    type: 'website',
  },
  {
    path: '/vs-lever',
    title: 'HireBest vs Lever: Which AI Resume Screener Wins in 2026? · HireBest',
    description: 'Lever lands between $5,000–$25,000+/year. HireBest starts at $49/month with a 14-day free trial. Compare features, pricing, and what each is built for.',
    imageAlt: 'HireBest vs Lever — AI-first screening vs CRM with bolted-on AI',
    type: 'website',
  },
  {
    path: '/blog',
    title: 'Blog — Hiring, screening, and the AI shift · HireBest',
    description: "Stories, benchmarks, and opinions from the HireBest team on CV screening, ATS pricing, and AI in hiring.",
    imageAlt: 'HireBest blog — hiring, CV screening, and AI in recruiting',
    type: 'website',
  },
  {
    path: '/blog/ai-ats-wrong-way-to-think',
    title: "Why 'AI ATS' is the Wrong Way to Think About Hiring · HireBest",
    description: "The category label hides the real shift. AI doesn't replace your ATS — it replaces the part of your day spent reading the wrong resumes.",
    imageAlt: "Why AI ATS is the wrong framing — HireBest opinion",
    type: 'article',
  },
  {
    path: '/blog/hirebest-vs-greenhouse-2026',
    title: 'HireBest vs Greenhouse (2026): Which is Right for Your Team? · HireBest',
    description: 'A direct comparison on pricing, AI features, and setup time — and which type of team belongs on each platform.',
    imageAlt: 'HireBest vs Greenhouse 2026 — side-by-side comparison article',
    type: 'article',
  },
  {
    path: '/blog/greenhouse-pricing-2026',
    title: "Greenhouse Pricing in 2026: What's Really Going On · HireBest",
    description: 'Public benchmarks, leaked quotes, and procurement reports — what an annual Greenhouse contract actually costs SMEs in 2026.',
    imageAlt: "Greenhouse pricing 2026 — what an annual contract really costs SMEs",
    type: 'article',
  },
  {
    path: '/blog/screen-100-cvs-in-38-seconds',
    title: 'How to Screen 100 CVs in 38 Seconds · HireBest',
    description: 'A walkthrough of how AI scoring compresses a full afternoon of resume review into a single coffee break — without losing nuance.',
    imageAlt: 'How to screen 100 CVs in 38 seconds — AI screening tutorial',
    type: 'article',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy · HireBest',
    description: 'How HireBest handles your data: account info, uploaded CVs, AI processors, encryption, and your GDPR/CCPA rights.',
    imageAlt: 'HireBest privacy policy',
    type: 'website',
    noindex: true,
  },
  {
    path: '/terms-and-conditions',
    title: 'Terms & Conditions · HireBest',
    description: 'Terms governing use of HireBest. AI outputs are decision-support, not final hiring decisions; human review is required.',
    imageAlt: 'HireBest terms and conditions',
    type: 'website',
    noindex: true,
  },
  {
    path: '/refund-policy',
    title: 'Refund Policy · HireBest',
    description: '7-day full refund on one-time plans; monthly retainer cancellable anytime. Submit requests to contact@hirebest.online.',
    imageAlt: 'HireBest refund policy — 7-day full refund on one-time plans',
    type: 'website',
    noindex: true,
  },
]

// ---- Load template ----
const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

// ---- Helpers ----
const escapeAttr = (s) => s
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const escapeText = (s) => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    // Fall back: inject before </head>
    return html.replace('</head>', `    ${replacement}\n  </head>`)
  }
  return html.replace(regex, replacement)
}

function renderRouteHtml({ path, title, description, imageAlt, type, noindex }) {
  const url = `${BASE}${path}`
  const desc = escapeAttr(description)
  const ttl = escapeAttr(title)
  let html = template

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeText(title)}</title>`)
  html = replaceTag(html, /<meta\s+name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)
  html = replaceTag(html, /<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${ttl}" />`)
  html = replaceTag(html, /<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`)
  html = replaceTag(html, /<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
  html = replaceTag(html, /<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`)
  html = replaceTag(html, /<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${ttl}" />`)
  html = replaceTag(html, /<meta\s+name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}" />`)
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
  if (imageAlt) {
    const alt = escapeAttr(imageAlt)
    html = replaceTag(html, /<meta\s+property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${alt}" />`)
    html = replaceTag(html, /<meta\s+name="twitter:image:alt"[^>]*>/, `<meta name="twitter:image:alt" content="${alt}" />`)
  }

  // Inject noindex for legal/thin pages
  if (noindex) {
    html = replaceTag(
      html,
      /<meta\s+name="robots"[^>]*>/,
      `<meta name="robots" content="noindex,nofollow" />`
    )
  }

  return html
}

// ---- Write files ----
let count = 0
for (const route of routes) {
  const html = renderRouteHtml(route)
  const targetDir = join(distDir, route.path)
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(join(targetDir, 'index.html'), html, 'utf-8')
  count++
  const tag = route.noindex ? ' [noindex]' : ''
  console.log(`  ✓ ${route.path}${tag} → ${route.title.slice(0, 55)}…`)
}

console.log(`\n✓ Prerendered ${count} routes with route-specific meta tags`)
