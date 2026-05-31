// Client-side CV file parser. PDF via pdfjs-dist, DOCX via mammoth.
// Images are passed as base64 to the backend (OpenAI Vision).

import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export type ParsedCV =
  | { kind: 'text'; fileName: string; text: string }
  | { kind: 'image'; fileName: string; imageBase64: string; mimeType: string }

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']

export async function parseFile(file: File): Promise<ParsedCV> {
  const name = file.name
  const lower = name.toLowerCase()

  if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
    const text = await parsePdf(file)
    return { kind: 'text', fileName: name, text }
  }

  if (lower.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arr = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer: arr })
    return { kind: 'text', fileName: name, text: value }
  }

  if (lower.endsWith('.txt') || file.type === 'text/plain') {
    return { kind: 'text', fileName: name, text: await file.text() }
  }

  if (IMAGE_TYPES.includes(file.type) || /\.(png|jpe?g|svg|webp)$/i.test(name)) {
    const base64 = await fileToBase64(file)
    return { kind: 'image', fileName: name, imageBase64: base64, mimeType: file.type || 'image/png' }
  }

  // Fallback: try as text
  return { kind: 'text', fileName: name, text: await file.text() }
}

async function parsePdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const parts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    parts.push(content.items.map((it: any) => it.str).join(' '))
  }
  return parts.join('\n\n').trim()
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const result = String(r.result || '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// Run promises with bounded concurrency
export async function pAll<T, R>(items: T[], concurrency: number, worker: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++
      if (i >= items.length) return
      out[i] = await worker(items[i], i)
    }
  })
  await Promise.all(runners)
  return out
}
