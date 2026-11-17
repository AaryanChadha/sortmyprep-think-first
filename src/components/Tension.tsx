import clsx from 'clsx'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * Time under tension: borrowed from strength training, where muscle grows from time spent under load, not reps counted.
 * The meter shows the student where productive struggle starts and when it stops paying.
 */
export function TensionMeter({ seconds, compact = false }: { seconds: number; compact?: boolean }) {
  const max = 240
  const pct = Math.min(1, seconds / max)
  const zone = seconds < 20 ? 'Warming up' : seconds < 180 ? 'Productive struggle' : 'Take the next hint'
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={clsx('font-medium text-ink-2', compact ? 'text-[12.5px]' : 'text-[13px]')}>Time under tension</span>
        <span className={clsx('font-semibold tabular-nums', compact ? 'text-[15px]' : 'text-[20px]')}>{mmss(seconds)}</span>
      </div>
      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-wash-2" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(seconds, max)} aria-label="Time under tension on this step">
        <div className="absolute inset-y-0 left-[8.33%] right-[25%] bg-[linear-gradient(90deg,#dbe8ff,#fdf0dc)]" />
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#4288ff,#7aa9ff_55%,#e59a2f)]" style={{ width: `${pct * 100}%` }} transition={{ type: 'tween', duration: 0.6 }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11.5px] text-faint">
        <span>0:20</span>
        <span className={clsx('font-medium', seconds >= 180 ? 'text-[#a3650f]' : seconds >= 20 ? 'text-blue-700' : 'text-faint')}>{zone}</span>
        <span>3:00</span>
      </div>
    </div>
  )
}

/** Press and hold to confirm. Makes revealing the answer a decision, not a reflex. */
export function HoldButton({ onDone, children, disabled, ms = 1400 }: { onDone: () => void; children: React.ReactNode; disabled?: boolean; ms?: number }) {
  const [p, setP] = useState(0)
  const raf = useRef(0)
  const t0 = useRef(0)
  const stop = () => {
    cancelAnimationFrame(raf.current)
    setP(0)
  }
  const start = () => {
    if (disabled) return
    t0.current = performance.now()
    const tick = (t: number) => {
      const v = Math.min(1, (t - t0.current) / ms)
      setP(v)
      if (v >= 1) {
        onDone()
        setP(0)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start()
      }}
      onKeyUp={stop}
      className="relative h-10 w-full overflow-hidden rounded-[10px] border border-line-2 bg-white text-[13.5px] font-semibold text-ink-2 transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="absolute inset-y-0 left-0 bg-err-50" style={{ width: `${p * 100}%` }} />
      <span className="relative">{p > 0 ? 'Keep holding…' : children}</span>
    </button>
  )
}
