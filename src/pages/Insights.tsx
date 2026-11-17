import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/Layout'
import { Note, Ring, Tag } from '../components/ui'
import { BY_ID, SUBJECTS } from '../data/questions'
import { fmtDuration, readiness, weekTotals } from '../lib/analytics'
import { day, useStore } from '../lib/store'

export default function Insights() {
  const attempts = useStore((s) => s.attempts)
  const miscs = useStore((s) => s.misconceptions)
  const w = weekTotals(attempts)
  const prev = weekTotals(attempts.filter((a) => a.at < Date.now() - 7 * day), 14)

  const byDay = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const t0 = start.getTime() - (13 - i) * day
      const items = attempts.filter((a) => a.at >= t0 && a.at < t0 + day)
      return { t0, tut: items.reduce((s, a) => s + a.tut, 0), unaided: items.reduce((s, a) => s + a.unaided, 0) }
    })
  }, [attempts])

  const errors = useMemo(() => {
    const m = new Map<string, { tag: string; subject: string; count: number; last: number; fixed?: number; qid: string }>()
    miscs.forEach((x) => {
      const e = m.get(x.tag) ?? { tag: x.tag, subject: x.subject, count: 0, last: 0, qid: x.qid }
      e.count++
      e.last = Math.max(e.last, x.at)
      if (x.fixed) e.fixed = x.fixed
      else e.fixed = e.fixed && e.fixed > x.at ? e.fixed : undefined
      e.qid = x.qid
      m.set(x.tag, e)
    })
    return [...m.values()].sort((a, b) => Number(!!a.fixed) - Number(!!b.fixed) || b.last - a.last)
  }, [miscs])

  const ready = SUBJECTS.map((s) => readiness(attempts, s)).filter((r) => r.attempts > 0)
  const unaidedRate = w.steps ? Math.round((100 * w.unaided) / w.steps) : 0
  const prevRate = prev.steps ? Math.round((100 * prev.unaided) / prev.steps) : 0

  return (
    <AppShell title="Insights" sub="Everything you do on sortmyprep is saved here, so you and your teacher can see what is working. Unlike a chat window, nothing you figured out gets lost.">
      <Note from="Founder interview: everything is tracked under insights">We added the measures that show learning, not just activity.</Note>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Under tension this week', fmtDuration(w.tut), ''],
          ['Steps solved alone', `${w.unaided}`, `${unaidedRate}% of steps, was ${prevRate}%`],
          ['Hints used', String(w.hints), `${w.steps ? (w.hints / w.steps).toFixed(1) : 0} per step`],
          ['Fixed own errors', String(w.selfCorrections), 'without a hint'],
          ['Prove it passed', `${w.provePassed} of ${w.prove}`, 'new questions, no help'],
        ].map(([k, v, s]) => (
          <div key={k} className="rounded-[14px] border border-line bg-white p-4">
            <div className="text-[12.5px] text-muted">{k}</div>
            <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.02em]">{v}</div>
            {s && <div className="text-[12px] text-faint">{s}</div>}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[16px] border border-line bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">Time under tension, last 14 days</h2>
            <span className="text-[12.5px] text-faint">minutes per day</span>
          </div>
          <Bars data={byDay.map((d) => ({ x: d.t0, v: Math.round(d.tut / 60), sub: `${d.unaided} steps solved alone` }))} />
        </div>
        <div className="rounded-[16px] border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold">Readiness by subject</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {ready.map((r) => (
              <div key={r.subject} className="text-center">
                <Ring value={r.score} size={72} />
                <div className="mt-1 text-[12.5px] text-muted">{r.subject}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-snug text-faint">Coverage, unaided steps and recency. <Link to="/plan" className="text-blue-700">See the formula</Link></p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[16px] border border-line bg-white">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-5 pt-5">
            <h2 className="text-[15px] font-semibold">Your error log</h2>
            <span className="text-[12.5px] text-faint">retries are spaced 1, 3 and 7 days apart</span>
          </div>
          <Note className="px-5" from="5 Whys: students can't see how reliable feedback is">Each recurring error is named, dated and retried until you fix it unaided.</Note>
          <ul className="mt-3 divide-y divide-line">
            {errors.map((e) => {
              const daysAgo = Math.round((Date.now() - e.last) / day)
              const retryIn = Math.max(0, (e.count >= 2 ? 1 : 3) - daysAgo)
              const q = BY_ID[e.qid]
              const target = q?.twin ? `/solve/${q.twin}?prove=1` : `/solve/${e.qid}`
              return (
                <li key={e.tag} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-medium">{e.tag}</div>
                    <div className="text-[12.5px] text-faint">
                      {e.subject}, seen {e.count} time{e.count > 1 ? 's' : ''}, last {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                    </div>
                  </div>
                  {e.fixed ? <Tag tone="ok">Fixed unaided</Tag> : <Tag tone="warn">{retryIn === 0 ? 'Retry due' : `Retry in ${retryIn} day${retryIn > 1 ? 's' : ''}`}</Tag>}
                  {!e.fixed && (
                    <Link to={target} className="text-[13px] font-semibold text-blue-700">
                      Retry now
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="rounded-[16px] border border-line bg-white">
          <h2 className="px-5 pt-5 text-[15px] font-semibold">Recent questions</h2>
          <ul className="mt-2 divide-y divide-line">
            {[...attempts]
              .sort((a, b) => b.at - a.at)
              .slice(0, 8)
              .map((a, i) => {
                const q = BY_ID[a.qid]
                if (!q) return null
                return (
                  <li key={i} className="flex items-center gap-3 px-5 py-2.5 text-[13.5px]">
                    <span className={clsx('size-2 shrink-0 rounded-full', a.unaided === a.steps ? 'bg-ok' : a.revealed ? 'bg-err' : 'bg-blue')} aria-hidden />
                    <Link to={`/solve/${q.id}`} className="min-w-0 flex-1 truncate hover:text-blue-700">
                      {q.topic.replace(/^[^:]+:\s*/, '')}
                      {a.prove && <span className="ml-1.5 text-ok">Prove it</span>}
                    </Link>
                    <span className="tabular-nums text-muted">{a.marks}/{a.maxMarks}</span>
                    <span className="w-16 text-right tabular-nums text-faint">{fmtDuration(a.tut)}</span>
                  </li>
                )
              })}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}

function Bars({ data }: { data: { x: number; v: number; sub: string }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(10, ...data.map((d) => d.v))
  const nice = Math.ceil(max / 5) * 5
  const H = 170
  return (
    <div className="relative mt-4">
      <div className="flex h-[170px] items-end gap-[2px] border-b border-line pl-8">
        <div className="pointer-events-none absolute left-0 top-0 flex h-[170px] flex-col justify-between text-[11px] tabular-nums text-faint">
          <span>{nice}</span>
          <span>{nice / 2}</span>
          <span>0</span>
        </div>
        <div className="pointer-events-none absolute left-8 right-0 top-[85px] border-t border-dashed border-line" />
        {data.map((d, i) => (
          <div key={d.x} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${new Date(d.x).toDateString()}: ${d.v} minutes`}>
            <div className={clsx('w-full max-w-[22px] rounded-t-[4px] transition-colors', hover === i ? 'bg-blue-600' : 'bg-blue')} style={{ height: d.v ? Math.max(3, (d.v / nice) * H) : 0 }} />
            {hover === i && (
              <div className="absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-[8px] border border-line bg-white px-2.5 py-1.5 text-[12px] shadow-soft">
                <div className="font-semibold">{new Date(d.x).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div className="text-ink-2">{d.v} min under tension</div>
                <div className="text-muted">{d.sub}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px] pl-8 text-[10.5px] text-faint">
        {data.map((d, i) => (
          <span key={d.x} className="flex-1 text-center">
            {i % 2 === 1 ? new Date(d.x).toLocaleDateString(undefined, { day: 'numeric' }) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
