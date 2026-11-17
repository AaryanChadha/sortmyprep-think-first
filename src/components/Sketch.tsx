import { compile } from 'mathjs'
import { motion, AnimatePresence } from 'motion/react'
import { useMemo } from 'react'
import type { DrawSpec } from '../data/types'

const W = 360
const H = 240
const P = 28

/**
 * Sorty draws in ink beside the working, one piece at a time, only after the student has earned that piece.
 * Idea adapted from Riddled ("when words won't do, it draws").
 */
export function Sketch({ spec, done }: { spec: DrawSpec; done: number }) {
  if (spec.kind === 'supply-demand') return <SupplyDemand spec={spec} done={done} />
  return <Plot spec={spec} done={done} />
}

function Plot({ spec, done }: { spec: Extract<DrawSpec, { kind: 'plot' }>; done: number }) {
  const [x0, x1] = spec.x
  const [y0, y1] = spec.y
  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P)
  const sy = (y: number) => H - P - ((y - y0) / (y1 - y0)) * (H - 2 * P)
  const { path, shade } = useMemo(() => {
    const f = compile(spec.fn)
    const pts: string[] = []
    const N = 160
    for (let i = 0; i <= N; i++) {
      const x = x0 + ((x1 - x0) * i) / N
      const y = f.evaluate({ x }) as number
      if (y < y0 - 2 || y > y1 + 2) continue
      pts.push(`${pts.length ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    }
    let shade = ''
    if (spec.shade) {
      const [a, b] = spec.shade
      const s: string[] = [`M${sx(a)},${sy(0)}`]
      for (let i = 0; i <= 60; i++) {
        const x = a + ((b - a) * i) / 60
        s.push(`L${sx(x).toFixed(1)},${sy(f.evaluate({ x }) as number).toFixed(1)}`)
      }
      s.push(`L${sx(b)},${sy(0)}Z`)
      shade = s.join('')
    }
    return { path: pts.join(''), shade }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec])

  const showCurve = done > spec.curveAfter
  const showAxis = done > 0 || spec.curveAfter === 0
  const ax = x0 <= 0 && x1 >= 0 ? sx(0) : P
  const ay = y0 <= 0 && y1 >= 0 ? sy(0) : H - P

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sorty's sketch of the graph">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#8a93a3" />
        </marker>
      </defs>
      <line x1={P - 6} x2={W - P + 10} y1={ay} y2={ay} stroke="#8a93a3" strokeWidth="1" markerEnd="url(#arr)" />
      <line x1={ax} x2={ax} y1={H - P + 6} y2={P - 10} stroke="#8a93a3" strokeWidth="1" markerEnd="url(#arr)" />
      <text x={W - P + 4} y={ay - 6} fontSize="11" fill="#8a93a3" fontStyle="italic" fontFamily="IBM Plex Serif" textAnchor="end">
        {spec.xLabel ?? 'x'}
      </text>
      <text x={ax + 6} y={P - 4} fontSize="11" fill="#8a93a3" fontStyle="italic" fontFamily="IBM Plex Serif">
        {spec.yLabel ?? 'y'}
      </text>
      {!showAxis && (
        <text x={W - P - 6} y={P + 14} textAnchor="end" fontSize="17" fill="#8a93a3" fontFamily="IBM Plex Serif" fontStyle="italic">
          I'll draw as you go.
        </text>
      )}
      <AnimatePresence>
        {showCurve && shade && <motion.path key="shade" d={shade} fill="#4288FF" initial={{ opacity: 0 }} animate={{ opacity: done > spec.curveAfter + 1 ? 0.16 : 0 }} />}
        {showCurve && (
          <motion.path
            key="curve"
            d={path}
            fill="none"
            stroke="#2c6fe6"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
        )}
        {(spec.points ?? [])
          .filter((p) => done > p.step)
          .map((p) => (
            <motion.g key={p.label} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${sx(p.at[0])}px ${sy(p.at[1])}px` }}>
              <circle cx={sx(p.at[0])} cy={sy(p.at[1])} r="4" fill="#fff" stroke="#2c6fe6" strokeWidth="2" />
              <text x={sx(p.at[0]) + 7} y={sy(p.at[1]) - 7} fontSize="12" fill="#1f56bd" fontFamily="IBM Plex Serif" fontStyle="italic">
                {p.label}
              </text>
            </motion.g>
          ))}
      </AnimatePresence>
    </svg>
  )
}

function SupplyDemand({ spec, done }: { spec: Extract<DrawSpec, { kind: 'supply-demand' }>; done: number }) {
  // price axis 6..14, quantity 40..140
  const sx = (q: number) => P + ((q - 40) / 100) * (W - 2 * P)
  const sy = (p: number) => H - P - ((p - 6) / 8) * (H - 2 * P)
  // D: through (100,10) and (80,11.5) -> slope -0.075 ; S: through (100,10) and (80,9.5) -> slope 0.025
  const D = (q: number) => 10 - 0.075 * (q - 100)
  const S = (q: number) => 10 + 0.025 * (q - 100)
  const line = (f: (q: number) => number) => `M${sx(45)},${sy(f(45))} L${sx(135)},${sy(f(135))}`
  const { after, before } = spec
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sorty's supply and demand diagram with tax">
      <line x1={P} x2={W - P + 8} y1={H - P} y2={H - P} stroke="#8a93a3" />
      <line x1={P} x2={P} y1={H - P} y2={P - 8} stroke="#8a93a3" />
      <text x={W - P} y={H - P + 16} fontSize="11" fill="#8a93a3" textAnchor="end" fontStyle="italic" fontFamily="IBM Plex Serif">
        Q
      </text>
      <text x={P - 14} y={P} fontSize="11" fill="#8a93a3" fontStyle="italic" fontFamily="IBM Plex Serif">
        P
      </text>
      <path d={line(D)} stroke="#0f1b2d" strokeWidth="1.8" fill="none" />
      <path d={line(S)} stroke="#0f1b2d" strokeWidth="1.8" fill="none" />
      <text x={sx(135) + 2} y={sy(D(135))} fontSize="11" fill="#0f1b2d">D</text>
      <text x={sx(135) + 2} y={sy(S(135))} fontSize="11" fill="#0f1b2d">S</text>
      {done > 0 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.path d={line((q) => S(q) + spec.tax)} stroke="#2c6fe6" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
          <text x={sx(110)} y={sy(S(110) + spec.tax) - 6} fontSize="11" fill="#1f56bd" fontStyle="italic" fontFamily="IBM Plex Serif">
            S + tax
          </text>
          <line x1={P} x2={sx(after.q)} y1={sy(after.p)} y2={sy(after.p)} stroke="#2c6fe6" strokeDasharray="3 3" />
          <line x1={P} x2={sx(after.q)} y1={sy(after.pp)} y2={sy(after.pp)} stroke="#2c6fe6" strokeDasharray="3 3" />
          <line x1={sx(after.q)} x2={sx(after.q)} y1={sy(after.p)} y2={H - P} stroke="#2c6fe6" strokeDasharray="3 3" />
          <text x={P + 3} y={sy(after.p) - 4} fontSize="11" fill="#1f56bd">{after.p.toFixed(2)}</text>
          <text x={P + 3} y={sy(after.pp) + 13} fontSize="11" fill="#1f56bd">{after.pp.toFixed(2)}</text>
        </motion.g>
      )}
      {done > 1 && <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} x={P} y={sy(after.p)} width={sx(after.q) - P} height={sy(before.p) - sy(after.p)} fill="#e59a2f" />}
      {done > 2 && <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} x={P} y={sy(before.p)} width={sx(after.q) - P} height={sy(after.pp) - sy(before.p)} fill="#4288FF" />}
      <circle cx={sx(before.q)} cy={sy(before.p)} r="3.5" fill="#fff" stroke="#0f1b2d" strokeWidth="1.5" />
      <text x={P + 3} y={sy(before.p) - 4} fontSize="11" fill="#5b6577">{before.p}</text>
      {done > 3 && (
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={W - P - 4} y={P + 10} textAnchor="end" fontSize="12" fill="#1f56bd" fontStyle="italic" fontFamily="IBM Plex Serif">
          Amber: consumers. Blue: producers.
        </motion.text>
      )}
    </svg>
  )
}
