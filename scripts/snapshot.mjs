#!/usr/bin/env node
/**
 * Full-render snapshot — puppeteer headless Chrome per-route HTML capture.
 *
 * Local:   uses puppeteer bundled Chrome
 * Vercel:  uses @sparticuz/chromium (statically-linked, no system lib deps)
 *
 * Flow:
 *  1. Spins up local static server on dist/
 *  2. Launches headless Chrome
 *  3. Visits each route, waits for React to fully render (networkidle0 + 600ms)
 *  4. Saves full rendered HTML → dist/<route>/index.html
 *
 * Result: Googlebot sees real <h1>, body copy, JSON-LD in static HTML.
 * React hydrates on client for interactivity.
 */
import { writeFileSync, mkdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReadStream } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir   = join(__dirname, '..', 'dist')
const BASE      = 'https://hirebest.online'
const PORT      = 7391

const ROUTES = [
  { path: '/',                                    noindex: false },
  { path: '/about',                               noindex: false },
  { path: '/pricing',                             noindex: false },
  { path: '/analytics',                           noindex: false },
  { path: '/contact',                             noindex: false },
  { path: '/tools/interview-questions',           noindex: false },
  { path: '/vs-greenhouse',                       noindex: false },
  { path: '/vs-workable',                         noindex: false },
  { path: '/vs-lever',                            noindex: false },
  { path: '/blog',                                noindex: false },
  { path: '/blog/ai-ats-wrong-way-to-think',      noindex: false },
  { path: '/blog/greenhouse-pricing-2026',        noindex: false },
  { path: '/blog/screen-100-cvs-in-38-seconds',  noindex: false },
  { path: '/blog/hirebest-vs-greenhouse-2026',   noindex: false },
  { path: '/privacy-policy',                      noindex: true  },
  { path: '/terms-and-conditions',                noindex: true  },
  { path: '/refund-policy',                       noindex: true  },
]

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.mjs': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.woff2': 'font/woff2',
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let url = req.url.split('?')[0]
      let filePath = join(distDir, url)
      if (!extname(url)) filePath = join(distDir, 'index.html')
      try { statSync(filePath) } catch { filePath = join(distDir, 'index.html') }
      const mime = MIME[extname(filePath)] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      createReadStream(filePath).pipe(res)
    })
    server.listen(PORT, () => resolve(server))
  })
}

async function launchBrowser() {
  const isVercel = !!process.env.VERCEL

  if (isVercel) {
    console.log('  Vercel env detected — using @sparticuz/chromium')
    const [chromium, puppeteerCore] = await Promise.all([
      import('@sparticuz/chromium'),
      import('puppeteer-core'),
    ])
    const executablePath = await chromium.default.executablePath()
    return puppeteerCore.default.launch({
      args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.default.defaultViewport,
      executablePath,
      headless: chromium.default.headless,
    })
  }

  console.log('  Local env — using puppeteer bundled Chrome')
  const { default: puppeteer } = await import('puppeteer')
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

async function run() {
  console.log('  Loading browser…')
  const server  = await startServer()
  console.log(`  Local server → port ${PORT}`)
  const browser = await launchBrowser()

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  page.on('console', () => {})
  page.on('pageerror', () => {})

  let ok = 0, fail = 0

  // Try networkidle0 first (strictest), fall back to networkidle2 (tolerates
  // long-lived beacons like Vercel Analytics), then domcontentloaded as a
  // last resort. A single flaky route shouldn't tank the whole build.
  const WAIT_STRATEGIES = ['networkidle0', 'networkidle2', 'domcontentloaded']

  const capture = async (path) => {
    let lastErr
    for (const waitUntil of WAIT_STRATEGIES) {
      try {
        await page.goto(`http://localhost:${PORT}${path}`, { waitUntil, timeout: 30000 })
        return
      } catch (err) {
        lastErr = err
      }
    }
    throw lastErr
  }

  for (const route of ROUTES) {
    try {
      await capture(route.path)
      await new Promise(r => setTimeout(r, 600))

      let html = await page.content()
      html = html.replaceAll(`http://localhost:${PORT}`, BASE)

      if (route.noindex) {
        html = html.replace(
          /<meta\s+name="robots"[^>]*>/,
          `<meta name="robots" content="noindex,nofollow" />`
        )
      }

      const targetDir = join(distDir, route.path)
      mkdirSync(targetDir, { recursive: true })
      writeFileSync(join(targetDir, 'index.html'), html, 'utf-8')
      ok++
      console.log(`  ✓ ${route.path}${route.noindex ? ' [noindex]' : ''}`)
    } catch (err) {
      fail++
      console.error(`  ✗ ${route.path}: ${err.message}`)
    }
  }

  // Generate dist/404.html — Vercel serves this with HTTP 404 for unmatched routes.
  try {
    await capture('/__not_found_synthetic__')
    await new Promise(r => setTimeout(r, 600))
    let html404 = await page.content()
    html404 = html404.replaceAll(`http://localhost:${PORT}`, BASE)
    html404 = html404.replace(
      /<meta\s+name="robots"[^>]*>/,
      `<meta name="robots" content="noindex,nofollow" />`
    )
    html404 = html404.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>404 — Page Not Found · HireBest</title>`
    )
    html404 = html404.replace(
      /<link\s+rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${BASE}/" />`
    )
    writeFileSync(join(distDir, '404.html'), html404, 'utf-8')
    console.log('  ✓ /404.html [noindex]')
  } catch (err) {
    console.error(`  ✗ /404.html: ${err.message}`)
    fail++
  }

  await browser.close()
  server.close()

  console.log(`\n✓ Snapshot done — ${ok} ok, ${fail} failed`)
  // Only fail the build if more than one route couldn't be captured — a single
  // flaky puppeteer navigation shouldn't tank an otherwise-good deploy. Missing
  // routes just fall back to the SPA shell (which Google still indexes).
  if (fail > 1) process.exit(1)
}

run().catch(err => {
  console.error('Snapshot failed:', err.message)
  process.exit(1)
})
