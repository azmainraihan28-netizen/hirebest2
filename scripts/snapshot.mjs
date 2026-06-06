#!/usr/bin/env node
/**
 * Full-render snapshot — replaces meta-only prerender.mjs for production builds.
 *
 * Flow:
 *  1. Spins up a local static server on dist/
 *  2. Launches headless Chrome via puppeteer
 *  3. Visits each route, waits for React to fully render
 *  4. Saves the full rendered HTML to dist/<route>/index.html
 *
 * Result: Googlebot sees real <h1>, body copy, JSON-LD — in static HTML.
 * React still hydrates on the client for interactivity.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReadStream, statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir   = join(__dirname, '..', 'dist')
const BASE      = 'https://hirebest.online'
const PORT      = 7391 // unlikely to clash

const ROUTES = [
  { path: '/',                           noindex: false },
  { path: '/about',                      noindex: false },
  { path: '/pricing',                    noindex: false },
  { path: '/analytics',                  noindex: false },
  { path: '/contact',                    noindex: false },
  { path: '/tools/interview-questions',  noindex: false },
  { path: '/vs-greenhouse',              noindex: false },
  { path: '/vs-workable',               noindex: false },
  { path: '/vs-lever',                   noindex: false },
  { path: '/blog',                       noindex: false },
  { path: '/blog/ai-ats-wrong-way-to-think',      noindex: false },
  { path: '/blog/greenhouse-pricing-2026',         noindex: false },
  { path: '/blog/screen-100-cvs-in-38-seconds',   noindex: false },
  { path: '/blog/hirebest-vs-greenhouse-2026',    noindex: false },
  { path: '/privacy-policy',             noindex: true  },
  { path: '/terms-and-conditions',       noindex: true  },
  { path: '/refund-policy',              noindex: true  },
]

// ---- MIME types ----
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.woff2':'font/woff2',
}

// ---- Local static server (serves dist/) ----
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let url = req.url.split('?')[0]
      // SPA fallback: no extension → serve index.html
      let filePath = join(distDir, url)
      if (!extname(url)) filePath = join(distDir, 'index.html')
      try {
        statSync(filePath)
      } catch {
        filePath = join(distDir, 'index.html')
      }
      const mime = MIME[extname(filePath)] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      createReadStream(filePath).pipe(res)
    })
    server.listen(PORT, () => resolve(server))
  })
}

// ---- Main ----
async function run() {
  console.log('  Loading puppeteer…')
  const { default: puppeteer } = await import('puppeteer')

  console.log('  Starting local server on port', PORT)
  const server = await startServer()

  console.log('  Launching headless Chrome…')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // Suppress unnecessary console noise from the page
  page.on('console', () => {})
  page.on('pageerror', () => {})

  let count = 0

  for (const route of ROUTES) {
    const url  = `http://localhost:${PORT}${route.path}`
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      // Extra wait: ensure React hooks (useSeo, useSchema) have fired
      await new Promise(r => setTimeout(r, 600))

      let html = await page.content()

      // Fix absolute localhost references → production URLs
      html = html.replaceAll(`http://localhost:${PORT}`, BASE)

      // Inject noindex for legal pages (React useSeo sets it client-side but
      // we also want it in the static snapshot)
      if (route.noindex) {
        html = html.replace(
          /<meta\s+name="robots"[^>]*>/,
          `<meta name="robots" content="noindex,nofollow" />`
        )
      }

      const targetDir = join(distDir, route.path)
      mkdirSync(targetDir, { recursive: true })
      writeFileSync(join(targetDir, 'index.html'), html, 'utf-8')
      count++
      console.log(`  ✓ ${route.path}${route.noindex ? ' [noindex]' : ''}`)
    } catch (err) {
      console.error(`  ✗ ${route.path}: ${err.message}`)
    }
  }

  await browser.close()
  server.close()

  console.log(`\n✓ Snapshot complete — ${count}/${ROUTES.length} routes rendered with full content`)
}

run().catch(err => {
  console.error('Snapshot failed:', err)
  process.exit(1)
})
