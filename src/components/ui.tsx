import clsx from 'clsx'
import { motion, AnimatePresence } from 'motion/react'
import { type ReactNode, type ButtonHTMLAttributes, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet'
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-[background,color,box-shadow,transform] duration-150 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap'
const btnVariant = {
  primary: 'bg-blue text-white hover:bg-blue-600 shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_6px_16px_-8px_rgba(66,136,255,.9)]',
  secondary: 'bg-white text-ink border border-line-2 hover:border-blue/50 hover:text-blue-700',
  ghost: 'text-ink-2 hover:bg-wash',
  quiet: 'text-blue-700 hover:bg-blue-50',
}
const btnSize = { sm: 'h-8 px-3 text-[13.5px]', md: 'h-10 px-4 text-[15px]', lg: 'h-12 px-5 text-[16px]' }

export function Button({ variant = 'primary', size = 'md', className, to, children, ...rest }: BtnProps) {
  const cls = clsx(btnBase, btnVariant[variant], btnSize[size], className)
  if (to) {
    const external = to.startsWith('http')
    if (external)
      return (
        <a href={to} className={cls} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer select-none items-center gap-2 text-[13.5px] text-ink-2">
      <span className="relative inline-flex">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-line-2 transition-colors peer-checked:bg-blue peer-focus-visible:outline-2 peer-focus-visible:outline-blue peer-focus-visible:outline-offset-2" />
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      {label}
    </label>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  size?: 'sm' | 'md'
  ariaLabel: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-[10px] border border-line bg-wash p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'relative rounded-[8px] font-medium transition-colors',
            size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13.5px]',
            value === o.value ? 'text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${ariaLabel}`} className="absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_2px_rgba(15,27,45,.08),0_0_0_1px_rgba(15,27,45,.04)]" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Tag({ children, tone = 'plain', className }: { children: ReactNode; tone?: 'plain' | 'blue' | 'ok' | 'warn' | 'err'; className?: string }) {
  const tones = {
    plain: 'bg-wash text-ink-2 border-line',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    ok: 'bg-ok-50 text-ok border-ok/15',
    warn: 'bg-tension-50 text-[#a3650f] border-tension/20',
    err: 'bg-err-50 text-err border-err/15',
  }
  return <span className={clsx('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[12px] font-medium leading-none', tones[tone], className)}>{children}</span>
}

/**
 * A proposal note: marks something that is new in this concept and says where the idea came from.
 * Toggled globally from the nav so the same page can be shown "as a product" or "as a pitch".
 */
export function Note({ from, children, className, side = 'block', dark = false }: { from: string; children?: ReactNode; className?: string; side?: 'block' | 'inline'; dark?: boolean }) {
  const on = useStore((s) => s.settings.notes)
  const src = /^(Our|Last)\b/.test(from) ? from[0].toLowerCase() + from.slice(1) : from
  return (
    <AnimatePresence initial={false}>
      {on && (
        <motion.aside
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className={clsx('overflow-hidden', side === 'inline' ? 'inline-block align-middle' : '', className)}
        >
          <div
            className={clsx(
              'mt-2 inline-flex max-w-full items-start gap-2 rounded-lg border border-dashed px-2.5 py-1.5 text-[12.5px] leading-snug',
              dark ? 'border-[#6f9cf0] bg-white/[.06] text-[#cfe0ff]' : 'border-[#9dbdf7] bg-[#f1f6ff] text-blue-700',
            )}
          >
            <span className={clsx('mt-[5px] inline-block size-1.5 shrink-0 rounded-full', dark ? 'bg-[#8db6ff]' : 'bg-blue')} aria-hidden />
            <span>
              <strong className="font-semibold">New. </strong>
              {children}
              {children ? ' ' : ''}
              <span className={dark ? 'text-[#cfe0ff]/75' : 'text-[#4a6fb0]'}>From {src}.</span>
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

/** Count up once when scrolled into view. Inspired by React Bits' CountUp. */
export function CountUp({ to, decimals = 0, suffix = '', duration = 1.1 }: { to: number; decimals?: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) return setV(to)
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000))
          const eased = 1 - Math.pow(1 - p, 3)
          setV(to * eased)
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** Ring gauge for readiness. */
export function Ring({ value, size = 64, stroke = 6, label, tone = '#4288FF' }: { value: number; size?: number; stroke?: number; label?: ReactNode; tone?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8eefc" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, value / 100))) }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>
      <span className="absolute text-center">{label ?? <span className="text-[15px] font-semibold tabular-nums">{Math.round(value)}</span>}</span>
    </div>
  )
}

export function SectionTitle({ title, sub, className }: { title: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={clsx('max-w-[46rem]', className)}>
      <h2 className="text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[44px]">{title}</h2>
      {sub && <p className="mt-4 max-w-[38rem] text-pretty text-[17px] leading-relaxed text-muted md:text-[18px]">{sub}</p>}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-[var(--radius-card)] border border-line bg-white shadow-soft', className)}>{children}</div>
}
