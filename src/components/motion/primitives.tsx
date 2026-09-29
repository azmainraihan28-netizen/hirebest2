import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring,
  useTransform, useVelocity, useAnimationFrame, type MotionValue,
} from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────
   Motion primitives for the marketing site.
   Every one of them degrades to a static render under reduced motion.
   ───────────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const

/** Fade + rise once when the element scrolls into view. */
export function Reveal({
  children, delay = 0, y = 24, className = '', as = 'div', amount = 0.25,
}: {
  children: ReactNode; delay?: number; y?: number; className?: string
  as?: 'div' | 'section' | 'li' | 'span' | 'p'; amount?: number
}) {
  const reduce = useReducedMotion()
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

/**
 * Headline that rises word-by-word from behind a mask. Pass plain text; wrap
 * words to accent in `*asterisks*` to render them in the serif italic accent.
 */
export function SplitHeading({
  text, className = '', delay = 0, as = 'h2', once = true,
}: { text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'h3'; once?: boolean }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once, amount: 0.4 })
  const Tag = as
  const lines = text.split('\n').map(tokenize)
  let idx = 0
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\*/g, '').replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.map(({ word, accent }, wi) => {
            const i = idx++
            return (
              <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
                <motion.span
                  className={`inline-block ${accent ? 'accent-serif' : ''}`}
                  initial={reduce ? false : { y: '110%', rotate: 4 }}
                  animate={inView ? { y: '0%', rotate: 0 } : undefined}
                  transition={{ duration: 1, ease: EASE, delay: delay + i * 0.055 }}
                >
                  {word}
                </motion.span>
                {wi < line.length - 1 && <span>&nbsp;</span>}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

/**
 * Paragraph whose words light up one by one as the reader scrolls through it.
 * The signature "manifesto" effect.
 */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] })
  const words = tokenize(text)
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return <Word key={i} progress={scrollYProgress} range={[start, end]} word={w.word} accent={w.accent} />
      })}
    </p>
  )
}

function Word({ word, accent, progress, range }: { word: string; accent: boolean; progress: MotionValue<number>; range: [number, number] }) {
  const reduce = useReducedMotion()
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <>
      <motion.span style={reduce ? undefined : { opacity }} className={accent ? 'accent-serif text-[var(--color-primary-2)]' : ''}>
        {word}
      </motion.span>{' '}
    </>
  )
}

/**
 * Splits text into words, marking the ones inside *asterisks* as accented.
 * An accent may span several words: "*start meeting people.*"
 */
function tokenize(text: string): { word: string; accent: boolean }[] {
  const out: { word: string; accent: boolean }[] = []
  let on = false
  for (const raw of text.split(' ').filter(Boolean)) {
    let w = raw
    const opens = w.startsWith('*')
    if (opens) { on = true; w = w.slice(1) }
    const closes = w.endsWith('*')
    if (closes) w = w.slice(0, -1)
    out.push({ word: w, accent: on })
    if (closes) on = false
  }
  return out
}

/** Button/link wrapper that leans toward the cursor. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={e => {
        if (reduce || e.pointerType !== 'mouse') return
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

/** Number that counts up when scrolled into view. Keeps any suffix ("s", "%", "+"). */
export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const clean = value.replace(/,/g, '')
  const match = clean.match(/^(\d+(?:\.\d+)?)(.*)$/)
  const target = match ? parseFloat(match[1]) : 0
  const suffix = match ? match[2] : ''
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0
  const [n, setN] = useState(reduce ? target : 0)

  useEffect(() => {
    if (!inView || reduce || !match) return
    const dur = 1800
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1)
      setN(target * (1 - Math.pow(1 - t, 4)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  if (!match) return <span className={className}>{value}</span>
  const shown = decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()
  return <span ref={ref} className={className}>{shown}{suffix}</span>
}

/**
 * Infinite marquee whose speed and skew react to scroll velocity —
 * scroll fast and the band leans and races, then settles back.
 */
export function VelocityMarquee({ children, baseSpeed = 40, className = '' }: { children: ReactNode; baseSpeed?: number; className?: string }) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 300 })
  const factor = useTransform(smooth, [-2000, 0, 2000], [-4, 1, 4], { clamp: false })
  const skew = useTransform(smooth, [-2000, 0, 2000], [6, 0, -6])
  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const el = trackRef.current
    if (!el) return
    const half = el.scrollWidth / 2
    let next = x.get() - (baseSpeed * (delta / 1000)) * Math.max(1, Math.abs(factor.get()))
    if (next <= -half) next += half
    if (next > 0) next -= half
    x.set(next)
  })

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div ref={trackRef} className="flex w-max" style={{ x, skewX: reduce ? 0 : skew }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </motion.div>
    </div>
  )
}

/** Thin progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })
  return <motion.div aria-hidden className="scroll-progress" style={{ scaleX }} />
}

/** Section eyebrow: index number + label, mono. */
export function Eyebrow({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`eyebrow-x ${className}`}>
      {n && <span className="eyebrow-x-n">{n}</span>}
      <span className="eyebrow-x-line" aria-hidden />
      <span>{children}</span>
    </div>
  )
}

/** Card that renders a soft spotlight under the pointer. */
export function Spotlight({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      onPointerMove={e => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }}
    >
      {children}
    </div>
  )
}
