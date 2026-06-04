#!/usr/bin/env node
/**
 * Post-build per-route HTML generator.
 *
 * Reads dist/index.html and writes one HTML file per public marketing route
 * with route-specific <title>, meta description, OG, Twitter, canonical.
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
    path: '/pricing',
    title: 'Pricing — From $400/yr to fully integrated ATS · HireBest',
    description: "Transparent plans from a $400/year standalone screener to a $1,500 one-time custom ATS build. No per-seat tax, no procurement cycle.",
    type: 'website',
  },
  {
    path: '/analytics',
    title: 'Hiring Analytics — Track screenings, fit ratio, missing skills · HireBest',
    description: "Track screening velocity, average fit ratio, and the most common missing skills across your hiring pipeline.",
    type: 'website',
  },
  {
    path: '/contact',
    title: 'Contact HireBest — WhatsApp or email us · HireBest',
    description: "Questions about plans, custom builds, or your existing order? Reach out — we usually reply within a few hours.",
    type: 'website',
  },
  {
    path: '/tools/interview-questions',
    title: 'Free AI Interview Question Generator · HireBest',
    description: 'Paste a JD. Get 5 tailored interview questions with model answers. Free, no signup, no usage limit.',
    type: 'website',
  },
  {
    path: '/vs-greenhouse',
    title: 'HireBest vs Greenhouse (2026): Which is Right for Your Team? · HireBest',
    description: 'A direct comparison of HireBest and Greenhouse on pricing, AI features, setup time, and which type of team belongs on each platform.',
    type: 'website',
  },
  {
    path: '/vs-workable',
    title: 'HireBest vs Workable: Which AI Resume Screener Wins in 2026? · HireBest',
    description: 'Workable runs around $299/month. HireBest starts at $400/year. Compare features, pricing, and what each is built for.',
    type: 'website',
  },
  {
    path: '/vs-lever',
    title: 'HireBest vs Lever: Which AI Resume Screener Wins in 2026? · HireBest',
    description: 'Lever lands between $5,000–$25,000+/year. HireBest starts at $400/year. Compare features, pricing, and what each is built for.',
    type: 'website',
  },
  {
    path: '/blog',
    title: 'Blog — Hiring, screening, and the AI shift · HireBest',
    description: "Stories, benchmarks, and opinions from the HireBest team on CV screening, ATS pricing, and AI in hiring.",
    type: 'website',
  },
  {
    path: '/blog/ai-ats-wrong-way-to-think',
    title: "Why 'AI ATS' is the Wrong Way to Think About Hiring · HireBest",
    description: "The category label hides the real shift. AI doesn't replace your ATS — it replaces the part of your day spent reading the wrong resumes.",
    type: 'article',
  },
  {
    path: '/blog/greenhouse-pricing-2026',
    title: "Greenhouse Pricing in 2026: What's Really Going On · HireBest",
    description: 'Public benchmarks, leaked quotes, and procurement reports — what an annual Greenhouse contract actually costs SMEs in 2026.',
    type: 'article',
  },
  {
    path: '/blog/screen-100-cvs-in-38-seconds',
    title: 'How to Screen 100 CVs in 38 Seconds · HireBest',
    description: 'A walkthrough of how AI scoring compresses a full afternoon of resume review into a single coffee break — without losing nuance.',
    type: 'article',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy · HireBest',
    description: 'How HireBest handles your data: account info, uploaded CVs, AI processors, encryption, and your GDPR/CCPA rights.',
    type: 'website',
  },
  {
    path: '/terms-and-conditions',
    title: 'Terms & Conditions · HireBest',
    description: 'Terms governing use of HireBest. AI outputs are decision-support, not final hiring decisions; human review is required.',
    type: 'website',
  },
  {
    path: '/refund-policy',
    title: 'Refund Policy · HireBest',
    description: '7-day full refund on one-time plans; monthly retainer cancellable anytime. Submit requests to contact@hirebest.online.',
    type: 'website',
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

function renderRouteHtml({ path, title, description, type }) {
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
  console.log(`  ✓ ${route.path} → ${route.title.slice(0, 60)}…`)
}

console.log(`\n✓ Prerendered ${count} routes with route-specific meta tags`)
